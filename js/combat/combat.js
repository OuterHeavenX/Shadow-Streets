import { physics } from '../physics/physics.js';
import { Enemy } from '../entities/enemy.js';
import { Player } from '../entities/player.js';
import { particles } from '../core/particles.js';
import { camera } from '../core/camera.js';

export class CombatManager {
    constructor() {
        this.hitstop = 0;
        this.depthTolerance = 58;
        this.elevationTolerance = 82;
    }

    checkHits(hx, hy, hw, hh, attacker, world) {
        const hits = [];
        const attackLeft = hx;
        const attackRight = hx + hw;
        const attackerFeetY = attacker.y + attacker.height;

        for (let e of world.entities) {
            if (e === attacker) continue;
            if (attacker instanceof Player && !(e instanceof Enemy)) continue;
            if (attacker instanceof Enemy && !(e instanceof Player)) continue;

            const targetLeft = e.x;
            const targetRight = e.x + e.width;
            const xOverlap = attackLeft < targetRight && attackRight > targetLeft;
            if (!xOverlap) continue;

            // River City style hits require the fighters to be on roughly the
            // same lane/depth instead of sharing one platform floor.
            const targetFeetY = e.y + e.height;
            const depthDist = Math.abs(attackerFeetY - targetFeetY);
            if (depthDist > this.depthTolerance) continue;

            // Jumping fighters can pass over grounded attacks when elevated.
            const elevationDist = Math.abs((attacker.z || 0) - (e.z || 0));
            if (elevationDist > this.elevationTolerance) continue;

            hits.push(e);
        }

        return hits;
    }

    triggerHitstop(heavy = false) {
        const d = heavy ? 0.15 : 0.08;
        if (d > this.hitstop) this.hitstop = d;
    }

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

    applyImpact(victim, worldX, worldY, opts = {}) {
        const heavy = !!opts.heavy;
        const color = opts.color != null ? opts.color : 0xffee66;
        const count = heavy ? 10 : 6;

        this.triggerHitstop(heavy);
        particles.spawnHit(worldX, worldY, color, count, heavy ? 300 : 220);

        if (heavy) camera.shake(10, 0.18);
        else camera.shake(4, 0.08);

        if (victim) this.flashWhite(victim);
    }

    flashWhite(victim) {
        const g = victim.graphics;
        if (!g) return;
        g.tint = 0xffffff;
        clearTimeout(victim._flashTimer);
        victim._flashTimer = setTimeout(() => {
            if (victim.graphics) victim.graphics.tint = 0xffffff;
        }, 60);
    }
}
export const combat = new CombatManager();
