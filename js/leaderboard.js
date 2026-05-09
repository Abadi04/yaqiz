// ─── Leaderboard Module ───
const Leaderboard = (() => {
  const STORAGE_KEY = 'yaqiz_leaderboard';

  // Seed players with Arabic names — generated once, then persist
  const SEED_PLAYERS = [
    { name: 'عبدالعزيز', avatar: '🧠', points: 485, streak: 12 },
    { name: 'نورة', avatar: '⚡', points: 420, streak: 9 },
    { name: 'فهد', avatar: '🔥', points: 380, streak: 15 },
    { name: 'سارة', avatar: '💎', points: 345, streak: 7 },
    { name: 'خالد', avatar: '🏆', points: 310, streak: 11 },
    { name: 'ريم', avatar: '🌟', points: 275, streak: 6 },
    { name: 'محمد', avatar: '🎯', points: 240, streak: 8 },
    { name: 'لمى', avatar: '✨', points: 210, streak: 5 },
    { name: 'عمر', avatar: '🚀', points: 185, streak: 4 },
    { name: 'هند', avatar: '💡', points: 155, streak: 3 },
    { name: 'يوسف', avatar: '🎮', points: 130, streak: 6 },
    { name: 'دانة', avatar: '🌙', points: 105, streak: 2 },
    { name: 'سلطان', avatar: '⭐', points: 85, streak: 4 },
    { name: 'مشاعل', avatar: '🎨', points: 60, streak: 1 },
    { name: 'تركي', avatar: '🔮', points: 40, streak: 2 },
  ];

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && d.length > 0) return d;
    } catch {}
    // First time — seed the leaderboard
    save(SEED_PLAYERS);
    return SEED_PLAYERS;
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getPlayerEntry() {
    const progress = Progress.load();
    const level = Progress.getLevel(progress.points);
    return {
      name: 'أنت',
      avatar: level.emoji,
      points: progress.points,
      streak: progress.streak,
      isPlayer: true,
    };
  }

  function getRankedList() {
    const others = load();
    const player = getPlayerEntry();
    const all = [...others, player];
    all.sort((a, b) => b.points - a.points);
    return all;
  }

  function render() {
    const ranked = getRankedList();
    const playerRank = ranked.findIndex(p => p.isPlayer) + 1;
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="fade-in" style="padding-top:2rem">
        <div class="leaderboard-header">
          <h1 class="section-title" style="text-align:center">🏆 لوحة المتصدرين</h1>
          <p class="section-subtitle" style="text-align:center">تنافس مع أفضل العقول وتصدّر القائمة</p>
        </div>

        <div class="leaderboard-podium">
          ${ranked.length >= 2 ? renderPodiumCard(ranked[1], 2, 'silver') : ''}
          ${ranked.length >= 1 ? renderPodiumCard(ranked[0], 1, 'gold') : ''}
          ${ranked.length >= 3 ? renderPodiumCard(ranked[2], 3, 'bronze') : ''}
        </div>

        <div class="leaderboard-player-rank fade-in">
          <span>ترتيبك الحالي</span>
          <div class="rank-badge">#${playerRank}</div>
          <span>${getPlayerEntry().points} نقطة</span>
        </div>

        <div class="leaderboard-list fade-in">
          ${ranked.map((p, i) => renderRow(p, i + 1)).join('')}
        </div>

        <div style="text-align:center;margin-top:2rem">
          <a href="#/challenge" class="btn btn-primary">⚡ ارفع ترتيبك — ابدأ التحدي</a>
        </div>
      </div>`;
  }

  function renderPodiumCard(player, rank, tier) {
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return `
      <div class="podium-card podium-${tier} ${player.isPlayer ? 'podium-you' : ''}">
        <div class="podium-medal">${medals[rank]}</div>
        <div class="podium-avatar">${player.avatar}</div>
        <div class="podium-name">${player.name}</div>
        <div class="podium-points">${player.points} نقطة</div>
        <div class="podium-streak">🔥 ${player.streak}</div>
      </div>`;
  }

  function renderRow(player, rank) {
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const rankDisplay = medals[rank] || `#${rank}`;
    return `
      <div class="lb-row ${player.isPlayer ? 'lb-row-you' : ''} ${rank <= 3 ? 'lb-row-top' : ''}">
        <div class="lb-rank">${rankDisplay}</div>
        <div class="lb-avatar">${player.avatar}</div>
        <div class="lb-info">
          <span class="lb-name">${player.name}${player.isPlayer ? ' (أنت)' : ''}</span>
          <span class="lb-streak">🔥 ${player.streak} يوم</span>
        </div>
        <div class="lb-points">${player.points}</div>
      </div>`;
  }

  return { render };
})();
