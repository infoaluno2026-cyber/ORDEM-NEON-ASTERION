window.ORDEM = window.ORDEM || {};

(function () {
  const STORAGE_KEY = 'ordem-neon-asterion-save-v1';

  function defaultState() {
    return {
      unlockedLevels: ['station'],
      unlockedCharacters: ['kael', 'vega'],
      currentCharacter: 'kael',
      settings: {
        sound: true,
        touch: true,
        music: true
      },
      stats: {
        kills: 0,
        bestTime: 0
      }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const state = Object.assign(defaultState(), parsed, {
        settings: Object.assign(defaultState().settings, parsed.settings || {}),
        stats: Object.assign(defaultState().stats, parsed.stats || {})
      });
      state.unlockedCharacters = Array.from(new Set([
        ...(Array.isArray(state.unlockedCharacters) ? state.unlockedCharacters : ['kael']),
        'vega'
      ]));
      return state;
    } catch (error) {
      return defaultState();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function reset() {
    const fresh = defaultState();
    save(fresh);
    return fresh;
  }

  window.ORDEM.save = {
    STORAGE_KEY,
    load,
    save,
    reset,
    defaultState
  };
})();
