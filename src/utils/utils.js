import {Time} from "@zos/sensor";
import {getDeviceInfo} from "@zos/device";
import {getText} from "@zos/i18n";
import {replace} from "@zos/router";
import {GESTURE_RIGHT, onGesture} from "@zos/interaction";

import {ACTIVE_REGEXP, ALARM_KEY, CLEAR_KEY, COUNTDOWN_KEY, HOME_TARGET} from "../config/constants";

const timeSensor = new Time();

export const {height: DEVICE_HEIGHT, width: DEVICE_WIDTH} = getDeviceInfo();

export const addZeroToVal = (v) => v >= 10 ? v : '0' + v

export const getTimeStr = (timeObj) => {
    return `${addZeroToVal(timeObj.getHours())}:${addZeroToVal(timeObj.getMinutes())}:${addZeroToVal(timeObj.getSeconds())}`
}

export const getTimeStrMain = (timeObj) => {
    return `${getText('Time')}: ${addZeroToVal(timeObj.getHours())}:${addZeroToVal(timeObj.getMinutes())}:${addZeroToVal(timeObj.getSeconds())}`
}

export const getTimerStr = (v, end = '') => {
    let s = ''
    if (v) {
        s = parseInt(v) || s
    }

    return `${s}${s ? end : ''}`
}

export const showHumanTimerStr = (name) => {
    let names = name.split(':');
    if (names.length === 3) {
        let h = getTimerStr(names[0], 'h ');
        let m = getTimerStr(names[1], 'm ');
        let s = getTimerStr(names[2], 's');

        return `${h}${m}${s}`;
    }
}

export const showHumanTimeStr = (timeObj, endStr = false) => {
    let h = timeObj.getHours();
    let m = timeObj.getMinutes();
    let s = timeObj.getSeconds();
    let hs = addZeroToVal(h);
    let ms = h ? addZeroToVal(m) : m;
    let ss = (h || m) ? addZeroToVal(s) : s;
    let sepH = ':';
    let sepM = ':';
    let endS = '';
    if (endStr) {
        sepH = 'h '
        sepM = 'm '
        endS = 's '
    }
    if (!h) hs = sepH = '';
    if (!m && !h) ms = sepM = '';
    if (!s && !endS) {
        ss = sepM = '';
    }

    return `${hs}${sepH}${ms}${sepM}${ss}${endS}`
}

// get time from "00:00:00" string
export const getTimeFromStr = (name) => {
    const now = getSensorTime();

    const names = name.replace(ACTIVE_REGEXP, '').split(':');

    if (names.length === 3) {
        now.setHours(...names);
        return now;
    }
}

export const getTT = (tt) => {
    const mtt = `${tt}`.match(/([ct])_([0-9]+)_(.*?)$/);
    let name;
    if (mtt) {
        tt = mtt[2];
        name = mtt[3];

        return {time: getTimeStr(new Date(tt * 1000)), timeRaw: tt, name};
    }
}

export function getSensorTime() {
    return new Date(timeSensor.getTime());
}

export const getAlarmTime = (dTime) => {
    let cTime = getSensorTime();
    let h = dTime.getHours();
    let m = dTime.getMinutes();
    let s = dTime.getSeconds();
    cTime.setHours(cTime.getHours() + h, cTime.getMinutes() + m, cTime.getSeconds() + s,);

    return Math.floor(cTime.getTime() / 1000);
}

export function clearParam(s) {
    return `${s}`.replace(new RegExp(ACTIVE_REGEXP, 'g'), '');
}

export const getActiveId = (val) => {
    if (typeof val === 'number') val = String(val)
    let activeId = val && val.match(ACTIVE_REGEXP);
    if (activeId) return +activeId[2]
}

export function sortObjectByTimeKeys(obj) {
    return Object.keys(obj)
        .sort((a1, b1) => {
            const a = a1.replace(CLEAR_KEY, '')
            const b = b1.replace(CLEAR_KEY, '')
            const timeA = a.split(':').map(Number);
            const timeB = b.split(':').map(Number);
            for (let i = 0; i < 3; i++) {
                if (timeA[i] !== timeB[i]) return timeA[i] - timeB[i];
            }

            return 0;
        })
        .reduce((sortedObj, key) => {
            sortedObj[key] = obj[key];
            return sortedObj;
        }, {});
}

