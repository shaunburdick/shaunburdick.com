import React from 'react';
import './Notification.css';

interface NotificationViewProps {
    id: string;
    message: {
        body: string;
        title?: string;
    };
    duration: number;
    visible: boolean;
}

/**
 * Notification view component (presentational)
 * Pure view component that renders a notification message
 *
 * @param props - Component props
 * @returns Notification JSX
 */
export function NotificationView({ id, message, duration, visible }: NotificationViewProps) {
    if (!visible) {
        return null;
    }

    return (
        <div
            data-id={id}
            role="alert"
            aria-live="polite"
            className="notification"
            style={{
                animation: `fade-in-out ${duration}ms ease-in-out`
            }}
        >
            {message.title && <strong>{message.title}</strong>}
            {message.title && <br />}
            {message.body}
        </div>
    );
}
