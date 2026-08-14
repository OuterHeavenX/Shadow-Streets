import { Entity } from './entity.js';
import { ENEMIES } from '../../data/enemies.js';
import { ai } from '../ai/ai.js';

export class Enemy extends Entity {
    constructor(type, x, y) {
        const def = ENEMIES[type];
        super(x, y, def.width, def.height);
        this.def = def;
        this.hp = def.hp;
        this.maxHp = def.hp;
        this.xp = def.xp;
        this.gold = def.gold;
        this.speed = def.speed;
        
        this.drawSprite();
        
        this.aiState = 'patrol';
        this.attackCooldown = 0;
    }
    
    drawSprite() {
        const g = this.graphics;
        g.clear();
        
        // Body
        g.rect(0, 0, this.width, this.height).fill(this.def.color);
        
        // Details based on type
        if (this.def.type === 'boss') {
            g.rect(5, 5, 40, 20).fill(0xd4a88a); // Face
            g.rect(20, 10, 8, 5).fill(0xff0000); // Shades
            g.rect(0, 25, 50, 40).fill(0xeeeeee); // White suit
        } else {
            g.rect(5, 5, 30, 20).fill(0xd4a88a); // Face
            g.rect(this.dir===1 ? 20 : 5, 10, 10, 5).fill(0x000000); // Eyes
        }
    }
    
    update(dt, world) {
        super.update(dt, world);
        if (this.hp <= 0) return;
        
        if (this.hitstun <= 0) {
            ai.updateEnemy(this, world.entities.find(e => e.constructor.name === 'Player'), dt, world);
        } else {
            this.vx *= 0.9;
        }
    }
}