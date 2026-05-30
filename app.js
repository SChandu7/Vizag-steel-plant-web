// ============================================================
//  Vizag Steel Plant – Centralized Delay Analysis System
//  app.js  |  Production frontend — all data from API
//  API Base: https://api.chandus7.in
// ============================================================

const API = "https://api.chandus7.in/api";

// Current logged-in user (populated after login)
let currentUser = null;

// Report state
let reportVersion = 1;
let reportData    = null;   // last fetched report payload
let chartInstances = {};

// ─────────────────────────────────────────────────────────────
//  API HELPER
// ─────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("vsp_token");

  // Merge headers cleanly up front safely
  const customHeaders = options.headers || {};
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...customHeaders
  };

  const finalOptions = {
    ...options,
    headers: headers
  };

  const res = await fetch(API + path, finalOptions);
  
  const json = await res.json().catch(() => ({ status: "error", message: "Invalid server response." }));
  return { ok: res.ok, status: res.status, json };
}

// ─────────────────────────────────────────────────────────────
//  CLOCK
// ─────────────────────────────────────────────────────────────

function updateClock() {
  const now = new Date();
  const p   = n => String(n).padStart(2, "0");
  document.getElementById("topbar-clock").textContent =
    `${p(now.getDate())}-${p(now.getMonth()+1)}-${now.getFullYear()}  ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}
setInterval(updateClock, 1000);
updateClock();

// ─────────────────────────────────────────────────────────────
//  INIT — check session on page load
// ─────────────────────────────────────────────────────────────

(async function init() {
  const token = localStorage.getItem("vsp_token");
  
  // Guard clause: If no token exists locally, don't waste an API call
  if (!token) {
    showLogin();
    return;
  }

  const { ok, json } = await apiFetch("/auth/me/");
  if (ok && json.data) {
    currentUser = json.data;
    showApp();
  } else {
    // Token might be expired or invalid; clear it out
    localStorage.removeItem("vsp_token");
    showLogin();
  }
})();

// ─────────────────────────────────────────────────────────────
//  LOGIN / LOGOUT
// ─────────────────────────────────────────────────────────────

document.getElementById("btn-login").addEventListener("click", doLogin);
document.getElementById("login-pass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

async function doLogin() {
  const emp_no   = document.getElementById("login-emp").value.trim().toUpperCase();
  const password = document.getElementById("login-pass").value;
  const errEl    = document.getElementById("login-error");

  if (!emp_no || !password) {
    showAlert(errEl, "Employee No. and Password are required.", "danger");
    return;
  }

  setBtnLoading("btn-login", "btn-login-text", "btn-login-spin", true);

  const { ok, json } = await apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ emp_no, password }),
  });

  setBtnLoading("btn-login", "btn-login-text", "btn-login-spin", false);

  if (!ok) {
    showAlert(errEl, json.message || "Login failed.", "danger");
    return;
  }

  // Safely save the token string handed back by Django
  localStorage.setItem("vsp_token", json.token);
  errEl.style.display = "none";
  currentUser = json.data;
  showApp();
}

document.getElementById("btn-logout").addEventListener("click", async () => {
  await apiFetch("/auth/logout/", { method: "POST" });
  localStorage.removeItem("vsp_token");
  currentUser = null;
  showLogin();
  // Reset form state
  document.getElementById("login-emp").value  = "";
  document.getElementById("login-pass").value = "";
});

function showLogin() {
  document.getElementById("page-login").style.display = "";
  document.getElementById("page-app").style.display   = "none";
}

function showApp() {
  document.getElementById("page-login").style.display = "none";
  document.getElementById("page-app").style.display   = "";

  // Populate topbar
  document.getElementById("user-name-top").textContent  = currentUser.emp_name.split(" ").slice(0,2).join(" ");
  document.getElementById("user-role-top").textContent  = currentUser.role;
  document.getElementById("user-avatar-top").textContent =
    currentUser.emp_name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  document.getElementById("entry-dept-badge").textContent = currentUser.dept;

  // Show/hide admin nav
  const adminRoles = ["sys_admin", "dept_admin", "ppm_admin"];
  document.querySelector(".nav-admin").style.display =
    adminRoles.includes(currentUser.role) ? "flex" : "none";

  initApp();
  navigate("delay-entry");
}

// ─────────────────────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────────────────────

function navigate(page) {
  document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("section-" + page).classList.add("active");
  document.querySelector(`[data-page="${page}"]`)?.classList.add("active");

  if (page === "reports")   initReportsPage();
  if (page === "user-mgmt") loadUsers();
}

document.getElementById("sidebar-toggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("collapsed");
  document.getElementById("main-content").classList.toggle("expanded");
});

// ─────────────────────────────────────────────────────────────
//  INIT APP
// ─────────────────────────────────────────────────────────────

async function initApp() {
  setDefaultDates();
  await Promise.all([
    loadShops(),
    loadSidebarStats(),
    loadRecentDelays(),
  ]);
}

function setDefaultDates() {
  const now = new Date();
  const p   = n => String(n).padStart(2, "0");
  const local = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`;
  document.getElementById("f-from").value = local;
  document.getElementById("f-upto").value = local;

  // Report: last 30 days
  const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
  document.getElementById("r-from").value = `${d30.getFullYear()}-${p(d30.getMonth()+1)}-${p(d30.getDate())}`;
  document.getElementById("r-to").value   = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}`;
}

// ─────────────────────────────────────────────────────────────
//  MASTER DATA — shops / equipment / sub-equipment
// ─────────────────────────────────────────────────────────────

let shopsCache = [];

async function loadShops() {
  const { ok, json } = await apiFetch("/master/shops/");
  if (!ok) return;
  shopsCache = json.data;

  // Populate delay entry dropdown
  const fShop  = document.getElementById("f-shop");
  const rShop  = document.getElementById("r-shop");
  fShop.innerHTML = '<option value="">-- Select Shop --</option>';
  rShop.innerHTML = '<option value="ALL">All Shops</option>';
  shopsCache.forEach(s => {
    fShop.innerHTML += `<option value="${s.shop_code}">${s.shop_desc}</option>`;
    rShop.innerHTML += `<option value="${s.shop_code}">${s.shop_desc}</option>`;
  });
}

document.getElementById("f-shop").addEventListener("change", async function () {
  const shopCode = this.value;
  const fEqpt    = document.getElementById("f-eqpt");
  const fSub     = document.getElementById("f-subeqpt");

  fEqpt.innerHTML = '<option value="">-- Loading... --</option>';
  fEqpt.disabled  = true;
  fSub.innerHTML  = '<option value="">-- None --</option>';
  fSub.disabled   = true;

  if (!shopCode) {
    fEqpt.innerHTML = '<option value="">-- Select Shop First --</option>';
    return;
  }

  const { ok, json } = await apiFetch(`/master/equipment/?shop_code=${shopCode}`);
  fEqpt.innerHTML = '<option value="">-- Select Equipment --</option>';
  if (ok && json.data.length) {
    json.data.forEach(e => {
      fEqpt.innerHTML += `<option value="${e.id}">${e.eqpt_code}</option>`;
    });
    fEqpt.disabled = false;
  } else {
    fEqpt.innerHTML = '<option value="">-- No equipment found --</option>';
  }
});

document.getElementById("f-eqpt").addEventListener("change", async function () {
  const eqptId = this.value;
  const fSub   = document.getElementById("f-subeqpt");

  fSub.innerHTML = '<option value="">-- None --</option>';
  fSub.disabled  = true;
  if (!eqptId) return;

  const { ok, json } = await apiFetch(`/master/sub-equipment/?eqpt_id=${eqptId}`);
  if (ok && json.data.length) {
    json.data.forEach(s => {
      fSub.innerHTML += `<option value="${s.id}">${s.sub_eqpt_code}</option>`;
    });
    fSub.disabled = false;
  }
});

// ─────────────────────────────────────────────────────────────
//  DELAY ENTRY — duration calc + submit
// ─────────────────────────────────────────────────────────────

["f-from","f-upto"].forEach(id =>
  document.getElementById(id).addEventListener("change", calcDuration)
);

function calcDuration() {
  const from = new Date(document.getElementById("f-from").value);
  const upto = new Date(document.getElementById("f-upto").value);
  const durEl = document.getElementById("f-duration");
  if (from && upto && upto > from) {
    durEl.value = ((upto - from) / 3600000).toFixed(2) + " hrs";
  } else {
    durEl.value = "";
  }
}

document.getElementById("btn-submit-delay").addEventListener("click", submitDelay);
document.getElementById("btn-clear-delay").addEventListener("click", clearEntryForm);

async function submitDelay() {
  const shopCode  = document.getElementById("f-shop").value;
  const eqptId    = document.getElementById("f-eqpt").value;
  const subEqptId = document.getElementById("f-subeqpt").value;
  const agency    = document.getElementById("f-agency").value;
  const from      = document.getElementById("f-from").value;
  const upto      = document.getElementById("f-upto").value;
  const desc      = document.getElementById("f-desc").value.trim();
  const alertEl   = document.getElementById("form-alert");

  if (!shopCode || !eqptId || !agency || !from || !upto || !desc) {
    showAlert(alertEl, "Please fill all required fields marked with *", "danger");
    return;
  }
  if (new Date(upto) <= new Date(from)) {
    showAlert(alertEl, "Delay Upto must be after Delay From.", "danger");
    return;
  }

  alertEl.style.display = "none";
  setBtnLoading("btn-submit-delay", "btn-submit-text", "btn-submit-spin", true);

  const payload = {
    shop_code:   parseInt(shopCode),
    eqpt_id:     parseInt(eqptId),
    sub_eqpt_id: subEqptId ? parseInt(subEqptId) : null,
    agency,
    delay_from: from,
    delay_upto: upto,
    delay_desc: desc,
  };

  const { ok, json } = await apiFetch("/delays/", {
    method: "POST",
    body:   JSON.stringify(payload),
  });

  setBtnLoading("btn-submit-delay", "btn-submit-text", "btn-submit-spin", false);

  if (!ok) {
    showAlert(alertEl, json.message || "Submission failed. Please try again.", "danger");
    return;
  }

  showAlert(alertEl, "✓ Delay record submitted successfully!", "success");
  clearEntryForm();
  loadRecentDelays();
  loadSidebarStats();
}

function clearEntryForm() {
  ["f-shop","f-eqpt","f-agency"].forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("f-subeqpt").innerHTML = '<option value="">-- None --</option>';
  document.getElementById("f-subeqpt").disabled = true;
  document.getElementById("f-eqpt").innerHTML   = '<option value="">-- Select Shop First --</option>';
  document.getElementById("f-eqpt").disabled    = true;
  document.getElementById("f-desc").value        = "";
  document.getElementById("f-duration").value   = "";
  setDefaultDates();
}

// ─────────────────────────────────────────────────────────────
//  RECENT DELAYS TABLE
// ─────────────────────────────────────────────────────────────

async function loadRecentDelays() {
  const loadEl    = document.getElementById("recent-loading");
  const wrapEl    = document.getElementById("recent-wrapper");
  loadEl.textContent = "Loading...";
  loadEl.style.display = "block";
  wrapEl.style.display = "none";

  const { ok, json } = await apiFetch("/delays/?limit=10");

  if (!ok || !json.data) {
    loadEl.textContent = "Failed to load recent entries.";
    return;
  }

  loadEl.style.display = "none";
  wrapEl.style.display = "block";

  const tbody = document.getElementById("recent-tbody");
  if (!json.data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="9">No delay records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = json.data.map((d, i) => `
    <tr>
      <td style="color:var(--text-muted);font-family:var(--font-mono)">${i+1}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.delay_from.substring(0,10)}</td>
      <td>${shopShort(d.shop_desc)}</td>
      <td><strong>${d.eqpt_code}</strong></td>
      <td style="color:var(--text-muted)">${d.sub_eqpt_code || "—"}</td>
      <td><span class="agency-badge agency-${d.agency}">${agencyLabel(d.agency)}</span></td>
      <td style="font-family:var(--font-mono);color:var(--accent);font-weight:bold">${d.delay_duration}</td>
      <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)" title="${escHtml(d.delay_desc)}">${escHtml(d.delay_desc)}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${d.entered_by}</td>
    </tr>`).join("");
}

// ─────────────────────────────────────────────────────────────
//  SIDEBAR STATS
// ─────────────────────────────────────────────────────────────

async function loadSidebarStats() {
  const { ok, json } = await apiFetch("/delays/stats/");
  if (!ok) return;
  const s = json.data;
  document.getElementById("ss-today").textContent = s.today;
  document.getElementById("ss-month").textContent = s.month;
  document.getElementById("ss-total").textContent = s.total;
}

// ─────────────────────────────────────────────────────────────
//  REPORTS PAGE
// ─────────────────────────────────────────────────────────────

function initReportsPage() {
  fetchReport();
}

document.getElementById("btn-filter").addEventListener("click", fetchReport);

async function fetchReport() {
  const shop_code = document.getElementById("r-shop").value;
  const date_from = document.getElementById("r-from").value;
  const date_to   = document.getElementById("r-to").value;
  const agency    = document.getElementById("r-agency").value;

  const loadEl = document.getElementById("report-loading");
  loadEl.style.display = "block";
  document.getElementById("report-tbody").innerHTML = "";
  setBtnLoading("btn-filter", "btn-filter-text", "btn-filter-spin", true);

  const params = new URLSearchParams({ shop_code, date_from, date_to, agency });
  const { ok, json } = await apiFetch(`/delays/report/?${params}`);

  setBtnLoading("btn-filter", "btn-filter-text", "btn-filter-spin", false);
  loadEl.style.display = "none";

  if (!ok) {
    console.error("Report fetch failed:", json.message);
    return;
  }

  reportData = json.data;
  updateKPIs(reportData.kpi);

  if (reportVersion === 1) {
    renderReportTable(reportData.records);
  } else {
    setTimeout(() => renderCharts(reportData.charts), 60);
  }
}

function setReportVersion(v) {
  reportVersion = v;
  document.getElementById("report-v1").style.display = v === 1 ? "block" : "none";
  document.getElementById("report-v2").style.display = v === 2 ? "block" : "none";
  document.getElementById("ver1-btn").classList.toggle("active", v === 1);
  document.getElementById("ver2-btn").classList.toggle("active", v === 2);

  if (!reportData) { fetchReport(); return; }
  if (v === 1) { renderReportTable(reportData.records); }
  else         { setTimeout(() => renderCharts(reportData.charts), 60); }
}

function updateKPIs(kpi) {
  document.getElementById("kpi-total-hrs").textContent  = kpi.total_hrs;
  document.getElementById("kpi-records").textContent    = kpi.total_records;
  document.getElementById("kpi-shops").textContent      = kpi.shops_affected;
  document.getElementById("kpi-max-delay").textContent  = kpi.max_delay;
}

function renderReportTable(records) {
  document.getElementById("report-count").textContent = records.length + " records";
  const tbody = document.getElementById("report-tbody");
  if (!records.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="11">No records found for the selected filters.</td></tr>`;
    return;
  }
  tbody.innerHTML = records.map((d, i) => `
    <tr>
      <td style="color:var(--text-muted);font-family:var(--font-mono)">${i+1}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.delay_from.substring(0,10)}</td>
      <td>${shopShort(d.shop_desc)}</td>
      <td><strong>${d.eqpt_code}</strong></td>
      <td style="color:var(--text-muted)">${d.sub_eqpt_code || "—"}</td>
      <td><span class="agency-badge agency-${d.agency}">${agencyLabel(d.agency)}</span></td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.delay_from.substring(11,16)}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.delay_upto.substring(11,16)}</td>
      <td style="font-family:var(--font-mono);color:var(--accent);font-weight:bold">${d.delay_duration}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)" title="${escHtml(d.delay_desc)}">${escHtml(d.delay_desc)}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${d.entered_by}</td>
    </tr>`).join("");
}

