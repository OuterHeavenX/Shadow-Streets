import { renderer } from './core/renderer.js';
import { input } from './core/input.js';
import { Game } from './game.js';
import { ui } from './ui/ui.js';

async function bootstrap() {
    await renderer.init('game-container');
    ui.init();
    ui.showTitleScreen();
}

bootstrap();