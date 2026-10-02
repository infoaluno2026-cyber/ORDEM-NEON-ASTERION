window.ORDEM = window.ORDEM || {};

class Projectile {
  constructor({ x, y, vx, vy, radius = 6, color = '#6ee7ff', damage = 12, lifetime = 2.2, owner = 'enemy' }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.damage = damage;
    this.lifetime = lifetime;
    this.owner = owner;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.ORDEM.Projectile = Projectile;
window.ORDEM.projectiles = [];

window.ORDEM.spawnProjectile = function (config) {
  const projectile = new Projectile(config);
  window.ORDEM.projectiles.push(projectile);
  return projectile;
};

window.ORDEM.hitCircle = function (a, b, radiusA = 0, radiusB = 0) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const total = radiusA + radiusB;
  return dx * dx + dy * dy <= total * total;
};
