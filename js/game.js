import { GameLoop } from './core/engine.js';
import { renderer } from './core/renderer.js';
import { camera } from './core/camera.js';
import { input } from './core/input.js';
import { World } from './world/world.js';
import { Player } from './entities/player.js';
import { ui } from './ui/ui.js';
import { questSystem } from './quests/quests.js';

export class Game {
    constructor() {
        this.world = new World();
        this.player = new Player(100, 400);
        this.world.addEntity(this.player);
        this.loop = new GameLoop(dt => this.update(dt), () => this.render());
    }
    
    start() {
        this.world.loadDistrict('neon_alley');
        ui.startGame(this.player);
        questSystem.start(this.player);
        this.loop.start();
    }
    
    update(dt) {
        this.world.update(dt, this.player);
        camera.follow(this.player.x, dt);
        ui.update(this.player);
    }
    
    render() {
        renderer.render();
    }
}