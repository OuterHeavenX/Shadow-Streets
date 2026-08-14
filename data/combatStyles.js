export const COMBAT_STYLES = {
    street_brawler: {
        id: 'street_brawler', name: 'Street Brawler',
        desc: 'Alex\'s default style. Balanced punches and kicks.',
        lightMult: 1.0, heavyMult: 2.5, speedMult: 1.0,
        unlockedByDefault: true
    },
    tiger_fist: {
        id: 'tiger_fist', name: 'Tiger Fist',
        desc: 'Sensei Kwan\'s aggressive style. Hits harder, but slower.',
        lightMult: 1.3, heavyMult: 3.2, speedMult: 0.85,
        unlock: 'Defeat King Viper and train with Sensei Kwan.'
    },
    shadow_step: {
        id: 'shadow_step', name: 'Shadow Step',
        desc: 'Fast, evasive strikes. Lighter hits but blinding speed.',
        lightMult: 0.8, heavyMult: 2.0, speedMult: 1.25,
        unlock: 'Rumored to be taught somewhere in The Docks.'
    }
};
