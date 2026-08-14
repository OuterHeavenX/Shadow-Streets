import { Enemy } from './enemy.js';
import { ui } from '../ui/ui.js';
import { audio } from '../audio/audio.js';

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
            ui.showDialogue('KING VIPER', 'IMPOSSIBLE... THE STREETS ARE YOURS...');
            setTimeout(() => {
                ui.showDialogue('SYSTEM', 'YOU BEAT THE DEMO! DISTRICT LIBERATED!');
            }, 4000);
        }
        return dead;
    }
}