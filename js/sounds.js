// ─── Sound Effects Module ───
const Sounds = (() => {
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, type, duration, volume = 0.3) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  function correct() {
    const ctx = getCtx();
    // Cheerful ascending two-tone
    playTone(523.25, 'sine', 0.15, 0.25); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.15, 0.25), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.3, 0.2), 200); // G5
  }

  function wrong() {
    const ctx = getCtx();
    // Low descending buzz
    playTone(280, 'square', 0.15, 0.12);
    setTimeout(() => playTone(220, 'square', 0.25, 0.12), 120);
  }

  function click() {
    playTone(800, 'sine', 0.05, 0.1);
  }

  return { correct, wrong, click };
})();
