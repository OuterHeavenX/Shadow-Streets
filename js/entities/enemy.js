import { Entity } from './entity.js';
import { ENEMIES } from '../../data/enemies.js';
import { ai } from '../ai/ai.js';
import { FighterSprite, paletteFromColor } from './fighterSprite.js';

export class Enemy extends Entity {
    constructor(type,x,y){const def=ENEMIES[type];super(x,y,def.width,def.height);this.def=def;this.id=def.id;this.hp=def.hp;this.maxHp=def.hp;this.xp=def.xp;this.gold=def.gold;this.speed=def.speed;this.aiState='patrol';this.attackCooldown=0;this.attackAnimTimer=0;this.blockTimer=0;this.knockdownTimer=0;this.buildSprite(type);}
    buildSprite(type){const opts={};let po={};if(type==='knife_wielder')opts.knife=true;else if(type==='brawler'){opts.brawler=true;po.hair=0x223311;}else if(type==='viper_soldier'){opts.viper=true;po.gang=0x33cc44;po.accent=0x33cc44;}if(this.def.type==='boss')opts.boss=true;const palette=paletteFromColor(this.def.color,po);this.fighter=new FighterSprite(this.graphics,this.width,this.height,palette,opts);if(type==='knife_wielder')this.fighter.setWeapon({color:0xdddddd,len:22,thick:5});this.fighter.draw();}
    playAttackAnim(d=.3){this.attackAnimTimer=d;this._attackAnim=this.def.type==='tank'?'punch':(Math.random()<.4?'kick':'punch');}
    update(dt,world){super.update(dt,world);if(this.hp<=0)return;if(this.attackAnimTimer>0)this.attackAnimTimer-=dt;if(this.blockTimer>0)this.blockTimer-=dt;if(this.knockdownTimer>0){this.knockdownTimer-=dt;this.aiState='down';this.vx*=.86;this.depthVy*=.86;}else if(this.hitstun<=0)ai.updateEnemy(this,world.entities.find(e=>e.constructor.name==='Player'),dt,world);else{this.vx*=.9;this.depthVy*=.9;}this.updateAnim(dt);}
    updateAnim(dt){let anim;if(this.knockdownTimer>0)anim='hurt';else if(this.hitstun>0)anim='hurt';else if(this.attackAnimTimer>0)anim=this._attackAnim||'punch';else if(!this.isGrounded)anim='jump';else if(Math.abs(this.vx)>20||Math.abs(this.depthVy)>20)anim='walk';else anim='idle';this.fighter.play(anim);this.fighter.update(dt);}
}
