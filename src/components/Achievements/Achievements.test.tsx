import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
    coreAchievements,
    AchievementProvider,
    useAchievements
} from './Achievements';

// Wrapper component for testing hooks
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AchievementProvider>
        {children}
    </AchievementProvider>
);

describe('Achievements React Hooks', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('useAchievements hook unlocks achievements correctly', () => {
        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        // Initially no achievements
        expect(result.current.achievements).toEqual([]);

        // Unlock an achievement
        act(() => {
            result.current.unlockAchievement('first_command');
        });

        // Check achievement was added
        expect(result.current.achievements.length).toBe(1);
        expect(result.current.achievements[0].id).toBe('first_command');
        expect(result.current.achievements[0].title).toBe(coreAchievements.first_command.title);
    });

    test('useAchievements prevents duplicate achievements', () => {
        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        act(() => {
            result.current.unlockAchievement('first_command');
            result.current.unlockAchievement('first_command');
        });

        expect(result.current.achievements.length).toBe(1);
    });

    test('useAchievements hasAchievement works correctly', () => {
        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        expect(result.current.hasAchievement('first_command')).toBe(false);

        act(() => {
            result.current.unlockAchievement('first_command');
        });

        expect(result.current.hasAchievement('first_command')).toBe(true);
    });

    test('useAchievements resetAchievements works correctly', () => {
        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        // Add multiple achievements
        act(() => {
            result.current.unlockAchievement('first_command');
        });

        act(() => {
            result.current.unlockAchievement('who_are_you');
        });

        // Verify we have both achievements
        expect(result.current.achievements.length).toBe(2);
        expect(result.current.hasAchievement('first_command')).toBe(true);
        expect(result.current.hasAchievement('who_are_you')).toBe(true);

        // Reset achievements
        act(() => {
            result.current.resetAchievements();
        });

        // Verify all achievements are removed
        expect(result.current.achievements.length).toBe(0);
        expect(result.current.hasAchievement('first_command')).toBe(false);
        expect(result.current.hasAchievement('who_are_you')).toBe(false);
    });

    test('AchievementProvider persists achievements to localStorage', () => {
        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        act(() => {
            result.current.unlockAchievement('first_command');
        });

        // Check localStorage was updated
        const storedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        expect(storedAchievements.length).toBe(1);
        expect(storedAchievements[0].id).toBe('first_command');
    });
});
