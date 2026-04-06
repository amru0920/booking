/* ================================================================
   SISTEM TEMPAHAN COURT FUTSAL — TVET MARA LUMUT
   app.js — v2.1
   ================================================================
   PANDUAN TROUBLESHOOT — Ctrl+F cari label:
     [CONFIG]     — URL API & credentials admin
     [STATE]      — Pembolehubah global
     [LANG]       — Translations BM/EN
     [API]        — getApiUrl & setApiUrl
     [UTILS]      — showAlert, clearAlert, tr()
     [AUTH]       — Login pelajar, admin, logout
     [CHANGEPASS] — Tukar password first login
     [BOOKING]    — Pilih court, navigasi langkah
     [SLOTS]      — Render slot masa
     [SUMMARY]    — Ringkasan tempahan
     [SUBMIT]     — Hantar booking ke Sheets
     [STUDENT-TAB]— Tab pelajar
     [HISTORY]    — Sejarah tempahan pelajar
     [ADMIN-TAB]  — Tab admin
     [ADMIN-DATA] — Load & papar data admin
     [ADMIN-STU]  — Urus data pelajar (admin)
     [SETUP]      — Simpan & test URL API
     [INIT]       — DOMContentLoaded setup
   ================================================================ */

/* ─────────────────────────────────────────
   [CONFIG] KONFIGURASI UTAMA
   ⚠️  Tukar FIXED_API_URL dengan URL Apps Script baharu selepas deploy
   ───────────────────────────────────────── */
const FIXED_API_URL = 'https://script.google.com/macros/s/AKfycbz_UKUkDw6nOP0ZM2ZSNu94aGQccKBezIeQwzWz2fFHpmnj5eTWaClqy4ntDRSwi8kzvA/exec';

const ADMIN_CRED = {
  user: 'admin',    // ← Tukar username admin
  pass: 'admin123'  // ← Tukar password admin
};

const SLOTS_AFTERNOON = [
  { slot: '5:00pm - 6:00pm', type: 'afternoon' },
  { slot: '6:00pm - 7:00pm', type: 'afternoon' }
];
const SLOTS_NIGHT = [
  { slot: '8:00pm - 10:00pm', type: 'night' },
  { slot: '9:00pm - 11:00pm', type: 'night' }
];

/* ─────────────────────────────────────────
   [STATE] PEMBOLEHUBAH GLOBAL
   ───────────────────────────────────────── */
let lang             = 'ms';
let currentUser      = null;
let currentUserName  = null;
let isAdmin          = false;
let selectedCourt    = null;
let selectedSlot     = null;
let selectedSlotType = null;   // 'afternoon' | 'night'
let selectedDuration = 1;
let bookings         = [];
let currentAdminFilter = 'all';
let currentAdminTab    = 'dashboard';

/* ─────────────────────────────────────────
   [LANG] TRANSLATIONS BM / EN
   ───────────────────────────────────────── */
