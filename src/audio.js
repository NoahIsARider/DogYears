/** Quiet, entirely local sound design. No audio context is created until unlock(). */
export class HouseAudio {
  constructor({ volume = 0.35, muted = false } = {}) {
    this.volume = clamp(volume, 0, 1);
    this.muted = Boolean(muted);
    this.context = null;
    this.master = null;
    this.noAudio = false;
    this.disposed = false;
    this.unlocked = false;
    this._unlocking = null;
    this._nodes = new Set();
    this._voices = new Set();
    this._stepTime = 0;
    this._musicTime = 6;
    this._roomTime = 0;
    this._wasMemory = false;
    this._lastCue = new Map();
    this._noteIndex = 0;
    this._day = 1;
    this._lastAction = '';
  }

  async unlock() {
    if (this.disposed || this.noAudio) return false;
    if (this._unlocking) return this._unlocking;
    this._unlocking = this._open().finally(() => { this._unlocking = null; });
    return this._unlocking;
  }

  async _open() {
    try {
      if (!this.context) {
        const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContext) { this.noAudio = true; return false; }
        const ctx = this.context = new AudioContext({ latencyHint: 'interactive' });
        this.master = ctx.createGain();
        this.master.gain.value = 0;
        // A soft safety ceiling also catches overlapping footsteps and object sounds.
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -16;
        compressor.knee.value = 20;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.015;
        compressor.release.value = 0.3;
        this.master.connect(compressor);
        compressor.connect(ctx.destination);
        this._nodes.add(compressor);
        this._noiseBuffer = this._noise(3, true);
        this._dryBuffer = this._noise(0.7, false);
        this._createAmbience();
      }
      if (this.context.state === 'suspended') await this.context.resume();
      this.unlocked = this.context.state === 'running';
      this._setMaster();
      return this.unlocked;
    } catch {
      this.noAudio = true;
      this.unlocked = false;
      try { this.context?.close()?.catch(() => {}); } catch { /* sound is optional */ }
      return false;
    }
  }

  _noise(seconds, brown) {
    const ctx = this.context;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      previous = (previous + white * 0.025) / 1.025;
      data[i] = brown ? previous * 4 : white;
    }
    // Match the ends of looping room tone so there is no periodic click.
    if (brown) {
      const edge = Math.min(2048, Math.floor(data.length / 4));
      for (let i = 0; i < edge; i++) {
        const t = i / edge;
        data[i] = data[i] * t + data[data.length - edge + i] * (1 - t);
      }
    }
    return buffer;
  }

  _createAmbience() {
    const ctx = this.context;
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass'; low.frequency.value = 520; low.Q.value = 0.3;
    this._wind = ctx.createGain(); this._wind.gain.value = 0.025;
    source.connect(low); low.connect(this._wind); this._wind.connect(this.master);
    this._windFilter = low;
    this._windSource = source;
    source.start();
    [source, low, this._wind].forEach(n => this._nodes.add(n));

    // Air through a window, distinct from the low wind outside.
    const airSource = ctx.createBufferSource();
    airSource.buffer = this._noiseBuffer; airSource.loop = true;
    const air = ctx.createBiquadFilter();
    air.type = 'bandpass'; air.frequency.value = 1250; air.Q.value = 0.45;
    this._air = ctx.createGain(); this._air.gain.value = 0.007;
    airSource.connect(air); air.connect(this._air); this._air.connect(this.master);
    airSource.start(ctx.currentTime, 0.83);
    this._airSource = airSource;
    [airSource, air, this._air].forEach(n => this._nodes.add(n));
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    this._setMaster();
  }

  setVolume(volume) {
    if (Number.isFinite(Number(volume))) this.volume = clamp(Number(volume), 0, 1);
    this._setMaster();
  }

  _setMaster() {
    try {
      if (this.master && this.context?.state !== 'closed') {
        this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, 0.045);
      }
    } catch { /* a closing or unavailable device must not interrupt play */ }
  }

  update({ dt = 0, position, moving = false, room = '', memory = false, time = 0, years = 0, day = 1, action = '' } = {}) {
    if (!this.unlocked || this.disposed || this.noAudio || this.context?.state !== 'running') return;
    try {
      dt = clamp(Number(dt) || 0, 0, 0.15);
      const now = this.context.currentTime;
      this._day = Math.floor(clamp(day, 1, 7));
      this._roomTime += dt;
      const roomName = String(room).toLowerCase();
      const z = Array.isArray(position) ? position[2] : position?.z;
      const outside = /porch|garden|outside/.test(roomName) || (Number.isFinite(z) && z < -6.15);
      const gust = 0.88 + 0.12 * Math.sin(this._roomTime * 0.21) + 0.07 * Math.sin(this._roomTime * 0.071);
      // The fifth afternoon gathers behind the windows. On the sixth the wind
      // recedes again, leaving room for a small physical sound to carry a scene.
      const chapterWind = this._day === 5 ? 1.3 : this._day >= 6 ? 0.72 : 1;
      const chapterAir = this._day === 5 ? 1.18 : this._day >= 6 ? 0.82 : 1;
      this._wind.gain.setTargetAtTime((outside ? 0.075 : 0.026) * gust * chapterWind * (memory ? 0.6 : 1), now, 1.8);
      this._air.gain.setTargetAtTime((outside ? 0.018 : 0.006) * chapterAir, now, 1.5);
      this._windFilter.frequency.setTargetAtTime((outside ? 900 : 430) * (this._day === 5 ? 0.78 : 1), now, 2);
      const currentAction = typeof action === 'string' ? action : '';
      if (currentAction && currentAction !== this._lastAction) this.cue(currentAction);
      this._lastAction = currentAction;

      if (moving) {
        this._stepTime -= dt;
        if (this._stepTime <= 0) {
          this.cue(outside ? 'gravel' : 'step');
          this._stepTime = 0.57 + Math.random() * 0.08;
        }
      } else this._stepTime = Math.min(this._stepTime, 0.12);

      const inMemory = Boolean(memory);
      if (inMemory && !this._wasMemory) this._musicTime = 1.2;
      if (inMemory) {
        this._musicTime -= dt;
        if (this._musicTime <= 0) {
          this._memoryMotif();
          this._musicTime = 13 + Math.random() * 7;
        }
      }
      this._wasMemory = inMemory;
      // Kept in the public contract for future sound variations without binding
      // the atmosphere to a conspicuous numerical "grief meter" effect.
      void time; void years;
    } catch { /* audio should never stop the scene update */ }
  }

  cue(name) {
    if (!this.unlocked || this.disposed || this.noAudio || this.muted || this.context?.state !== 'running') return;
    try {
      const now = this.context.currentTime;
      const prior = this._lastCue.get(name) ?? -Infinity;
      const separation = ['beamfall', 'knock', 'breath', 'gate'].includes(name) ? 1.8 : name === 'brace' ? 0.8 : name === 'step' || name === 'gravel' ? 0.2 : 0.09;
      if (now - prior < separation) return;
      this._lastCue.set(name, now);
      if (this._voices.size > 40) return;
      switch (name) {
        case 'step':
          this._rustle(0.13, 0.095, 380, 'lowpass');
          this._tone(68 + Math.random() * 15, 0.13, 0.06, 'sine', 0, 0.003);
          if (Math.random() < 0.2) this._rustle(0.25, 0.014, 830, 'bandpass', 0.045);
          break;
        case 'gravel': this._rustle(0.22, 0.08, 1450, 'lowpass'); break;
        case 'key':
          this._rustle(0.09, 0.035, 3200, 'highpass');
          [2230, 3640, 4980].forEach((f, i) => this._tone(f, 0.2 - i * 0.03, 0.007, 'sine', i * 0.015, 0.002));
          break;
        case 'cup':
          [720, 1476, 2511].forEach((f, i) => this._tone(f, 0.26 - i * 0.05, 0.011 / (i + 1), 'sine', 0, 0.002));
          this._rustle(0.055, 0.027, 1150, 'lowpass');
          break;
        case 'message':
        case 'phone':
          this._tone(113, 0.19, 0.045, 'triangle', 0, 0.018);
          this._tone(109, 0.22, 0.039, 'triangle', 0.36, 0.018);
          break;
        case 'page':
          this._rustle(0.16, 0.036, 2100, 'bandpass');
          this._rustle(0.46, 0.041, 1350, 'bandpass', 0.11);
          break;
        case 'paper': this._rustle(0.48, 0.065, 1850, 'bandpass'); break;
        case 'cloth': this._rustle(0.6, 0.055, 570, 'lowpass'); break;
        case 'door':
          this._rustle(0.55, 0.04, 220, 'lowpass');
          this._tone(82, 0.27, 0.032, 'sine', 0.35, 0.012);
          break;
        case 'choice': this._rustle(0.32, 0.028, 740, 'lowpass'); break;
        case 'sleep': this._rustle(1.15, 0.035, 340, 'lowpass'); break;
        case 'beamfall':
          this._woodImpact(0, 0.85);
          this._woodImpact(0.12, 0.34);
          this._woodImpact(0.29, 0.18);
          this._rustle(0.6, 0.029, 710, 'bandpass', 0.05);
          break;
        case 'brace':
          this._creak(0, 0.8, 112, 0.019);
          this._rustle(0.45, 0.022, 430, 'lowpass', 0.05);
          break;
        case 'knock':
          this._woodImpact(0, 0.55);
          this._woodImpact(0.31, 0.48);
          this._woodImpact(0.69, 0.37);
          break;
        case 'breath':
          this._airEnvelope(1.55, 0.026, 640);
          break;
        case 'gate':
          this._creak(0, 1.15, 168, 0.014);
          this._rustle(0.85, 0.028, 570, 'bandpass', 0.08);
          this._woodImpact(1.05, 0.32);
          break;
        case 'keyturn':
          this._rustle(0.13, 0.025, 2300, 'highpass');
          this._rustle(0.28, 0.026, 600, 'bandpass', 0.17);
          this._tone(340, 0.045, 0.011, 'sine', 0.38, 0.002);
          this._woodImpact(0.43, 0.16);
          break;
        default: break;
      }
    } catch { /* optional cue */ }
  }

  _memoryMotif() {
    const first = [146.832, 130.813, 164.814][this._noteIndex++ % 3];
    this._feltNote(first, 0, 0.85);
    if (this._day >= 3) this._feltNote(this._day === 5 ? first * 1.12246 : first * 1.4983, 0.95, 0.55);
    if (this._day >= 5) this._feltNote(this._day >= 6 ? first * 1.1892 : first * 0.8909, 2.25, 0.46);
  }

  _feltNote(frequency, delay = 0, level = 1) {
    if (this.muted) return;
    this._tone(frequency, 4.6, 0.023 * level, 'sine', delay, 0.012);
    this._tone(frequency * 2.003, 2.4, 0.006 * level, 'sine', delay, 0.009);
    this._tone(frequency * 3.01, 0.8, 0.0018 * level, 'sine', delay, 0.006);
    this._rustle(0.055, 0.009 * level, 500, 'lowpass', delay);
  }

  _woodImpact(delay, weight = 1) {
    // A muffled broad impact and short inharmonic body, without a pitched alert.
    this._rustle(0.065, 0.10 * weight, 540, 'lowpass', delay);
    this._tone(86 + Math.random() * 11, 0.15, 0.045 * weight, 'sine', delay, 0.002);
    this._tone(213 + Math.random() * 19, 0.07, 0.009 * weight, 'sine', delay + 0.002, 0.002);
  }

  _creak(delay, duration, frequency, level) {
    const ctx = this.context, at = ctx.currentTime + delay;
    const source = ctx.createBufferSource(), band = ctx.createBiquadFilter(), envelope = ctx.createGain();
    source.buffer = this._dryBuffer; source.loop = true;
    band.type = 'bandpass'; band.Q.value = 9;
    band.frequency.setValueAtTime(frequency, at);
    band.frequency.exponentialRampToValueAtTime(frequency * 1.4, at + duration * 0.35);
    band.frequency.exponentialRampToValueAtTime(frequency * 0.82, at + duration);
    envelope.gain.setValueAtTime(0.00001, at);
    envelope.gain.exponentialRampToValueAtTime(level, at + 0.11);
    envelope.gain.exponentialRampToValueAtTime(0.00001, at + duration);
    source.connect(band); band.connect(envelope); envelope.connect(this.master);
    this._track(source, band, envelope); source.start(at); source.stop(at + duration + 0.02);
  }

  _airEnvelope(duration, level, frequency) {
    const ctx = this.context, at = ctx.currentTime;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), envelope = ctx.createGain();
    source.buffer = this._noiseBuffer; source.loop = true;
    filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = 0.45;
    envelope.gain.setValueAtTime(0.00001, at);
    envelope.gain.exponentialRampToValueAtTime(level, at + duration * 0.38);
    envelope.gain.exponentialRampToValueAtTime(0.00001, at + duration);
    source.connect(filter); filter.connect(envelope); envelope.connect(this.master);
    this._track(source, filter, envelope); source.start(at); source.stop(at + duration + 0.02);
  }

  _tone(frequency, duration, level, type = 'sine', delay = 0, attack = 0.01) {
    const ctx = this.context, at = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator(), envelope = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    // A little settling in the body of wooden/ceramic sounds avoids a UI-tone feel.
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.995, at + duration);
    envelope.gain.setValueAtTime(0.00001, at);
    envelope.gain.exponentialRampToValueAtTime(Math.max(level, 0.00002), at + attack);
    envelope.gain.exponentialRampToValueAtTime(0.00001, at + duration);
    oscillator.connect(envelope); envelope.connect(this.master);
    this._track(oscillator, envelope);
    oscillator.start(at); oscillator.stop(at + duration + 0.02);
  }

  _rustle(duration, level, frequency, type, delay = 0) {
    const ctx = this.context, at = ctx.currentTime + delay;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), envelope = ctx.createGain();
    source.buffer = this._dryBuffer; source.loop = true;
    filter.type = type; filter.frequency.value = frequency; filter.Q.value = 0.65;
    envelope.gain.setValueAtTime(0.00001, at);
    envelope.gain.exponentialRampToValueAtTime(level, at + Math.min(0.025, duration * 0.15));
    envelope.gain.exponentialRampToValueAtTime(0.00001, at + duration);
    source.connect(filter); filter.connect(envelope); envelope.connect(this.master);
    this._track(source, filter, envelope);
    source.start(at, Math.random() * 0.3); source.stop(at + duration + 0.02);
  }

  _track(source, ...nodes) {
    this._voices.add(source);
    source.onended = () => {
      this._voices.delete(source);
      [source, ...nodes].forEach(node => { try { node.disconnect(); } catch { /* already closed */ } });
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.unlocked = false;
    for (const source of [this._windSource, this._airSource, ...this._voices]) {
      try { source?.stop(); } catch { /* source has already finished */ }
    }
    for (const node of this._nodes) { try { node.disconnect(); } catch { /* no-op */ } }
    this._nodes.clear(); this._voices.clear();
    try { this.master?.disconnect(); this.context?.close()?.catch(() => {}); } catch { /* no-op */ }
  }
}

function clamp(value, low, high) { return Math.max(low, Math.min(high, Number(value) || 0)); }
