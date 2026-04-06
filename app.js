/* ═══════════════════════════════════════════════════════════════
   ██████╗  ██████╗ ███╗  ██╗███████╗██╗ ██████╗
   ██╔════╝██╔═══██╗████╗ ██║██╔════╝██║██╔════╝
   ██║     ██║   ██║██╔██╗██║█████╗  ██║██║  ███╗
   ██║     ██║   ██║██║╚████║██╔══╝  ██║██║   ██║
   ╚██████╗╚██████╔╝██║ ╚███║██║     ██║╚██████╔╝
    ╚═════╝ ╚═════╝ ╚═╝  ╚══╝╚═╝     ╚═╝ ╚═════╝

   SISTEM TEMPAHAN COURT FUTSAL — TVET MARA LUMUT
   Versi: 1.1.0
   ----------------------------------------------------------------
   PANDUAN TROUBLESHOOT UNTUK DEVELOPER
   ----------------------------------------------------------------
   Untuk cari section kod dengan cepat, Ctrl+F cari label:
     [CONFIG]      — URL API & credentials
     [STATE]       — Pembolehubah global / data runtime
     [LANG]        — Terjemahan BM/EN
     [AUTH]        — Login/Logout pelajar & admin
     [BOOKING]     — Proses tempahan (3 langkah)
     [SLOTS]       — Slot masa & rendering
     [SUMMARY]     — Paparan ringkasan tempahan
     [SUBMIT]      — Hantar data ke Google Sheets ← PENTING
     [API]         — Sambungan Google Sheets / localStorage
     [STUDENT-TAB] — Tab navigasi pelajar
     [ADMIN-TAB]   — Tab navigasi admin
     [ADMIN-DATA]  — Muatkan & papar data admin
     [HISTORY]     — Sejarah tempahan pelajar
     [LANG-SWITCH] — Toggle bahasa BM/EN
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   [CONFIG] KONFIGURASI UTAMA — EDIT DI SINI
   ─────────────────────────────────────────────────────────────
   ⚠️  WAJIB ISI: Letak URL Google Apps Script deployment awak.
       Ini fix untuk masalah phone tak hantar data ke Sheets.
       URL ini akan jadi fallback kalau localStorage kosong
       (contoh: user buka dari phone baru / browser lain).

   Cara dapat URL:
   1. Buka Google Apps Script → Deploy → Manage Deployments
   2. Salin URL yang bermula dengan https://script.google.com/...
   3. Tampal dalam FIXED_API_URL di bawah

   CREDENTIALS PELAJAR (untuk tukar password atau tambah akaun):
   Format → 'NO_MATRIK': 'PASSWORD'

   CREDENTIALS ADMIN (untuk tukar username/password admin):
   ───────────────────────────────────────────────────────────── */

const FIXED_API_URL = ''; // ← TAMPAL URL APPS SCRIPT AWAK DI SINI

const DEMO_STUDENTS = {
  'TM23001': '1234',    // ← Tukar/tambah akaun pelajar di sini
  'TM23002': 'abcd',
  'TM22005': 'pass1'
};

const DEMO_NAMES = {
  'TM23001': 'Ahmad Hafiz',
  'TM23002': 'Siti Nadia',
  'TM22005': 'Muhd Zulkifli'
};

const ADMIN_CRED = {
  user: 'admin',        // ← Tukar username admin
  pass: 'admin123'      // ← Tukar password admin
};

/* ─────────────────────────────────────────────────────────────
   [CONFIG] SLOT MASA — EDIT SLOT DI SINI
   Tambah/buang slot dengan tukar array di bawah.
   Format: { slot: 'MASA_MULA - MASA_TAMAT', type: 'afternoon'/'night' }
   ───────────────────────────────────────────────────────────── */
const SLOTS_AFTERNOON = [
  { slot: '5:00pm - 6:00pm', type: 'afternoon' },
  { slot: '6:00pm - 7:00pm', type: 'afternoon' }
];
const SLOTS_NIGHT = [
  { slot: '8:00pm - 10:00pm', type: 'night' },
  { slot: '9:00pm - 11:00pm', type: 'night' }
];

