/* ═══════════════════════════════════════════════════════════════
   ██████╗  ██████╗ ███╗  ██╗███████╗██╗ ██████╗
   ██╔════╝██╔═══██╗████╗ ██║██╔════╝██║██╔════╝
   ██║     ██║   ██║██╔██╗██║█████╗  ██║██║  ███╗
   ██║     ██║   ██║██║╚████║██╔══╝  ██║██║   ██║
   ╚██████╗╚██████╔╝██║ ╚███║██║     ██║╚██████╔╝
    ╚═════╝ ╚═════╝ ╚═╝  ╚══╝╚═╝     ╚═╝ ╚═════╝

   SISTEM TEMPAHAN COURT FUTSAL — TVET MARA LUMUT
   Versi: 2.0.0
   ----------------------------------------------------------------
   PANDUAN TROUBLESHOOT — Ctrl+F cari label:
     [CONFIG]      — URL API & credentials admin
     [STATE]       — Pembolehubah global
     [API]         — getApiUrl() & setApiUrl()
     [AUTH]        — Login IC, logout
     [CHANGEPASS]  — Screen tukar password (first login)
     [BOOKING]     — Pilih court, navigasi langkah
     [SLOTS]       — Render slot masa
     [SUMMARY]     — Ringkasan tempahan
     [SUBMIT]      — Hantar booking ke Sheets
     [STUDENT-TAB] — Tab pelajar (Tempah/Sejarah/Tetapan)
     [HISTORY]     — Sejarah tempahan pelajar
     [ADMIN-TAB]   — Tab admin
     [ADMIN-DATA]  — Load & papar data admin
     [ADMIN-STUDENTS] — Urus data pelajar (admin)
     [LANG]        — Translations BM/EN
     [INIT]        — DOMContentLoaded setup
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   [CONFIG] KONFIGURASI UTAMA — EDIT DI SINI
   ─────────────────────────────────────────────────────────────
   ⚠️  WAJIB ISI: URL Google Apps Script selepas deploy.
       Semua device (termasuk phone) akan guna URL ni.

   CREDENTIALS ADMIN — tukar di sini:
   ───────────────────────────────────────────────────────────── */
const FIXED_API_URL = 'https://script.google.com/macros/s/AKfycbwsTwYptemUW6M4Vup_bovyPHCLtpeUepYhr9tVB3dtJWVfxIWMMfpe34KaeFW02ot_gA/exec'; // ← TAMPAL URL APPS SCRIPT AWAK DI SINI

const ADMIN_CRED = {
  user: 'admin',     // ← Tukar username admin
  pass: 'admin123'   // ← Tukar password admin
};

/* ─────────────────────────────────────────────────────────────
   [CONFIG] SLOT MASA — tambah/buang slot di sini
   ───────────────────────────────────────────────────────────── */
const SLOTS_AFTERNOON = [
  { slot: '5:00pm - 6:00pm',  type: 'afternoon' },
  { slot: '6:00pm - 7:00pm',  type: 'afternoon' }
];
const SLOTS_NIGHT = [
  { slot: '8:00pm - 10:00pm', type: 'night' },
  { slot: '9:00pm - 11:00pm', type: 'night' }
];

/* ─────────────────────────────────────────────────────────────
   [STATE] PEMBOLEHUBAH GLOBAL — JANGAN EDIT
   ───────────────────────────────────────────────────────────── */
let lang              = 'ms';
let currentUser       = null;   // IC pelajar yang login
let currentUserName   = null;   // Nama penuh dari Sheets
let isAdmin           = false;
let selectedCourt     = null;
let selectedSlot      = null;
let selectedSlotType  = null;   // 'afternoon' | 'night'
let selectedDuration  = 1;
let bookings          = [];
let currentAdminFilter   = 'all';
let currentAdminTab      = 'dashboard';
let currentStudentTab    = 'book';

/* ─────────────────────────────────────────────────────────────
   [LANG] TRANSLATIONS BM/EN
   ───────────────────────────────────────────────────────────── */
