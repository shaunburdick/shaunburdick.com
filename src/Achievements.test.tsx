import { addAchievement, getAchievements, coreAchievements } from './Achievements';

describe('Achievements', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('Add and retrieve achievements', () => {
        const achievementId = 'first_command';
        const achievement = { id: achievementId, ...coreAchievements[achievementId], unlockedAt: expect.any(String) };

        addAchievement(achievementId);

        const achievements = getAchievements();
        expect(achievements).toContainEqual(achievement);
    });

    test('Avoid duplicate achievements', () => {
        const achievementId = 'first_command';
        const achievement = { id: achievementId, ...coreAchievements[achievementId], unlockedAt: expect.any(String) };
        addAchievement(achievementId);
        addAchievement(achievementId);

        const achievements = getAchievements();
        expect(achievements.length).toBe(1);
        expect(achievements).toContainEqual(achievement);
    });

    test('addAchievement triggers notification', () => {
        const mockNotification = jest.fn();
        addAchievement('first_command', mockNotification);

        expect(mockNotification).toHaveBeenCalledWith('Achievement Unlocked: First Command');
    });

    test('addAchievement does not trigger notification for duplicate', () => {
        const mockNotification = jest.fn();
        addAchievement('first_command', mockNotification);
        addAchievement('first_command', mockNotification);

        expect(mockNotification).toHaveBeenCalledTimes(1);
    });
});
