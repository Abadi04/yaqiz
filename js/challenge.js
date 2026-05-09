// ─── Timed Challenge Mode ───
const Challenge = (() => {
  let score = 0;
  let timeLeft = 60;
  let timerInterval = null;
  let currentAnswer = null;
  let currentType = null;
  let totalAttempted = 0;
  let correctCount = 0;

  // Quick puzzle generators
  const generators = [
    generateMathPuzzle,
    generateMathPuzzle,
    generateSequencePuzzle,
    generateLogicChoice,
  ];

  function start() {
    score = 0;
    timeLeft = 60;
    totalAttempted = 0;
    correctCount = 0;
    clearInterval(timerInterval);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="challenge-container fade-in">
        <div class="challenge-hud">
          <div class="challenge-score-wrap">
            <div class="challenge-score-label">النقاط</div>
            <div class="challenge-score" id="ch-score">0</div>
          </div>
          <div class="challenge-timer-wrap">
            <svg class="challenge-timer-ring" viewBox="0 0 120 120">
              <circle class="ring-bg" cx="60" cy="60" r="52" />
              <circle class="ring-fill" cx="60" cy="60" r="52" id="ch-ring" />
            </svg>
            <div class="challenge-timer-text" id="ch-time">60</div>
          </div>
          <div class="challenge-streak-wrap">
            <div class="challenge-streak-label">صحيح</div>
            <div class="challenge-streak" id="ch-correct">0</div>
          </div>
        </div>
        <div class="challenge-area" id="ch-area"></div>
      </div>`;

    timerInterval = setInterval(() => {
      timeLeft--;
      const timeEl = document.getElementById('ch-time');
      const ringEl = document.getElementById('ch-ring');
      if (timeEl) timeEl.textContent = timeLeft;
      if (ringEl) {
        const pct = timeLeft / 60;
        const circumference = 2 * Math.PI * 52;
        ringEl.style.strokeDashoffset = circumference * (1 - pct);
        // Color shift as time runs out
        if (timeLeft <= 10) ringEl.style.stroke = '#EF4444';
        else if (timeLeft <= 20) ringEl.style.stroke = '#F59E0B';
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showResults();
      }
    }, 1000);

    nextPuzzle();
  }

  function nextPuzzle() {
    const area = document.getElementById('ch-area');
    if (!area) return;
    const gen = generators[Math.floor(Math.random() * generators.length)];
    gen(area);
  }

  function updateHUD() {
    const scoreEl = document.getElementById('ch-score');
    const correctEl = document.getElementById('ch-correct');
    if (scoreEl) scoreEl.textContent = score;
    if (correctEl) correctEl.textContent = correctCount;
  }

  function handleCorrect() {
    correctCount++;
    score += 10;
    totalAttempted++;
    Sounds.correct();
    updateHUD();

    // Flash green
    const area = document.getElementById('ch-area');
    if (area) {
      area.classList.add('ch-flash-correct');
      setTimeout(() => area.classList.remove('ch-flash-correct'), 300);
    }

    setTimeout(nextPuzzle, 200);
  }

  function handleWrong() {
    totalAttempted++;
    Sounds.wrong();

    const area = document.getElementById('ch-area');
    if (area) {
      area.classList.add('shake');
      setTimeout(() => area.classList.remove('shake'), 400);
    }

    setTimeout(nextPuzzle, 400);
  }

  // ── Math Puzzle ──
  function generateMathPuzzle(area) {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === '+') { a = rand(5, 50); b = rand(5, 50); answer = a + b; }
    else if (op === '-') { a = rand(15, 80); b = rand(1, a - 1); answer = a - b; }
    else { a = rand(2, 12); b = rand(2, 12); answer = a * b; }

    area.innerHTML = `
      <div class="ch-puzzle fade-in">
        <div class="ch-puzzle-type">🔢 حساب ذهني</div>
        <div class="ch-math-problem">${a} ${op} ${b} = ?</div>
        <input type="number" class="answer-input ch-input" id="ch-input" dir="ltr" style="font-family:var(--font-en)" autocomplete="off">
        <button class="btn btn-primary ch-submit" id="ch-submit">تحقق →</button>
      </div>`;

    const submit = () => {
      const val = parseInt(document.getElementById('ch-input')?.value);
      if (isNaN(val)) return;
      if (val === answer) handleCorrect();
      else handleWrong();
    };

    document.getElementById('ch-submit').onclick = submit;
    document.getElementById('ch-input').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    setTimeout(() => { const inp = document.getElementById('ch-input'); if (inp) inp.focus(); }, 50);
  }

  // ── Sequence Puzzle ──
  function generateSequencePuzzle(area) {
    const start = rand(2, 10);
    const step = rand(2, 5);
    const seq = [];
    for (let i = 0; i < 4; i++) seq.push(start + step * i);
    const answer = start + step * 4;

    area.innerHTML = `
      <div class="ch-puzzle fade-in">
        <div class="ch-puzzle-type">🧩 أكمل المتتالية</div>
        <div class="ch-math-problem">${seq.join(' ، ')} ، ؟</div>
        <input type="number" class="answer-input ch-input" id="ch-input" dir="ltr" style="font-family:var(--font-en)" autocomplete="off">
        <button class="btn btn-primary ch-submit" id="ch-submit">تحقق →</button>
      </div>`;

    const submit = () => {
      const val = parseInt(document.getElementById('ch-input')?.value);
      if (isNaN(val)) return;
      if (val === answer) handleCorrect();
      else handleWrong();
    };

    document.getElementById('ch-submit').onclick = submit;
    document.getElementById('ch-input').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    setTimeout(() => { const inp = document.getElementById('ch-input'); if (inp) inp.focus(); }, 50);
  }

  // ── Logic Choice ──
  function generateLogicChoice(area) {
    const questions = [
      { q: 'أي رقم لا ينتمي: ٢ ، ٤ ، ٧ ، ٨ ، ١٠', choices: ['٢', '٤', '٧', '٨'], correct: 2 },
      { q: 'ما ناتج: ٣² + ٤²', choices: ['٧', '١٢', '٢٥', '٤٩'], correct: 2 },
      { q: 'أيهما أكبر: ⅔ أم ¾ ؟', choices: ['⅔', '¾', 'متساويان', 'لا يمكن المقارنة'], correct: 1 },
      { q: 'إذا كان x + 5 = 12، فما قيمة x؟', choices: ['٥', '٦', '٧', '٨'], correct: 2 },
      { q: 'كم ضلع للمثلث؟', choices: ['٢', '٣', '٤', '٥'], correct: 1 },
      { q: '٢٠٪ من ١٠٠ تساوي:', choices: ['١٠', '٢٠', '٣٠', '٤٠'], correct: 1 },
      { q: 'ما العدد الأولي: ٤ ، ٦ ، ٧ ، ٩ ؟', choices: ['٤', '٦', '٧', '٩'], correct: 2 },
      { q: 'نصف الـ ٦٠ هو:', choices: ['٢٠', '٢٥', '٣٠', '٣٥'], correct: 2 },
    ];

    const puzzle = questions[Math.floor(Math.random() * questions.length)];

    area.innerHTML = `
      <div class="ch-puzzle fade-in">
        <div class="ch-puzzle-type">💡 اختر الإجابة</div>
        <div class="ch-question">${puzzle.q}</div>
        <div class="choices-grid ch-choices">
          ${puzzle.choices.map((c, i) => `<button class="choice-btn ch-choice" data-idx="${i}">${c}</button>`).join('')}
        </div>
      </div>`;

    area.querySelectorAll('.ch-choice').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        area.querySelectorAll('.ch-choice').forEach(b => b.disabled = true);
        if (idx === puzzle.correct) {
          btn.classList.add('correct');
          handleCorrect();
        } else {
          btn.classList.add('wrong');
          area.querySelectorAll('.ch-choice')[puzzle.correct].classList.add('correct');
          handleWrong();
        }
      };
    });
  }

  function showResults() {
    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
    const bonusPoints = Math.floor(score * (accuracy / 100));
    const totalPoints = score + bonusPoints;

    // Save points
    Progress.addPoints(totalPoints);
    // Save challenge high score
    const prevBest = parseInt(localStorage.getItem('yaqiz_challenge_best') || '0');
    const isNewRecord = totalPoints > prevBest;
    if (isNewRecord) localStorage.setItem('yaqiz_challenge_best', totalPoints);

    if (correctCount >= 3) {
      // Use Game's confetti via DOM
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
      Sounds.correct();
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="challenge-container fade-in">
        <div class="challenge-results">
          <div class="ch-result-icon">${isNewRecord ? '🏆' : correctCount >= 5 ? '🎉' : '💪'}</div>
          <h2>${isNewRecord ? 'رقم قياسي جديد!' : 'انتهى الوقت!'}</h2>
          ${isNewRecord ? '<div class="ch-new-record">⭐ رقم قياسي جديد ⭐</div>' : ''}
          <div class="ch-results-grid">
            <div class="ch-result-stat">
              <div class="ch-stat-value">${correctCount}</div>
              <div class="ch-stat-label">إجابة صحيحة</div>
            </div>
            <div class="ch-result-stat">
              <div class="ch-stat-value">${accuracy}%</div>
              <div class="ch-stat-label">الدقة</div>
            </div>
            <div class="ch-result-stat">
              <div class="ch-stat-value">${totalPoints}</div>
              <div class="ch-stat-label">النقاط المكتسبة</div>
            </div>
          </div>
          <div class="ch-breakdown">
            <div>🎯 النقاط الأساسية: ${score}</div>
            <div>🎁 مكافأة الدقة: +${bonusPoints}</div>
          </div>
          <div class="result-actions" style="margin-top:1.5rem">
            <button class="btn btn-primary" onclick="Challenge.start()">🔄 حاول مرة أخرى</button>
            <a href="#/leaderboard" class="btn btn-secondary">🏆 المتصدرين</a>
            <a href="#/" class="btn btn-secondary">الرئيسية</a>
          </div>
        </div>
      </div>`;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function renderLanding() {
    const bestScore = localStorage.getItem('yaqiz_challenge_best') || '0';
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="challenge-container fade-in" style="padding-top:2rem">
        <div class="challenge-landing">
          <div class="ch-landing-icon">⚡</div>
          <h1>تحدي الـ ٦٠ ثانية</h1>
          <p class="ch-landing-desc">حل أكبر عدد ممكن من الألغاز في ٦٠ ثانية.<br>كل إجابة صحيحة = ١٠ نقاط + مكافأة دقة!</p>
          <div class="ch-landing-best">
            <span>🏆 أفضل نتيجة</span>
            <span class="ch-best-value">${bestScore} نقطة</span>
          </div>
          <div class="ch-rules">
            <div class="ch-rule"><span>🔢</span> حساب ذهني سريع</div>
            <div class="ch-rule"><span>🧩</span> أكمل المتتاليات</div>
            <div class="ch-rule"><span>💡</span> أسئلة اختيار سريعة</div>
          </div>
          <button class="btn btn-primary ch-start-btn" onclick="Challenge.start()">
            ابدأ التحدي الآن ⚡
          </button>
        </div>
      </div>`;
  }

  return { start, renderLanding };
})();
