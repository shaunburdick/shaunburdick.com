import { useCallback, useEffect  } from 'react';
import type { Dispatch } from 'react';
import type { AchievementUnlocked } from '../components/Achievements/Achievements';
import type { ConsoleLine } from '../components/ConsoleOutput/ConsoleOutput';

/**
 * Interface for custom application events that include a payload
 */
interface AppEvent<PayloadType = unknown> extends Event {
    detail: PayloadType;
}

/**
 * Extension of standard WindowEventMap to include custom application events
 */
export interface CustomWindowEventMap extends WindowEventMap {
    onCommand: AppEvent<{ command: { name: string; args: string[] }, result: ConsoleLine[] }>;
    onAchievement: AppEvent<AchievementUnlocked>;
}

/**
 * Utility type to extract the payload type from a CustomWindowEventMap event
 */
type EventPayload<T extends keyof CustomWindowEventMap> =
    CustomWindowEventMap[T] extends AppEvent<infer P> ? P : never;

/**
 * Custom hook for working with DOM events including custom application events
 *
 * @param eventName - The name of the event to listen for
 * @param callback - Optional callback function to invoke when the event occurs
 * @returns Object containing a dispatch function to trigger the event
 */
export const useEvent = <T extends keyof CustomWindowEventMap>(
    eventName: T,
    callback?: Dispatch<EventPayload<T>> | VoidFunction
) => {
    useEffect(() => {
        if (callback === undefined) {
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

    /**
     * Dispatch a custom event with the provided payload
     *
     * @param detail - The event payload to include
     */
    const dispatch = useCallback(
        (detail: EventPayload<T>) => {
            const event = new CustomEvent(eventName, { detail });
            window.dispatchEvent(event);
        },
        [eventName]
    );

    return { dispatch };
};
