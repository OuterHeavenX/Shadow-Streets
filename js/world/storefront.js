import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { input } from '../core/input.js';
import { shop } from '../ui/shop.js';
import { ui } from '../ui/ui.js';

export class Storefront {
    constructor({ id, x, y = 205, name, type, accent = 0xffcc33, sign = 'SHOP' }) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 190;
        this.height = 220;
        this.name = name;
        this.type = type;
        this.accent = accent;
        this.sign = sign;
        this.isStorefront = true;
        this.sprite = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.sprite.addChild(this.graphics);
        this._near = false;
        this.draw();
        this.sprite.position.set(this.x, this.y);
    }

    draw() {
        const g = this.graphics;
        g.clear();
        g.roundRect(8, 14, 184, 208, 8).fill({ color: 0x05060b, alpha: 0.72 });
        g.rect(-8, -18, 196, 226).fill(0x252435);
        g.rect(-8, -18, 196, 15).fill(0x14131d);
        g.rect(-8, -3, 196, 7).fill(this.accent);
        for (let yy = 12; yy < 196; yy += 24) g.rect(-4, yy, 188, 2).fill({ color: 0xffffff, alpha: 0.025 });
        for (let xx = 18; xx < 176; xx += 42) g.rect(xx, 8, 2, 182).fill({ color: 0x000000, alpha: 0.06 });
        g.roundRect(15, 24, 150, 52, 7).fill(0x090b12);
        g.roundRect(19, 28, 142, 44, 5).stroke({ color: this.accent, width: 4, alpha: 0.96 });
        g.rect(24, 33, 132, 3).fill({ color: this.accent, alpha: 0.22 });
        g.rect(10, 91, 66, 68).fill(0x0e1522);
        g.rect(104, 91, 66, 68).fill(0x0e1522);
        g.rect(15, 96, 56, 58).fill({ color: this.accent, alpha: 0.1 });
        g.rect(109, 96, 56, 58).fill({ color: this.accent, alpha: 0.1 });
        g.rect(42, 92, 3, 66).fill(0x202837);
        g.rect(136, 92, 3, 66).fill(0x202837);

        if (this.type === 'food') {
            g.ellipse(27, 139, 13, 5).fill(0xd9b15a);
            g.rect(21, 125, 12, 14).fill(0x9a382c);
            g.ellipse(122, 141, 16, 6).fill(0xd8c99d);
            g.rect(113, 126, 18, 14).fill(0x6e3228);
        } else {
            g.rect(22, 119, 9, 28).fill(0x69737b);
            g.rect(38, 110, 10, 37).fill(0x405d6a);
            g.circle(122, 131, 10).fill(0x2f6847);
            g.circle(142, 131, 12).fill(0x3b7d54);
        }

        g.rect(76, 86, 30, 103).fill(0x08090d);
        g.rect(80, 91, 22, 87).fill(0x1a2635);
        g.rect(81, 92, 20, 17).fill({ color: this.accent, alpha: 0.12 });
        g.rect(77, 85, 28, 5).fill(0x3a3945);
        g.circle(97, 138, 2).fill(this.accent);
        g.rect(70, 184, 42, 8).fill(0x77717e);
        g.rect(64, 192, 54, 5).fill({ color: 0x050508, alpha: 0.55 });

        for (let i = 0; i < 7; i++) g.rect(5 + i * 25, 78, 23, 11).fill(i % 2 ? 0xe7e0ca : this.accent);
        g.rect(4, 89, 176, 3).fill(0x2d2c35);
        g.moveTo(12, 89).lineTo(4, 101).stroke({ color: 0x34323b, width: 2 });
        g.moveTo(172, 89).lineTo(180, 101).stroke({ color: 0x34323b, width: 2 });
        g.rect(176, 48, 3, 128).fill(0x474957);
        g.rect(168, 154, 18, 24).fill(0x3b3e48);
        g.rect(172, 160, 10, 3).fill(this.accent);

        const label = new PIXI.Text({
            text: this.sign,
            style: { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', fill: this.accent, stroke: { color: 0x000000, width: 4 }, align: 'center' }
        });
        label.anchor.set(0.5);
        label.position.set(90, 49);
        this.sprite.addChild(label);
    }

    update(dt, world) {
        const player = world.entities.find(e => e.constructor.name === 'Player');
        if (!player) return;

        const doorX = this.x + 90;
        const playerCenterX = player.x + player.width / 2;
        const playerFeetY = player.y + player.height;
        const rearBoundary = world.district?.streetTop ?? 382;
        const nearX = Math.abs(playerCenterX - doorX) < 56;
        const atDoor = playerFeetY <= rearBoundary + 10;
        const doorway = nearX && playerFeetY <= rearBoundary + 28;

        if (doorway && !shop.open && shop.canReopen()) {
            // The rear fence remains solid. Reaching the legal curb directly
            // in front of a shop is enough to enter; no movement behind it is required.
            if (atDoor || input.isJustPressed('Enter') || input.isJustPressed('KeyC')) {
                shop.openShop(this.type, this.name, player, player.inventory);
            } else if (!this._near) {
                ui.showDialogue(this.name, 'Walk up to the door to enter.');
            }
        }

        this._near = doorway;
    }
}
