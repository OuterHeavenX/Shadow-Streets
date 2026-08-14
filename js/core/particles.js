import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from './renderer.js';

// Simple pooled particle system. Reuses PIXI.Graphics objects to avoid
// per-frame allocations. Particles live in the world (fgContainer) so they
// move with the camera.
class ParticleSystem {
    constructor() {
        this.container = null;
        this.pool = [];       // free Graphics objects
        this.active = [];      // { g, vx, vy, life, maxLife, grav, fade }
        this.max = 100;        // hard cap for perf
    }

    ensureContainer() {
        if (this.container) return;
        this.container = new PIXI.Container();
        // Add to fgContainer so it tracks world space
        if (renderer.fgContainer) {
            renderer.fgContainer.addChild(this.container);
        }
    }

    _acquire() {
        let g = this.pool.pop();
        if (!g) {
            g = new PIXI.Graphics();
        }
        this.ensureContainer();
        this.container.addChild(g);
        g.visible = true;
        return g;
    }

    _release(p) {
        p.g.visible = false;
        if (p.g.parent) p.g.parent.removeChild(p.g);
        this.pool.push(p.g);
    }

    // Draw a small square once; reused across life (only alpha changes per frame)
    _drawSquare(g, size, color) {
        g.clear();
        g.rect(-size / 2, -size / 2, size, size).fill(color);
    }

    // Burst of impact particles at world x,y
    spawnHit(x, y, color = 0xffffff, count = 8, spread = 220) {
        for (let i = 0; i < count; i++) {
            if (this.active.length >= this.max) break;
            const g = this._acquire();
            const size = 3 + Math.random() * 4;
            this._drawSquare(g, size, color);
            const ang = Math.random() * Math.PI * 2;
            const spd = spread * (0.4 + Math.random() * 0.6);
            g.position.set(x, y);
            g.alpha = 1;
            this.active.push({
                g,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 60,
                life: 0.35 + Math.random() * 0.25,
                maxLife: 0.55,
                grav: 900,
                fade: true
            });
        }
    }

    // A single rain streak (long thin vertical particle)
    spawnRainStreak(x, y, len = 14) {
        if (this.active.length >= this.max) return;
        const g = this._acquire();
        g.clear();
        g.rect(-1, 0, 2, len).fill(0x6fa8dc);
        g.position.set(x, y);
        g.alpha = 0.4;
        this.active.push({
            g,
            vx: -80,
            vy: 900,
            life: 1.2,
            maxLife: 1.2,
            grav: 0,
            fade: false
        });
    }

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const p = this.active[i];
            p.life -= dt;
            if (p.life <= 0) {
                this._release(p);
                this.active.splice(i, 1);
                continue;
            }
            p.vy += p.grav * dt;
            p.g.position.x += p.vx * dt;
            p.g.position.y += p.vy * dt;
            if (p.fade) {
                p.g.alpha = Math.max(0, p.life / p.maxLife);
            }
        }
    }

    clear() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            this._release(this.active[i]);
        }
        this.active.length = 0;
    }
}

export const particles = new ParticleSystem();
