import { GameLoop } from './core/engine.js';
import { renderer } from './core/renderer.js';
import { camera } from './core/camera.js';
import { input } from './core/input.js';
import { World } from './world/world.js';
import { streetJuice } from './world/streetJuice.js';
import { visualOverhaul } from './world/visualOverhaul.js';
import { Player } from './entities/player.js';
import { ui } from './ui/ui.js';
import { shop } from './ui/shop.js';
import { questSystem } from './quests/quests.js';
import { particles } from './core/particles.js';
import { combat } from './combat/combat.js';
import { weaponPickups } from './combat/weaponPickups.js';
import { environment } from './world/environment.js';
import { weather } from './world/weather.js';
import { saveSystem } from './save/save.js';
import { audio } from './audio/audio.js';

export class Game {
 constructor(){this.world=new World();this.player=new Player(100,375);this.world.addEntity(this.player);this.paused=false;this.world.dropWeaponMaybe=(x,enemyType)=>{const laneY=this.player.y+this.player.height*.6+10;weaponPickups.maybeDrop(x,laneY,enemyType);};this.loop=new GameLoop(dt=>this.update(dt),()=>this.render());}
 start(districtId=null){saveSystem.applyToPlayer(this.player);const id=districtId||saveSystem.getCurrentDistrict();this.world.loadDistrict(id);streetJuice.decorate(this.world.district);visualOverhaul.reset(this.world.district);saveSystem.setCurrentDistrict(id);ui.startGame(this.player);questSystem.start(this.player);weaponPickups.reset();environment.reset();weather.reset();audio.startMusic();this.loop.start();}
 update(dt){if(input.isJustPressed('Escape')){if(shop.open)shop.close();else ui.toggleCharacterMenu();}if(this.paused||ui.isBlockingGameplay()){ui.update(this.player,dt);return;}const frozen=combat.tickHitstop(dt),simDt=frozen?0:dt;this.world.update(simDt,this.player);weaponPickups.update(dt,this.player);camera.follow(this.player.x,dt);environment.update(dt);weather.update(dt,camera.x);visualOverhaul.update(dt);particles.update(dt);ui.update(this.player,dt);if(renderer.streetForeground&&renderer.streetForeground.parent===renderer.fgContainer)renderer.fgContainer.setChildIndex(renderer.streetForeground,renderer.fgContainer.children.length-1);this._musicTimer=(this._musicTimer||0)-dt;if(this._musicTimer<=0){this._musicTimer=.25;audio.setMusicIntensity(this.getMusicIntensity());}}
 getMusicIntensity(){let intensity='ambient';for(const e of this.world.entities){if(!e.def||e.hp<=0)continue;if(e.isBoss)return'boss';if(e.aiState==='chase'||e.aiState==='attack')intensity='combat';}return intensity;}
 render(){renderer.render();}
 changeDistrict(id){this.world.loadDistrict(id);streetJuice.decorate(this.world.district);visualOverhaul.reset(this.world.district);saveSystem.setCurrentDistrict(id);this.player.x=100;this.player.y=375;this.player.depthVy=0;this.player.z=0;this.player.isGrounded=true;saveSystem.save(this.player);}
}