// ─────────────────────────────────────────────────────────────
//  CHARTS
// ─────────────────────────────────────────────────────────────

const C_COLORS = [
  "#2c3e50","#c0392b","#2980b9","#27ae60","#8e44ad",
  "#e67e22","#16a085","#d35400","#2471a3","#1a5276","#6c3483","#117a65"
];

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = {};
}

function renderCharts(charts) {
  destroyCharts();
  Chart.defaults.font.family = "'Source Sans 3', sans-serif";
  Chart.defaults.color       = "#4a5568";

  // Bar: by shop
  const shopLabels = Object.keys(charts.by_shop);
  const shopVals   = Object.values(charts.by_shop);
  const ctx1 = document.getElementById("chart-shop-bar");
  if (ctx1) {
    chartInstances.bar = new Chart(ctx1, {
      type: "bar",
      data: {
        labels: shopLabels,
        datasets: [{
          label: "Delay Hours",
          data: shopVals,
          backgroundColor: C_COLORS.map(c => c + "CC"),
          borderColor: C_COLORS,
          borderWidth: 1.5,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color:"#4a5568", font:{size:10}, maxRotation:40 }, grid: { color:"#e8ecf0" } },
          y: { ticks: { color:"#4a5568" }, grid: { color:"#e8ecf0" }, beginAtZero: true,
               title: { display: true, text: "Hours", color:"#8a9ab0", font:{size:11} } }
        }
      }
    });
  }

  // Donut: by agency
  const agLabels = Object.keys(charts.by_agency).map(agencyLabel);
  const agVals   = Object.values(charts.by_agency);
  const ctx2 = document.getElementById("chart-agency-pie");
  if (ctx2) {
    chartInstances.pie = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: agLabels,
        datasets: [{
          data: agVals,
          backgroundColor: C_COLORS.slice(0, agLabels.length).map(c => c + "CC"),
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color:"#4a5568", font:{size:11}, padding:14, boxWidth:14 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} hrs` } }
        }
      }
    });
  }

  // Line: daily trend
  const dayLabels = Object.keys(charts.by_day);
  const dayVals   = Object.values(charts.by_day);
  const ctx3 = document.getElementById("chart-daily-line");
  if (ctx3) {
    chartInstances.line = new Chart(ctx3, {
      type: "line",
      data: {
        labels: dayLabels,
        datasets: [{
          label: "Total Delay Hours",
          data: dayVals,
          borderColor: "#c0392b",
          backgroundColor: "rgba(192,57,43,0.08)",
          fill: true, tension: 0.4,
          pointBackgroundColor: "#c0392b",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color:"#4a5568", font:{size:11} } } },
        scales: {
          x: { ticks:{ color:"#4a5568", font:{size:10}, maxRotation:45 }, grid:{ color:"#e8ecf0" } },
          y: { ticks:{ color:"#4a5568" }, grid:{ color:"#e8ecf0" }, beginAtZero: true }
        }
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
//  CSV EXPORT
// ─────────────────────────────────────────────────────────────

document.getElementById("btn-export").addEventListener("click", () => {
  if (!reportData || !reportData.records.length) {
    alert("Generate a report first before exporting.");
    return;
  }
  const headers = ["S.No","Date","Shop","Equipment","Sub-Eqpt","Agency","From","Upto","Duration(h)","Description","Entered By"];
  const rows = reportData.records.map((d, i) => [
    i+1,
    d.delay_from.substring(0,10),
    d.shop_desc,
    d.eqpt_code,
    d.sub_eqpt_code || "",
    agencyLabel(d.agency),
    d.delay_from.substring(11,16),
    d.delay_upto.substring(11,16),
    d.delay_duration,
    `"${d.delay_desc.replace(/"/g,'""')}"`,
    d.entered_by,
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const a    = document.createElement("a");
  a.href    = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = `VSP_Delays_${new Date().toISOString().substring(0,10)}.csv`;
  a.click();
});

