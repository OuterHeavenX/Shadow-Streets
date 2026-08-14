import { saveSystem } from '../save/save.js';
import { hud } from './hud.js';
import { menus } from './menus.js';
import { touch } from './touch.js';
import { dialogue } from './dialogue.js';
import { shop } from './shop.js';
import { characterMenu } from './characterMenu.js';

class UIManager {
    constructor() {
        this.player = null;
    }

    init() {
        this.uiLayer = document.getElementById('ui-layer');
        this.uiLayer.innerHTML = `
            <div id="title-screen" class="menu-screen">
                <div class="title">SHADOW STREETS</div>
                <div class="menu-options">
                    <button class="menu-btn" id="btn-new-game">NEW GAME</button>
                    <button class="menu-btn" id="btn-continue" ${saveSystem.load() ? '' : 'disabled'}>CONTINUE</button>
                </div>
            </div>
            <div id="hud" class="hud-container hidden">
                <div class="hud-top-left">
                    <div class="hud-name" id="hud-name">ALEX LV 1</div>
                    <div class="hud-bar-bg"><div class="hud-bar-fill hud-hp" id="hud-hp"></div></div>
                    <div class="hud-bar-bg"><div class="hud-bar-fill hud-xp" id="hud-xp"></div></div>
                </div>
                <div class="hud-money" id="hud-money">$0</div>
                <div class="hud-quest" id="hud-quest"></div>
                <div class="hud-boss" id="hud-boss">
                    <div class="hud-boss-name" id="hud-boss-name">BOSS</div>
                    <div class="hud-boss-bar-bg"><div class="hud-bar-fill hud-boss-hp" id="hud-boss-hp"></div></div>
                </div>
            </div>
            <div id="dialogue-box" class="dialogue-box hidden">
                <div class="dialogue-name" id="dialogue-name"></div>
                <div class="dialogue-text" id="dialogue-text"></div>
            </div>
            <div id="touch-controls" class="touch-controls">
                <div class="joystick-zone" id="joystick-zone"><div class="joystick-knob" id="joystick-knob"></div></div>
                <div class="action-btn" id="btn-a">A</div>
                <div class="action-btn" id="btn-b">B</div>
                <div class="action-btn" id="btn-x">X</div>
                <div class="action-btn" id="btn-y">Y</div>
                <div class="action-btn" id="btn-pause">☰</div>
            </div>
        `;

        menus.init();
        touch.setup();
        shop.init();
        characterMenu.init();
    }

    showTitleScreen() { menus.showTitleScreen(); }
    hideTitleScreen() { menus.hideTitleScreen(); }
    startGame(player) { this.player = player; }

    update(player) {
        hud.update(player);
        if (characterMenu.open) characterMenu.render();
    }

    toggleCharacterMenu() { characterMenu.toggle(this.player); }
    isBlockingGameplay() { return characterMenu.open || shop.open; }
    showBoss(name) { hud.showBoss(name); }
    updateBossHp(hp, maxHp) { hud.updateBossHp(hp, maxHp); }
    hideBoss() { hud.hideBoss(); }
    showDialogue(name, text) { dialogue.showDialogue(name, text); }

    updateQuestTracker(questSystem) {
        const el = document.getElementById('hud-quest');
        if (!el) return;
        const entries = Object.values(questSystem.active);
        if (entries.length === 0) { el.innerHTML = ''; return; }
        el.innerHTML = entries.map(entry =>
            `<div class="quest-name">◆ ${entry.quest.name}</div>` +
            entry.quest.objectives.map(o => `<div class="quest-obj">${o.label}: ${entry.progress[o.id]}/${o.count}</div>`).join('')
        ).join('');
    }

    spawnFloatingText(text, x, y, color='#fff') {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.innerText = text;
        let screenLeft = 50;
        if (window.game && window.game.world) {
            const camX = window.game.world.cameraX - window.innerWidth/2;
            screenLeft = ((x - camX) / window.innerWidth) * 100;
        }
        el.style.left = `${screenLeft}%`;
        el.style.top = `${Math.max(15, Math.min(80, (y / 600) * 100))}%`;
        el.style.color = color;
        document.getElementById('ui-layer').appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }
}
export const ui = new UIManager();