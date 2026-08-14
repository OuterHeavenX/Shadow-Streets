import { QUESTS } from '../../data/quests.js';
import { events } from '../core/events.js';
import { ui } from '../ui/ui.js';

export class QuestSystem {
    constructor() {
        this.active = {};   // id -> { quest, progress: { objectiveId: n } }
        this.completed = [];
        this.player = null;
        this.killLog = {}; // enemyId -> total kills, so late-activating quests get credit
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
        // Credit kills that happened before the quest activated (e.g. boss
        // defeated early) so the chain can never dead-end.
        quest.objectives.forEach(o => {
            let prior = 0;
            if (o.type === 'kill') {
                prior = o.targets.reduce((sum, t) => sum + (this.killLog[t] || 0), 0);
            }
            progress[o.id] = Math.min(prior, o.count);
        });
        const entry = { quest, progress };
        this.active[questId] = entry;
        ui.showDialogue('NEW QUEST', `${quest.name} — ${quest.desc}`);
        ui.updateQuestTracker(this);
        this.checkComplete(entry);
    }

    onKill(enemyId) {
        this.killLog[enemyId] = (this.killLog[enemyId] || 0) + 1;
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

        ui.updateQuestTracker(this);

        // Chain to next quest immediately — no delay window where kills could be missed
        for (const q of Object.values(QUESTS)) {
            if (q.trigger.type === 'quest_complete' && q.trigger.quest === quest.id) {
                this.activate(q.id);
            }
        }
    }
}

export const questSystem = new QuestSystem();
