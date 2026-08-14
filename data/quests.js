export const QUESTS = {
    clean_the_streets: {
        id: 'clean_the_streets',
        name: 'Clean the Streets',
        desc: 'Terry says Viper thugs are shaking down shops in Neon Alley. Take out 5 gang members.',
        trigger: { type: 'auto' },
        objectives: [
            { id: 'kill_thugs', type: 'kill', targets: ['street_punk', 'knife_wielder', 'brawler', 'viper_soldier'], count: 5, label: 'Defeat gang members' }
        ],
        rewards: { money: 75, xp: 60 },
        next: 'fall_of_the_king'
    },
    fall_of_the_king: {
        id: 'fall_of_the_king',
        name: 'Fall of the King',
        desc: 'The Vipers won\'t stop while King Viper runs the alley. Fight your way to his HQ and take him down.',
        trigger: { type: 'quest_complete', quest: 'clean_the_streets' },
        objectives: [
            { id: 'kill_king', type: 'kill', targets: ['king_viper'], count: 1, label: 'Defeat KING VIPER' }
        ],
        rewards: { money: 400, xp: 250 }
    }
};
