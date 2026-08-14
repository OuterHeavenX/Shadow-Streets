import { FOOD } from '../../data/food.js';
import { ITEMS } from '../../data/items.js';

export class ShopUI {
    constructor() {
        this.open = false;
        this.player = null;
        this.inventory = null;
    }

    init() {
        const el = document.createElement('div');
        el.id = 'shop-menu';
        el.className = 'shop-menu hidden';
        el.innerHTML = `
            <div class="shop-header">
                <span class="shop-title" id="shop-title">SHOP</span>
                <span class="shop-money" id="shop-money">$0</span>
                <button class="shop-close" id="shop-close">✕</button>
            </div>
            <div class="shop-items" id="shop-items"></div>
        `;
        document.getElementById('ui-layer').appendChild(el);
        document.getElementById('shop-close').addEventListener('click', () => this.close());
        document.getElementById('shop-close').addEventListener('touchstart', e => { e.preventDefault(); this.close(); });
    }

    openShop(type, title, player, inventory) {
        this.open = true;
        this.type = type;
        this.player = player;
        this.inventory = inventory;
        document.getElementById('shop-title').innerText = title;
        document.getElementById('shop-menu').classList.remove('hidden');
        this.render();
    }

    close() {
        this.open = false;
        document.getElementById('shop-menu').classList.add('hidden');
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
                    this.render();
                }
            };
            btn.addEventListener('click', buy);
            btn.addEventListener('touchstart', buy);
            container.appendChild(row);
        }
    }
}

export const shop = new ShopUI();
