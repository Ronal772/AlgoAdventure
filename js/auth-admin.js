// ==================== AUTH SISWA, ADMIN PANEL, GOOGLE SHEETS & EXCEL EXPORT ====================

function getAdminCredentials() {
  const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.username && parsed.password) return parsed;
    } catch (e) {}
  }
  return { ...DEFAULT_ADMIN_CREDENTIALS };
}

function togglePasswordVisibility(inputId, btnEl) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  if (btnEl) {
    const openSvg = btnEl.querySelector('.eye-open-icon');
    const closedSvg = btnEl.querySelector('.eye-closed-icon');
    if (openSvg && closedSvg) {
      // Saat password terlihat (text), tampilkan ikon mata tertutup (tutup password)
      // Saat password tersembunyi (password), tampilkan ikon mata terbuka
      openSvg.classList.toggle('hidden', isPass);
      closedSvg.classList.toggle('hidden', !isPass);
    }
  }
}

function getStudentsDB() {
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  const seed = [
    { name: 'Rina Putri', kelas: 'Kelas XA', password: 'rina123', lastLogin: '25/11/2026 08:15', points: 950, completedLevels: [1, 2, 3, 4], pretest: 60, posttest: 95, ngain: 0.88, ngainCategory: 'Tinggi (High Gain)' },
    { name: 'Fahri Alamsyah', kelas: 'Kelas XB', password: 'fahri123', lastLogin: '25/11/2026 08:22', points: 820, completedLevels: [1, 2, 3], pretest: 55, posttest: 85, ngain: 0.67, ngainCategory: 'Sedang (Medium Gain)' },
    { name: 'Alya N', kelas: 'Kelas XA', password: 'alya123', lastLogin: '25/11/2026 08:30', points: 760, completedLevels: [1, 2, 3], pretest: 50, posttest: 80, ngain: 0.60, ngainCategory: 'Sedang (Medium Gain)' }
  ];
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(seed));
  return seed;
}

function saveStudentsDB(list) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
}

function getCurrentSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function setCurrentSession(sessionObj) {
  if (!sessionObj) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionObj));
  }
}

function formatNowID() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function openAuthModal(defaultTab = 'login') {
  document.getElementById('authModal').classList.remove('hidden');
  switchAuthTab(defaultTab);
  const sess = getCurrentSession();
  const activeBox = document.getElementById('activeAccountBox');
  if (sess) {
    activeBox.classList.remove('hidden');
    document.getElementById('activeAccountSummary').textContent =
      sess.role === 'admin' ? 'Guru / Admin Informatika' : `${sess.name} (${sess.kelas})`;
  } else {
    activeBox.classList.add('hidden');
  }
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function switchAuthTab(tab) {
  ['tabBtnLogin', 'tabBtnRegister', 'tabBtnAdmin'].forEach(id => document.getElementById(id).classList.remove('active'));
  ['formStudentLogin', 'formStudentRegister', 'formAdminLogin'].forEach(id => document.getElementById(id).classList.add('hidden'));

  if (tab === 'login') {
    document.getElementById('tabBtnLogin').classList.add('active');
    document.getElementById('formStudentLogin').classList.remove('hidden');
  } else if (tab === 'register') {
    document.getElementById('tabBtnRegister').classList.add('active');
    document.getElementById('formStudentRegister').classList.remove('hidden');
  } else {
    document.getElementById('tabBtnAdmin').classList.add('active');
    document.getElementById('formAdminLogin').classList.remove('hidden');
  }
}

function handleStudentRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regStudentName').value.trim();
  const kelas = document.getElementById('regStudentClass').value;
  const password = document.getElementById('regStudentPass').value.trim();

  if (!name || !password) return;
  const db = getStudentsDB();
  const exists = db.find(s => s.name.toLowerCase() === name.toLowerCase() && s.kelas === kelas);
  if (exists) {
    alert(`Nama "${name}" di ${kelas} sudah terdaftar! Silakan gunakan tab Login Siswa.`);
    switchAuthTab('login');
    return;
  }

  const newStudent = {
    name,
    kelas,
    password,
    lastLogin: formatNowID(),
    points: 100,
    completedLevels: [1, 2],
    pretest: null,
    posttest: null,
    ngain: null,
    ngainCategory: 'Belum Lengkap'
  };

  db.push(newStudent);
  saveStudentsDB(db);
  setCurrentSession({ role: 'student', name: newStudent.name, kelas: newStudent.kelas });
  sendStudentToGoogleSheet(newStudent);

  closeAuthModal();
  refreshAppState();
  alert(`Registrasi berhasil! Selamat datang, ${name} (${kelas}).`);
}

