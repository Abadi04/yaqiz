// ─── Progress Module ───
const Progress = (() => {
  const STORAGE_KEY = 'yaqiz_progress';
  const LEVELS = [
    { name: 'نائم', min: 0, emoji: '😴' },
    { name: 'منتبه', min: 50, emoji: '👀' },
    { name: 'يَقِظ', min: 150, emoji: '🧠' },
    { name: 'حاد', min: 300, emoji: '⚡' },
    { name: 'عبقري', min: 500, emoji: '🏆' },
  ];

  function getDefault() {
    return { points: 0, streak: 0, lastPlayDate: null, solved: [], dailyPuzzleId: null, dailyDate: null };
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return d ? { ...getDefault(), ...d } : getDefault();
    } catch { return getDefault(); }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getLevel(points) {
    let level = LEVELS[0];
    for (const l of LEVELS) {
      if (points >= l.min) level = l;
    }
    return level;
  }

  function addPoints(amount) {
    const data = load();
    data.points += amount;
    const today = new Date().toDateString();
    if (data.lastPlayDate === today) {
      // same day
    } else if (data.lastPlayDate === new Date(Date.now() - 86400000).toDateString()) {
      data.streak++;
    } else {
      data.streak = 1;
    }
    data.lastPlayDate = today;
    save(data);
    updateNavStats();
    return data;
  }

  function markSolved(puzzleId) {
    const data = load();
    if (!data.solved.includes(puzzleId)) {
      data.solved.push(puzzleId);
      save(data);
    }
  }

  function isSolved(puzzleId) {
    return load().solved.includes(puzzleId);
  }

  function getDailyPuzzleId() {
    const data = load();
    const today = new Date().toDateString();
    if (data.dailyDate !== today) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
      data.dailyPuzzleId = (dayOfYear % 10) + 1; // puzzles 1-10 (free ones)
      data.dailyDate = today;
      save(data);
    }
    return data.dailyPuzzleId;
  }

  function updateNavStats() {
    const data = load();
    const ptsEl = document.querySelector('#nav-points span');
    const streakEl = document.querySelector('#nav-streak span');
    if (ptsEl) ptsEl.textContent = data.points;
    if (streakEl) streakEl.textContent = data.streak;
  }

  return { load, save, getLevel, addPoints, markSolved, isSolved, getDailyPuzzleId, updateNavStats, LEVELS };
})();
