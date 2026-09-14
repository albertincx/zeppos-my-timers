export const ALARM_TARGET = "src/app-service/index";
export const HOME_TARGET = "src/pages/alarm";
export const REPEAT_TARGET = "src/pages/timer_run";

export const ALARM_KEY = "alarmId";
export const TIMER_PREFIX = "t_";
export const COUNTDOWN_KEY = "countId";

export const ACTIVE_REGEXP = /(_=([0-9]+)=)/;

export const CLEAR_KEY = new RegExp(`${ALARM_KEY}|${COUNTDOWN_KEY}`)

export const DEF_TIMER_MIN = 5
export const DEF_CNT_MIN = 1
