/**
 * Sacred Neural Notification Manager
 * bridge between the Darshanam AI Grid and the Browser Notification API.
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendNeuralNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    const defaultOptions = {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      silent: false,
      vibrate: [200, 100, 200],
      ...options
    };
    
    return new Notification(`Darshanam AI: ${title}`, defaultOptions);
  }
};

/**
 * High-Speed Logic for threshold alerts
 * Triggers a notification only when critical changes occur.
 */
export const checkWaitTimeAlerts = (prevData, newData) => {
  if (!prevData || !newData) return;

  const sectors = ['free_waiting', 'ticket_waiting'];
  
  sectors.forEach(type => {
    const prevTime = prevData.darshan_metrics[type].value;
    const newTime = newData.darshan_metrics[type].value;
    const label = newData.darshan_metrics[type].label;

    // TACTICAL THRESHOLD: Alert if time drops by 2+ hours or goes below 4 hours
    if (newTime < prevTime && (prevTime - newTime >= 2 || newTime <= 4)) {
       sendNeuralNotification(`Massive Opening: ${label}`, {
          body: `Darshan wait time in ${newData.sector} has dropped to ${newTime} hours! Tactical window is OPEN.`,
          tag: `${newData.sector}-${type}`
       });
    }
  });
};
