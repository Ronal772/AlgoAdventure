// ==================== MISI C1-C4, DRAG & DROP FLOWCHART, PRETEST/POSTTEST & N-GAIN ====================

let guestState = {
  points: 100,
  completedLevels: [1, 2],
  pretest: null,
  posttest: null,
  ngain: null,
  ngainCategory: 'Menunggu Pretest & Posttest'
};

function getActiveProgress() {
  const sess = getCurrentSession();
  if (sess && sess.role === 'student') {
    const db = getStudentsDB();
    const found = db.find(s => s.name === sess.name && s.kelas === sess.kelas);
    if (found) return found;
  }
  return guestState;
}

function updateActiveProgress(updaterFn) {
  const sess = getCurrentSession();
  if (sess && sess.role === 'student') {
    const db = getStudentsDB();
    const idx = db.findIndex(s => s.name === sess.name && s.kelas === sess.kelas);
    if (idx !== -1) {
      updaterFn(db[idx]);
      saveStudentsDB(db);
      sendStudentToGoogleSheet(db[idx]);
      return;
    }
  }
  updaterFn(guestState);
}

// ==================== MODAL MISI C1-C4 ====================
let selectedMissionOption = null;

function openMissionModal(level) {
  const m = MISSION_DATA[level];
  if (!m) return;
  selectedMissionOption = null;
  document.getElementById('modalBloomBadge').textContent = m.badge;
  document.getElementById('modalTitle').textContent = m.title;

  const optsHtml = m.options.map((opt, idx) => `
    <label class="option-label mission-opt-item" id="mission-opt-${idx}" onclick="selectMissionOption(${idx})">
      <input type="radio" name="missionChoice" value="${idx}" style="accent-color:#1D4ED8; width:17px; height:17px;" />
      <strong>${String.fromCharCode(65 + idx)}.</strong> <span>${escapeHtml(opt)}</span>
    </label>
  `).join('');

  const nextLevel = level < 4 ? level + 1 : null;
  const nextBtnHtml = nextLevel
    ? `<button type="button" id="btnNextMission" class="btn-next-step hidden" onclick="openMissionModal(${nextLevel})">Lanjut ke Level ${nextLevel} →</button>`
    : `<button type="button" id="btnNextMission" class="btn-hero-play hidden" style="font-size:0.95rem; padding:10px 18px; border-radius:12px;" onclick="closeMissionModal()">🎉 Selesai Semua Level</button>`;

  document.getElementById('modalBody').innerHTML = `
    <p style="white-space:pre-line; font-weight:700; margin-bottom:14px; line-height:1.55;">${escapeHtml(m.question)}</p>
    <div class="options-grid">${optsHtml}</div>
    <div id="missionFeedback" class="feedback-banner hidden"></div>
    <div class="mission-modal-actions" style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-top:16px; padding-top:12px; border-top:1.5px solid #E2E8F0;">
      <button type="button" class="btn-reset" onclick="closeMissionModal()">Tutup</button>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button type="button" id="btnSubmitMission" class="btn-check" onclick="submitMissionAnswer(${level})">✔ Submit Jawaban</button>
        ${nextBtnHtml}
      </div>
    </div>
  `;
  document.getElementById('missionModal').classList.remove('hidden');
}

function selectMissionOption(idx) {
  selectedMissionOption = idx;
  document.querySelectorAll('.mission-opt-item').forEach((el, i) => {
    const isSel = i === idx;
    el.style.borderColor = isSel ? '#1D4ED8' : '#CBD5E1';
    el.style.background = isSel ? '#EFF6FF' : '#FFFFFF';
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = isSel;
  });
}

function closeMissionModal() {
  document.getElementById('missionModal').classList.add('hidden');
}

function submitMissionAnswer(level) {
  const m = MISSION_DATA[level];
  const fb = document.getElementById('missionFeedback');
  fb.classList.remove('hidden', 'feedback-success', 'feedback-error');

  if (selectedMissionOption === null) {
    fb.classList.add('feedback-error');
    fb.innerHTML = '⚠️ <b>Pilih salah satu jawaban (A, B, C, atau D) terlebih dahulu!</b>';
    return;
  }

  const nextBtn = document.getElementById('btnNextMission');

  if (selectedMissionOption === m.correct) {
    fb.classList.add('feedback-success');
    fb.innerHTML = `🎉 <b>Benar! (+${m.points} Poin)</b><br/>${escapeHtml(m.explanation)}`;
    updateActiveProgress(st => {
      if (!st.completedLevels.includes(level)) {
        st.completedLevels.push(level);
        st.points += m.points;
      }
    });
    refreshAppState();
    if (nextBtn) nextBtn.classList.remove('hidden');
  } else {
    fb.classList.add('feedback-error');
    fb.innerHTML = `❌ <b>Kurang tepat!</b> Silakan pilih jawaban lain lalu klik <b>Submit Jawaban</b> lagi, atau lanjut ke level berikutnya.`;
    if (nextBtn) nextBtn.classList.remove('hidden');
  }
}