// ─────────────────────────────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────────────────────────────

let editingUserId = null;

async function loadUsers() {
  const loadEl  = document.getElementById("user-loading");
  const wrapEl  = document.getElementById("user-wrapper");
  loadEl.textContent    = "Loading...";
  loadEl.style.display  = "block";
  wrapEl.style.display  = "none";

  const { ok, json } = await apiFetch("/users/");
  loadEl.style.display = "none";
  if (!ok) { loadEl.textContent = "Failed to load users."; loadEl.style.display = "block"; return; }

  document.getElementById("user-count").textContent = json.data.length + " users";
  wrapEl.style.display = "block";

  const tbody = document.getElementById("user-tbody");
  tbody.innerHTML = json.data.map(u => `
    <tr>
      <td style="font-family:var(--font-mono);color:var(--accent);font-weight:bold">${escHtml(u.emp_no)}</td>
      <td><strong>${escHtml(u.emp_name)}</strong></td>
      <td>${u.dept}</td>
      <td style="color:var(--text-secondary)">${escHtml(u.designation)}</td>
      <td><span class="agency-badge" style="background:#e8ecf0;color:var(--steel);border:1px solid var(--border-dark)">${u.role}</span></td>
      <td><span class="status-${u.is_active ? 'active':'inactive'}">${u.is_active ? '● ACTIVE':'○ INACTIVE'}</span></td>
      <td>
        <button class="btn-xs btn-edit" onclick="openEditUser(${u.id})">Edit</button>
        <button class="btn-xs ${u.is_active ? 'btn-deactivate':'btn-activate'}"
                onclick="toggleUserStatus(${u.id}, this)">
          ${u.is_active ? 'Deactivate':'Activate'}
        </button>
      </td>
    </tr>`).join("");
}

