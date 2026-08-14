import { FOOD } from '../../data/food.js';
import { ITEMS } from '../../data/items.js';
import { saveSystem } from '../save/save.js';

export class ShopUI {
    constructor() {
        this.open = false;
        this.player = null;
        this.inventory = null;
        this.type = null;
        this.title = '';
    }

    init() {
        const el = document.createElement('div');
        el.id = 'shop-menu';
        el.className = 'shop-menu hidden';
        el.innerHTML = `
            <div class="shop-interior">
                <div class="shop-interior-sign" id="shop-interior-sign">SHOP</div>
                <div class="shop-shelves"><i></i><i></i><i></i><i></i><i></i></div>
                <div class="shop-clerk"><div class="clerk-head"></div><div class="clerk-body"></div></div>
                <div class="shop-counter"></div>
                <div class="shop-floor-lines"></div>
            </div>
            <div class="shop-panel">
                <div class="shop-header">
                    <span class="shop-title" id="shop-title">SHOP</span>
                    <span class="shop-money" id="shop-money">$0</span>
                    <button class="shop-close" id="shop-close">EXIT</button>
                </div>
                <div class="shop-welcome" id="shop-welcome">Welcome in. Take a look.</div>
                <div class="shop-items" id="shop-items"></div>
            </div>
        `;
        document.getElementById('ui-layer').appendChild(el);
        const close = e => { e.preventDefault(); this.close(); };
        document.getElementById('shop-close').addEventListener('click', close);
        document.getElementById('shop-close').addEventListener('touchstart', close, { passive: false });
    }

    openShop(type, title, player, inventory) {
        if (this.open) return;
        this.open = true;
        this.type = type;
        this.title = title;
        this.player = player;
        this.inventory = inventory;
        document.getElementById('shop-title').innerText = title;
        document.getElementById('shop-interior-sign').innerText = title;
        document.getElementById('shop-welcome').innerText = type === 'food'
            ? 'Hot food, full health, stronger fists.'
            : 'Street gear for people who plan on surviving.';
        document.getElementById('shop-menu').classList.remove('hidden');
        document.getElementById('touch-controls')?.classList.add('controls-dimmed');
        this.render();
    }

    close() {
        if (!this.open) return;
        this.open = false;
        document.getElementById('shop-menu').classList.add('hidden');
        document.getElementById('touch-controls')?.classList.remove('controls-dimmed');
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