const T = {
  ms: {
    sl1: 'Court', sl2: 'Masa', sl3: 'Sahkan',
    horizontal: 'Melintang', vertical: 'Menegak',
    courtA_long: 'Court A — Melintang', courtB_long: 'Court B — Menegak',
    hour: 'jam', hours: 'jam',
    tMatric: 'No. IC', thNama: 'Nama', tCourt: 'Court',
    tDate: 'Tarikh', tSlot: 'Slot', tDuration: 'Tempoh',
    thIC: 'No. IC', thCourt: 'Court', thDate: 'Tarikh',
    thSlot: 'Slot', thStatus: 'Status', thAction: 'Tindakan',
    active: 'Aktif', cancelled: 'Dibatal',
    btnCancel: 'Batal',
    noBooking: 'Tiada tempahan.',
    loading: 'Memuatkan...', saving: 'Menyimpan...',
    errorFill: 'Sila isi semua maklumat.',
    errorLogin: 'No. IC atau kata laluan tidak betul.',
    cancelConfirm: 'Batalkan tempahan ini?',
    successBook: 'Tempahan berjaya! ID: ',
    slotAfternoonInfo: '1 jam', slotNightInfo: '2 jam',
    cpErrorShort: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
    cpErrorMatch: 'Kata laluan tidak sepadan.',
    cpErrorSameAsDefault: 'Pilih kata laluan berbeza dari lalai.',
    cpSuccess: 'Kata laluan berjaya ditukar!',
    urlSaved: 'URL disimpan!',
    testOk: 'Sambungan berjaya! ✓',
    testFail: 'Gagal sambung. Semak URL.',
    resetPassConfirm: 'Reset kata laluan kepada "tvetmara"?',
    resetPassSuccess: 'Kata laluan berjaya direset.',
    noStudents: 'Tiada pelajar dalam sistem.',
    importSuccess: 'berjaya diimport.',
    importSkipped: 'dilepaskan (IC dah wujud).',
    mustChangeYes: 'Perlu Tukar', mustChangeNo: 'OK',
  },
  en: {
    sl1: 'Court', sl2: 'Time', sl3: 'Confirm',
    horizontal: 'Horizontal', vertical: 'Vertical',
    courtA_long: 'Court A — Horizontal', courtB_long: 'Court B — Vertical',
    hour: 'hour', hours: 'hours',
    tMatric: 'IC No', thNama: 'Name', tCourt: 'Court',
    tDate: 'Date', tSlot: 'Slot', tDuration: 'Duration',
    thIC: 'IC No', thCourt: 'Court', thDate: 'Date',
    thSlot: 'Slot', thStatus: 'Status', thAction: 'Action',
    active: 'Active', cancelled: 'Cancelled',
    btnCancel: 'Cancel',
    noBooking: 'No bookings found.',
    loading: 'Loading...', saving: 'Saving...',
    errorFill: 'Please fill in all fields.',
    errorLogin: 'Wrong IC or password.',
    cancelConfirm: 'Cancel this booking?',
    successBook: 'Booking successful! ID: ',
    slotAfternoonInfo: '1 hour', slotNightInfo: '2 hours',
    cpErrorShort: 'Password must be at least 6 characters.',
    cpErrorMatch: 'Passwords do not match.',
    cpErrorSameAsDefault: 'Please choose a different password.',
    cpSuccess: 'Password changed successfully!',
    urlSaved: 'URL saved!',
    testOk: 'Connection OK! ✓',
    testFail: 'Connection failed. Check URL.',
    resetPassConfirm: 'Reset password to "tvetmara"?',
    resetPassSuccess: 'Password reset successfully.',
    noStudents: 'No students in system.',
    importSuccess: 'imported.',
    importSkipped: 'skipped (IC exists).',
    mustChangeYes: 'Must Change', mustChangeNo: 'OK',
  }
};

/* ─────────────────────────────────────────
   [API] SAMBUNGAN GOOGLE SHEETS
   ───────────────────────────────────────── */
function getApiUrl() {
  return localStorage.getItem('futsalApiUrl') || FIXED_API_URL || '';
}
function setApiUrl(url) {
  localStorage.setItem('futsalApiUrl', url);
}

/* ─────────────────────────────────────────
   [UTILS] UTILITI AM
   ───────────────────────────────────────── */
function tr(key) {
  return T[lang][key] || key;
}

function showAlert(id, msg, type = 'danger') {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  if (type !== 'info') {
    setTimeout(() => { if (el) el.innerHTML = ''; }, 5000);
  }
}

function clearAlert(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

function getBookedSlots(court, date) {
  return bookings
    .filter(b => b.Court === court && b.Date === date && b.Status === 'Active')
    .map(b => b.Slot);
}

/* ─────────────────────────────────────────
   [LANG] TOGGLE BAHASA
   ───────────────────────────────────────── */
function setLang(l) {
  lang = l;
  document.getElementById('btnLangMs').classList.toggle('active', l === 'ms');
  document.getElementById('btnLangEn').classList.toggle('active', l === 'en');
  // Update step labels
  ['sl1', 'sl2', 'sl3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = T[l][id];
  });
  if (currentUser && !isAdmin) renderSlots();
}

/* ─────────────────────────────────────────
   SCREEN MANAGER
   ───────────────────────────────────────── */
