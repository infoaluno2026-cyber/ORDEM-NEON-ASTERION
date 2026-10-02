window.ORDEM = window.ORDEM || {};

class Player {
  constructor(config, x = 180, y = 520) {
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.title = config.title;
    this.aura = config.aura;
    this.weapon = config.weapon;
    this.maxHealth = config.maxHealth;
    this.health = config.maxHealth;
    this.maxEnergy = config.maxEnergy;
    this.energy = config.maxEnergy;
    this.speed = config.speed;
    this.jumpForce = config.jumpForce;
    this.attackDamage = config.attackDamage;
    this.attackRange = config.attackRange;
    this.specialDamage = config.specialDamage;
    this.specialCost = config.specialCost;
    this.secondaryCost = config.secondaryCost || 0;
    this.specialName = config.specialName;
    this.secondaryName = config.secondaryName;
    this.color = config.color;
    this.accent = config.accent;
    this.portrait = config.portrait;
    this.attackCooldown = 0;
    this.specialCooldown = 0;
    this.secondaryCooldown = 0;
    this.dashTimer = 0;
    this.invulnerable = 0;
    this.attackCooldownConfig = config.attackCooldown;
    this.onGround = true;
    this.facing = 1;
    this.x = x;
    this.y = y;
    this.width = 38;
    this.height = 56;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
    this.isPlayer = true;
    this.kills = 0;
    this.hurtFlash = 0;
    this.secondaryActive = 0;
    this.attackSwing = 0;
    this.input = { left: false, right: false, jump: false, attack: false, special: false, secondary: false };
    this.sprite = null;
    this.spriteLoaded = false;
    this.spritePath = 'assets/sprites/' + this.id + '.png';
    this.dashSprite = null;
    this.dashSpriteLoaded = false;
    this.dashSpritePath = 'assets/sprites/' + this.id + '-dash.gif';
    this.loadSprite();
    this.loadDashSprite();
  }

  loadSprite() {
    const image = new Image();
    image.onload = () => {
      this.sprite = image;
      this.spriteLoaded = true;
    };
    image.onerror = () => {
      this.sprite = null;
      this.spriteLoaded = false;
    };
    image.src = this.spritePath;
  }

  loadDashSprite() {
    const image = new Image();
    image.onload = () => {
      this.dashSprite = image;
      this.dashSpriteLoaded = true;
    };
    image.onerror = () => {
      this.dashSprite = null;
      this.dashSpriteLoaded = false;
    };
    image.src = this.dashSpritePath;
  }

  setInput(input) {
    this.input = input;
  }

  update(dt, level) {
    if (!this.alive) return;

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt);
    this.secondaryCooldown = Math.max(0, this.secondaryCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.secondaryActive = Math.max(0, this.secondaryActive - dt);
    this.attackSwing = Math.max(0, this.attackSwing - dt);

    const moveDir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    this.vx = moveDir * this.speed * 32;

    if (this.input.jump && this.onGround) {
      this.vy = -this.jumpForce * 30;
      this.onGround = false;
      this.input.jump = false;
    }

    this.vy += 780 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < 40) this.x = 40;
    if (this.x > level.bounds.right - 40) this.x = level.bounds.right - 40;

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

    if (moveDir !== 0) this.facing = moveDir > 0 ? 1 : -1;

    if (this.input.attack && this.attackCooldown <= 0) {
      this.performAttack();
      this.input.attack = false;
    }

    if (this.input.special && this.specialCooldown <= 0 && this.energy >= this.specialCost) {
      this.useSpecial();
      this.input.special = false;
    }

    if (this.input.secondary && this.secondaryCooldown <= 0 && this.energy >= (this.secondaryCost || 0)) {
      this.useSecondary();
      this.input.secondary = false;
    }

    if (this.dashTimer > 0) {
      this.x += this.facing * 14 * dt * 60;
    }

