import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import './Notification.css';

interface NotificationProps {
    id: string;
    message: {
        body: string;
        title?: string;
    };
    duration?: number; // Duration in milliseconds
    onClose?: () => void;
}

/**
 * Terminal-style notification component
 *
 * @param props - Component props
 * @returns Notification component that automatically disappears after specified duration
 */
export function Notification({ id, message, duration = 3000, onClose }: NotificationProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) {
                onClose();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

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
            <br />
            {message.body}
        </div>
    );
}

export interface NotificationContextType {
    add: (message: NotificationProps['message'], duration?: NotificationProps['duration']) => string;
    remove: (id: string) => void;
    clear: () => void;
    notifications: { id: string; message: NotificationProps['message']; duration?: NotificationProps['duration'] }[];
}

// Ignore the context for testing purposes
/* istanbul ignore next */
const NotificationContext = createContext<NotificationContextType>({
    add: () => '',
    remove: () => void 0,
    clear: () => void 0,
    notifications: [],
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<{
        id: string;
        message: NotificationProps['message'];
        duration?: NotificationProps['duration']
    }[]>([]);

    const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const remove = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const add = (message: NotificationProps['message'], duration?: number) => {
        const id = generateId();
        setNotifications((prev) => [...prev, { id, message, duration }]);
        setTimeout(() => {
            remove(id);
        }, duration || 3000);
        return id;
    };

    const clear = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ add, remove, clear, notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);

export function Notifications() {
    const { notifications } = useNotification();

    return (
        <div
            className="notification-container"
            aria-label="Notifications"
            role="region"
        >
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    id={notification.id}
                    message={notification.message}
                    duration={notification.duration}
                />
            ))}
        </div>
    );
}
