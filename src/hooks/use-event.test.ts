import { act, renderHook } from '@testing-library/react';
import type { AchievementUnlocked } from '../containers/AchievementProvider';
import type { ConsoleLine } from '../components/ConsoleOutput/ConsoleOutput';
import { useEvent } from './use-event';

/**
 * Tests for the useEvent hook
 */
describe('useEvent', () => {
    /**
     * Spies installed on the global event APIs for the whole suite.
     */
    const globalEventSpies = {
        addListener: jest.spyOn(globalThis, 'addEventListener'),
        removeListener: jest.spyOn(globalThis, 'removeEventListener'),
        dispatchListener: jest.spyOn(globalThis, 'dispatchEvent'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test that event listeners are added on initialization
     */
    test('adds event listener on mount', () => {
        const mockCallback = jest.fn();
        renderHook(() => useEvent('onCommand', mockCallback));

        expect(globalEventSpies.addListener).toHaveBeenCalledTimes(1);
        expect(globalEventSpies.addListener).toHaveBeenCalledWith('onCommand', expect.any(Function));
    });

    /**
     * Test that event listeners are removed on unmount
     */
    test('removes event listener on unmount', () => {
        const mockCallback = jest.fn();
        const { unmount } = renderHook(() => useEvent('onCommand', mockCallback));

        unmount();

        expect(globalEventSpies.removeListener).toHaveBeenCalledTimes(1);
        expect(globalEventSpies.removeListener).toHaveBeenCalledWith('onCommand', expect.any(Function));
    });

    /**
     * Test that no event listener is added when callback is undefined
     */
    test('does not add event listener when callback is undefined', () => {
        renderHook(() => useEvent('onCommand'));

        expect(globalEventSpies.addListener).not.toHaveBeenCalled();
    });

    /**
     * Test that callback is called when event is dispatched
     */
    test('callback is called when event is dispatched', () => {
        const mockCallback = jest.fn();
        renderHook(() => useEvent('onCommand', mockCallback));

        const mockCommandEvent = {
            command: {
                name: 'test',
                args: ['arg1', 'arg2']
            },
            result: [] as ConsoleLine[]
        };

        act(() => {
            dispatchEvent(new CustomEvent('onCommand', { detail: mockCommandEvent }));
        });

        expect(mockCallback).toHaveBeenCalledWith(mockCommandEvent);
    });

    /**
     * Test that achievement event works correctly
     */
    test('achievement event works correctly', () => {
        const mockCallback = jest.fn();
        renderHook(() => useEvent('onAchievement', mockCallback));

        const mockAchievement: AchievementUnlocked = {
            id: 'test-achievement',
            title: 'Test Achievement',
            description: 'A test achievement',
            unlockedAt: new Date().toISOString(),
        };

        act(() => {
            dispatchEvent(new CustomEvent('onAchievement', { detail: mockAchievement }));
        });

        expect(mockCallback).toHaveBeenCalledWith(mockAchievement);
    });

    /**
     * Test that dispatch function sends correct event
     */
    test('dispatch function creates and dispatches an event', () => {
        const { result } = renderHook(() => useEvent('onCommand'));

        const mockCommandEvent = {
            command: {
                name: 'test',
                args: ['arg1', 'arg2']
            },
            result: [] as ConsoleLine[]
        };

        act(() => {
            result.current.dispatch(mockCommandEvent);
        });

        expect(globalEventSpies.dispatchListener).toHaveBeenCalledTimes(1);
        expect(globalEventSpies.dispatchListener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'onCommand',
                detail: mockCommandEvent
            })
        );
    });
});