// ==================== DRAG & DROP FLOWCHART ====================
let slotAssignments = [null, null, null, null, null, null];
let selectedBlockId = null;

function renderFlowchartBank() {
  const bankEl = document.getElementById('blockBank');
  if (!bankEl) return;
  bankEl.innerHTML = '';

  FLOWCHART_BLOCKS.forEach(block => {
    const isUsed = slotAssignments.includes(block.id);
    if (isUsed) return;
    const chip = document.createElement('div');
    chip.className = 'flow-chip' + (selectedBlockId === block.id ? ' selected-chip' : '');
    chip.textContent = block.label;
    chip.draggable = true;
    chip.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', block.id);
    };
    chip.onclick = () => {
      selectedBlockId = selectedBlockId === block.id ? null : block.id;
      renderFlowchartBank();
    };
    bankEl.appendChild(chip);
  });

  for (let i = 0; i < 6; i++) {
    const slotEl = document.getElementById(`slot-${i}`);
    if (!slotEl) continue;
    slotEl.ondragover = (e) => e.preventDefault();
    slotEl.ondrop = (e) => {
      e.preventDefault();
      const bId = e.dataTransfer.getData('text/plain');
      if (bId) placeBlockInSlot(i, bId);
    };

    const assignedId = slotAssignments[i];
    if (assignedId) {
      const bObj = FLOWCHART_BLOCKS.find(b => b.id === assignedId);
      slotEl.classList.add('filled');
      slotEl.innerHTML = `<span>${escapeHtml(bObj.label)}</span>`;
    } else {
      slotEl.classList.remove('filled');
      const defaults = ['▶ Mulai<br/><small>Drag here</small>', 'Slot 2<br/><small>Input</small>', 'Slot 3<br/><small>Kondisi (?)</small>', 'Slot 4<br/><small>Output Ya</small>', 'Slot 5: Output Cabang Salah', 'Slot 6<br/><small>Akhir</small>'];
      slotEl.innerHTML = `<span class="slot-placeholder">${defaults[i]}</span>`;
    }
  }
}

function placeBlockInSlot(slotIndex, blockId) {
  const prevIdx = slotAssignments.indexOf(blockId);
  if (prevIdx !== -1) slotAssignments[prevIdx] = null;
  slotAssignments[slotIndex] = blockId;
  selectedBlockId = null;
  renderFlowchartBank();
}

function handleSlotClick(slotIndex) {
  if (selectedBlockId) {
    placeBlockInSlot(slotIndex, selectedBlockId);
  } else if (slotAssignments[slotIndex]) {
    slotAssignments[slotIndex] = null;
    renderFlowchartBank();
  }
}

function resetFlowchart() {
  slotAssignments = [null, null, null, null, null, null];
  selectedBlockId = null;
  const fb = document.getElementById('flowchartFeedback');
  fb.classList.add('hidden');
  renderFlowchartBank();
}

function checkFlowchart() {
  const expected = ['b0', 'b1', 'b2', 'b3', 'b4', 'b5'];
  const fb = document.getElementById('flowchartFeedback');
  fb.classList.remove('hidden', 'feedback-success', 'feedback-error');

  const isCorrect = expected.every((id, idx) => slotAssignments[idx] === id);
  if (isCorrect) {
    fb.classList.add('feedback-success');
    fb.innerHTML = '🎉 <b>Sempurna! (+80 Poin)</b> Urutan flowchart mulai dari Mulai → Input Nilai → Kondisi nilai > 50 → Cabang Lulus/Tidak Lulus → Selesai sudah benar!';
    updateActiveProgress(st => {
      st.points += 80;
    });
    refreshAppState();
  } else {
    fb.classList.add('feedback-error');
    fb.innerHTML = '⚠️ <b>Belum tepat.</b> Pastikan urutan: Mulai → Input Nilai → Proses: nilai > 50 ? → Output: Lulus (cabang Ya) → Output: Tidak Lulus (cabang Tidak) → Selesai.';
  }
}

