import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
    coreAchievements,
    AchievementProvider,
    useAchievements
} from '../../containers/AchievementProvider';

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

    test('handles concurrent achievement unlocks atomically', async () => {
        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        // Simulate multiple concurrent achievement unlocks
        await act(async () => {
            // Create an array of achievement unlock promises
            const unlockPromises = [
                'first_command',
                'who_are_you',
                'accept_cookies',
                'secret_command'
            ].map(id => Promise.resolve().then(() => {
                return result.current.unlockAchievement(id as keyof typeof coreAchievements);
            }));

            // Execute all promises concurrently
            await Promise.all(unlockPromises);
        });

        // All achievements should have been correctly added
        expect(result.current.achievements.length).toBe(4);
        expect(result.current.hasAchievement('first_command')).toBe(true);
        expect(result.current.hasAchievement('who_are_you')).toBe(true);
        expect(result.current.hasAchievement('accept_cookies')).toBe(true);
        expect(result.current.hasAchievement('secret_command')).toBe(true);

        // Verify localStorage was updated correctly with all achievements
        const storedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        expect(storedAchievements.length).toBe(4);

        // Try unlocking the same achievements again
        await act(async () => {
            result.current.unlockAchievement('first_command');
            result.current.unlockAchievement('who_are_you');
        });

        // No duplicates should be added
        expect(result.current.achievements.length).toBe(4);
    });

    test('useAchievements throws error when used outside provider', () => {
        // Test the error boundary at line 113
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { /* no-op */ });

        expect(() => {
            renderHook(() => useAchievements());
        }).toThrow('useAchievements must be used within an AchievementProvider');

        consoleSpy.mockRestore();
    });

    test('localStorage error handling in getStoredValue', () => {
        // Test localStorage error handling
        const originalGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = jest.fn(() => {
            throw new Error('localStorage error');
        });

        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        // Should return empty array as initial value when localStorage fails
        expect(result.current.achievements).toEqual([]);

        Storage.prototype.getItem = originalGetItem;
    });

    test('localStorage error handling in setValue', () => {
        // Test localStorage.setItem error handling
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = jest.fn(() => {
            throw new Error('localStorage setItem error');
        });

        const { result } = renderHook(() => useAchievements(), { wrapper: TestWrapper });

        // Should not throw error when localStorage.setItem fails
        expect(() => {
            act(() => {
                result.current.unlockAchievement('first_command');
            });
        }).not.toThrow();

        Storage.prototype.setItem = originalSetItem;
    });
});
