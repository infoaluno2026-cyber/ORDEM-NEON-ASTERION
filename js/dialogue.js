window.ORDEM = window.ORDEM || {};

class Dialogue {
  constructor() {
    this.element = document.getElementById('dialogueBox');
    this.header = document.createElement('div');
    this.text = document.createElement('div');
    this.header.className = 'dialogue-header';
    this.text.className = 'dialogue-text';
    this.element.appendChild(this.header);
    this.element.appendChild(this.text);
    this.lines = [];
    this.index = 0;
    this.callback = null;
    this.visible = false;
  }

  show(lines, callback, title = 'ORDEM') {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.index = 0;
    this.callback = callback || null;
    this.header.textContent = title;
    this.render();
    this.element.classList.remove('hidden');
    this.visible = true;
  }

  render() {
    if (!this.lines.length) return;
    const current = this.lines[this.index];
    this.text.textContent = current;
  }

  advance() {
    if (!this.visible) return;
    if (this.index < this.lines.length - 1) {
      this.index += 1;
      this.render();
      return;
    }
    this.close();
  }

  close() {
    this.visible = false;
    this.element.classList.add('hidden');
    if (this.callback) {
      const cb = this.callback;
      this.callback = null;
      cb();
    }
  }
}

window.ORDEM.Dialogue = Dialogue;