// ==================== PRETEST, POSTTEST (20 SOAL) & N-GAIN ====================
let activeQuizType = null;
let userQuizAnswers = [];
let currentQuizIndex = 0;

function focusQuizQuestion(idx, shouldScroll = true) {
  const total = userQuizAnswers.length;
  if (total === 0) return;
  currentQuizIndex = Math.max(0, Math.min(idx, total - 1));

  document.querySelectorAll('.q-pill').forEach((p, i) => {
    p.classList.toggle('active-q', i === currentQuizIndex);
  });
  document.querySelectorAll('.question-item').forEach((box, i) => {
    box.classList.toggle('active-question', i === currentQuizIndex);
  });

  const prevBtn = document.getElementById('btnPrevQuestion');
  const nextBtn = document.getElementById('btnNextQuestion');
  if (prevBtn) prevBtn.disabled = currentQuizIndex === 0;
  if (nextBtn) nextBtn.disabled = currentQuizIndex >= total - 1;

  if (shouldScroll) {
    const targetBox = document.getElementById(`qbox-${currentQuizIndex}`);
    if (targetBox) targetBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function nextQuizQuestion() {
  if (currentQuizIndex < userQuizAnswers.length - 1) {
    focusQuizQuestion(currentQuizIndex + 1, true);
  }
}

function prevQuizQuestion() {
  if (currentQuizIndex > 0) {
    focusQuizQuestion(currentQuizIndex - 1, true);
  }
}

function startQuiz(type) {
  activeQuizType = type;
  const bank = getQuestionBank(type);
  userQuizAnswers = new Array(bank.length).fill(null);
  currentQuizIndex = 0;

  document.getElementById('quizResultReview').classList.add('hidden');
  document.getElementById('quizWorkspace').classList.remove('hidden');
  document.getElementById('quizModeBadge').textContent = type.toUpperCase();
  document.getElementById('quizHeaderTitle').textContent =
    type === 'pretest' ? 'Pretest Algoritma Dasar (20 Soal C1–C4)' : 'Posttest Algoritma Dasar (20 Soal C1–C4)';

  const pillsEl = document.getElementById('questionNavPills');
  const listEl = document.getElementById('questionsContainer');
  pillsEl.innerHTML = '';
  listEl.innerHTML = '';

  bank.forEach((item, idx) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'q-pill';
    pill.id = `qpill-${idx}`;
    pill.textContent = idx + 1;
    pill.onclick = () => focusQuizQuestion(idx, true);
    pillsEl.appendChild(pill);

    const qDiv = document.createElement('div');
    qDiv.className = 'question-item';
    qDiv.id = `qbox-${idx}`;
    qDiv.onclick = () => focusQuizQuestion(idx, false);
    qDiv.innerHTML = `
      <div class="q-header">
        <span class="q-num">Soal #${idx + 1}</span>
        <span class="q-bloom">Ranah ${item.level}</span>
      </div>
      <div class="q-text">${escapeHtml(item.q)}</div>
      <div class="options-grid">
        ${item.opts.map((opt, oIdx) => `
          <label class="option-label">
            <input type="radio" name="q_${idx}" value="${oIdx}" onchange="selectQuizOption(${idx}, ${oIdx})" />
            <span><strong>${String.fromCharCode(65 + oIdx)}.</strong> ${escapeHtml(opt)}</span>
          </label>
        `).join('')}
      </div>
    `;
    listEl.appendChild(qDiv);
  });

  focusQuizQuestion(0, false);
  updateQuizAnsweredCounter();
  document.getElementById('quizWorkspace').scrollIntoView({ behavior: 'smooth' });
}

function selectQuizOption(qIdx, optIdx) {
  userQuizAnswers[qIdx] = optIdx;
  currentQuizIndex = qIdx;
  const pill = document.getElementById(`qpill-${qIdx}`);
  if (pill) pill.classList.add('answered');
  focusQuizQuestion(qIdx, false);
  updateQuizAnsweredCounter();
}

function updateQuizAnsweredCounter() {
  const count = userQuizAnswers.filter(a => a !== null).length;
  document.getElementById('quizAnsweredCount').textContent = `Terjawab: ${count} / ${userQuizAnswers.length}`;
}

function cancelQuiz() {
  document.getElementById('quizWorkspace').classList.add('hidden');
}

function submitQuiz() {
  const unanswered = userQuizAnswers.filter(a => a === null).length;
  if (unanswered > 0) {
    if (!confirm(`Masih ada ${unanswered} soal yang belum dijawab. Tetap kumpulkan sekarang?`)) return;
  }

  const bank = getQuestionBank(activeQuizType);
  let correctTotal = 0;
  const bloomStats = { C1: { ok: 0, tot: 0 }, C2: { ok: 0, tot: 0 }, C3: { ok: 0, tot: 0 }, C4: { ok: 0, tot: 0 } };

  let reviewHtml = `<h3>📋 Hasil &amp; Pembahasan ${activeQuizType.toUpperCase()}</h3>`;

  bank.forEach((item, idx) => {
    const userAns = userQuizAnswers[idx];
    const isCorrect = userAns === item.ans;
    if (isCorrect) correctTotal++;
    if (bloomStats[item.level]) {
      bloomStats[item.level].tot++;
      if (isCorrect) bloomStats[item.level].ok++;
    }

    reviewHtml += `
      <div class="question-item" style="border-color:${isCorrect ? '#22C55E' : '#EF4444'}; margin-top:10px;">
        <div class="q-header">
          <span class="q-num">Soal #${idx + 1}</span>
          <span class="q-bloom">${item.level}</span>
          <strong style="color:${isCorrect ? '#16A34A' : '#DC2626'};">${isCorrect ? '✔ Benar' : '✘ Salah'}</strong>
        </div>
        <p class="q-text">${escapeHtml(item.q)}</p>
        <p style="font-size:0.86rem;">Jawaban Kamu: <b>${userAns !== null ? String.fromCharCode(65 + userAns) + '. ' + escapeHtml(item.opts[userAns]) : 'Tidak dijawab'}</b></p>
        <p style="font-size:0.86rem; color:#166534;">Kunci Benar: <b>${String.fromCharCode(65 + item.ans)}. ${escapeHtml(item.opts[item.ans])}</b></p>
        <p style="font-size:0.84rem; color:#475569; margin-top:4px;">💡 <i>${escapeHtml(item.exp)}</i></p>
      </div>
    `;
  });

  const score100 = Math.round((correctTotal / bank.length) * 100);

  updateActiveProgress(st => {
    if (activeQuizType === 'pretest') {
      st.pretest = score100;
    } else {
      st.posttest = score100;
    }
    st.points += correctTotal * 5;

    if (st.pretest !== null && st.posttest !== null) {
      if (st.pretest >= 100) {
        st.ngain = 1.00;
        st.ngainCategory = 'Tinggi (High Gain)';
      } else {
        const rawG = (st.posttest - st.pretest) / (100 - st.pretest);
        const roundedG = Math.round(rawG * 100) / 100;
        st.ngain = roundedG;
        if (roundedG >= 0.7) st.ngainCategory = 'Tinggi (High Gain)';
        else if (roundedG >= 0.3) st.ngainCategory = 'Sedang (Medium Gain)';
        else st.ngainCategory = 'Rendah (Low Gain)';
      }
    }
  });

  document.getElementById('quizWorkspace').classList.add('hidden');
  const revEl = document.getElementById('quizResultReview');
  revEl.innerHTML = reviewHtml;
  revEl.classList.remove('hidden');

  renderBloomBreakdown(bloomStats);
  refreshAppState();
  revEl.scrollIntoView({ behavior: 'smooth' });
}

function renderBloomBreakdown(stats) {
  const card = document.getElementById('bloomBreakdownCard');
  const container = document.getElementById('bloomBarsContainer');
  card.classList.remove('hidden');
  container.innerHTML = ['C1', 'C2', 'C3', 'C4'].map(lvl => {
    const s = stats[lvl];
    const pct = s.tot > 0 ? Math.round((s.ok / s.tot) * 100) : 0;
    return `
      <div class="bloom-bar-item">
        <strong>Ranah ${lvl}</strong>
        <div style="font-size:1.3rem; font-weight:800; color:#1D4ED8; margin:4px 0;">${pct}%</div>
        <small>${s.ok} dari ${s.tot} soal benar</small>
      </div>
    `;
  }).join('');
}