export function splitObjectByValue(obj, condition) {
    return Object.entries(obj).reduce(
        (result, [key, value]) => {
            const activeId = condition(key, value);

            if (`${value}`.match(/^(c_|t_)/)) {
                if (typeof activeId === "number") {
                    if (activeId === -1) {
                        // skip
                    } else {
                        result.active[key] = value;
                    }
                } else {
                    result.notActive[key] = value;
                }
            }
            return result;
        },
        {active: {}, notActive: {}}
    );
}

export const getSortedKeys = (sortObj) => {
    let savedAlarms = []
    let sKeys = Object.keys(sortObj);
    for (let sk = 0; sk < sKeys.length; sk += 1) {
        let sKey = sKeys[sk];
        if (sKey && (sortObj[sKey].key.match(ALARM_KEY) || sortObj[sKey].key.match(COUNTDOWN_KEY))) {
            savedAlarms.push(sortObj[sKey].key);
        }
    }
    return savedAlarms;
}

/**
 * Вычисляет общую длину времени в секундах из строки вида "00:05:00" или ключа с префиксом
 * @param {string} str - Строка, содержащая время (например, "alarmId00:05:00" или "00:05:00")
 * @returns {number} Количество секунд
 */
export function getTimeLengthInSeconds(str) {
    if (!str) return 0;

    // Очищаем строку от возможных префиксов (оставляем только формат времени HH:MM:SS)
    // Либо ищем паттерн времени через регулярное выражение
    const match = `${str}`.match(/([0-9]{2}:[0-9]{2}:[0-9]{2})/);
    const timeStr = match ? match[1] : str;

    const parts = timeStr.split(':').map(Number);

    if (parts.length === 3) {
        const [hours, minutes, seconds] = parts;
        return (hours * 3600) + (minutes * 60) + seconds;
    }

    return 0;
}

export const getSortedObj = (obj) => {
    let sortObj = {};
    const sKeys = Object.keys(obj);
    for (let sk = 0; sk < sKeys.length; sk += 1) {
        let sKey = sKeys[sk];
        if (sKey && (
            `${sKey}`.match(ALARM_KEY)
            || `${sKey}`.match(COUNTDOWN_KEY)
        )
        ) {
            let v = obj[sKey];
            sortObj[sKey] = {
                key: sKey,
                value: v,
            };
        }
    }
    return sortObj
}

export const initSwipeBack = (customCondition = null) => {
    onGesture(function (event) {
        if (event === GESTURE_RIGHT) {
            // another js magic getter function
            if (customCondition === -1 || (
                typeof customCondition === 'function' && customCondition()
            )) {
                goHome();
                return true;
            }
        }
        return false;
    });
}

export function formatHumanTime(str, isTimer = false) {
    const [h, m, s] = str.split('_').pop().split(':').map(Number);
    const res = [];

    if (h > 0) res.push(`${h}h`);
    if (m > 0) res.push(`${m}min`);
    if (s > 0) res.push(`${s}sec`);

    let text = res.join(' ') || '0sec';
    return isTimer ? `${text} timer` : `${text} countdown`;
}

export const goHome = () => {
    replace({
        url: HOME_TARGET,
        params: 'skip',
    });
}

/**
 * Сортирует активные элементы по оставшемуся времени (timeLeft) по возрастанию (сначала те, что ближе к концу)
 */
export function sortActiveByTimeLeft(obj) {
    const now = getSensorTime().getTime();

    return Object.keys(obj)
        .sort((aKey, bKey) => {
            const timeA = parseInt(aKey) || 0; // Предполагаем, что ключ хранит таймстамп или передается в объекте
            const timeB = parseInt(bKey) || 0;

            const timeLeftA = timeA * 1000 - now;
            const timeLeftB = timeB * 1000 - now;

            return timeLeftA - timeLeftB; // Сортировка по возрастанию (меньше времени -> выше в списке)
        })
        .reduce((sortedObj, key) => {
            sortedObj[key] = obj[key];
            return sortedObj;
        }, {});
}
