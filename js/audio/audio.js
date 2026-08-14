export class AudioManager {
    constructor() {
        this.initialized = false;
        this.musicPlaying = null;
    }
    
    init() {
        if (this.initialized) {
            // iOS: resume a suspended context on any subsequent user gesture.
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
            return;
        }
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.connect(this.ctx.destination);
        this.masterVolume.gain.value = 0.3;
        this.initialized = true;

        // iOS audio unlock: the context may start suspended; resume on the
        // first touch/click anywhere and keep it running.
        const unlock = () => {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            if (this.ctx.state === 'running') {
                document.removeEventListener('touchstart', unlock);
                document.removeEventListener('touchend', unlock);
                document.removeEventListener('click', unlock);
            }
        };
        document.addEventListener('touchstart', unlock);
        document.addEventListener('touchend', unlock);
        document.addEventListener('click', unlock);
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.music = new MusicEngine(this.ctx, this.masterVolume);
    }
    
    playTone(freq, type, duration, vol=1) {
        if (!this.initialized || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    
    playHitLight() { this.playTone(250, 'square', 0.1, 0.3); }
    playHitHeavy() { this.playTone(150, 'sawtooth', 0.2, 0.5); }
    playJump() { this.playTone(400, 'sine', 0.15, 0.2); }
    playCoin() { 
        this.playTone(523.25, 'sine', 0.1, 0.3); 
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.3), 50);
    }
    playDeath() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // ---- Music facade ----
    startMusic() {
        if (this.initialized && this.music) this.music.start();
    }
    stopMusic() {
        if (this.music) this.music.stop();
    }
    setMusicIntensity(level) { // 'ambient' | 'combat' | 'boss'
        if (this.music) this.music.setIntensity(level);
    }
}

/**
 * Procedural layered synthwave engine.
 *
 * Three layers share one 90 BPM clock:
 *  - ambient: bass line + slow pad (always audible while music runs)
 *  - combat:  drums (kick/snare/hat) + arp lead
 *  - boss:    darker driving bass octave + menacing lead + double-time hats
 *
 * Layers are mixed through per-layer GainNodes and crossfaded over ~1.5s.
 * All notes are scheduled ahead of time with a lookahead timer, so the
 * transport never drifts and layers stay in sync.
 */
class MusicEngine {
    constructor(ctx, out) {
        this.ctx = ctx;
        this.bpm = 90;
        this.stepDur = 60 / this.bpm / 4; // 16th note
        this.stepsPerBar = 16;
        this.running = false;
        this.intensity = 'ambient';
        this.fadeTime = 1.5;

        this.musicGain = ctx.createGain();
        this.musicGain.gain.value = 0.55;
        this.musicGain.connect(out);

        this.layers = {};
        for (const name of ['ambient', 'combat', 'boss']) {
            const g = ctx.createGain();
            g.gain.value = name === 'ambient' ? 1 : 0;
            g.connect(this.musicGain);
            this.layers[name] = g;
        }

        // A-minor synthwave progression: Am - F - C - G (roots), one chord per bar
        this.chordRoots = [57, 53, 48, 55]; // MIDI: A2, F2(F3 low), C2(C3), G2(G3)
        this.chordTones = [
            [57, 60, 64], // Am
            [53, 57, 60], // F
            [48, 52, 55], // C
            [55, 59, 62], // G
        ];
        this.bossRoots = [45, 45, 48, 44]; // A1 A1 C2 G#1 — darker, chromatic tension
    }

    midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    start() {
        if (this.running) return;
        this.running = true;
        this.step = 0;
        this.nextTime = this.ctx.currentTime + 0.1;
        this.timer = setInterval(() => this.schedule(), 60);
    }

    stop() {
        this.running = false;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }

    setIntensity(level) {
        if (this.intensity === level || !this.layers[level]) return;
        this.intensity = level;
        const t = this.ctx.currentTime;
        const target = {
            ambient: { ambient: 1, combat: 0, boss: 0 },
            combat:  { ambient: 0.7, combat: 1, boss: 0 },
            boss:    { ambient: 0.35, combat: 0.8, boss: 1 },
        }[level];
        for (const name in target) {
            const g = this.layers[name].gain;
            g.cancelScheduledValues(t);
            g.setValueAtTime(g.value, t);
            g.linearRampToValueAtTime(target[name], t + this.fadeTime);
        }
    }

