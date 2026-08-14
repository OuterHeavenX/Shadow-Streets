export const FOOD = {
    rice_ball: {
        id: 'rice_ball', name: 'Rice Ball', icon: '🍙', price: 8,
        desc: 'Restores 20 HP.',
        hp: 20
    },
    dumplings: {
        id: 'dumplings', name: 'Dumplings', icon: '🥟', price: 15,
        desc: 'Restores 40 HP.',
        hp: 40
    },
    ramen: {
        id: 'ramen', name: 'Ramen Bowl', icon: '🍜', price: 25,
        desc: 'Restores 75 HP. Old Mama\'s specialty.',
        hp: 75
    },
    deluxe_ramen: {
        id: 'deluxe_ramen', name: 'Deluxe Ramen', icon: '🍲', price: 60,
        desc: 'Fully restores HP.',
        hp: 9999
    },
    skewers: {
        id: 'skewers', name: 'Yakitori Skewers', icon: '🍢', price: 20,
        desc: 'Restores 30 HP. +5 STR for 60s.',
        hp: 30, buff: { stat: 'str', amount: 5, duration: 60 }
    },
    spicy_noodles: {
        id: 'spicy_noodles', name: 'Spicy Noodles', icon: '🌶️', price: 30,
        desc: 'Restores 25 HP. +8 STR for 45s.',
        hp: 25, buff: { stat: 'str', amount: 8, duration: 45 }
    },
    green_tea: {
        id: 'green_tea', name: 'Green Tea', icon: '🍵', price: 12,
        desc: 'Restores 10 HP. +5 AGI for 60s.',
        hp: 10, buff: { stat: 'agi', amount: 5, duration: 60 }
    },
    energy_drink: {
        id: 'energy_drink', name: 'Neon Energy', icon: '🥤', price: 18,
        desc: '+10 AGI for 30s. Move faster.',
        hp: 0, buff: { stat: 'agi', amount: 10, duration: 30 }
    },
    tofu_soup: {
        id: 'tofu_soup', name: 'Tofu Soup', icon: '🥣', price: 22,
        desc: 'Restores 35 HP. +5 VIT for 60s.',
        hp: 35, buff: { stat: 'vit', amount: 5, duration: 60 }
    },
    fried_rice: {
        id: 'fried_rice', name: 'Fried Rice', icon: '🍚', price: 28,
        desc: 'Restores 50 HP.',
        hp: 50
    },
    mystery_meat: {
        id: 'mystery_meat', name: 'Mystery Meat', icon: '🍖', price: 5,
        desc: 'Restores 15 HP. Probably fine.',
        hp: 15
    },
    dragon_feast: {
        id: 'dragon_feast', name: 'Dragon Feast', icon: '🐉', price: 100,
        desc: 'Full HP. +10 STR and +10 VIT for 90s.',
        hp: 9999,
        buffs: [
            { stat: 'str', amount: 10, duration: 90 },
            { stat: 'vit', amount: 10, duration: 90 }
        ]
    }
};
