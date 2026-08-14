export const DISTRICTS = {
    neon_alley: {
        id: 'neon_alley',
        name: 'Neon Alley',
        width: 8000,
        height: 600,
        groundY: 500,
        zones: [
            { id: 'start', start: 0, end: 1200, spawns: [], npcs: ['terry'] },
            { id: 'gang_turf', start: 1200, end: 2800, spawns: ['street_punk', 'knife_wielder'] },
            { id: 'restaurant', start: 2800, end: 4200, spawns: [], npcs: ['old_mama'] },
            { id: 'dojo', start: 4200, end: 5200, spawns: [], npcs: ['sensei'] },
            { id: 'hq', start: 5200, end: 7200, spawns: ['brawler', 'viper_soldier'] },
            { id: 'boss', start: 7200, end: 8000, spawns: ['king_viper'] }
        ]
    }
};