function showScreen(id) {
  ['screenLogin', 'screenChangePass', 'screenStudent', 'screenAdmin'].forEach(s => {
    document.getElementById(s).classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

/* ─────────────────────────────────────────
   [AUTH] LOGIN PELAJAR
   ───────────────────────────────────────── */
function showAdminLogin() {
  document.getElementById('studentLoginCard').style.display = 'none';
  document.getElementById('adminLoginCard').style.display  = 'block';
}

function hideAdminLogin() {
  document.getElementById('adminLoginCard').style.display  = 'none';
  document.getElementById('studentLoginCard').style.display = 'block';
}

async function doStudentLogin() {
  const ic   = document.getElementById('inMatric').value.trim();
  const pass = document.getElementById('inPass').value.trim();
  clearAlert('loginAlert');

  if (!ic || !pass) { showAlert('loginAlert', tr('errorFill'), 'warning'); return; }

  const apiUrl = getApiUrl();
  if (!apiUrl) {
    showAlert('loginAlert', 'URL API belum dikonfigurasi. Hubungi admin.', 'warning');
    return;
  }

  showAlert('loginAlert', tr('loading'), 'info');
  try {
    const url  = `${apiUrl}?action=loginStudent&ic=${encodeURIComponent(ic)}&pass=${encodeURIComponent(pass)}`;
    const res  = await fetch(url, { method: 'GET' });
    const data = await res.json();

    if (!data.success) { showAlert('loginAlert', data.error || tr('errorLogin')); return; }

    currentUser     = data.ic;
    currentUserName = data.nama;
    isAdmin         = false;
    document.getElementById('userAvatar').textContent   = data.nama.charAt(0).toUpperCase();
    document.getElementById('userChipName').textContent = data.nama.split(' ')[0];
    document.getElementById('userChip').style.display  = 'flex';
    clearAlert('loginAlert');

    if (data.mustChangePass) {
      document.getElementById('cpUserName').textContent = data.nama;
      showScreen('screenChangePass');
    } else {
      showScreen('screenStudent');
      goToStep1();
      loadStudentBookings();
    }
  } catch (e) {
    console.error('[LOGIN]', e);
    showAlert('loginAlert', 'Gagal sambung ke pelayan. Semak URL API.');
  }
}

/* ─────────────────────────────────────────
   [AUTH] LOGIN ADMIN
   ───────────────────────────────────────── */
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
    showAlert('adminAlert', lang === 'ms'
      ? 'Nama pengguna atau kata laluan admin tidak betul.'
      : 'Wrong admin credentials.');
  }
}

/* ─────────────────────────────────────────
   [AUTH] LOGOUT
   ───────────────────────────────────────── */
function doLogout() {
  currentUser = null; currentUserName = null; isAdmin = false;
  selectedCourt = null; selectedSlot = null; selectedSlotType = null;
  bookings = [];
  document.getElementById('userChip').style.display = 'none';
  document.getElementById('inMatric').value    = '';
  document.getElementById('inPass').value      = '';
  document.getElementById('inAdminUser').value = '';
  document.getElementById('inAdminPass').value = '';
  clearAlert('loginAlert'); clearAlert('adminAlert');
  hideAdminLogin();
  showScreen('screenLogin');
}

/* ─────────────────────────────────────────
   [CHANGEPASS] TUKAR PASSWORD — FIRST LOGIN
   ───────────────────────────────────────── */
async function doChangePassword() {
  const newPass = document.getElementById('inNewPass').value.trim();
  const confirm = document.getElementById('inConfirmPass').value.trim();
  clearAlert('cpAlert');

  if (newPass.length < 6)          { showAlert('cpAlert', tr('cpErrorShort'), 'warning'); return; }
  if (newPass === 'tvetmara')      { showAlert('cpAlert', tr('cpErrorSameAsDefault'), 'warning'); return; }
  if (newPass !== confirm)          { showAlert('cpAlert', tr('cpErrorMatch'), 'warning'); return; }

  const apiUrl = getApiUrl();
  showAlert('cpAlert', tr('saving'), 'info');
  try {
    const res  = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'changePassword', ic: currentUser, newPass })
    });
    const data = await res.json();
    if (data.success) {
      showAlert('cpAlert', tr('cpSuccess'), 'success');
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
  } catch (e) {
    showAlert('cpAlert', 'Gagal sambung ke pelayan.');
  }
}

/* ─────────────────────────────────────────
   [BOOKING] PILIH COURT
   ───────────────────────────────────────── */
function selectCourt(c) {
  selectedCourt = c;
  document.getElementById('courtCardA').classList.toggle('selected', c === 'A');
  document.getElementById('courtCardB').classList.toggle('selected', c === 'B');
}

