import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NotificationProvider } from './components/Notification/Notification';
import { AchievementProvider } from './components/Achievements/Achievements';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <NotificationProvider>
            <AchievementProvider>
                <App />
            </AchievementProvider>
        </NotificationProvider>
    </React.StrictMode>
);
