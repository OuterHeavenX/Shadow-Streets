import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { Entity } from './entity.js';
import { input } from '../core/input.js';
import { audio } from '../audio/audio.js';
import { combat } from '../combat/combat.js';
import { camera } from '../core/camera.js';
import { ui } from '../ui/ui.js';
import { Inventory } from '../inventory/inventory.js';
import { events } from '../core/events.js';

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
        
        this.drawSprite();
    }
    
    drawSprite() {
        const g = this.graphics;
        g.clear();
        // Body - blue jacket
        g.rect(5, 20, 30, 35).fill(0x1a3a8f);
        // Head - skin
        g.rect(10, 0, 20, 20).fill(0xd4a88a);
        // Legs - jeans
        g.rect(5, 55, 12, 25).fill(0x1a1a3e);
        g.rect(23, 55, 12, 25).fill(0x1a1a3e);
        // Shoes
        g.rect(3, 75, 14, 5).fill(0xffffff);
        g.rect(21, 75, 14, 5).fill(0xffffff);
    }
    
    update(dt, world) {
        super.update(dt, world);
        
        if (this.hp <= 0) return;
        this.inventory.update(dt, this);
        if (this.attackTimer > 0) this.attackTimer -= dt;
        
        if (this.hitstun <= 0 && this.attackTimer <= 0) {
            this.handleInput(dt, world);
        }
        
        if (this.isGrounded && this.attackTimer <= 0 && input.getAxisX() === 0) {
            this.vx *= 0.8;
        }
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
        
        const range = type === 'light' ? 50 : 70;
        const hx = this.dir === 1 ? this.x + this.width : this.x - range;
        const hy = this.y + 15;
        
        const arm = new PIXI.Graphics();
        arm.rect(0, 0, range, 12).fill(0xd4a88a);
        arm.position.set(this.dir === 1 ? 25 : -range+15, 25);
        this.sprite.addChild(arm);
        setTimeout(() => { if (arm.parent) arm.parent.removeChild(arm); }, this.attackTimer * 1000);
        
        const hits = combat.checkHits(hx, hy, range, 50, this, world);
        if (hits.length > 0) {
            if (type === 'light') audio.playHitLight();
            else {
                audio.playHitHeavy();
                camera.shake(8, 0.15);
            }
            
            hits.forEach(enemy => {
                const dmg = type === 'light' ? this.stats.str : this.stats.str * 2.5;
                const kx = type === 'heavy' ? this.dir * 400 : this.dir * 150;
                const ky = type === 'heavy' ? -300 : -50;
                
                ui.spawnFloatingText(dmg, enemy.x + enemy.width/2, enemy.y, type === 'heavy' ? '#ffaa00' : '#fff');
                
                const dead = enemy.takeDamage(dmg, kx, ky);
                if (dead) {
                    audio.playDeath();
                    events.emit('enemyKilled', enemy.id);
                    this.gainXp(enemy.xp);
                    this.gainMoney(Math.floor(Math.random() * (enemy.gold[1] - enemy.gold[0])) + enemy.gold[0]);
                    world.removeEntity(enemy);
                }
            });
        }
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