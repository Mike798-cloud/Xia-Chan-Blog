(function () {
  'use strict';

  const AudioSys = {
    ctx: null,
    master: null,
    enabled: true,
    ambience: [],
    ambiencePlaying: false,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ctx.destination);
    },

    ensure() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggle() {
      this.ensure();
      this.enabled = !this.enabled;
      if (this.master && this.ctx) {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(this.master.gain.value, now);
        this.master.gain.linearRampToValueAtTime(this.enabled ? 0.32 : 0, now + 0.15);
      }
      const btn = document.getElementById('audio-toggle');
      if (btn) btn.textContent = this.enabled ? '♪ 音效开' : '♪ 音效关';
      if (this.enabled) this.startAmbience();
      else this.stopAmbience();
    },

    startAmbience() {
      this.ensure();
      if (!this.ctx || this.ambiencePlaying || !this.enabled) return;
      this.ambiencePlaying = true;
      const ctx = this.ctx;
      const fan = ctx.createOscillator();
      fan.type = 'sine';
      fan.frequency.value = 92;
      const fanGain = ctx.createGain();
      fanGain.gain.value = 0.055;
      const wobble = ctx.createOscillator();
      wobble.type = 'sine';
      wobble.frequency.value = 0.11;
      const wobbleGain = ctx.createGain();
      wobbleGain.gain.value = 7;
      wobble.connect(wobbleGain);
      wobbleGain.connect(fan.frequency);
      fan.connect(fanGain);
      fanGain.connect(this.master);
      fan.start();
      wobble.start();
      this.ambience = [fan, wobble, fanGain, wobbleGain];
    },

    stopAmbience() {
      this.ambience.forEach((node) => {
        try { if (node.stop) node.stop(); } catch (error) {}
        try { if (node.disconnect) node.disconnect(); } catch (error) {}
      });
      this.ambience = [];
      this.ambiencePlaying = false;
    },

    tone(freq, duration, type, gain, delay) {
      this.ensure();
      if (!this.ctx || !this.enabled) return;
      const ctx = this.ctx;
      const now = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gain || 0.18, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(g);
      g.connect(this.master);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    },

    playClick() {
      this.tone(880, 0.06, 'triangle', 0.12);
    },

    playError() {
      this.tone(220, 0.22, 'sawtooth', 0.16);
    },

    playClue() {
      this.tone(784, 0.22, 'sine', 0.16, 0);
      this.tone(1174, 0.24, 'sine', 0.13, 0.12);
    },

    playUnlock() {
      [659, 784, 988, 1318].forEach((n, i) => this.tone(n, 0.18, 'triangle', 0.15, i * 0.09));
    },

    playMusic() {
      [523, 659, 784, 1046, 784, 659].forEach((n, i) => this.tone(n, 0.2, 'sine', 0.1, i * 0.11));
    }
  };

  window.AudioSys = AudioSys;
})();
