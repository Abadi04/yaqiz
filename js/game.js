// ─── Game Engine ───
const Game = (() => {
  let currentPuzzle = null;
  let hintIndex = 0;
  let timerInterval = null;
  let elapsed = 0;

  // ── Memory game state
  let memoryLevel = 0;
  let memoryPhase = 'show'; // show | input

  // ── N-Back state
  let nbackIndex = 0;
  let nbackCorrect = 0;
  let nbackTotal = 0;

  // ── Blitz state
  let blitzScore = 0;
  let blitzTimeLeft = 60;
  let blitzA, blitzB, blitzOp, blitzAnswer;

  // ── Stroop state
  let stroopRound = 0;
  let stroopCorrect = 0;
  let stroopColors = [
    { name: 'أحمر', hex: '#EF4444' },
    { name: 'أزرق', hex: '#3B82F6' },
    { name: 'أخضر', hex: '#10B981' },
    { name: 'أصفر', hex: '#F59E0B' },
    { name: 'بنفسجي', hex: '#8B5CF6' },
    { name: 'برتقالي', hex: '#F97316' },
  ];

  function render(puzzle) {
    currentPuzzle = puzzle;
    hintIndex = 0;
    elapsed = 0;
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="game-container fade-in">
        <div class="game-header">
          <span class="cat-badge">${puzzle.catIcon} ${puzzle.category}</span>
          <h1>${puzzle.title}</h1>
          <p style="color:var(--text-secondary);margin-top:0.3rem">${puzzle.description}</p>
        </div>
        <div class="timer-bar"><div class="fill" id="timer-fill" style="width:0%"></div></div>
        <div class="game-content" id="game-area"></div>
      </div>`;
    startTimer();
    renderPuzzleType(puzzle);
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsed++;
      const pct = Math.min((elapsed / 300) * 100, 100);
      const fill = document.getElementById('timer-fill');
      if (fill) fill.style.width = pct + '%';
    }, 1000);
  }

  function stopTimer() { clearInterval(timerInterval); }

  function renderPuzzleType(puzzle) {
    const area = document.getElementById('game-area');
    if (!area) return;
    switch (puzzle.type) {
      case 'text': renderTextPuzzle(area, puzzle); break;
      case 'choices': renderChoicesPuzzle(area, puzzle); break;
      case 'memory': renderMemoryPuzzle(area, puzzle); break;
      case 'nback': renderNBackPuzzle(area, puzzle); break;
      case 'blitz': renderBlitzPuzzle(area, puzzle); break;
      case 'stroop': renderStroopPuzzle(area, puzzle); break;
    }
  }

  // ── TEXT INPUT ──
  function renderTextPuzzle(area, puzzle) {
    area.innerHTML = `
      <p class="question">${puzzle.question}</p>
      <input type="text" class="answer-input" id="answer-input" placeholder="اكتب الإجابة هنا" autocomplete="off">
      <br><br>
      <button class="btn btn-primary" id="submit-answer">تحقق ✓</button>
      ${renderHintButton(puzzle)}
      <div id="hint-area"></div>
      <div id="result-area"></div>`;
    document.getElementById('submit-answer').onclick = () => {
      const val = document.getElementById('answer-input').value.trim();
      checkTextAnswer(val, puzzle);
    };
    document.getElementById('answer-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = document.getElementById('answer-input').value.trim();
        checkTextAnswer(val, puzzle);
      }
    });
    setupHintButton(puzzle);
  }

  function checkTextAnswer(val, puzzle) {
    if (!val) return;
    if (puzzle.acceptedAnswers.includes(val)) {
      showCorrect(puzzle);
    } else {
      showWrong();
    }
  }

  // ── MULTIPLE CHOICE ──
  function renderChoicesPuzzle(area, puzzle) {
    area.innerHTML = `
      <p class="question">${puzzle.question}</p>
      <div class="choices-grid" id="choices-grid">
        ${puzzle.choices.map((c, i) => `<button class="choice-btn" data-index="${i}">${c}</button>`).join('')}
      </div>
      ${renderHintButton(puzzle)}
      <div id="hint-area"></div>
      <div id="result-area"></div>`;
    area.querySelectorAll('.choice-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);
        area.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
        if (idx === puzzle.correctIndex) {
          btn.classList.add('correct');
          setTimeout(() => showCorrect(puzzle), 600);
        } else {
          btn.classList.add('wrong');
          area.querySelectorAll('.choice-btn')[puzzle.correctIndex].classList.add('correct');
          setTimeout(() => showWrong(), 600);
        }
      };
    });
    setupHintButton(puzzle);
  }

  // ── MEMORY ──
  function renderMemoryPuzzle(area, puzzle) {
    memoryLevel = 0;
    showMemorySequence(area, puzzle);
  }

  function showMemorySequence(area, puzzle) {
    const seq = puzzle.sequences[memoryLevel];
    area.innerHTML = `
      <p class="question">احفظ هذا التسلسل</p>
      <div class="memory-display" id="mem-display">${seq.display}</div>
      <p style="color:var(--text-secondary)">المستوى ${memoryLevel + 1} من ${puzzle.sequences.length}</p>
      ${renderHintButton(puzzle)}
      <div id="hint-area"></div>`;
    setupHintButton(puzzle);
    setTimeout(() => {
      area.innerHTML = `
        <p class="question">أعد كتابة التسلسل (بالأرقام الإنجليزية، مفصولة بمسافات)</p>
        <input type="text" class="answer-input" id="mem-input" placeholder="مثال: 3 7 1 9" dir="ltr" style="font-family:var(--font-en)">
        <br><br>
        <button class="btn btn-primary" id="mem-submit">تحقق ✓</button>
        <div id="result-area"></div>`;
      document.getElementById('mem-submit').onclick = () => {
        const val = document.getElementById('mem-input').value.trim().split(/\s+/).map(Number);
        const correct = seq.numbers;
        if (JSON.stringify(val) === JSON.stringify(correct)) {
          if (memoryLevel < puzzle.sequences.length - 1) {
            memoryLevel++;
            area.innerHTML = `<p class="question" style="color:var(--success)">✓ صحيح! المستوى التالي...</p>`;
            setTimeout(() => showMemorySequence(area, puzzle), 1000);
          } else {
            showCorrect(puzzle);
          }
        } else {
          showWrong();
        }
      };
    }, 3000);
  }

  // ── N-BACK ──
  function renderNBackPuzzle(area, puzzle) {
    nbackIndex = 2;
    nbackCorrect = 0;
    nbackTotal = 0;
    showNBackRound(area, puzzle);
  }

  function showNBackRound(area, puzzle) {
    if (nbackIndex >= puzzle.sequence.length) {
      if (nbackCorrect >= Math.floor(nbackTotal * 0.6)) {
        showCorrect(puzzle);
      } else {
        showWrong();
      }
      return;
    }
    const current = puzzle.sequence[nbackIndex];
    const twoBack = puzzle.sequence[nbackIndex - 2];
    const isMatch = current === twoBack;
    area.innerHTML = `
      <p class="question">هل هذا الرقم ظهر قبل خطوتين؟</p>
      <div class="memory-display">${current}</div>
      <p style="color:var(--text-secondary);margin-bottom:1rem">الجولة ${nbackIndex - 1} من ${puzzle.sequence.length - 2}</p>
      <div style="display:flex;gap:1rem;justify-content:center">
        <button class="btn btn-primary" id="nback-yes">نعم ✓</button>
        <button class="btn btn-secondary" id="nback-no">لا ✗</button>
      </div>
      ${renderHintButton(puzzle)}
      <div id="hint-area"></div>`;
    setupHintButton(puzzle);
    document.getElementById('nback-yes').onclick = () => {
      nbackTotal++;
      if (isMatch) nbackCorrect++;
      nbackIndex++;
      showNBackRound(area, puzzle);
    };
    document.getElementById('nback-no').onclick = () => {
      nbackTotal++;
      if (!isMatch) nbackCorrect++;
      nbackIndex++;
      showNBackRound(area, puzzle);
    };
  }

  // ── MATH BLITZ ──
  function renderBlitzPuzzle(area, puzzle) {
    blitzScore = 0;
    blitzTimeLeft = 60;
    generateBlitzProblem();
    renderBlitzUI(area, puzzle);
    const blitzTimer = setInterval(() => {
      blitzTimeLeft--;
      const el = document.getElementById('blitz-time');
      if (el) el.textContent = blitzTimeLeft;
      if (blitzTimeLeft <= 0) {
        clearInterval(blitzTimer);
        if (blitzScore >= 8) showCorrect(puzzle);
        else showWrong();
      }
    }, 1000);
  }

  function generateBlitzProblem() {
    const ops = ['+', '-', '×'];
    blitzOp = ops[Math.floor(Math.random() * ops.length)];
    if (blitzOp === '+') { blitzA = rand(10, 99); blitzB = rand(10, 99); blitzAnswer = blitzA + blitzB; }
    else if (blitzOp === '-') { blitzA = rand(20, 99); blitzB = rand(1, blitzA); blitzAnswer = blitzA - blitzB; }
    else { blitzA = rand(2, 12); blitzB = rand(2, 12); blitzAnswer = blitzA * blitzB; }
  }

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function renderBlitzUI(area, puzzle) {
    area.innerHTML = `
      <div class="blitz-score" id="blitz-score">${blitzScore}</div>
      <div class="blitz-timer">⏱ <span id="blitz-time">${blitzTimeLeft}</span> ثانية</div>
      <div class="blitz-problem">${blitzA} ${blitzOp} ${blitzB} = ?</div>
      <input type="number" class="answer-input" id="blitz-input" dir="ltr" style="font-family:var(--font-en)" autocomplete="off">
      <br><br>
      <button class="btn btn-primary" id="blitz-submit">التالي →</button>
      <div id="result-area"></div>`;
    const submitBlitz = () => {
      const val = parseInt(document.getElementById('blitz-input').value);
      if (val === blitzAnswer) blitzScore++;
      generateBlitzProblem();
      renderBlitzUI(area, puzzle);
      document.getElementById('blitz-input').focus();
    };
    document.getElementById('blitz-submit').onclick = submitBlitz;
    document.getElementById('blitz-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitBlitz(); });
    setTimeout(() => { const inp = document.getElementById('blitz-input'); if (inp) inp.focus(); }, 100);
  }

  // ── STROOP ──
  function renderStroopPuzzle(area, puzzle) {
    stroopRound = 0;
    stroopCorrect = 0;
    showStroopRound(area, puzzle);
  }

  function showStroopRound(area, puzzle) {
    if (stroopRound >= puzzle.rounds) {
      if (stroopCorrect >= Math.floor(puzzle.rounds * 0.6)) showCorrect(puzzle);
      else showWrong();
      return;
    }
    const wordColor = stroopColors[Math.floor(Math.random() * stroopColors.length)];
    const textColor = stroopColors.filter(c => c !== wordColor)[Math.floor(Math.random() * (stroopColors.length - 1))];
    area.innerHTML = `
      <p class="question">ما لون الكتابة (وليس الكلمة)؟</p>
      <div class="stroop-word" style="color:${textColor.hex}">${wordColor.name}</div>
      <p style="color:var(--text-secondary);margin-bottom:1rem">الجولة ${stroopRound + 1} من ${puzzle.rounds}</p>
      <div class="color-grid">
        ${stroopColors.map(c => `<button class="color-btn" style="border-color:${c.hex};color:${c.hex}" data-name="${c.name}">${c.name}</button>`).join('')}
      </div>
      ${renderHintButton(puzzle)}
      <div id="hint-area"></div>`;
    setupHintButton(puzzle);
    area.querySelectorAll('.color-btn').forEach(btn => {
      btn.onclick = () => {
        stroopRound++;
        if (btn.dataset.name === textColor.name) stroopCorrect++;
        showStroopRound(area, puzzle);
      };
    });
  }

  // ── HINTS ──
  function renderHintButton(puzzle) {
    return `<button class="hint-btn" id="hint-btn">💡 تلميح ${hintIndex + 1}/${puzzle.hints.length}</button>`;
  }

  function setupHintButton(puzzle) {
    const btn = document.getElementById('hint-btn');
    if (!btn) return;
    btn.onclick = () => {
      if (hintIndex < puzzle.hints.length) {
        const hintArea = document.getElementById('hint-area');
        if (hintArea) {
          hintArea.innerHTML += `<div class="hint-text fade-in">💡 ${puzzle.hints[hintIndex]}</div>`;
          hintIndex++;
          btn.textContent = hintIndex < puzzle.hints.length ? `💡 تلميح ${hintIndex + 1}/${puzzle.hints.length}` : '💡 لا مزيد من التلميحات';
          if (hintIndex >= puzzle.hints.length) btn.disabled = true;
        }
      }
    };
  }

  // ── RESULTS ──
  function showCorrect(puzzle) {
    stopTimer();
    Progress.addPoints(puzzle.points);
    Progress.markSolved(puzzle.id);
    spawnConfetti();
    const area = document.getElementById('game-area');
    if (area) {
      area.innerHTML = `
        <div class="result-panel">
          <div class="result-icon">🎉</div>
          <h2>أحسنت!</h2>
          <p>+${puzzle.points} نقطة يقظة</p>
          <div class="benefit">🧠 الفائدة الإدراكية: ${puzzle.cognitiveBenefit}</div>
          <br>
          <a href="#/" class="btn btn-primary">العودة للرئيسية</a>
          <a href="#/categories" class="btn btn-secondary" style="margin-right:0.5rem">تصفح الفئات</a>
        </div>`;
    }
  }

  function showWrong() {
    const area = document.getElementById('game-area');
    if (area) {
      area.classList.add('shake');
      setTimeout(() => area.classList.remove('shake'), 500);
      let resultArea = document.getElementById('result-area');
      if (resultArea) {
        resultArea.innerHTML = `<p style="color:var(--danger);margin-top:1rem;font-weight:600">ليس هذا — فكّر مجدداً 🧠</p>`;
        setTimeout(() => { if (resultArea) resultArea.innerHTML = ''; }, 2000);
      }
    }
  }

  function spawnConfetti() {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = Math.random() * 1.5 + 's';
      el.style.animationDuration = (2 + Math.random() * 2) + 's';
      el.style.width = (6 + Math.random() * 8) + 'px';
      el.style.height = (6 + Math.random() * 8) + 'px';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  return { render };
})();
