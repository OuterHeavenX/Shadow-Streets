import { QUESTS } from '../../data/quests.js';
import { events } from '../core/events.js';
import { ui } from '../ui/ui.js';

export class QuestSystem {
    constructor() {
        this.active = {};   // id -> { quest, progress: { objectiveId: n } }
        this.completed = [];
        this.player = null;
    }

    start(player) {
        this.player = player;
        events.on('enemyKilled', enemyId => this.onKill(enemyId));

        // Auto-start quests
        for (const quest of Object.values(QUESTS)) {
            if (quest.trigger.type === 'auto') this.activate(quest.id);
        }
    }

    activate(questId) {
        if (this.active[questId] || this.completed.includes(questId)) return;
        const quest = QUESTS[questId];
        if (!quest) return;
        const progress = {};
        quest.objectives.forEach(o => progress[o.id] = 0);
        this.active[questId] = { quest, progress };
        ui.showDialogue('NEW QUEST', `${quest.name} — ${quest.desc}`);
        ui.updateQuestTracker(this);
    }

    onKill(enemyId) {
        for (const entry of Object.values(this.active)) {
            let changed = false;
            for (const obj of entry.quest.objectives) {
                if (obj.type === 'kill' && obj.targets.includes(enemyId) && entry.progress[obj.id] < obj.count) {
                    entry.progress[obj.id]++;
                    changed = true;
                }
            }
            if (changed) this.checkComplete(entry);
        }
        ui.updateQuestTracker(this);
    }

    checkComplete(entry) {
        const done = entry.quest.objectives.every(o => entry.progress[o.id] >= o.count);
        if (!done) return;

        const quest = entry.quest;
        delete this.active[quest.id];
        this.completed.push(quest.id);

        const r = quest.rewards;
        if (r.money) this.player.gainMoney(r.money);
        if (r.xp) this.player.gainXp(r.xp);
        ui.showDialogue('QUEST COMPLETE', `${quest.name}! Reward: $${r.money} + ${r.xp} XP`);

        // Chain to next quest
        for (const q of Object.values(QUESTS)) {
            if (q.trigger.type === 'quest_complete' && q.trigger.quest === quest.id) {
                setTimeout(() => this.activate(q.id), 4500);
            }
        }
        ui.updateQuestTracker(this);
    }
}

export const questSystem = new QuestSystem();
