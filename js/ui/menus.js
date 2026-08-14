import { audio } from '../audio/audio.js';
import { Game } from '../game.js';

export class Menus {
    init() {
        document.getElementById('btn-new-game').onclick = () => {
            audio.init();
            this.hideTitleScreen();
            window.game = new Game();
            window.game.start();
        };
        
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            continueBtn.onclick = () => {
                audio.init();
                this.hideTitleScreen();
                window.game = new Game();
                window.game.start();
            };
        }
    }
    
    showTitleScreen() {
        document.getElementById('title-screen').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
    }
    
    hideTitleScreen() {
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
    }
}
export const menus = new Menus();