import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Notification, NotificationProvider, useNotification, Notifications } from './Notification';

const TEST_NOTIFICATION_TEXT = 'Test Notification';
const QUICK_NOTIFICATION_TEXT = 'Quick Notification';
const TESTID_NOTIFICATION_COUNT = 'notification-count';

describe('Notification', () => {
    test('renders a notification and hides it after the duration', () => {
        jest.useFakeTimers();

        const onClose = jest.fn();
        render(
            <Notification id="test-notification-1" message={{ body: TEST_NOTIFICATION_TEXT }}
                duration={2000} onClose={onClose} />
        );

        expect(screen.getByText(TEST_NOTIFICATION_TEXT)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.queryByText(TEST_NOTIFICATION_TEXT)).not.toBeInTheDocument();
        expect(onClose).toHaveBeenCalled();

        jest.useRealTimers();
    });

    test('does not render if visible is false', () => {
        jest.useFakeTimers();

        render(<Notification id="test-notification-2" message={{ body: 'Hidden Notification' }} duration={0} />);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(screen.queryByText('Hidden Notification')).not.toBeInTheDocument();

        jest.useRealTimers();
    });

    test('renders notification with title when provided', () => {
        jest.useFakeTimers();

        render(
            <Notification id="test-notification-3" message={{ title: 'Test Title', body: 'Test Body' }}
                duration={2000} />
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Body')).toBeInTheDocument();

        jest.useRealTimers();
    });
});

describe('NotificationProvider', () => {
    const TestComponent = () => {
        const { add, remove, clear, notifications } = useNotification();

        return (
            <div>
                <button onClick={() => add({ body: TEST_NOTIFICATION_TEXT }, 3000)}>Add Notification</button>
                <button onClick={() => add({ body: QUICK_NOTIFICATION_TEXT }, 1000)}>Add Quick Notification</button>
                <button onClick={clear}>Clear Notifications</button>
                <button data-testid="remove-by-id" onClick={() => {
                    if (notifications.length > 0) {
                        remove(notifications[0].id);
                    }
                }}>Remove First Notification</button>
                <Notifications />
                <div data-testid="notification-count">{notifications.length}</div>
            </div>
        );
    };

    test('adds a notification', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const addButton = screen.getByText('Add Notification');
        act(() => {
            addButton.click();
        });

        expect(screen.getByText(TEST_NOTIFICATION_TEXT)).toBeInTheDocument();
        expect(screen.getByTestId('notification-count').textContent).toBe('1');
    });

    test('clears all notifications', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const addButton = screen.getByText('Add Notification');
        const clearButton = screen.getByText('Clear Notifications');

        act(() => {
            addButton.click();
            addButton.click();
        });

        expect(screen.getAllByText(TEST_NOTIFICATION_TEXT).length).toBe(2);

        act(() => {
            clearButton.click();
        });

        expect(screen.queryByText(TEST_NOTIFICATION_TEXT)).not.toBeInTheDocument();
        expect(screen.getByTestId(TESTID_NOTIFICATION_COUNT).textContent).toBe('0');
    });

    test('removes notification after duration expires', () => {
        jest.useFakeTimers();

        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const quickButton = screen.getByText('Add Quick Notification');
        act(() => {
            quickButton.click();
        });

        expect(screen.getByText(QUICK_NOTIFICATION_TEXT)).toBeInTheDocument();
        expect(screen.getByTestId(TESTID_NOTIFICATION_COUNT).textContent).toBe('1');

        // Advance timers by just less than the duration
        act(() => {
            jest.advanceTimersByTime(900);
        });

        // Notification should still be visible
        expect(screen.getByText(QUICK_NOTIFICATION_TEXT)).toBeInTheDocument();
        expect(screen.getByTestId(TESTID_NOTIFICATION_COUNT).textContent).toBe('1');

        // Advance timers to complete the duration
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // Notification should now be removed
        expect(screen.queryByText(QUICK_NOTIFICATION_TEXT)).not.toBeInTheDocument();
        expect(screen.getByTestId(TESTID_NOTIFICATION_COUNT).textContent).toBe('0');

        jest.useRealTimers();
    });
});
