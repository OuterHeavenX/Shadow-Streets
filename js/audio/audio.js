export class AudioManager {
    constructor() {
        this.initialized = false;
        this.musicPlaying = null;
    }
    
    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.connect(this.ctx.destination);
        this.masterVolume.gain.value = 0.3;
        this.initialized = true;
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
}
export const audio = new AudioManager();