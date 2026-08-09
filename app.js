/* ═══════════════════════════════════════════════════════════════
   SISTEM TEMPAHAN COURT — TVET MARA LUMUT
   Versi: 3.1.0 (Supabase + i18n EN/BM)
   ═══════════════════════════════════════════════════════════════ */

/* ───────── [CONFIG] ───────── */
const API_URL  = 'https://qwldwdywvxamlnaulmye.supabase.co/functions/v1/booking';
const ADMIN_WA = '60195772706';

const SLOTS = [
  { id: 1, type: 'petang', time: '5:00pm – 7:00pm' },
  { id: 2, type: 'malam',  time: '8:00pm – 9:30pm' },
  { id: 3, type: 'malam',  time: '9:30pm – 11:00pm' },
  { id: 4, type: 'malam',  time: '9:00pm – 11:00pm' }
];

// Isnin–Khamis (1-4): 1 slot malam (id 4). Jumaat/Sabtu/Ahad (5,6,0): kekal 2 slot malam (id 2 & 3).
function getSlotsForDate(dateStr) {
  if (!dateStr) return SLOTS;
  const day = new Date(dateStr + 'T00:00:00').getDay(); // 0=Ahad,1=Isnin,...,6=Sabtu
  const isWeekday = day >= 1 && day <= 4;
  return SLOTS.filter(s => isWeekday ? (s.id !== 2 && s.id !== 3) : s.id !== 4);
}

const COURTS = [
  { id: 1, name: 'Court 1', sports: ['futsal','netball','handball'] },
  { id: 2, name: 'Court 2', sports: ['futsal'] },
  { id: 3, name: 'Court 3', sports: ['volleyball'] },
  { id: 4, name: 'Court 4', sports: ['volleyball'] }
];

/* ───────── [I18N] ───────── */
let lang = localStorage.getItem('bookingLang') || 'en';

const SPORT_LABEL = {
  en: { futsal:'Futsal', netball:'Netball',     handball:'Handball',    volleyball:'Volleyball' },
  ms: { futsal:'Futsal', netball:'Bola Jaring', handball:'Bola Baling', volleyball:'Bola Tampar' }
};
function sportLabel(key) { return (SPORT_LABEL[lang] && SPORT_LABEL[lang][key]) || key; }

const SLOT_LABEL = {
  en: { 1:'Afternoon', 2:'Night 1', 3:'Night 2', 4:'Night' },
  ms: { 1:'Petang',    2:'Malam 1', 3:'Malam 2', 4:'Malam' }
};
function slotLabel(id) { return SLOT_LABEL[lang][id]; }

