import { GameLoop } from './core/engine.js';
import { renderer } from './core/renderer.js';
import { camera } from './core/camera.js';
import { input } from './core/input.js';
import { World } from './world/world.js';
import { Player } from './entities/player.js';
import { ui } from './ui/ui.js';
import { questSystem } from './quests/quests.js';
import { particles } from './core/particles.js';
import { combat } from './combat/combat.js';
import { weaponPickups } from './combat/weaponPickups.js';
import { environment } from './world/environment.js';
import { weather } from './world/weather.js';
import { saveSystem } from './save/save.js';
import { audio } from './audio/audio.js';

export class Game {
    constructor() {
        this.world = new World();
        this.player = new Player(100, 400);
        this.world.addEntity(this.player);

        // Weapon drop hook used by player.attack when an enemy dies.
        this.world.dropWeaponMaybe = (x, enemyType) => {
            const groundY = (this.world.district && this.world.district.groundY) || 500;
            weaponPickups.maybeDrop(x, groundY, enemyType);
        };

        this.loop = new GameLoop(dt => this.update(dt), () => this.render());
    }

    start(districtId = null) {
        const id = districtId || saveSystem.getCurrentDistrict();
        this.world.loadDistrict(id);
        saveSystem.setCurrentDistrict(id);
        ui.startGame(this.player);
        questSystem.start(this.player);
        weaponPickups.reset();
        environment.reset();
        weather.reset();
        audio.startMusic();
        this.loop.start();
    }

    update(dt) {
        // Global hitstop: freeze gameplay simulation but keep feedback alive.
        const frozen = combat.tickHitstop(dt);
        const simDt = frozen ? 0 : dt;

        this.world.update(simDt, this.player);
        weaponPickups.update(dt, this.player);
        camera.follow(this.player.x, dt);

        // Ambient systems (always run on real dt for smooth visuals)
        environment.update(dt);
        weather.update(dt, camera.x);
        particles.update(dt);

        ui.update(this.player);

        // Dynamic music: check combat state a few times per second.
        this._musicTimer = (this._musicTimer || 0) - dt;
        if (this._musicTimer <= 0) {
            this._musicTimer = 0.25;
            audio.setMusicIntensity(this.getMusicIntensity());
        }
    }

    // 'boss' if a living boss is in the district, 'combat' while any enemy
    // is chasing/attacking the player, otherwise 'ambient'.
    getMusicIntensity() {
        let intensity = 'ambient';
        for (const e of this.world.entities) {
            if (!e.def || e.hp <= 0) continue;
            if (e.isBoss) return 'boss';
            if (e.aiState === 'chase' || e.aiState === 'attack') intensity = 'combat';
        }
        return intensity;
    }

    render() {
        renderer.render();
    }

    changeDistrict(id) {
        this.world.loadDistrict(id);
        saveSystem.setCurrentDistrict(id);
        // Reset player position at the district entrance
        this.player.x = 100;
        this.player.y = 400;
        saveSystem.save(this.player);
    }
}
