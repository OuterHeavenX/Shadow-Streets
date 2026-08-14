import { combat } from '../combat/combat.js';
import { audio } from '../audio/audio.js';
import { ui } from '../ui/ui.js';

export class AI {
    updateEnemy(enemy, player, dt, world) {
        if (!player || player.hp <= 0) {
            enemy.vx = 0;
            enemy.depthVy = 0;
            return;
        }

        const dx = player.x - enemy.x;
        const dy = (player.y + player.height) - (enemy.y + enemy.height);
        const dist = Math.hypot(dx, dy * 1.35);
        const depthDist = Math.abs(dy);
        enemy.dir = dx >= 0 ? 1 : -1;

        if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
        if (enemy.lungeTimer > 0) enemy.lungeTimer -= dt;
        if (enemy.backoffTimer > 0) enemy.backoffTimer -= dt;

        const type = enemy.def.type;
        const flank = this._flankOffset(enemy, world);

        if (type === 'aggressive') {
            this._updateKnifeWielder(enemy, player, dist, depthDist, flank, world);
        } else if (type === 'tank') {
            this._updateBrawler(enemy, player, dist, depthDist, flank, world);
        } else {
            this._updateBasic(enemy, player, dist, depthDist, flank, world);
        }
    }

    _flankOffset(enemy, world) {
        const actives = world.entities.filter(e => e.def && e.hp > 0);
        if (actives.length < 2) return 0;
        if (enemy._depthFlank === undefined) {
            enemy._depthFlank = (actives.indexOf(enemy) % 2 === 0 ? 1 : -1) * 42;
        }
        return enemy._depthFlank;
    }

    _approach(enemy, player, flankY = 0, speedMul = 1) {
        const targetX = player.x;
        const targetFeetY = player.y + player.height + flankY;
        const enemyFeetY = enemy.y + enemy.height;
        let dx = targetX - enemy.x;
        let dy = targetFeetY - enemyFeetY;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        enemy.vx = dx * enemy.speed * speedMul;
        enemy.depthVy = dy * enemy.speed * 0.78 * speedMul;
        if (Math.abs(dx) > 0.1) enemy.dir = dx >= 0 ? 1 : -1;
    }

    _stop(enemy) {
        enemy.vx = 0;
        enemy.depthVy = 0;
    }

    _updateBasic(enemy, player, dist, depthDist, flankY, world) {
        if (dist > 460) {
            enemy.aiState = 'patrol';
            this._stop(enemy);
        } else if (dist > 72 || depthDist > 42) {
            enemy.aiState = 'chase';
            this._approach(enemy, player, flankY);
        } else {
            enemy.aiState = 'attack';
            this._stop(enemy);
            if (enemy.attackCooldown <= 0) {
                this.executeAttack(enemy, world, { range: 65 });
                enemy.attackCooldown = enemy.def.type === 'elite' ? 1.4 : 2.0;
            }
        }
    }

    _updateKnifeWielder(enemy, player, dist, depthDist, flankY, world) {
        if (enemy.backoffTimer > 0) {
            enemy.aiState = 'backoff';
            enemy.vx = -enemy.dir * enemy.speed * 0.9;
            enemy.depthVy *= 0.7;
            return;
        }

        if (dist > 460) {
            enemy.aiState = 'patrol';
            this._stop(enemy);
        } else if (dist > 92 || depthDist > 38) {
            enemy.aiState = 'chase';
            this._approach(enemy, player, flankY, 1.1);
        } else {
            enemy.aiState = 'attack';
            this._stop(enemy);
            if (enemy.attackCooldown <= 0) {
                enemy.vx = enemy.dir * enemy.speed * 2.2;
                enemy.lungeTimer = 0.12;
                this.executeAttack(enemy, world, { range: 60, quick: true });
                enemy.attackCooldown = 1.6;
                enemy.backoffTimer = 0.7;
            }
        }
    }

    _updateBrawler(enemy, player, dist, depthDist, flankY, world) {
        if (player.attackTimer > 0 && !enemy._sawAttack) {
            enemy._sawAttack = true;
            enemy._playerAttacks = (enemy._playerAttacks || 0) + 1;
        } else if (player.attackTimer <= 0) {
            enemy._sawAttack = false;
        }

        if (dist > 460) {
            enemy.aiState = 'patrol';
            this._stop(enemy);
        } else if (dist > 78 || depthDist > 42) {
            enemy.aiState = 'chase';
            this._approach(enemy, player, flankY, 0.9);
        } else {
            this._stop(enemy);
            const predictable = (enemy._playerAttacks || 0) >= 2;
            if (predictable && player.attackTimer > 0 && enemy.blockTimer <= 0 && enemy.attackCooldown <= 0) {
                enemy.aiState = 'block';
                enemy.blockTimer = 0.5;
                enemy.graphics.tint = 0x66aaff;
                clearTimeout(enemy._blockTintTimer);
                enemy._blockTintTimer = setTimeout(() => {
                    if (enemy.graphics && enemy.hitstun <= 0) enemy.graphics.tint = 0xffffff;
                }, 300);
            } else if (enemy.attackCooldown <= 0 && enemy.blockTimer <= 0) {
                enemy.aiState = 'attack';
                this.executeAttack(enemy, world, { range: 72, heavy: true, delay: 0.35 });
                enemy.attackCooldown = 2.6;
                enemy._playerAttacks = 0;
            }
        }
    }

    executeAttack(enemy, world, opts = {}) {
        const range = opts.range || 60;
        const heavy = !!opts.heavy;
        const delay = opts.delay || 0;

        if (enemy.playAttackAnim) enemy.playAttackAnim(heavy ? 0.45 : 0.28);

        const origTint = enemy.graphics.tint;
        enemy.graphics.tint = heavy ? 0xff8800 : 0xffff00;
        clearTimeout(enemy._atkTintTimer);
        enemy._atkTintTimer = setTimeout(() => {
            if (enemy.graphics && enemy.hitstun <= 0) enemy.graphics.tint = origTint;
        }, 100 + delay * 1000);

        const doHit = () => {
            if (!world.entities.includes(enemy) || enemy.hp <= 0) return;
            const hx = enemy.dir === 1 ? enemy.x + enemy.width : enemy.x - range;
            const hits = combat.checkHits(hx, enemy.y, range, enemy.height, enemy, world);
            if (hits.length > 0) {
                if (heavy) audio.playHitHeavy();
                else audio.playHitLight();
                hits.forEach(p => {
                    let dmg = enemy.def.atk;
                    if (heavy) dmg = Math.round(dmg * 1.5);
                    ui.spawnFloatingText(dmg, p.x + p.width / 2, p.y - 20, '#ff3333');
                    const kx = enemy.dir * (heavy ? 320 : 200);
                    const ky = heavy ? -220 : -150;
                    combat.applyImpact(p, p.x + p.width / 2, p.y + p.height * 0.4 - p.z, { heavy, color: 0xff5555 });
                    p.takeDamage(dmg, kx, ky);
                });
            }
        };

        if (delay > 0) setTimeout(doHit, delay * 1000);
        else doHit();
    }
}
export const ai = new AI();
