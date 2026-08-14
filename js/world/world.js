import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';
import { DISTRICTS } from '../../data/districts.js';
import { Enemy } from '../entities/enemy.js';
import { Boss } from '../entities/boss.js';
import { NPC } from '../entities/npc.js';
import { Storefront } from './storefront.js';

export class World {
    constructor() { this.entities=[]; this.district=null; this.spawnTimer=0; this.bossSpawned=false; this.cameraX=0; }
    addEntity(e){ this.entities.push(e); renderer.fgContainer.addChild(e.sprite); }
    removeEntity(e){ this.entities=this.entities.filter(ent=>ent!==e); if(e.sprite&&e.sprite.parent)e.sprite.parent.removeChild(e.sprite); }
    clearScenery(){ for(const child of [...renderer.fgContainer.children]) if(child._worldScenery) renderer.fgContainer.removeChild(child); }
    addScenery(displayObject,index=0){ displayObject._worldScenery=true; renderer.fgContainer.addChildAt(displayObject,Math.min(index,renderer.fgContainer.children.length)); }

    loadDistrict(id){
        const player=this.entities.find(e=>e.constructor.name==='Player');
        for(let i=this.entities.length-1;i>=0;i--) if(this.entities[i]!==player)this.removeEntity(this.entities[i]);
        this.clearScenery(); this.bossSpawned=false; this.spawnTimer=0; this.district=DISTRICTS[id];
        this.buildBackground(); this.spawnStores(); this.spawnNPCs();
        if(player){ const feet=455; player.y=feet-player.height; player.depthVy=0; player.z=0; player.isGrounded=true; }
    }

    spawnStores(){
        if(this.district.id==='the_docks'){
            this.addEntity(new Storefront({id:'salty_joes_supply',x:430,name:"SALTY JOE'S SUPPLY",type:'items',accent:0x48b7d8,sign:'SUPPLY'}));
            this.addEntity(new Storefront({id:'marinas_grill',x:3150,name:"MARINA'S FISH GRILL",type:'food',accent:0xff8a3d,sign:'GRILL'})); return;
        }
        this.addEntity(new Storefront({id:'terrys_goods',x:430,name:"TERRY'S STREET GOODS",type:'items',accent:0x53ff78,sign:'GOODS'}));
        this.addEntity(new Storefront({id:'old_mama_ramen',x:3150,name:"OLD MAMA'S RAMEN",type:'food',accent:0xff5b55,sign:'RAMEN'}));
        this.addEntity(new Storefront({id:'metro_gear',x:4050,name:'METRO FIGHT GEAR',type:'items',accent:0x8f7cff,sign:'GEAR'}));
    }
    spawnNPCs(){ if(this.district.id==='neon_alley') this.addEntity(new NPC('sensei',4700,380,'SENSEI KWAN',0xaaaaaa,'Your technique lacks focus. Defeat King Viper and I will train you.')); }
    buildBackground(){ if(this.district.theme==='harbor')this.buildHarborBackground(); else this.buildCityBackground(); }

    buildHarborBackground(){
        renderer.bgContainer.removeChildren(); renderer.mgContainer.removeChildren();
        const sky=new PIXI.Graphics(); sky.rect(0,0,this.district.width,310).fill(0x0a1a2a); renderer.bgContainer.addChild(sky);
        const water=new PIXI.Graphics(); water.rect(0,230,this.district.width,105).fill(0x0e2a40); for(let i=0;i<this.district.width;i+=140)water.rect(i+Math.random()*60,250+Math.random()*65,40,3).fill(0x1e4a66); renderer.bgContainer.addChild(water);
        const cranes=new PIXI.Graphics(); for(let i=0;i<12;i++){const cx=i*700+200; cranes.rect(cx,85,14,235).fill(0x14202e); cranes.rect(cx-120,85,260,12).fill(0x14202e); cranes.rect(cx+120,97,4,55).fill(0x14202e);} renderer.bgContainer.addChild(cranes);
        const containers=new PIXI.Graphics(); const colors=[0x1d4e6b,0x2a6a8a,0x33566b,0x0f3a52,0x3a7ca5]; for(let i=0;i<55;i++){const x=i*150,stack=1+Math.floor(Math.random()*2);for(let s=0;s<stack;s++){const c=colors[Math.floor(Math.random()*colors.length)];containers.rect(x,310-s*58,130,54).fill(c);containers.rect(x+12,318-s*58,4,36).fill(0x0a1622);containers.rect(x+62,318-s*58,4,36).fill(0x0a1622);containers.rect(x+112,318-s*58,4,36).fill(0x0a1622);}} renderer.mgContainer.addChild(containers);
        const street=new PIXI.Graphics(); street.rect(0,335,this.district.width,30).fill(0x66727a);street.rect(0,365,this.district.width,180).fill(0x1e2a34);street.rect(0,545,this.district.width,55).fill(0x343f45);street.rect(0,365,this.district.width,4).fill(0x9aa9b1);street.rect(0,541,this.district.width,4).fill(0x10181d);for(let i=0;i<this.district.width;i+=120){street.rect(i,405,65,3).fill({color:0x7aa0b6,alpha:.25});street.rect(i+30,500,52,3).fill({color:0x7aa0b6,alpha:.2});} this.addScenery(street,0);
    }

