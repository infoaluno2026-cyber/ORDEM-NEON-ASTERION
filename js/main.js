window.ORDEM = window.ORDEM || {};

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new window.ORDEM.Game(canvas);
  game.start();
});
