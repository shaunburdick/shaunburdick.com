import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useEvent } from '../../hooks';

export const LS_KEY_ACHIEVEMENTS = 'achievements';

export interface AchievementUnlocked {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
}

export const coreAchievements = {
    accept_cookies: { title: 'Accept Cookies', description: 'Accept the cookies.' },
    first_command: { title: 'First Command', description: 'Run your first command in the console.' },
    old_spice_mario: { title: 'Old Spice Mario', description: 'You know what to do.' },
    rick_rolled: { title: 'Never Gonna Give You Up', description: 'Never gonna let you down.' },
    secret_command: { title: 'Secret Command', description: 'You found the secret command!' },
    who_are_you: { title: 'Who Am I?', description: 'Use the whoami command.' },
} as const;

export type AchievementId = keyof typeof coreAchievements;

export interface AchievementContextType {
    achievements: AchievementUnlocked[];
    unlockAchievement: (achievementId: AchievementId) => void;
    hasAchievement: (achievementId: AchievementId) => boolean;
    resetAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// Custom hook to safely access localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
    // Get from localStorage on initial render
    const getStoredValue = (): T => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(getStoredValue);

    // Return a wrapped version that persists the new value to localStorage
    const setValue = (value: T | ((prev: T) => T)): void => {
        try {
            // Handle both direct values and functional updates
            const valueToStore = value instanceof Function ? value(getStoredValue()) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
            // Silent fail on localStorage errors
        }
    };

    return [storedValue, setValue];
};

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [achievements, setAchievements] = useLocalStorage<AchievementUnlocked[]>(LS_KEY_ACHIEVEMENTS, []);
    const achievementEvent = useEvent('onAchievement');

    const hasAchievement = (achievementId: AchievementId): boolean => {
        return achievements.some(a => a.id === achievementId);
    };

    const unlockAchievement = (achievementId: AchievementId): void => {
        if (achievementId in coreAchievements) {
            // Use functional update pattern to avoid race conditions
            setAchievements((currentAchievements) => {
                // Check again if achievement exists in the latest state
                if (currentAchievements.some(a => a.id === achievementId)) {
                    return currentAchievements; // Achievement already exists
                }

                const achievement = {
                    id: achievementId,
                    unlockedAt: new Date().toISOString(),
                    ...coreAchievements[achievementId]
                };

                // Dispatch event for the new achievement
                achievementEvent.dispatch(achievement);

                // Return new array with the added achievement
                return [...currentAchievements, achievement];
            });
        }
    };

    const resetAchievements = (): void => {
        setAchievements([]);
    };

    return (
        <AchievementContext.Provider value={{
            achievements,
            unlockAchievement,
            hasAchievement,
            resetAchievements
        }}>
            {children}
        </AchievementContext.Provider>
    );
};

export const useAchievements = (): AchievementContextType => {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
};
