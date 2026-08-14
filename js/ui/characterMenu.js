import { saveSystem } from '../save/save.js';
import { ITEMS } from '../../data/items.js';
import { questSystem } from '../quests/quests.js';

class CharacterMenu {
    constructor() {
        this.open = false;
        this.player = null;
        this.tab = 'status';
    }

    init() {
        const root = document.createElement('div');
        root.id = 'character-menu';
        root.className = 'ff-menu hidden';
        root.innerHTML = `
            <div class="ff-menu-shell">
                <div class="ff-menu-topbar">
                    <div>
                        <div class="ff-menu-kicker">SHADOW STREETS</div>
                        <div class="ff-menu-title">ALEX</div>
                    </div>
                    <div class="ff-menu-money" id="ff-menu-money">$0</div>
                </div>
                <div class="ff-menu-body">
                    <nav class="ff-menu-nav">
                        <button data-tab="status" class="active">STATUS</button>
                        <button data-tab="equipment">EQUIPMENT</button>
                        <button data-tab="inventory">INVENTORY</button>
                        <button data-tab="progress">PROGRESS</button>
                        <button data-tab="quests">QUESTS</button>
                        <button data-tab="system">SYSTEM</button>
                    </nav>
                    <section class="ff-menu-panel" id="ff-menu-panel"></section>
                </div>
                <div class="ff-menu-footer">
                    <span>MENU / PAUSE</span>
                    <button id="ff-menu-resume">RESUME</button>
                </div>
            </div>
        `;
        document.getElementById('ui-layer').appendChild(root);

        root.querySelectorAll('[data-tab]').forEach(btn => {
            const activate = e => {
                e.preventDefault();
                this.tab = btn.dataset.tab;
                root.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
                this.render();
            };
            btn.addEventListener('click', activate);
            btn.addEventListener('touchstart', activate, { passive: false });
        });

        const resume = root.querySelector('#ff-menu-resume');
        const close = e => { e.preventDefault(); this.hide(); };
        resume.addEventListener('click', close);
        resume.addEventListener('touchstart', close, { passive: false });
    }

    toggle(player) {
        if (this.open) this.hide();
        else this.show(player);
    }

    show(player) {
        if (!player) return;
        this.player = player;
        this.open = true;
        this.tab = 'status';
        document.getElementById('character-menu').classList.remove('hidden');
        document.getElementById('touch-controls')?.classList.add('controls-dimmed');
        if (window.game) window.game.paused = true;
        this.render();
    }

    hide() {
        this.open = false;
        document.getElementById('character-menu')?.classList.add('hidden');
        document.getElementById('touch-controls')?.classList.remove('controls-dimmed');
        if (window.game) window.game.paused = false;
    }

