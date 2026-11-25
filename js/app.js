// ==================== INISIALISASI & ROUTING HALAMAN ALGO ADVENTURE ====================

function switchPage(pageId) {
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  const navBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (pageId === 'admin') {
    const sess = getCurrentSession();
    if (!sess || sess.role !== 'admin') {
      openAuthModal('admin');
      switchPage('beranda');
      return;
    }
    renderAdminStudentTable();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshAppState() {
  const sess = getCurrentSession();
  const st = getActiveProgress();

  // Update Header User Pill & Auth Banner
  const navAdminBtn = document.getElementById('navAdminBtn');
  if (sess && sess.role === 'admin') {
    document.getElementById('navUserAvatar').textContent = '🛡️';
    document.getElementById('navUserLabel').textContent = 'Guru / Admin';
    document.getElementById('navAuthBtn').textContent = 'Akun Admin';
    navAdminBtn.classList.remove('hidden');
    document.getElementById('authBannerTitle').textContent = 'Mode Guru / Admin Aktif';
    document.getElementById('authBannerDesc').textContent = 'Anda dapat memantau seluruh siswa Kelas XA & XB, mengedit soal, mengubah background header, dan mengunduh rekap Excel.';
  } else if (sess && sess.role === 'student') {
    document.getElementById('navUserAvatar').textContent = '🎓';
    document.getElementById('navUserLabel').textContent = `${sess.kelas} - ${sess.name}`;
    document.getElementById('navAuthBtn').textContent = 'Ganti / Keluar';
    navAdminBtn.classList.add('hidden');
    document.getElementById('authBannerTitle').textContent = `Halo, ${sess.name} (${sess.kelas})!`;
    document.getElementById('authBannerDesc').textContent = 'Progres belajar, skor misi, Pretest, Posttest, dan N-Gain kamu otomatis tersimpan ke database kelas.';
  } else {
    document.getElementById('navUserAvatar').textContent = '👦';
    document.getElementById('navUserLabel').textContent = 'Kelas X - Tamu';
    document.getElementById('navAuthBtn').textContent = 'Masuk / Daftar';
    navAdminBtn.classList.add('hidden');
    document.getElementById('authBannerTitle').textContent = 'Portal Akun Siswa (Kelas XA & XB) & Guru Admin';
    document.getElementById('authBannerDesc').textContent = 'Masuk atau daftar terlebih dahulu agar skor game, Pretest, Posttest, dan N-Gain tersimpan otomatis ke database kelas & Google Sheets.';
  }

  // Update Poin & Progress Bar
  document.getElementById('totalPoints').textContent = st.points;
  const doneCount = st.completedLevels.length;
  const pct = Math.round((doneCount / 4) * 100);
  document.getElementById('progressYellow').style.width = `${Math.max(pct, 15)}%`;
  document.getElementById('progressBadgeText').textContent = `${pct}%`;
  document.getElementById('progressBlue').style.width = `${Math.max(0, 100 - pct - 15)}%`;
  document.getElementById('progressSummaryText').textContent = `${pct}% • ${doneCount}/4 Level Selesai`;

  // Update Status Kartu Misi C1-C4
  const defaultStatuses = {
    1: { cls: 'mission-status status-ready', txt: '✦ Siap Dimainkan' },
    2: { cls: 'mission-status status-active', txt: '▶ Sedang Berjalan' },
    3: { cls: 'mission-status status-locked', txt: '🔒 Klik untuk Buka' },
    4: { cls: 'mission-status status-locked', txt: '🔒 Klik untuk Buka' }
  };
  for (let lvl = 1; lvl <= 4; lvl++) {
    const statusEl = document.getElementById(`status-level-${lvl}`);
    if (!statusEl) continue;
    if (st.completedLevels.includes(lvl)) {
      statusEl.className = 'mission-status status-done';
      statusEl.textContent = '✔ Level Selesai';
    } else {
      statusEl.className = defaultStatuses[lvl].cls;
      statusEl.textContent = defaultStatuses[lvl].txt;
    }
  }

  // Update Ringkasan Pretest, Posttest & N-Gain
  document.getElementById('displayPretestScore').textContent = st.pretest !== null ? st.pretest : '-';
  document.getElementById('displayPretestDetail').textContent = st.pretest !== null ? 'Selesai dikerjakan' : 'Belum dikerjakan';
  document.getElementById('displayPosttestScore').textContent = st.posttest !== null ? st.posttest : '-';
  document.getElementById('displayPosttestDetail').textContent = st.posttest !== null ? 'Selesai dikerjakan' : 'Belum dikerjakan';
  document.getElementById('displayNGainValue').textContent = st.ngain !== null ? st.ngain.toFixed(2) : '-';
  document.getElementById('displayNGainCategory').textContent = st.ngainCategory || 'Menunggu Pretest & Posttest';

  renderLeaderboards();
}

function renderLeaderboards() {
  const sorted = [...getStudentsDB()].sort((a, b) => b.points - a.points);
  const medals = ['🥇', '🥈', '🥉'];

  const miniEl = document.getElementById('miniLeaderboard');
  if (miniEl) {
    miniEl.innerHTML = sorted.slice(0, 3).map((s, i) => `
      <div class="lb-row">
        <div class="lb-left">
          <span>${medals[i] || '🏅'}</span>
          <span>${escapeHtml(s.name)} <small style="color:#64748B;">(${escapeHtml(s.kelas)})</small></span>
        </div>
        <span class="lb-pts">${s.points} pts</span>
      </div>
    `).join('');
  }

  const fullEl = document.getElementById('fullLeaderboardList');
  if (fullEl) {
    fullEl.innerHTML = sorted.map((s, i) => `
      <div class="lb-row">
        <div class="lb-left">
          <span>${medals[i] || `#${i + 1}`}</span>
          <span>${escapeHtml(s.name)} <small style="color:#64748B;">(${escapeHtml(s.kelas)})</small></span>
        </div>
        <span class="lb-pts">${s.points} pts</span>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyHeaderVisuals();
  renderFlowchartBank();
  refreshAppState();
});
