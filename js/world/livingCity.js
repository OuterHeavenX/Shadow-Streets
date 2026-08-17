import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';
import { ui } from '../ui/ui.js';

class LivingCity {
  constructor(){this.world=null;this.player=null;this.eventTimer=18;this.calmTimer=0;this.wasDanger=false;this.banner=null;}
  attach(world,player){this.world=world;this.player=player;this.eventTimer=12+Math.random()*10;this.calmTimer=0;this.wasDanger=false;this.clearBanner();}
  update(dt){
    if(!this.world||!this.player)return;
    const enemies=this.world.entities.filter(e=>e.def&&e.hp>0);
    const danger=enemies.some(e=>Math.abs(e.x-this.player.x)<520);
    if(danger){this.calmTimer=0;this.wasDanger=true;}
    else if(this.wasDanger){this.calmTimer+=dt;if(this.calmTimer>1.2){this.wasDanger=false;this.calmTimer=0;ui.spawnFloatingText('STREET CLEAR!',this.player.x,this.player.y-65,'#77ff9b');}}

    this.eventTimer-=dt;
    if(this.eventTimer<=0&&!danger){this.eventTimer=22+Math.random()*22;this.triggerEvent();}
  }
  triggerEvent(){
    const roll=Math.floor(Math.random()*4);
    if(roll===0){this.flashBanner('STREET RUMOR','A hidden stash was seen near the next alley.');}
    else if(roll===1){const cash=5+Math.floor(Math.random()*11);this.player.money+=cash;this.flashBanner('LUCKY FIND',`You spot $${cash} near the curb.`);}
    else if(roll===2){this.flashBanner('CITY BUZZ','Locals are talking about Shadow cleaning up the block.');}
    else{this.player.hp=Math.min(this.player.maxHp,this.player.hp+8);this.flashBanner('GOOD SAMARITAN','A passerby hands you a sports drink. +8 HP');}
  }
  flashBanner(title,text){
    this.clearBanner();
    const c=new PIXI.Container();c._worldScenery=true;c.zIndex=9999;
    const g=new PIXI.Graphics();g.roundRect(0,0,360,58,8).fill({color:0x08101d,alpha:.92}).stroke({color:0x65dfff,width:2,alpha:.75});c.addChild(g);
    const t1=new PIXI.Text({text:title,style:{fontFamily:'monospace',fontSize:14,fontWeight:'900',fill:0xffe66d}});t1.position.set(12,8);c.addChild(t1);
    const t2=new PIXI.Text({text,style:{fontFamily:'monospace',fontSize:11,fill:0xd7e8ff,wordWrap:true,wordWrapWidth:330}});t2.position.set(12,30);c.addChild(t2);
    c.position.set(Math.max(12,(window.innerWidth-360)/2),74);renderer.uiContainer.addChild(c);this.banner=c;setTimeout(()=>this.clearBanner(),2600);
  }
  clearBanner(){if(this.banner?.parent)this.banner.parent.removeChild(this.banner);this.banner=null;}
}
export const livingCity=new LivingCity();
