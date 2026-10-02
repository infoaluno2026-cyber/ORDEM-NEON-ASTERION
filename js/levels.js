window.ORDEM = window.ORDEM || {};

const LEVEL_DEFS = {
  station: {
    id: 'station',
    name: 'ESTAÇÃO ABANDONADA',
    theme: 'subway',
    groundY: 620,
    bounds: { left: 0, right: 1280 },
    platforms: [
      { x: 220, y: 510, width: 150, height: 18 },
      { x: 490, y: 470, width: 150, height: 18 },
      { x: 760, y: 435, width: 150, height: 18 },
      { x: 980, y: 500, width: 170, height: 18 }
    ],
    waves: [
      { type: 'basic', count: 3 },
      { type: 'fast', count: 2 },
      { type: 'ranged', count: 2 },
      { type: 'crystal', count: 2 },
      { type: 'basic', count: 3 }
    ],
    boss: 'heart'
  },
  metro: {
    id: 'metro',
    name: 'METRÔ CORROMPIDO',
    theme: 'metro',
    groundY: 620,
    bounds: { left: 0, right: 1280 },
    platforms: [
      { x: 200, y: 520, width: 180, height: 18 },
      { x: 500, y: 470, width: 160, height: 18 },
      { x: 820, y: 430, width: 170, height: 18 },
      { x: 1080, y: 500, width: 120, height: 18 }
    ],
    waves: [
      { type: 'fast', count: 4 },
      { type: 'ranged', count: 2 },
      { type: 'crystal', count: 2 },
      { type: 'basic', count: 3 }
    ],
    boss: 'darius'
  },
  base: {
    id: 'base',
    name: 'BASE DO ECLIPSE',
    theme: 'lab',
    groundY: 620,
    bounds: { left: 0, right: 1280 },
    platforms: [
      { x: 150, y: 510, width: 180, height: 18 },
      { x: 390, y: 470, width: 160, height: 18 },
      { x: 640, y: 420, width: 170, height: 18 },
      { x: 920, y: 500, width: 180, height: 18 }
    ],
    waves: [
      { type: 'ranged', count: 3 },
      { type: 'crystal', count: 2 },
      { type: 'fast', count: 3 },
      { type: 'basic', count: 3 }
    ],
    boss: 'nyra'
  }
};

window.ORDEM.LEVELS = LEVEL_DEFS;
