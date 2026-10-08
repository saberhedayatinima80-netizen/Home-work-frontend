const $ = (id) => document.getElementById(id);

$("envelope").addEventListener("click", () => {
  $("envelope").classList.add("open");
  setTimeout(() => {
    $("envelopeScreen").classList.add("hidden");
    $("cardScreen").classList.remove("hidden");
    scrollTo(0, 0);
    burst(180);
  }, 1300);
});

$("celebrate").addEventListener("click", () => burst(220));

/* کاغذ رنگی */
const canvas = $("confetti");
const ctx = canvas.getContext("2d");
const colors = ["#ff6b9d", "#ffd166", "#06d6a0", "#118ab2", "#8b5cf6", "#f59e0b"];
let pieces = [];
let running = false;

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener("resize", resize);
resize();

function burst(count) {
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: innerWidth / 2,
      y: innerHeight / 2.5,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 5,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
      life: 0,
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces = pieces.filter((p) => p.y < innerHeight + 40 && p.life < 400);
  for (const p of pieces) {
    p.vy += 0.35;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  if (pieces.length) requestAnimationFrame(tick);
  else running = false;
}