/* ─────────────────────────────────────────
   [BOOKING] NAVIGASI LANGKAH 1 → 2 → 3
   ───────────────────────────────────────── */
function updateStepBar(step) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById('sc' + i);
    const label  = document.getElementById('sl' + i);
    circle.classList.remove('active', 'done');
    label.classList.remove('active', 'done');
    if (i < step)        { circle.classList.add('done'); circle.innerHTML = '✓'; label.classList.add('done'); }
    else if (i === step) { circle.classList.add('active'); circle.textContent = i; label.classList.add('active'); }
    else                 { circle.textContent = i; }
  }
  document.getElementById('sline1').classList.toggle('done', step > 1);
  document.getElementById('sline2').classList.toggle('done', step > 2);
}

function goToStep1() {
  ['step1Div', 'step2Div', 'step3Div'].forEach((id, i) => {
    document.getElementById(id).style.display = i === 0 ? 'block' : 'none';
  });
  document.getElementById('stepBar').style.display = 'flex';
  updateStepBar(1);
  const today  = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('inDate');
  dateEl.min   = today;
  if (!dateEl.value || dateEl.value < today) dateEl.value = today;
}

function goToStep2() {
  clearAlert('s1Alert');
  if (!selectedCourt) {
    showAlert('s1Alert', lang === 'ms' ? 'Sila pilih court.' : 'Please select a court.', 'warning'); return;
  }
  if (!document.getElementById('inDate').value) {
    showAlert('s1Alert', lang === 'ms' ? 'Sila pilih tarikh.' : 'Please select a date.', 'warning'); return;
  }
  ['step1Div', 'step2Div', 'step3Div'].forEach((id, i) => {
    document.getElementById(id).style.display = i === 1 ? 'block' : 'none';
  });
  document.getElementById('selectedCourtLabel').textContent =
    'Court ' + selectedCourt + ' — ' + (selectedCourt === 'A' ? tr('horizontal') : tr('vertical'));
  updateStepBar(2);
  renderSlots();
}

function goToStep3() {
  clearAlert('s2Alert');
  if (!selectedSlot) {
    showAlert('s2Alert', lang === 'ms' ? 'Sila pilih slot masa.' : 'Please select a time slot.', 'warning'); return;
  }
  ['step1Div', 'step2Div', 'step3Div'].forEach((id, i) => {
    document.getElementById(id).style.display = i === 2 ? 'block' : 'none';
  });
  updateStepBar(3);
  renderSummary();
}

/* ─────────────────────────────────────────
   [SLOTS] RENDER SLOT MASA
   ───────────────────────────────────────── */
function renderSlots() {
  const dateVal = document.getElementById('inDate').value;
  const booked  = (selectedCourt && dateVal) ? getBookedSlots(selectedCourt, dateVal) : [];
  const afGrid    = document.getElementById('slotGridAfternoon');
  const nightGrid = document.getElementById('slotGridNight');
  afGrid.innerHTML = '';
  nightGrid.innerHTML = '';

  SLOTS_AFTERNOON.forEach(s => {
    const isBooked = booked.includes(s.slot);
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (selectedSlot === s.slot ? ' selected' : '');
    btn.disabled  = isBooked;
    btn.innerHTML = s.slot.replace(' - ', '<br>') + `<span class="slot-tag">${tr('slotAfternoonInfo')}</span>`;
    if (!isBooked) btn.onclick = () => selectSlot(s.slot, 'afternoon');
    afGrid.appendChild(btn);
  });

  SLOTS_NIGHT.forEach(s => {
    const isBooked = booked.includes(s.slot);
    const btn = document.createElement('button');
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (selectedSlot === s.slot ? ' selected' : '');
    btn.disabled  = isBooked;
    btn.innerHTML = s.slot.replace(' - ', '<br>') + `<span class="slot-tag">${tr('slotNightInfo')}</span>`;
    if (!isBooked) btn.onclick = () => selectSlot(s.slot, 'night');
    nightGrid.appendChild(btn);
  });
}

function selectSlot(slot, type) {
  selectedSlot     = slot;
  selectedSlotType = type;
  document.getElementById('durationBox').style.display = (type === 'night') ? 'block' : 'none';
  if (type !== 'night') selectedDuration = 1;
  renderSlots();
}