document.getElementById("btn-add-user").addEventListener("click", () => {
  editingUserId = null;
  document.getElementById("modal-user-title").textContent = "ADD NEW USER";
  ["mu-empno","mu-name","mu-desig","mu-pass"].forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("mu-empno").disabled = false;
  document.getElementById("mu-dept").value     = "";
  document.getElementById("mu-role").value     = "dept_user";
  document.getElementById("mu-status").value   = "true";
  document.getElementById("modal-alert").style.display = "none";
  document.getElementById("modal-user").style.display  = "flex";
});

async function openEditUser(userId) {
  const { ok, json } = await apiFetch("/users/");
  if (!ok) return;
  const u = json.data.find(x => x.id === userId);
  if (!u) return;

  editingUserId = userId;
  document.getElementById("modal-user-title").textContent = "EDIT USER";
  document.getElementById("mu-empno").value    = u.emp_no;
  document.getElementById("mu-empno").disabled = true;
  document.getElementById("mu-name").value     = u.emp_name;
  document.getElementById("mu-dept").value     = u.dept;
  document.getElementById("mu-desig").value    = u.designation;
  document.getElementById("mu-pass").value     = "";
  document.getElementById("mu-role").value     = u.role;
  document.getElementById("mu-status").value   = String(u.is_active);
  document.getElementById("modal-alert").style.display = "none";
  document.getElementById("modal-user").style.display  = "flex";
}

