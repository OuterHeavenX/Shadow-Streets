import { Entity } from './entity.js';
import { ui } from '../ui/ui.js';
import { input } from '../core/input.js';

export class NPC extends Entity {
    constructor(id, x, y, name, color, dialog) {
        super(x, y, 40, 80);
        this.name = name;
        this.dialog = dialog;
        
        this.graphics.clear();
        this.graphics.rect(0, 20, 40, 60).fill(color);
        this.graphics.rect(10, 0, 20, 20).fill(0xd4a88a);
    }
    
    update(dt, world) {
        super.update(dt, world);
        
        const player = world.entities.find(e => e.constructor.name === 'Player');
        if (player) {
            const dist = Math.abs(player.x - this.x);
            if (dist < 80) {
                if (input.isJustPressed('Enter') || (input.joystickActive && input.isJustPressed('Space'))) {
                    ui.showDialogue(this.name, this.dialog);
                }
            }
        }
    }
}