import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';

// Frame-based procedural pixel-art fighter.
//
// Instead of pre-building dozens of Graphics children, we keep ONE Graphics
// object and redraw it only when the (animation, frame, extra) tuple changes.
// This keeps us allocation-free in the hot loop while still animating.
//
// Chunky "pixel" grid: drawing helper px() snaps to a 4px grid.
//
// Animations: idle (2-frame bob), walk (4-frame), punch (2-frame), kick,
// hurt, jump. Arms visibly extend on attacks; legs alternate on walk.

const GRID = 4;

// Palette per fighter is passed in. Fields:
//   skin, hair, jacket, jacketDark, jacketLight, pants, shoes, accent
// Optional extras drawn per-type: weaponColor (held weapon), bulk, gang.
export class FighterSprite {
    constructor(graphics, width, height, palette, opts = {}) {
        this.g = graphics;
        this.w = width;
        this.h = height;
        this.pal = palette;
        this.opts = opts; // { knife, brawler, viper, boss }

        this.anim = 'idle';
        this.frame = 0;
        this.timer = 0;

        // Held weapon descriptor { color, len, thick } or null
        this.weapon = null;

        // Signature of the last drawn state to skip redundant redraws.
        this._sig = '';

        // Animation frame timings (seconds per frame)
        this.rates = {
            idle: 0.45,
            walk: 0.11,
            punch: 0.06,
            kick: 0.07,
            hurt: 0.12,
            jump: 0.2
        };
        // Frame counts per anim
        this.counts = {
            idle: 2,
            walk: 4,
            punch: 2,
            kick: 2,
            hurt: 1,
            jump: 1
        };
    }

    setWeapon(w) {
        this.weapon = w;
        this._sig = ''; // force redraw
    }

    // Set the current animation. `loop` anims (idle/walk) advance freely;
    // one-shot anims (punch/kick/hurt/jump) are driven by the entity's state.
    play(anim) {
        if (this.anim !== anim) {
            this.anim = anim;
            this.frame = 0;
            this.timer = 0;
        }
    }

    update(dt) {
        const count = this.counts[this.anim] || 1;
        if (count > 1) {
            this.timer += dt;
            const rate = this.rates[this.anim] || 0.2;
            while (this.timer >= rate) {
                this.timer -= rate;
                this.frame = (this.frame + 1) % count;
            }
        } else {
            this.frame = 0;
        }
        this.redrawIfNeeded();
    }

    redrawIfNeeded() {
        const wSig = this.weapon ? `${this.weapon.color}:${this.weapon.len}` : 'x';
        const sig = `${this.anim}:${this.frame}:${wSig}`;
        if (sig === this._sig) return;
        this._sig = sig;
        this.draw();
    }

    // chunky pixel: snap to grid
    px(x, y, w, h, color) {
        const g = this.g;
        const gx = Math.round(x / GRID) * GRID;
        const gy = Math.round(y / GRID) * GRID;
        const gw = Math.max(GRID, Math.round(w / GRID) * GRID);
        const gh = Math.max(GRID, Math.round(h / GRID) * GRID);
        g.rect(gx, gy, gw, gh).fill(color);
    }

    draw() {
        const g = this.g;
        g.clear();
        const p = this.pal;
        const w = this.w, h = this.h;

        // Layout regions (relative to sprite-local coords, facing +x).
        const headH = Math.round(h * 0.22);
        const torsoY = headH;
        const torsoH = Math.round(h * 0.42);
        const legsY = torsoY + torsoH;
        const legsH = h - legsY;

        // Vertical bob / recoil offsets per animation
        let bob = 0;
        let lean = 0;
        if (this.anim === 'idle') {
            bob = this.frame === 1 ? 2 : 0;
        } else if (this.anim === 'walk') {
            bob = (this.frame === 1 || this.frame === 3) ? 2 : 0;
        } else if (this.anim === 'hurt') {
            lean = -6; // recoil back
            bob = 3;
        } else if (this.anim === 'jump') {
            bob = -4;
        }

        // ---- HEAD ----
        const headX = w * 0.28 + lean;
        const headW = w * 0.44;
        // hair
        this.px(headX, bob, headW, headH * 0.5, p.hair);
        // face (skin)
        this.px(headX, bob + headH * 0.5, headW, headH * 0.5, p.skin);
        // eye / face detail (accent) — a small brow/eye chunk toward facing
        this.px(headX + headW * 0.55, bob + headH * 0.5, GRID, GRID, 0x111111);
        // type accent on head (e.g. gang bandana for viper)
        if (this.opts.viper) {
            this.px(headX - 2, bob + headH * 0.35, headW + 4, GRID, p.gang || 0x33aa33);
        }
        if (this.opts.boss) {
            // shades
            this.px(headX + headW * 0.3, bob + headH * 0.5, headW * 0.6, GRID, 0xaa0000);
        }

        // ---- TORSO (jacket) ----
        let torsoX = w * 0.18 + lean;
        let torsoW = w * 0.64;
        if (this.opts.brawler) {
            // bulkier torso
            torsoX = w * 0.1 + lean;
            torsoW = w * 0.8;
        }
        this.px(torsoX, torsoY + bob, torsoW, torsoH, p.jacket);
        // shading (dark) on trailing side
        this.px(torsoX, torsoY + bob, torsoW * 0.28, torsoH, p.jacketDark);
        // highlight stripe (light) on leading side
        this.px(torsoX + torsoW * 0.72, torsoY + bob, torsoW * 0.28, torsoH, p.jacketLight);
        // accent belt
        this.px(torsoX, legsY - GRID + bob, torsoW, GRID, p.accent);

        // ---- LEGS ----
        this.drawLegs(w, h, legsY, legsH, bob, p);

        // ---- ARMS (extend on attacks) ----
        this.drawArms(w, h, torsoY, torsoH, bob, p);
    }

