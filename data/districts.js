export const DISTRICTS = {
    neon_alley: {
        id: 'neon_alley',
        name: 'Neon Alley',
        width: 8000,
        height: 600,
        groundY: 500,
        streetTop: 345,
        streetBottom: 545,
        theme: 'city',
        zones: [
            { id: 'start', start: 0, end: 1200, spawns: [], npcs: ['terry'] },
            { id: 'gang_turf', start: 1200, end: 2800, spawns: ['street_punk', 'knife_wielder'] },
            { id: 'restaurant', start: 2800, end: 4200, spawns: [], npcs: ['old_mama'] },
            { id: 'dojo', start: 4200, end: 5200, spawns: [], npcs: ['sensei'] },
            { id: 'hq', start: 5200, end: 7200, spawns: ['brawler', 'viper_soldier'] },
            { id: 'boss', start: 7200, end: 8000, spawns: ['king_viper'] }
        ]
    },
    the_docks: {
        id: 'the_docks',
        name: 'The Docks',
        width: 8000,
        height: 600,
        groundY: 500,
        streetTop: 345,
        streetBottom: 545,
        theme: 'harbor',
        zones: [
            { id: 'gate', start: 0, end: 1000, spawns: [], npcs: ['salty_joe'] },
            { id: 'container_yard', start: 1000, end: 2800, spawns: ['dock_thug', 'harpoon_grunt'] },
            { id: 'fish_market', start: 2800, end: 4000, spawns: [], npcs: ['marina'] },
            { id: 'warehouse_row', start: 4000, end: 5600, spawns: ['dock_thug', 'chain_swinger'] },
            { id: 'pier', start: 5600, end: 7200, spawns: ['harpoon_grunt', 'chain_swinger'] },
            { id: 'miniboss', start: 7200, end: 8000, spawns: ['harbor_shark'] }
        ]
    }
};
