export const ALARM_TARGET = 'app-service/index';
export const HOME_TARGET = 'pages/alarm';
export const ACTIVE_REGEXP = /(_=([0-9]+)=)/;
export const ALARM_KEY = "alarmId";
export const COUNTDOWN_KEY = "countId";

export const CLEAR_KEY = new RegExp(`${ALARM_KEY}|${COUNTDOWN_KEY}`)
