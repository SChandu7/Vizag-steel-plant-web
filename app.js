// ============================================================
//  Vizag Steel Plant – Centralized Delay Analysis System
//  app.js  |  Prototype v1.0
// ============================================================

/* ===== USERS ===== */
let USERS = [
  { empno:'EMP001', password:'admin123', name:'G. Rajesh Kumar',    dept:'IT',   desig:'Sr. Manager IT',          role:'sys_admin',  active:true },
  { empno:'EMP002', password:'user123',  name:'K. Surya Prakash',   dept:'SMS',  desig:'Dy. General Manager',     role:'dept_admin', active:true },
  { empno:'EMP003', password:'user123',  name:'V. Lakshmi Devi',    dept:'LMMM', desig:'Sr. Engineer',            role:'dept_user',  active:true },
  { empno:'EMP004', password:'ppm123',   name:'M. Venkata Ramana',  dept:'PPM',  desig:'DGM Operations',          role:'ppm_admin',  active:true },
  { empno:'EMP005', password:'ppm123',   name:'S. Appa Rao',        dept:'PPM',  desig:'Manager Planning',        role:'ppm_user',   active:true },
  { empno:'EMP006', password:'user123',  name:'P. Ananda Rao',      dept:'WRM',  desig:'Sr. Engineer Mech',       role:'dept_user',  active:true },
  { empno:'EMP007', password:'user123',  name:'R. Satya Narayana',  dept:'BF',   desig:'Engineer Elect.',         role:'dept_user',  active:false },
];

/* ===== EQUIPMENT MASTER ===== */
const SHOP_MASTER = [
  { code:1,  desc:'SMS (Steel Melting Shop)',            eqpt:['CT-1','CT-2','SCR','WBRC'],               subeqpt:{'CT-1':['CC-8','CC-15','CC-19','CC-36','CC-40'],'CT-2':['CC-40','CC-43'],'WBRC':['CC-31','CC-37','CC-51','CC-55'],'SCR':['CC-39']} },
  { code:2,  desc:'RM (Raw Material Handling)',          eqpt:['OT-1','OT-2','OT-3','LOCP','BRC','WBRC'], subeqpt:{'LOCP':['VS-2','VS-3','VS-4','CO-36','CO-48'],'BRC':['CO-30','CO-32','CO-34'],'OT-1':['CO-5'],'OT-2':['CO-6']} },
  { code:3,  desc:'BF (Blast Furnace)',                  eqpt:['CPP','CSP','DE-5','BATTERY-1','BATTERY-2','BATTERY-3'], subeqpt:{'CPP':['Y-2','Y-5','Y-5A','Y-6','Y-11','Y-14'],'CSP':['ROUTE-A','TRACK-2'],'DE-5':[]} },
  { code:4,  desc:'SP (Sinter Plant)',                   eqpt:['M/C-1','M/C-2','RMB'],                    subeqpt:{'M/C-1':['BC-14','BC-15','B FEEDER','CA-1'],'M/C-2':['BC-14','BC-15','OK-14','DD SCRN','OA-4']} },
  { code:5,  desc:'LMMM (Light & Medium Merchant Mill)', eqpt:['F/C-1','F/C-2','PCM','BHS','SSY CR','PSY CR'], subeqpt:{'F/C-1':['TH-3','TH-4'],'F/C-2':['TH-6','TH-7'],'PCM':['M/C-1','M/C-2','M/C-3','M/C-4'],'BHS':['KA-2','KA-3 &4','KK-3']} },
  { code:6,  desc:'SMS-2 (Concast / CCM)',               eqpt:['CCM-1','CCM-2','CCM-3','CCM-4','CCM-5','CCM-6','CONV-A','CONV-B','CONV-C'], subeqpt:{'CONV-A':['TH','STC-2'],'CONV-B':['TH','LANCE'],'CCM-1':['S-1','S-2'],'CCM-2':['S-1','S-2','S-3','S-4']} },
  { code:7,  desc:'WRM (Wire Rod Mill)',                 eqpt:['BILLET MIL','BAR MILL'],                  subeqpt:{'BILLET MIL':['F/C-1','F/C-2','S-1','S-2','S-3','CHG GD-2'],'BAR MILL':['LINE-1','LINE-2']} },
  { code:8,  desc:'MMSM (Medium Merchant & Structural)', eqpt:['MILL'],                                   subeqpt:{'MILL':['LINE-1','LINE-2','LINE-3','LINE-4','FB','IM','RM']} },
  { code:9,  desc:'SBQ (Special Bar Quality)',           eqpt:['MILL'],                                   subeqpt:{'MILL':['S-3','S-5','S-8','S-12','S-13','S-14','S-19','LHS','RHS']} },
  { code:10, desc:'PP (Power Plant)',                    eqpt:['GETS','BOILER-1','BOILER-2'],             subeqpt:{'GETS':['TG-1','TG-2']} },
  { code:12, desc:'PAC (Pig Casting)',                   eqpt:['PAC-1'],                                  subeqpt:{'PAC-1':[]} },
  { code:15, desc:'CO (Coke Ovens)',                     eqpt:['FK-1','FK-2','FK-3','FK-4','FK-5','TBDB PLANT'], subeqpt:{} },
];