const LANG = {
  ms: {
    ttTitle:'Futsal TVET MARA', ttSub:'Lumut, Perak',
    loginHeroTitle:'Sistem Tempahan Court', loginHeroSub:'TVET MARA Lumut — Khusus Pelajar',
    loginCardTitle:'Log Masuk Pelajar',
    lbMatric:'No. IC Pelajar', lbPass:'Kata Laluan',
    inMatric:'Contoh: 050112345678', inPass:'Masukkan kata laluan',
    btnStudentLogin:'Log Masuk', btnShowAdmin:'Log Masuk Admin',
    adminCardTitle:'Log Masuk Admin', lbAdminUser:'Nama Pengguna', lbAdminPass:'Kata Laluan Admin',
    btnAdminLogin:'Log Masuk', btnBackLogin:'← Kembali',
    // Change password screen
    cpTitle:'Tukar Kata Laluan', cpSubtitle:'Sila tukar kata laluan lalai anda sebelum meneruskan.',
    lbNewPass:'Kata Laluan Baru', lbConfirmPass:'Sahkan Kata Laluan',
    inNewPass:'Minimum 6 aksara', inConfirmPass:'Taip semula kata laluan baru',
    btnChangePass:'Tukar & Teruskan',
    cpErrorMatch:'Kata laluan tidak sepadan.',
    cpErrorShort:'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
    cpErrorSameAsDefault:'Sila pilih kata laluan yang berbeza daripada kata laluan lalai.',
    cpSuccess:'Kata laluan berjaya ditukar!',
    // Booking
    s1Title:'Pilih Court & Tarikh', cAName:'Court A', cABadge:'MELINTANG', cBName:'Court B', cBBadge:'MENEGAK',
    lbDate:'Tarikh', btnStep1Next:'Seterusnya →',
    s2Title:'Pilih Slot Masa', lblAfternoon:'Petang', lblNight:'Malam',
    durationTitle:'Pilih Tempoh Bermain', hourLabel1:'Jam', hourLabel2:'Jam',
    btnStep2Back:'← Kembali', btnStep2Next:'Seterusnya →',
    s3Title:'Sahkan Tempahan', shLabel:'Butiran Tempahan',
    btnStep3Back:'← Kembali', btnSubmit:'Sahkan & Tempah',
    navBookLabel:'Tempah', navHistoryLabel:'Sejarah', navSetupLabel:'Tetapan', navLogoutLabel:'Keluar',
    // Admin
    adminTabDash:'Dashboard', adminTabBook:'Tempahan', adminTabSetup:'API', adminTabStudents:'Pelajar',
    adminNavDashLabel:'Dashboard', adminNavBookLabel:'Tempahan', adminNavSetupLabel:'API', adminNavLogoutLabel:'Keluar',
    stLblTotal:'Jumlah', stLblActive:'Aktif', stLblCancelled:'Dibatal',
    recentTitle:'Tempahan Terkini', btnRefresh:'Muat Semula',
    allBookingsTitle:'Semua Tempahan',
    ftAll:'Semua', ftActive:'Aktif', ftCancelled:'Dibatal', ftCourtA:'Court A', ftCourtB:'Court B',
    apiTitle:'Sambungan Google Sheets', lbApiUrl:'URL Apps Script Deployment',
    btnSaveApi:'Simpan URL', btnTestApi:'Test',
    setupGuideTitle:'Cara Pasang Google Sheets', btnCopyScript:'Salin Kod',
    setupStep1:'Buka Google Sheets baru → klik <strong>Extensions</strong> → <strong>Apps Script</strong>',
    setupStep2:'Padam semua kod sedia ada → tampal kod di bawah → klik <strong>Save</strong>',
    setupStep3:'Klik <strong>Deploy</strong> → <strong>New Deployment</strong> → pilih jenis <strong>Web App</strong>',
    setupStep4:'Tetapkan <strong>"Execute as: Me"</strong> dan <strong>"Who has access: Anyone"</strong> → klik Deploy',
    setupStep5:'Salin URL deployment → tampal dalam kotak URL di atas → klik Simpan',
    scriptLabel:'KOD APPS SCRIPT:',
    sl1:'Court', sl2:'Masa', sl3:'Sahkan',
    tCourt:'Court', tDate:'Tarikh', tSlot:'Slot Masa', tDuration:'Tempoh', tMatric:'No. IC', tStatus:'Status',
    active:'Aktif', cancelled:'Dibatal',
    noBooking:'Tiada tempahan dijumpai.',
    successBook:'Tempahan berjaya! ID: ',
    errorApi:'Sila tetapkan URL API dahulu.',
    errorFill:'Sila isi semua maklumat.',
    errorLogin:'No. IC atau kata laluan tidak betul.',
    errorAdminLogin:'Nama pengguna atau kata laluan admin tidak betul.',
    cancelConfirm:'Batalkan tempahan ini?',
    cancelSuccess:'Tempahan dibatalkan.',
    saving:'Menyimpan...', loading:'Memuatkan...',
    urlSaved:'URL disimpan!', testOk:'Sambungan berjaya!', testFail:'Gagal sambung. Semak URL.',
    history:'Sejarah Tempahan', myHistory:'Tempahan Saya',
    hour:'jam', hours:'jam',
    demoMode:'(Mode Demo — Data tidak disimpan. Tetapkan URL API.)',
    courtA_long:'Court A — Melintang', courtB_long:'Court B — Menegak',
    horizontal:'Melintang', vertical:'Menegak',
    thMatric:'No. IC', thNama:'Nama', thCourt:'Court', thDate:'Tarikh',
    thSlot:'Slot', thDuration:'Tempoh', thStatus:'Status', thAction:'Tindakan',
    btnCancel:'Batal', confirm:'Sahkan',
    slotAfternoonInfo:'1 jam — petang', slotNightInfo:'2 jam — pilih tempoh',
    // Admin Students
    studentsTitle:'Senarai Pelajar', btnAddStudent:'+ Tambah Pelajar',
    btnImportStudents:'Import CSV',
    thIC:'No. IC', thMustChange:'Status Kata Laluan',
    mustChangeYes:'Perlu Tukar', mustChangeNo:'Dah Tukar',
    addStudentTitle:'Tambah Pelajar Baru',
    lbIC:'No. IC', lbNama:'Nama Penuh',
    inIC:'Contoh: 050112345678', inNama:'Nama penuh pelajar',
    btnSaveStudent:'Simpan Pelajar',
    importTitle:'Import Pelajar (CSV)',
    importHint:'Format CSV: IC,Nama — satu pelajar sebaris.',
    btnImport:'Import',
    importSuccess:'berjaya diimport.',
    importSkipped:'dilepaskan (IC dah wujud).',
    noStudents:'Tiada pelajar dalam sistem.',
    resetPassConfirm:'Reset kata laluan pelajar ini kepada "tvetmara"?',
    resetPassSuccess:'Kata laluan berjaya direset.',
  },
  en: {
    ttTitle:'Futsal TVET MARA', ttSub:'Lumut, Perak',
    loginHeroTitle:'Court Booking System', loginHeroSub:'TVET MARA Lumut — Students Only',
    loginCardTitle:'Student Login',
    lbMatric:'Student IC Number', lbPass:'Password',
    inMatric:'Example: 050112345678', inPass:'Enter your password',
    btnStudentLogin:'Login', btnShowAdmin:'Admin Login',
    adminCardTitle:'Admin Login', lbAdminUser:'Username', lbAdminPass:'Admin Password',
    btnAdminLogin:'Login', btnBackLogin:'← Back',
    cpTitle:'Change Password', cpSubtitle:'Please change your default password before continuing.',
    lbNewPass:'New Password', lbConfirmPass:'Confirm Password',
    inNewPass:'Minimum 6 characters', inConfirmPass:'Re-enter new password',
    btnChangePass:'Change & Continue',
    cpErrorMatch:'Passwords do not match.',
    cpErrorShort:'Password must be at least 6 characters.',
    cpErrorSameAsDefault:'Please choose a password different from the default.',
    cpSuccess:'Password changed successfully!',
    s1Title:'Select Court & Date', cAName:'Court A', cABadge:'HORIZONTAL', cBName:'Court B', cBBadge:'VERTICAL',
    lbDate:'Date', btnStep1Next:'Next →',
    s2Title:'Select Time Slot', lblAfternoon:'Afternoon', lblNight:'Night',
    durationTitle:'Select Playing Duration', hourLabel1:'Hour', hourLabel2:'Hours',
    btnStep2Back:'← Back', btnStep2Next:'Next →',
    s3Title:'Confirm Booking', shLabel:'Booking Details',
    btnStep3Back:'← Back', btnSubmit:'Confirm & Book',
    navBookLabel:'Book', navHistoryLabel:'History', navSetupLabel:'Settings', navLogoutLabel:'Logout',
    adminTabDash:'Dashboard', adminTabBook:'Bookings', adminTabSetup:'API', adminTabStudents:'Students',
    adminNavDashLabel:'Dashboard', adminNavBookLabel:'Bookings', adminNavSetupLabel:'API', adminNavLogoutLabel:'Logout',
    stLblTotal:'Total', stLblActive:'Active', stLblCancelled:'Cancelled',
    recentTitle:'Recent Bookings', btnRefresh:'Refresh',
    allBookingsTitle:'All Bookings',
    ftAll:'All', ftActive:'Active', ftCancelled:'Cancelled', ftCourtA:'Court A', ftCourtB:'Court B',
    apiTitle:'Google Sheets Connection', lbApiUrl:'Apps Script Deployment URL',
    btnSaveApi:'Save URL', btnTestApi:'Test',
    setupGuideTitle:'How to Setup Google Sheets', btnCopyScript:'Copy Code',
    setupStep1:'Open a new Google Sheets → click <strong>Extensions</strong> → <strong>Apps Script</strong>',
    setupStep2:'Delete all existing code → paste the code below → click <strong>Save</strong>',
    setupStep3:'Click <strong>Deploy</strong> → <strong>New Deployment</strong> → choose type <strong>Web App</strong>',
    setupStep4:'Set <strong>"Execute as: Me"</strong> and <strong>"Who has access: Anyone"</strong> → click Deploy',
    setupStep5:'Copy deployment URL → paste in the URL box above → click Save',
    scriptLabel:'APPS SCRIPT CODE:',
    sl1:'Court', sl2:'Time', sl3:'Confirm',
    tCourt:'Court', tDate:'Date', tSlot:'Time Slot', tDuration:'Duration', tMatric:'IC No', tStatus:'Status',
    active:'Active', cancelled:'Cancelled',
    noBooking:'No bookings found.',
    successBook:'Booking successful! ID: ',
    errorApi:'Please set up API URL first.',
    errorFill:'Please fill in all fields.',
    errorLogin:'Wrong IC number or password.',
    errorAdminLogin:'Wrong admin credentials.',
    cancelConfirm:'Cancel this booking?',
    cancelSuccess:'Booking cancelled.',
    saving:'Saving...', loading:'Loading...',
    urlSaved:'URL saved!', testOk:'Connection successful!', testFail:'Failed to connect. Check URL.',
    history:'Booking History', myHistory:'My Bookings',
    hour:'hour', hours:'hours',
    demoMode:'(Demo Mode — Data not saved. Set API URL.)',
    courtA_long:'Court A — Horizontal', courtB_long:'Court B — Vertical',
    horizontal:'Horizontal', vertical:'Vertical',
    thMatric:'IC No', thNama:'Name', thCourt:'Court', thDate:'Date',
    thSlot:'Slot', thDuration:'Duration', thStatus:'Status', thAction:'Action',
    btnCancel:'Cancel', confirm:'Confirm',
    slotAfternoonInfo:'1 hour — afternoon', slotNightInfo:'2 hours — choose duration',
    studentsTitle:'Student List', btnAddStudent:'+ Add Student',
    btnImportStudents:'Import CSV',
    thIC:'IC No', thMustChange:'Password Status',
    mustChangeYes:'Must Change', mustChangeNo:'Changed',
    addStudentTitle:'Add New Student',
    lbIC:'IC Number', lbNama:'Full Name',
    inIC:'Example: 050112345678', inNama:'Student full name',
    btnSaveStudent:'Save Student',
    importTitle:'Import Students (CSV)',
    importHint:'CSV format: IC,Name — one student per line.',
    btnImport:'Import',
    importSuccess:'successfully imported.',
    importSkipped:'skipped (IC already exists).',
    noStudents:'No students in system.',
    resetPassConfirm:'Reset this student\'s password to "tvetmara"?',
    resetPassSuccess:'Password successfully reset.',
  }
};