function setDuration(d) {
  selectedDuration = d;
  document.getElementById('btn1h').classList.toggle('selected', d === 1);
  document.getElementById('btn2h').classList.toggle('selected', d === 2);
}

/* ─────────────────────────────────────────
   [SUMMARY] PAPARAN RINGKASAN
   ───────────────────────────────────────── */
function renderSummary() {
  const date       = document.getElementById('inDate').value;
  const dur        = selectedSlotType === 'night' ? selectedDuration : 1;
  const durText    = dur + ' ' + (dur === 1 ? tr('hour') : tr('hours'));
  const courtLabel = selectedCourt === 'A' ? tr('courtA_long') : tr('courtB_long');
  document.getElementById('shValue').textContent = courtLabel + ' • ' + date;
  document.getElementById('summaryTable').innerHTML = `
    <tr><td>${tr('tMatric')}</td><td>${currentUser}</td></tr>
    <tr><td>${tr('thNama')}</td><td>${currentUserName || ''}</td></tr>
    <tr><td>${tr('tCourt')}</td><td>${courtLabel}</td></tr>
    <tr><td>${tr('tDate')}</td><td>${date}</td></tr>
    <tr><td>${tr('tSlot')}</td><td>${selectedSlot}</td></tr>
    <tr><td>${tr('tDuration')}</td><td>${durText}</td></tr>
  `;
}

/* ─────────────────────────────────────────
   [SUBMIT] HANTAR TEMPAHAN KE GOOGLE SHEETS
   ───────────────────────────────────────── */
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

  const apiUrl  = getApiUrl();
  const localId = 'BK' + Date.now();
  const newB    = {
    ID: localId, IC: currentUser, Nama: currentUserName || currentUser,
    Court: selectedCourt, Date: date, Slot: selectedSlot,
    Duration: dur, Status: 'Active',
    Timestamp: new Date().toLocaleString('ms-MY')
  };

  if (!apiUrl) {
    bookings.push(newB);
    showAlert('s3Alert', tr('successBook') + localId + ' <small>(Demo)</small>', 'success');
    setTimeout(() => resetForm(), 3000);
    return;
  }

  showAlert('s3Alert', tr('saving'), 'info');
  try {
    const res  = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      newB.ID = data.id || localId;
      bookings.push(newB);
      showAlert('s3Alert', tr('successBook') + newB.ID, 'success');
      setTimeout(() => resetForm(), 3000);
    } else {
      showAlert('s3Alert', 'Error: ' + (data.error || 'Unknown'));
    }
  } catch (e) {
    console.error('[SUBMIT]', e);
    showAlert('s3Alert', lang === 'ms'
      ? 'Gagal sambung ke Google Sheets. Semak URL API.'
      : 'Failed to connect. Check API URL.');
  }
}

function resetForm() {
  selectedCourt = null; selectedSlot = null; selectedSlotType = null; selectedDuration = 1;
  document.getElementById('courtCardA').classList.remove('selected');
  document.getElementById('courtCardB').classList.remove('selected');
  document.getElementById('durationBox').style.display = 'none';
  document.getElementById('btn1h').classList.add('selected');
  document.getElementById('btn2h').classList.remove('selected');
  clearAlert('s3Alert');
  goToStep1();
}

/* ─────────────────────────────────────────
   [STUDENT-TAB] NAVIGASI TAB PELAJAR
   ───────────────────────────────────────── */
function showStudentTab(tab) {
  ['book', 'history'].forEach(t => {
    document.getElementById('nav' + t.charAt(0).toUpperCase() + t.slice(1))
      .classList.toggle('active', t === tab);
  });

  document.getElementById('stepBar').style.display   = tab === 'book' ? 'flex' : 'none';
  document.getElementById('step1Div').style.display  = tab === 'book' ? 'block' : 'none';
  document.getElementById('step2Div').style.display  = 'none';
  document.getElementById('step3Div').style.display  = 'none';

  const hc = document.getElementById('historyCard');
  if (hc) hc.style.display = tab === 'history' ? 'block' : 'none';
  if (tab === 'history') renderStudentHistory();
}

