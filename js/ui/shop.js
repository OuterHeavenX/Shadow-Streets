import { FOOD } from '../../data/food.js';
import { ITEMS } from '../../data/items.js';
import { saveSystem } from '../save/save.js';
import { input } from '../core/input.js';

export class ShopUI {
    constructor() {
        this.open = false;
        this.player = null;
        this.inventory = null;
        this.type = null;
        this.title = '';
        this.phase = 'interior';
        this.roomX = 22;
        this.roomY = 72;
    }

    init() {
        const el = document.createElement('div');
        el.id = 'shop-menu';
        el.className = 'shop-menu hidden';
        el.innerHTML = `
            <div class="shop-interior">
                <div class="shop-interior-sign" id="shop-interior-sign">SHOP</div>
                <div class="shop-back-window"></div>
                <div class="shop-shelves"><i></i><i></i><i></i><i></i><i></i></div>
                <div class="shop-side-shelf"><i></i><i></i><i></i></div>
                <div class="shop-clerk"><div class="clerk-head"></div><div class="clerk-body"></div></div>
                <div class="shop-counter"></div>
                <div class="shop-stool stool-one"></div>
                <div class="shop-stool stool-two"></div>
                <div class="shop-steam steam-one"></div>
                <div class="shop-steam steam-two"></div>
                <div class="shop-player-avatar" id="shop-player-avatar"><i class="avatar-head"></i><i class="avatar-body"></i><i class="avatar-legs"></i></div>
                <div class="shop-room-prompt" id="shop-room-prompt">Walk to the counter • ENTER / Y to talk</div>
                <button class="shop-room-exit" id="shop-room-exit">DOOR / EXIT</button>
            </div>
            <div class="shop-panel catalog-hidden" id="shop-panel">
                <div class="shop-header">
                    <span class="shop-title" id="shop-title">SHOP</span>
                    <span class="shop-money" id="shop-money">$0</span>
                    <button class="shop-close" id="shop-close">BACK</button>
                </div>
                <div class="shop-welcome" id="shop-welcome">Welcome in. Take a look.</div>
                <div class="shop-items" id="shop-items"></div>
            </div>
        `;
        document.getElementById('ui-layer').appendChild(el);

        const closeCatalog = e => { e.preventDefault(); this.closeCatalog(); };
        document.getElementById('shop-close').addEventListener('click', closeCatalog);
        document.getElementById('shop-close').addEventListener('touchstart', closeCatalog, { passive: false });

        const leave = e => { e.preventDefault(); this.close(); };
        document.getElementById('shop-room-exit').addEventListener('click', leave);
        document.getElementById('shop-room-exit').addEventListener('touchstart', leave, { passive: false });
    }

    openShop(type, title, player, inventory) {
        if (this.open) return;
        this.open = true;
        this.phase = 'interior';
        this.type = type;
        this.title = title;
        this.player = player;
        this.inventory = inventory;
        this.roomX = 20;
        this.roomY = 74;

        document.getElementById('shop-title').innerText = title;
        document.getElementById('shop-interior-sign').innerText = title;
        document.getElementById('shop-welcome').innerText = type === 'food'
            ? 'Hot food, full health, stronger fists.'
            : 'Street gear for people who plan on surviving.';
        document.getElementById('shop-menu').classList.remove('hidden');
        document.getElementById('shop-menu').classList.toggle('food-interior', type === 'food');
        document.getElementById('shop-menu').classList.toggle('gear-interior', type !== 'food');
        document.getElementById('shop-panel').classList.add('catalog-hidden');
        document.getElementById('touch-controls')?.classList.add('shop-mode');
        this.updateAvatar();
        this.render();
    }

    update(dt) {
        if (!this.open || this.phase !== 'interior') return;

        const ax = input.getAxisX();
        const ay = input.getAxisY();
        const speed = 34;
        this.roomX += ax * speed * dt;
        this.roomY += ay * speed * dt;
        this.roomX = Math.max(8, Math.min(66, this.roomX));
        this.roomY = Math.max(48, Math.min(84, this.roomY));
        this.updateAvatar();

        const nearCounter = this.roomX > 48 && this.roomY < 70;
        const prompt = document.getElementById('shop-room-prompt');
        if (prompt) prompt.innerText = nearCounter
            ? 'Talk to the clerk • ENTER / Y'
            : 'Walk to the counter • ENTER / Y to talk';

        if (nearCounter && (input.isJustPressed('Enter') || input.isJustPressed('KeyC') || input.isJustPressed('KeyZ'))) {
            this.openCatalog();
        }
    }

    updateAvatar() {
        const avatar = document.getElementById('shop-player-avatar');
        if (!avatar) return;
        avatar.style.left = `${this.roomX}%`;
        avatar.style.top = `${this.roomY}%`;
    }

    openCatalog() {
        this.phase = 'catalog';
        document.getElementById('shop-panel').classList.remove('catalog-hidden');
        document.getElementById('shop-room-prompt').innerText = 'Browsing stock';
        document.getElementById('touch-controls')?.classList.add('controls-dimmed');
        this.render();
    }

    closeCatalog() {
        if (!this.open) return;
        this.phase = 'interior';
        document.getElementById('shop-panel').classList.add('catalog-hidden');
        document.getElementById('touch-controls')?.classList.remove('controls-dimmed');
        document.getElementById('shop-room-prompt').innerText = 'Walk to the counter • ENTER / Y to talk';
    }

    close() {
        if (!this.open) return;
        this.open = false;
        this.phase = 'interior';
        document.getElementById('shop-menu').classList.add('hidden');
        const controls = document.getElementById('touch-controls');
        controls?.classList.remove('controls-dimmed');
        controls?.classList.remove('shop-mode');
        if (this.player) saveSystem.save(this.player);
        this._lastCloseAt = performance.now();
    }

    canReopen() {
        return !this._lastCloseAt || performance.now() - this._lastCloseAt > 700;
    }

    render() {
        if (!this.open) return;
        document.getElementById('shop-money').innerText = `$${this.player.money}`;
        const catalog = this.type === 'food' ? FOOD : ITEMS;
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        for (const item of Object.values(catalog)) {
            const equipped = this.type === 'items' && this.inventory.isEquipped(item.id);
            const affordable = this.player.money >= item.price;
            const row = document.createElement('div');
            row.className = 'shop-item';
            row.innerHTML = `
                <span class="shop-item-icon">${item.icon}</span>
                <span class="shop-item-info">
                    <span class="shop-item-name">${item.name}</span>
                    <span class="shop-item-desc">${item.desc}</span>
                </span>
                <button class="shop-buy-btn ${equipped ? 'equipped' : ''} ${!affordable && !equipped ? 'poor' : ''}">
                    ${equipped ? 'OWNED' : '$' + item.price}
                </button>
            `;
            const btn = row.querySelector('.shop-buy-btn');
            const buy = e => {
                e.preventDefault();
                const result = this.type === 'food'
                    ? this.inventory.buyFood(this.player, item.id)
                    : this.inventory.buyItem(this.player, item.id);
                if (!result.ok) {
                    btn.innerText = result.reason === 'Not enough cash!' ? 'NO $' : btn.innerText;
                    btn.classList.add('shake');
                    setTimeout(() => { btn.classList.remove('shake'); this.render(); }, 400);
                } else {
                    saveSystem.save(this.player);
                    this.render();
                }
            };
            btn.addEventListener('click', buy);
            btn.addEventListener('touchstart', buy, { passive: false });
            container.appendChild(row);
        }
    }
}

export const shop = new ShopUI();