/* ─────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────── */
const LANG = {
  ms: {
    ttTitle:'Futsal TVET MARA', ttSub:'Lumut, Perak',
    loginHeroTitle:'Sistem Tempahan Court', loginHeroSub:'TVET MARA Lumut — Khusus Pelajar',
    loginCardTitle:'Log Masuk Pelajar', lbMatric:'No. Matrik', lbPass:'Kata Laluan',
    btnStudentLogin:'Log Masuk', btnShowAdmin:'Log Masuk Admin',
    adminCardTitle:'Log Masuk Admin', lbAdminUser:'Nama Pengguna', lbAdminPass:'Kata Laluan Admin',
    btnAdminLogin:'Log Masuk', btnBackLogin:'← Kembali',
    demoHint:'Demo: TM23001 / 1234 | TM23002 / abcd | TM22005 / pass1',
    adminDemoHint:'Demo: admin / admin123',
    s1Title:'Pilih Court & Tarikh', cAName:'Court A', cABadge:'MELINTANG', cBName:'Court B', cBBadge:'MENEGAK',
    lbDate:'Tarikh', btnStep1Next:'Seterusnya →',
    s2Title:'Pilih Slot Masa', lblAfternoon:'Petang', lblNight:'Malam',
    durationTitle:'Pilih Tempoh Bermain', hourLabel1:'Jam', hourLabel2:'Jam',
    btnStep2Back:'← Kembali', btnStep2Next:'Seterusnya →',
    s3Title:'Sahkan Tempahan', shLabel:'Butiran Tempahan',
    btnStep3Back:'← Kembali', btnSubmit:'Sahkan & Tempah',
    navBookLabel:'Tempah', navHistoryLabel:'Sejarah', navSetupLabel:'Tetapan', navLogoutLabel:'Keluar',
    adminTabDash:'Dashboard', adminTabBook:'Tempahan', adminTabSetup:'API',
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
    tCourt:'Court', tDate:'Tarikh', tSlot:'Slot Masa', tDuration:'Tempoh', tMatric:'No. Matrik', tStatus:'Status',
    active:'Aktif', cancelled:'Dibatal',
    noBooking:'Tiada tempahan dijumpai.',
    successBook:'Tempahan berjaya! ID: ', errorApi:'Sila tetapkan URL API dahulu.',
    errorFill:'Sila isi semua maklumat.',
    errorLogin:'No. Matrik atau kata laluan tidak betul.',
    errorAdminLogin:'Nama pengguna atau kata laluan admin tidak betul.',
    cancelConfirm:'Batalkan tempahan ini?',
    cancelSuccess:'Tempahan dibatalkan.',
    saving:'Menyimpan...', loading:'Memuatkan...',
    urlSaved:'URL disimpan!', testOk:'Sambungan berjaya!', testFail:'Gagal sambung. Semak URL.',
    history:'Sejarah Tempahan', myHistory:'Tempahan Saya',
    hour:'jam', hours:'jam',
    demoMode:'(Mode Demo — Data tidak disimpan ke Google Sheets. Tetapkan URL API untuk sambungan sebenar.)',
    courtA_long:'Court A — Melintang', courtB_long:'Court B — Menegak',
    horizontal:'Melintang', vertical:'Menegak',
    action:'Tindakan', cancel:'Batal',
    thMatric:'No. Matrik', thCourt:'Court', thDate:'Tarikh', thSlot:'Slot', thDuration:'Tempoh', thStatus:'Status', thAction:'Tindakan',
    btnCancel:'Batal',
    confirm:'Sahkan',
    slotAfternoonInfo:'1 jam — petang', slotNightInfo:'2 jam — pilih tempoh',
  },
  en: {
    ttTitle:'Futsal TVET MARA', ttSub:'Lumut, Perak',
    loginHeroTitle:'Court Booking System', loginHeroSub:'TVET MARA Lumut — Students Only',
    loginCardTitle:'Student Login', lbMatric:'Matric Number', lbPass:'Password',
    btnStudentLogin:'Login', btnShowAdmin:'Admin Login',
    adminCardTitle:'Admin Login', lbAdminUser:'Username', lbAdminPass:'Admin Password',
    btnAdminLogin:'Login', btnBackLogin:'← Back',
    demoHint:'Demo: TM23001 / 1234 | TM23002 / abcd | TM22005 / pass1',
    adminDemoHint:'Demo: admin / admin123',
    s1Title:'Select Court & Date', cAName:'Court A', cABadge:'HORIZONTAL', cBName:'Court B', cBBadge:'VERTICAL',
    lbDate:'Date', btnStep1Next:'Next →',
    s2Title:'Select Time Slot', lblAfternoon:'Afternoon', lblNight:'Night',
    durationTitle:'Select Playing Duration', hourLabel1:'Hour', hourLabel2:'Hours',
    btnStep2Back:'← Back', btnStep2Next:'Next →',
    s3Title:'Confirm Booking', shLabel:'Booking Details',
    btnStep3Back:'← Back', btnSubmit:'Confirm & Book',
    navBookLabel:'Book', navHistoryLabel:'History', navSetupLabel:'Settings', navLogoutLabel:'Logout',
    adminTabDash:'Dashboard', adminTabBook:'Bookings', adminTabSetup:'API',
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
    setupStep5:'Copy the deployment URL → paste in the URL box above → click Save',
    scriptLabel:'APPS SCRIPT CODE:',
    sl1:'Court', sl2:'Time', sl3:'Confirm',
    tCourt:'Court', tDate:'Date', tSlot:'Time Slot', tDuration:'Duration', tMatric:'Matric No', tStatus:'Status',
    active:'Active', cancelled:'Cancelled',
    noBooking:'No bookings found.',
    successBook:'Booking successful! ID: ', errorApi:'Please set up API URL first.',
    errorFill:'Please fill in all fields.',
    errorLogin:'Wrong matric number or password.',
    errorAdminLogin:'Wrong admin credentials.',
    cancelConfirm:'Cancel this booking?',
    cancelSuccess:'Booking cancelled.',
    saving:'Saving...', loading:'Loading...',
    urlSaved:'URL saved!', testOk:'Connection successful!', testFail:'Failed to connect. Check URL.',
    history:'Booking History', myHistory:'My Bookings',
    hour:'hour', hours:'hours',
    demoMode:'(Demo Mode — Data not saved to Google Sheets. Set API URL for real connection.)',
    courtA_long:'Court A — Horizontal', courtB_long:'Court B — Vertical',
    horizontal:'Horizontal', vertical:'Vertical',
    action:'Action', cancel:'Cancel',
    thMatric:'Matric No', thCourt:'Court', thDate:'Date', thSlot:'Slot', thDuration:'Duration', thStatus:'Status', thAction:'Action',
    btnCancel:'Cancel',
    confirm:'Confirm',
    slotAfternoonInfo:'1 hour — afternoon', slotNightInfo:'2 hours — choose duration',
  }
};

