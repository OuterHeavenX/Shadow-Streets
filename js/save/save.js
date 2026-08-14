export class SaveSystem {
    constructor(){this.data=this.getDefaultData();}
    getDefaultData(){return{player:{level:1,xp:0,hp:100,maxHp:100,money:50,str:10,vit:10,agi:10,tech:10,equipment:{},weapon:null,skills:{jp:0,learned:[]}},progress:{unlockedDistricts:['neon_alley'],currentDistrict:'neon_alley'}};}
    unlockDistrict(id){if(!this.data.progress)this.data.progress=this.getDefaultData().progress;if(!this.data.progress.unlockedDistricts.includes(id))this.data.progress.unlockedDistricts.push(id);}
    setCurrentDistrict(id){if(!this.data.progress)this.data.progress=this.getDefaultData().progress;this.data.progress.currentDistrict=id;}
    isDistrictUnlocked(id){return!!(this.data.progress&&this.data.progress.unlockedDistricts.includes(id));}
    getCurrentDistrict(){return(this.data.progress&&this.data.progress.currentDistrict)||'neon_alley';}
    save(player){this.data.player={level:player.level,xp:player.xp,hp:player.hp,maxHp:player.maxHp,money:player.money,str:player.stats.str,vit:player.stats.vit,agi:player.stats.agi,tech:player.stats.tech,equipment:{...(player.inventory?.equipment||{})},weapon:player.weapon?{id:player.weapon.def.id,uses:player.weapon.uses}:null,skills:player.skills?.serialize?.()||{jp:0,learned:[]}};localStorage.setItem('shadow_streets_save',JSON.stringify(this.data));}
    applyToPlayer(player){const p=this.data?.player;if(!p||!player)return;player.level=p.level??1;player.xp=p.xp??0;player.hp=p.hp??100;player.maxHp=p.maxHp??100;player.money=p.money??50;player.stats.str=p.str??10;player.stats.vit=p.vit??10;player.stats.agi=p.agi??10;player.stats.tech=p.tech??10;if(player.inventory)player.inventory.equipment={...(p.equipment||{})};player.skills?.hydrate?.(p.skills||{});if(p.weapon?.id&&player.pickUpWeapon){player.pickUpWeapon(p.weapon.id);if(player.weapon)player.weapon.uses=p.weapon.uses||0;}}
    load(){const d=localStorage.getItem('shadow_streets_save');if(d){try{this.data=JSON.parse(d);if(!this.data.progress)this.data.progress=this.getDefaultData().progress;if(!this.data.player)this.data.player=this.getDefaultData().player;if(!this.data.player.equipment)this.data.player.equipment={};if(!this.data.player.skills)this.data.player.skills={jp:0,learned:[]};return true;}catch(e){}}return false;}
}
export const saveSystem=new SaveSystem();