function handleStudentLogin(e) {
  e.preventDefault();
  const name = document.getElementById('loginStudentName').value.trim();
  const kelas = document.getElementById('loginStudentClass').value;
  const password = document.getElementById('loginStudentPass').value.trim();

  const db = getStudentsDB();
  const idx = db.findIndex(s => s.name.toLowerCase() === name.toLowerCase() && s.kelas === kelas && s.password === password);
  if (idx === -1) {
    alert('Nama, Kelas, atau Password tidak cocok! Jika belum punya akun, silakan klik tab "Daftar Siswa".');
    return;
  }

  db[idx].lastLogin = formatNowID();
  saveStudentsDB(db);
  setCurrentSession({ role: 'student', name: db[idx].name, kelas: db[idx].kelas });
  sendStudentToGoogleSheet(db[idx]);

  closeAuthModal();
  refreshAppState();
}

function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('adminUsernameInput').value.trim();
  const p = document.getElementById('adminPasswordInput').value.trim();
  const creds = getAdminCredentials();

  if (u === creds.username && p === creds.password) {
    setCurrentSession({ role: 'admin', name: 'Guru Admin' });
    closeAuthModal();
    refreshAppState();
    switchPage('admin');
  } else {
    alert('Username atau Password Admin salah!');
  }
}

function logoutUser() {
  setCurrentSession(null);
  closeAuthModal();
  refreshAppState();
  switchPage('beranda');
}

// ==================== PANEL ADMIN FUNCTIONS ====================
let currentAdminClassFilter = 'ALL';

function switchAdminTab(tabName, btnEl) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  ['siswa', 'soal', 'tampilan', 'gsheet', 'akun'].forEach(t => {
    const sec = document.getElementById(`admin-tab-${t}`);
    if (sec) sec.classList.add('hidden');
  });
  const activeSec = document.getElementById(`admin-tab-${tabName}`);
  if (activeSec) activeSec.classList.remove('hidden');

  if (tabName === 'siswa') renderAdminStudentTable();
  if (tabName === 'soal') initAdminQuestionSelector();
  if (tabName === 'tampilan') loadHeaderSettingsUI();
  if (tabName === 'gsheet') loadGoogleSheetUI();
  if (tabName === 'akun') loadAdminCredentialsUI();
}

function loadAdminCredentialsUI() {
  const creds = getAdminCredentials();
  document.getElementById('newAdminUsernameInput').value = creds.username;
  document.getElementById('newAdminPasswordInput').value = creds.password;
}

function saveAdminCredentials(e) {
  e.preventDefault();
  const username = document.getElementById('newAdminUsernameInput').value.trim();
  const password = document.getElementById('newAdminPasswordInput').value.trim();
  if (!username || password.length < 4) {
    alert('Username wajib diisi dan password minimal 4 karakter.');
    return;
  }
  localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify({ username, password }));
  alert('Username dan password admin berhasil diperbarui!');
}

function resetAdminCredentials() {
  if (!confirm('Kembalikan username dan password admin ke default (admin / admin123)?')) return;
  localStorage.removeItem(STORAGE_KEYS.ADMIN_CREDS);
  loadAdminCredentialsUI();
  alert('Kredensial admin dikembalikan ke default.');
}

