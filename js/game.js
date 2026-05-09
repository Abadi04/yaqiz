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
      Sounds.correct();
      showCorrect(puzzle);
    } else {
      Sounds.wrong();
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
          Sounds.correct();
          setTimeout(() => showCorrect(puzzle), 600);
        } else {
          btn.classList.add('wrong');
          Sounds.wrong();
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
          Sounds.correct();
          if (memoryLevel < puzzle.sequences.length - 1) {
            memoryLevel++;
            area.innerHTML = `<p class="question" style="color:var(--success)">✓ صحيح! المستوى التالي...</p>`;
            setTimeout(() => showMemorySequence(area, puzzle), 1000);
          } else {
            showCorrect(puzzle);
          }
        } else {
          Sounds.wrong();
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
      if (val === blitzAnswer) { blitzScore++; Sounds.click(); }
      else { Sounds.wrong(); }
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
    Sounds.correct();
    Progress.addPoints(puzzle.points);
    Progress.markSolved(puzzle.id);
    spawnConfetti();
    const totalPoints = Progress.load().points;
    const level = Progress.getLevel(totalPoints);
    const area = document.getElementById('game-area');
    if (area) {
      area.innerHTML = `
        <div class="result-panel">
          <div class="result-icon">🎉</div>
          <h2>أحسنت!</h2>
          <p>+${puzzle.points} نقطة يقظة</p>
          <div class="benefit">🧠 الفائدة الإدراكية: ${puzzle.cognitiveBenefit}</div>
          <div class="share-section">
            <p class="share-label">شارك إنجازك مع أصدقائك</p>
            <div class="share-buttons">
              ${buildShareButtons(puzzle, totalPoints, level)}
            </div>
          </div>
          <div class="result-actions">
            <a href="#/" class="btn btn-primary">العودة للرئيسية</a>
            <a href="#/categories" class="btn btn-secondary" style="margin-right:0.5rem">تصفح الفئات</a>
          </div>
        </div>`;
    }
  }

  function buildShareButtons(puzzle, totalPoints, level) {
    const text = `🧠 أنا حللت لغز "${puzzle.title}" في منصة يَقِظ وحصلت على ${puzzle.points} نقطة!\n🏅 مجموع نقاطي: ${totalPoints} (${level.emoji} ${level.name})\n\nجرّب تحدّي عقلك 👇`;
    const url = 'https://abadi04.github.io/yaqiz/';
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    const whatsappLink = `https://wa.me/?text=${encodedText}%0A${encodedUrl}`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    const snapLink = `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`;

    return `
      <a href="${whatsappLink}" target="_blank" rel="noopener" class="share-btn share-whatsapp" title="شارك على واتساب">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span>واتساب</span>
      </a>
      <a href="${twitterLink}" target="_blank" rel="noopener" class="share-btn share-twitter" title="شارك على تويتر">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        <span>تويتر</span>
      </a>
      <a href="${snapLink}" target="_blank" rel="noopener" class="share-btn share-snapchat" title="شارك على سناب شات">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.979-.236.094-.03.189-.06.272-.078.12-.03.209-.045.3-.045.15 0 .36.045.51.164.195.155.27.39.24.66-.045.33-.27.6-.66.78-.12.06-.27.105-.39.135-.42.12-.81.18-1.065.255-.18.06-.27.12-.3.18-.06.12-.03.27.015.42.075.21.225.51.36.81.36.81.735 1.5 1.41 2.175.36.375.72.615 1.05.795.12.06.27.12.39.165.21.09.39.195.495.36.12.195.06.435-.06.63-.195.3-.555.48-.99.585-.3.075-.6.105-.885.12-.21.015-.42.015-.615.015-.21 0-.435-.015-.66-.045-.12-.015-.27-.045-.42-.075-.33-.075-.72-.15-1.155-.15-.12 0-.24.015-.36.03-.39.075-.72.255-1.095.51-.45.315-.87.72-1.44 1.005-.57.285-1.14.42-1.68.42h-.015c-.54 0-1.11-.135-1.68-.42-.57-.285-.99-.69-1.44-1.005-.375-.255-.705-.435-1.095-.51-.12-.015-.24-.03-.36-.03-.435 0-.825.075-1.155.15-.15.03-.3.06-.42.075-.225.03-.45.045-.66.045-.195 0-.405 0-.615-.015-.285-.015-.585-.045-.885-.12-.435-.105-.795-.285-.99-.585-.12-.195-.18-.435-.06-.63.105-.165.285-.27.495-.36.12-.045.27-.105.39-.165.33-.18.69-.42 1.05-.795.675-.675 1.05-1.365 1.41-2.175.135-.3.285-.6.36-.81.045-.15.075-.3.015-.42-.03-.06-.12-.12-.3-.18-.255-.075-.645-.135-1.065-.255-.12-.03-.27-.075-.39-.135-.39-.18-.615-.45-.66-.78-.03-.27.045-.505.24-.66.15-.12.36-.165.51-.165.09 0 .18.015.3.045.083.018.178.048.272.078.32.115.679.22.979.236.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.853 1.069 11.216.793 12.206.793z"/></svg>
        <span>سناب شات</span>
      </a>
    `;
  }

  function showWrong() {
    Sounds.wrong();
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
