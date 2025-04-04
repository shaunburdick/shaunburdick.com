export const LS_KEY_ACHIEVEMENTS = 'achievements';

export interface Achievement {
    id: string;
    title: string;
    description: string;
}

// Use `as const` to make `defaultAchievements` a readonly array with literal types
export const defaultAchievements = [
    { id: 'first_command', title: 'First Command', description: 'Run your first command in the console.' },
    { id: 'whoami_used', title: 'Who Am I?', description: 'Use the whoami command.' },
] as const;

// Create a union type for valid achievement IDs
export type AchievementId = (typeof defaultAchievements)[number]['id'];

export const getAchievements = (): Achievement[] => {
    const stored = localStorage.getItem(LS_KEY_ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : [];
};

export const addAchievement = (achievementId: AchievementId) => {
    const achievements = getAchievements();
    if (!achievements.find(a => a.id === achievementId)) {
        const achievement = defaultAchievements.find(a => a.id === achievementId);
        if (achievement) {
            const updated = [...achievements, achievement];
            localStorage.setItem(LS_KEY_ACHIEVEMENTS, JSON.stringify(updated));
        }
    }
};
