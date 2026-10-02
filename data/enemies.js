window.ORDEM_DATA = window.ORDEM_DATA || {};

window.ORDEM_DATA.enemyTypes = {
  basic: {
    id: 'basic',
    name: 'FRATURADO BÁSICO',
    maxHealth: 36,
    speed: 1.8,
    damage: 8,
    range: 32,
    color: '#ff7284',
    reward: 10,
    attackCooldown: 1.1,
    type: 'melee'
  },
  fast: {
    id: 'fast',
    name: 'FRATURADO RÁPIDO',
    maxHealth: 28,
    speed: 2.7,
    damage: 11,
    range: 30,
    color: '#ffb65d',
    reward: 14,
    attackCooldown: 0.7,
    type: 'melee'
  },
  crystal: {
    id: 'crystal',
    name: 'FRATURADO CRISTALINO',
    maxHealth: 54,
    speed: 1.5,
    damage: 16,
    range: 36,
    color: '#8adfff',
    reward: 18,
    attackCooldown: 1.3,
    type: 'melee'
  },
  ranged: {
    id: 'ranged',
    name: 'FRATURADO À DISTÂNCIA',
    maxHealth: 34,
    speed: 1.1,
    damage: 12,
    range: 200,
    color: '#d591ff',
    reward: 16,
    attackCooldown: 1.7,
    type: 'ranged'
  },
  heart: {
    id: 'heart',
    name: 'CORAÇÃO NEON',
    maxHealth: 220,
    speed: 0,
    damage: 20,
    range: 120,
    color: '#d7d4ff',
    reward: 90,
    attackCooldown: 1.8,
    type: 'boss'
  },
  darius: {
    id: 'darius',
    name: 'DARIUS',
    maxHealth: 260,
    speed: 2.4,
    damage: 26,
    range: 50,
    color: '#ff7b68',
    reward: 120,
    attackCooldown: 1.1,
    type: 'boss'
  }
};
