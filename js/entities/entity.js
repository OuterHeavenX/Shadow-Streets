import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { physics } from '../physics/physics.js';

export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.depthVy = 0;
        this.vy = 0;
        this.z = 0;
        this.width = width;
        this.height = height;

        this.sprite = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.sprite.addChild(this.graphics);
        this.sprite.position.set(this.x, this.y);

        this.dir = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.isGrounded = true;
        this.state = 'idle';
        this.hitstun = 0;
        this.invincible = 0;
        this.renderScale = 1;
    }

    update(dt, world) {
        if (this.hitstun > 0) this.hitstun -= dt;
        if (this.invincible > 0) this.invincible -= dt;

        this.x += this.vx * dt;
        if (this.hitstun > 0) this.vx *= 0.9;

        this.y += this.depthVy * dt;
        if (this.hitstun > 0) this.depthVy *= 0.88;

        if (!this.isGrounded || this.z > 0) {
            this.vy += 1200 * dt;
            this.z -= this.vy * dt;
            if (this.z <= 0) {
                this.z = 0;
                this.vy = 0;
                this.isGrounded = true;
            }
        }

        physics.resolveStreet(this, world);

        // Fighters are rendered larger than their gameplay footprint so the
        // street keeps its current dimensions while characters read better.
        const s = this.renderScale !== 1
            ? this.renderScale
            : (this.fighter ? (this.isBoss ? 1.24 : 1.18) : 1);
        this.sprite.scale.set(this.dir * s, s);
        this.sprite.position.set(
            this.x + (this.dir === -1 ? this.width * s : 0),
            this.y - this.z - this.height * (s - 1)
        );
    }

    takeDamage(amt, knockbackX = 0, knockbackY = 0) {
        if (this.invincible > 0) return false;

        if (this.blockTimer && this.blockTimer > 0) {
            amt = Math.max(1, Math.round(amt * 0.3));
            knockbackX *= 0.3;
            knockbackY *= 0.3;
        }

        this.hp -= amt;
        this.hitstun = 0.4;
        this.invincible = 0.1;
        this.vx = knockbackX;
        this.vy = knockbackY;
        this.isGrounded = false;

        clearTimeout(this._tintTimer);
        this.graphics.tint = 0xff5555;
        this._tintTimer = setTimeout(() => {
            if (this.graphics) this.graphics.tint = 0xffffff;
        }, 150);

        return this.hp <= 0;
    }
}
