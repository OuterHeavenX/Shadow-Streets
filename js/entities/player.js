import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { Entity } from './entity.js';
import { input } from '../core/input.js';
import { audio } from '../audio/audio.js';
import { combat } from '../combat/combat.js';
import { camera } from '../core/camera.js';
import { ui } from '../ui/ui.js';
import { Inventory } from '../inventory/inventory.js';
import { events } from '../core/events.js';
import { FighterSprite, paletteFromColor } from './fighterSprite.js';
import { ComboSystem } from '../combat/combos.js';
import { WEAPONS } from '../combat/weapons.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 40, 80);

        this.stats = { str: 10, vit: 10, agi: 10, tech: 10 };
        this.level = 1;
        this.xp = 0;
        this.money = 50;
        this.inventory = new Inventory();

        this.speed = 250;
        this.attackTimer = 0;
        this.attackAnimTimer = 0; // how long the current attack anim shows

        // Combo + weapon state
        this.combos = new ComboSystem();
        this.weapon = null;       // { def, uses }

        // Sprite / animation
        const palette = paletteFromColor(0x1a3a8f, {
            skin: 0xd4a88a,
            hair: 0x2b1a0f,
            pants: 0x1a1a3e,
            shoes: 0xffffff,
            accent: 0x0a1a4a
        });
        this.fighter = new FighterSprite(this.graphics, this.width, this.height, palette);
        this.fighter.draw();
    }

    // --- Weapon handling ---
    pickUpWeapon(weaponId) {
        const def = WEAPONS[weaponId];
        if (!def) return;
        this.weapon = { def, uses: 0 };
        this.fighter.setWeapon({ color: def.color, len: def.len, thick: def.thick });
        ui.spawnFloatingText(def.name.toUpperCase() + '!', this.x, this.y - 40, '#ffdd55');
    }

    consumeWeaponUse() {
        if (!this.weapon) return;
        this.weapon.uses++;
        if (this.weapon.uses >= this.weapon.def.durability) {
            ui.spawnFloatingText('BROKE!', this.x, this.y - 30, '#ff6666');
            this.weapon = null;
            this.fighter.setWeapon(null);
        }
    }

    update(dt, world) {
        super.update(dt, world);

        if (this.hp <= 0) return;
        this.inventory.update(dt, this);
        this.combos.update(dt);
        if (this.attackTimer > 0) this.attackTimer -= dt;
        if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;

        if (this.hitstun <= 0 && this.attackTimer <= 0) {
            this.handleInput(dt, world);
        }

        if (this.isGrounded && this.attackTimer <= 0 && input.getAxisX() === 0) {
            this.vx *= 0.8;
        }

        this.updateAnim(dt);
    }

    updateAnim(dt) {
        // Determine animation from state priority: hurt > attack > jump > walk > idle
        let anim;
        if (this.hitstun > 0) {
            anim = 'hurt';
        } else if (this.attackAnimTimer > 0) {
            anim = this._attackAnim || 'punch';
        } else if (!this.isGrounded) {
            anim = 'jump';
        } else if (Math.abs(this.vx) > 20) {
            anim = 'walk';
        } else {
            anim = 'idle';
        }
        this.fighter.play(anim);
        this.fighter.update(dt);
    }

    handleInput(dt, world) {
        const ax = input.getAxisX();
        if (ax !== 0) {
            this.vx = ax * this.speed;
            this.dir = ax > 0 ? 1 : -1;
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }

        if (input.isJustPressed('Space') && this.isGrounded) {
            this.vy = -600;
            this.isGrounded = false;
            audio.playJump();
        }

        if (input.isJustPressed('KeyZ')) {
            this.attack('light', world);
        } else if (input.isJustPressed('KeyX')) {
            this.attack('heavy', world);
        }
    }

    attack(type, world) {
        this.vx = 0;
        this.attackTimer = type === 'light' ? 0.25 : 0.5;

        // Alternate light between punch/kick visuals for variety
        this._attackAnim = type === 'heavy'
            ? 'punch'
            : ((this.combos.count % 2 === 1) ? 'punch' : 'kick');
        this.attackAnimTimer = this.attackTimer;

        // Weapon bonuses
        const wDef = this.weapon ? this.weapon.def : null;
        let range = type === 'light' ? 50 : 70;
        let dmgBonus = 0;
        if (wDef) {
            range += wDef.bonusRange;
            dmgBonus = wDef.bonusDamage;
        }

        const hx = this.dir === 1 ? this.x + this.width : this.x - range;
        const hy = this.y + 15;

        const hits = combat.checkHits(hx, hy, range, 50, this, world);
        if (hits.length === 0) return;

        // ---- resolve combo / hit type ----
        let launcher = false;
        let slam = false;
        let comboCount = 0;

        if (type === 'light') {
            const info = this.combos.registerLight();
            comboCount = info.count;
            launcher = info.isLauncher;
        } else {
            // heavy: slam if any target airborne
            const airborne = hits.some(e => !e.isGrounded);
            const info = this.combos.registerHeavy(airborne);
            slam = info.isSlam;
        }

        const heavyImpact = type === 'heavy' || launcher || slam;

        if (heavyImpact) audio.playHitHeavy();
        else audio.playHitLight();

        hits.forEach(enemy => {
            let dmg = type === 'light' ? this.stats.str : this.stats.str * 2.5;
            dmg += dmgBonus;

            let kx = type === 'heavy' ? this.dir * 400 : this.dir * 150;
            let ky = type === 'heavy' ? -300 : -50;

            if (launcher) {
                // uppercut: pop airborne, bigger knockback
                dmg *= 1.4;
                kx = this.dir * 250;
                ky = -650;
            }
            if (slam) {
                // ground pound the airborne target
                dmg *= 1.6;
                kx = this.dir * 300;
                ky = 500; // slam downward
            }

            dmg = Math.round(dmg);
            const color = heavyImpact ? '#ffaa00' : '#fff';
            ui.spawnFloatingText(dmg, enemy.x + enemy.width / 2, enemy.y, color);

            // Impact feedback: hitstop, particles, shake, flash
            const ix = enemy.x + enemy.width / 2;
            const iy = enemy.y + enemy.height * 0.4;
            combat.applyImpact(enemy, ix, iy, {
                heavy: heavyImpact,
                color: launcher ? 0x66ddff : (slam ? 0xffcc33 : 0xffee66)
            });

            const dead = enemy.takeDamage(dmg, kx, ky);
            if (dead) {
                audio.playDeath();
                events.emit('enemyKilled', enemy.id);
                this.gainXp(enemy.xp);
                this.gainMoney(Math.floor(Math.random() * (enemy.gold[1] - enemy.gold[0])) + enemy.gold[0]);
                // Weapon drop hook (world may provide it)
                if (world.dropWeaponMaybe) {
                    world.dropWeaponMaybe(enemy.x + enemy.width / 2, enemy.def && enemy.def.type);
                }
                world.removeEntity(enemy);
            }
        });

        // Combo text
        if (type === 'light' && comboCount >= 2) {
            const label = launcher ? `COMBO x${comboCount} LAUNCH!` : `COMBO x${comboCount}`;
            ui.spawnFloatingText(label, this.x + this.width / 2, this.y - 55, '#ffee66');
        } else if (slam) {
            ui.spawnFloatingText('SLAM!', this.x + this.width / 2, this.y - 55, '#ffcc33');
        }

        // consume weapon durability once per swing that connected
        if (this.weapon) this.consumeWeaponUse();
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= 100) {
            this.level++;
            this.xp -= 100;
            this.maxHp += 25;
            this.hp = this.maxHp;
            this.stats.str += 3;
            ui.spawnFloatingText("LEVEL UP!", this.x, this.y - 40, '#00ffff');
        }
    }

    gainMoney(amount) {
        this.money += amount;
        audio.playCoin();
    }

    takeDamage(amt, kx, ky) {
        const dead = super.takeDamage(amt, kx, ky);
        if (dead) {
            ui.showDialogue('SYSTEM', 'YOU HAVE FALLEN. REFRESH TO RETRY.');
        }
        return dead;
    }
}