/* ===== DEMO DELAYS — dates current (May 2026) ===== */
let DELAYS = [
  // May 21
  {id:1,  date:'2026-05-21', shop_code:1,  shop_desc:'SMS (Steel Melting Shop)',            eqpt:'CT-1',      subeqpt:'CC-8',    agency:'SD',  from:'10:18', upto:'18:00', duration:7.70,  desc:'CC-8 STREAM U/SD',                           entered_by:'EMP003'},
  {id:2,  date:'2026-05-21', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'F/C-2',     subeqpt:'TH-6',    agency:'O',   from:'16:24', upto:'20:12', duration:3.80,  desc:'OFF BLAST – POOR OFF TAKE',                  entered_by:'EMP003'},
  {id:3,  date:'2026-05-21', shop_code:8,  shop_desc:'MMSM (Medium Merchant & Structural)', eqpt:'MILL',      subeqpt:'LINE-2',  agency:'S',   from:'10:00', upto:'10:27', duration:0.45,  desc:'S-20 RING BROKEN, WATER CLING NOZZLE JAMMED', entered_by:'EMP006'},
  {id:4,  date:'2026-05-21', shop_code:2,  shop_desc:'RM (Raw Material Handling)',          eqpt:'OT-3',      subeqpt:'CO-45',   agency:'O',   from:'14:00', upto:'15:00', duration:1.00,  desc:'DECK SHEET CLEANING',                        entered_by:'EMP002'},
  {id:5,  date:'2026-05-21', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-2',     subeqpt:'',        agency:'O',   from:'23:12', upto:'02:18', duration:3.10,  desc:'U/P (PLANNED CLOSURE)',                      entered_by:'EMP002'},
  {id:6,  date:'2026-05-21', shop_code:1,  shop_desc:'SMS (Steel Melting Shop)',            eqpt:'CT-2',      subeqpt:'',        agency:'ID',  from:'10:21', upto:'21:45', duration:11.40, desc:'IDLE',                                       entered_by:'EMP003'},
  {id:7,  date:'2026-05-21', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'DE-5',      subeqpt:'',        agency:'SD',  from:'09:00', upto:'18:27', duration:9.45,  desc:'U/SD FOR MAINTENANCE',                       entered_by:'EMP002'},
  {id:8,  date:'2026-05-21', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-3',     subeqpt:'',        agency:'ID',  from:'11:00', upto:'17:55', duration:6.92,  desc:'IDLE',                                       entered_by:'EMP002'},
  {id:9,  date:'2026-05-21', shop_code:10, shop_desc:'PP (Power Plant)',                    eqpt:'GETS',      subeqpt:'TG-2',    agency:'S',   from:'16:06', upto:'20:27', duration:4.35,  desc:'ON MOTOR MODE – BF-2 PROB.',                 entered_by:'EMP004'},
  {id:10, date:'2026-05-21', shop_code:15, shop_desc:'CO (Coke Ovens)',                     eqpt:'TBDB PLANT',subeqpt:'',        agency:'ID',  from:'00:00', upto:'16:00', duration:16.00, desc:'IDLE',                                       entered_by:'EMP004'},
  // May 20
  {id:11, date:'2026-05-20', shop_code:7,  shop_desc:'WRM (Wire Rod Mill)',                 eqpt:'BAR MILL',  subeqpt:'',        agency:'SD',  from:'06:00', upto:'06:00', duration:24.00, desc:'U/SD FOR WEEKLY MAINT & SEC CHG TO 16P',     entered_by:'EMP006'},
  {id:12, date:'2026-05-20', shop_code:7,  shop_desc:'WRM (Wire Rod Mill)',                 eqpt:'BILLET MIL',subeqpt:'',        agency:'SD',  from:'06:00', upto:'06:00', duration:24.00, desc:'U/SD FOR WEEKLY MAINTENANCE',                entered_by:'EMP006'},
  {id:13, date:'2026-05-20', shop_code:12, shop_desc:'PAC (Pig Casting)',                   eqpt:'PAC-1',     subeqpt:'',        agency:'E',   from:'06:00', upto:'06:00', duration:24.00, desc:'DISCHARGE RESISTANCE OF MOTOR FAILED',       entered_by:'EMP004'},
  {id:14, date:'2026-05-20', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'PCM',       subeqpt:'M/C-2',   agency:'ID',  from:'00:00', upto:'04:00', duration:4.00,  desc:'IDLE',                                       entered_by:'EMP003'},
  {id:15, date:'2026-05-20', shop_code:9,  shop_desc:'SBQ (Special Bar Quality)',           eqpt:'MILL',      subeqpt:'S-8',     agency:'O',   from:'01:00', upto:'01:27', duration:0.45,  desc:'MATERIAL SLIPPAGE AT S-8',                   entered_by:'EMP006'},
  {id:16, date:'2026-05-20', shop_code:1,  shop_desc:'SMS (Steel Melting Shop)',            eqpt:'CT-1',      subeqpt:'CC-15',   agency:'SD',  from:'06:00', upto:'13:30', duration:7.50,  desc:'CC-15, 19, 22 U/SD',                         entered_by:'EMP003'},
  {id:17, date:'2026-05-20', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-1',     subeqpt:'',        agency:'ID',  from:'17:30', upto:'01:18', duration:7.80,  desc:'IDLE',                                       entered_by:'EMP002'},
  {id:18, date:'2026-05-20', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CONV-A',    subeqpt:'TH',      agency:'O',   from:'06:12', upto:'07:18', duration:1.10,  desc:'TH CHG & GUNNETTING',                        entered_by:'EMP002'},
  // May 19
  {id:19, date:'2026-05-19', shop_code:2,  shop_desc:'RM (Raw Material Handling)',          eqpt:'OT-2',      subeqpt:'',        agency:'ID',  from:'13:00', upto:'19:21', duration:6.35,  desc:'IDLE',                                       entered_by:'EMP002'},
  {id:20, date:'2026-05-19', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-1',     subeqpt:'',        agency:'ID',  from:'08:00', upto:'13:15', duration:5.25,  desc:'IDLE',                                       entered_by:'EMP002'},
  {id:21, date:'2026-05-19', shop_code:8,  shop_desc:'MMSM (Medium Merchant & Structural)', eqpt:'MILL',      subeqpt:'LINE-3',  agency:'M',   from:'10:06', upto:'10:18', duration:0.20,  desc:'FB RING CHG',                                entered_by:'EMP006'},
  {id:22, date:'2026-05-19', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'F/C-1',     subeqpt:'',        agency:'O',   from:'04:21', upto:'06:00', duration:1.65,  desc:'PR 2.61/4500 – HEAVY COKE RUSH',             entered_by:'EMP003'},
  {id:23, date:'2026-05-19', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CONV-C',    subeqpt:'',        agency:'SD',  from:'06:00', upto:'06:00', duration:24.00, desc:'U/SD FOR RELINING AFTER 2864 HEATS',         entered_by:'EMP002'},
  {id:24, date:'2026-05-19', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'DE-5',      subeqpt:'',        agency:'E',   from:'17:30', upto:'18:30', duration:1.00,  desc:'LT BRAKES TRIPPING FREQUENTLY',              entered_by:'EMP002'},
  {id:25, date:'2026-05-19', shop_code:2,  shop_desc:'RM (Raw Material Handling)',          eqpt:'BRC',       subeqpt:'CO-30',   agency:'SD',  from:'09:00', upto:'17:27', duration:8.45,  desc:'U/SD',                                       entered_by:'EMP002'},
  // May 18
  {id:26, date:'2026-05-18', shop_code:15, shop_desc:'CO (Coke Ovens)',                     eqpt:'FK-3',      subeqpt:'',        agency:'ID',  from:'06:00', upto:'06:00', duration:24.00, desc:'IDLE',                                       entered_by:'EMP004'},
  {id:27, date:'2026-05-18', shop_code:15, shop_desc:'CO (Coke Ovens)',                     eqpt:'FK-4',      subeqpt:'',        agency:'ID',  from:'06:00', upto:'06:00', duration:24.00, desc:'IDLE',                                       entered_by:'EMP004'},
  {id:28, date:'2026-05-18', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'PCM',       subeqpt:'M/C-3',   agency:'M',   from:'00:00', upto:'08:00', duration:8.00,  desc:'RUNNER MAKING',                              entered_by:'EMP003'},
  {id:29, date:'2026-05-18', shop_code:7,  shop_desc:'WRM (Wire Rod Mill)',                 eqpt:'BAR MILL',  subeqpt:'LINE-2',  agency:'SD',  from:'06:00', upto:'10:00', duration:4.00,  desc:'SEC CHG TO 28P',                             entered_by:'EMP006'},
  {id:30, date:'2026-05-18', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'CPP',       subeqpt:'Y-2',     agency:'SD',  from:'09:00', upto:'14:00', duration:5.00,  desc:'U/SD',                                       entered_by:'EMP002'},
  {id:31, date:'2026-05-18', shop_code:4,  shop_desc:'SP (Sinter Plant)',                   eqpt:'M/C-2',     subeqpt:'BC-15',   agency:'M',   from:'10:20', upto:'10:35', duration:0.25,  desc:'BRAKES PROB',                                entered_by:'EMP002'},
  {id:32, date:'2026-05-18', shop_code:10, shop_desc:'PP (Power Plant)',                    eqpt:'GETS',      subeqpt:'TG-2',    agency:'SD',  from:'10:21', upto:'16:27', duration:6.10,  desc:'HAND TRIPPED FOR BEARING-3 RTD CHG',         entered_by:'EMP004'},
  // May 17
  {id:33, date:'2026-05-17', shop_code:2,  shop_desc:'RM (Raw Material Handling)',          eqpt:'BRC',       subeqpt:'CO-34',   agency:'SD',  from:'09:18', upto:'19:18', duration:10.00, desc:'U/SD',                                       entered_by:'EMP002'},
  {id:34, date:'2026-05-17', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-5',     subeqpt:'',        agency:'SD',  from:'06:00', upto:'06:00', duration:24.00, desc:'U/SD – S-2,4 TKS CHANGING + RADIAL PORTION JOBS', entered_by:'EMP002'},
  {id:35, date:'2026-05-17', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-1',     subeqpt:'',        agency:'ID',  from:'08:00', upto:'01:00', duration:17.00, desc:'IDLE',                                       entered_by:'EMP002'},
  {id:36, date:'2026-05-17', shop_code:12, shop_desc:'PAC (Pig Casting)',                   eqpt:'PAC-1',     subeqpt:'',        agency:'E',   from:'06:00', upto:'06:00', duration:24.00, desc:'DISCHARGE RESISTANCE OF MOTOR FAILED',       entered_by:'EMP004'},
  {id:37, date:'2026-05-17', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'CSP',       subeqpt:'TRACK-2', agency:'E',   from:'06:00', upto:'06:00', duration:24.00, desc:'14 ROLL SCREEN MOTOR BURNT',                 entered_by:'EMP002'},
  {id:38, date:'2026-05-17', shop_code:8,  shop_desc:'MMSM (Medium Merchant & Structural)', eqpt:'MILL',      subeqpt:'',        agency:'SD',  from:'11:00', upto:'14:09', duration:3.15,  desc:'SECTION CHANGE TO 8R',                       entered_by:'EMP006'},
  // May 16
  {id:39, date:'2026-05-16', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'PCM',       subeqpt:'M/C-4',   agency:'ID',  from:'06:00', upto:'06:00', duration:24.00, desc:'IDLE',                                       entered_by:'EMP003'},
  {id:40, date:'2026-05-16', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-5',     subeqpt:'',        agency:'ID',  from:'08:18', upto:'20:18', duration:12.00, desc:'IDLE',                                       entered_by:'EMP002'},
  {id:41, date:'2026-05-16', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-2',     subeqpt:'',        agency:'ID',  from:'17:00', upto:'21:33', duration:4.55,  desc:'IDLE',                                       entered_by:'EMP002'},
  {id:42, date:'2026-05-16', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'BATTERY-3', subeqpt:'',        agency:'E',   from:'06:00', upto:'18:00', duration:12.00, desc:'DD-1, GATE-2 MOTOR PROB',                    entered_by:'EMP002'},
  {id:43, date:'2026-05-16', shop_code:10, shop_desc:'PP (Power Plant)',                    eqpt:'GETS',      subeqpt:'TG-2',    agency:'S',   from:'23:33', upto:'02:09', duration:2.60,  desc:'TRIPPED – FRONT BEARING HIGH TEMP',          entered_by:'EMP004'},
  {id:44, date:'2026-05-16', shop_code:1,  shop_desc:'SMS (Steel Melting Shop)',            eqpt:'SCR',       subeqpt:'CC-39',   agency:'SD',  from:'10:09', upto:'18:00', duration:7.85,  desc:'U/SD',                                       entered_by:'EMP003'},
  // May 15
  {id:45, date:'2026-05-15', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-6',     subeqpt:'',        agency:'ID',  from:'08:00', upto:'05:33', duration:21.55, desc:'IDLE',                                       entered_by:'EMP002'},
  {id:46, date:'2026-05-15', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CONV-A',    subeqpt:'',        agency:'SD',  from:'11:00', upto:'16:27', duration:5.45,  desc:'MID CAMPAIGN REPAIR',                        entered_by:'EMP002'},
  {id:47, date:'2026-05-15', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'BATTERY-3', subeqpt:'',        agency:'M',   from:'12:18', upto:'21:18', duration:9.00,  desc:'GATE-1 REDUCER JAM',                         entered_by:'EMP002'},
  {id:48, date:'2026-05-15', shop_code:12, shop_desc:'PAC (Pig Casting)',                   eqpt:'PAC-1',     subeqpt:'',        agency:'E',   from:'06:00', upto:'06:00', duration:24.00, desc:'DISCHARGE RESISTANCE OF MOTOR FAILED',       entered_by:'EMP004'},
  {id:49, date:'2026-05-15', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'BHS',       subeqpt:'KA-3 &4', agency:'M',   from:'06:00', upto:'21:09', duration:15.15, desc:'CHUTE CHG OVER G/BOX CASING CRACKED',        entered_by:'EMP003'},
  {id:50, date:'2026-05-15', shop_code:4,  shop_desc:'SP (Sinter Plant)',                   eqpt:'M/C-1',     subeqpt:'',        agency:'SD',  from:'08:45', upto:'17:30', duration:8.75,  desc:'U/SD',                                       entered_by:'EMP002'},
  // May 14
  {id:51, date:'2026-05-14', shop_code:8,  shop_desc:'MMSM (Medium Merchant & Structural)', eqpt:'MILL',      subeqpt:'',        agency:'SD',  from:'09:18', upto:'19:00', duration:9.70,  desc:'U/SD FOR WEEKLY MAINT & SECTION CHG TO 10R', entered_by:'EMP006'},
  {id:52, date:'2026-05-14', shop_code:3,  shop_desc:'BF (Blast Furnace)',                  eqpt:'CPP',       subeqpt:'',        agency:'SD',  from:'06:00', upto:'06:00', duration:24.00, desc:'ANNUAL OVERHAUL',                            entered_by:'EMP002'},
  {id:53, date:'2026-05-14', shop_code:5,  shop_desc:'LMMM (Light & Medium Merchant Mill)', eqpt:'PCM',       subeqpt:'M/C-2',   agency:'SD',  from:'06:00', upto:'06:00', duration:24.00, desc:'U/SD',                                       entered_by:'EMP003'},
  {id:54, date:'2026-05-14', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-3',     subeqpt:'',        agency:'O',   from:'18:27', upto:'20:09', duration:1.70,  desc:'U/P (S-1 HEAVY RUNNING)',                    entered_by:'EMP002'},
  {id:55, date:'2026-05-14', shop_code:2,  shop_desc:'RM (Raw Material Handling)',          eqpt:'BRC',       subeqpt:'CO-31',   agency:'SD',  from:'08:18', upto:'18:00', duration:9.70,  desc:'U/SD',                                       entered_by:'EMP002'},
  {id:56, date:'2026-05-14', shop_code:15, shop_desc:'CO (Coke Ovens)',                     eqpt:'FK-4',      subeqpt:'',        agency:'ID',  from:'06:00', upto:'06:00', duration:24.00, desc:'IDLE',                                       entered_by:'EMP004'},
  // May 13
  {id:57, date:'2026-05-13', shop_code:6,  shop_desc:'SMS-2 (Concast / CCM)',               eqpt:'CCM-1',     subeqpt:'',        agency:'SD',  from:'10:18', upto:'18:00', duration:7.70,  desc:'U/SD FOR CHANGE TO LMMM MODE',               entered_by:'EMP002'},
  {id:58, date:'2026-05-13', shop_code:9,  shop_desc:'SBQ (Special Bar Quality)',           eqpt:'MILL',      subeqpt:'',        agency:'SD',  from:'06:00', upto:'12:00', duration:6.00,  desc:'U/SD FOR WEEKLY MAINT & SEC CHG TO BLT90',   entered_by:'EMP006'},
  {id:59, date:'2026-05-13', shop_code:2,  shop_desc:'RM (Raw Material Handling)',          eqpt:'LOCP',      subeqpt:'VS-3',    agency:'SD',  from:'09:00', upto:'17:27', duration:8.45,  desc:'U/SD',                                       entered_by:'EMP002'},
  {id:60, date:'2026-05-13', shop_code:10, shop_desc:'PP (Power Plant)',                    eqpt:'BOILER-1',  subeqpt:'',        agency:'SD',  from:'06:00', upto:'15:50', duration:9.83,  desc:'U/SD FOR AIR HEATER BASKET REPLACEMENT',     entered_by:'EMP004'},
];

/* ===== STATE ===== */
let currentUser = null;
let reportVersion = 1;
let chartInstances = {};
let nextDelayId = DELAYS.length + 1;

/* ===== CLOCK ===== */
function updateClock() {
  const now = new Date();
  const p = n => String(n).padStart(2,'0');
  document.getElementById('topbar-clock').textContent =
    `${p(now.getDate())}-${p(now.getMonth()+1)}-${now.getFullYear()}  ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ===== LOGIN ===== */
document.getElementById('btn-login').addEventListener('click', doLogin);
document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const empno = document.getElementById('login-emp').value.trim().toUpperCase();
  const pass  = document.getElementById('login-pass').value;
  const user  = USERS.find(u => u.empno === empno && u.password === pass && u.active);
  const errEl = document.getElementById('login-error');
  if (!user) { errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  currentUser = user;

  document.getElementById('user-name-top').textContent  = user.name.split(' ').slice(0,2).join(' ');
  document.getElementById('user-role-top').textContent  = user.role;
  document.getElementById('user-avatar-top').textContent = user.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  document.getElementById('entry-dept-badge').textContent = user.dept;

  const adminNav = document.querySelector('.nav-admin');
  adminNav.style.display = ['sys_admin','dept_admin','ppm_admin'].includes(user.role) ? 'flex' : 'none';

  document.getElementById('page-login').style.display  = 'none';
  document.getElementById('page-app').style.display = 'block';
  initApp();
  navigate('delay-entry');
}

document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('page-login').style.display = '';
  document.getElementById('page-app').style.display   = 'none';
  document.getElementById('login-emp').value  = '';
  document.getElementById('login-pass').value = '';
});

/* ===== NAVIGATION ===== */
function navigate(page) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  if (page === 'reports')   { renderReport(); }
  if (page === 'user-mgmt') { renderUsers(); }
}

/* ===== SIDEBAR TOGGLE ===== */
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main-content').classList.toggle('expanded');
});

/* ===== INIT APP ===== */
function initApp() {
  populateShopDropdowns();
  populateReportFilters();
  updateSidebarStats();
  renderRecentTable();
  setDefaultDates();
}

function setDefaultDates() {
  const now = new Date();
  const p   = n => String(n).padStart(2,'0');
  const local = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`;
  document.getElementById('f-from').value = local;
  document.getElementById('f-upto').value = local;

  // Report range: last 14 days
  const d14 = new Date(now); d14.setDate(d14.getDate() - 14);
  document.getElementById('r-from').value = `${d14.getFullYear()}-${p(d14.getMonth()+1)}-${p(d14.getDate())}`;
  document.getElementById('r-to').value   = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}`;
}

/* ===== SHOP DROPDOWNS ===== */
function populateShopDropdowns() {
  const fShop = document.getElementById('f-shop');
  fShop.innerHTML = '<option value="">-- Select Shop --</option>';
  SHOP_MASTER.forEach(s => { fShop.innerHTML += `<option value="${s.code}">${s.desc}</option>`; });
}
function populateReportFilters() {
  const rShop = document.getElementById('r-shop');
  rShop.innerHTML = '<option value="ALL">All Shops</option>';
  SHOP_MASTER.forEach(s => { rShop.innerHTML += `<option value="${s.code}">${s.desc}</option>`; });
}

/* ===== CASCADING EQUIPMENT ===== */
document.getElementById('f-shop').addEventListener('change', function() {
  const shop = SHOP_MASTER.find(s => s.code === parseInt(this.value));
  const fEqpt = document.getElementById('f-eqpt');
  const fSub  = document.getElementById('f-subeqpt');
  fEqpt.innerHTML = '<option value="">-- Select Equipment --</option>';
  fSub.innerHTML  = '<option value="">-- None --</option>';
  if (shop) shop.eqpt.forEach(e => { fEqpt.innerHTML += `<option>${e}</option>`; });
});
document.getElementById('f-eqpt').addEventListener('change', function() {
  const shop = SHOP_MASTER.find(s => s.code === parseInt(document.getElementById('f-shop').value));
  const fSub = document.getElementById('f-subeqpt');
  fSub.innerHTML = '<option value="">-- None --</option>';
  if (shop && shop.subeqpt[this.value]) {
    shop.subeqpt[this.value].forEach(se => { fSub.innerHTML += `<option>${se}</option>`; });
  }
});

/* ===== DURATION CALC ===== */
['f-from','f-upto'].forEach(id => document.getElementById(id).addEventListener('change', calcDuration));
function calcDuration() {
  const from = new Date(document.getElementById('f-from').value);
  const upto = new Date(document.getElementById('f-upto').value);
  if (from && upto && upto > from) {
    document.getElementById('f-duration').value = ((upto - from) / 3600000).toFixed(2) + ' hrs';
  } else {
    document.getElementById('f-duration').value = '';
  }
}

/* ===== SUBMIT DELAY ===== */
document.getElementById('btn-submit-delay').addEventListener('click', submitDelay);
document.getElementById('btn-clear-delay').addEventListener('click', clearForm);

function submitDelay() {
  const shopCode = parseInt(document.getElementById('f-shop').value);
  const shop     = SHOP_MASTER.find(s => s.code === shopCode);
  const eqpt     = document.getElementById('f-eqpt').value;
  const subeqpt  = document.getElementById('f-subeqpt').value;
  const agency   = document.getElementById('f-agency').value;
  const from     = document.getElementById('f-from').value;
  const upto     = document.getElementById('f-upto').value;
  const desc     = document.getElementById('f-desc').value.trim();

  if (!shop || !eqpt || !agency || !from || !upto || !desc) {
    alert('Please fill all required fields marked with *');
    return;
  }
  const duration = parseFloat(((new Date(upto) - new Date(from)) / 3600000).toFixed(2));
  DELAYS.unshift({
    id: nextDelayId++,
    date: from.substring(0,10),
    shop_code: shopCode, shop_desc: shop.desc,
    eqpt, subeqpt, agency, duration, desc,
    from: from.substring(11,16),
    upto: upto.substring(11,16),
    entered_by: currentUser.empno
  });
  updateSidebarStats();
  renderRecentTable();
  const sEl = document.getElementById('form-success');
  sEl.style.display = 'block';
  setTimeout(() => { sEl.style.display = 'none'; }, 3500);
  clearForm();
}

function clearForm() {
  ['f-shop','f-eqpt','f-subeqpt','f-agency'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('f-desc').value     = '';
  document.getElementById('f-duration').value = '';
  setDefaultDates();
}

/* ===== SIDEBAR STATS ===== */
function updateSidebarStats() {
  const today = new Date().toISOString().substring(0,10);
  document.getElementById('ss-today').textContent = DELAYS.filter(d => d.date === today).length;
  document.getElementById('ss-month').textContent = DELAYS.length;
  document.getElementById('ss-total').textContent = DELAYS.length;
}

/* ===== RECENT TABLE ===== */
function renderRecentTable() {
  const recent = DELAYS.slice(0, 10);
  document.getElementById('recent-count').textContent = recent.length + ' records';
  document.getElementById('recent-tbody').innerHTML = recent.map((d,i) => `
    <tr>
      <td style="color:var(--text-muted);font-family:var(--font-mono)">${i+1}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.date}</td>
      <td>${shopShort(d.shop_desc)}</td>
      <td><strong>${d.eqpt}</strong></td>
      <td style="color:var(--text-muted)">${d.subeqpt||'—'}</td>
      <td><span class="agency-badge agency-${d.agency}">${agencyLabel(d.agency)}</span></td>
      <td style="font-family:var(--font-mono);color:var(--accent);font-weight:bold">${d.duration}</td>
      <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)">${d.desc}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${d.entered_by}</td>
    </tr>`).join('');
}

/* ===== REPORT VERSION TOGGLE ===== */
document.getElementById('btn-filter').addEventListener('click', renderReport);
document.getElementById('btn-export').addEventListener('click', exportCSV);

function setReportVersion(v) {
  reportVersion = v;
  document.getElementById('report-v1').style.display = v === 1 ? 'block' : 'none';
  document.getElementById('report-v2').style.display = v === 2 ? 'block' : 'none';
  document.getElementById('ver1-btn').classList.toggle('active', v === 1);
  document.getElementById('ver2-btn').classList.toggle('active', v === 2);
  const data = getFilteredDelays();
  updateKPIs(data);
  if (v === 2) {
    // defer to allow DOM layout
    setTimeout(() => renderCharts(data), 50);
  } else {
    renderReportTable(data);
  }
}

/* ===== FILTER ===== */
function getFilteredDelays() {
  const shopFilter   = document.getElementById('r-shop').value;
  const fromFilter   = document.getElementById('r-from').value;
  const toFilter     = document.getElementById('r-to').value;
  const agencyFilter = document.getElementById('r-agency').value;
  return DELAYS.filter(d => {
    if (shopFilter !== 'ALL' && d.shop_code !== parseInt(shopFilter)) return false;
    if (fromFilter && d.date < fromFilter) return false;
    if (toFilter   && d.date > toFilter)   return false;
    if (agencyFilter !== 'ALL' && d.agency !== agencyFilter) return false;
    return true;
  });
}

function renderReport() {
  const data = getFilteredDelays();
  updateKPIs(data);
  if (reportVersion === 1) {
    renderReportTable(data);
  } else {
    setTimeout(() => renderCharts(data), 50);
  }
}

function updateKPIs(data) {
  document.getElementById('kpi-total-hrs').textContent = data.reduce((s,d)=>s+(d.duration||0),0).toFixed(1);
  document.getElementById('kpi-records').textContent   = data.length;
  document.getElementById('kpi-shops').textContent     = new Set(data.map(d=>d.shop_code)).size;
  document.getElementById('kpi-max-delay').textContent = data.length ? Math.max(...data.map(d=>d.duration||0)).toFixed(1) : 0;
}

function renderReportTable(data) {
  document.getElementById('report-count').textContent = data.length + ' records';
  document.getElementById('report-tbody').innerHTML = data.map((d,i) => `
    <tr>
      <td style="color:var(--text-muted);font-family:var(--font-mono)">${i+1}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.date}</td>
      <td>${shopShort(d.shop_desc)}</td>
      <td><strong>${d.eqpt}</strong></td>
      <td style="color:var(--text-muted)">${d.subeqpt||'—'}</td>
      <td><span class="agency-badge agency-${d.agency}">${agencyLabel(d.agency)}</span></td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.from||'—'}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${d.upto||'—'}</td>
      <td style="font-family:var(--font-mono);color:var(--accent);font-weight:bold">${d.duration}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)">${d.desc}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${d.entered_by}</td>
    </tr>`).join('');
}

/* ===== CHARTS ===== */
const CHART_COLORS = ['#2c3e50','#c0392b','#2980b9','#27ae60','#8e44ad','#e67e22','#16a085','#d35400','#2471a3','#1a5276'];
const CHART_PALETTE_LIGHT = ['rgba(44,62,80,0.8)','rgba(192,57,43,0.8)','rgba(41,128,185,0.8)','rgba(39,174,96,0.8)','rgba(142,68,173,0.8)','rgba(230,126,34,0.8)','rgba(22,160,133,0.8)','rgba(211,84,0,0.8)'];

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = {};
}

function renderCharts(data) {
  destroyCharts();

  Chart.defaults.font.family = "'Source Sans 3', sans-serif";
  Chart.defaults.color       = '#4a5568';

  // ---- Chart 1: Delay hours by shop (Bar) ----
  const shopMap = {};
  data.forEach(d => {
    const lbl = shopShort(d.shop_desc);
    shopMap[lbl] = +(((shopMap[lbl]||0) + (d.duration||0)).toFixed(2));
  });
  const shopLabels = Object.keys(shopMap);
  const shopVals   = Object.values(shopMap);

  const ctx1 = document.getElementById('chart-shop-bar');
  if (ctx1 && shopLabels.length > 0) {
    chartInstances.bar = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: shopLabels,
        datasets: [{
          label: 'Delay Hours',
          data: shopVals,
          backgroundColor: CHART_PALETTE_LIGHT,
          borderColor: CHART_COLORS,
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} hrs` } }
        },
        scales: {
          x: { ticks: { color:'#4a5568', font:{size:11}, maxRotation:40 }, grid: { color:'#e8ecf0' } },
          y: { ticks: { color:'#4a5568', font:{size:11} },                 grid: { color:'#e8ecf0' }, beginAtZero: true,
               title: { display: true, text: 'Hours', color:'#8a9ab0', font:{size:11} } }
        }
      }
    });
  }

  // ---- Chart 2: Agency donut ----
  const agencyMap = {};
  data.forEach(d => {
    const lbl = agencyLabel(d.agency);
    agencyMap[lbl] = +(((agencyMap[lbl]||0) + (d.duration||0)).toFixed(2));
  });
  const aLabels = Object.keys(agencyMap);
  const aVals   = Object.values(agencyMap);

  const ctx2 = document.getElementById('chart-agency-pie');
  if (ctx2 && aLabels.length > 0) {
    chartInstances.pie = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: aLabels,
        datasets: [{ data: aVals, backgroundColor: CHART_PALETTE_LIGHT, borderColor:'#fff', borderWidth: 2, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position:'bottom', labels: { color:'#4a5568', font:{size:11}, padding:14, boxWidth:14 } },
                   tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} hrs` } } }
      }
    });
  }

  // ---- Chart 3: Daily trend (Line) ----
  const dailyMap = {};
  data.forEach(d => { dailyMap[d.date] = +(((dailyMap[d.date]||0) + (d.duration||0)).toFixed(2)); });
  const dailyLabels = Object.keys(dailyMap).sort();
  const dailyVals   = dailyLabels.map(k => dailyMap[k]);

  const ctx3 = document.getElementById('chart-daily-line');
  if (ctx3 && dailyLabels.length > 0) {
    chartInstances.line = new Chart(ctx3, {
      type: 'line',
      data: {
        labels: dailyLabels,
        datasets: [{
          label: 'Total Delay Hours',
          data: dailyVals,
          borderColor: '#c0392b',
          backgroundColor: 'rgba(192,57,43,0.08)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#c0392b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color:'#4a5568', font:{size:11} } },
                   tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} hrs` } } },
        scales: {
          x: { ticks:{ color:'#4a5568', font:{size:10}, maxRotation:45 }, grid:{ color:'#e8ecf0' } },
          y: { ticks:{ color:'#4a5568', font:{size:11} }, grid:{ color:'#e8ecf0' }, beginAtZero:true }
        }
      }
    });
  }
}

