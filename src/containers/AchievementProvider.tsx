import React, { createContext, useState, useCallback, use, Dispatch, SetStateAction } from 'react';
import { useEvent } from '../hooks';

/**
 * Alias for achievement identifier string
 */
export type AchievementId = string;

/**
 * Interface for an achievement
 */
export interface Achievement {
    /** Unique identifier for the achievement */
    id: string;
    /** Display title of the achievement */
    title: string;
    /** Description of how to unlock the achievement */
    description: string;
    /** Whether this achievement is a secret */
    secret: boolean;
    /** Emoji to represent this achievement */
    emoji: string;
}

/**
 * An unlocked achievement with timestamp
 */
export interface AchievementUnlocked {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
}

/**
 * Interface for the achievement context value
 */
export interface AchievementContextType {
    /** Array of unlocked achievements */
    achievements: AchievementUnlocked[];
    /** Function to unlock a new achievement */
    unlockAchievement: (achievementId: AchievementId) => void;
    /** Function to check if an achievement is unlocked */
    hasAchievement: (achievementId: AchievementId) => boolean;
    /** Function to reset all achievements */
    resetAchievements: () => void;
}

/**
 * Dictionary of core achievements that can be unlocked
 */
export const coreAchievements: Record<string, Achievement> = {
    first_command: {
        id: 'first_command',
        title: 'First Command',
        description: 'Run your first command on the site',
        secret: true,
        emoji: '🎮'
    },
    rick_rolled: {
        id: 'rick_rolled',
        title: 'Rickrolled',
        description: 'Get rickrolled by the whois command',
        secret: true,
        emoji: '🎵'
    },
    secret_command: {
        id: 'secret_command',
        title: 'Secret Commander',
        description: 'Find a secret command',
        secret: true,
        emoji: '🤫'
    },
    who_are_you: {
        id: 'who_are_you',
        title: 'Who Am I?',
        description: 'Use the whoami command.',
        secret: true,
        emoji: '👤'
    },
    old_spice_mario: {
        id: 'old_spice_mario',
        title: 'Old Spice Mario',
        description: 'Look at the man you could be',
        secret: true,
        emoji: '🧔'
    },
    accept_cookies: {
        id: 'accept_cookies',
        title: 'Cookie Monster',
        description: 'Accept the cookie notice',
        secret: true,
        emoji: '🍪'
    },
    click_all_the_things: {
        id: 'click_all_the_things',
        title: 'Click All The Things',
        description: 'Click many things',
        secret: true,
        emoji: '🖱️'
    }
};

/**
 * Key used to store achievements in localStorage
 */
const STORAGE_KEY = 'achievements';

/**
 * Load achievements from localStorage
 *
 * @returns Array of unlocked achievements
 */
function loadAchievements(): AchievementUnlocked[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as AchievementUnlocked[]) : [];
    } catch {
        return [];
    }
}

/**
 * Save achievements to localStorage
 *
 * @param nextAchievements - Achievements to save
 */
function saveAchievements(nextAchievements: AchievementUnlocked[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAchievements));
    } catch {
        return; // localStorage may be unavailable (e.g., private browsing, test env)
    }
}

/**
 * Type for the achievement event dispatch function
 */
interface AchievementEventDispatch {
    dispatch: (detail: AchievementUnlocked) => void;
}

/**
 * Options for processAchievementUnlock
 */
interface ProcessUnlockOptions {
    achievementId: AchievementId;
    achievementData: Achievement;
    setAchievements: Dispatch<SetStateAction<AchievementUnlocked[]>>;
    achievementEvent: AchievementEventDispatch;
}

/**
 * Process unlocking an achievement: update state, save to localStorage, dispatch event
 */
function processAchievementUnlock({
    achievementId,
    achievementData,
    setAchievements,
    achievementEvent
}: ProcessUnlockOptions): void {
    let wasUnlocked = false;
    let unlockedEntry: AchievementUnlocked | undefined;

    setAchievements((currentAchievements) => {
        const alreadyUnlocked = currentAchievements.some((ach) => ach.id === achievementId);
        if (alreadyUnlocked) {
            return currentAchievements;
        }

        unlockedEntry = {
            id: achievementId,
            title: achievementData.title,
            description: achievementData.description,
            unlockedAt: new Date().toISOString()
        };
        wasUnlocked = true;
        const next = [...currentAchievements, unlockedEntry];
        saveAchievements(next);
        return next;
    });

    if (wasUnlocked && unlockedEntry !== undefined) {
        achievementEvent.dispatch(unlockedEntry);
    }
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

/**
 * AchievementProvider component
 * Manages the state of all achievements in the application
 *
 * @param props - Component props containing children
 * @returns AchievementProvider wrapping children
 */
export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const [achievements, setAchievements] = useState<AchievementUnlocked[]>(loadAchievements);
    const achievementEvent = useEvent('onAchievement');

    const hasAchievement = useCallback((achievementId: AchievementId): boolean => {
        return achievements.some((ach) => ach.id === achievementId);
    }, [achievements]);

    const unlockAchievement = (achievementId: AchievementId): void => {
        const achievementData = coreAchievements[achievementId];
        if (achievementData === undefined) {
            return;
        }

        processAchievementUnlock({ achievementId, achievementData, setAchievements, achievementEvent });
    };

    const resetAchievements = (): void => {
        setAchievements([]);
        saveAchievements([]);
    };

    return (
        <AchievementContext value={{
            achievements,
            unlockAchievement,
            hasAchievement,
            resetAchievements
        }}>
            {children}
        </AchievementContext>
    );
}

/**
 * Hook to access the achievement context
 *
 * @returns Achievement context
 */
export const useAchievements = (): AchievementContextType => {
    const context = use(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
};
