import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.mjs';
import { renderer } from '../core/renderer.js';

class StreetJuice {
    decorate(district) {
        if (!district) return;

        const back = new PIXI.Container();
        back._worldScenery = true;
        const g = new PIXI.Graphics();
        back.addChild(g);

        // IMPORTANT: this pass does not change street dimensions. It only
        // fills the existing composition with readable city-block detail.
        g.rect(0, 520, district.width, 80).fill(district.theme === 'harbor' ? 0x303b42 : 0x40414b);
        g.rect(0, 518, district.width, 4).fill(district.theme === 'harbor' ? 0x73818a : 0x777884);
        g.rect(0, 526, district.width, 2).fill({ color: 0xffffff, alpha: 0.08 });

        // Sidewalk seams, curb cuts, gutter grime.
        for (let x = 0; x < district.width; x += 92) {
            g.rect(x, 323, 2, 38).fill({ color: 0x11141c, alpha: 0.28 });
            g.rect(x + 18, 356, 54, 2).fill({ color: 0xffffff, alpha: 0.05 });
        }
        for (let x = 120; x < district.width; x += 520) {
            g.rect(x, 361, 72, 5).fill({ color: 0x111216, alpha: 0.34 });
        }

        // Manholes and storm drains.
        for (let x = 260; x < district.width; x += 720) {
            g.ellipse(x, 486, 34, 13).fill(0x171920);
            g.ellipse(x, 484, 29, 10).stroke({ color: 0x555a65, width: 3 });
            for (let i = -18; i <= 18; i += 9) g.rect(x + i, 480, 2, 8).fill(0x383c45);
        }
        for (let x = 470; x < district.width; x += 1150) {
            g.rect(x, 365, 56, 7).fill(0x171a20);
            for (let i = 4; i < 52; i += 8) g.rect(x + i, 366, 3, 5).fill(0x545962);
        }

        // Street furniture rhythm.
        for (let x = 620; x < district.width; x += 1500) {
            // Hydrant
            g.rect(x, 337, 14, 28).fill(0xb93d3d);
            g.rect(x - 4, 343, 22, 8).fill(0xd7584c);
            g.rect(x + 3, 331, 8, 7).fill(0xe06d58);
            g.circle(x + 7, 346, 5).fill(0x812d2d);
            // Trash can
            g.rect(x + 54, 336, 25, 30).fill(0x4c5660);
            g.rect(x + 51, 334, 31, 5).fill(0x68737d);
            for (let i = 5; i < 23; i += 6) g.rect(x + 54 + i, 341, 2, 21).fill(0x303740);
        }

        // Dumpsters, vending machines, newspaper boxes and benches.
        for (let x = 1080; x < district.width; x += 2100) {
            g.roundRect(x, 319, 86, 48, 5).fill(0x24483f);
            g.rect(x + 5, 312, 76, 10).fill(0x315c50);
            g.rect(x + 12, 335, 22, 4).fill(0x12261f);
            g.circle(x + 14, 368, 5).fill(0x111317);
            g.circle(x + 72, 368, 5).fill(0x111317);

            const vm = x + 122;
            g.roundRect(vm, 296, 42, 70, 4).fill(district.theme === 'harbor' ? 0x315b72 : 0x7d223b);
            g.rect(vm + 7, 304, 28, 20).fill({ color: 0x9deeff, alpha: 0.35 });
            g.rect(vm + 7, 330, 28, 4).fill(0xf3d65f);
            g.rect(vm + 10, 342, 22, 14).fill(0x121823);

            const news = x + 188;
            g.roundRect(news, 333, 28, 33, 3).fill(0x315f8b);
            g.rect(news + 4, 337, 20, 13).fill(0xb7d7e9);
            g.rect(news + 6, 353, 16, 5).fill(0x203f5d);
        }

        for (let x = 1720; x < district.width; x += 2450) {
            // Bench against the sidewalk.
            g.rect(x, 341, 82, 7).fill(0x6b4528);
            g.rect(x, 354, 82, 7).fill(0x6b4528);
            g.rect(x + 8, 347, 5, 23).fill(0x22252d);
            g.rect(x + 68, 347, 5, 23).fill(0x22252d);

            // Bicycle silhouette.
            g.circle(x + 118, 356, 14).stroke({ color: 0x252932, width: 3 });
            g.circle(x + 153, 356, 14).stroke({ color: 0x252932, width: 3 });
            g.moveTo(x + 118, 356).lineTo(x + 133, 338).lineTo(x + 153, 356).lineTo(x + 132, 356).lineTo(x + 118, 356).stroke({ color: 0x505968, width: 3 });
            g.moveTo(x + 133, 338).lineTo(x + 145, 334).stroke({ color: 0x505968, width: 3 });
        }

        // Construction barriers and cones make some blocks feel distinct.
        for (let x = 2150; x < district.width; x += 3000) {
            g.rect(x, 343, 92, 8).fill(0xe18a25);
            g.rect(x + 8, 351, 6, 20).fill(0xe7e1c2);
            g.rect(x + 76, 351, 6, 20).fill(0xe7e1c2);
            for (let i = 0; i < 4; i++) {
                const cx = x + 112 + i * 26;
                g.moveTo(cx, 366).lineTo(cx + 8, 342).lineTo(cx + 16, 366).closePath().fill(0xe8752b);
                g.rect(cx + 4, 352, 8, 3).fill(0xf1e6cf);
            }
        }

        // Better parked cars: bumpers, lights, glass, door seams, highlights.
        if (district.theme !== 'harbor') {
            const carColors = [0x5a355f, 0x2f5575, 0x744337, 0x3f5c49, 0x6e5f2f];
            for (let x = 1450, i = 0; x < district.width; x += 2350, i++) {
                const c = carColors[i % carColors.length];
                g.roundRect(x, 302, 142, 48, 12).fill(0x11131a);
                g.roundRect(x + 2, 296, 138, 48, 12).fill(c);
                g.roundRect(x + 29, 278, 80, 32, 10).fill(c);
                g.rect(x + 37, 284, 28, 18).fill({ color: 0x91b2c7, alpha: 0.48 });
                g.rect(x + 70, 284, 29, 18).fill({ color: 0x91b2c7, alpha: 0.42 });
                g.rect(x + 68, 307, 2, 30).fill({ color: 0x1c1d26, alpha: 0.5 });
                g.rect(x + 7, 320, 10, 7).fill(0xf0d46f);
                g.rect(x + 126, 320, 10, 7).fill(0xc83e45);
                g.rect(x + 4, 338, 134, 5).fill(0x292c34);
                g.rect(x + 25, 309, 28, 2).fill({ color: 0xffffff, alpha: 0.12 });
                g.circle(x + 28, 348, 14).fill(0x101116);
                g.circle(x + 114, 348, 14).fill(0x101116);
                g.circle(x + 28, 348, 6).fill(0x777b82);
                g.circle(x + 114, 348, 6).fill(0x777b82);
            }
        } else {
            for (let x = 1350; x < district.width; x += 1800) {
                g.rect(x, 314, 115, 52).fill(0x4d3824);
                g.rect(x + 5, 319, 105, 6).fill(0x6d4a2a);
                g.lineTo(x + 30, 314).lineTo(x + 30, 366).stroke({ color: 0x2d2118, width: 3 });
                g.lineTo(x + 80, 314).lineTo(x + 80, 366).stroke({ color: 0x2d2118, width: 3 });
                g.rect(x + 18, 329, 78, 25).stroke({ color: 0x875f35, width: 2 });
            }
        }

        // Block identity: graffiti, hanging signs, alley gates and lamps.
        for (let x = 880, i = 0; x < district.width; x += 1700, i++) {
            const text = new PIXI.Text({
                text: district.theme === 'harbor' ? (i % 2 ? 'PIER 7' : 'NO WAKE') : (i % 2 ? 'VIPER TURF' : 'SHADOW'),
                style: { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', fill: district.theme === 'harbor' ? 0x55b9c9 : (i % 2 ? 0x66d35c : 0xdb4dd5), stroke: { color: 0x101018, width: 4 } }
            });
            text.position.set(x, 286);
            back.addChild(text);

            g.rect(x + 210, 268, 5, 96).fill(0x222832);
            g.rect(x + 190, 271, 42, 5).fill(0x222832);
            g.circle(x + 208, 285, 8).fill({ color: 0xffe3a0, alpha: 0.6 });

            // Alley opening / chain gate.
            g.rect(x + 330, 248, 78, 116).fill(0x090b10);
            for (let gy = 255; gy < 356; gy += 12) g.rect(x + 334, gy, 70, 2).fill(0x343944);
            for (let gx = 338; gx < x + 404; gx += 12) g.rect(gx, 254, 2, 106).fill(0x343944);
        }

        renderer.fgContainer.addChildAt(back, Math.min(1, renderer.fgContainer.children.length));

        // Foreground occlusion: a handful of objects sit over fighters when
        // they walk at the very front edge, giving the belt-scroll world depth.
        const front = new PIXI.Container();
        front._worldScenery = true;
        front._streetForeground = true;
        const fg = new PIXI.Graphics();
        front.addChild(fg);
        for (let x = 760; x < district.width; x += 1900) {
            fg.rect(x, 550, 6, 50).fill(0x262b33);
            fg.circle(x + 3, 546, 11).fill(0x343b46);
            fg.rect(x - 18, 593, 42, 7).fill({ color: 0x0f1118, alpha: 0.7 });
        }
        for (let x = 1260; x < district.width; x += 2600) {
            fg.roundRect(x, 565, 55, 35, 4).fill(0x2e333d);
            fg.rect(x + 5, 570, 45, 5).fill(0x565d69);
            fg.circle(x + 11, 600, 5).fill(0x111318);
            fg.circle(x + 44, 600, 5).fill(0x111318);
        }
        renderer.fgContainer.addChild(front);
        renderer.streetForeground = front;
    }
}

export const streetJuice = new StreetJuice();
