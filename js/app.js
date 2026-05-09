// ─── App Router ───
(function () {
  function init() {
    Premium.init();
    Progress.updateNavStats();
    window.addEventListener('hashchange', route);
    if (!window.location.hash) window.location.hash = '#/';
    route();
  }

  function route() {
    const hash = window.location.hash || '#/';
    const app = document.getElementById('app');

    // Update active nav
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (hash === '#/' || hash === '') document.getElementById('nav-home')?.classList.add('active');
    else if (hash.startsWith('#/categor')) document.getElementById('nav-categories')?.classList.add('active');
    else if (hash === '#/about') document.getElementById('nav-about')?.classList.add('active');

    // Route
    if (hash === '#/' || hash === '') {
      renderHome();
    } else if (hash === '#/categories') {
      CategoriesPage.render();
    } else if (hash.startsWith('#/category/')) {
      const catId = hash.split('/')[2];
      CategoriesPage.renderCategory(catId);
    } else if (hash.startsWith('#/puzzle/')) {
      const id = parseInt(hash.split('/')[2]);
      const puzzle = PUZZLES.find(p => p.id === id);
      if (puzzle) {
        if (puzzle.isPremium) { Premium.showModal(); window.location.hash = '#/'; }
        else Game.render(puzzle);
      }
    } else if (hash === '#/about') {
      renderAbout();
    }

    Progress.updateNavStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderHome() {
    const data = Progress.load();
    const level = Progress.getLevel(data.points);
    const dailyId = Progress.getDailyPuzzleId();
    const dailyPuzzle = PUZZLES.find(p => p.id === dailyId);
    const featured = PUZZLES.filter(p => !p.isPremium).slice(0, 6);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="hero fade-in">
        <h1>يَقِظ عقلك قبل أن يصدأ</h1>
        <p class="tagline">ألغاز ذكية مبنية على أبحاث علمية لتحسين التركيز والذاكرة</p>
        <a href="#/categories" class="btn btn-primary">ابدأ التحدي الآن ←</a>
        <div class="hero-stats">
          <span>🧩 ٥٠+ لغز</span>
          <span>📚 ٥ فئات</span>
          <span>🔬 مبني على دراسات علمية</span>
        </div>
      </div>

      ${data.points > 0 ? `
      <div style="text-align:center;margin-bottom:2rem" class="fade-in">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--surface);padding:0.6rem 1.5rem;border-radius:var(--radius-full);box-shadow:var(--shadow-md)">
          <span>${level.emoji}</span>
          <span style="font-weight:600">المستوى: ${level.name}</span>
          <span style="color:var(--text-secondary)">·</span>
          <span style="color:var(--accent);font-weight:600">${data.points} نقطة</span>
        </div>
      </div>` : ''}

      <div class="daily-section fade-in">
        <h2>🌟 لغز اليوم</h2>
        <p class="daily-subtitle">${dailyPuzzle ? dailyPuzzle.title : 'تحدي يومي جديد'}</p>
        ${dailyPuzzle ? `<a href="#/puzzle/${dailyPuzzle.id}" class="btn">حل لغز اليوم ←</a>` : ''}
        <div class="countdown" id="daily-countdown"></div>
      </div>

      <div style="margin-top:3rem" class="fade-in">
        <h2 class="section-title">ألغاز مميزة</h2>
        <p class="section-subtitle">اختر لغزاً وابدأ تدريب عقلك</p>
        <div class="puzzle-grid stagger">
          ${featured.map(p => CategoriesPage.renderPuzzleCard(p)).join('')}
        </div>
      </div>

      <div style="text-align:center;margin-top:3rem" class="fade-in">
        <a href="#/categories" class="btn btn-secondary">تصفح جميع الفئات ←</a>
      </div>`;

    updateDailyCountdown();
  }

  function updateDailyCountdown() {
    const el = document.getElementById('daily-countdown');
    if (!el) return;
    function tick() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (el) el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  function renderAbout() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="about-section fade-in" style="padding-top:2rem">
        <h1>لماذا الألغاز الصعبة؟ 🧠</h1>
        <div class="research-cards stagger">
          <div class="research-card">
            <div class="r-icon">📊</div>
            <div>
              <h3>دراسة جامعة ميشيغان</h3>
              <p>أثبتت أن تمارين الذاكرة العاملة (مثل N-Back) تحسن الذكاء السائل — القدرة على حل مشاكل جديدة لم تواجهها من قبل. التحسن يستمر حتى بعد التوقف عن التدريب.</p>
            </div>
          </div>
          <div class="research-card">
            <div class="r-icon">🧬</div>
            <div>
              <h3>تدريب الدماغ يقلل خطر الخرف بنسبة ٢٥٪</h3>
              <p>دراسة ACTIVE شملت أكثر من ٢٨٠٠ مشارك على مدى ١٠ سنوات. المشاركون الذين تدربوا على سرعة المعالجة الذهنية انخفض خطر إصابتهم بالخرف بنسبة ٢٩٪.</p>
            </div>
          </div>
          <div class="research-card">
            <div class="r-icon">⚡</div>
            <div>
              <h3>تحسن الذاكرة العاملة في ٥ أسابيع</h3>
              <p>أظهرت أبحاث Cogmed أن التدريب المكثف على الذاكرة العاملة لمدة ٥ أسابيع يؤدي لتحسن ملحوظ في الانتباه والتركيز والتحصيل الأكاديمي.</p>
            </div>
          </div>
          <div class="research-card">
            <div class="r-icon">🎯</div>
            <div>
              <h3>لماذا "صعب فقط"؟</h3>
              <p>الأبحاث تؤكد أن التحدي المعرفي يحدث فقط عندما يكون المستوى أعلى قليلاً من قدراتك الحالية. الألغاز السهلة لا تنشط مناطق التعلم في الدماغ. لذلك يَقِظ يقدم ألغاز متوسطة وصعبة فقط.</p>
            </div>
          </div>
        </div>
        <div style="text-align:center;margin-top:2.5rem">
          <a href="#/categories" class="btn btn-primary">ابدأ تدريب عقلك الآن ←</a>
        </div>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
