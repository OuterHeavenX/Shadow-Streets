import { input } from './input.js';

export class GameLoop {
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.lastTime = 0;
        this.running = false;
        this.boundLoop = this.loop.bind(this);
    }
    start() {
        if(this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.boundLoop);
    }
    stop() {
        this.running = false;
    }
    loop(time) {
        if (!this.running) return;
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        const safeDt = Math.min(dt, 0.1); // Max 100ms step to prevent spiral
        
        this.updateFn(safeDt);
        input.update(); // clear justPressed
        this.renderFn();
        
        requestAnimationFrame(this.boundLoop);
    }
}