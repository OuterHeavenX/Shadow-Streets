export class SaveSystem {
    constructor() {
        this.data = this.getDefaultData();
    }
    
    getDefaultData() {
        return {
            player: { level: 1, xp: 0, hp: 100, maxHp: 100, money: 50, str: 10, vit: 10, agi: 10, tech: 10 }
        };
    }
    
    save(player) {
        this.data.player = {
            level: player.level, xp: player.xp, hp: player.hp, maxHp: player.maxHp, money: player.money,
            str: player.stats.str, vit: player.stats.vit, agi: player.stats.agi, tech: player.stats.tech
        };
        localStorage.setItem('shadow_streets_save', JSON.stringify(this.data));
    }
    
    load() {
        const d = localStorage.getItem('shadow_streets_save');
        if (d) {
            try {
                this.data = JSON.parse(d);
                return true;
            } catch(e) {}
        }
        return false;
    }
}
export const saveSystem = new SaveSystem();