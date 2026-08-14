import { combat } from '../combat/combat.js';
import { audio } from '../audio/audio.js';
import { ui } from '../ui/ui.js';

export class AI {
    updateEnemy(enemy, player, dt, world) {
        if (!player || player.hp <= 0) {
            enemy.vx = 0;
            return;
        }
        
        const dist = Math.abs(player.x - enemy.x);
        enemy.dir = player.x > enemy.x ? 1 : -1;
        
        if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
        
        if (dist > 400) {
            enemy.aiState = 'patrol';
        } else if (dist > 70) {
            enemy.aiState = 'chase';
        } else {
            enemy.aiState = 'attack';
        }
        
        if (enemy.aiState === 'chase') {
            enemy.vx = enemy.dir * enemy.speed;
        } else if (enemy.aiState === 'patrol') {
            enemy.vx = 0; // Simple idle for now
        } else if (enemy.aiState === 'attack') {
            enemy.vx = 0;
            if (enemy.attackCooldown <= 0) {
                this.executeAttack(enemy, world);
                enemy.attackCooldown = enemy.def.type === 'boss' ? 1.0 : 2.0;
            }
        }
        
        // Redraw to flip eyes correctly if needed, though scaling flips it already in entity.js!
        // Actually, since scaling flips it, we shouldn't draw it conditionally on this.dir
        // wait, let's just let entity.js handle the scale flip.
    }
    
    executeAttack(enemy, world) {
        const range = 60;
        const hx = enemy.dir === 1 ? enemy.x + enemy.width : enemy.x - range;
        
        // Attack indicator
        const origTint = enemy.graphics.tint;
        enemy.graphics.tint = 0xffff00;
        setTimeout(() => { if (enemy.graphics) enemy.graphics.tint = origTint; }, 100);
        
        const hits = combat.checkHits(hx, enemy.y + 10, range, enemy.height - 20, enemy, world);
        
        if (hits.length > 0) {
            audio.playHitLight();
            hits.forEach(p => {
                const dmg = enemy.def.atk;
                ui.spawnFloatingText(dmg, p.x + p.width/2, p.y - 20, '#ff3333');
                p.takeDamage(dmg, enemy.dir * 200, -150);
            });
        }
    }
}
export const ai = new AI();