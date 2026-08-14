import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { physics } from '../physics/physics.js';

export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = width;
        this.height = height;
        
        this.sprite = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.sprite.addChild(this.graphics);
        this.sprite.position.set(this.x, this.y);
        
        this.dir = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.isGrounded = false;
        this.state = 'idle';
        this.hitstun = 0;
        this.invincible = 0;
    }
    
    update(dt, world) {
        if (this.hitstun > 0) this.hitstun -= dt;
        if (this.invincible > 0) this.invincible -= dt;
        
        if (!this.isGrounded) {
            this.vy += 1200 * dt;
        }
        
        if (this.hitstun <= 0) {
            this.x += this.vx * dt;
        } else {
            this.x += this.vx * dt; // continue knockback
            this.vx *= 0.9;
        }
        
        this.y += this.vy * dt;
        
        physics.resolveFloor(this);
        
        // Pivot approach for flipping
        this.sprite.scale.x = this.dir;
        this.sprite.position.set(this.x + (this.dir === -1 ? this.width : 0), this.y);
    }
    
    takeDamage(amt, knockbackX=0, knockbackY=0) {
        if (this.invincible > 0) return false;

        // Brawler-style block: reduce damage + knockback while blocking.
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

        // Red damage tint following the combat white-flash pop.
        clearTimeout(this._tintTimer);
        this.graphics.tint = 0xff5555;
        this._tintTimer = setTimeout(() => { if (this.graphics) this.graphics.tint = 0xffffff; }, 150);

        return this.hp <= 0;
    }
}