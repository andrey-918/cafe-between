import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import '../style/notifications.css';

const NotificationPanel: React.FC = () => {
  const { notifications, removeNotification, clearNotifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'только что';
    } else if (minutes < 60) {
      return `${minutes} мин назад`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} ч назад`;
    }
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h4>Уведомления ({notifications.length})</h4>
        <button
          onClick={clearNotifications}
          className="btn-clear-notifications"
          title="Очистить все"
        >
          Очистить
        </button>
      </div>
      <div className="notification-list">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification-item notification-${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">{getIcon(notification.type)}</span>
              <span className="notification-message">{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="notification-close"
                title="Закрыть"
              >
                ×
              </button>
            </div>
            <div className="notification-timestamp">
              {formatTimestamp(notification.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
