import { particles } from '../core/particles.js';
import { environment } from './environment.js';

// Occasional rain. Spawns streak particles across the visible area and asks
// the environment to darken the scene while it rains. Particle count is
// naturally capped by the shared particle system (max ~100).
export class WeatherSystem {
    constructor() {
        this.state = 'clear';   // 'clear' | 'rain'
        this.stateTimer = this._randClear();
        this.spawnAcc = 0;
        this.intensity = 0;     // 0..1 ramps in/out
    }

    reset() {
        this.state = 'clear';
        this.stateTimer = this._randClear();
        this.spawnAcc = 0;
        this.intensity = 0;
    }

    _randClear() { return 30 + Math.random() * 40; } // 30-70s clear
    _randRain() { return 15 + Math.random() * 20; }  // 15-35s rain

    update(dt, cameraX) {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
            if (this.state === 'clear') {
                this.state = 'rain';
                this.stateTimer = this._randRain();
            } else {
                this.state = 'clear';
                this.stateTimer = this._randClear();
            }
        }

        // ramp intensity toward target
        const target = this.state === 'rain' ? 1 : 0;
        this.intensity += (target - this.intensity) * Math.min(1, dt * 1.5);
        if (this.intensity < 0.02) this.intensity = 0;

        environment.setWeatherDarken(this.intensity);

        if (this.intensity > 0.1) {
            // spawn streaks across the visible width
            this.spawnAcc += dt;
            const rate = 0.03; // seconds per streak attempt
            const viewLeft = (cameraX || 0);
            const viewW = window.innerWidth;
            while (this.spawnAcc >= rate) {
                this.spawnAcc -= rate;
                if (Math.random() < this.intensity) {
                    const x = viewLeft + Math.random() * viewW;
                    const y = -20 + Math.random() * -40;
                    particles.spawnRainStreak(x, y, 12 + Math.random() * 8);
                }
            }
        }
    }
}

export const weather = new WeatherSystem();
