export class HUD {
    update(player) {
        if(!player) return;
        document.getElementById('hud-hp').style.width = `${(player.hp / player.maxHp) * 100}%`;
        document.getElementById('hud-xp').style.width = `${(player.xp / 100) * 100}%`;
        document.getElementById('hud-money').innerText = `$${player.money}`;
        document.getElementById('hud-name').innerText = `ALEX LV ${player.level}`;
    }
    
    showBoss(name) {
        document.getElementById('hud-boss').style.display = 'block';
        document.getElementById('hud-boss-name').innerText = name;
    }
    updateBossHp(hp, maxHp) {
        document.getElementById('hud-boss-hp').style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
    }
    hideBoss() {
        document.getElementById('hud-boss').style.display = 'none';
    }
}
export const hud = new HUD();