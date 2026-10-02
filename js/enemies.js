window.ORDEM = window.ORDEM || {};

class Enemy {
  constructor(type, x, y) {
    this.config = window.ORDEM_DATA.enemyTypes[type] || window.ORDEM_DATA.enemyTypes.basic;
    this.type = type;
    this.name = this.config.name;
    this.maxHealth = this.config.maxHealth;
    this.health = this.maxHealth;
    this.speed = this.config.speed * 40;
    this.damage = this.config.damage;
    this.range = this.config.range;
    this.color = this.config.color;
    this.reward = this.config.reward;
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 52;
    this.facing = 1;
    this.attackCooldown = 0;
    this.dead = false;
    this.flashTimer = 0;
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.slowTimer = 0;
    this.state = 'idle';
    this.fireRate = 1.4;
  }

  update(dt, player, level, game) {
    if (this.dead) return;

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.flashTimer = Math.max(0, this.flashTimer - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);

    const speedFactor = this.slowTimer > 0 ? 0.45 : 1;
    const dx = player.x - this.x;
    const dy = Math.abs(player.y - this.y);
    const dist = Math.abs(dx);

    this.facing = dx >= 0 ? 1 : -1;

    if (this.type === 'ranged') {
      if (dist > this.range * 0.8) {
        this.vx = (dx > 0 ? 1 : -1) * this.speed * 0.7 * speedFactor;
      } else {
        this.vx = 0;
      }

      if (dist < this.range && this.attackCooldown <= 0) {
        const dir = dx === 0 ? 1 : Math.sign(dx);
        const projectile = new window.ORDEM.Projectile({
          x: this.x + dir * 18,
          y: this.y - 16,
          vx: dir * 250,
          vy: 0,
          radius: 8,
          color: '#d591ff',
          damage: this.damage,
          lifetime: 2.5,
          owner: 'enemy'
        });
        game.projectiles.push(projectile);
        this.attackCooldown = this.config.attackCooldown;
      }
    } else {
      if (dist > this.range + 12) {
        this.vx = (dx > 0 ? 1 : -1) * this.speed * speedFactor;
      } else {
        this.vx = 0;
        if (this.attackCooldown <= 0 && dy < 60) {
          player.takeDamage(this.damage);
          this.attackCooldown = this.config.attackCooldown;
        }
      }
    }

    this.x += this.vx * dt;

    if (this.x < 40) this.x = 40;
    if (this.x > level.bounds.right - 40) this.x = level.bounds.right - 40;

    this.vy += 820 * dt;
    this.y += this.vy * dt;
    const groundY = level.groundY || 620;
    if (this.y >= groundY - this.height) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    for (const platform of level.platforms || []) {
      if (
        this.y + this.height <= platform.y + 12 &&
        this.y + this.height + this.vy * dt >= platform.y &&
        this.y + this.height >= platform.y - 8 &&
        this.x + this.width > platform.x &&
        this.x < platform.x + platform.width
      ) {
        this.y = platform.y - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  takeDamage(amount, attacker) {
    this.health -= amount;
    this.flashTimer = 0.12;
    window.ORDEM.spawnEffect('burst', this.x, this.y - 16, this.color, { radius: 12, life: 0.2, alpha: 0.85 });

    if (attacker && attacker.id) {
      attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + 6);
    }

    if (this.health <= 0) {
      this.dead = true;
      this.health = 0;
      if (attacker && attacker.kills !== undefined) {
        attacker.kills += 1;
      }
      if (window.ORDEM.game) {
        window.ORDEM.game.kills += 1;
      }
      window.ORDEM.spawnEffect('burst', this.x, this.y - 20, '#d4f7ff', { radius: 18, life: 0.4, alpha: 0.75 });
    }
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.fillRect(-14, -10, 28, 38);
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(-10, -28, 20, 18);
    ctx.fillStyle = '#f5d8ff';
    ctx.fillRect(this.facing > 0 ? 8 : -20, 10, 16, 6);
    if (this.flashTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-16, -32, 32, 44);
    }
    ctx.restore();
  }
}

window.ORDEM.Enemy = Enemy;