/* ─────────────────────────────────────────────────────────────
   [API] SAMBUNGAN GOOGLE SHEETS
   ───────────────────────────────────────────────────────────── */
function getApiUrl() {
  return localStorage.getItem('futsalApiUrl') || FIXED_API_URL || '';
}
function setApiUrl(url) { localStorage.setItem('futsalApiUrl', url); }

/* ─────────────────────────────────────────────────────────────
   UTILS
   ───────────────────────────────────────────────────────────── */
function showAlert(elId, msg, type = 'danger') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 5000);
}
function clearAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = '';
}
function t(key) { return LANG[lang][key] || key; }

function getBookedSlots(court, date) {
  return bookings
    .filter(b => b.Court === court && b.Date === date && b.Status === 'Active')
    .map(b => b.Slot);
}

/* ─────────────────────────────────────────────────────────────
   [LANG-SWITCH] TOGGLE BAHASA
   ───────────────────────────────────────────────────────────── */
function setLang(l) {
  lang = l;
  document.getElementById('btnLangMs').classList.toggle('active', l === 'ms');
  document.getElementById('btnLangEn').classList.toggle('active', l === 'en');
  applyLang();
}

function applyLang() {
  const tr = LANG[lang];
  Object.keys(tr).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT') el.placeholder = tr[id];
    else if (['setupStep1','setupStep2','setupStep3','setupStep4','setupStep5'].includes(id)) el.innerHTML = tr[id];
    else el.textContent = tr[id];
  });
  ['sl1','sl2','sl3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = tr[id];
  });
  if (currentUser && !isAdmin) renderSlots();
}

/* ─────────────────────────────────────────────────────────────
   SCREEN MANAGER
   ───────────────────────────────────────────────────────────── */