function loadStudentBookings() {
  const apiUrl = getApiUrl();
  if (!apiUrl) return;
  fetch(`${apiUrl}?action=get&ic=${encodeURIComponent(currentUser)}`)
    .then(r => r.json())
    .then(data => {
      if (data.success && data.data) bookings = data.data;
    })
    .catch(() => {});
}

/* ─────────────────────────────────────────
   [HISTORY] SEJARAH TEMPAHAN PELAJAR
   ───────────────────────────────────────── */
function renderStudentHistory() {
  const mine = bookings
    .filter(b => (b.IC || b.Matric || '') === (currentUser || ''))
    .reverse();
  const el = document.getElementById('historyListEl');

  if (!mine.length) {
    el.innerHTML = `<div class="empty-state"><p>${tr('noBooking')}</p></div>`;
    return;
  }

  el.innerHTML = mine.map(b => `
    <div class="booking-item">
      <div class="booking-main">
        <div class="booking-court-label">Court ${b.Court} — ${b.Court === 'A' ? tr('horizontal') : tr('vertical')}</div>
        <div class="booking-meta">${b.Date} &nbsp;•&nbsp; ${b.Duration} ${b.Duration == 1 ? tr('hour') : tr('hours')}</div>
        <div class="booking-slot">${b.Slot}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
        <span class="badge badge-${b.Status === 'Active' ? 'active' : 'cancelled'}">
          ${b.Status === 'Active' ? T[lang].active : T[lang].cancelled}
        </span>
        ${b.Status === 'Active'
          ? `<button class="btn-danger-sm" onclick="cancelStudentBooking('${b.ID}')">${tr('btnCancel')}</button>`
          : ''}
      </div>
    </div>`).join('');
}

async function cancelStudentBooking(id) {
  if (!confirm(tr('cancelConfirm'))) return;
  const b = bookings.find(x => x.ID === id);
  if (b) b.Status = 'Cancelled';
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try { await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'cancel', id }) }); }
    catch (e) {}
  }
  renderStudentHistory();
}

/* ─────────────────────────────────────────
   [ADMIN-TAB] NAVIGASI TAB ADMIN
   ───────────────────────────────────────── */
function switchAdminTab(tab) {
  currentAdminTab = tab;

  document.getElementById('adminDashboard').style.display     = tab === 'dashboard' ? 'block' : 'none';
  document.getElementById('adminBookings').style.display      = tab === 'bookings'  ? 'block' : 'none';
  document.getElementById('adminStudentsPanel').style.display = tab === 'students'  ? 'block' : 'none';
  document.getElementById('adminSetupPanel').style.display    = tab === 'setup'     ? 'block' : 'none';

  ['Dash', 'Book', 'Students', 'Setup'].forEach(k => {
    const keyMap = { Dash: 'dashboard', Book: 'bookings', Students: 'students', Setup: 'setup' };
    const el1 = document.getElementById('adminTab'  + k);
    const el2 = document.getElementById('adminNav'  + k);
    if (el1) el1.classList.toggle('active', keyMap[k] === tab);
    if (el2) el2.classList.toggle('active', keyMap[k] === tab);
  });

  if (tab === 'setup') {
    const s = getApiUrl();
    if (s) document.getElementById('inApiUrl').value = s;
  }
  if (tab === 'bookings') renderAdminBookingsFull();
  if (tab === 'students') loadAdminStudents();
}

/* ─────────────────────────────────────────
   [ADMIN-DATA] MUATKAN DATA TEMPAHAN
   ───────────────────────────────────────── */
