import { physics } from '../physics/physics.js';
import { Enemy } from '../entities/enemy.js';
import { Player } from '../entities/player.js';
import { particles } from '../core/particles.js';
import { camera } from '../core/camera.js';

export class CombatManager {
    constructor() {
        // Global hitstop timer. While > 0, the game loop advances entity
        // updates with dt = 0 (frozen) but keeps rendering/particles alive.
        this.hitstop = 0;
    }

    checkHits(hx, hy, hw, hh, attacker, world) {
        const hits = [];
        const boxA = { x: hx, y: hy, width: hw, height: hh };

        for (let e of world.entities) {
            if (e === attacker) continue;

            // Player vs Enemy validation
            if (attacker instanceof Player && !(e instanceof Enemy)) continue;
            if (attacker instanceof Enemy && !(e instanceof Player)) continue;

            const boxB = { x: e.x, y: e.y, width: e.width, height: e.height };
            if (physics.checkAABB(boxA, boxB)) {
                hits.push(e);
            }
        }

        return hits;
    }

    // Freeze both entities briefly for impact weight.
    triggerHitstop(heavy = false) {
        const d = heavy ? 0.15 : 0.08;
        // Keep the longest requested freeze.
        if (d > this.hitstop) this.hitstop = d;
    }

    // Advance the global hitstop timer. Called by the game loop with real dt.
    // Returns true while frozen.
    tickHitstop(dt) {
        if (this.hitstop > 0) {
            this.hitstop -= dt;
            if (this.hitstop < 0) this.hitstop = 0;
            return true;
        }
        return false;
    }

    isFrozen() {
        return this.hitstop > 0;
    }

    // Full impact feedback bundle: hitstop + particles + shake + victim flash.
    applyImpact(victim, worldX, worldY, opts = {}) {
        const heavy = !!opts.heavy;
        const color = opts.color != null ? opts.color : 0xffee66;
        const count = heavy ? 10 : 6;

        this.triggerHitstop(heavy);
        particles.spawnHit(worldX, worldY, color, count, heavy ? 300 : 220);

        if (heavy) {
            camera.shake(10, 0.18);
        } else {
            camera.shake(4, 0.08);
        }

        if (victim) this.flashWhite(victim);
    }

    // Brief white flash tint on the victim's graphics.
    flashWhite(victim) {
        const g = victim.graphics;
        if (!g) return;
        g.tint = 0xffffff;
        // The red damage tint in Entity.takeDamage will override; we set a
        // short-lived white flash first for a "pop".
        g.tint = 0xffffff;
        clearTimeout(victim._flashTimer);
        // Immediately show white, then let takeDamage's red tint follow.
        victim._flashTimer = setTimeout(() => {
            if (victim.graphics) victim.graphics.tint = 0xffffff;
        }, 60);
    }
}
export const combat = new CombatManager();