/* ─────────────────────────────────────────────────────────────
   [STATE] PEMBOLEHUBAH GLOBAL — JANGAN EDIT
   Runtime state yang berubah semasa sistem berjalan.
   ───────────────────────────────────────────────────────────── */
let lang = 'ms';
let currentUser = null;
let isAdmin = false;
let selectedCourt = null;
let selectedSlot = null;
let selectedSlotType = null; // 'afternoon' | 'night'
let selectedDuration = 1;
let bookings = [];
let currentAdminFilter = 'all';
let currentAdminTab = 'dashboard';
let currentStudentTab = 'book';

/* ---------------------------------------------------------
   [LANG-SWITCH] TOGGLE BAHASA BM/EN
   --------------------------------------------------------- */
function setLang(l) {
  lang = l;
  document.getElementById('btnLangMs').classList.toggle('active', l === 'ms');
  document.getElementById('btnLangEn').classList.toggle('active', l === 'en');
  applyLang();
}

function applyLang() {
  const t = LANG[lang];
  const ids = Object.keys(t);
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT') el.placeholder = t[id];
    else if (['setupStep1','setupStep2','setupStep3','setupStep4','setupStep5'].includes(id)) el.innerHTML = t[id];
    else el.textContent = t[id];
  });
  // step labels data attributes
  ['sl1','sl2','sl3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = t[id];
  });
  if (currentUser && !isAdmin) renderSlots();
}

function t(key) { return LANG[lang][key] || key; }

/* ---------------------------------------------------------
   [API] SAMBUNGAN GOOGLE SHEETS
   getApiUrl() — Ambil URL ikut keutamaan:
     1. localStorage (dari Setup tab — per device)
     2. FIXED_API_URL (hardcode dalam [CONFIG] — semua device)
   FIX: Phone tak perlu setup manual lagi.
   --------------------------------------------------------- */
function getApiUrl() {
  return localStorage.getItem("futsalApiUrl") || FIXED_API_URL || "";
}
function setApiUrl(url) { localStorage.setItem("futsalApiUrl", url); }

/* ---------------------------------------------------------
   UTILS — Helper functions
   --------------------------------------------------------- */
function showAlert(elId, msg, type="danger") {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if(el) el.innerHTML = ""; }, 4000);
}
function clearAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = "";
}

function getBookedSlots(court, date) {
  return bookings.filter(b => b.Court === court && b.Date === date && b.Status === "Active").map(b => b.Slot);
}

