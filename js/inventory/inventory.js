import { FOOD } from '../../data/food.js';
import { ITEMS } from '../../data/items.js';
import { ui } from '../ui/ui.js';
import { audio } from '../audio/audio.js';

export class Inventory {
    constructor() {
        this.equipment = {}; // slot -> item id
        this.buffs = []; // { stat, amount, remaining }
    }

    // ---- Buying ----

    buyFood(player, foodId) {
        const food = FOOD[foodId];
        if (!food) return { ok: false, reason: 'Unknown item.' };
        if (player.money < food.price) return { ok: false, reason: 'Not enough cash!' };

        player.money -= food.price;
        this.consumeFood(player, food);
        audio.playCoin();
        return { ok: true };
    }

    consumeFood(player, food) {
        if (food.hp > 0) {
            const healed = Math.min(food.hp, player.maxHp - player.hp);
            player.hp = Math.min(player.maxHp, player.hp + food.hp);
            if (healed > 0) {
                ui.spawnFloatingText(`+${healed} HP`, player.x, player.y - 30, '#33ff66');
            }
        }
        const buffs = food.buffs || (food.buff ? [food.buff] : []);
        buffs.forEach(b => this.applyBuff(player, b));
    }

    applyBuff(player, buff) {
        // Refresh existing buff on the same stat instead of stacking
        const existing = this.buffs.find(b => b.stat === buff.stat);
        if (existing) {
            player.stats[existing.stat] -= existing.amount;
            this.buffs = this.buffs.filter(b => b !== existing);
        }
        player.stats[buff.stat] += buff.amount;
        this.buffs.push({ stat: buff.stat, amount: buff.amount, remaining: buff.duration });
        ui.spawnFloatingText(`+${buff.amount} ${buff.stat.toUpperCase()}`, player.x, player.y - 50, '#00ffff');
    }

    buyItem(player, itemId) {
        const item = ITEMS[itemId];
        if (!item) return { ok: false, reason: 'Unknown item.' };
        if (this.equipment[item.slot] === item.id) return { ok: false, reason: 'Already equipped.' };
        if (player.money < item.price) return { ok: false, reason: 'Not enough cash!' };

        player.money -= item.price;
        this.equip(player, item);
        audio.playCoin();
        return { ok: true };
    }

    equip(player, item) {
        // Remove stats from the previously equipped item in this slot
        const prevId = this.equipment[item.slot];
        if (prevId && ITEMS[prevId]) {
            const prev = ITEMS[prevId];
            for (const [stat, amt] of Object.entries(prev.stats)) {
                player.stats[stat] -= amt;
            }
        }
        this.equipment[item.slot] = item.id;
        for (const [stat, amt] of Object.entries(item.stats)) {
            player.stats[stat] += amt;
        }
        ui.spawnFloatingText(`EQUIPPED ${item.name.toUpperCase()}`, player.x, player.y - 50, '#ffaa00');
    }

    isEquipped(itemId) {
        return Object.values(this.equipment).includes(itemId);
    }

    update(dt, player) {
        for (const buff of this.buffs) {
            buff.remaining -= dt;
            if (buff.remaining <= 0) {
                player.stats[buff.stat] -= buff.amount;
            }
        }
        this.buffs = this.buffs.filter(b => b.remaining > 0);
    }
}
