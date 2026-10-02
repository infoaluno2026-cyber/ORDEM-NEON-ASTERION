window.ORDEM = window.ORDEM || {};

class UI {
  constructor() {
    this.hud = document.getElementById('hud');
    this.messageBox = document.getElementById('messageBox');
    this.mainMenu = document.getElementById('mainMenu');
    this.pauseOverlay = document.getElementById('pauseOverlay');
    this.resultOverlay = document.getElementById('resultOverlay');
    this.touchControls = document.getElementById('touchControls');

    this.portrait = document.getElementById('portrait');
    this.charName = document.getElementById('charName');
    this.charTitle = document.getElementById('charTitle');
    this.healthBar = document.getElementById('healthBar');
    this.energyBar = document.getElementById('energyBar');
    this.healthText = document.getElementById('healthText');
    this.energyText = document.getElementById('energyText');
    this.specialName = document.getElementById('specialName');
    this.secondaryName = document.getElementById('secondaryName');
    this.specialCooldownText = document.getElementById('specialCooldownText');
    this.secondaryCooldownText = document.getElementById('secondaryCooldownText');
    this.missionName = document.getElementById('missionName');
    this.enemyCount = document.getElementById('enemyCount');
    this.kills = document.getElementById('kills');
    this.resultTitle = document.getElementById('resultTitle');
    this.resultText = document.getElementById('resultText');
    this.resultPrimaryBtn = document.getElementById('resultPrimaryBtn');

    this._touchEnabled = window.innerWidth <= 820 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }

  setTouchControls() {
    const shouldShow = window.innerWidth <= 820 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    this._touchEnabled = shouldShow;
    if (shouldShow) {
      this.touchControls.classList.remove('hidden');
    } else {
      this.touchControls.classList.add('hidden');
    }
  }

  showMessage(text, duration = 1.2) {
    this.messageBox.textContent = text;
    this.messageBox.classList.remove('hidden');
    clearTimeout(this.messageBoxTimer);
    this.messageBoxTimer = setTimeout(() => {
      this.messageBox.classList.add('hidden');
    }, duration * 1000);
  }

  setMenuVisible(visible) {
    this.mainMenu.classList.toggle('hidden', !visible);
  }

  setPauseVisible(visible) {
    this.pauseOverlay.classList.toggle('hidden', !visible);
  }

  setResultVisible(visible, title = 'MISSÃO CONCLUÍDA', text = '', primaryText = 'CONTINUAR', callback = null) {
    this.resultOverlay.classList.toggle('hidden', !visible);
    this.resultTitle.textContent = title;
    this.resultText.innerHTML = text;
    this.resultPrimaryBtn.textContent = primaryText;
    this.resultPrimaryBtn.dataset.action = 'next-scene';
    this.resultPrimaryBtn._resultCallback = callback || null;
  }

  updateHud(game) {
    const player = game.player;
    if (!player) return;
    this.hud.classList.remove('hidden');
    this.portrait.textContent = player.portrait;
    this.charName.textContent = player.name;
    this.charTitle.textContent = player.title;
    this.missionName.textContent = game.currentLevel ? game.currentLevel.name : 'MISSÃO';
    this.enemyCount.textContent = String(game.enemies.length);
    this.kills.textContent = String(game.kills);

    const healthRatio = Math.max(0, player.health / player.maxHealth);
    const energyRatio = Math.max(0, player.energy / player.maxEnergy);
    this.healthBar.style.width = (healthRatio * 100) + '%';
    this.energyBar.style.width = (energyRatio * 100) + '%';
    this.healthText.textContent = Math.ceil(player.health) + ' / ' + player.maxHealth;
    this.energyText.textContent = Math.ceil(player.energy) + ' / ' + player.maxEnergy;
    this.specialName.textContent = player.specialName;
    this.secondaryName.textContent = player.secondaryName;
    this.specialCooldownText.textContent = player.specialCooldown > 0 ? 'Recarga ' + player.specialCooldown.toFixed(1) + 's' : 'Pronto';
    this.secondaryCooldownText.textContent = player.secondaryCooldown > 0 ? 'Recarga ' + player.secondaryCooldown.toFixed(1) + 's' : 'Pronto';
  }
}

window.ORDEM.UI = UI;