/* ---------------------------------------------------------
   [AUTH] LOGIN & LOGOUT
   - doStudentLogin()  — Semak matric & password pelajar
   - doAdminLogin()    — Semak credentials admin
   - doLogout()        — Reset semua state & balik ke login
   TROUBLESHOOT: Kalau login fail, check DEMO_STUDENTS & ADMIN_CRED dalam [CONFIG]
   --------------------------------------------------------- */
function showScreen(id) {
  ['screenLogin','screenStudent','screenAdmin'].forEach(s => {
    document.getElementById(s).classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function showAdminLogin() {
  document.getElementById('studentLoginCard').style.display = 'none';
  document.getElementById('adminLoginCard').style.display = 'block';
}
function hideAdminLogin() {
  document.getElementById('adminLoginCard').style.display = 'none';
  document.getElementById('studentLoginCard').style.display = 'block';
}

function doStudentLogin() {
  const matric = document.getElementById('inMatric').value.trim().toUpperCase();
  const pass = document.getElementById('inPass').value;
  clearAlert('loginAlert');
  if (!matric || !pass) { showAlert('loginAlert', t('errorFill')); return; }
  if (DEMO_STUDENTS[matric] && DEMO_STUDENTS[matric] === pass) {
    currentUser = matric; isAdmin = false;
    document.getElementById('userAvatar').textContent = matric.slice(-2);
    document.getElementById('userChipName').textContent = matric;
    document.getElementById('userChip').style.display = 'flex';
    showScreen('screenStudent');
    goToStep1();
    loadStudentBookings();
  } else {
    showAlert('loginAlert', t('errorLogin'));
  }
}

function doAdminLogin() {
  const u = document.getElementById('inAdminUser').value.trim();
  const p = document.getElementById('inAdminPass').value;
  clearAlert('adminAlert');
  if (u === ADMIN_CRED.user && p === ADMIN_CRED.pass) {
    currentUser = 'admin'; isAdmin = true;
    document.getElementById('userAvatar').textContent = 'AD';
    document.getElementById('userChipName').textContent = 'Admin';
    document.getElementById('userChip').style.display = 'flex';
    showScreen('screenAdmin');
    loadAdminData();
    const savedUrl = getApiUrl();
    if (savedUrl) document.getElementById('inApiUrl').value = savedUrl;
  } else {
    showAlert('adminAlert', t('errorAdminLogin'));
  }
}

function doLogout() {
  currentUser = null; isAdmin = false;
  selectedCourt = null; selectedSlot = null; selectedSlotType = null;
  document.getElementById('userChip').style.display = 'none';
  document.getElementById('inMatric').value = '';
  document.getElementById('inPass').value = '';
  document.getElementById('inAdminUser').value = '';
  document.getElementById('inAdminPass').value = '';
  clearAlert('loginAlert'); clearAlert('adminAlert');
  hideAdminLogin();
  showScreen('screenLogin');
}

/* ---------------------------------------------------------
   [BOOKING] PILIH COURT
   --------------------------------------------------------- */
function selectCourt(c) {
  selectedCourt = c;
  document.getElementById('courtCardA').classList.toggle('selected', c === 'A');
  document.getElementById('courtCardB').classList.toggle('selected', c === 'B');
}

/* ---------------------------------------------------------
   [BOOKING] NAVIGASI LANGKAH 1→2→3
   --------------------------------------------------------- */
function updateStepBar(step) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById('sc' + i);
    const label = document.getElementById('sl' + i);
    circle.classList.remove('active','done');
    label.classList.remove('active','done');
    if (i < step) { circle.classList.add('done'); circle.innerHTML = '✓'; label.classList.add('done'); }
    else if (i === step) { circle.classList.add('active'); circle.textContent = i; label.classList.add('active'); }
    else { circle.textContent = i; }
  }
  document.getElementById('sline1').classList.toggle('done', step > 1);
  document.getElementById('sline2').classList.toggle('done', step > 2);
}

function goToStep1() {
  document.getElementById('step1Div').style.display = 'block';
  document.getElementById('step2Div').style.display = 'none';
  document.getElementById('step3Div').style.display = 'none';
  updateStepBar(1);
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('inDate');
  dateEl.min = today;
  if (!dateEl.value || dateEl.value < today) dateEl.value = today;
}

function goToStep2() {
  clearAlert('s1Alert');
  if (!selectedCourt) { showAlert('s1Alert', lang === 'ms' ? 'Sila pilih court terlebih dahulu.' : 'Please select a court first.', 'warning'); return; }
  if (!document.getElementById('inDate').value) { showAlert('s1Alert', lang === 'ms' ? 'Sila pilih tarikh.' : 'Please select a date.', 'warning'); return; }
  document.getElementById('step1Div').style.display = 'none';
  document.getElementById('step2Div').style.display = 'block';
  document.getElementById('step3Div').style.display = 'none';
  document.getElementById('selectedCourtLabel').textContent = 'Court ' + selectedCourt + ' — ' + (selectedCourt === 'A' ? t('horizontal') : t('vertical'));
  updateStepBar(2);
  renderSlots();
}

function goToStep3() {
  clearAlert('s2Alert');
  if (!selectedSlot) { showAlert('s2Alert', lang === 'ms' ? 'Sila pilih slot masa.' : 'Please select a time slot.', 'warning'); return; }
  document.getElementById('step1Div').style.display = 'none';
  document.getElementById('step2Div').style.display = 'none';
  document.getElementById('step3Div').style.display = 'block';
  updateStepBar(3);
  renderSummary();
}

/* ---------------------------------------------------------
   [SLOTS] RENDER SLOT MASA
   TROUBLESHOOT: Slot tak muncul → check SLOTS_AFTERNOON
   & SLOTS_NIGHT dalam [CONFIG]
   --------------------------------------------------------- */
function renderSlots() {
  const court = selectedCourt;
  const date = document.getElementById('inDate').value;
  const booked = court && date ? getBookedSlots(court, date) : [];

  const afGrid = document.getElementById('slotGridAfternoon');
  const nightGrid = document.getElementById('slotGridNight');
  afGrid.innerHTML = '';
  nightGrid.innerHTML = '';

  SLOTS_AFTERNOON.forEach(s => {
    const isBooked = booked.includes(s.slot);
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (selectedSlot === s.slot ? ' selected' : '');
    btn.disabled = isBooked;
    btn.innerHTML = s.slot.replace(' - ','<br>') + `<span class="slot-tag">${t('slotAfternoonInfo')}</span>`;
    if (!isBooked) btn.onclick = () => selectSlot(s.slot, 'afternoon');
    afGrid.appendChild(btn);
  });

  SLOTS_NIGHT.forEach(s => {
    const isBooked = booked.includes(s.slot);
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (selectedSlot === s.slot ? ' selected' : '');
    btn.disabled = isBooked;
    btn.innerHTML = s.slot.replace(' - ','<br>') + `<span class="slot-tag">${t('slotNightInfo')}</span>`;
    if (!isBooked) btn.onclick = () => selectSlot(s.slot, 'night');
    nightGrid.appendChild(btn);
  });
}

function selectSlot(slot, type) {
  selectedSlot = slot;
  selectedSlotType = type;
  if (type !== 'night') { selectedDuration = 1; document.getElementById('durationBox').style.display = 'none'; }
  else { document.getElementById('durationBox').style.display = 'block'; }
  renderSlots();
}

function setDuration(d) {
  selectedDuration = d;
  document.getElementById('btn1h').classList.toggle('selected', d === 1);
  document.getElementById('btn2h').classList.toggle('selected', d === 2);
}

/* ---------------------------------------------------------
   [SUMMARY] PAPARAN RINGKASAN SEBELUM CONFIRM
   --------------------------------------------------------- */
function renderSummary() {
  const date = document.getElementById('inDate').value;
  const durText = selectedSlotType === 'night'
    ? `${selectedDuration} ${selectedDuration === 1 ? t('hour') : t('hours')}`
    : `1 ${t('hour')}`;
  const courtLabel = selectedCourt === 'A' ? t('courtA_long') : t('courtB_long');
  document.getElementById('shValue').textContent = courtLabel + ' • ' + date;
  document.getElementById('summaryTable').innerHTML = `
    <tr><td>${t('tMatric')}</td><td>${currentUser}</td></tr>
    <tr><td>${t('tCourt')}</td><td>${courtLabel}</td></tr>
    <tr><td>${t('tDate')}</td><td>${date}</td></tr>
    <tr><td>${t('tSlot')}</td><td>${selectedSlot}</td></tr>
    <tr><td>${t('tDuration')}</td><td>${durText}</td></tr>
  `;
}

/* ---------------------------------------------------------
   [SUBMIT] HANTAR TEMPAHAN KE GOOGLE SHEETS
   Fungsi utama untuk submit booking.
   FIX: Tambah Content-Type header supaya Apps Script
        boleh parse JSON body dengan betul (terutama mobile).
   TROUBLESHOOT:
     - "Gagal sambung" → URL salah atau Apps Script tak deploy
     - "Error: Unknown" → Apps Script ada bug, semak doPost()
     - Data masuk local tapi tak ke Sheets → getApiUrl() kosong,
       check FIXED_API_URL dalam [CONFIG]
   --------------------------------------------------------- */
async function submitBooking() {
  clearAlert('s3Alert');
  const date = document.getElementById('inDate').value;
  const dur = selectedSlotType === 'night' ? selectedDuration : 1;
  const payload = {
    action: 'add',
    matric: currentUser,
    name: DEMO_NAMES[currentUser] || currentUser,
    court: selectedCourt,
    date: date,
    slot: selectedSlot,
    duration: dur
  };
  const apiUrl = getApiUrl();
  const id = 'BK' + Date.now();
  const newBooking = {
    ID: id, Matric: currentUser, Name: DEMO_NAMES[currentUser] || currentUser,
    Court: selectedCourt, Date: date, Slot: selectedSlot, Duration: dur,
    Status: 'Active', Timestamp: new Date().toLocaleString('ms-MY')
  };

  // Tiada URL — mode demo sahaja
  if (!apiUrl) {
    bookings.push(newBooking);
    showAlert('s3Alert', t('successBook') + id + '<br><small style="opacity:.8;">' + t('demoMode') + '</small>', 'success');
    setTimeout(() => { resetBookingForm(); }, 3000);
    return;
  }

  showAlert('s3Alert', t('saving'), 'info');
  try {
    // FIX: Content-Type header wajib ada supaya Apps Script parse JSON betul
   // BETUL — Apps Script boleh parse tanpa header ni
const res = await fetch(apiUrl, {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: { 'Content-Type': 'application/json' },
});
    const data = await res.json();
    if (data.success) {
      newBooking.ID = data.id || id;
      bookings.push(newBooking);
      showAlert('s3Alert', t('successBook') + newBooking.ID, 'success');
      setTimeout(() => { resetBookingForm(); }, 3000);
    } else {
      showAlert('s3Alert', 'Error: ' + (data.error || 'Unknown'));
    }
  } catch(e) {
    console.error('[SUBMIT] Fetch error:', e);
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

/* ---------------------------------------------------------
   [STUDENT-TAB] NAVIGASI TAB PELAJAR (Tempah/Sejarah/Tetapan)
   --------------------------------------------------------- */
function showStudentTab(tab) {
  currentStudentTab = tab;
  ['book','history','setup'].forEach(t => {
    document.getElementById('nav' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
  });

  if (tab === 'book') {
    document.getElementById('stepBar').style.display = 'flex';
    document.getElementById('step1Div').style.display = 'block';
    document.getElementById('step2Div').style.display = 'none';
    document.getElementById('step3Div').style.display = 'none';
    document.getElementById('historyCard').style.display = 'none';
    document.getElementById('setupCard').style.display = 'none';
  } else if (tab === 'history') {
    document.getElementById('stepBar').style.display = 'none';
    document.getElementById('step1Div').style.display = 'none';
    document.getElementById('step2Div').style.display = 'none';
    document.getElementById('step3Div').style.display = 'none';
    document.getElementById('historyCard').style.display = 'block';
    document.getElementById('setupCard').style.display = 'none';
    renderStudentHistory();
  } else if (tab === 'setup') {
    document.getElementById('stepBar').style.display = 'none';
    document.getElementById('step1Div').style.display = 'none';
    document.getElementById('step2Div').style.display = 'none';
    document.getElementById('step3Div').style.display = 'none';
    document.getElementById('historyCard').style.display = 'none';
    document.getElementById('setupCard').style.display = 'block';
    const savedUrl = getApiUrl();
    if (savedUrl) document.getElementById('inApiUrlStudent').value = savedUrl;
  }
}

function loadStudentBookings() {
  const apiUrl = getApiUrl();
  if (!apiUrl) return;
  fetch(apiUrl + '?action=get&matric=' + currentUser)
    .then(r => r.json())
    .then(data => {
      if (data.success && data.data) {
        const existing = bookings.map(b => b.ID);
        data.data.forEach(b => { if (!existing.includes(b.ID)) bookings.push(b); });
      }
    }).catch(() => {});
}

/* ---------------------------------------------------------
   [HISTORY] SEJARAH TEMPAHAN PELAJAR
   --------------------------------------------------------- */
function renderStudentHistory() {
  const myBookings = bookings.filter(b => b.Matric === currentUser).reverse();
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
    try { await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', id }) }); } catch(e) {}
  }
  renderStudentHistory();
}

/* ---------------------------------------------------------
   [ADMIN-TAB] NAVIGASI TAB ADMIN (Dashboard/Tempahan/API)
   --------------------------------------------------------- */
function switchAdminTab(tab) {
  currentAdminTab = tab;
  document.getElementById('adminDashboard').style.display = tab === 'dashboard' ? 'block' : 'none';
  document.getElementById('adminBookings').style.display = tab === 'bookings' ? 'block' : 'none';
  document.getElementById('adminSetupPanel').style.display = tab === 'setup' ? 'block' : 'none';

  ['Dash','Book','Setup'].forEach(k => {
    const key = { Dash:'dashboard', Book:'bookings', Setup:'setup' }[k];
    document.getElementById('adminTab' + k).classList.toggle('active', key === tab);
    document.getElementById('adminNav' + k).classList.toggle('active', key === tab);
  });

  if (tab === 'setup') {
    const savedUrl = getApiUrl();
    if (savedUrl) document.getElementById('inApiUrl').value = savedUrl;
  }
  if (tab === 'bookings') renderAdminBookingsFull();
}

/* ---------------------------------------------------------
   [ADMIN-DATA] MUATKAN & PAPAR DATA ADMIN
   TROUBLESHOOT: Data tak muncul → check getApiUrl()
   --------------------------------------------------------- */
async function loadAdminData() {
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl + '?action=get');
      const data = await res.json();
      if (data.success && data.data) bookings = data.data;
    } catch(e) {}
  }
  updateAdminStats();
  renderAdminRecent();
  if (currentAdminTab === 'bookings') renderAdminBookingsFull();
}

function updateAdminStats() {
  document.getElementById('statTotal').textContent = bookings.length;
  document.getElementById('statActive').textContent = bookings.filter(b => b.Status === 'Active').length;
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
        <th>${t('thMatric')}</th><th>${t('thCourt')}</th>
        <th>${t('thDate')}</th><th>${t('thSlot')}</th><th>${t('thStatus')}</th>
      </tr></thead>
      <tbody>${recent.map(b => `<tr>
        <td><strong>${b.Matric}</strong></td>
        <td>Court ${b.Court}</td>
        <td>${b.Date}</td>
        <td style="font-size:11px;">${b.Slot}</td>
        <td><span class="badge badge-${b.Status === 'Active' ? 'active' : 'cancelled'}">${b.Status === 'Active' ? t('active') : t('cancelled')}</span></td>
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
  if (currentAdminFilter === 'Active') filtered = filtered.filter(b => b.Status === 'Active');
  else if (currentAdminFilter === 'Cancelled') filtered = filtered.filter(b => b.Status === 'Cancelled');
  else if (currentAdminFilter === 'A') filtered = filtered.filter(b => b.Court === 'A');
  else if (currentAdminFilter === 'B') filtered = filtered.filter(b => b.Court === 'B');

  const el = document.getElementById('adminBookingsFull');
  if (!filtered.length) {
    el.innerHTML = `<div class="empty-state" style="padding:24px 0;"><p>${t('noBooking')}</p></div>`;
    return;
  }
  el.innerHTML = `<div style="overflow-x:auto;">
    <table class="data-table">
      <thead><tr>
        <th>${t('thMatric')}</th><th>${t('thCourt')}</th>
        <th>${t('thDate')}</th><th>${t('thSlot')}</th>
        <th>${t('thDuration')}</th><th>${t('thStatus')}</th><th>${t('thAction')}</th>
      </tr></thead>
      <tbody>${filtered.map(b => `<tr>
        <td><strong>${b.Matric}</strong><br><small style="color:var(--gray-400);font-size:10px;">${b.Name || ''}</small></td>
        <td>Court ${b.Court}</td>
        <td>${b.Date}</td>
        <td style="font-size:11px;">${b.Slot}</td>
        <td>${b.Duration}${b.Duration==1?t('hour').charAt(0):t('hours').charAt(0)}</td>
        <td><span class="badge badge-${b.Status === 'Active' ? 'active' : 'cancelled'}">${b.Status === 'Active' ? t('active') : t('cancelled')}</span></td>
        <td>${b.Status === 'Active' ? `<button class="btn-danger-sm" onclick="adminCancelBooking('${b.ID}')">${t('btnCancel')}</button>` : '—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

async function adminCancelBooking(id) {
  if (!confirm(t('cancelConfirm'))) return;
  const b = bookings.find(x => x.ID === id);
  if (b) b.Status = 'Cancelled';
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try { await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', id }) }); } catch(e) {}
  }
  updateAdminStats();
  renderAdminRecent();
  renderAdminBookingsFull();
}

/* ---------------------------------------------------------
   [API] SIMPAN & TEST URL APPS SCRIPT
   --------------------------------------------------------- */
function saveApiUrl() {
  const url = (document.getElementById('inApiUrl') || document.getElementById('inApiUrlStudent')).value.trim();
  setApiUrl(url);
  showAlert('apiAlert', t('urlSaved'), 'success');
  // sync both inputs
  if (document.getElementById('inApiUrl')) document.getElementById('inApiUrl').value = url;
  if (document.getElementById('inApiUrlStudent')) document.getElementById('inApiUrlStudent').value = url;
}

function saveApiUrlStudent() {
  const url = document.getElementById('inApiUrlStudent').value.trim();
  setApiUrl(url);
  showAlert('apiAlertStudent', t('urlSaved'), 'success');
  if (document.getElementById('inApiUrl')) document.getElementById('inApiUrl').value = url;
}

async function testApi() {
  const url = document.getElementById('inApiUrl').value.trim();
  if (!url) { showAlert('apiAlert', t('errorApi'), 'warning'); return; }
  showAlert('apiAlert', t('loading'), 'info');
  try {
    const res = await fetch(url + '?action=get');
    const data = await res.json();
    if (data.success !== undefined) showAlert('apiAlert', t('testOk'), 'success');
    else showAlert('apiAlert', t('testFail'));
  } catch(e) {
    showAlert('apiAlert', t('testFail'));
  }
}

async function testApiStudent() {
  const url = document.getElementById('inApiUrlStudent').value.trim();
  if (!url) { showAlert('apiAlertStudent', t('errorApi'), 'warning'); return; }
  showAlert('apiAlertStudent', t('loading'), 'info');
  try {
    const res = await fetch(url + '?action=get');
    const data = await res.json();
    if (data.success !== undefined) showAlert('apiAlertStudent', t('testOk'), 'success');
    else showAlert('apiAlertStudent', t('testFail'));
  } catch(e) {
    showAlert('apiAlertStudent', t('testFail'));
  }
}

function copyScript() {
  const code = document.getElementById('appsScriptCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btnCopyScript');
    const prev = btn.textContent;
    btn.textContent = lang === 'ms' ? 'Disalin!' : 'Copied!';
    setTimeout(() => { btn.textContent = prev; }, 2000);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = code; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    const btn = document.getElementById('btnCopyScript');
    const prev = btn.textContent;
    btn.textContent = lang === 'ms' ? 'Disalin!' : 'Copied!';
    setTimeout(() => { btn.textContent = prev; }, 2000);
  });
}

/* ---------------------------------------------------------
   INIT — Inject panel History & Setup ke dalam screenStudent
   Juga set tarikh default & data demo
   --------------------------------------------------------- */
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
    </div>
    <div class="card" style="margin-top:0;">
      <div class="card-header">
        <div class="card-title">Kod Apps Script</div>
        <button class="copy-btn" onclick="copyScript()">Salin Kod</button>
      </div>
      <div class="code-block" style="font-size:10px;">const SHEET_NAME = 'Bookings';
// Lihat kod penuh di panel Admin → API</div>
    </div>`;
  container.appendChild(setupCard);

  // set today date
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('inDate');
  dateEl.min = today;
  dateEl.value = today;

  // add saved demo bookings
  bookings.push(
    { ID:'BK_DEMO1', Matric:'TM23001', Name:'Ahmad Hafiz', Court:'A', Date: today, Slot:'5:00pm - 6:00pm', Duration:1, Status:'Active', Timestamp:'' },
    { ID:'BK_DEMO2', Matric:'TM23002', Name:'Siti Nadia',  Court:'B', Date: today, Slot:'8:00pm - 10:00pm', Duration:2, Status:'Active', Timestamp:'' }
  );

  const savedUrl = getApiUrl();
  if (savedUrl) {
    document.getElementById('inApiUrl').value = savedUrl;
  }

  document.getElementById('inDate').addEventListener('change', () => {
    selectedSlot = null;
    if (document.getElementById('step2Div').style.display !== 'none') renderSlots();
  });
});