const LANG = {
  en: {
    appName:'Court Booking', heroSub:'TVET MARA Lumut — students only',
    loginTitle:'Log in', loginSub:'Enter your student email to continue.',
    lblEmail:'Student email', phEmail:'2402080.dfd@lumut.tvetmara.edu.my',
    btnContinue:'Continue',
    passTitle:'Password', lblPass:'Password', phPass:'Enter your password',
    btnLogin:'Log in', btnChangeEmail:'← Change email', btnForgot:'Forgot password?',
    firstTitle:'First-time login',
    lblIc:'Last 4 digits of IC', phIc:'e.g. 1234',
    lblNewPass:'New password', phNewPass:'Minimum 6 characters',
    lblConfirmPass:'Confirm password', phConfirmPass:'Re-enter password',
    btnSetContinue:'Set & continue',
    adminTitle:'Admin login', adminSub:'Administrators only.',
    lblAdminUser:'Username', phAdminUser:'Admin username',
    lblAdminPass:'Admin password', phAdminPass:'Admin password',
    btnAdminLogin:'Log in', btnBack:'← Back',
    stepSelect:'Select', stepSlot:'Slot', stepConfirm:'Confirm',
    secSport:'1. Select sport', secCourt:'2. Select court', secDate:'3. Select date',
    btnNext:'Next', btnBackShort:'← Back', btnConfirmBooking:'Confirm booking',
    lblAfternoon:'Afternoon', lblNight:'Night',
    myBookings:'My bookings',
    navBook:'Book', navSchedule:'Schedule', navHistory:'History', navLogout:'Log out',
    schedTitle:'Court schedule', schedSub:'See which slots are free before booking. Tap a free slot to book it.',
    legendFree:'Free', legendTaken:'Booked',
    adminPanel:'Admin Panel', statTotal:'Total', statActive:'Active', statCancelled:'Cancelled',
    recentTitle:'Recent bookings', btnRefresh:'↻ Refresh',
    addStudentTitle:'Register student', addStudentSub:'Add a new student email — they\'ll set their own password on first login.',
    lblStudentName:'Full name', phStudentName:'e.g. Ahmad Bin Ali',
    btnAddStudent:'Register student', aEnterName:'Please enter the student\'s name.',
    aRegistering:'Registering...', studentAdded:'Student registered! They can now log in with their email to set a password.',
    addStudentFail:'Failed to register student.',
    resetTitle:'Reset student password',
    resetSub:'When a student messages you about a forgotten password, enter their email here to reset it.',
    phResetEmail:'student email', btnReset:'Reset password', btnAdminLogout:'Log out admin',
    sumEmail:'Email', sumName:'Name', sumSport:'Sport', sumCourt:'Court', sumDate:'Date', sumSlot:'Slot',
    active:'Active', cancelled:'Cancelled', btnCancel:'Cancel',
    courtsAvailable:'courts available', free:'Free', noBookings:'No bookings found.',
    aEnterEmail:'Please enter your student email.', aChecking:'Checking email...',
    aServerFail:'Could not reach the server. Try again.',
    aEnterIc:'Please enter the last 4 digits of your IC.', aPassMin:'Password must be at least 6 characters.',
    aPassMismatch:'Passwords do not match.', aSaving:'Saving...',
    aEnterPass:'Please enter your password.', aLoggingIn:'Logging in...',
    aWrongPass:'Wrong password.', aSelectSport:'Please select a sport first.',
    aSelectCourt:'Please select a court.', aSelectDate:'Please select a date.',
    aCheckingSlots:'Checking slot availability...', aCheckSlotsFail:'Could not check availability. Try again.',
    aSelectSlot:'Please select a time slot.', aSubmitting:'Submitting booking...',
    bookSuccess:'Booking confirmed! ID:', bookFail:'Booking failed. Try again.',
    confirmCancel:'Cancel this booking?', cancelFail:'Failed to cancel.',
    loadFail:'Failed to load. Try again.', loading:'Loading...',
    adminWrong:'Wrong username or password.',
    resetDone:'Password reset. The student can log in again using their IC.',
    resetFail:'Failed to reset.', recentEmpty:'No bookings yet.',
    thStudent:'Student', thCourse:'Course', thAction:'Action',
    filterPh:'Filter by course, matric or email...',
    adminCancelConfirm:'Cancel this student\'s booking?'
  },
  ms: {
    appName:'Tempahan Court', heroSub:'TVET MARA Lumut — khusus pelajar',
    loginTitle:'Log masuk', loginSub:'Masukkan email pelajar anda untuk teruskan.',
    lblEmail:'Email pelajar', phEmail:'2402080.dfd@lumut.tvetmara.edu.my',
    btnContinue:'Teruskan',
    passTitle:'Kata laluan', lblPass:'Kata laluan', phPass:'Masukkan kata laluan',
    btnLogin:'Log masuk', btnChangeEmail:'← Tukar email', btnForgot:'Lupa kata laluan?',
    firstTitle:'Log masuk kali pertama',
    lblIc:'4 digit terakhir IC', phIc:'Contoh: 1234',
    lblNewPass:'Kata laluan baru', phNewPass:'Minimum 6 aksara',
    lblConfirmPass:'Sahkan kata laluan', phConfirmPass:'Taip semula kata laluan',
    btnSetContinue:'Tetapkan & masuk',
    adminTitle:'Log masuk admin', adminSub:'Akses pentadbir sahaja.',
    lblAdminUser:'Nama pengguna', phAdminUser:'Nama pengguna admin',
    lblAdminPass:'Kata laluan admin', phAdminPass:'Kata laluan admin',
    btnAdminLogin:'Log masuk', btnBack:'← Kembali',
    stepSelect:'Pilih', stepSlot:'Slot', stepConfirm:'Sahkan',
    secSport:'1. Pilih sukan', secCourt:'2. Pilih court', secDate:'3. Pilih tarikh',
    btnNext:'Seterusnya', btnBackShort:'← Kembali', btnConfirmBooking:'Sahkan tempahan',
    lblAfternoon:'Petang', lblNight:'Malam',
    myBookings:'Tempahan saya',
    navBook:'Tempah', navSchedule:'Jadual', navHistory:'Sejarah', navLogout:'Keluar',
    schedTitle:'Jadual court', schedSub:'Tengok slot mana kosong sebelum tempah. Tekan petak kosong untuk terus tempah.',
    legendFree:'Kosong', legendTaken:'Dah ditempah',
    adminPanel:'Panel Admin', statTotal:'Jumlah', statActive:'Aktif', statCancelled:'Dibatal',
    recentTitle:'Tempahan terkini', btnRefresh:'↻ Muat semula',
    addStudentTitle:'Daftar pelajar', addStudentSub:'Tambah email pelajar baru — mereka akan tetapkan kata laluan sendiri semasa log masuk kali pertama.',
    lblStudentName:'Nama penuh', phStudentName:'cth: Ahmad Bin Ali',
    btnAddStudent:'Daftar pelajar', aEnterName:'Sila masukkan nama pelajar.',
    aRegistering:'Mendaftar...', studentAdded:'Pelajar berjaya didaftar! Mereka boleh log masuk dengan email untuk tetapkan kata laluan.',
    addStudentFail:'Gagal mendaftar pelajar.',
    resetTitle:'Reset kata laluan pelajar',
    resetSub:'Bila pelajar WhatsApp untuk lupa kata laluan, masukkan email mereka di sini untuk reset.',
    phResetEmail:'email pelajar', btnReset:'Reset kata laluan', btnAdminLogout:'Log keluar admin',
    sumEmail:'Email', sumName:'Nama', sumSport:'Sukan', sumCourt:'Court', sumDate:'Tarikh', sumSlot:'Slot',
    active:'Aktif', cancelled:'Dibatal', btnCancel:'Batal',
    courtsAvailable:'court tersedia', free:'Kosong', noBookings:'Tiada tempahan dijumpai.',
    aEnterEmail:'Sila masukkan email pelajar.', aChecking:'Menyemak email...',
    aServerFail:'Gagal sambung ke pelayan. Cuba lagi.',
    aEnterIc:'Sila masukkan 4 digit IC.', aPassMin:'Kata laluan minimum 6 aksara.',
    aPassMismatch:'Kata laluan tidak sepadan.', aSaving:'Menyimpan...',
    aEnterPass:'Sila masukkan kata laluan.', aLoggingIn:'Log masuk...',
    aWrongPass:'Kata laluan salah.', aSelectSport:'Sila pilih sukan terlebih dahulu.',
    aSelectCourt:'Sila pilih court.', aSelectDate:'Sila pilih tarikh.',
    aCheckingSlots:'Menyemak ketersediaan slot...', aCheckSlotsFail:'Gagal semak ketersediaan. Cuba lagi.',
    aSelectSlot:'Sila pilih slot masa.', aSubmitting:'Menghantar tempahan...',
    bookSuccess:'Tempahan berjaya! ID:', bookFail:'Gagal tempah. Cuba lagi.',
    confirmCancel:'Batalkan tempahan ini?', cancelFail:'Gagal batal.',
    loadFail:'Gagal memuat. Cuba lagi.', loading:'Memuatkan...',
    adminWrong:'Nama pengguna atau kata laluan salah.',
    resetDone:'Kata laluan berjaya direset. Pelajar boleh login semula dengan IC.',
    resetFail:'Gagal reset.', recentEmpty:'Tiada tempahan lagi.',
    thStudent:'Pelajar', thCourse:'Kursus', thAction:'Tindakan',
    filterPh:'Tapis ikut kursus, matrik atau email...',
    adminCancelConfirm:'Batalkan tempahan pelajar ini?'
  }
};
function t(key) { return (LANG[lang] && LANG[lang][key]) || key; }