    this.energy = Math.min(this.maxEnergy, this.energy + 11 * dt);
  }

  performAttack(enemies = []) {
    this.attackCooldown = this.attackCooldownConfig;
    this.energy = Math.min(this.maxEnergy, this.energy + 8);
    this.attackSwing = 0.2;

    const range = this.attackRange;
    const attackX = this.x + this.facing * (range * 0.7);

    if (enemies.length) {
      for (const enemy of enemies) {
        if (!enemy || enemy.dead) continue;
        const dx = Math.abs(enemy.x - attackX);
        const dy = Math.abs(enemy.y - this.y);
        if (dx < range && dy < 60) {
          enemy.takeDamage(this.attackDamage, this);
          window.ORDEM.spawnEffect('spark', enemy.x, enemy.y - 12, this.accent, { radius: 10, life: 0.22, vx: this.facing * 30 });
        }
      }
    }

    window.ORDEM.spawnEffect('spark', attackX, this.y - 18, this.color, { radius: 10, life: 0.16, vx: this.facing * 40 });
  }

  useSpecial() {
    this.energy -= this.specialCost;
    this.specialCooldown = this.config.specialCooldown;

    if (this.id === 'kael') {
      this.attackDamage = 18;
      this.attackSwing = 0.5;
      this.performAttack(window.ORDEM.game.enemies || []);
      this.attackDamage = this.config.attackDamage;
      return;
    }

    if (this.id === 'rio') {
      const wave = new window.ORDEM.Projectile({
        x: this.x + this.facing * 26,
        y: this.y - 18,
        vx: this.facing * 620,
        vy: 0,
        radius: 10,
        color: '#5dd4ff',
        damage: this.specialDamage,
        lifetime: 0.5,
        owner: 'player'
      });
      window.ORDEM.projectiles.push(wave);
      return;
    }

    if (this.id === 'lira') {
      this.secondaryActive = 2.8;
      window.ORDEM.spawnEffect('heal', this.x, this.y - 20, '#d29fff', { radius: 18, life: 0.8, alpha: 0.7 });
      if (window.ORDEM.game && window.ORDEM.game.enemies) {
        for (const enemy of window.ORDEM.game.enemies) {
          if (!enemy || enemy.dead) continue;
          const dist = Math.abs(enemy.x - this.x);
          if (dist < 220) {
            enemy.takeDamage(this.specialDamage, this);
          }
        }
      }
    }
  }

  useSecondary() {
    if (this.id === 'kael') {
      this.secondaryCooldown = 1.5;
      this.dashTimer = 0.28;
      this.invulnerable = 0.28;
      this.x += this.facing * 150;
      this.energy = Math.max(0, this.energy - 15);
      const dashColor = '#ffd166';
      for (let i = 0; i < 12; i++) {
        window.ORDEM.spawnEffect('spark', this.x - this.facing * (10 + i * 6), this.y - 18, dashColor, {
          radius: 8 + i * 0.6,
          life: 0.16,
          vx: -this.facing * (40 + i * 6),
          vy: (Math.random() - 0.5) * 20,
          alpha: 0.85
        });
      }
      return;
    }

    if (this.id === 'rio') {
      this.secondaryCooldown = 2.4;
      this.energy -= 15;
      if (window.ORDEM.game && window.ORDEM.game.enemies) {
        for (const enemy of window.ORDEM.game.enemies) {
          if (!enemy || enemy.dead) continue;
          const dx = Math.abs(enemy.x - this.x);
          if (dx < 170) {
            enemy.takeDamage(24, this);
          }
        }
      }
      return;
    }

    if (this.id === 'lira') {
      this.secondaryCooldown = 2.8;
      if (this.energy >= this.secondaryCost) {
        this.energy -= this.secondaryCost;
      }
      this.secondaryActive = 2.2;
      if (window.ORDEM.game && window.ORDEM.game.enemies) {
        for (const enemy of window.ORDEM.game.enemies) {
          if (!enemy || enemy.dead) continue;
          const dx = Math.abs(enemy.x - this.x);
          if (dx < 180) {
            enemy.slowTimer = 2.2;
          }
        }
      }
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    if (this.invulnerable > 0) return;
    this.health -= amount;
    this.invulnerable = 0.5;
    this.hurtFlash = 0.2;
    window.ORDEM.spawnEffect('burst', this.x, this.y - 20, '#ff8f9d', { radius: 16, life: 0.25, alpha: 0.9 });
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
      if (window.ORDEM.game) {
        window.ORDEM.game.triggerGameOver();
      }
    }
  }

  drawHeroSprite(ctx) {
    if (this.id === 'kael' && this.dashTimer > 0 && this.dashSpriteLoaded && this.dashSprite) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing < 0) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(this.dashSprite, -110, -100, 220, 220);
      ctx.restore();
    }

    if (this.spriteLoaded && this.sprite && this.sprite.complete) {
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facing < 0) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(this.sprite, -64, -120, 128, 128);
      ctx.restore();
      return;
    }

    const flip = this.facing < 0;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (flip) {
      ctx.scale(-1, 1);
    }

    const gold = '#f9d25a';
    const goldDark = '#c6961a';
    const black = '#090b10';
    const dark = '#111722';
    const skin = '#f6d7b5';
    const hair = '#1d1e22';
    const red = '#ff5b3a';

    ctx.save();
    ctx.translate(0, -8);
    ctx.fillStyle = 'rgba(255, 194, 78, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, -20, 68, 82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const flames = [
      {x:-72,y:-4,w:14,h:30,c:gold},{x:-60,y:-38,w:18,h:36,c:'#ffb14d'},
      {x:72,y:-6,w:14,h:30,c:gold},{x:60,y:-38,w:18,h:36,c:'#ffb14d'},
      {x:-4,y:-76,w:16,h:36,c:gold},{x:20,y:-82,w:18,h:42,c:'#ffb14d'},
      {x:-30,y:-88,w:14,h:36,c:red},{x:36,y:-90,w:14,h:34,c:red}
    ];
    for (const f of flames) {
      ctx.fillStyle = f.c;
      ctx.fillRect(f.x, f.y, f.w, f.h);
      ctx.fillStyle = '#fff4bf';
      ctx.fillRect(f.x + 4, f.y + 6, Math.max(2, f.w - 8), Math.max(4, f.h - 12));
    }

    ctx.fillStyle = gold;
    ctx.fillRect(-38, -88, 14, 18);
    ctx.fillRect(-22, -102, 16, 28);
    ctx.fillRect(-4, -110, 18, 34);
    ctx.fillRect(18, -102, 16, 28);
    ctx.fillRect(30, -88, 14, 18);

    ctx.fillStyle = goldDark;
    ctx.fillRect(-36, -76, 72, 8);
    ctx.fillRect(-30, -76, 60, 6);

    ctx.fillStyle = hair;
    ctx.fillRect(-18, -72, 36, 8);
    ctx.fillRect(-24, -64, 48, 24);
    ctx.fillStyle = skin;
    ctx.fillRect(-16, -56, 32, 24);
    ctx.fillStyle = hair;
    ctx.fillRect(-18, -56, 6, 18);
    ctx.fillRect(12, -56, 6, 18);
    ctx.fillRect(-10, -62, 20, 8);

    ctx.fillStyle = '#1a1c1f';
    ctx.fillRect(-10, -46, 5, 5);
    ctx.fillRect(5, -46, 5, 5);
    ctx.fillStyle = '#f5f7ff';
    ctx.fillRect(-8, -46, 3, 3);
    ctx.fillRect(7, -46, 3, 3);

    ctx.fillStyle = dark;
    ctx.fillRect(-28, -34, 56, 56);
    ctx.fillStyle = black;
    ctx.fillRect(-18, -30, 36, 46);
    ctx.fillStyle = gold;
    ctx.fillRect(-22, -36, 44, 8);
    ctx.fillRect(-8, -34, 16, 8);
    ctx.fillRect(-26, -12, 52, 8);
    ctx.fillRect(-20, 0, 40, 8);

    ctx.fillStyle = gold;
    ctx.fillRect(-10, -18, 20, 20);
    ctx.fillStyle = '#1a1b22';
    ctx.fillRect(-6, -14, 12, 12);
    ctx.fillStyle = gold;
    ctx.fillRect(-2, -10, 4, 8);
    ctx.fillRect(-8, -2, 16, 4);

    ctx.fillStyle = dark;
    ctx.fillRect(-40, -20, 12, 40);
    ctx.fillRect(28, -20, 12, 40);
    ctx.fillStyle = gold;
    ctx.fillRect(-42, -10, 16, 8);
    ctx.fillRect(26, -10, 16, 8);

    ctx.fillStyle = '#191d23';
    ctx.fillRect(-40, 20, 12, 12);
    ctx.fillRect(28, 20, 12, 12);

    ctx.fillStyle = '#070b0f';
    ctx.fillRect(-18, 22, 16, 40);
    ctx.fillRect(2, 22, 16, 40);
    ctx.fillStyle = gold;
    ctx.fillRect(-20, 28, 20, 6);
    ctx.fillRect(0, 28, 20, 6);

    ctx.fillStyle = '#101417';
    ctx.fillRect(-22, 60, 20, 10);
    ctx.fillRect(2, 60, 20, 10);

    const swordX = 40;
    const swordY = 14;
    ctx.save();
    ctx.translate(swordX, swordY);
    ctx.rotate(-0.75);
    ctx.fillStyle = '#f3f4f8';
    ctx.fillRect(0, -2, 72, 4);
    ctx.fillStyle = '#fffef8';
    ctx.fillRect(26, -4, 48, 8);
    ctx.fillRect(0, -2, 72, 4);
    ctx.fillStyle = gold;
    ctx.fillRect(-12, -6, 12, 12);
    ctx.fillStyle = '#0d0f13';
    ctx.fillRect(-16, 0, 8, 22);
    ctx.fillRect(-16, 20, 8, 8);
    ctx.restore();

    ctx.fillStyle = gold;
    ctx.fillRect(-26, -26, 8, 18);
    ctx.fillRect(18, -26, 8, 18);

    if (this.attackSwing > 0) {
      ctx.strokeStyle = '#fff7c4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(38, 18);
      ctx.lineTo(104, 8);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,200,0.4)';
      ctx.fillRect(88, 2, 18, 10);
    }

    ctx.restore();
  }

  draw(ctx) {
    if (!this.alive) return;

    if (this.id === 'kael') {
      this.drawHeroSprite(ctx);
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.secondaryActive > 0 && this.id === 'lira') {
      ctx.strokeStyle = 'rgba(203, 142, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 15, 40 + (this.secondaryActive * 18), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 18;
    ctx.fillRect(-12, -10, 24, 38);

    ctx.fillStyle = '#0b1020';
    ctx.fillRect(-10, -32, 20, 18);
    ctx.fillStyle = this.accent;
    ctx.fillRect(-7, -29, 14, 12);

    ctx.fillStyle = '#dfeaff';
    ctx.fillRect(this.facing > 0 ? 8 : -22, 8, 16, 6);

    if (this.attackSwing > 0) {
      ctx.strokeStyle = this.accent;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(this.facing > 0 ? 14 : -14, 0, 26, this.facing > 0 ? -1.2 : 1.2, this.facing > 0 ? 1.2 : -1.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

window.ORDEM.Player = Player;