    // Lookahead scheduler: queue every 16th step ~0.2s ahead.
    schedule() {
        if (!this.running) return;
        while (this.nextTime < this.ctx.currentTime + 0.2) {
            this.scheduleStep(this.step, this.nextTime);
            this.nextTime += this.stepDur;
            this.step++;
        }
    }

    scheduleStep(step, t) {
        const bar = Math.floor(step / this.stepsPerBar) % 4;
        const s = step % this.stepsPerBar;

        // ---------- AMBIENT LAYER ----------
        const root = this.chordRoots[bar];
        // Bass: root pulse on beats 1 and 3, fifth on the "and" of 2
        if (s === 0 || s === 8) this.note('triangle', this.midiToFreq(root - 12), t, this.stepDur * 3.5, 0.5, this.layers.ambient);
        if (s === 6) this.note('triangle', this.midiToFreq(root - 5), t, this.stepDur * 1.5, 0.3, this.layers.ambient);
        // Pad: soft detuned chord at the start of each bar
        if (s === 0) {
            for (const m of this.chordTones[bar]) {
                this.pad(this.midiToFreq(m), t, this.stepDur * 16, 0.06, this.layers.ambient);
                this.pad(this.midiToFreq(m) * 1.004, t, this.stepDur * 16, 0.045, this.layers.ambient);
            }
        }

        // ---------- COMBAT LAYER ----------
        // Kick on every beat, snare on 2 & 4, hats on 8ths
        if (s % 4 === 0) this.kick(t, this.layers.combat);
        if (s === 4 || s === 12) this.snare(t, this.layers.combat);
        if (s % 2 === 0) this.hat(t, 0.08, this.layers.combat);
        // Arp lead: 16th-note arpeggio over the chord, up an octave
        const tones = this.chordTones[bar];
        if (s % 2 === 1) {
            const m = tones[(s >> 1) % tones.length] + 12;
            this.note('square', this.midiToFreq(m), t, this.stepDur * 0.9, 0.09, this.layers.combat);
        }

        // ---------- BOSS LAYER ----------
        const broot = this.bossRoots[bar];
        // Driving 8th-note octave bass
        if (s % 2 === 0) {
            const oct = (s % 4 === 0) ? 0 : 12;
            this.note('sawtooth', this.midiToFreq(broot + oct), t, this.stepDur * 0.9, 0.22, this.layers.boss);
        }
        // Double-time hats
        this.hat(t, 0.05, this.layers.boss);
        // Menacing lead stabs: half-step trill at bar ends
        if (s === 12 || s === 14) {
            this.note('sawtooth', this.midiToFreq(broot + 24 + (s === 14 ? 1 : 0)), t, this.stepDur * 1.8, 0.12, this.layers.boss);
        }
    }

    // ---- voices ----
    note(type, freq, t, dur, vol, dest) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g); g.connect(dest);
        osc.start(t); osc.stop(t + dur + 0.05);
    }

    pad(freq, t, dur, vol, dest) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(900, t);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + dur * 0.3);
        g.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(filt); filt.connect(g); g.connect(dest);
        osc.start(t); osc.stop(t + dur + 0.05);
    }

    kick(t, dest) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(g); g.connect(dest);
        osc.start(t); osc.stop(t + 0.16);
    }

    snare(t, dest) {
        const noise = this.noiseSource(t, 0.12);
        const g = this.ctx.createGain();
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.value = 1500;
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        noise.connect(filt); filt.connect(g); g.connect(dest);
    }

    hat(t, vol, dest) {
        const noise = this.noiseSource(t, 0.04);
        const g = this.ctx.createGain();
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.value = 6000;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        noise.connect(filt); filt.connect(g); g.connect(dest);
    }

    noiseSource(t, dur) {
        if (!this._noiseBuf) {
            const len = this.ctx.sampleRate * 0.2;
            this._noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const d = this._noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuf;
        src.start(t); src.stop(t + dur);
        return src;
    }
}

export const audio = new AudioManager();
