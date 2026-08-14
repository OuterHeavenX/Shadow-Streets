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
        // Clear all non-player entities when switching districts
        const player = this.entities.find(e => e.constructor.name === 'Player');
        for (let i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i] !== player) this.removeEntity(this.entities[i]);
        }
        this.bossSpawned = false;
        this.spawnTimer = 0;
        this.district = DISTRICTS[id];
        this.buildBackground();
        this.spawnNPCs();
    }
    
    spawnNPCs() {
        if (this.district.id === 'the_docks') {
            this.addEntity(new NPC('salty_joe', 400, 420, 'SALTY JOE (Shop)', 0x226688, 'Welcome to the Docks, kid. The Harbor Shark runs this place now. Stock up.', 'items'));
            this.addEntity(new NPC('marina', 3200, 420, 'MARINA (Fish Grill)', 0xcc6600, 'Fresh off the boat! A full belly keeps you swinging.', 'food'));
            return;
        }
        // Neon Alley NPCs
        this.addEntity(new NPC('terry', 400, 420, 'TERRY (Shop)', 0x00aa00, 'Hey Alex! The Vipers are going crazy today. Gear up before you head out!', 'items'));
        this.addEntity(new NPC('old_mama', 3200, 420, 'OLD MAMA (Ramen)', 0xaa0000, 'Eat well, fight well! What can I get you, dear?', 'food'));
        this.addEntity(new NPC('sensei', 4600, 420, 'SENSEI KWAN', 0xaaaaaa, 'Your technique lacks focus. Defeat King Viper and I will train you.'));
    }
    
    buildBackground() {
        if (this.district.theme === 'harbor') {
            this.buildHarborBackground();
            return;
        }
        this.buildCityBackground();
    }
    
    buildHarborBackground() {
        renderer.bgContainer.removeChildren();
        renderer.mgContainer.removeChildren();
        
        // Cold blue night sky over the water
        const sky = new PIXI.Graphics();
        sky.rect(0, 0, this.district.width, 400).fill(0x0a1a2a);
        renderer.bgContainer.addChild(sky);
        
        // Distant water with faint moonlit shimmer
        const water = new PIXI.Graphics();
        water.rect(0, 280, this.district.width, 120).fill(0x0e2a40);
        for (let i = 0; i < this.district.width; i += 140) {
            water.rect(i + Math.random() * 60, 300 + Math.random() * 80, 40, 3).fill(0x1e4a66);
        }
        renderer.bgContainer.addChild(water);
        
        // Cranes on the horizon
        const cranes = new PIXI.Graphics();
        for (let i = 0; i < 12; i++) {
            const cx = i * 700 + 200;
            cranes.rect(cx, 120, 14, 260).fill(0x14202e);       // mast
            cranes.rect(cx - 120, 120, 260, 12).fill(0x14202e); // jib
            cranes.rect(cx + 120, 132, 4, 60).fill(0x14202e);   // cable
        }
        renderer.bgContainer.addChild(cranes);
        
        // Stacked shipping containers (midground)
        const containers = new PIXI.Graphics();
        const containerColors = [0x1d4e6b, 0x2a6a8a, 0x33566b, 0x0f3a52, 0x3a7ca5];
        for (let i = 0; i < 55; i++) {
            const x = i * 150;
            const stack = 1 + Math.floor(Math.random() * 3);
            for (let s = 0; s < stack; s++) {
                const c = containerColors[Math.floor(Math.random() * containerColors.length)];
                containers.rect(x, 420 - s * 60, 130, 55).fill(c);
                containers.rect(x + 10, 430 - s * 60, 4, 35).fill(0x0a1622); // corrugation lines
                containers.rect(x + 60, 430 - s * 60, 4, 35).fill(0x0a1622);
                containers.rect(x + 110, 430 - s * 60, 4, 35).fill(0x0a1622);
            }
        }
        renderer.mgContainer.addChild(containers);
        
        // Rolling fog banks
        const fog = new PIXI.Graphics();
        for (let i = 0; i < 60; i++) {
            const fx = Math.random() * this.district.width;
            const fy = 340 + Math.random() * 160;
            fog.ellipse(fx, fy, 120 + Math.random() * 120, 25 + Math.random() * 20)
               .fill({ color: 0x9ab8cc, alpha: 0.06 + Math.random() * 0.06 });
        }
        renderer.mgContainer.addChild(fog);
        
        // Wet dock planks
        const ground = new PIXI.Graphics();
        ground.rect(0, this.district.groundY, this.district.width, this.district.height - this.district.groundY).fill(0x1e2a34);
        for (let i = 0; i < this.district.width; i += 90) {
            ground.rect(i, this.district.groundY, 3, this.district.height - this.district.groundY).fill(0x121c24); // plank seams
            ground.rect(i + 20, this.district.groundY + 30, 45, 4).fill(0x4a6a80); // wet sheen
        }
        renderer.fgContainer.addChildAt(ground, 0);
    }
    
    buildCityBackground() {
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
            
            if (type === 'king_viper' || type === 'harbor_shark') {
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