    buildCityBackground(){
        renderer.bgContainer.removeChildren(); renderer.mgContainer.removeChildren();
        const sky=new PIXI.Graphics(); sky.rect(0,0,this.district.width,300).fill(0x1a1a2e); renderer.bgContainer.addChild(sky);
        const backBuildings=new PIXI.Graphics(); for(let i=0;i<80;i++)backBuildings.rect(i*100,90+Math.random()*120,84,240).fill(0x111122); renderer.bgContainer.addChild(backBuildings);

        // Restore the long parallel bridge/cable lines that gave Neon Alley
        // its bridge-like perspective. They stay behind buildings/fighters.
        const bridge=new PIXI.Graphics();
        for(let section=-1;section<Math.ceil(this.district.width/1800)+1;section++){
            const sx=section*1800;
            bridge.moveTo(sx-260,18).lineTo(sx+1550,300).stroke({color:0x566271,width:3,alpha:.55});
            bridge.moveTo(sx-180,-18).lineTo(sx+1630,264).stroke({color:0x3f4b5b,width:2,alpha:.42});
        }
        renderer.bgContainer.addChild(bridge);

        const buildings=new PIXI.Graphics(); for(let i=0;i<50;i++){const bx=i*200;buildings.rect(bx,150+Math.random()*60,168,190).fill(0x2a2a3e);const neon=[0x00ffff,0xff00ff,0xff8800][i%3];buildings.rect(bx+12,238,12,60).fill({color:neon,alpha:.75});for(let w=0;w<3;w++)buildings.rect(bx+45+w*34,220,18,24).fill({color:0xffd76a,alpha:.16});} renderer.mgContainer.addChild(buildings);
        const street=new PIXI.Graphics();street.rect(0,320,this.district.width,45).fill(0x555564);street.rect(0,365,this.district.width,180).fill(0x2c2d38);street.rect(0,545,this.district.width,55).fill(0x44444f);street.rect(0,361,this.district.width,4).fill(0x888895);street.rect(0,541,this.district.width,4).fill(0x171720);for(let i=0;i<this.district.width;i+=190)street.rect(i+25,445,88,5).fill({color:0xe4dca9,alpha:.32});for(let i=0;i<this.district.width;i+=115)street.rect(i,382+(i%4)*25,48,2).fill({color:0xffffff,alpha:.05});this.addScenery(street,0);
    }

    update(dt,player){
        this.cameraX=player.x; this.entities.sort((a,b)=>(a.y+a.height)-(b.y+b.height));
        for(const e of this.entities) if(e.sprite&&e.sprite.parent===renderer.fgContainer) renderer.fgContainer.setChildIndex(e.sprite,renderer.fgContainer.children.length-1);
        for(let i=this.entities.length-1;i>=0;i--) if(this.entities[i])this.entities[i].update(dt,this);
        this.spawnTimer-=dt; if(this.spawnTimer<=0){this.trySpawnEnemies(player);this.spawnTimer=2;}
    }
    randomStreetY(height=80){const top=this.district.streetTop??382,bottom=this.district.streetBottom??545;const feet=top+20+Math.random()*Math.max(20,bottom-top-40);return feet-height;}
    trySpawnEnemies(player){if(!this.district)return;const zone=this.district.zones.find(z=>player.x>=z.start&&player.x<z.end);if(!zone||!zone.spawns.length)return;const enemyCount=this.entities.filter(e=>e instanceof Enemy&&!e.isBoss).length;if(enemyCount>=4)return;const type=zone.spawns[Math.floor(Math.random()*zone.spawns.length)];if(type==='king_viper'||type==='harbor_shark'){if(!this.bossSpawned){this.addEntity(new Boss(type,Math.min(this.district.width-200,player.x+300),this.randomStreetY(100)));this.bossSpawned=true;}return;}const ex=player.x+(Math.random()>.5?window.innerWidth/2+50:-window.innerWidth/2-50);if(ex>0&&ex<this.district.width)this.addEntity(new Enemy(type,ex,this.randomStreetY(80)));}
}
