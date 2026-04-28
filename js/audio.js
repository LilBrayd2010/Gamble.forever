/* ========================= */
/*     SOUND EFFECTS SYSTEM  */
/* ========================= */

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

function playTone(freq, duration, type, volume) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume || 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not available
  }
}

function playSound(type) {
  switch (type) {
    case 'coins':
      playTone(800, 0.1, 'sine', 0.08);
      setTimeout(() => playTone(1000, 0.1, 'sine', 0.08), 80);
      setTimeout(() => playTone(1200, 0.15, 'sine', 0.06), 160);
      break;

    case 'dice':
      for (let i = 0; i < 5; i++) {
        setTimeout(() => playTone(200 + Math.random() * 400, 0.05, 'square', 0.04), i * 60);
      }
      break;

    case 'card':
      playTone(400, 0.05, 'triangle', 0.06);
      setTimeout(() => playTone(600, 0.04, 'triangle', 0.04), 40);
      break;

    case 'win':
      playTone(523, 0.15, 'sine', 0.08);
      setTimeout(() => playTone(659, 0.15, 'sine', 0.08), 120);
      setTimeout(() => playTone(784, 0.2, 'sine', 0.08), 240);
      setTimeout(() => playTone(1047, 0.3, 'sine', 0.06), 380);
      break;

    case 'lose':
      playTone(400, 0.2, 'sawtooth', 0.05);
      setTimeout(() => playTone(300, 0.2, 'sawtooth', 0.05), 200);
      setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.04), 400);
      break;

    case 'wheel':
      for (let i = 0; i < 20; i++) {
        setTimeout(() => playTone(600 + (i * 20), 0.03, 'sine', 0.03), i * 100);
      }
      break;

    case 'battle':
      playTone(150, 0.3, 'sawtooth', 0.06);
      setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.06), 300);
      break;

    case 'chest':
      playTone(300, 0.1, 'triangle', 0.06);
      setTimeout(() => playTone(450, 0.1, 'triangle', 0.06), 100);
      setTimeout(() => playTone(600, 0.15, 'triangle', 0.06), 200);
      break;

    case 'levelup':
      playTone(523, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
      setTimeout(() => playTone(784, 0.1, 'sine', 0.1), 200);
      setTimeout(() => playTone(1047, 0.1, 'sine', 0.1), 300);
      setTimeout(() => playTone(1318, 0.3, 'sine', 0.08), 400);
      break;
  }
}