function showScreen(id) {
  ['screenLogin','screenChangePass','screenStudent','screenAdmin'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

/* ─────────────────────────────────────────────────────────────
   [AUTH] LOGIN PELAJAR — guna IC + password dari Google Sheets
   ───────────────────────────────────────────────────────────── */
function showAdminLogin() {
  document.getElementById('studentLoginCard').style.display = 'none';
  document.getElementById('adminLoginCard').style.display = 'block';
}
function hideAdminLogin() {
  document.getElementById('adminLoginCard').style.display = 'none';
  document.getElementById('studentLoginCard').style.display = 'block';
}

async function doStudentLogin() {
  const ic   = document.getElementById('inMatric').value.trim();
  const pass = document.getElementById('inPass').value.trim();
  clearAlert('loginAlert');

  if (!ic || !pass) { showAlert('loginAlert', t('errorFill')); return; }

  const apiUrl = getApiUrl();

  // Kalau tiada API URL — tak boleh login (kena setup dulu)
  if (!apiUrl) {
    showAlert('loginAlert', 'URL API belum dikonfigurasi. Hubungi admin.', 'warning');
    return;
  }

  showAlert('loginAlert', t('loading'), 'info');

  try {
    const res  = await fetch(`${apiUrl}?action=getStudent&ic=${encodeURIComponent(ic)}&pass=${encodeURIComponent(pass)}`);
    const data = await res.json();

    if (!data.success) {
      showAlert('loginAlert', data.error || t('errorLogin'));
      return;
    }

    // Login berjaya
    currentUser     = data.ic;
    currentUserName = data.nama;
    isAdmin         = false;

    document.getElementById('userAvatar').textContent    = data.nama.charAt(0).toUpperCase();
    document.getElementById('userChipName').textContent  = data.nama.split(' ')[0]; // nama pendek
    document.getElementById('userChip').style.display   = 'flex';

    if (data.mustChangePass) {
      // First login — paksa tukar password
      showScreen('screenChangePass');
      document.getElementById('cpUserName').textContent = data.nama;
    } else {
      showScreen('screenStudent');
      goToStep1();
      loadStudentBookings();
    }

  } catch(e) {
    showAlert('loginAlert', 'Gagal sambung ke pelayan. Semak URL API.');
  }
}

/* ─────────────────────────────────────────────────────────────
   [AUTH] LOGIN ADMIN
   ───────────────────────────────────────────────────────────── */
function doAdminLogin() {
  const u = document.getElementById('inAdminUser').value.trim();
  const p = document.getElementById('inAdminPass').value;
  clearAlert('adminAlert');
  if (u === ADMIN_CRED.user && p === ADMIN_CRED.pass) {
    currentUser = 'admin'; isAdmin = true;
    document.getElementById('userAvatar').textContent   = 'AD';
    document.getElementById('userChipName').textContent = 'Admin';
    document.getElementById('userChip').style.display  = 'flex';
    showScreen('screenAdmin');
    loadAdminData();
    const savedUrl = getApiUrl();
    if (savedUrl) document.getElementById('inApiUrl').value = savedUrl;
  } else {
    showAlert('adminAlert', t('errorAdminLogin'));
  }
}

/* ─────────────────────────────────────────────────────────────
   [AUTH] LOGOUT
   ───────────────────────────────────────────────────────────── */
function doLogout() {
  currentUser = null; currentUserName = null; isAdmin = false;
  selectedCourt = null; selectedSlot = null; selectedSlotType = null;
  bookings = [];
  document.getElementById('userChip').style.display    = 'none';
  document.getElementById('inMatric').value            = '';
  document.getElementById('inPass').value              = '';
  document.getElementById('inAdminUser').value         = '';
  document.getElementById('inAdminPass').value         = '';
  clearAlert('loginAlert'); clearAlert('adminAlert');
  hideAdminLogin();
  showScreen('screenLogin');
}

/* ─────────────────────────────────────────────────────────────
   [CHANGEPASS] TUKAR PASSWORD — FIRST LOGIN
   ───────────────────────────────────────────────────────────── */
async function doChangePassword() {
  const newPass     = document.getElementById('inNewPass').value.trim();
  const confirmPass = document.getElementById('inConfirmPass').value.trim();
  clearAlert('cpAlert');

  if (newPass.length < 6) {
    showAlert('cpAlert', t('cpErrorShort'), 'warning'); return;
  }
  if (newPass === 'tvetmara') {
    showAlert('cpAlert', t('cpErrorSameAsDefault'), 'warning'); return;
  }
  if (newPass !== confirmPass) {
    showAlert('cpAlert', t('cpErrorMatch'), 'warning'); return;
  }

  const apiUrl = getApiUrl();
  showAlert('cpAlert', t('saving'), 'info');

  try {
    const res  = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'changePassword', ic: currentUser, newPass })
    });
    const data = await res.json();

    if (data.success) {
      showAlert('cpAlert', t('cpSuccess'), 'success');
      setTimeout(() => {
        document.getElementById('inNewPass').value     = '';
        document.getElementById('inConfirmPass').value = '';
        showScreen('screenStudent');
        goToStep1();
        loadStudentBookings();
      }, 1500);
    } else {
      showAlert('cpAlert', data.error || 'Gagal tukar password.');
    }
  } catch(e) {
    showAlert('cpAlert', 'Gagal sambung ke pelayan.');
  }
}

/* ─────────────────────────────────────────────────────────────
   [BOOKING] PILIH COURT
   ───────────────────────────────────────────────────────────── */
function selectCourt(c) {
  selectedCourt = c;
  document.getElementById('courtCardA').classList.toggle('selected', c === 'A');
  document.getElementById('courtCardB').classList.toggle('selected', c === 'B');
}

/* ─────────────────────────────────────────────────────────────
   [BOOKING] NAVIGASI LANGKAH 1 → 2 → 3
   ───────────────────────────────────────────────────────────── */
function updateStepBar(step) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById('sc' + i);
    const label  = document.getElementById('sl' + i);
    circle.classList.remove('active','done');
    label.classList.remove('active','done');
    if (i < step)       { circle.classList.add('done'); circle.innerHTML = '✓'; label.classList.add('done'); }
    else if (i === step){ circle.classList.add('active'); circle.textContent = i; label.classList.add('active'); }
    else                { circle.textContent = i; }
  }
  document.getElementById('sline1').classList.toggle('done', step > 1);
  document.getElementById('sline2').classList.toggle('done', step > 2);
}

function goToStep1() {
  document.getElementById('step1Div').style.display = 'block';
  document.getElementById('step2Div').style.display = 'none';
  document.getElementById('step3Div').style.display = 'none';
  updateStepBar(1);
  const today  = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('inDate');
  dateEl.min   = today;
  if (!dateEl.value || dateEl.value < today) dateEl.value = today;
}