document.getElementById("btn-save-user").addEventListener("click", saveUser);

async function saveUser() {
  const alertEl = document.getElementById("modal-alert");
  const name    = document.getElementById("mu-name").value.trim();
  const dept    = document.getElementById("mu-dept").value;
  const desig   = document.getElementById("mu-desig").value.trim();
  const pass    = document.getElementById("mu-pass").value;
  const role    = document.getElementById("mu-role").value;
  const active  = document.getElementById("mu-status").value === "true";

  if (!name || !dept || !role) {
    showAlert(alertEl, "Name, Department and Role are required.", "danger");
    return;
  }

  setBtnLoading("btn-save-user", "btn-save-text", "btn-save-spin", true);
  alertEl.style.display = "none";

  let res;
  if (editingUserId) {
    const payload = { emp_name: name, dept, designation: desig, role, is_active: active };
    if (pass) payload.password = pass;
    res = await apiFetch(`/users/${editingUserId}/`, { method: "PUT", body: JSON.stringify(payload) });
  } else {
    const empno = document.getElementById("mu-empno").value.trim().toUpperCase();
    if (!empno || !pass) {
      showAlert(alertEl, "Employee No. and Password are required for new users.", "danger");
      setBtnLoading("btn-save-user", "btn-save-text", "btn-save-spin", false);
      return;
    }
    const payload = { emp_no: empno, emp_name: name, dept, designation: desig, password: pass, role, is_active: active };
    res = await apiFetch("/users/", { method: "POST", body: JSON.stringify(payload) });
  }

  setBtnLoading("btn-save-user", "btn-save-text", "btn-save-spin", false);

  if (!res.ok) {
    showAlert(alertEl, res.json.message || "Save failed.", "danger");
    return;
  }

  closeUserModal();
  loadUsers();
}

