import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';

class StreetJuice {
    decorate(district) {
        if (!district) return;
        const layer = new PIXI.Container();
        layer._worldScenery = true;
        const g = new PIXI.Graphics();
        layer.addChild(g);

        // Tighten the lower edge of the belt-scroll roadway with a foreground sidewalk.
        g.rect(0, 520, district.width, 80).fill(district.theme === 'harbor' ? 0x303b42 : 0x40414b);
        g.rect(0, 518, district.width, 4).fill(district.theme === 'harbor' ? 0x73818a : 0x777884);
        g.rect(0, 526, district.width, 2).fill({ color: 0xffffff, alpha: 0.08 });

        // Utility detail rhythm: drains, manholes, hydrants, cans, dumpsters.
        for (let x = 260; x < district.width; x += 720) {
            g.ellipse(x, 486, 34, 13).fill(0x171920);
            g.ellipse(x, 484, 29, 10).stroke({ color: 0x555a65, width: 3 });
            for (let i = -18; i <= 18; i += 9) g.rect(x + i, 480, 2, 8).fill(0x383c45);
        }
        for (let x = 620; x < district.width; x += 1500) {
            // Hydrant
            g.rect(x, 337, 14, 28).fill(0xb93d3d);
            g.rect(x - 4, 343, 22, 8).fill(0xd7584c);
            g.rect(x + 3, 331, 8, 7).fill(0xe06d58);
            // Trash can
            g.rect(x + 54, 336, 25, 30).fill(0x4c5660);
            g.rect(x + 51, 334, 31, 5).fill(0x68737d);
            g.lineTo(x + 58, 343).lineTo(x + 74, 358).stroke({ color: 0x303740, width: 2 });
        }
        for (let x = 1080; x < district.width; x += 2100) {
            // Dumpster tucked against buildings.
            g.roundRect(x, 319, 86, 48, 5).fill(0x24483f);
            g.rect(x + 5, 312, 76, 10).fill(0x315c50);
            g.rect(x + 12, 335, 22, 4).fill(0x12261f);
            g.circle(x + 14, 368, 5).fill(0x111317);
            g.circle(x + 72, 368, 5).fill(0x111317);
        }

        // Parked cars at long intervals create city depth without blocking the fight lane.
        if (district.theme !== 'harbor') {
            const carColors = [0x5a355f, 0x2f5575, 0x744337, 0x3f5c49];
            for (let x = 1450, i = 0; x < district.width; x += 2350, i++) {
                const c = carColors[i % carColors.length];
                g.roundRect(x, 300, 126, 48, 12).fill(c);
                g.roundRect(x + 25, 283, 70, 30, 10).fill(c);
                g.rect(x + 34, 289, 25, 18).fill({ color: 0x91b2c7, alpha: 0.42 });
                g.rect(x + 64, 289, 22, 18).fill({ color: 0x91b2c7, alpha: 0.38 });
                g.circle(x + 25, 350, 13).fill(0x101116);
                g.circle(x + 101, 350, 13).fill(0x101116);
                g.circle(x + 25, 350, 6).fill(0x777b82);
                g.circle(x + 101, 350, 6).fill(0x777b82);
            }
        } else {
            for (let x = 1350; x < district.width; x += 1800) {
                g.rect(x, 314, 115, 52).fill(0x4d3824);
                g.rect(x + 5, 319, 105, 6).fill(0x6d4a2a);
                g.lineTo(x + 30, 314).lineTo(x + 30, 366).stroke({ color: 0x2d2118, width: 3 });
                g.lineTo(x + 80, 314).lineTo(x + 80, 366).stroke({ color: 0x2d2118, width: 3 });
            }
        }

        // Graffiti / posters on the wall line.
        for (let x = 880; x < district.width; x += 1700) {
            const text = new PIXI.Text({
                text: district.theme === 'harbor' ? 'NO WAKE' : 'SHADOW',
                style: { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', fill: district.theme === 'harbor' ? 0x55b9c9 : 0xdb4dd5, stroke: { color: 0x101018, width: 4 } }
            });
            text.position.set(x, 286);
            layer.addChild(text);
        }

        renderer.fgContainer.addChildAt(layer, Math.min(1, renderer.fgContainer.children.length));
    }
}

export const streetJuice = new StreetJuice();