function setLang(l) {
  lang = l;
  localStorage.setItem('bookingLang', l);
  applyLang();
}

function applyLang() {
  // Static text
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  // Toggle highlight
  document.querySelectorAll('.lang-opt').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  // Mark body ready — removes FOUC hide
  document.body.classList.add('lang-ready');
  // Dynamic re-renders
  if (document.getElementById('sportGrid')) renderSportSelection();
  if (selectedSport && document.getElementById('courtSelectionDiv') &&
      document.getElementById('courtSelectionDiv').style.display !== 'none') renderCourtSelection();
  if (currentStudentTab === 'jadual' && document.getElementById('scheduleCard') &&
      document.getElementById('scheduleCard').style.display !== 'none') loadSchedule();
  if (currentStudentTab === 'history' && document.getElementById('historyCard') &&
      document.getElementById('historyCard').style.display !== 'none') renderStudentHistory();
}

/* ───────── [STATE] ───────── */
let currentEmail=null, currentName=null, isAdmin=false;
let selectedSport=null, selectedCourtId=null, selectedSlotId=null;
let bookedSlots=[], studentBookings=[], adminBookings=[];
let currentAdminTab='dashboard', currentStudentTab='book';

/* ───────── [API] ───────── */
async function callApi(payload) {
  const res = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

/* ───────── UTILS ───────── */
function showAlert(elId, msg, type='danger') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 5000);
}
function clearAlert(elId) { const el = document.getElementById(elId); if (el) el.innerHTML = ''; }
function showScreen(id) {
  ['screenLogin','screenStudent','screenAdmin'].forEach(s => {
    const el = document.getElementById(s); if (el) el.classList.remove('active');
  });
  const tgt = document.getElementById(id); if (tgt) tgt.classList.add('active');
}

