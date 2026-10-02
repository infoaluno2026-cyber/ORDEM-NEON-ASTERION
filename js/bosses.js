window.ORDEM = window.ORDEM || {};

class Boss extends window.ORDEM.Enemy {
  constructor(type, x, y) {
    super(type, x, y);
    this.bossType = type;
    this.isBoss = true;
    this.size = type === 'heart' ? 1.7 : 1.5;
    this.healthBarVisible = true;
  }

  update(dt, player, level, game) {
    if (this.dead) return;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    const dx = player.x - this.x;
    const dist = Math.abs(dx);
    this.facing = dx >= 0 ? 1 : -1;

    if (this.bossType === 'heart') {
      this.y = level.groundY - 180;
      if (dist > 40) {
        this.x += (dx > 0 ? 1 : -1) * 22 * dt;
      }
      if (this.attackCooldown <= 0) {
        const sign = dist === 0 ? 1 : Math.sign(dx);
        const projectile = new window.ORDEM.Projectile({
          x: this.x + sign * 20,
          y: this.y - 20,
          vx: sign * 280,
          vy: 0,
          radius: 10,
          color: '#b38fff',
          damage: 16,
          lifetime: 2.5,
          owner: 'enemy'
        });
        game.projectiles.push(projectile);
        this.attackCooldown = 1.4;
      }
      return;
    }

    if (dist > 60) {
      this.x += (dx > 0 ? 1 : -1) * this.speed * 0.32 * dt;
    }

    if (dist < 70 && this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = this.config.attackCooldown;
    }
  }

  draw(ctx) {
    if (this.dead) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.fillRect(-28, -50, 56, 90);
    ctx.fillStyle = '#f4d0ff';
    ctx.fillRect(-20, -62, 40, 12);
    ctx.restore();

    const barW = 220;
    const hpRatio = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(this.x - barW / 2, this.y - 90, barW, 10);
    ctx.fillStyle = '#ff647d';
    ctx.fillRect(this.x - barW / 2, this.y - 90, barW * hpRatio, 10);
  }
}

window.ORDEM.Boss = Boss;
