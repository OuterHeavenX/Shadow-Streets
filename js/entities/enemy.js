import { Entity } from './entity.js';
import { ENEMIES } from '../../data/enemies.js';
import { ai } from '../ai/ai.js';
import { FighterSprite, paletteFromColor } from './fighterSprite.js';

export class Enemy extends Entity {
    constructor(type, x, y) {
        const def = ENEMIES[type];
        super(x, y, def.width, def.height);
        this.def = def;
        this.id = def.id;
        this.hp = def.hp;
        this.maxHp = def.hp;
        this.xp = def.xp;
        this.gold = def.gold;
        this.speed = def.speed;

        // AI / attack animation state
        this.aiState = 'patrol';
        this.attackCooldown = 0;
        this.attackAnimTimer = 0;
        this.blockTimer = 0; // brawler block window (visual + damage reduce)

        this.buildSprite(type);
    }

    buildSprite(type) {
        // Type-specific palette + details. `type` is the enemy id
        // (e.g. 'knife_wielder'); def.type is the behavior class
        // (e.g. 'boss', 'tank').
        const opts = {};
        let paletteOpts = {};

        if (type === 'knife_wielder') {
            opts.knife = true;
        } else if (type === 'brawler') {
            opts.brawler = true;
            paletteOpts.hair = 0x223311;
        } else if (type === 'viper_soldier') {
            opts.viper = true;
            paletteOpts.gang = 0x33cc44; // viper green bandana
            paletteOpts.accent = 0x33cc44;
        }

        if (this.def.type === 'boss') {
            opts.boss = true;
        }

        const palette = paletteFromColor(this.def.color, paletteOpts);
        this.fighter = new FighterSprite(this.graphics, this.width, this.height, palette, opts);

        // Knife wielders always visibly hold a knife.
        if (type === 'knife_wielder') {
            this.fighter.setWeapon({ color: 0xdddddd, len: 22, thick: 5 });
        }

        this.fighter.draw();
    }

    // Called by AI to trigger a swing animation.
    playAttackAnim(duration = 0.3) {
        this.attackAnimTimer = duration;
        this._attackAnim = (this.def.type === 'tank') ? 'punch' : (Math.random() < 0.4 ? 'kick' : 'punch');
    }

    update(dt, world) {
        super.update(dt, world);
        if (this.hp <= 0) return;

        if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;
        if (this.blockTimer > 0) this.blockTimer -= dt;

        if (this.hitstun <= 0) {
            ai.updateEnemy(this, world.entities.find(e => e.constructor.name === 'Player'), dt, world);
        } else {
            this.vx *= 0.9;
        }

        this.updateAnim(dt);
    }

    updateAnim(dt) {
        let anim;
        if (this.hitstun > 0) {
            anim = 'hurt';
        } else if (this.attackAnimTimer > 0) {
            anim = this._attackAnim || 'punch';
        } else if (!this.isGrounded) {
            anim = 'jump';
        } else if (Math.abs(this.vx) > 20) {
            anim = 'walk';
        } else {
            anim = 'idle';
        }
        this.fighter.play(anim);
        this.fighter.update(dt);
    }
}
