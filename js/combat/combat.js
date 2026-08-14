import { physics } from '../physics/physics.js';
import { Enemy } from '../entities/enemy.js';
import { Player } from '../entities/player.js';

export class CombatManager {
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
}
export const combat = new CombatManager();