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
        this._prompted = false;
        this.draw();
        this.sprite.position.set(this.x, this.y);
    }

    draw() {
        const g = this.graphics;
        g.clear();

        // Shadow + facade
        g.roundRect(5, 12, 180, 204, 8).fill({ color: 0x080810, alpha: 0.7 });
        g.rect(0, 0, 180, 205).fill(0x29273a);
        g.rect(0, 0, 180, 20).fill(0x171522);
        g.rect(0, 20, 180, 8).fill(this.accent);

        // Neon/sign band
        g.roundRect(20, 38, 140, 42, 6).fill(0x10101a);
        g.roundRect(24, 42, 132, 34, 4).stroke({ color: this.accent, width: 3, alpha: 0.95 });

        // Display windows
        g.rect(16, 92, 58, 64).fill(0x111827);
        g.rect(106, 92, 58, 64).fill(0x111827);
        g.rect(20, 96, 50, 56).fill({ color: this.accent, alpha: 0.12 });
        g.rect(110, 96, 50, 56).fill({ color: this.accent, alpha: 0.12 });

        // Door / threshold
        g.rect(76, 92, 28, 94).fill(0x0b0b10);
        g.rect(81, 99, 18, 74).fill(0x1d2433);
        g.circle(96, 137, 2).fill(this.accent);
        g.rect(72, 184, 36, 7).fill(0x55505f);

        // Awning
        for (let i = 0; i < 6; i++) {
            g.rect(12 + i * 26, 82, 24, 10).fill(i % 2 ? 0xeee8d5 : this.accent);
        }

        const label = new PIXI.Text({
            text: this.sign,
            style: {
                fontFamily: 'monospace',
                fontSize: 18,
                fontWeight: '900',
                fill: this.accent,
                stroke: { color: 0x000000, width: 4 },
                align: 'center'
            }
        });
        label.anchor.set(0.5);
        label.position.set(90, 59);
        this.sprite.addChild(label);
    }

    update(dt, world) {
        const player = world.entities.find(e => e.constructor.name === 'Player');
        if (!player) return;

        const doorX = this.x + 90;
        const playerFeetY = player.y + player.height;
        const nearX = Math.abs((player.x + player.width / 2) - doorX) < 78;
        const nearY = playerFeetY < 430;
        const near = nearX && nearY;

        if (near && !shop.open) {
            if (!this._near) {
                ui.showDialogue(this.name, 'Press ENTER / Y to go inside.');
            }
            if (input.isJustPressed('Enter') || input.isJustPressed('KeyC')) {
                shop.openShop(this.type, this.name, player, player.inventory);
            }
        }

        this._near = near;
    }
}
