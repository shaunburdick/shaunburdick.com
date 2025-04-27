import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import './Notification.css';

interface NotificationProps {
    message: string;
    duration?: number; // Duration in milliseconds
    onClose?: () => void;
}

export function Notification({ message, duration = 3000, onClose }: NotificationProps) {
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
        <div className="notification">
            {message}
        </div>
    );
}

export interface NotificationContextType {
    add: (message: string, duration?: number) => void;
    remove: (message: string) => void;
    clear: () => void;
    notifications: { message: string; duration?: number }[];
}

const NotificationContext = createContext<NotificationContextType>({
    add: () => void 0,
    remove: () => void 0,
    clear: () => void 0,
    notifications: [],
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<{ message: string; duration?: number }[]>([]);

    const add = (message: string, duration?: number) => {
        setNotifications((prev) => [...prev, { message, duration }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.message !== message));
        }, duration || 3000);
    };

    const remove = (message: string) => {
        setNotifications((prev) => prev.filter((n) => n.message !== message));
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
        <div className="notification-container">
            {notifications.map((notification, index) => (
                <Notification
                    key={index}
                    message={notification.message}
                    duration={notification.duration}
                />
            ))}
        </div>
    );
}
