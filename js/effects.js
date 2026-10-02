window.ORDEM = window.ORDEM || {};

class Effect {
  constructor(x, y, kind, color, options = {}) {
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.color = color;
    this.alpha = options.alpha || 1;
    this.life = options.life || 0.5;
    this.maxLife = this.life;
    this.radius = options.radius || 16;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.gravity = options.gravity || 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 6;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.rotation += this.spin * dt;
  }

  draw(ctx) {
    const p = Math.max(this.life / this.maxLife, 0);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = p * this.alpha;

    if (this.kind === 'spark') {
      ctx.fillStyle = this.color;
      ctx.fillRect(-2, -10, 4, 20);
    } else if (this.kind === 'burst') {
      ctx.fillStyle = this.color;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const len = this.radius * (0.4 + p);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 4, Math.sin(angle) * 4);
        ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else if (this.kind === 'heal') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * p, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * p, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

window.ORDEM.Effect = Effect;
window.ORDEM.effects = [];

window.ORDEM.spawnEffect = function (kind, x, y, color, options) {
  const effect = new Effect(x, y, kind, color, options);
  window.ORDEM.effects.push(effect);
  return effect;
};
