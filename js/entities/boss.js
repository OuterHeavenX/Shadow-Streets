import { Enemy } from './enemy.js';
import { ui } from '../ui/ui.js';
import { audio } from '../audio/audio.js';
import { saveSystem } from '../save/save.js';

export class Boss extends Enemy {
    constructor(type, x, y) {
        super(type, x, y);
        this.isBoss = true;
        ui.showBoss(this.def.name);
        audio.playHitHeavy();
    }
    
    update(dt, world) {
        super.update(dt, world);
        ui.updateBossHp(this.hp, this.maxHp);
    }
    
    takeDamage(amt, kx, ky) {
        const dead = super.takeDamage(amt, kx, ky);
        if (dead) {
            ui.hideBoss();
            if (this.id === 'king_viper') {
                this.onKingViperDefeated();
            } else if (this.id === 'harbor_shark') {
                this.onHarborSharkDefeated();
            }
        }
        return dead;
    }
    
    onKingViperDefeated() {
        // Unlock The Docks and persist progress
        saveSystem.unlockDistrict('the_docks');
        if (window.game) saveSystem.save(window.game.player);
        
        ui.showDialogue('KING VIPER', 'IMPOSSIBLE... THE STREETS ARE YOURS...');
        setTimeout(() => {
            ui.showDialogue('SYSTEM', 'NEON ALLEY LIBERATED! A NEW DISTRICT AWAITS...');
        }, 4000);
        setTimeout(() => {
            if (window.game) window.game.changeDistrict('the_docks');
            ui.showDialogue('SYSTEM', 'THE DOCKS — the Harbor Shark\'s crew controls the waterfront. Clean it up!');
        }, 7000);
    }
    
    onHarborSharkDefeated() {
        if (window.game) saveSystem.save(window.game.player);
        ui.showDialogue('HARBOR SHARK', 'GLUB... THE WATERFRONT... IS YOURS...');
        setTimeout(() => {
            ui.showDialogue('SYSTEM', 'THE DOCKS LIBERATED! YOU BEAT THE DEMO!');
        }, 4000);
    }
}
