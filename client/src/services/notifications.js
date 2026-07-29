export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showSOSNotification = (data) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const notification = new Notification('🚨 Emergency SOS', {
    body: `${data.userName || 'Someone'} needs immediate help.`,
    tag: `sos-${data._id}`,
    requireInteraction: true,
    silent: false,
    data: { sosId: data._id, type: 'sos' }
  });

  notification.onclick = () => {
    window.focus();
    window.open(`/dashboard?sos=${data._id}`, '_self');
    notification.close();
  };
};

export const showMissionNotification = (data) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const notification = new Notification('🆘 New Mission Assigned', {
    body: `Mission ${data.missionId} — ${data.userName} needs help.`,
    tag: `mission-${data.missionId}`,
    requireInteraction: true,
    data: { missionId: data.missionId, type: 'mission' }
  });

  notification.onclick = () => {
    window.focus();
    window.open(`/missions/${data.missionId}`, '_self');
    notification.close();
  };
};
