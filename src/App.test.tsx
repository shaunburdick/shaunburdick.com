import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { AchievementProvider } from './containers/AchievementProvider';
import { NotificationProvider } from './containers/NotificationProvider';
import App from './App';
import { TRACKER_EVENTS } from './hooks/useTracker';

// Create mock functions
const mockTrackEvent = jest.fn();
const mockTrackPageview = jest.fn();
const mockEnableAutoOutboundTracking = jest.fn();
const mockAddNotification = jest.fn();

// Mock the useTracker hook
jest.mock('./hooks/useTracker', () => ({
    TRACKER_EVENTS: {
        AchievementUnlocked: 'achievement_unlocked',
        ExecCommand: 'exec_command',
    },
    useTracker: () => ({
        trackEvent: mockTrackEvent,
        trackPageview: mockTrackPageview,
        enableAutoOutboundTracking: mockEnableAutoOutboundTracking,
    }),
}));

// Mock the notification hook
jest.mock('./containers/NotificationProvider', () => {
    const original = jest.requireActual('./containers/NotificationProvider');
    return {
        ...original,
        useNotification: () => ({
            add: mockAddNotification
        }),
    };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AchievementProvider>
        <NotificationProvider>
            {children}
        </NotificationProvider>
    </AchievementProvider>
);

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Shows an h1 title', () => {
        act(() => render(
            <TestWrapper>
                <App />
            </TestWrapper>
        ));
        const title = screen.getByText("Shaun Burdick's Console");
        expect(title).toBeInTheDocument();
    });

    test('handles onAchievement event', () => {
        render(
            <TestWrapper>
                <App />
            </TestWrapper>
        );

        // Dispatch achievement event
        const achievementDetail = {
            id: 'test-achievement',
            title: 'Test Achievement',
            description: 'This is a test achievement'
        };

        act(() => {
            window.dispatchEvent(new CustomEvent('onAchievement', {
                detail: achievementDetail
            }));
        });

        // Verify notification was added
        expect(mockAddNotification).toHaveBeenCalledWith(
            {
                title: `Achievement Unlocked: ${achievementDetail.title}`,
                body: achievementDetail.description
            },
            5000
        );

        // Verify event was tracked
        expect(mockTrackEvent).toHaveBeenCalledWith(
            TRACKER_EVENTS.AchievementUnlocked,
            {
                props: { achievement: achievementDetail.id }
            }
        );
    });

    test('handles onCommand event', () => {
        render(
            <TestWrapper>
                <App />
            </TestWrapper>
        );

        // Dispatch command event
        const commandDetail = {
            command: {
                name: 'test-command',
                args: ['arg1', 'arg2']
            }
        };

        act(() => {
            window.dispatchEvent(new CustomEvent('onCommand', {
                detail: commandDetail
            }));
        });

        // Verify event was tracked
        expect(mockTrackEvent).toHaveBeenCalledWith(
            TRACKER_EVENTS.ExecCommand,
            {
                props: {
                    commandName: commandDetail.command.name,
                    args: commandDetail.command.args.join(' ')
                }
            }
        );
    });
});
