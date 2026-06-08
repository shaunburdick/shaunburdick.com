import React, { createContext, useState, use, ReactNode, useEffect } from 'react';
import { NotificationView } from '../components/Notification/NotificationView';

/**
 * Single notification container that manages visibility and timer
 */
interface NotificationProps {
    id: string;
    message: {
        body: string;
        title?: string;
    };
    duration?: number;
    onClose?: () => void;
}

/**
 * Notification context type
 */
export interface NotificationContextType {
    add: (message: { body: string; title?: string }, duration?: number) => string;
    remove: (id: string) => void;
    clear: () => void;
    notifications: { id: string; message: { body: string; title?: string }; duration?: number }[];
}

// Default context value
const NotificationContext = createContext<NotificationContextType>({
    add: () => '',
    remove: () => void 0,
    clear: () => void 0,
    notifications: [],
});

const ID_RANDOM_SUBSTRING_START = 2;
const ID_RANDOM_SUBSTRING_END = 11;
const ID_RANDOM_RADIX = 36;

/**
 * Generates a unique notification ID using timestamp and random string
 *
 * @returns Unique notification ID string
 */
const generateId = (): string => {
    const randomPart = Math.random()
        .toString(ID_RANDOM_RADIX)
        .slice(ID_RANDOM_SUBSTRING_START, ID_RANDOM_SUBSTRING_END);
    return `notification-${Date.now()}-${randomPart}`;
};

/**
 * Notification provider container
 * Manages global notification state
 *
 * @param props - Component props
 * @returns Provider component
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<{
        id: string;
        message: { body: string; title?: string };
        duration?: number;
    }[]>([]);

    const remove = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const add = (message: { body: string; title?: string }, duration?: number) => {
        const id = generateId();
        setNotifications((prev) => [...prev, { id, message, duration }]);
        // Timer is now managed by the Notification component itself
        return id;
    };

    const clear = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext value={{ add, remove, clear, notifications }}>
            {children}
        </NotificationContext>
    );
};

/**
 * Hook to access notification context
 *
 * @returns Notification context
 */
export const useNotification = () => use(NotificationContext);

/**
 * Notification container component
 * Manages visibility state and auto-dismiss timer
 *
 * @param props - Component props
 * @returns Notification container
 */
export function Notification({ id, message, duration = 3000, onClose }: NotificationProps) {
    const [visible, setVisible] = useState(true);
    const { remove } = useNotification();

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            // Remove from provider state after hiding
            remove(id);
            if (onClose) {
                onClose();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onClose, remove]);

    return (
        <NotificationView
            id={id}
            message={message}
            duration={duration}
            visible={visible}
        />
    );
}

/**
 * Notifications view container
 * Renders all active notifications
 *
 * @returns Notifications component
 */
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
