import { renderer } from '../core/renderer.js';

// Slow day/night cycle. Applies a tint overlay to the background/midground
// containers over ~3 minutes. Performance-friendly: only updates a tint value.
export class Environment {
    constructor() {
        this.cycleLength = 180; // seconds for a full day->night->day loop
        this.time = 40;         // start mid-morning-ish
        this.weatherDarken = 0; // extra darkening from weather (0..1)
    }

    reset() {
        this.time = 40;
        this.weatherDarken = 0;
    }

    // phase 0..1 across the cycle
    update(dt) {
        this.time = (this.time + dt) % this.cycleLength;
        const phase = this.time / this.cycleLength; // 0..1

        // brightness curve: bright at day (phase ~0.25), dark at night (~0.75)
        // use a cosine so it eases smoothly.
        // day = 1.0 brightness, night = ~0.45 brightness
        const daylight = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2); // 1 at 0, 0 at .5
        let brightness = 0.5 + 0.45 * daylight; // 0.5..0.95

        // weather darkens the scene
        brightness *= (1 - this.weatherDarken * 0.35);

        const tint = this._brightnessToTint(brightness, phase);

        if (renderer.bgContainer) renderer.bgContainer.tint = tint;
        if (renderer.mgContainer) renderer.mgContainer.tint = tint;
    }

    setWeatherDarken(v) {
        this.weatherDarken = Math.max(0, Math.min(1, v));
    }

    _brightnessToTint(brightness, phase) {
        // Slight warm at day, cool blue at night.
        // night factor: 1 near phase .5 (night), 0 at day
        const night = Math.max(0, -Math.cos(phase * Math.PI * 2)) ; // 0..1 peaks at .5
        let r = brightness;
        let g = brightness;
        let b = brightness;
        // tint toward blue at night
        r *= (1 - night * 0.25);
        g *= (1 - night * 0.12);
        b *= (1 + night * 0.05);
        const R = Math.max(0, Math.min(255, Math.round(r * 255)));
        const G = Math.max(0, Math.min(255, Math.round(g * 255)));
        const B = Math.max(0, Math.min(255, Math.round(b * 255)));
        return (R << 16) | (G << 8) | B;
    }
}

export const environment = new Environment();
