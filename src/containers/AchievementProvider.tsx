import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useEvent } from '../hooks/useEvent';
import { useLocalStorage } from '../hooks/useLocalStorage';

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

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [achievements, setAchievements] = useLocalStorage<AchievementUnlocked[]>(LS_KEY_ACHIEVEMENTS, []);
    const achievementEvent = useEvent('onAchievement');

    // Track which achievement IDs we've already dispatched events for
    // Initialize with existing achievements to prevent re-dispatching on mount
    const dispatchedIdsRef = useRef<Set<string>>(new Set(achievements.map(a => a.id)));

    // When achievements change, dispatch events for new ones
    useEffect(() => {
        for (const achievement of achievements) {
            if (!dispatchedIdsRef.current.has(achievement.id)) {
                dispatchedIdsRef.current.add(achievement.id);
                achievementEvent.dispatch(achievement);
            }
        }
    }, [achievements, achievementEvent]);

    const hasAchievement = (achievementId: AchievementId): boolean => {
        return achievements.some(a => a.id === achievementId);
    };

    const unlockAchievement = (achievementId: AchievementId): void => {
        if (achievementId in coreAchievements) {
            // Use functional update pattern to avoid race conditions
            setAchievements((currentAchievements) => {
                // Check if achievement already exists
                if (currentAchievements.some(a => a.id === achievementId)) {
                    return currentAchievements;
                }

                const achievement = {
                    id: achievementId,
                    unlockedAt: new Date().toISOString(),
                    ...coreAchievements[achievementId]
                };

                // Just return the new array - useEffect will handle dispatching
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