async function toggleUserStatus(userId, btn) {
  btn.disabled = true;
  const { ok, json } = await apiFetch(`/users/${userId}/toggle-status/`, { method: "POST" });
  if (ok) {
    loadUsers();
  } else {
    alert(json.message || "Failed to update status.");
    btn.disabled = false;
  }
}

function closeUserModal() {
  document.getElementById("modal-user").style.display = "none";
  editingUserId = null;
}
document.getElementById("modal-user").addEventListener("click", function(e) {
  if (e.target === this) closeUserModal();
});

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

function shopShort(desc) {
  return desc ? desc.split("(")[0].trim() : "—";
}

function agencyLabel(code) {
  return {
    O:"Operations", M:"Mechanical", E:"Electrical", SD:"Shutdown",
    ID:"Idle", MIS:"Misc", C:"Civil", S:"Safety", CR:"Cold Repair"
  }[code] || code || "—";
}

function escHtml(str) {
  return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Fixed function structure assignment syntax
function showAlert(el, msg, type = "danger") {
  el.className  = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = "block";
}

function setBtnLoading(btnId, textId, spinId, loading) {
  const btn  = document.getElementById(btnId);
  const text = document.getElementById(textId);
  const spin = document.getElementById(spinId);
  if (!btn) return;
  btn.disabled        = loading;
  if (text) text.style.display = loading ? "none" : "";
  if (spin) spin.style.display = loading ? "inline-block" : "none";
}
