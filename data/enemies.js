export const ENEMIES = {
    street_punk: {
        id: 'street_punk', name: 'Street Punk',
        hp: 50, atk: 8, def: 2, speed: 120, color: 0x888888,
        gold: [5, 12], xp: 15, width: 40, height: 80, type: 'basic'
    },
    knife_wielder: {
        id: 'knife_wielder', name: 'Knife Wielder',
        hp: 35, atk: 14, def: 1, speed: 160, color: 0xcc2222,
        gold: [10, 20], xp: 25, width: 40, height: 80, type: 'aggressive'
    },
    brawler: {
        id: 'brawler', name: 'Brawler',
        hp: 120, atk: 18, def: 8, speed: 80, color: 0x228b22,
        gold: [20, 35], xp: 40, width: 60, height: 90, type: 'tank'
    },
    viper_soldier: {
        id: 'viper_soldier', name: 'Viper Soldier',
        hp: 80, atk: 20, def: 6, speed: 140, color: 0x333333,
        gold: [25, 50], xp: 60, width: 45, height: 85, type: 'elite'
    },
    king_viper: {
        id: 'king_viper', name: 'KING VIPER',
        hp: 600, atk: 30, def: 12, speed: 100, color: 0xffffff,
        gold: [200, 200], xp: 300, width: 50, height: 90, type: 'boss'
    }
};