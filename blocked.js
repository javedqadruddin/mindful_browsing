const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const target = params.get("target");

// --- Slow mode: "Proceed Anyway" countdown ---
if (mode === "slow" && target) {
  const controls = document.getElementById("slow-controls");
  const btn = document.getElementById("proceed-btn");
  const countdownEl = document.getElementById("countdown");

  controls.classList.remove("hidden");

  btn.addEventListener("click", () => {
    btn.classList.add("hidden");
    countdownEl.classList.remove("hidden");

    let seconds = 10;
    countdownEl.textContent = seconds;

    const interval = setInterval(() => {
      seconds--;
      countdownEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(interval);
        const targetUrl = decodeURIComponent(target);
        chrome.runtime.sendMessage({ type: "bypass", url: targetUrl }, () => {
          window.location.href = targetUrl;
        });
      }
    }, 1000);
  });
}

// --- Meditation timer (shown in both blocked and slow modes) ---
(() => {
  const minutesEl = document.getElementById("meditate-minutes");
  const decBtn = document.getElementById("meditate-dec");
  const incBtn = document.getElementById("meditate-inc");
  const startBtn = document.getElementById("meditate-start");
  const timerEl = document.getElementById("meditate-timer");
  const meditateRow = document.querySelector(".meditate-row");

  // Synthesize a temple-bell sound with the Web Audio API.
  // Bells are inharmonic: partials aren't integer multiples of the fundamental.
  // Ratios loosely based on traditional bell acoustics (hum, prime, tierce, quint, nominal).
  const playBell = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const fundamental = 440;
    const partials = [
      { ratio: 0.5,  gain: 0.35, decay: 6.0 },
      { ratio: 1.0,  gain: 0.50, decay: 5.5 },
      { ratio: 1.19, gain: 0.25, decay: 4.0 },
      { ratio: 1.56, gain: 0.18, decay: 3.0 },
      { ratio: 2.00, gain: 0.22, decay: 2.5 },
      { ratio: 2.51, gain: 0.12, decay: 1.8 },
      { ratio: 2.66, gain: 0.08, decay: 1.5 },
    ];

    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);

    partials.forEach(({ ratio, gain, decay }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = fundamental * ratio;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    });

    setTimeout(() => ctx.close(), 7000);
  };

  let minutes = 5;
  const MIN = 1;
  const MAX = 60;

  const render = () => {
    minutesEl.textContent = minutes;
    decBtn.disabled = minutes <= MIN;
    incBtn.disabled = minutes >= MAX;
  };
  render();

  decBtn.addEventListener("click", () => {
    if (minutes > MIN) { minutes--; render(); }
  });
  incBtn.addEventListener("click", () => {
    if (minutes < MAX) { minutes++; render(); }
  });

  const format = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  startBtn.addEventListener("click", () => {
    meditateRow.classList.add("hidden");
    startBtn.classList.add("hidden");
    timerEl.classList.remove("hidden");

    let remaining = minutes * 60;
    timerEl.textContent = format(remaining);

    const interval = setInterval(() => {
      remaining--;
      timerEl.textContent = format(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        playBell();
        timerEl.textContent = "🙏";
      }
    }, 1000);
  });
})();
