import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Notification, NotificationProvider, useNotification, Notifications } from './Notification';

describe('Notification', () => {
    test('renders a notification and hides it after the duration', () => {
        jest.useFakeTimers();

        const onClose = jest.fn();
        render(<Notification message="Test Notification" duration={2000} onClose={onClose} />);

        expect(screen.getByText('Test Notification')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
        expect(onClose).toHaveBeenCalled();

        jest.useRealTimers();
    });

    test('does not render if visible is false', () => {
        jest.useFakeTimers();

        render(<Notification message="Hidden Notification" duration={0} />);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(screen.queryByText('Hidden Notification')).not.toBeInTheDocument();

        jest.useRealTimers();
    });
});

describe('NotificationProvider', () => {
    const TestComponent = () => {
        const { add, remove, clear, notifications } = useNotification();

        return (
            <div>
                <button onClick={() => add('Test Message', 3000)}>Add Notification</button>
                <button onClick={() => remove('Test Message')}>Remove Notification</button>
                <button onClick={clear}>Clear Notifications</button>
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

        expect(screen.getByText('Test Message')).toBeInTheDocument();
        expect(screen.getByTestId('notification-count').textContent).toBe('1');
    });

    test('removes a notification', () => {
        render(
            <NotificationProvider>
                <TestComponent />
            </NotificationProvider>
        );

        const addButton = screen.getByText('Add Notification');
        const removeButton = screen.getByText('Remove Notification');

        act(() => {
            addButton.click();
        });

        expect(screen.getByText('Test Message')).toBeInTheDocument();

        act(() => {
            removeButton.click();
        });

        expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
        expect(screen.getByTestId('notification-count').textContent).toBe('0');
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

        expect(screen.getAllByText('Test Message').length).toBe(2);

        act(() => {
            clearButton.click();
        });

        expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
        expect(screen.getByTestId('notification-count').textContent).toBe('0');
    });
});
