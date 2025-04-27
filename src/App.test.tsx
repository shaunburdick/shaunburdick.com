import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { AchievementProvider } from './components/Achievements/Achievements';
import { NotificationProvider } from './components/Notification/Notification';
import App from './App';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AchievementProvider>
        <NotificationProvider>
            {children}
        </NotificationProvider>
    </AchievementProvider>
);

describe('App', () => {
    test('Shows an h1 title', () => {
        act(() => render(
            <TestWrapper>
                <App />
            </TestWrapper>
        ));
        const title = screen.getByText('Welcome to Shaun Burdick\'s Console!');
        expect(title).toBeInTheDocument();
    });
});