function filterAdminClass(filterVal, btnEl) {
  currentAdminClassFilter = filterVal;
  document.querySelectorAll('.filter-class-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderAdminStudentTable();
}

function renderAdminStudentTable() {
  const db = getStudentsDB();
  const xaCount = db.filter(s => s.kelas === 'Kelas XA').length;
  const xbCount = db.filter(s => s.kelas === 'Kelas XB').length;
  document.getElementById('countAll').textContent = db.length;
  document.getElementById('countXA').textContent = xaCount;
  document.getElementById('countXB').textContent = xbCount;

  const filtered = currentAdminClassFilter === 'ALL'
    ? db
    : db.filter(s => s.kelas === currentAdminClassFilter);

  const tbody = document.getElementById('adminStudentTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  filtered.forEach((s, index) => {
    const realIndex = db.findIndex(item => item.name === s.name && item.kelas === s.kelas);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td><span class="q-bloom">${escapeHtml(s.kelas)}</span></td>
      <td><code>${escapeHtml(s.password)}</code></td>
      <td>${escapeHtml(s.lastLogin || '-')}</td>
      <td><strong>${s.points}</strong></td>
      <td>${s.pretest !== null ? s.pretest : '-'}</td>
      <td>${s.posttest !== null ? s.posttest : '-'}</td>
      <td>${s.ngain !== null ? `${s.ngain} (${s.ngainCategory})` : '-'}</td>
      <td>
        <button class="btn-mini-edit" onclick="changeStudentPassword(${realIndex})">🔑 Ubah Password</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function changeStudentPassword(dbIndex) {
  const db = getStudentsDB();
  const student = db[dbIndex];
  if (!student) return;
  const newPass = prompt(`Masukkan password baru untuk ${student.name} (${student.kelas}):`, student.password);
  if (newPass && newPass.trim().length >= 3) {
    db[dbIndex].password = newPass.trim();
    saveStudentsDB(db);
    sendStudentToGoogleSheet(db[dbIndex]);
    renderAdminStudentTable();
    alert(`Password untuk ${student.name} berhasil diubah!`);
  }
}

// ==================== EXPORT EXCEL (.XLS) RAPI BER-BORDER & PEMBATAS KELAS ====================
function buildExcelSectionRows(titleBanner, studentList) {
  let html = `
    <tr>
      <td colspan="10" style="background-color:#DBEAFE; color:#1E3A8A; font-weight:bold; font-size:12pt; text-align:left; padding:8px; border:1px solid #000000;">
        ${escapeHtml(titleBanner)}
      </td>
    </tr>
    <tr>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:45px;">No</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:190px;">Nama Siswa</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:95px;">Kelas</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:110px;">Password</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:165px;">Waktu Login Terakhir</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:95px;">Poin Game</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:95px;">Skor Pretest</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:95px;">Skor Posttest</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:95px;">Nilai N-Gain</th>
      <th style="background-color:#1D4ED8; color:#FFFFFF; font-weight:bold; text-align:center; padding:8px; border:1px solid #000000; width:175px;">Kategori Peningkatan</th>
    </tr>
  `;

  if (studentList.length === 0) {
    html += `
      <tr>
        <td colspan="10" style="text-align:center; padding:8px; border:1px solid #000000; font-style:italic; color:#64748B;">
          Belum ada data siswa terdaftar pada kelas ini.
        </td>
      </tr>
    `;
    return html;
  }

  studentList.forEach((s, idx) => {
    const bg = idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF';
    html += `
      <tr style="background-color:${bg};">
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${idx + 1}</td>
        <td style="text-align:left; padding:6px; border:1px solid #000000;">${escapeHtml(s.name)}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${escapeHtml(s.kelas)}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000; mso-number-format:'\@';">${escapeHtml(s.password)}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000; mso-number-format:'\@';">${escapeHtml(s.lastLogin || '-')}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${s.points}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${s.pretest !== null ? s.pretest : '-'}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${s.posttest !== null ? s.posttest : '-'}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${s.ngain !== null ? s.ngain : '-'}</td>
        <td style="text-align:center; padding:6px; border:1px solid #000000;">${escapeHtml(s.ngainCategory || 'Belum Lengkap')}</td>
      </tr>
    `;
  });

  return html;
}

function exportClassExcel(targetClass) {
  const db = getStudentsDB();
  const exportDate = formatNowID();

  let subtitleLabel = '';
  let fileSuffix = '';
  let tableBodyHtml = '';

  if (targetClass === 'ALL') {
    subtitleLabel = 'REKAPITULASI NILAI SISWA — SEMUA KELAS (KELAS XA & KELAS XB)';
    fileSuffix = 'Semua_Kelas_XA_XB';
    const listXA = db.filter(s => s.kelas === 'Kelas XA');
    const listXB = db.filter(s => s.kelas === 'Kelas XB');

    tableBodyHtml += buildExcelSectionRows('1. DATA SISWA KELAS XA', listXA);
    tableBodyHtml += `
      <tr><td colspan="10" style="height:14px; border:none;"></td></tr>
      <tr>
        <td colspan="10" style="background-color:#FACC15; color:#0F172A; font-weight:bold; text-align:center; padding:7px; border:2px solid #000000;">
          ══════════ PEMBATAS DATA KELAS — LANJUT KE DATA SISWA KELAS XB ══════════
        </td>
      </tr>
      <tr><td colspan="10" style="height:14px; border:none;"></td></tr>
    `;
    tableBodyHtml += buildExcelSectionRows('2. DATA SISWA KELAS XB', listXB);
  } else {
    subtitleLabel = `REKAPITULASI NILAI SISWA — ${targetClass.toUpperCase()}`;
    fileSuffix = targetClass.replace(/\s+/g, '_');
    const filteredList = db.filter(s => s.kelas === targetClass);
    tableBodyHtml += buildExcelSectionRows(`DATA SISWA ${targetClass.toUpperCase()}`, filteredList);
  }

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8" />
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>Rekap Nilai Algoritma</x:Name>
      <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body>
      <table style="border-collapse:collapse; font-family:Calibri, Arial, sans-serif; font-size:11pt;">
        <tr>
          <td colspan="10" style="font-size:16pt; font-weight:bold; text-align:center; background-color:#0F296B; color:#FACC15; padding:12px; border:1px solid #000000;">
            TES ALGORITMA - ALGO ADVENTURE
          </td>
        </tr>
        <tr>
          <td colspan="10" style="font-size:12pt; font-weight:bold; text-align:center; background-color:#EFF6FF; color:#1E3A8A; padding:8px; border:1px solid #000000;">
            ${subtitleLabel}
          </td>
        </tr>
        <tr>
          <td colspan="10" style="font-size:10pt; text-align:center; color:#334155; padding:6px; border:1px solid #000000;">
            Mata Pelajaran: Informatika Kelas X • Materi: Algoritma &amp; Pemrograman Dasar • Tanggal Unduh: ${exportDate}
          </td>
        </tr>
        <tr><td colspan="10" style="height:10px; border:none;"></td></tr>
        ${tableBodyHtml}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_Tes_Algoritma_${fileSuffix}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== EDITOR SOAL & BACKGROUND HEADER ====================
function getQuestionBank(type) {
  const key = type === 'posttest' ? STORAGE_KEYS.POSTTEST_BANK : STORAGE_KEYS.PRETEST_BANK;
  const raw = localStorage.getItem(key);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(type === 'posttest' ? DEFAULT_POSTTEST_QUESTIONS : DEFAULT_PRETEST_QUESTIONS));
}

function initAdminQuestionSelector() {
  const numSelect = document.getElementById('adminQuestionNumSelect');
  if (numSelect.options.length === 0) {
    for (let i = 0; i < 20; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Soal Nomor ${i + 1}`;
      numSelect.appendChild(opt);
    }
  }
  loadAdminQuestionEditor();
}

function loadAdminQuestionEditor() {
  const type = document.getElementById('adminQuizTypeSelect').value;
  const idx = parseInt(document.getElementById('adminQuestionNumSelect').value || '0', 10);
  const bank = getQuestionBank(type);
  const item = bank[idx];
  if (!item) return;

  document.getElementById('editQLevel').value = item.level;
  document.getElementById('editQAnswer').value = String(item.ans);
  document.getElementById('editQText').value = item.q;
  document.getElementById('editQOpt0').value = item.opts[0];
  document.getElementById('editQOpt1').value = item.opts[1];
  document.getElementById('editQOpt2').value = item.opts[2];
  document.getElementById('editQOpt3').value = item.opts[3];
  document.getElementById('editQExp').value = item.exp;
}

function saveAdminQuestion(e) {
  e.preventDefault();
  const type = document.getElementById('adminQuizTypeSelect').value;
  const idx = parseInt(document.getElementById('adminQuestionNumSelect').value, 10);
  const bank = getQuestionBank(type);

  bank[idx] = {
    level: document.getElementById('editQLevel').value,
    q: document.getElementById('editQText').value.trim(),
    opts: [
      document.getElementById('editQOpt0').value.trim(),
      document.getElementById('editQOpt1').value.trim(),
      document.getElementById('editQOpt2').value.trim(),
      document.getElementById('editQOpt3').value.trim()
    ],
    ans: parseInt(document.getElementById('editQAnswer').value, 10),
    exp: document.getElementById('editQExp').value.trim()
  };

  const key = type === 'posttest' ? STORAGE_KEYS.POSTTEST_BANK : STORAGE_KEYS.PRETEST_BANK;
  localStorage.setItem(key, JSON.stringify(bank));
  alert(`Soal ${type.toUpperCase()} Nomor ${idx + 1} berhasil diperbarui!`);
}

function resetDefaultQuestions() {
  if (!confirm('Kembalikan seluruh soal Pretest & Posttest ke versi bawaan?')) return;
  localStorage.removeItem(STORAGE_KEYS.PRETEST_BANK);
  localStorage.removeItem(STORAGE_KEYS.POSTTEST_BANK);
  loadAdminQuestionEditor();
  alert('Bank soal berhasil dikembalikan ke pengaturan awal.');
}

function getHeaderConfig() {
  const raw = localStorage.getItem(STORAGE_KEYS.HEADER_CFG);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  return { ...DEFAULT_HEADER_CONFIG };
}

function applyHeaderVisuals() {
  const cfg = getHeaderConfig();
  const bgEl = document.getElementById('heroSchoolBg');
  const ovEl = document.getElementById('heroBlueOverlay');
  const alpha = (cfg.opacity / 100).toFixed(2);
  if (bgEl && cfg.bgUrl) {
    bgEl.style.backgroundImage = `url('${cfg.bgUrl}')`;
  }
  if (ovEl) {
    ovEl.style.background = `linear-gradient(135deg, rgba(15, 41, 107, ${alpha}) 0%, rgba(29, 78, 216, ${alpha}) 50%, rgba(37, 99, 235, ${alpha}) 100%)`;
  }
}

function loadHeaderSettingsUI() {
  const cfg = getHeaderConfig();
  document.getElementById('headerBgUrlInput').value = cfg.bgUrl;
  document.getElementById('headerOpacityRange').value = cfg.opacity;
  document.getElementById('opacityValLabel').textContent = `${cfg.opacity}%`;
  document.getElementById('adminBgPreviewBox').style.backgroundImage = `url('${cfg.bgUrl}')`;
  document.getElementById('adminBgPreviewOverlay').style.background = `rgba(29, 78, 216, ${(cfg.opacity / 100).toFixed(2)})`;
}

function previewHeaderOpacity(val) {
  document.getElementById('opacityValLabel').textContent = `${val}%`;
  document.getElementById('adminBgPreviewOverlay').style.background = `rgba(29, 78, 216, ${(val / 100).toFixed(2)})`;
}

function handleHeaderBgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const dataUrl = ev.target.result;
    document.getElementById('headerBgUrlInput').value = dataUrl;
    document.getElementById('adminBgPreviewBox').style.backgroundImage = `url('${dataUrl}')`;
  };
  reader.readAsDataURL(file);
}

function applyHeaderBgSettings() {
  const bgUrl = document.getElementById('headerBgUrlInput').value.trim() || DEFAULT_HEADER_CONFIG.bgUrl;
  const opacity = parseInt(document.getElementById('headerOpacityRange').value, 10);
  localStorage.setItem(STORAGE_KEYS.HEADER_CFG, JSON.stringify({ bgUrl, opacity }));
  applyHeaderVisuals();
  loadHeaderSettingsUI();
  alert('Background header sekolah berhasil diperbarui!');
}

function resetHeaderBgSettings() {
  localStorage.setItem(STORAGE_KEYS.HEADER_CFG, JSON.stringify(DEFAULT_HEADER_CONFIG));
  applyHeaderVisuals();
  loadHeaderSettingsUI();
}

// ==================== GOOGLE SHEETS SYNC ====================
function loadGoogleSheetUI() {
  const url = localStorage.getItem(STORAGE_KEYS.GSHEET_URL) || '';
  document.getElementById('googleSheetUrlInput').value = url;
  if (url) {
    document.getElementById('gsheetStatusText').textContent = 'Status: Terhubung ke URL Google Apps Script ✅';
  }
}

function saveGoogleSheetUrl() {
  const url = document.getElementById('googleSheetUrlInput').value.trim();
  localStorage.setItem(STORAGE_KEYS.GSHEET_URL, url);
  document.getElementById('gsheetStatusText').textContent = url
    ? 'Status: URL Google Apps Script berhasil disimpan & aktif ✅'
    : 'Status: URL dikosongkan (Mode Penyimpanan Lokal)';
  alert('Konfigurasi Google Sheets disimpan!');
}

function sendStudentToGoogleSheet(studentObj) {
  const url = localStorage.getItem(STORAGE_KEYS.GSHEET_URL);
  if (!url) return;
  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentObj)
  }).catch(() => {});
}

function syncAllToGoogleSheet() {
  const url = localStorage.getItem(STORAGE_KEYS.GSHEET_URL);
  if (!url) {
    alert('Masukkan dan simpan URL Web App Google Apps Script terlebih dahulu.');
    return;
  }
  const db = getStudentsDB();
  db.forEach(s => sendStudentToGoogleSheet(s));
  alert(`Sinkronisasi ${db.length} data siswa ke Google Sheets telah dikirim!`);
}

function copyAppsScriptCode() {
  const text = document.getElementById('appsScriptCodeBlock').textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('Kode Google Apps Script berhasil disalin!');
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