/* ───────── [AUTH] check email ───────── */
async function checkEmail() {
  const email = document.getElementById('inEmail').value.trim().toLowerCase();
  clearAlert('loginAlert');
  if (!email) { showAlert('loginAlert', t('aEnterEmail'), 'warning'); return; }

  showAlert('loginAlert', t('aChecking'), 'info');
  try {
    const data = await callApi({ action: 'checkEmail', email });
    if (!data.success) { showAlert('loginAlert', data.error || 'Email not found.'); return; }
    clearAlert('loginAlert');
    currentEmail = email;
    currentName  = data.nama;
    document.getElementById('loginEmailStep').style.display = 'none';

    if (data.passwordSet) {
      document.getElementById('loginWelcomePass').innerHTML =
        (lang==='en' ? 'Welcome back, ' : 'Selamat kembali, ') + `<strong>${data.nama}</strong>`;
      document.getElementById('loginPasswordStep').style.display = 'block';
      document.getElementById('inPass').focus();
    } else {
      document.getElementById('loginWelcomeIc').innerHTML = lang==='en'
        ? `Hi <strong>${data.nama}</strong>, verify your identity & set your password.`
        : `Hai <strong>${data.nama}</strong>, sahkan identiti & tetapkan kata laluan anda.`;
      document.getElementById('loginIcStep').style.display = 'block';
      const fp = document.getElementById('inFirstPass'); if (fp) fp.focus();
    }
  } catch(e) { showAlert('loginAlert', t('aServerFail')); }
}

/* ───────── [AUTH] first login ───────── */
async function doFirstLogin() {
  const newPass = document.getElementById('inFirstPass').value;
  const confirmPass = document.getElementById('inFirstPassConfirm').value;
  clearAlert('loginAlert');
  if (newPass.length < 6) { showAlert('loginAlert', t('aPassMin'), 'warning'); return; }
  if (newPass !== confirmPass) { showAlert('loginAlert', t('aPassMismatch'), 'warning'); return; }

  showAlert('loginAlert', t('aSaving'), 'info');
  try {
    const data = await callApi({ action:'firstLogin', email:currentEmail, newPassword:newPass });
    if (data.success) enterStudentApp(data.student.nama);
    else showAlert('loginAlert', data.error || t('bookFail'));
  } catch(e) { showAlert('loginAlert', t('aServerFail')); }
}

/* ───────── [AUTH] login ───────── */
async function doLogin() {
  const pass = document.getElementById('inPass').value;
  clearAlert('loginAlert');
  if (!pass) { showAlert('loginAlert', t('aEnterPass'), 'warning'); return; }

  showAlert('loginAlert', t('aLoggingIn'), 'info');
  try {
    const data = await callApi({ action:'login', email:currentEmail, password:pass });
    if (data.success) enterStudentApp(data.student.nama);
    else if (data.needsFirstLogin) {
      document.getElementById('loginPasswordStep').style.display = 'none';
      document.getElementById('loginWelcomeIc').innerHTML = lang==='en'
        ? `Hi <strong>${currentName||''}</strong>, verify your identity & set your password.`
        : `Hai <strong>${currentName||''}</strong>, sahkan identiti & tetapkan kata laluan anda.`;
      document.getElementById('loginIcStep').style.display = 'block';
    } else showAlert('loginAlert', data.error || t('aWrongPass'));
  } catch(e) { showAlert('loginAlert', t('aServerFail')); }
}

function enterStudentApp(nama) {
  currentName = nama;
  document.getElementById('userChipName').textContent = nama.split(' ')[0];
  document.getElementById('userAvatar').textContent   = nama.charAt(0).toUpperCase();
  document.getElementById('userChip').style.display   = 'flex';
  showScreen('screenStudent');
  showStudentTab('book');
  loadMyBookings();
}

