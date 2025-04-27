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
    give_you_up: { title: 'Never Gonna Give You Up', description: 'Never gonna let you down.' },
    old_spice_mario: { title: 'Old Spice Mario', description: 'You know what to do.' },
    whoami_used: { title: 'Who Am I?', description: 'Use the whoami command.' },
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
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
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
    const setValue = (value: T): void => {
        try {
            setStoredValue(value);
            localStorage.setItem(key, JSON.stringify(value));
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
        if (!hasAchievement(achievementId) && achievementId in coreAchievements) {
            const achievement = {
                id: achievementId,
                unlockedAt: new Date().toISOString(),
                ...coreAchievements[achievementId]
            };
            setAchievements([
                ...achievements,
                achievement
            ]);

            achievementEvent.dispatch(achievement);
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
