import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';
import { DISTRICTS } from '../../data/districts.js';
import { Enemy } from '../entities/enemy.js';
import { Boss } from '../entities/boss.js';
import { NPC } from '../entities/npc.js';

export class World {
    constructor() {
        this.entities = [];
        this.district = null;
        this.spawnTimer = 0;
        this.bossSpawned = false;
        this.cameraX = 0;
    }
    
    addEntity(e) {
        this.entities.push(e);
        renderer.fgContainer.addChild(e.sprite);
    }
    
    removeEntity(e) {
        this.entities = this.entities.filter(ent => ent !== e);
        if (e.sprite && e.sprite.parent) {
            e.sprite.parent.removeChild(e.sprite);
        }
    }
    
    loadDistrict(id) {
        this.district = DISTRICTS[id];
        this.buildBackground();
        this.spawnNPCs();
    }
    
    spawnNPCs() {
        // Spawn hardcoded NPCs based on zones for the demo
        this.addEntity(new NPC('terry', 400, 420, 'TERRY (Shop)', 0x00aa00, 'Hey Alex! The Vipers are going crazy today. Gear up before you head out!', 'items'));
        this.addEntity(new NPC('old_mama', 3200, 420, 'OLD MAMA (Ramen)', 0xaa0000, 'Eat well, fight well! What can I get you, dear?', 'food'));
        this.addEntity(new NPC('sensei', 4600, 420, 'SENSEI KWAN', 0xaaaaaa, 'Your technique lacks focus. Defeat King Viper and I will train you.'));
    }
    
    buildBackground() {
        renderer.bgContainer.removeChildren();
        renderer.mgContainer.removeChildren();
        
        const sky = new PIXI.Graphics();
        sky.rect(0, 0, this.district.width, 400).fill(0x1a1a2e);
        renderer.bgContainer.addChild(sky);
        
        const backBuildings = new PIXI.Graphics();
        for(let i=0; i<80; i++) {
            backBuildings.rect(i*100, 150 + Math.random()*150, 80, 400).fill(0x111122);
        }
        renderer.bgContainer.addChild(backBuildings);
        
        const buildings = new PIXI.Graphics();
        for(let i=0; i<50; i++) {
            buildings.rect(i*200, 200 + Math.random()*100, 150, 400).fill(0x2a2a3e);
            if (Math.random() > 0.5) {
                const colors = [0x00ffff, 0xff00ff, 0xff8800];
                buildings.rect(i*200 + 10, 250, 10, 50).fill(colors[Math.floor(Math.random()*colors.length)]);
            }
        }
        renderer.mgContainer.addChild(buildings);
        
        const ground = new PIXI.Graphics();
        ground.rect(0, this.district.groundY, this.district.width, this.district.height - this.district.groundY).fill(0x333344);
        
        for(let i=0; i<this.district.width; i+=100) {
            ground.rect(i, this.district.groundY + 30, 40, 5).fill(0xaaaaaa);
        }
        
        // Put ground in fgContainer but at the back
        renderer.fgContainer.addChildAt(ground, 0);
    }
    
    update(dt, player) {
        this.cameraX = player.x;
        
        this.entities.sort((a, b) => (a.y + a.height) - (b.y + b.height));
        
        for (let i = this.entities.length - 1; i >= 0; i--) {
            if(this.entities[i]) this.entities[i].update(dt, this);
        }
        
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.trySpawnEnemies(player);
            this.spawnTimer = 2;
        }
    }
    
    trySpawnEnemies(player) {
        if(!this.district) return;
        const zone = this.district.zones.find(z => player.x >= z.start && player.x < z.end);
        if (!zone || !zone.spawns.length) return;
        
        const enemyCount = this.entities.filter(e => e instanceof Enemy && !e.isBoss).length;
        if (enemyCount < 4) {
            const type = zone.spawns[Math.floor(Math.random() * zone.spawns.length)];
            
            if (type === 'king_viper') {
                if (!this.bossSpawned) {
                    const boss = new Boss(type, player.x + 300, 400);
                    this.addEntity(boss);
                    this.bossSpawned = true;
                }
            } else {
                const ex = player.x + (Math.random() > 0.5 ? window.innerWidth/2 + 50 : -window.innerWidth/2 - 50);
                if (ex > 0 && ex < this.district.width) {
                    const enemy = new Enemy(type, ex, 400 + Math.random()*50);
                    this.addEntity(enemy);
                }
            }
        }
    }
}