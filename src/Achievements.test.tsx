import { getAchievements, addAchievement, defaultAchievements } from './Achievements';

describe('Achievements', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('Add and retrieve achievements', () => {
        const achievement = defaultAchievements[0];
        addAchievement(achievement.id);

        const achievements = getAchievements();
        expect(achievements).toContainEqual(achievement);
    });

    test('Avoid duplicate achievements', () => {
        const achievement = defaultAchievements[0];
        addAchievement(achievement.id);
        addAchievement(achievement.id);

        const achievements = getAchievements();
        expect(achievements.length).toBe(1);
    });
});