/* ===== EXPORT CSV ===== */
function exportCSV() {
  const data = getFilteredDelays();
  const headers = ['S.No','Date','Shop','Equipment','Sub-Eqpt','Agency','From','Upto','Duration(h)','Description','Entered By'];
  const rows = data.map((d,i) => [i+1, d.date, d.shop_desc, d.eqpt, d.subeqpt||'', agencyLabel(d.agency), d.from||'', d.upto||'', d.duration, `"${d.desc}"`, d.entered_by]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `VSP_Delays_${new Date().toISOString().substring(0,10)}.csv`;
  a.click();
}

/* ===== USER MANAGEMENT ===== */
function renderUsers() {
  document.getElementById('user-count').textContent = USERS.length + ' users';
  document.getElementById('user-tbody').innerHTML = USERS.map((u,i) => `
    <tr>
      <td style="font-family:var(--font-mono);color:var(--accent);font-weight:bold">${u.empno}</td>
      <td><strong>${u.name}</strong></td>
      <td>${u.dept}</td>
      <td style="color:var(--text-secondary)">${u.desig}</td>
      <td><span class="agency-badge agency-SD" style="background:#e8ecf0;color:var(--steel);border-color:var(--border-dark)">${u.role}</span></td>
      <td><span class="status-${u.active?'active':'inactive'}">${u.active?'● ACTIVE':'○ INACTIVE'}</span></td>
      <td>
        <button class="btn-xs btn-edit" onclick="editUser(${i})">Edit</button>
        ${u.active
          ? `<button class="btn-xs btn-deactivate" onclick="toggleStatus(${i})">Deactivate</button>`
          : `<button class="btn-xs btn-activate"   onclick="toggleStatus(${i})">Activate</button>`}
      </td>
    </tr>`).join('');
}

document.getElementById('btn-add-user').addEventListener('click', () => {
  document.getElementById('modal-user-title').textContent = 'ADD NEW USER';
  document.getElementById('btn-save-user').dataset.editIdx = '';
  ['mu-empno','mu-name','mu-desig','mu-pass'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('mu-dept').value   = '';
  document.getElementById('mu-role').value   = 'dept_user';
  document.getElementById('mu-status').value = 'active';
  document.getElementById('modal-user').style.display = 'flex';
});

function editUser(idx) {
  const u = USERS[idx];
  document.getElementById('modal-user-title').textContent     = 'EDIT USER';
  document.getElementById('btn-save-user').dataset.editIdx    = idx;
  document.getElementById('mu-empno').value  = u.empno;
  document.getElementById('mu-name').value   = u.name;
  document.getElementById('mu-dept').value   = u.dept;
  document.getElementById('mu-desig').value  = u.desig;
  document.getElementById('mu-pass').value   = u.password;
  document.getElementById('mu-role').value   = u.role;
  document.getElementById('mu-status').value = u.active ? 'active' : 'inactive';
  document.getElementById('modal-user').style.display = 'flex';
}

function toggleStatus(idx) { USERS[idx].active = !USERS[idx].active; renderUsers(); }
function closeUserModal()   { document.getElementById('modal-user').style.display = 'none'; }

document.getElementById('btn-save-user').addEventListener('click', () => {
  const empno  = document.getElementById('mu-empno').value.trim().toUpperCase();
  const name   = document.getElementById('mu-name').value.trim();
  const dept   = document.getElementById('mu-dept').value;
  const desig  = document.getElementById('mu-desig').value.trim();
  const pass   = document.getElementById('mu-pass').value;
  const role   = document.getElementById('mu-role').value;
  const status = document.getElementById('mu-status').value === 'active';
  if (!empno || !name || !dept || !pass) { alert('Fill all required fields'); return; }
  const editIdx = document.getElementById('btn-save-user').dataset.editIdx;
  if (editIdx !== '') {
    USERS[parseInt(editIdx)] = { empno, name, dept, desig, password:pass, role, active:status };
  } else {
    if (USERS.find(u => u.empno === empno)) { alert('Employee No. already exists'); return; }
    USERS.push({ empno, name, dept, desig, password:pass, role, active:status });
  }
  closeUserModal(); renderUsers();
});

document.getElementById('modal-user').addEventListener('click', function(e) { if (e.target === this) closeUserModal(); });

/* ===== HELPERS ===== */
function shopShort(desc) { return desc ? desc.split('(')[0].trim() : '—'; }
function agencyLabel(code) {
  return { O:'Operations', M:'Mechanical', E:'Electrical', SD:'Shutdown',
           ID:'Idle', MIS:'Misc', C:'Civil', S:'Safety', CR:'Cold Repair', MS:'Misc' }[code] || code || '—';
}