function resetLoginForm() {
  currentEmail=null;
  ['inEmail','inPass','inIc','inFirstPass','inFirstPassConfirm'].forEach(id => {
    const el=document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('loginEmailStep').style.display='block';
  document.getElementById('loginPasswordStep').style.display='none';
  document.getElementById('loginIcStep').style.display='none';
  clearAlert('loginAlert');
}

function contactAdminWhatsApp() {
  const email = currentEmail || '(email not entered)';
  const msg = lang==='en'
    ? `Hi, I forgot my court booking password.%0AEmail: ${email}%0APlease reset. Thank you.`
    : `Assalamualaikum, saya lupa kata laluan sistem tempahan court.%0AEmail: ${email}%0AMohon reset. Terima kasih.`;
  window.open(`https://wa.me/${ADMIN_WA}?text=${msg}`, '_blank');
}

/* ───────── [AUTH] admin ───────── */
let _adminTap=0,_adminTapTimer=null;
function adminTapCount() {
  _adminTap++; clearTimeout(_adminTapTimer);
  _adminTapTimer=setTimeout(()=>{_adminTap=0;},3000);
  if (_adminTap>=5) {
    _adminTap=0;
    document.getElementById('adminLoginCard').style.display='block';
    document.getElementById('studentLoginCard').style.display='none';
  }
}
function hideAdminLogin() {
  document.getElementById('adminLoginCard').style.display='none';
  document.getElementById('studentLoginCard').style.display='block';
}
async function doAdminLogin() {
  const u=document.getElementById('inAdminUser').value.trim();
  const p=document.getElementById('inAdminPass').value;
  clearAlert('adminLoginAlert');
  if (!u||!p) { showAlert('adminLoginAlert', t('aEnterPass'), 'warning'); return; }
  showAlert('adminLoginAlert', t('aLoggingIn'), 'info');
  try {
    const data = await callApi({ action:'adminBookings', adminUser:u, adminPass:p });
    if (!data.success) { showAlert('adminLoginAlert', t('adminWrong')); return; }
    isAdmin=true;
    adminBookings = data.bookings || [];
    document.getElementById('userAvatar').textContent='AD';
    document.getElementById('userChipName').textContent='Admin';
    document.getElementById('userChip').style.display='flex';
    showScreen('screenAdmin');
    updateAdminStats(); renderAdminRecent();
  } catch(e) { showAlert('adminLoginAlert', t('aServerFail')); }
}

function doLogout() {
  currentEmail=null;currentName=null;isAdmin=false;
  selectedSport=null;selectedCourtId=null;selectedSlotId=null;
  bookedSlots=[];studentBookings=[];adminBookings=[];
  document.getElementById('userChip').style.display='none';
  resetLoginForm(); hideAdminLogin(); showScreen('screenLogin');
}

/* ───────── [BOOKING] sport & court ───────── */
function renderSportSelection() {
  const grid=document.getElementById('sportGrid'); if(!grid) return;
  const all=[...new Set(COURTS.flatMap(c=>c.sports))];
  grid.innerHTML=all.map(sport=>`
    <button class="court-card ${selectedSport===sport?'selected':''}" onclick="selectSport('${sport}')">
      <div class="court-name">${sportLabel(sport)}</div>
      <div class="court-badge">${courtsForSport(sport).length} ${t('courtsAvailable')}</div>
    </button>`).join('');
}
function courtsForSport(sport){ return COURTS.filter(c=>c.sports.includes(sport)); }
function selectSport(sport){
  selectedSport=sport; selectedCourtId=null; selectedSlotId=null;
  renderSportSelection(); renderCourtSelection();
  document.getElementById('courtSelectionDiv').style.display='block';
}
function renderCourtSelection() {
  const grid=document.getElementById('courtGrid'); if(!grid) return;
  grid.innerHTML=courtsForSport(selectedSport).map(c=>`
    <button class="court-card ${selectedCourtId===c.id?'selected':''}" onclick="selectCourt(${c.id})">
      <div class="court-name">${c.name}</div>
      <div class="court-badge">${c.sports.map(s=>sportLabel(s)).join(' · ')}</div>
    </button>`).join('');
}
function selectCourt(id){ selectedCourtId=id; renderCourtSelection(); }

/* ───────── [BOOKING] step nav ───────── */
function updateStepBar(step) {
  for (let i=1;i<=3;i++){
    const c=document.getElementById('sc'+i), l=document.getElementById('sl'+i);
    if(!c) continue;
    c.classList.remove('active','done'); if(l) l.classList.remove('active','done');
    if(i<step){c.classList.add('done');c.innerHTML='✓';if(l)l.classList.add('done');}
    else if(i===step){c.classList.add('active');c.textContent=i;if(l)l.classList.add('active');}
    else c.textContent=i;
  }
  const l1=document.getElementById('sline1'),l2=document.getElementById('sline2');
  if(l1)l1.classList.toggle('done',step>1);
  if(l2)l2.classList.toggle('done',step>2);
}
function goToStep1() {
  document.getElementById('step1Div').style.display='block';
  document.getElementById('step2Div').style.display='none';
  document.getElementById('step3Div').style.display='none';
  updateStepBar(1);
  selectedSport=null;selectedCourtId=null;selectedSlotId=null;
  renderSportSelection();
  document.getElementById('courtSelectionDiv').style.display='none';
  const today=new Date().toISOString().split('T')[0];
  const d=document.getElementById('inDate');
  if(d){d.min=today;if(!d.value||d.value<today)d.value=today;}
}
async function goToStep2() {
  clearAlert('s1Alert');
  if(!selectedSport){showAlert('s1Alert',t('aSelectSport'),'warning');return;}
  if(!selectedCourtId){showAlert('s1Alert',t('aSelectCourt'),'warning');return;}
  const date=document.getElementById('inDate').value;
  if(!date){showAlert('s1Alert',t('aSelectDate'),'warning');return;}
  showAlert('s1Alert',t('aCheckingSlots'),'info');
  try {
    const data=await callApi({action:'getAvailability',date});
    bookedSlots=data.booked||[]; clearAlert('s1Alert');
    document.getElementById('step1Div').style.display='none';
    document.getElementById('step2Div').style.display='block';
    const court=COURTS.find(c=>c.id===selectedCourtId);
    document.getElementById('selectedCourtLabel').textContent=`${court.name} — ${sportLabel(selectedSport)} — ${date}`;
    updateStepBar(2); renderSlots();
  } catch(e){ showAlert('s1Alert',t('aCheckSlotsFail')); }
}
function goToStep3() {
  clearAlert('s2Alert');
  if(!selectedSlotId){showAlert('s2Alert',t('aSelectSlot'),'warning');return;}
  document.getElementById('step2Div').style.display='none';
  document.getElementById('step3Div').style.display='block';
  updateStepBar(3); renderSummary();
}

/* ───────── [SLOTS] ───────── */
function renderSlots() {
  const pg=document.getElementById('slotGridAfternoon'), ng=document.getElementById('slotGridNight');
  if(!pg||!ng) return; pg.innerHTML=''; ng.innerHTML='';
  const date=document.getElementById('inDate').value;
  getSlotsForDate(date).forEach(s=>{
    const isBooked=isSlotBooked(selectedCourtId, s.id);
    const btn=document.createElement('button');
    btn.className='slot-btn'+(isBooked?' booked':'')+(selectedSlotId===s.id?' selected':'');
    btn.disabled=isBooked;
    btn.innerHTML=`${s.time}<span class="slot-tag">${slotLabel(s.id)}</span>`;
    if(!isBooked) btn.onclick=()=>selectSlot(s.id);
    (s.type==='petang'?pg:ng).appendChild(btn);
  });
}
// Slot 4 (Isnin-Khamis, 9-11pm) overlap dengan booking lama slot 2 (8-9:30pm) & slot 3 (9:30-11pm).
// Kalau ada booking lama guna slot 2/3 untuk court+tarikh yang sama, anggap slot 4 pun "booked"
// supaya tak clash sekali gus tak perlu cancel booking lama yang masih dalam waktu (slot 3).
function isSlotBooked(courtId, slotId, list) {
  const arr = list || bookedSlots;
  const direct = arr.some(b => b.court_id === courtId && b.slot_id === slotId);
  if (direct) return true;
  if (slotId === 4) {
    return arr.some(b => b.court_id === courtId && (b.slot_id === 2 || b.slot_id === 3));
  }
  return false;
}
function selectSlot(id){ selectedSlotId=id; renderSlots(); }

/* ───────── [SUMMARY] ───────── */
function renderSummary() {
  const date=document.getElementById('inDate').value;
  const court=COURTS.find(c=>c.id===selectedCourtId);
  const slot=SLOTS.find(s=>s.id===selectedSlotId);
  document.getElementById('shValue').textContent=`${court.name} — ${sportLabel(selectedSport)} — ${date}`;
  document.getElementById('summaryTable').innerHTML=`
    <tr><td>${t('sumEmail')}</td><td>${currentEmail}</td></tr>
    <tr><td>${t('sumName')}</td><td>${currentName}</td></tr>
    <tr><td>${t('sumSport')}</td><td>${sportLabel(selectedSport)}</td></tr>
    <tr><td>${t('sumCourt')}</td><td>${court.name}</td></tr>
    <tr><td>${t('sumDate')}</td><td>${date}</td></tr>
    <tr><td>${t('sumSlot')}</td><td>${slotLabel(slot.id)} (${slot.time})</td></tr>`;
}

/* ───────── [SUBMIT] ───────── */
async function submitBooking() {
  clearAlert('s3Alert');
  const date=document.getElementById('inDate').value;
  showAlert('s3Alert',t('aSubmitting'),'info');
  try {
    const data=await callApi({action:'createBooking',email:currentEmail,court_id:selectedCourtId,slot_id:selectedSlotId,sport:selectedSport,date});
    if(data.success){
      showAlert('s3Alert',`${t('bookSuccess')} ${data.booking.id.slice(0,8).toUpperCase()}`,'success');
      setTimeout(()=>{goToStep1();showStudentTab('book');loadMyBookings();},2500);
    } else showAlert('s3Alert',data.error||t('bookFail'));
  } catch(e){ showAlert('s3Alert',t('aServerFail')); }
}

/* ───────── [STUDENT-TAB] ───────── */
function showStudentTab(tab) {
  currentStudentTab=tab;
  ['book','jadual','history'].forEach(tb=>{
    const nav=document.getElementById('nav'+tb.charAt(0).toUpperCase()+tb.slice(1));
    if(nav) nav.classList.toggle('active',tb===tab);
  });
  const show=(id,vis)=>{const el=document.getElementById(id);if(el)el.style.display=vis?(id==='stepBar'?'flex':'block'):'none';};
  show('stepBar',tab==='book'); show('step1Div',tab==='book');
  show('step2Div',false); show('step3Div',false);
  show('scheduleCard',tab==='jadual'); show('historyCard',tab==='history');
  if(tab==='book') goToStep1();
  if(tab==='jadual') loadSchedule();
  if(tab==='history') renderStudentHistory();
}

/* ───────── [JADUAL] ───────── */
async function loadSchedule() {
  const dateEl=document.getElementById('scheduleDate'); if(!dateEl) return;
  const today=new Date().toISOString().split('T')[0];
  if(!dateEl.value) dateEl.value=today; if(!dateEl.min) dateEl.min=today;
  const date=dateEl.value;
  const grid=document.getElementById('scheduleGrid');
  grid.innerHTML=`<div class="empty-state"><p>${t('loading')}</p></div>`;
  try {
    const data=await callApi({action:'getAvailability',date});
    renderSchedule(date,data.booked||[]);
  } catch(e){ grid.innerHTML=`<div class="empty-state"><p>${t('loadFail')}</p></div>`; }
}
function renderSchedule(date,booked) {
  const grid=document.getElementById('scheduleGrid');
  const slots=getSlotsForDate(date);
  const cols=`80px repeat(${slots.length},1fr)`;
  let h=`<div class="sched-table"><div class="sched-row sched-head" style="grid-template-columns:${cols}"><div class="sched-court"></div>`;
  slots.forEach(s=>{ h+=`<div class="sched-cell-head">${slotLabel(s.id)}<span>${s.time}</span></div>`; });
  h+='</div>';
  COURTS.forEach(c=>{
    h+=`<div class="sched-row" style="grid-template-columns:${cols}"><div class="sched-court"><strong>${c.name}</strong><span>${c.sports.map(x=>sportLabel(x)).join(' · ')}</span></div>`;
    slots.forEach(s=>{
      const b=booked.find(x=>x.court_id===c.id&&x.slot_id===s.id) ||
               (s.id===4 ? booked.find(x=>x.court_id===c.id&&(x.slot_id===2||x.slot_id===3)) : null);
      if(b) h+=`<div class="sched-cell taken">${sportLabel(b.sport)}</div>`;
      else  h+=`<div class="sched-cell free" onclick="planFromSchedule('${date}',${c.id})">${t('free')}</div>`;
    });
    h+='</div>';
  });
  h+='</div>'; grid.innerHTML=h;
}
function planFromSchedule(date,courtId) {
  const court=COURTS.find(c=>c.id===courtId);
  showStudentTab('book');
  const d=document.getElementById('inDate'); if(d)d.value=date;
  if(court&&court.sports.length===1){ selectSport(court.sports[0]); selectCourt(courtId); }
}

/* ───────── [HISTORY] ───────── */
async function loadMyBookings() {
  try { const data=await callApi({action:'myBookings',email:currentEmail}); if(data.success) studentBookings=data.bookings||[]; } catch(e){}
}
function renderStudentHistory() {
  const el=document.getElementById('historyListEl'); if(!el) return;
  if(!studentBookings.length){ el.innerHTML=`<div class="empty-state"><p>${t('noBookings')}</p></div>`; return; }
  el.innerHTML=studentBookings.map(b=>`
    <div class="booking-item">
      <div class="booking-main">
        <div class="booking-court-label">${b.courts?.name||'Court'} — ${sportLabel(b.sport)}</div>
        <div class="booking-meta">${b.booking_date} &nbsp;•&nbsp; ${slotLabelFromMs(b.slots?.label_ms)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
        <span class="badge badge-${b.status==='active'?'active':'cancelled'}">${b.status==='active'?t('active'):t('cancelled')}</span>
        ${b.status==='active'?`<button class="btn-danger-sm" onclick="cancelMyBooking('${b.id}')">${t('btnCancel')}</button>`:''}
      </div>
    </div>`).join('');
}
/* slots.label_ms dari DB sentiasa BM — kalau EN, tunjuk ringkas */
function slotLabelFromMs(ms){
  if(!ms) return '';
  if(lang==='ms') return ms;
  return ms.replace('Petang','Afternoon').replace('Malam Sesi','Night').replace('Malam','Night');
}
async function cancelMyBooking(id) {
  if(!confirm(t('confirmCancel'))) return;
  try {
    const data=await callApi({action:'cancelBooking',email:currentEmail,booking_id:id});
    if(data.success){ await loadMyBookings(); renderStudentHistory(); }
    else alert(data.error||t('cancelFail'));
  } catch(e){ alert(t('aServerFail')); }
}

/* ───────── [ADMIN] ───────── */
let adminFilter = '';

/* Parse matrik + kursus dari email: 2402080.dfd@... → {matric:'2402080', course:'DFD'} */
function parseStudent(email) {
  if (!email) return { matric: '', course: '—' };
  const local = email.split('@')[0];
  const parts = local.split('.');
  return { matric: parts[0] || '', course: (parts[1] || '').toUpperCase() || '—' };
}

async function loadAdminData() {
  const u=document.getElementById('inAdminUser')?.value, p=document.getElementById('inAdminPass')?.value;
  try {
    const res=await callApi({action:'adminBookings',adminUser:u,adminPass:p});
    if(res.success) adminBookings=res.bookings||[];
  } catch(e){}
  updateAdminStats(); renderAdminRecent();
}
function updateAdminStats() {
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('statTotal',adminBookings.length);
  set('statActive',adminBookings.filter(b=>b.status==='active').length);
  set('statCancelled',adminBookings.filter(b=>b.status==='cancelled').length);
}
function setAdminFilter(v){ adminFilter=(v||'').trim().toLowerCase(); renderAdminRecent(); }

function renderAdminRecent() {
  const el=document.getElementById('adminRecentList'); if(!el) return;

  let list = adminBookings.map(b => {
    const ps = parseStudent(b.students?.email);
    return { ...b, _email: b.students?.email || '', _matric: ps.matric, _course: ps.course };
  });

  if (adminFilter) {
    list = list.filter(b =>
      b._email.toLowerCase().includes(adminFilter) ||
      b._course.toLowerCase().includes(adminFilter) ||
      b._matric.toLowerCase().includes(adminFilter) ||
      sportLabel(b.sport).toLowerCase().includes(adminFilter)
    );
  }

  if(!list.length){ el.innerHTML=`<div class="empty-state"><p>${t('recentEmpty')}</p></div>`; return; }

  el.innerHTML=`<div style="overflow-x:auto;"><table class="data-table">
    <thead><tr>
      <th>${t('thStudent')}</th><th>${t('thCourse')}</th><th>${t('sumSport')}</th>
      <th>${t('sumCourt')}</th><th>${t('sumDate')}</th><th>${t('sumSlot')}</th>
      <th>Status</th><th>${t('thAction')}</th>
    </tr></thead>
    <tbody>${list.map(b=>`<tr>
      <td><strong>${b._matric}</strong><br><span style="font-size:10px;color:var(--muted);">${b._email}</span></td>
      <td><span class="badge badge-active" style="background:var(--green-soft);color:var(--green-700);">${b._course}</span></td>
      <td>${sportLabel(b.sport)}</td>
      <td>${b.courts?.name||''}</td>
      <td>${b.booking_date}</td>
      <td style="font-size:11px;">${slotLabelFromMs(b.slots?.label_ms)}</td>
      <td><span class="badge badge-${b.status==='active'?'active':'cancelled'}">${b.status==='active'?t('active'):t('cancelled')}</span></td>
      <td>${b.status==='active'?`<button class="btn-danger-sm" onclick="adminCancelBooking('${b.id}')">${t('btnCancel')}</button>`:'—'}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

async function adminCancelBooking(id) {
  if(!confirm(t('adminCancelConfirm'))) return;
  const u=document.getElementById('inAdminUser')?.value, p=document.getElementById('inAdminPass')?.value;
  try {
    const data=await callApi({action:'adminCancel',adminUser:u,adminPass:p,booking_id:id});
    if(data.success){ await loadAdminData(); }
    else alert(data.error||t('cancelFail'));
  } catch(e){ alert(t('aServerFail')); }
}

async function adminAddStudent() {
  const email = document.getElementById('inNewEmail').value.trim().toLowerCase();
  const nama  = document.getElementById('inNewName').value.trim();
  clearAlert('addStudentAlert');
  if (!email) { showAlert('addStudentAlert', t('aEnterEmail'), 'warning'); return; }
  if (!nama)  { showAlert('addStudentAlert', t('aEnterName'), 'warning'); return; }

  const u=document.getElementById('inAdminUser')?.value, p=document.getElementById('inAdminPass')?.value;
  showAlert('addStudentAlert', t('aRegistering'), 'info');
  try {
    const data = await callApi({ action:'adminAddStudent', adminUser:u, adminPass:p, email, nama });
    if (data.success) {
      showAlert('addStudentAlert', t('studentAdded'), 'success');
      document.getElementById('inNewEmail').value='';
      document.getElementById('inNewName').value='';
    } else {
      showAlert('addStudentAlert', data.error || t('addStudentFail'));
    }
  } catch(e) { showAlert('addStudentAlert', t('aServerFail')); }
}

async function adminResetPassword(email) {
  if(!email){ alert(t('aEnterEmail')); return; }
  if(!confirm(`${t('btnReset')}: ${email}?`)) return;
  const u=document.getElementById('inAdminUser')?.value, p=document.getElementById('inAdminPass')?.value;
  try {
    const data=await callApi({action:'adminReset',adminUser:u,adminPass:p,email});
    if(data.success){ alert(t('resetDone')); document.getElementById('inResetEmail').value=''; }
    else alert(data.error||t('resetFail'));
  } catch(e){ alert(t('aServerFail')); }
}

/* ───────── [INIT] ───────── */
document.addEventListener('DOMContentLoaded',()=>{
  const today=new Date().toISOString().split('T')[0];
  const d=document.getElementById('inDate'); if(d){d.min=today;d.value=today;}
  document.getElementById('inEmail')?.addEventListener('keydown',e=>{if(e.key==='Enter')checkEmail();});
  document.getElementById('inPass')?.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  document.getElementById('inAdminPass')?.addEventListener('keydown',e=>{if(e.key==='Enter')doAdminLogin();});
  applyLang();
  renderSportSelection();
});