async function loadAdminData() {
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try {
      const res  = await fetch(apiUrl + '?action=get');
      const data = await res.json();
      if (data.success && data.data) bookings = data.data;
    } catch (e) {}
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
  const el     = document.getElementById('adminRecentList');

  if (!recent.length) {
    el.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p>${tr('noBooking')}</p></div>`;
    return;
  }

  el.innerHTML = `<div style="overflow-x:auto;"><table class="data-table">
    <thead><tr>
      <th>${tr('thIC')}</th><th>${tr('thNama')}</th><th>${tr('thCourt')}</th>
      <th>${tr('thDate')}</th><th>${tr('thSlot')}</th><th>${tr('thStatus')}</th>
    </tr></thead>
    <tbody>${recent.map(b => `<tr>
      <td><strong>${b.IC || b.Matric || ''}</strong></td>
      <td>${b.Nama || b.Name || ''}</td>
      <td>Court ${b.Court}</td>
      <td>${b.Date}</td>
      <td style="font-size:11px;">${b.Slot}</td>
      <td><span class="badge badge-${b.Status === 'Active' ? 'active' : 'cancelled'}">
        ${b.Status === 'Active' ? T[lang].active : T[lang].cancelled}
      </span></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function filterBookings(f) {
  currentAdminFilter = f;
  ['all', 'Active', 'Cancelled', 'A', 'B'].forEach(v => {
    const ids = { all: 'ftAll', Active: 'ftActive', Cancelled: 'ftCancelled', A: 'ftCourtA', B: 'ftCourtB' };
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
    el.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p>${tr('noBooking')}</p></div>`;
    return;
  }

  el.innerHTML = `<div style="overflow-x:auto;"><table class="data-table">
    <thead><tr>
      <th>${tr('thIC')}</th><th>${tr('thNama')}</th><th>${tr('thCourt')}</th>
      <th>${tr('thDate')}</th><th>${tr('thSlot')}</th><th>${tr('thStatus')}</th><th>${tr('thAction')}</th>
    </tr></thead>
    <tbody>${filtered.map(b => `<tr>
      <td><strong>${b.IC || b.Matric || ''}</strong></td>
      <td>${b.Nama || b.Name || ''}</td>
      <td>Court ${b.Court}</td>
      <td>${b.Date}</td>
      <td style="font-size:11px;">${b.Slot}</td>
      <td><span class="badge badge-${b.Status === 'Active' ? 'active' : 'cancelled'}">
        ${b.Status === 'Active' ? T[lang].active : T[lang].cancelled}
      </span></td>
      <td>${b.Status === 'Active'
        ? `<button class="btn-danger-sm" onclick="adminCancelBooking('${b.ID}')">${tr('btnCancel')}</button>`
        : '—'}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

async function adminCancelBooking(id) {
  if (!confirm(tr('cancelConfirm'))) return;
  const b = bookings.find(x => x.ID === id);
  if (b) b.Status = 'Cancelled';
  const apiUrl = getApiUrl();
  if (apiUrl) {
    try { await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'cancel', id }) }); }
    catch (e) {}
  }
  updateAdminStats();
  renderAdminRecent();
  renderAdminBookingsFull();
}

/* ─────────────────────────────────────────
   [ADMIN-STU] URUS DATA PELAJAR
   ───────────────────────────────────────── */
async function loadAdminStudents() {
  const apiUrl = getApiUrl();
  const el     = document.getElementById('studentListEl');
  if (!apiUrl) {
    el.innerHTML = `<div class="empty-state"><p>URL API belum dikonfigurasi.</p></div>`;
    return;
  }
  el.innerHTML = `<div class="empty-state"><p>${tr('loading')}</p></div>`;
  try {
    const res  = await fetch(apiUrl + '?action=getStudents');
    const data = await res.json();
    if (!data.success || !data.data.length) {
      el.innerHTML = `<div class="empty-state"><p>${tr('noStudents')}</p></div>`;
      return;
    }
    el.innerHTML = `<div style="overflow-x:auto;"><table class="data-table">
      <thead><tr>
        <th>No. IC</th><th>Nama</th><th>Status Password</th><th>Tindakan</th>
      </tr></thead>
      <tbody>${data.data.map(s => `<tr>
        <td><strong>${s.IC}</strong></td>
        <td>${s.Nama}</td>
        <td><span class="badge badge-${(s.MustChangePass + '').toUpperCase() === 'TRUE' ? 'cancelled' : 'active'}">
          ${(s.MustChangePass + '').toUpperCase() === 'TRUE' ? tr('mustChangeYes') : tr('mustChangeNo')}
        </span></td>
        <td><button class="btn-outline-sm" onclick="adminResetPassword('${s.IC}','${s.Nama}')">Reset Pass</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch (e) {
    el.innerHTML = `<div class="empty-state"><p>Gagal memuatkan data.</p></div>`;
  }
}

async function adminAddStudent() {
  const ic   = document.getElementById('inStudentIC').value.trim();
  const nama = document.getElementById('inStudentNama').value.trim();
  clearAlert('addStudentAlert');
  if (!ic || !nama) { showAlert('addStudentAlert', tr('errorFill'), 'warning'); return; }
  const apiUrl = getApiUrl();
  if (!apiUrl)  { showAlert('addStudentAlert', 'URL API belum dikonfigurasi.', 'warning'); return; }

  showAlert('addStudentAlert', tr('saving'), 'info');
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
  } catch (e) {
    showAlert('addStudentAlert', 'Gagal sambung ke pelayan.');
  }
}

