window.ORDEM = window.ORDEM || {};

const LEVEL_DEFS = {
  station: {
    id: 'station',
    name: 'ESTAÇÃO ABANDONADA',
    theme: 'subway',
    groundY: 660,
    bounds: { left: 0, right: 1280 },
    platforms: [],
    waves: [
      { type: 'basic', count: 3 },
      { type: 'fast', count: 2 },
      { type: 'ranged', count: 2 },
      { type: 'basic', count: 3 }
    ],
    boss: 'heart'
  },
  metro: {
    id: 'metro',
    name: 'METRÔ CORROMPIDO',
    theme: 'metro',
    groundY: 660,
    bounds: { left: 0, right: 1280 },
    platforms: [],
    waves: [
      { type: 'fast', count: 4 },
      { type: 'ranged', count: 2 },
      { type: 'basic', count: 3 }
    ],
    boss: 'darius'
  },
  base: {
    id: 'base',
    name: 'BASE DO ECLIPSE',
    theme: 'lab',
    groundY: 660,
    bounds: { left: 0, right: 1280 },
    platforms: [],
    waves: [
      { type: 'ranged', count: 3 },
      { type: 'fast', count: 3 },
      { type: 'basic', count: 3 }
    ],
    boss: 'nyra'
  }
};

window.ORDEM.LEVELS = LEVEL_DEFS;
