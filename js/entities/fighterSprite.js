import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
const GRID=4;
export class FighterSprite{
 constructor(graphics,width,height,palette,opts={}){this.g=graphics;this.w=width;this.h=height;this.pal=palette;this.opts=opts;this.anim='idle';this.frame=0;this.timer=0;this.weapon=null;this._sig='';this.rates={idle:.38,walk:.10,punch:.055,kick:.065,hurt:.12,jump:.2};this.counts={idle:2,walk:4,punch:2,kick:2,hurt:1,jump:1};}
 setWeapon(w){this.weapon=w;this._sig='';} play(a){if(this.anim!==a){this.anim=a;this.frame=0;this.timer=0;}} update(dt){const c=this.counts[this.anim]||1;if(c>1){this.timer+=dt;const r=this.rates[this.anim]||.2;while(this.timer>=r){this.timer-=r;this.frame=(this.frame+1)%c;}}else this.frame=0;this.redrawIfNeeded();}
 redrawIfNeeded(){const ws=this.weapon?`${this.weapon.color}:${this.weapon.len}`:'x',sig=`${this.anim}:${this.frame}:${ws}`;if(sig===this._sig)return;this._sig=sig;this.draw();}
 px(x,y,w,h,color){const gx=Math.round(x/GRID)*GRID,gy=Math.round(y/GRID)*GRID,gw=Math.max(GRID,Math.round(w/GRID)*GRID),gh=Math.max(GRID,Math.round(h/GRID)*GRID);this.g.rect(gx,gy,gw,gh).fill(color);}
 draw(){const g=this.g,p=this.pal,w=this.w,h=this.h;g.clear();const headH=Math.round(h*.24),torsoY=headH,torsoH=Math.round(h*.40),legsY=torsoY+torsoH,legsH=h-legsY;let bob=0,lean=0;if(this.anim==='idle')bob=this.frame===1?2:0;else if(this.anim==='walk')bob=(this.frame===1||this.frame===3)?2:0;else if(this.anim==='hurt'){lean=-6;bob=3;}else if(this.anim==='jump')bob=-4;
  // Tiny contact shadow is part of the fighter art and follows every frame.
  g.ellipse(w*.5,h+2,w*.34,4).fill({color:0x08090d,alpha:.42});
  const headX=w*.25+lean,headW=w*.5;this.px(headX,bob,headW,headH*.45,p.hair);this.px(headX-GRID,bob+GRID,GRID,headH*.35,p.hair);this.px(headX,bob+headH*.45,headW,headH*.55,p.skin);
  // Ear/nose/eyes make the face readable at chibi scale.
  this.px(headX+headW*.72,bob+headH*.52,GRID,GRID,0x101116);this.px(headX+headW*.86,bob+headH*.68,GRID,GRID,p.skin);this.px(headX+headW*.54,bob+headH*.78,GRID,GRID,0x6d4034);
  if(this.opts.viper)this.px(headX-2,bob+headH*.32,headW+4,GRID,p.gang||0x33aa33);if(this.opts.boss){this.px(headX+headW*.22,bob+headH*.5,headW*.66,GRID,0xaa1824);this.px(headX+headW*.35,bob-2,GRID,GRID,0xd6b55b);}
  let tx=w*.16+lean,tw=w*.68;if(this.opts.brawler){tx=w*.08+lean;tw=w*.84;}this.px(tx,torsoY+bob,tw,torsoH,p.jacket);this.px(tx,torsoY+bob,tw*.24,torsoH,p.jacketDark);this.px(tx+tw*.72,torsoY+bob,tw*.28,torsoH,p.jacketLight);
  // Shirt/zipper, collar, belt buckle: more identity without changing silhouette.
  this.px(tx+tw*.44,torsoY+GRID+bob,GRID,torsoH-GRID*2,p.accent);this.px(tx+GRID,torsoY+bob,GRID*2,GRID,p.jacketLight);this.px(tx+tw-GRID*3,torsoY+bob,GRID*2,GRID,p.jacketLight);this.px(tx,legsY-GRID+bob,tw,GRID,p.accent);this.px(tx+tw*.46,legsY-GRID+bob,GRID,GRID,0xd5b45b);
  this.drawLegs(w,legsY,legsH,bob,p);this.drawArms(w,torsoY,torsoH,bob,p);
 }
 drawLegs(w,ly,lh,b,p){const lw=w*.26,lx=w*.20,rx=w*.54;let aY=ly+b,bY=ly+b,aH=lh,bH=lh;if(this.anim==='walk'){if(this.frame===0){bY+=4;bH-=4;}else if(this.frame===1){aY+=2;bY+=2;}else if(this.frame===2){aY+=4;aH-=4;}else{aY+=2;bY+=2;}}else if(this.anim==='jump'){aH=lh*.6;bH=lh*.6;aY+=lh*.2;bY+=lh*.2;}else if(this.anim==='kick'){bH=lh*.55;bY+=lh*.1;}this.px(lx,aY,lw,aH,p.pants);this.px(rx,bY,lw,bH,p.pants);this.px(lx,aY+aH-GRID,lw+GRID,GRID,p.shoes);this.px(rx,bY+bH-GRID,lw+GRID,GRID,p.shoes);if(this.anim==='kick'){const fx=w*.88,fy=ly+lh*.35+b;this.px(fx,fy,w*.35,GRID*2,p.pants);this.px(fx+w*.28,fy,GRID*2,GRID*2,p.shoes);}}
 drawArms(w,ty,th,b,p){const aw=w*.2,rest=w*.68,sy=ty+GRID+b,atk=this.anim==='punch';this.px(w*.04,sy,aw*.8,th*.7,p.jacketDark);if(atk){const reach=this.frame===1?w*.72:w*.36,ay=ty+th*.35+b;this.px(rest,ay,aw,GRID*2,p.jacket);this.px(rest+aw-GRID,ay,reach,GRID*2,p.skin);this.px(rest+aw-GRID+reach-GRID,ay-GRID,GRID*2,GRID*2,p.skin);if(this.weapon)this.drawWeapon(rest+aw-GRID+reach,ay);}else{const ay=ty+GRID+b;this.px(rest,ay,aw,th*.7,p.jacket);this.px(rest,ay+th*.7-GRID,aw,GRID,p.skin);if(this.weapon)this.drawWeapon(rest+aw*.4,ay+th*.6);}}
 drawWeapon(x,y){const w=this.weapon;if(!w)return;const len=w.len||30,thick=w.thick||6;this.px(x,y,len,thick,w.color);this.px(x+len-GRID,y-GRID,GRID,GRID,0xf4f4df);if(len<26)this.px(x-GRID,y-GRID,GRID,thick+GRID*2,0x553311);}
}
export function paletteFromColor(base,opts={}){return{skin:opts.skin??0xd4a88a,hair:opts.hair??0x1a1a1a,jacket:base,jacketDark:shade(base,-.35),jacketLight:shade(base,.35),pants:opts.pants??shade(base,-.55),shoes:opts.shoes??0x111111,accent:opts.accent??0x000000,gang:opts.gang};}
function shade(color,amt){let r=color>>16&255,g=color>>8&255,b=color&255;if(amt>=0){r=Math.round(r+(255-r)*amt);g=Math.round(g+(255-g)*amt);b=Math.round(b+(255-b)*amt);}else{const f=1+amt;r=Math.round(r*f);g=Math.round(g*f);b=Math.round(b*f);}return r<<16|g<<8|b;}