async function adminImportStudents() {
  const raw = document.getElementById('inImportCSV').value.trim();
  clearAlert('importAlert');
  if (!raw) { showAlert('importAlert', 'Sila masukkan data CSV.', 'warning'); return; }

  const students = raw.split('\n')
    .map(line => { const p = line.split(','); return { ic: (p[0] || '').trim(), nama: (p[1] || '').trim() }; })
    .filter(s => s.ic && s.nama);

  if (!students.length) { showAlert('importAlert', 'Format salah. Guna: IC,Nama', 'warning'); return; }

  const apiUrl = getApiUrl();
  if (!apiUrl) { showAlert('importAlert', 'URL API belum dikonfigurasi.', 'warning'); return; }

  showAlert('importAlert', tr('saving'), 'info');
  try {
    const res  = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'importStudents', students }) });
    const data = await res.json();
    if (data.success) {
      showAlert('importAlert', `${data.added} ${tr('importSuccess')} ${data.skipped} ${tr('importSkipped')}`, 'success');
      document.getElementById('inImportCSV').value = '';
      loadAdminStudents();
    } else {
      showAlert('importAlert', data.error || 'Gagal import.');
    }
  } catch (e) {
    showAlert('importAlert', 'Gagal sambung ke pelayan.');
  }
}

async function adminResetPassword(ic, nama) {
  if (!confirm(`${tr('resetPassConfirm')}\n${nama} (${ic})`)) return;
  const apiUrl = getApiUrl();
  try {
    const res  = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'changePassword', ic, newPass: 'tvetmara', forceReset: true })
    });
    const data = await res.json();
    if (data.success) {
      await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'setMustChange', ic }) });
      alert(tr('resetPassSuccess'));
      loadAdminStudents();
    }
  } catch (e) {}
}

/* ─────────────────────────────────────────
   [SETUP] SIMPAN & TEST URL API
   ───────────────────────────────────────── */
function saveApiUrl() {
  const url = document.getElementById('inApiUrl').value.trim();
  setApiUrl(url);
  showAlert('apiAlert', tr('urlSaved'), 'success');
}

async function testApi() {
  const url = document.getElementById('inApiUrl').value.trim();
  if (!url) {
    showAlert('apiAlert', lang === 'ms' ? 'Sila masukkan URL terlebih dahulu.' : 'Please enter URL first.', 'warning');
    return;
  }
  showAlert('apiAlert', tr('loading'), 'info');
  try {
    const res  = await fetch(url + '?action=ping');
    const data = await res.json();
    if (data.success) showAlert('apiAlert', tr('testOk'), 'success');
    else              showAlert('apiAlert', tr('testFail'));
  } catch (e) {
    showAlert('apiAlert', tr('testFail'));
  }
}

/* ─────────────────────────────────────────
   [INIT] DOMContentLoaded — Setup Awal
   ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Bina history card secara dinamik dalam student screen
  const container = document.querySelector('#screenStudent .container');
  const hc = document.createElement('div');
  hc.id    = 'historyCard';
  hc.style.display = 'none';
  hc.innerHTML = `
    <div class="card">
      <div class="card-title" style="margin-bottom:14px;">${lang === 'ms' ? 'Tempahan Saya' : 'My Bookings'}</div>
      <div id="historyListEl"></div>
    </div>`;
  container.appendChild(hc);

  // Set tarikh minimum = hari ini
  const today  = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('inDate');
  dateEl.min   = today;
  dateEl.value = today;

  // Re-render slot bila tarikh bertukar
  dateEl.addEventListener('change', () => {
    selectedSlot = null;
    if (document.getElementById('step2Div').style.display !== 'none') renderSlots();
  });

  // Sync URL API dari localStorage ke input
  const savedUrl = getApiUrl();
  const urlInput = document.getElementById('inApiUrl');
  if (savedUrl && urlInput) urlInput.value = savedUrl;
});