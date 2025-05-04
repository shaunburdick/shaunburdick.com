import { useCallback, useEffect, type Dispatch } from 'react';
import type { AchievementUnlocked } from '../components/Achievements/Achievements';
import type { ConsoleLine } from '../components/ConsoleOutput/ConsoleOutput';

interface AppEvent<PayloadType = unknown> extends Event {
    detail: PayloadType;
}

export interface CustomWindowEventMap extends WindowEventMap {
    onCommand: AppEvent<{ command: { name: string; args: string[] }, result: ConsoleLine[] }>;
    onAchievement: AppEvent<AchievementUnlocked>;
}

type EventPayload<T extends keyof CustomWindowEventMap> =
    CustomWindowEventMap[T] extends AppEvent<infer P> ? P : never;

export const useEvent = <T extends keyof CustomWindowEventMap>(
    eventName: T,
    callback?: Dispatch<EventPayload<T>> | VoidFunction
) => {
    useEffect(() => {
        if (!callback) {
            return;
        }

        const listener = ((event: AppEvent<EventPayload<T>>) => {
            callback(event.detail);
        }) as EventListener;

        window.addEventListener(eventName, listener);
        return () => {
            window.removeEventListener(eventName, listener);
        };
    }, [callback, eventName]);

    const dispatch = useCallback(
        (detail: EventPayload<T>) => {
            const event = new CustomEvent(eventName, { detail });
            window.dispatchEvent(event);
        },
        [eventName]
    );

    return { dispatch };
};
