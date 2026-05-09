// ─── Categories Module ───
const CategoriesPage = (() => {
  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="fade-in" style="padding-top:2rem">
        <h1 class="section-title" style="text-align:center">فئات التدريب</h1>
        <p class="section-subtitle" style="text-align:center">اختر الفئة التي تريد تدريب عقلك عليها</p>
        <div class="category-grid stagger">
          ${CATEGORIES.map(cat => {
            const puzzles = getPuzzlesByCategory(cat.name);
            return `
              <a class="category-card" href="#/category/${cat.id}">
                <span class="cat-icon">${cat.icon}</span>
                <h3>${cat.name}</h3>
                <p>${cat.description}</p>
                <span class="cat-count">${puzzles.length} ألغاز</span>
              </a>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderCategory(catId) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) { window.location.hash = '#/categories'; return; }
    const puzzles = getPuzzlesByCategory(cat.name);
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="fade-in" style="padding-top:2rem">
        <a href="#/categories" class="btn btn-secondary" style="margin-bottom:1.5rem;font-size:0.85rem">→ العودة للفئات</a>
        <h1 class="section-title">${cat.icon} ${cat.name}</h1>
        <p class="section-subtitle">${cat.description}</p>
        <div class="puzzle-grid stagger">
          ${puzzles.map(p => renderPuzzleCard(p)).join('')}
        </div>
      </div>`;
  }

  function renderPuzzleCard(p) {
    const solved = Progress.isSolved(p.id);
    const locked = p.isPremium;
    return `
      <div class="puzzle-card ${locked ? 'locked' : ''}" ${!locked ? `onclick="window.location.hash='#/puzzle/${p.id}'"` : `onclick="Premium.showModal()"`}>
        ${locked ? `<div class="lock-overlay"><span class="lock-icon">🔒</span><span class="lock-text golden-shimmer">محتوى مميز ✨</span></div>` : ''}
        <div class="card-content">
          <div class="card-header">
            <div class="card-icon">${p.catIcon}</div>
            <span class="difficulty ${p.difficulty === 'صعب' ? 'diff-hard' : 'diff-medium'}">${p.difficulty}</span>
          </div>
          <h3>${solved ? '✅ ' : ''}${p.title}</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem">${p.description}</p>
          <div class="card-meta">
            <span>⏱ ${p.timeEstimate}</span>
            <span>⚡ ${p.points} نقطة</span>
          </div>
          <button class="btn ${locked ? 'btn-secondary' : 'btn-primary'} card-btn">
            ${locked ? '🔒 مقفل' : solved ? '🔄 أعد اللعب' : '🧩 حل اللغز'}
          </button>
        </div>
      </div>`;
  }

  return { render, renderCategory, renderPuzzleCard };
})();
