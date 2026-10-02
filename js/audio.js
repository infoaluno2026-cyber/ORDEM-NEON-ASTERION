window.ORDEM = window.ORDEM || {};

(function () {
  function AudioSystem() {
    this.currentMusic = null;
    this.enabled = true;
  }

  AudioSystem.prototype.playMusic = function (name) {
    this.currentMusic = name;
    if (!this.enabled) return;
  };

  AudioSystem.prototype.playSound = function (name) {
    if (!this.enabled) return;
  };

  AudioSystem.prototype.stopMusic = function () {
    this.currentMusic = null;
  };

  window.ORDEM.audio = new AudioSystem();
})();