    drawLegs(w, h, legsY, legsH, bob, p) {
        const legW = w * 0.26;
        const leftX = w * 0.22;
        const rightX = w * 0.52;
        let lY = legsY + bob;
        let rY = legsY + bob;
        let lH = legsH;
        let rH = legsH;

        if (this.anim === 'walk') {
            // alternate stride per frame
            if (this.frame === 0) { lY += 0; rY += 4; rH -= 4; }
            else if (this.frame === 1) { lY += 2; rY += 2; }
            else if (this.frame === 2) { lY += 4; lH -= 4; rY += 0; }
            else { lY += 2; rY += 2; }
        } else if (this.anim === 'jump') {
            // tucked legs
            lH = legsH * 0.6; rH = legsH * 0.6;
            lY += legsH * 0.2; rY += legsH * 0.2;
        } else if (this.anim === 'kick') {
            // one leg extends forward (drawn as forward-leaning shin)
            rH = legsH * 0.55;
            rY += legsH * 0.1;
        }

        // pants
        this.px(leftX, lY, legW, lH, p.pants);
        this.px(rightX, rY, legW, rH, p.pants);
        // shoes
        this.px(leftX, lY + lH - GRID, legW, GRID, p.shoes);
        this.px(rightX, rY + rH - GRID, legW, GRID, p.shoes);

        // extended kick foot (forward)
        if (this.anim === 'kick') {
            const footX = w * 0.9;
            const footY = legsY + legsH * 0.35 + bob;
            this.px(footX, footY, w * 0.35, GRID * 2, p.pants);
            this.px(footX + w * 0.28, footY, GRID * 2, GRID * 2, p.shoes);
        }
    }

    drawArms(w, h, torsoY, torsoH, bob, p) {
        const armW = w * 0.2;
        const restX = w * 0.66;
        const shoulderY = torsoY + GRID + bob;

        const attacking = this.anim === 'punch';
        // Rear arm (always at side)
        this.px(w * 0.06, shoulderY, armW * 0.8, torsoH * 0.7, p.jacketDark);

        if (attacking) {
            // extended punch: forearm reaches forward on frame 1
            const reach = this.frame === 1 ? w * 0.7 : w * 0.35;
            const armY = torsoY + torsoH * 0.35 + bob;
            // upper arm
            this.px(restX, armY, armW, GRID * 2, p.jacket);
            // extended forearm (skin)
            this.px(restX + armW - GRID, armY, reach, GRID * 2, p.skin);
            // fist
            this.px(restX + armW - GRID + reach - GRID, armY - GRID, GRID * 2, GRID * 2, p.skin);
            // weapon held in fist
            if (this.weapon) {
                this.drawWeapon(restX + armW - GRID + reach, armY, bob);
            }
        } else {
            // resting front arm along torso
            const armY = torsoY + GRID + bob;
            this.px(restX, armY, armW, torsoH * 0.7, p.jacket);
            this.px(restX, armY + torsoH * 0.7 - GRID, armW, GRID, p.skin);
            // weapon held down at side
            if (this.weapon) {
                this.drawWeapon(restX + armW * 0.4, armY + torsoH * 0.6, bob);
            }
        }
    }

    drawWeapon(x, y, bob) {
        const wpn = this.weapon;
        if (!wpn) return;
        const len = wpn.len || 30;
        const thick = wpn.thick || 6;
        // horizontal weapon (points in facing +x direction)
        this.px(x, y, len, thick, wpn.color);
        // knife has a small guard / handle detail
        if (len < 26) {
            this.px(x - GRID, y - GRID, GRID, thick + GRID * 2, 0x553311);
        }
    }
}

// Palette factory from a base color (enemy) or explicit set (player).
export function paletteFromColor(base, opts = {}) {
    // derive dark/light shades
    const dark = shade(base, -0.35);
    const light = shade(base, 0.35);
    return {
        skin: opts.skin != null ? opts.skin : 0xd4a88a,
        hair: opts.hair != null ? opts.hair : 0x1a1a1a,
        jacket: base,
        jacketDark: dark,
        jacketLight: light,
        pants: opts.pants != null ? opts.pants : shade(base, -0.55),
        shoes: opts.shoes != null ? opts.shoes : 0x111111,
        accent: opts.accent != null ? opts.accent : 0x000000,
        gang: opts.gang
    };
}

function shade(color, amt) {
    let r = (color >> 16) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = color & 0xff;
    if (amt >= 0) {
        r = Math.round(r + (255 - r) * amt);
        g = Math.round(g + (255 - g) * amt);
        b = Math.round(b + (255 - b) * amt);
    } else {
        const f = 1 + amt;
        r = Math.round(r * f);
        g = Math.round(g * f);
        b = Math.round(b * f);
    }
    return (r << 16) | (g << 8) | b;
}
