import { Entity } from './entity.js';
import { FighterSprite, paletteFromColor } from './fighterSprite.js';

const CIV_COLORS=[0x9b4dca,0x3f7fc4,0xc45f45,0x4b9c68,0xb48b3e,0x6f5fb8];
const NAMES=['MIA','JAY','TESS','OMAR','LENA','NICO','RHEA','VIN'];

export class Civilian extends Entity {
  constructor(x,y,index=0){
    super(x,y,36,72);
    this.id=`civilian_${index}`;
    this.name=NAMES[index%NAMES.length];
    this.homeX=x;
    this.homeY=y;
    this.speed=92+(index%3)*10;
    this.state='wander';
    this.timer=Math.random()*2;
    this.fleeDir=index%2?1:-1;
    this.cheerTimer=0;
    this.fighter=new FighterSprite(this.graphics,this.width,this.height,paletteFromColor(CIV_COLORS[index%CIV_COLORS.length],{
      skin:index%3===0?0xb87955:(index%3===1?0xd4a88a:0x8f6248),
      hair:index%2?0x1c1715:0x33251d,
      pants:0x24283b,
      shoes:0xe9e9e9,
      accent:0x161820
    }));
    this.fighter.draw();
  }

  update(dt,world){
    super.update(dt,world);
    const enemies=world.entities.filter(e=>e.def&&e.hp>0&&!e.isBoss);
    const nearest=enemies.sort((a,b)=>Math.abs(a.x-this.x)-Math.abs(b.x-this.x))[0];
    const danger=nearest&&Math.abs(nearest.x-this.x)<420;

    if(danger){
      this.state='flee';
      this.fleeDir=(this.x<nearest.x?-1:1);
      this.vx=this.fleeDir*this.speed*2.25;
      this.depthVy=((this.homeY+this.height)<430?-1:1)*this.speed*.65;
      this.cheerTimer=1.4;
    } else if(this.state==='flee') {
      this.vx*=.84; this.depthVy*=.84;
      if(Math.abs(this.vx)<8){ this.state='return'; this.timer=.4; }
    } else if(this.state==='return') {
      const dx=this.homeX-this.x,dy=this.homeY-this.y;
      if(Math.abs(dx)<12&&Math.abs(dy)<10){this.state='cheer';this.timer=1.2;this.vx=0;this.depthVy=0;}
      else {const len=Math.hypot(dx,dy)||1;this.vx=dx/len*this.speed;this.depthVy=dy/len*this.speed*.75;}
    } else if(this.state==='cheer') {
      this.timer-=dt; this.vx=0; this.depthVy=0;
      if(this.timer<=0){this.state='wander';this.timer=1+Math.random()*2;}
    } else {
      this.timer-=dt;
      if(this.timer<=0){this.timer=1.2+Math.random()*2.4;this.vx=(Math.random()-.5)*this.speed*.7;this.depthVy=(Math.random()-.5)*this.speed*.32;}
      if(Math.abs(this.x-this.homeX)>150)this.vx+=(this.homeX-this.x)*.02;
      if(Math.abs(this.y-this.homeY)>28)this.depthVy+=(this.homeY-this.y)*.06;
    }

    this.dir=this.vx<0?-1:(this.vx>0?1:this.dir);
    this.fighter.play(Math.abs(this.vx)>10||Math.abs(this.depthVy)>10?'walk':'idle');
    this.fighter.update(dt);
  }
}
