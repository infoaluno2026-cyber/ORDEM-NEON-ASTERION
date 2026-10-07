window.ORDEM = window.ORDEM || {};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.state = 'menu';
    this.ui = new window.ORDEM.UI();
    this.dialogue = new window.ORDEM.Dialogue();
    this.input = { left: false, right: false, jump: false, attack: false, special: false, secondary: false };
    this.touchInput = { left: false, right: false, jump: false, attack: false, special: false };
    this.currentLevelId = 'station';
    this.currentLevel = null;
    this.player = null;
    this.allies = [];
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.kills = 0;
    this.totalTime = 0;
    this.lastTime = 0;
    this.waveIndex = 0;
    this.waveTimer = 0;
    this.storyFlags = { rio: false, lira: false, heart: false };
    this.levelProgress = window.ORDEM.save.load();
    this.pressedKeys = {};
    this.resultAction = 'menu';
    this.dialogueTimer = 0;
    this.levelWon = false;
    window.ORDEM.game = this;
    window.ORDEM.effects = this.effects;
    window.ORDEM.projectiles = this.projectiles;
    this.setupEvents();
    this.ui.setTouchControls();
    this.showMainMenu();
  }

  setupEvents() {
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'a') this.input.left = true;
      if (key === 'd') this.input.right = true;
      if (key === 'w' || key === ' ') {
        event.preventDefault();
        this.input.jump = true;
      }
      if (key === 'j') this.input.attack = true;
      if (key === 'k') this.input.special = true;
      if (key === 'l') this.input.secondary = true;
      if (key === '1') this.switchCharacter('kael');
      if (key === '2') this.switchCharacter('rio');
      if (key === '3') this.switchCharacter('lira');
      if (key === 'escape') {
        event.preventDefault();
        this.togglePause();
      }
      this.pressedKeys[key] = true;
    });

    document.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'a') this.input.left = false;
      if (key === 'd') this.input.right = false;
      if (key === 'w' || key === ' ') this.input.jump = false;
      if (key === 'j') this.input.attack = false;
      if (key === 'k') this.input.special = false;
      if (key === 'l') this.input.secondary = false;
      if (key === 'enter' && this.dialogue.visible) {
        this.dialogue.advance();
      }
      delete this.pressedKeys[key];
    });

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        this.handleMenuAction(button.dataset.action);
      });
    });

    document.querySelectorAll('[data-touch]').forEach((button) => {
      button.addEventListener('pointerdown', () => {
        const action = button.dataset.touch;
        if (action === 'left') this.touchInput.left = true;
        if (action === 'right') this.touchInput.right = true;
        if (action === 'jump') this.touchInput.jump = true;
        if (action === 'attack') this.touchInput.attack = true;
        if (action === 'special') this.touchInput.special = true;
      });
      button.addEventListener('pointerup', () => {
        const action = button.dataset.touch;
        if (action === 'left') this.touchInput.left = false;
        if (action === 'right') this.touchInput.right = false;
        if (action === 'jump') this.touchInput.jump = false;
        if (action === 'attack') this.touchInput.attack = false;
        if (action === 'special') this.touchInput.special = false;
      });
    });

    window.addEventListener('resize', () => this.ui.setTouchControls());
  }

  start() {
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000 || 0.016, 0.033);
    this.lastTime = time;
    this.update(dt);
    this.draw();
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  showMainMenu() {
    this.state = 'menu';
    this.ui.setMenuVisible(true);
    this.ui.setPauseVisible(false);
    this.ui.resultOverlay.classList.add('hidden');
    this.ui.hud.classList.add('hidden');
  }

  startNewGame() {
    this.levelProgress = window.ORDEM.save.defaultState();
    this.currentLevelId = 'station';
    this.showIntroSequence();
  }

  continueGame() {
    this.levelProgress = window.ORDEM.save.load();
    this.currentLevelId = this.levelProgress.unlockedLevels[this.levelProgress.unlockedLevels.length - 1] || 'station';
    this.showIntroSequence();
  }

  showIntroSequence() {
    this.state = 'intro';
    this.ui.setMenuVisible(false);
    this.ui.hud.classList.add('hidden');
    this.introLines = window.ORDEM_DATA.story.intro;
    this.introIndex = 0;
    this.introTimer = 2.4;
  }

  beginCampaign() {
    this.kills = 0;
    this.totalTime = 0;
    this.waveIndex = 0;
    this.levelWon = false;
    this.loadLevel(this.currentLevelId || 'station');
  }

  loadLevel(levelId) {
    const config = window.ORDEM.LEVELS[levelId] || window.ORDEM.LEVELS.station;
    this.currentLevelId = config.id;
    this.currentLevel = config;
    this.currentLevelName = config.name;
    this.waveIndex = 0;
    this.waveTimer = 0;
    this.projectiles = [];
    this.effects = [];
    this.enemies = [];
    this.allies = [];
    this.player = new window.ORDEM.Player(window.ORDEM_DATA.characters.kael, 160, config.groundY - 60);
    this.player.kills = 0;
    this.state = 'playing';
    this.ui.setPauseVisible(false);
    this.ui.hud.classList.remove('hidden');
    this.ui.showMessage('ESTAÇÃO ABANDONADA');

    const missionLines = window.ORDEM_DATA.story.station.intro;
    this.showDialogue(missionLines, () => {
      this.spawnNextWave();
    }, 'ESTAÇÃO');

    this.unlockCharacter('kael');
    this.saveProgress();
  }

  spawnNextWave() {
    if (!this.currentLevel) return;
    const wave = this.currentLevel.waves[this.waveIndex];
    if (!wave) {
      this.checkLevelEnd();
      return;
    }

    for (let i = 0; i < wave.count; i++) {
      const x = 1100 + i * 50 + Math.random() * 100;
      const y = this.currentLevel.groundY - 52;
      this.enemies.push(new window.ORDEM.Enemy(wave.type, x, y));
    }

    this.waveIndex += 1;
    this.ui.showMessage('ONDA ' + this.waveIndex, 1.1);

    if (this.currentLevelId === 'station' && this.waveIndex === 2 && !this.storyFlags.rio) {
      this.storyFlags.rio = true;
      this.showDialogue(window.ORDEM_DATA.story.station.rio, () => {
        this.addAlly('rio');
      }, 'RIO');
    }

    if (this.currentLevelId === 'station' && this.waveIndex === 4 && !this.storyFlags.lira) {
      this.storyFlags.lira = true;
      this.showDialogue(window.ORDEM_DATA.story.station.lira, () => {
        this.addAlly('lira');
      }, 'LIRA');
    }
  }

  addAlly(characterId) {
    const data = window.ORDEM_DATA.characters[characterId];
    if (!data) return;
    const ally = new window.ORDEM.Player(data, this.player.x + (this.allies.length + 1) * 40, this.currentLevel.groundY - 60);
    ally.isPlayer = false;
    ally.alive = true;
    this.allies.push(ally);
    this.unlockCharacter(characterId);
    this.ui.showMessage(characterId.toUpperCase() + ' entrou na equipe', 1.4);
  }

  unlockCharacter(id) {
    if (!this.levelProgress.unlockedCharacters.includes(id)) {
      this.levelProgress.unlockedCharacters.push(id);
    }
  }

  saveProgress() {
    this.levelProgress.currentCharacter = this.player ? this.player.id : 'kael';
    this.levelProgress.unlockedLevels = Array.from(new Set(this.levelProgress.unlockedLevels || ['station']));
    window.ORDEM.save.save(this.levelProgress);
  }

  switchCharacter(characterId) {
    const config = window.ORDEM_DATA.characters[characterId];
    if (!config) return;
    if (!this.levelProgress.unlockedCharacters.includes(characterId) && characterId !== 'kael') {
      return;
    }

    const previous = this.player;
    const next = new window.ORDEM.Player(config, previous.x, previous.y);
    next.health = previous.health;
    next.energy = previous.energy;
    next.kills = this.kills;
    this.player = next;
    this.levelProgress.currentCharacter = characterId;
    this.saveProgress();
  }

  update(dt) {
    this.totalTime += dt;

    if (this.state === 'menu') return;

    if (this.state === 'intro') {
      this.introTimer -= dt;
      if (this.introTimer <= 0) {
        this.introIndex += 1;
        if (this.introIndex >= this.introLines.length) {
          this.beginCampaign();
          return;
        }
        this.introTimer = 2.2;
      }
      return;
    }

    if (this.state === 'paused') return;

    if (this.dialogue && this.dialogue.visible) {
      this.dialogueTimer -= dt;
      if (this.dialogueTimer <= 0) {
        this.dialogue.advance();
      }
    }

    if (!this.player || !this.currentLevel) return;

    const mergedInput = {
      left: this.input.left || this.touchInput.left,
      right: this.input.right || this.touchInput.right,
      jump: this.input.jump || this.touchInput.jump,
      attack: this.input.attack || this.touchInput.attack,
      special: this.input.special || this.touchInput.special,
      secondary: this.input.secondary
    };

    this.player.setInput(mergedInput);
    this.player.update(dt, this.currentLevel, this.enemies);

    for (const ally of this.allies) {
      ally.setInput({ left: false, right: false, jump: false, attack: false, special: false, secondary: false });
      window.ORDEM.updateAllyAI(ally, this.player, this.enemies, dt);
      ally.update(dt, this.currentLevel);
    }

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      enemy.update(dt, this.player, this.currentLevel, this);
    }

    for (const projectile of this.projectiles) {
      projectile.update(dt);
      if (projectile.owner === 'enemy') {
        if (window.ORDEM.hitCircle(projectile, this.player, projectile.radius, 18)) {
          this.player.takeDamage(projectile.damage);
          projectile.lifetime = 0;
        }
      } else {
        for (const enemy of this.enemies) {
          if (!enemy || enemy.dead) continue;
          if (window.ORDEM.hitCircle(projectile, enemy, projectile.radius, 16)) {
            enemy.takeDamage(projectile.damage, this.player);
            projectile.lifetime = 0;
            break;
          }
        }
      }
    }

    this.projectiles = this.projectiles.filter((projectile) => projectile && projectile.lifetime > 0);
    this.effects = this.effects.filter((effect) => effect && effect.life > 0);
    for (const effect of this.effects) {
      effect.update(dt);
    }

    if (this.player && !this.player.alive) {
      this.triggerGameOver();
    }

    if (this.enemies.length === 0 && this.waveIndex >= this.currentLevel.waves.length) {
      this.checkLevelEnd();
    }

    this.ui.updateHud(this);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === 'menu') {
      this.drawBackground();
      return;
    }

    this.drawBackground();

    const level = this.currentLevel || window.ORDEM.LEVELS.station;
    const baseY = level.groundY || 620;

    this.ctx.fillStyle = '#0b1124';
    this.ctx.fillRect(0, baseY, this.width, this.height - baseY);

    for (const platform of level.platforms || []) {
      this.ctx.fillStyle = 'rgba(137, 171, 255, 0.32)';
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.fillStyle = 'rgba(90, 201, 255, 0.6)';
      this.ctx.fillRect(platform.x, platform.y, platform.width, 4);
    }

    if (this.state === 'intro') {
      this.drawIntroText();
    }

    this.drawCrystals();

    if (this.player) {
      this.player.draw(this.ctx);
    }

    for (const ally of this.allies) {
      ally.draw(this.ctx);
    }

    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    for (const projectile of this.projectiles) {
      projectile.draw(this.ctx);
    }

    for (const effect of this.effects) {
      effect.draw(this.ctx);
    }

    if (this.player && this.player.secondaryActive > 0 && this.player.id === 'lira') {
      this.ctx.strokeStyle = 'rgba(195, 142, 255, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y - 12, 34 + this.player.secondaryActive * 20, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (this.currentLevel && this.currentLevel.id === 'station') {
      const heartX = 1120;
      const heartY = 420;
      const pulse = 1 + Math.sin(this.totalTime * 3) * 0.12;
      this.ctx.save();
      this.ctx.translate(heartX, heartY);
      this.ctx.scale(pulse, pulse);
      this.ctx.fillStyle = '#d5c8ff';
      this.ctx.shadowColor = '#d5c8ff';
      this.ctx.shadowBlur = 24;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  drawBackground() {
    const sky = this.ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#090d20');
    sky.addColorStop(1, '#040810');
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < 18; i++) {
      this.ctx.fillStyle = 'rgba(125, 165, 255, 0.8)';
      this.ctx.fillRect(i * 75 + 20, 80 + (i % 4) * 20, 2, 2);
    }

    this.ctx.fillStyle = 'rgba(14, 22, 42, 0.8)';
    this.ctx.fillRect(0, 560, this.width, 140);
    this.ctx.fillStyle = 'rgba(62, 95, 180, 0.75)';
    for (let i = 0; i < 20; i++) {
      const x = i * 70 + 18;
      const h = 90 + (i % 4) * 26;
      this.ctx.fillRect(x, 560 - h, 18, h);
    }
  }

  drawCrystals() {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const x = (i * 67 + (this.totalTime * 18) % 200) % this.width;
      const y = 90 + (i % 7) * 26;
      this.ctx.fillStyle = i % 2 === 0 ? 'rgba(100, 232, 255, 0.8)' : 'rgba(183, 129, 255, 0.8)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + 16); this.ctx.lineTo(x + 8, y); this.ctx.lineTo(x + 16, y + 16); this.ctx.lineTo(x + 8, y + 26); this.ctx.closePath();
      this.ctx.fill();
    }
  }

  drawIntroText() {
    const text = this.introLines[this.introIndex] || 'ORDEM NEON ASTERION';
    this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.ctx.font = '700 28px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.width / 2, this.height / 2);
  }

  checkLevelEnd() {
    if (this.levelWon) return;
    this.levelWon = true;
    this.ui.setResultVisible(true, 'MISSÃO CONCLUÍDA',
      '<strong>ESTAÇÃO ABANDONADA</strong><br>Inimigos derrotados: ' + this.kills + '<br>Tempo: ' + this.totalTime.toFixed(1) + 's<br>Pontuação: ' + (this.kills * 50 + Math.floor(this.totalTime)),
      'CONTINUAR',
      () => {
        this.currentLevelId = 'metro';
        this.levelProgress.unlockedLevels.push('metro');
        this.saveProgress();
        this.loadLevel('metro');
      }
    );
  }

  triggerGameOver() {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    this.ui.setResultVisible(true, 'MISSÃO FALHOU', 'Os Cristais escolheram a escuridão. Tente novamente.<br>Inimigos derrotados: ' + this.kills,
      'TENTAR NOVAMENTE',
      () => {
        this.beginCampaign();
      }
    );
  }

  togglePause() {
    if (this.state === 'menu' || this.state === 'intro') return;
    if (this.state === 'paused') {
      this.state = 'playing';
      this.ui.setPauseVisible(false);
      return;
    }
    this.state = 'paused';
    this.ui.setPauseVisible(true);
  }

  handleMenuAction(action) {
    if (action === 'new-game') {
      this.startNewGame();
      return;
    }
    if (action === 'continue') {
      this.continueGame();
      return;
    }
    if (action === 'resume') {
      this.togglePause();
      return;
    }
    if (action === 'restart-level') {
      this.beginCampaign();
      return;
    }
    if (action === 'menu') {
      this.showMainMenu();
      return;
    }
    if (action === 'controls') {
      this.ui.showMessage('A / D mover • W / SPACE pular • J atacar • K especial • L secundária • 1/2/3 trocar');
      return;
    }
    if (action === 'settings') {
      this.levelProgress.settings.sound = !this.levelProgress.settings.sound;
      window.ORDEM.audio.enabled = this.levelProgress.settings.sound;
      this.ui.showMessage(this.levelProgress.settings.sound ? 'SOM ATIVADO' : 'SOM DESATIVADO');
      this.saveProgress();
      return;
    }
    if (action === 'characters') {
      this.ui.showMessage('Kael • Rio • Lira');
      return;
    }
    if (action === 'next-scene') {
      const callback = this.ui.resultPrimaryBtn._resultCallback;
      this.ui.resultPrimaryBtn._resultCallback = null;
      this.ui.setResultVisible(false);
      if (callback) {
        callback();
        return;
      }
      this.beginCampaign();
    }
  }

  showDialogue(lines, callback, title) {
    this.dialogue.show(lines, callback, title || 'ORDEM');
    this.dialogueTimer = 4.1;
  }
}

window.ORDEM.Game = Game;
