import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';
import { WEAPONS, WEAPON_DROP_TABLE } from './weapons.js';
import { ui } from '../ui/ui.js';

// A dropped weapon lying on the ground. Player walks over it and it is picked
// up automatically (or via attack button when adjacent).
class WeaponPickup {
    constructor(weaponId, x, groundY) {
        this.def = WEAPONS[weaponId];
        this.x = x;
        this.y = groundY - 10;
        this.width = 44;
        this.height = 16;
        this.life = 15; // seconds before it disappears
        this.bob = 0;

        this.sprite = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.sprite.addChild(this.graphics);
        this.draw();
        this.sprite.position.set(this.x, this.y);
    }

    draw() {
        const g = this.graphics;
        g.clear();
        const d = this.def;
        // simple lying-down weapon sprite
        g.rect(0, 6, d.len, d.thick).fill(d.color);
        if (d.id === 'knife') {
            g.rect(-4, 4, 4, d.thick + 4).fill(0x553311);
        } else {
            g.rect(0, 6, 6, d.thick).fill(0x333333); // grip end
        }
        // subtle glow marker above
        g.rect(d.len / 2 - 2, -6, 4, 4).fill(0xffee66);
    }

    update(dt) {
        this.life -= dt;
        this.bob += dt * 4;
        this.sprite.position.set(this.x, this.y + Math.sin(this.bob) * 2);
        // blink near end of life
        this.sprite.alpha = this.life < 4 ? (0.4 + 0.6 * Math.abs(Math.sin(this.bob * 3))) : 1;
    }
}

export class WeaponPickupManager {
    constructor() {
        this.pickups = [];
        this.dropChance = 0.3;
    }

    reset() {
        for (const p of this.pickups) {
            if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
        }
        this.pickups = [];
    }

    // Called when an enemy is defeated. type may bias the drop.
    maybeDrop(x, groundY, enemyType) {
        if (Math.random() > this.dropChance) return;
        let id;
        if (enemyType === 'aggressive') {
            // knife wielders more likely to drop a knife
            id = Math.random() < 0.6 ? 'knife' : WEAPON_DROP_TABLE[Math.floor(Math.random() * WEAPON_DROP_TABLE.length)];
        } else {
            id = WEAPON_DROP_TABLE[Math.floor(Math.random() * WEAPON_DROP_TABLE.length)];
        }
        this.spawn(id, x, groundY);
    }

    spawn(weaponId, x, groundY) {
        const p = new WeaponPickup(weaponId, x, groundY);
        this.pickups.push(p);
        renderer.fgContainer.addChild(p.sprite);
    }

    // player provided by game loop; auto-pickup on touch.
    update(dt, player) {
        if (!player) return;
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const p = this.pickups[i];
            p.update(dt);

            const overlap = Math.abs((p.x + p.width / 2) - (player.x + player.width / 2)) < 40 &&
                Math.abs((p.y) - (player.y + player.height * 0.6)) < 60;

            if (overlap && player.hp > 0) {
                player.pickUpWeapon(p.def.id);
                this._remove(i);
                continue;
            }

            if (p.life <= 0) {
                this._remove(i);
            }
        }
    }

    _remove(i) {
        const p = this.pickups[i];
        if (p.sprite && p.sprite.parent) p.sprite.parent.removeChild(p.sprite);
        this.pickups.splice(i, 1);
    }
}

export const weaponPickups = new WeaponPickupManager();
