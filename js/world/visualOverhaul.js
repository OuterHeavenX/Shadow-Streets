import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';

class VisualOverhaul {
  constructor(){ this.layer=null; this.time=0; this.puddles=[]; this.steam=[]; this.signs=[]; }
  reset(district){
    if(this.layer?.parent) this.layer.parent.removeChild(this.layer);
    this.time=0; this.puddles=[]; this.steam=[]; this.signs=[];
    if(!district) return;
    const c=new PIXI.Container(); c._worldScenery=true; c._neoVisual=true;
    const g=new PIXI.Graphics(); c.addChild(g);
    const harbor=district.theme==='harbor';
    // Road texture: cracks, patched asphalt and subtle lane scuffs. Geometry unchanged.
    for(let x=80;x<district.width;x+=310){
      const y=398+(x%117); g.moveTo(x,y).lineTo(x+22,y+5).lineTo(x+37,y+1).stroke({color:0x11131a,width:2,alpha:.38});
      g.rect(x+95,425+(x%63),62,12).fill({color:0x171922,alpha:.18});
    }
    // Reflective puddles, deliberately shallow and non-colliding.
    for(let x=360,i=0;x<district.width;x+=930,i++){
      const y=455+(i%2)*42; g.ellipse(x,y,72,11).fill({color:harbor?0x3aa5c8:0x7b4fa5,alpha:.12});
      g.ellipse(x+8,y-2,43,5).fill({color:harbor?0x8deaff:0xff63d8,alpha:.12}); this.puddles.push({x,y});
    }
    // Utility poles/cables add layered urban silhouette while preserving the bridge cables.
    for(let x=260;x<district.width;x+=1250){
      g.rect(x,190,7,174).fill(0x171b22); g.rect(x-34,205,75,5).fill(0x202630);
      g.moveTo(x-30,211).lineTo(x+520,252).stroke({color:0x171b22,width:2,alpha:.72});
      g.moveTo(x+30,214).lineTo(x+580,270).stroke({color:0x242a34,width:2,alpha:.55});
      g.circle(x+26,226,7).fill({color:0xffdf8a,alpha:.5});
    }
    // Neon hanging signs and lit windows.
    const colors=harbor?[0x59d9ff,0x6df2bd,0xffbd69]:[0xff4fd8,0x53e7ff,0xffb347,0x77ff72];
    for(let x=740,i=0;x<district.width;x+=1120,i++){
      const color=colors[i%colors.length]; g.rect(x,224,6,72).fill(0x252936); g.rect(x-12,226,58,32).fill(0x12131c); g.rect(x-9,229,52,26).stroke({color,width:3,alpha:.85});
      const glow=new PIXI.Graphics(); glow.circle(x+17,270,42).fill({color,alpha:.045}); c.addChild(glow); this.signs.push({glow,phase:i*.8});
    }
    // Steam vents/manholes.
    for(let x=1020,i=0;x<district.width;x+=1750,i++){
      for(let s=0;s<3;s++){const puff=new PIXI.Graphics(); puff.circle(0,0,7+s*2).fill({color:0xd7e5ee,alpha:.10}); puff.position.set(x+s*8,475-s*10); c.addChild(puff); this.steam.push({puff,baseX:x+s*8,baseY:475-s*10,phase:i+s});}
    }
    // Foreground vignette-like road grime only at extreme bottom edge.
    g.rect(0,590,district.width,10).fill({color:0x090a0e,alpha:.32});
    renderer.fgContainer.addChildAt(c,Math.min(2,renderer.fgContainer.children.length)); this.layer=c;
  }
  update(dt){ if(!this.layer) return; this.time+=dt; for(const s of this.signs)s.glow.alpha=.65+.25*Math.sin(this.time*2.1+s.phase); for(const st of this.steam){const t=(this.time*.28+st.phase*.19)%1;st.puff.position.set(st.baseX+Math.sin(this.time*1.7+st.phase)*7,st.baseY-t*58);st.puff.alpha=(1-t)*.8;} }
}
export const visualOverhaul=new VisualOverhaul();