function goToStep2() {
  clearAlert('s1Alert');
  if (!selectedCourt) {
    showAlert('s1Alert', lang === 'ms' ? 'Sila pilih court terlebih dahulu.' : 'Please select a court first.', 'warning'); return;
  }
  if (!document.getElementById('inDate').value) {
    showAlert('s1Alert', lang === 'ms' ? 'Sila pilih tarikh.' : 'Please select a date.', 'warning'); return;
  }
  document.getElementById('step1Div').style.display = 'none';
  document.getElementById('step2Div').style.display = 'block';
  document.getElementById('step3Div').style.display = 'none';
  document.getElementById('selectedCourtLabel').textContent = 'Court ' + selectedCourt + ' — ' + (selectedCourt === 'A' ? t('horizontal') : t('vertical'));
  updateStepBar(2);
  renderSlots();
}

function goToStep3() {
  clearAlert('s2Alert');
  if (!selectedSlot) {
    showAlert('s2Alert', lang === 'ms' ? 'Sila pilih slot masa.' : 'Please select a time slot.', 'warning'); return;
  }
  document.getElementById('step1Div').style.display = 'none';
  document.getElementById('step2Div').style.display = 'none';
  document.getElementById('step3Div').style.display = 'block';
  updateStepBar(3);
  renderSummary();
}

/* ─────────────────────────────────────────────────────────────
   [SLOTS] RENDER SLOT MASA
   TROUBLESHOOT: Slot tak muncul → check SLOTS_AFTERNOON & SLOTS_NIGHT dalam [CONFIG]
   ───────────────────────────────────────────────────────────── */
function renderSlots() {
  const court    = selectedCourt;
  const date     = document.getElementById('inDate').value;
  const booked   = court && date ? getBookedSlots(court, date) : [];
  const afGrid   = document.getElementById('slotGridAfternoon');
  const nightGrid= document.getElementById('slotGridNight');
  afGrid.innerHTML = ''; nightGrid.innerHTML = '';

  SLOTS_AFTERNOON.forEach(s => {
    const isBooked = booked.includes(s.slot);
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (selectedSlot === s.slot ? ' selected' : '');
    btn.disabled  = isBooked;
    btn.innerHTML = s.slot.replace(' - ','<br>') + `<span class="slot-tag">${t('slotAfternoonInfo')}</span>`;
    if (!isBooked) btn.onclick = () => selectSlot(s.slot, 'afternoon');
    afGrid.appendChild(btn);
  });

  SLOTS_NIGHT.forEach(s => {
    const isBooked = booked.includes(s.slot);
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (selectedSlot === s.slot ? ' selected' : '');
    btn.disabled  = isBooked;
    btn.innerHTML = s.slot.replace(' - ','<br>') + `<span class="slot-tag">${t('slotNightInfo')}</span>`;
    if (!isBooked) btn.onclick = () => selectSlot(s.slot, 'night');
    nightGrid.appendChild(btn);
  });
}

function selectSlot(slot, type) {
  selectedSlot     = slot;
  selectedSlotType = type;
  if (type !== 'night') {
    selectedDuration = 1;
    document.getElementById('durationBox').style.display = 'none';
  } else {
    document.getElementById('durationBox').style.display = 'block';
  }
  renderSlots();
}

function setDuration(d) {
  selectedDuration = d;
  document.getElementById('btn1h').classList.toggle('selected', d === 1);
  document.getElementById('btn2h').classList.toggle('selected', d === 2);
}

/* ─────────────────────────────────────────────────────────────
   [SUMMARY] PAPARAN RINGKASAN SEBELUM CONFIRM
   ───────────────────────────────────────────────────────────── */
function renderSummary() {
  const date      = document.getElementById('inDate').value;
  const dur       = selectedSlotType === 'night' ? selectedDuration : 1;
  const durText   = dur + ' ' + (dur === 1 ? t('hour') : t('hours'));
  const courtLabel= selectedCourt === 'A' ? t('courtA_long') : t('courtB_long');
  document.getElementById('shValue').textContent = courtLabel + ' • ' + date;
  document.getElementById('summaryTable').innerHTML = `
    <tr><td>${t('tMatric')}</td><td>${currentUser}</td></tr>
    <tr><td>${t('thNama')}</td><td>${currentUserName || ''}</td></tr>
    <tr><td>${t('tCourt')}</td><td>${courtLabel}</td></tr>
    <tr><td>${t('tDate')}</td><td>${date}</td></tr>
    <tr><td>${t('tSlot')}</td><td>${selectedSlot}</td></tr>
    <tr><td>${t('tDuration')}</td><td>${durText}</td></tr>
  `;
}

/* ─────────────────────────────────────────────────────────────
   [SUBMIT] HANTAR TEMPAHAN KE GOOGLE SHEETS
   TROUBLESHOOT:
     - "Gagal sambung" → URL salah / Apps Script tak deploy
     - Data tak masuk Sheets → check FIXED_API_URL dalam [CONFIG]
   ───────────────────────────────────────────────────────────── */
async function submitBooking() {
  clearAlert('s3Alert');
  const date    = document.getElementById('inDate').value;
  const dur     = selectedSlotType === 'night' ? selectedDuration : 1;
  const payload = {
    action: 'add',
    ic:     currentUser,
    nama:   currentUserName || currentUser,
    court:  selectedCourt,
    date,
    slot:   selectedSlot,
    duration: dur
  };

  const apiUrl   = getApiUrl();
  const localId  = 'BK' + Date.now();
  const newBooking = {
    ID: localId, IC: currentUser, Nama: currentUserName || currentUser,
    Court: selectedCourt, Date: date, Slot: selectedSlot,
    Duration: dur, Status: 'Active', Timestamp: new Date().toLocaleString('ms-MY')
  };

  if (!apiUrl) {
    bookings.push(newBooking);
    showAlert('s3Alert', t('successBook') + localId + '<br><small>' + t('demoMode') + '</small>', 'success');
    setTimeout(() => resetBookingForm(), 3000);
    return;
  }

  showAlert('s3Alert', t('saving'), 'info');
  try {
    const res  = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      newBooking.ID = data.id || localId;
      bookings.push(newBooking);
      showAlert('s3Alert', t('successBook') + newBooking.ID, 'success');
      setTimeout(() => resetBookingForm(), 3000);
    } else {
      showAlert('s3Alert', 'Error: ' + (data.error || 'Unknown'));
    }
  } catch(e) {
    console.error('[SUBMIT] Error:', e);
    showAlert('s3Alert', lang === 'ms'
      ? 'Gagal sambung ke Google Sheets. Semak URL API anda.'
      : 'Failed to connect to Google Sheets. Check your API URL.');
  }
}

