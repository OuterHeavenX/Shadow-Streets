// Weapon definitions. Each grants bonus range/damage while held and breaks
// after `durability` hits. Colors are used for both the ground pickup and the
// held weapon in the player sprite frames.
export const WEAPONS = {
    pipe: {
        id: 'pipe', name: 'Pipe',
        bonusRange: 30, bonusDamage: 6, durability: 10,
        color: 0xbbbbbb, len: 40, thick: 6
    },
    bat: {
        id: 'bat', name: 'Bat',
        bonusRange: 36, bonusDamage: 9, durability: 12,
        color: 0x9c6b3c, len: 46, thick: 7
    },
    knife: {
        id: 'knife', name: 'Knife',
        bonusRange: 14, bonusDamage: 12, durability: 8,
        color: 0xdddddd, len: 22, thick: 5
    }
};

// Weighted drop table for defeated enemies.
export const WEAPON_DROP_TABLE = ['pipe', 'bat', 'knife'];

// Kept for backwards-compatibility with any existing imports.
export const WeaponRegistry = WEAPONS;
