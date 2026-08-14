export const SKILLS = {
    dash: { id:'dash', name:'Shadow Step', cost:1, desc:'Double-tap feel: hold a direction + Y to burst forward.' },
    uppercut: { id:'uppercut', name:'Rising Dragon', cost:2, desc:'Third light hit launches enemies higher and harder.' },
    guard: { id:'guard', name:'Iron Guard', cost:1, desc:'Hold Y while stationary to reduce incoming damage.' },
    sweep: { id:'sweep', name:'Street Sweep', cost:2, desc:'Heavy attacks knock nearby enemies off their feet.' },
    secondWind: { id:'secondWind', name:'Second Wind', cost:3, desc:'Once per district, survive a KO with 25% HP.' }
};

export class SkillSystem {
    constructor(){ this.jp=0; this.learned=new Set(); }
    has(id){ return this.learned.has(id); }
    gain(amount=1){ this.jp += amount; }
    learn(id){ const s=SKILLS[id]; if(!s||this.has(id)||this.jp<s.cost)return false; this.jp-=s.cost; this.learned.add(id); return true; }
    serialize(){ return { jp:this.jp, learned:[...this.learned] }; }
    hydrate(data={}){ this.jp=data.jp||0; this.learned=new Set(data.learned||[]); }
}
