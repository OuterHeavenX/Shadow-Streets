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
        if (enemy.lungeTimer > 0) enemy.lungeTimer -= dt;
        if (enemy.backoffTimer > 0) enemy.backoffTimer -= dt;

        const type = enemy.def.type;

        // ---- Flanking: when 2+ enemies active, half approach from far side ----
        const flankSide = this._flankSide(enemy, player, world);

        if (type === 'aggressive') {
            this._updateKnifeWielder(enemy, player, dist, dt, world, flankSide);
        } else if (type === 'tank') {
            this._updateBrawler(enemy, player, dist, dt, world, flankSide);
        } else {
            this._updateBasic(enemy, player, dist, dt, world, flankSide);
        }
    }

    // Assign a stable flank side to each enemy when the group is 2+.
    _flankSide(enemy, player, world) {
        const actives = world.entities.filter(e =>
            e.def && e !== enemy && e.hp > 0 && e.constructor.name !== 'Player');
        const totalActive = actives.length + 1;
        if (totalActive < 2) return 0;
        if (enemy._flankSide === undefined) {
            // deterministic-ish: alternate based on current count
            enemy._flankSide = (actives.length % 2 === 0) ? 1 : -1;
        }
        return enemy._flankSide;
    }

    _approach(enemy, player, flankSide, speedMul = 1) {
        // If flanking, aim for a point on the assigned side of the player.
        let targetX = player.x;
        if (flankSide !== 0) {
            targetX = player.x + flankSide * 60;
        }
        const toTarget = targetX > enemy.x ? 1 : -1;
        enemy.vx = toTarget * enemy.speed * speedMul;
    }

    // ---- Basic (street punk / viper soldier / elite) ----
    _updateBasic(enemy, player, dist, dt, world, flankSide) {
        if (dist > 400) {
            enemy.aiState = 'patrol';
            enemy.vx = 0;
        } else if (dist > 70) {
            enemy.aiState = 'chase';
            this._approach(enemy, player, flankSide);
        } else {
            enemy.aiState = 'attack';
            enemy.vx = 0;
            if (enemy.attackCooldown <= 0) {
                this.executeAttack(enemy, world, { range: 60 });
                enemy.attackCooldown = enemy.def.type === 'elite' ? 1.4 : 2.0;
            }
        }
    }

    // ---- Knife wielder: quick lunge in, strike, then back off ----
    _updateKnifeWielder(enemy, player, dist, dt, world, flankSide) {
        if (enemy.backoffTimer > 0) {
            // retreat away from player
            enemy.aiState = 'backoff';
            enemy.vx = -enemy.dir * enemy.speed * 0.9;
            return;
        }

        if (dist > 400) {
            enemy.aiState = 'patrol';
            enemy.vx = 0;
        } else if (dist > 90) {
            enemy.aiState = 'chase';
            this._approach(enemy, player, flankSide, 1.1);
        } else {
            // In lunge range
            enemy.aiState = 'attack';
            if (enemy.attackCooldown <= 0) {
                // quick lunge forward
                enemy.vx = enemy.dir * enemy.speed * 2.2;
                enemy.lungeTimer = 0.12;
                this.executeAttack(enemy, world, { range: 55, quick: true });
                enemy.attackCooldown = 1.6;
                enemy.backoffTimer = 0.7; // back off after striking
            } else if (enemy.lungeTimer > 0) {
                // keep sliding during lunge
            } else {
                enemy.vx = 0;
            }
        }
    }

    // ---- Brawler: blocks predictable attacks, slow armored swing ----
    _updateBrawler(enemy, player, dist, dt, world, flankSide) {
        // Track player's attack timing to detect "predictable" (repeated) attacks.
        if (player.attackTimer > 0 && !enemy._sawAttack) {
            enemy._sawAttack = true;
            enemy._playerAttacks = (enemy._playerAttacks || 0) + 1;
        } else if (player.attackTimer <= 0) {
            enemy._sawAttack = false;
        }

        if (dist > 400) {
            enemy.aiState = 'patrol';
            enemy.vx = 0;
        } else if (dist > 75) {
            enemy.aiState = 'chase';
            this._approach(enemy, player, flankSide, 0.9);
        } else {
            enemy.vx = 0;
            // If player attacks repeatedly & is close, raise a block.
            const predictable = (enemy._playerAttacks || 0) >= 2;
            if (predictable && player.attackTimer > 0 && enemy.blockTimer <= 0 && enemy.attackCooldown <= 0) {
                enemy.aiState = 'block';
                enemy.blockTimer = 0.5;
                // block flash
                enemy.graphics.tint = 0x66aaff;
                clearTimeout(enemy._blockTintTimer);
                enemy._blockTintTimer = setTimeout(() => {
                    if (enemy.graphics && enemy.hitstun <= 0) enemy.graphics.tint = 0xffffff;
                }, 300);
            } else if (enemy.attackCooldown <= 0 && enemy.blockTimer <= 0) {
                enemy.aiState = 'attack';
                // slow armored swing: telegraph then hit harder
                this.executeAttack(enemy, world, { range: 70, heavy: true, delay: 0.35 });
                enemy.attackCooldown = 2.6;
                enemy._playerAttacks = 0;
            }
        }
    }

    executeAttack(enemy, world, opts = {}) {
        const range = opts.range || 60;
        const heavy = !!opts.heavy;
        const delay = opts.delay || 0;

        // Play the swing animation.
        if (enemy.playAttackAnim) enemy.playAttackAnim(heavy ? 0.45 : 0.28);

        // Telegraph tint (yellow) for armored/slow swings.
        const origTint = enemy.graphics.tint;
        enemy.graphics.tint = heavy ? 0xff8800 : 0xffff00;
        clearTimeout(enemy._atkTintTimer);
        enemy._atkTintTimer = setTimeout(() => {
            if (enemy.graphics && enemy.hitstun <= 0) enemy.graphics.tint = origTint;
        }, 100 + delay * 1000);

        const doHit = () => {
            if (!world.entities.includes(enemy) || enemy.hp <= 0) return;
            const hx = enemy.dir === 1 ? enemy.x + enemy.width : enemy.x - range;
            const hits = combat.checkHits(hx, enemy.y + 10, range, enemy.height - 20, enemy, world);
            if (hits.length > 0) {
                if (heavy) audio.playHitHeavy();
                else audio.playHitLight();
                hits.forEach(p => {
                    let dmg = enemy.def.atk;
                    if (heavy) dmg = Math.round(dmg * 1.5);
                    ui.spawnFloatingText(dmg, p.x + p.width / 2, p.y - 20, '#ff3333');
                    const kx = enemy.dir * (heavy ? 320 : 200);
                    const ky = heavy ? -220 : -150;
                    const ix = p.x + p.width / 2;
                    const iy = p.y + p.height * 0.4;
                    combat.applyImpact(p, ix, iy, { heavy, color: 0xff5555 });
                    p.takeDamage(dmg, kx, ky);
                });
            }
        };

        if (delay > 0) {
            setTimeout(doHit, delay * 1000);
        } else {
            doHit();
        }
    }
}
export const ai = new AI();
