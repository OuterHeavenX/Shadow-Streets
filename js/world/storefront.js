import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { input } from '../core/input.js';
import { shop } from '../ui/shop.js';
import { ui } from '../ui/ui.js';

export class Storefront {
    constructor({ id, x, y = 170, name, type, accent = 0xffcc33, sign = 'SHOP' }) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 230;
        this.height = 205;
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

        // Wide facade anchored into the city block instead of a freestanding kiosk.
        g.rect(-16, 8, 228, 198).fill({ color: 0x07070c, alpha: 0.55 });
        g.rect(-22, 0, 220, 192).fill(0x29273a);
        g.rect(-22, 0, 220, 18).fill(0x15131e);
        g.rect(-22, 18, 220, 7).fill(this.accent);
        g.rect(-12, 28, 200, 46).fill(0x10101a);
        g.roundRect(-6, 33, 188, 36, 5).stroke({ color: this.accent, width: 3, alpha: 0.95 });

        // Windows with product silhouettes.
        g.rect(-10, 92, 64, 64).fill(0x0d1420);
        g.rect(122, 92, 64, 64).fill(0x0d1420);
        g.rect(-5, 97, 54, 54).fill({ color: this.accent, alpha: 0.11 });
        g.rect(127, 97, 54, 54).fill({ color: this.accent, alpha: 0.11 });
        for (let i = 0; i < 3; i++) {
            g.rect(3 + i * 14, 122 - i * 5, 9, 24 + i * 5).fill({ color: 0xf3e4b5, alpha: 0.28 });
            g.circle(139 + i * 16, 128, 6 + i * 2).fill({ color: this.accent, alpha: 0.22 });
        }

        // Deep doorway reads as an actual entrance.
        g.rect(62, 84, 52, 104).fill(0x05050a);
        g.rect(69, 91, 38, 87).fill(0x172033);
        g.rect(72, 95, 32, 60).fill({ color: this.accent, alpha: 0.08 });
        g.circle(100, 137, 2).fill(this.accent);
        g.rect(56, 182, 64, 10).fill(0x6a606b);
        g.rect(52, 191, 72, 6).fill(0x3b3540);

        // RCR-style striped awning.
        for (let i = 0; i < 8; i++) {
            g.rect(-8 + i * 24, 76, 22, 12).fill(i % 2 ? 0xeee8d5 : this.accent);
        }

        const label = new PIXI.Text({
            text: this.sign,
            style: {
                fontFamily: 'monospace', fontSize: 19, fontWeight: '900',
                fill: this.accent, stroke: { color: 0x000000, width: 4 }, align: 'center'
            }
        });
        label.anchor.set(0.5);
        label.position.set(88, 51);
        this.sprite.addChild(label);
    }

    update(dt, world) {
        const player = world.entities.find(e => e.constructor.name === 'Player');
        if (!player || shop.open) return;

        const doorX = this.x + 88;
        const playerCenterX = player.x + player.width / 2;
        const feetY = player.y + player.height;
        const nearX = Math.abs(playerCenterX - doorX) < 46;
        const nearDoor = nearX && feetY < 405;
        const walkingIntoDoor = nearDoor && (player.depthVy < -12 || input.getAxisY() < -0.18);

        if (nearDoor && !this._near) {
            ui.showDialogue(this.name, 'Walk into the doorway to enter.');
        }

        if ((walkingIntoDoor || (nearDoor && (input.isJustPressed('Enter') || input.isJustPressed('KeyC')))) && shop.canReopen()) {
            player.depthVy = 0;
            player.vx = 0;
            shop.openShop(this.type, this.name, player, player.inventory);
        }

        this._near = nearDoor;
    }
}
