export const LS_KEY_ACHIEVEMENTS = 'achievements';

export interface AchievementUnlocked {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
}

// Use `as const` to make `defaultAchievements` a readonly array with literal types
export const coreAchievements = {
    accept_cookies: { title: 'Accept Cookies', description: 'Accept the cookies.' },
    first_command: { title: 'First Command', description: 'Run your first command in the console.' },
    give_you_up: { title: 'Never Gonna Give You Up', description: 'Never gonna let you down.' },
    old_spice_mario: { title: 'Old Spice Mario', description: 'You know what to do.' },
    whoami_used: { title: 'Who Am I?', description: 'Use the whoami command.' },
} as const;

// Create a union type for valid achievement IDs
export type AchievementId = keyof typeof coreAchievements;

export const getAchievements = (): AchievementUnlocked[] => {
    const stored = localStorage.getItem(LS_KEY_ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : [];
};

export const addAchievement = (achievementId: AchievementId, onUnlock?: (message: string) => void) => {
    const achievements = getAchievements();
    if (!achievements.find(a => a.id === achievementId)) {
        if (achievementId in coreAchievements) {
            const achievement = coreAchievements[achievementId];
            const updated: AchievementUnlocked[] = [
                ...achievements,
                { id: achievementId, unlockedAt: new Date().toISOString(), ...achievement }
            ];
            localStorage.setItem(LS_KEY_ACHIEVEMENTS, JSON.stringify(updated));

            // Trigger the callback with the achievement message
            if (onUnlock) {
                onUnlock(`Achievement Unlocked: ${achievement.title}`);
            }
        }
    }
};