    render() {
        if (!this.open || !this.player) return;
        const p = this.player;
        document.getElementById('ff-menu-money').textContent = `$${p.money}`;
        const panel = document.getElementById('ff-menu-panel');
        const hpPct = Math.max(0, Math.min(100, p.hp / p.maxHp * 100));
        const xpPct = Math.max(0, Math.min(100, p.xp));

        if (this.tab === 'status') {
            panel.innerHTML = `
                <div class="ff-character-card">
                    <div class="ff-portrait"><div class="ff-pixel-head"></div><div class="ff-pixel-body"></div></div>
                    <div class="ff-character-main">
                        <h2>ALEX <small>LV ${p.level}</small></h2>
                        <div class="ff-meter-label"><span>HP</span><strong>${Math.ceil(p.hp)} / ${p.maxHp}</strong></div>
                        <div class="ff-meter"><i style="width:${hpPct}%"></i></div>
                        <div class="ff-meter-label"><span>XP</span><strong>${Math.floor(p.xp)} / 100</strong></div>
                        <div class="ff-meter xp"><i style="width:${xpPct}%"></i></div>
                    </div>
                </div>
                <div class="ff-stat-grid">
                    ${this.stat('STR', p.stats.str, 'Attack power')}
                    ${this.stat('VIT', p.stats.vit, 'Health & toughness')}
                    ${this.stat('AGI', p.stats.agi, 'Movement & recovery')}
                    ${this.stat('TECH', p.stats.tech, 'Technique & specials')}
                </div>
                <div class="ff-info-box"><b>STREET RANK</b><span>${this.rankFor(p.level)}</span><b>CURRENT WEAPON</b><span>${p.weapon?.def?.name || 'Bare Hands'}</span></div>`;
        } else if (this.tab === 'equipment') {
            const slots = ['head', 'body', 'hands', 'feet', 'accessory'];
            panel.innerHTML = `<h2>EQUIPMENT</h2><div class="ff-list">${slots.map(slot => {
                const id = p.inventory.equipment[slot];
                const item = id && ITEMS[id];
                return `<div class="ff-list-row"><span>${slot.toUpperCase()}</span><strong>${item ? `${item.icon || ''} ${item.name}` : '—'}</strong></div>`;
            }).join('')}</div><div class="ff-info-box"><b>HELD WEAPON</b><span>${p.weapon?.def?.name || 'None'}</span><b>DURABILITY</b><span>${p.weapon ? `${Math.max(0, p.weapon.def.durability - p.weapon.uses)} / ${p.weapon.def.durability}` : '—'}</span></div>`;
        } else if (this.tab === 'inventory') {
            const owned = Object.values(p.inventory.equipment).map(id => ITEMS[id]).filter(Boolean);
            panel.innerHTML = `<h2>INVENTORY</h2><div class="ff-list">${owned.length ? owned.map(item => `<div class="ff-list-row"><span>${item.icon || '◆'} ${item.name}</span><strong>EQUIPPED</strong></div>`).join('') : '<div class="ff-empty">No permanent gear yet. Visit a store.</div>'}</div><h3>ACTIVE EFFECTS</h3><div class="ff-list">${p.inventory.buffs.length ? p.inventory.buffs.map(b => `<div class="ff-list-row"><span>+${b.amount} ${b.stat.toUpperCase()}</span><strong>${Math.ceil(b.remaining)}s</strong></div>`).join('') : '<div class="ff-empty">No active food buffs.</div>'}</div>`;
        } else if (this.tab === 'progress') {
            const unlocked = saveSystem.data.progress?.unlockedDistricts || ['neon_alley'];
            panel.innerHTML = `<h2>PROGRESS</h2><div class="ff-big-stat"><span>LEVEL</span><strong>${p.level}</strong></div><div class="ff-big-stat"><span>DISTRICTS OPEN</span><strong>${unlocked.length}</strong></div><div class="ff-info-box"><b>CURRENT DISTRICT</b><span>${(saveSystem.getCurrentDistrict() || '').replaceAll('_',' ').toUpperCase()}</span><b>NEXT LEVEL</b><span>${Math.max(0, 100 - Math.floor(p.xp))} XP</span></div>`;
        } else if (this.tab === 'quests') {
            const entries = Object.values(questSystem.active || {});
            panel.innerHTML = `<h2>QUESTS</h2>${entries.length ? entries.map(entry => `<div class="ff-quest-card"><strong>${entry.quest.name}</strong>${entry.quest.objectives.map(o => `<span>${o.label} &nbsp; ${entry.progress[o.id]}/${o.count}</span>`).join('')}</div>`).join('') : '<div class="ff-empty">No active quests.</div>'}`;
        } else {
            panel.innerHTML = `<h2>SYSTEM</h2><div class="ff-system-actions"><button id="ff-save-now">SAVE GAME</button><button id="ff-close-menu">RETURN TO STREET</button></div><div class="ff-info-box"><b>MOVE</b><span>WASD / Arrows / Joystick</span><b>LIGHT</b><span>Z / B</span><b>HEAVY</b><span>X</span><b>JUMP</b><span>Space / A</span><b>MENU</b><span>Esc / Pause</span></div><div class="ff-save-note" id="ff-save-note">Progress is stored on this device.</div>`;
            const saveBtn = panel.querySelector('#ff-save-now');
            const closeBtn = panel.querySelector('#ff-close-menu');
            const save = e => { e.preventDefault(); saveSystem.save(p); panel.querySelector('#ff-save-note').textContent = '✓ GAME SAVED'; };
            saveBtn?.addEventListener('click', save);
            saveBtn?.addEventListener('touchstart', save, { passive: false });
            closeBtn?.addEventListener('click', e => { e.preventDefault(); this.hide(); });
            closeBtn?.addEventListener('touchstart', e => { e.preventDefault(); this.hide(); }, { passive: false });
        }
    }

    stat(name, value, desc) {
        return `<div class="ff-stat"><span>${name}</span><strong>${value}</strong><small>${desc}</small></div>`;
    }

    rankFor(level) {
        if (level >= 20) return 'CITY LEGEND';
        if (level >= 10) return 'STREET ACE';
        if (level >= 5) return 'NEIGHBORHOOD HERO';
        return 'ROOKIE';
    }
}

export const characterMenu = new CharacterMenu();
