import { renderer } from './renderer.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        this.bounds = { minX: 0, maxX: 8000 };
    }
    
    follow(targetX, dt) {
        const screenMid = window.innerWidth / 2;
        let targetCamX = targetX - screenMid;
        
        targetCamX = Math.max(this.bounds.minX, Math.min(targetCamX, this.bounds.maxX - window.innerWidth));
        
        this.x += (targetCamX - this.x) * 5 * dt;
        
        let offsetX = 0;
        let offsetY = 0;
        
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            offsetY = (Math.random() - 0.5) * this.shakeIntensity;
        }
        
        renderer.worldContainer.position.set(-this.x + offsetX, offsetY);
        
        // Parallax
        renderer.bgContainer.position.set(this.x * 0.8, 0); // moves slower
        renderer.mgContainer.position.set(this.x * 0.5, 0);
    }
    
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }
}
export const camera = new Camera();