function resetBookingForm() {
  selectedCourt = null; selectedSlot = null; selectedSlotType = null; selectedDuration = 1;
  document.getElementById('courtCardA').classList.remove('selected');
  document.getElementById('courtCardB').classList.remove('selected');
  document.getElementById('durationBox').style.display = 'none';
  document.getElementById('btn1h').classList.add('selected');
  document.getElementById('btn2h').classList.remove('selected');
  clearAlert('s3Alert');
  goToStep1();
}

/* ─────────────────────────────────────────────────────────────
   [STUDENT-TAB] NAVIGASI TAB PELAJAR
   ───────────────────────────────────────────────────────────── */
function showStudentTab(tab) {
  currentStudentTab = tab;
  ['book','history','setup'].forEach(tb => {
    document.getElementById('nav' + tb.charAt(0).toUpperCase() + tb.slice(1)).classList.toggle('active', tb === tab);
  });

  const show = (id, vis) => { const el = document.getElementById(id); if(el) el.style.display = vis ? (id === 'stepBar' ? 'flex' : 'block') : 'none'; };

  show('stepBar',    tab === 'book');
  show('step1Div',   tab === 'book');
  show('step2Div',   false);
  show('step3Div',   false);
  show('historyCard',tab === 'history');
  show('setupCard',  tab === 'setup');

  if (tab === 'history') renderStudentHistory();
  if (tab === 'setup') {
    const savedUrl = getApiUrl();
    const el = document.getElementById('inApiUrlStudent');
    if (el && savedUrl) el.value = savedUrl;
  }
}

function loadStudentBookings() {
  const apiUrl = getApiUrl();
  if (!apiUrl) return;
  fetch(`${apiUrl}?action=get&ic=${encodeURIComponent(currentUser)}`)
    .then(r => r.json())
    .then(data => {
      if (data.success && data.data) {
        const existing = bookings.map(b => b.ID);
        data.data.forEach(b => { if (!existing.includes(b.ID)) bookings.push(b); });
      }
    }).catch(() => {});
}

/* ─────────────────────────────────────────────────────────────
   [HISTORY] SEJARAH TEMPAHAN PELAJAR
   ───────────────────────────────────────────────────────────── */
function renderStudentHistory() {
  const myBookings = bookings.filter(b => b.IC === currentUser || b.Matric === currentUser).reverse();
  const el = document.getElementById('historyListEl');
  if (!myBookings.length) {
    el.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><p>${t('noBooking')}</p></div>`;
    return;
  }
  el.innerHTML = myBookings.map(b => `
    <div class="booking-item">
      <div class="booking-main">
        <div class="booking-court-label">Court ${b.Court} — ${b.Court === 'A' ? t('horizontal') : t('vertical')}</div>
        <div class="booking-meta">${b.Date} &nbsp;•&nbsp; ${b.Duration} ${b.Duration==1?t('hour'):t('hours')}</div>
        <div class="booking-slot">${b.Slot}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
        <span class="badge badge-${b.Status === 'Active' ? 'active' : 'cancelled'}">${b.Status === 'Active' ? t('active') : t('cancelled')}</span>
        ${b.Status === 'Active' ? `<button class="btn-danger-sm" onclick="cancelStudentBooking('${b.ID}')">${t('btnCancel')}</button>` : ''}
      </div>
    </div>
  `).join('');
}

async function cancelStudentBooking(id) {
  if (!confirm(t('cancelConfirm'))) return;
  const b = bookings.find(x => x.ID === id);
  if (b) b.Status = 'Cancelled';
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try { await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'cancel', id }) }); } catch(e) {}
  }
  renderStudentHistory();
}

/* ─────────────────────────────────────────────────────────────
   [ADMIN-TAB] NAVIGASI TAB ADMIN
   ───────────────────────────────────────────────────────────── */
function switchAdminTab(tab) {
  currentAdminTab = tab;
  document.getElementById('adminDashboard').style.display    = tab === 'dashboard' ? 'block' : 'none';
  document.getElementById('adminBookings').style.display     = tab === 'bookings'  ? 'block' : 'none';
  document.getElementById('adminSetupPanel').style.display   = tab === 'setup'     ? 'block' : 'none';
  document.getElementById('adminStudentsPanel').style.display= tab === 'students'  ? 'block' : 'none';

  ['Dash','Book','Setup','Students'].forEach(k => {
    const keyMap = { Dash:'dashboard', Book:'bookings', Setup:'setup', Students:'students' };
    const el1 = document.getElementById('adminTab' + k);
    const el2 = document.getElementById('adminNav' + k);
    if (el1) el1.classList.toggle('active', keyMap[k] === tab);
    if (el2) el2.classList.toggle('active', keyMap[k] === tab);
  });

  if (tab === 'setup') {
    const savedUrl = getApiUrl();
    if (savedUrl) document.getElementById('inApiUrl').value = savedUrl;
  }
  if (tab === 'bookings')  renderAdminBookingsFull();
  if (tab === 'students')  loadAdminStudents();
}

/* ─────────────────────────────────────────────────────────────
   [ADMIN-DATA] MUATKAN DATA TEMPAHAN
   ───────────────────────────────────────────────────────────── */
async function loadAdminData() {
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try {
      const res  = await fetch(apiUrl + '?action=get');
      const data = await res.json();
      if (data.success && data.data) bookings = data.data;
    } catch(e) {}
  }
  updateAdminStats();
  renderAdminRecent();
  if (currentAdminTab === 'bookings') renderAdminBookingsFull();
}

function updateAdminStats() {
  document.getElementById('statTotal').textContent     = bookings.length;
  document.getElementById('statActive').textContent    = bookings.filter(b => b.Status === 'Active').length;
  document.getElementById('statCancelled').textContent = bookings.filter(b => b.Status === 'Cancelled').length;
}

function renderAdminRecent() {
  const recent = [...bookings].reverse().slice(0, 10);
  const el = document.getElementById('adminRecentList');
  if (!recent.length) {
    el.innerHTML = `<div class="empty-state" style="padding:24px 0;"><p>${t('noBooking')}</p></div>`;
    return;
  }
  el.innerHTML = `<div style="overflow-x:auto;">
    <table class="data-table">
      <thead><tr>
        <th>${t('thIC')}</th><th>${t('thNama')}</th><th>${t('thCourt')}</th>
        <th>${t('thDate')}</th><th>${t('thSlot')}</th><th>${t('thStatus')}</th>
      </tr></thead>
      <tbody>${recent.map(b => `<tr>
        <td><strong>${b.IC || b.Matric || ''}</strong></td>
        <td>${b.Nama || b.Name || ''}</td>
        <td>Court ${b.Court}</td>
        <td>${b.Date}</td>
        <td style="font-size:11px;">${b.Slot}</td>
        <td><span class="badge badge-${b.Status==='Active'?'active':'cancelled'}">${b.Status==='Active'?t('active'):t('cancelled')}</span></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function filterBookings(f) {
  currentAdminFilter = f;
  ['all','Active','Cancelled','A','B'].forEach(v => {
    const ids = { all:'ftAll', Active:'ftActive', Cancelled:'ftCancelled', A:'ftCourtA', B:'ftCourtB' };
    document.getElementById(ids[v]).classList.toggle('active', f === v);
  });
  renderAdminBookingsFull();
}

function renderAdminBookingsFull() {
  let filtered = [...bookings].reverse();
  if (currentAdminFilter === 'Active')    filtered = filtered.filter(b => b.Status === 'Active');
  else if (currentAdminFilter === 'Cancelled') filtered = filtered.filter(b => b.Status === 'Cancelled');
  else if (currentAdminFilter === 'A')    filtered = filtered.filter(b => b.Court === 'A');
  else if (currentAdminFilter === 'B')    filtered = filtered.filter(b => b.Court === 'B');

  const el = document.getElementById('adminBookingsFull');
  if (!filtered.length) {
    el.innerHTML = `<div class="empty-state" style="padding:24px 0;"><p>${t('noBooking')}</p></div>`;
    return;
  }
  el.innerHTML = `<div style="overflow-x:auto;">
    <table class="data-table">
      <thead><tr>
        <th>${t('thIC')}</th><th>${t('thNama')}</th><th>${t('thCourt')}</th>
        <th>${t('thDate')}</th><th>${t('thSlot')}</th>
        <th>${t('thDuration')}</th><th>${t('thStatus')}</th><th>${t('thAction')}</th>
      </tr></thead>
      <tbody>${filtered.map(b => `<tr>
        <td><strong>${b.IC || b.Matric || ''}</strong></td>
        <td>${b.Nama || b.Name || ''}</td>
        <td>Court ${b.Court}</td>
        <td>${b.Date}</td>
        <td style="font-size:11px;">${b.Slot}</td>
        <td>${b.Duration}${b.Duration==1?t('hour').charAt(0):t('hours').charAt(0)}</td>
        <td><span class="badge badge-${b.Status==='Active'?'active':'cancelled'}">${b.Status==='Active'?t('active'):t('cancelled')}</span></td>
        <td>${b.Status==='Active'?`<button class="btn-danger-sm" onclick="adminCancelBooking('${b.ID}')">${t('btnCancel')}</button>`:'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

async function adminCancelBooking(id) {
  if (!confirm(t('cancelConfirm'))) return;
  const b = bookings.find(x => x.ID === id);
  if (b) b.Status = 'Cancelled';
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try { await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'cancel', id }) }); } catch(e) {}
  }
  updateAdminStats();
  renderAdminRecent();
  renderAdminBookingsFull();
}

/* ─────────────────────────────────────────────────────────────
   [ADMIN-STUDENTS] URUS DATA PELAJAR
   ───────────────────────────────────────────────────────────── */
async function loadAdminStudents() {
  const apiUrl = getApiUrl();
  const el = document.getElementById('studentListEl');
  if (!apiUrl) { el.innerHTML = `<div class="empty-state"><p>${t('errorApi')}</p></div>`; return; }
  el.innerHTML = `<div class="empty-state"><p>${t('loading')}</p></div>`;
  try {
    const res  = await fetch(apiUrl + '?action=getStudents');
    const data = await res.json();
    if (!data.success || !data.data.length) {
      el.innerHTML = `<div class="empty-state"><p>${t('noStudents')}</p></div>`; return;
    }
    el.innerHTML = `<div style="overflow-x:auto;">
      <table class="data-table">
        <thead><tr>
          <th>${t('thIC')}</th><th>${t('thNama')}</th><th>${t('thMustChange')}</th><th>${t('thAction')}</th>
        </tr></thead>
        <tbody>${data.data.map(s => `<tr>
          <td><strong>${s.IC}</strong></td>
          <td>${s.Nama}</td>
          <td><span class="badge badge-${s.MustChangePass==='TRUE'||s.MustChangePass===true?'cancelled':'active'}">
            ${s.MustChangePass==='TRUE'||s.MustChangePass===true?t('mustChangeYes'):t('mustChangeNo')}
          </span></td>
          <td><button class="btn-outline-sm" onclick="adminResetPassword('${s.IC}','${s.Nama}')">${lang==='ms'?'Reset Pass':'Reset Pass'}</button></td>
        </tr>`).join('')}</tbody>
      </table></div>`;
  } catch(e) {
    el.innerHTML = `<div class="empty-state"><p>Gagal memuatkan data.</p></div>`;
  }
}

async function adminAddStudent() {
  const ic   = document.getElementById('inStudentIC').value.trim();
  const nama = document.getElementById('inStudentNama').value.trim();
  clearAlert('addStudentAlert');
  if (!ic || !nama) { showAlert('addStudentAlert', t('errorFill'), 'warning'); return; }
  const apiUrl = getApiUrl();
  if (!apiUrl) { showAlert('addStudentAlert', t('errorApi'), 'warning'); return; }
  showAlert('addStudentAlert', t('saving'), 'info');
  try {
    const res  = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'addStudent', ic, nama }) });
    const data = await res.json();
    if (data.success) {
      showAlert('addStudentAlert', data.message || 'Berjaya!', 'success');
      document.getElementById('inStudentIC').value   = '';
      document.getElementById('inStudentNama').value = '';
      loadAdminStudents();
    } else {
      showAlert('addStudentAlert', data.error || 'Gagal.');
    }
  } catch(e) {
    showAlert('addStudentAlert', 'Gagal sambung ke pelayan.');
  }
}

async function adminImportStudents() {
  const raw = document.getElementById('inImportCSV').value.trim();
  clearAlert('importAlert');
  if (!raw) { showAlert('importAlert', 'Sila masukkan data CSV.', 'warning'); return; }

  const students = raw.split('\n').map(line => {
    const parts = line.split(',');
    return { ic: (parts[0] || '').trim(), nama: (parts[1] || '').trim() };
  }).filter(s => s.ic && s.nama);

  if (!students.length) { showAlert('importAlert', 'Format salah. Guna: IC,Nama', 'warning'); return; }

  const apiUrl = getApiUrl();
  if (!apiUrl) { showAlert('importAlert', t('errorApi'), 'warning'); return; }

  showAlert('importAlert', t('saving'), 'info');
  try {
    const res  = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'importStudents', students }) });
    const data = await res.json();
    if (data.success) {
      showAlert('importAlert', `${data.added} ${t('importSuccess')} ${data.skipped} ${t('importSkipped')}`, 'success');
      document.getElementById('inImportCSV').value = '';
      loadAdminStudents();
    } else {
      showAlert('importAlert', data.error || 'Gagal import.');
    }
  } catch(e) {
    showAlert('importAlert', 'Gagal sambung ke pelayan.');
  }
}

async function adminResetPassword(ic, nama) {
  if (!confirm(`${t('resetPassConfirm')}\n${nama} (${ic})`)) return;
  const apiUrl = getApiUrl();
  try {
    const res  = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'changePassword', ic, newPass: 'tvetmara', forceReset: true })
    });
    const data = await res.json();
    if (data.success) {
      alert(t('resetPassSuccess'));
      // Set MustChangePass back to TRUE
      await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'setMustChange', ic }) });
      loadAdminStudents();
    }
  } catch(e) {}
}

/* ─────────────────────────────────────────────────────────────
   [API] SIMPAN & TEST URL
   ───────────────────────────────────────────────────────────── */
function saveApiUrl() {
  const url = document.getElementById('inApiUrl').value.trim();
  setApiUrl(url);
  showAlert('apiAlert', t('urlSaved'), 'success');
  const el2 = document.getElementById('inApiUrlStudent');
  if (el2) el2.value = url;
}

function saveApiUrlStudent() {
  const url = document.getElementById('inApiUrlStudent').value.trim();
  setApiUrl(url);
  showAlert('apiAlertStudent', t('urlSaved'), 'success');
  const el = document.getElementById('inApiUrl');
  if (el) el.value = url;
}

async function testApi() {
  const url = document.getElementById('inApiUrl').value.trim();
  if (!url) { showAlert('apiAlert', t('errorApi'), 'warning'); return; }
  showAlert('apiAlert', t('loading'), 'info');
  try {
    const res  = await fetch(url + '?action=get');
    const data = await res.json();
    if (data.success !== undefined) showAlert('apiAlert', t('testOk'), 'success');
    else showAlert('apiAlert', t('testFail'));
  } catch(e) { showAlert('apiAlert', t('testFail')); }
}

async function testApiStudent() {
  const url = document.getElementById('inApiUrlStudent').value.trim();
  if (!url) { showAlert('apiAlertStudent', t('errorApi'), 'warning'); return; }
  showAlert('apiAlertStudent', t('loading'), 'info');
  try {
    const res  = await fetch(url + '?action=get');
    const data = await res.json();
    if (data.success !== undefined) showAlert('apiAlertStudent', t('testOk'), 'success');
    else showAlert('apiAlertStudent', t('testFail'));
  } catch(e) { showAlert('apiAlertStudent', t('testFail')); }
}

function copyScript() {
  const code = document.getElementById('appsScriptCode').textContent;
  navigator.clipboard.writeText(code).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  }).then(() => {
    const btn = document.getElementById('btnCopyScript');
    const prev = btn.textContent;
    btn.textContent = lang === 'ms' ? 'Disalin!' : 'Copied!';
    setTimeout(() => { btn.textContent = prev; }, 2000);
  });
}

/* ─────────────────────────────────────────────────────────────
   [INIT] DOMContentLoaded — Setup awal
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#screenStudent .container');

  // History card
  const historyCard = document.createElement('div');
  historyCard.id = 'historyCard';
  historyCard.style.display = 'none';
  historyCard.innerHTML = `
    <div class="card">
      <div class="card-title" id="myHistoryTitle">Tempahan Saya</div>
      <div id="historyListEl"></div>
    </div>`;
  container.appendChild(historyCard);

  // Setup card (student)
  const setupCard = document.createElement('div');
  setupCard.id = 'setupCard';
  setupCard.style.display = 'none';
  setupCard.innerHTML = `
    <div class="card">
      <div class="card-title">API Setup</div>
      <div id="apiAlertStudent"></div>
      <div class="form-group">
        <label class="form-label">URL Apps Script</label>
        <input class="form-input" type="text" id="inApiUrlStudent" placeholder="https://script.google.com/macros/s/.../exec" style="font-size:12px;">
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" onclick="saveApiUrlStudent()" style="flex:2;">Simpan URL</button>
        <button class="btn btn-secondary" onclick="testApiStudent()" style="flex:1;margin-top:0;">Test</button>
      </div>
    </div>`;
  container.appendChild(setupCard);

  // Set today date
  const today  = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('inDate');
  if (dateEl) { dateEl.min = today; dateEl.value = today; }

  // Sync API URL ke input kalau dah ada
  const savedUrl = getApiUrl();
  const apiInput = document.getElementById('inApiUrl');
  if (savedUrl && apiInput) apiInput.value = savedUrl;

  // Date change listener
  if (dateEl) {
    dateEl.addEventListener('change', () => {
      selectedSlot = null;
      if (document.getElementById('step2Div').style.display !== 'none') renderSlots();
    });
  }
});