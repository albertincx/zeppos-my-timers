import {Time} from "@zos/sensor";
import {getDeviceInfo} from "@zos/device";
import {ACTIVE_REGEXP, ALARM_KEY, CLEAR_KEY, COUNTDOWN_KEY} from "../config/constants";

const timeSensor = new Time();
export const {height: DEVICE_HEIGHT, width: DEVICE_WIDTH} = getDeviceInfo();

export const showTimeVal = (v) => v >= 10 ? v : '0' + v

export const getTimeStr = (timeObj) => {
    return `${showTimeVal(timeObj.getHours())}:${showTimeVal(timeObj.getMinutes())}:${showTimeVal(timeObj.getSeconds())}`
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
    let hs = showTimeVal(h);
    let ms = showTimeVal(m);
    let ss = showTimeVal(s);
    let sepH = ':';
    let sepM = ':';
    let endS = '';
    if (endStr) {
        sepH = 'h '
        sepM = 'm '
        endS = 's '
    }
    if (!h) hs = sepH = '';
    if (!m) ms = sepM = '';
    if (!s && !endS) {
        ss = sepM = '';
    }

    return `${hs}${sepH}${ms}${sepM}${ss}${endS}`
}

// get time from "00:00:00" string
export const getTimeFromStr = (name) => {
    const now = new Date();

    const names = name.replace(ACTIVE_REGEXP, '').split(':');

    if (names.length === 3) {
        now.setHours(...names);
        return now;
    }
}

export const getTT = (tt) => {
    const mtt = `${tt}`.match(/([ct])_([0-9]+)_(.*?)$/);
    let name;
    console.log(mtt);
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

export function getCurrentTime() {
    let cTime = getSensorTime();
    cTime.setHours(timeSensor.getHours(), timeSensor.getMinutes(), timeSensor.getSeconds())

    return cTime
}

export function clearParam(s) {
    return `${s}`.replace(new RegExp(ACTIVE_REGEXP, 'g'), '');
}

export const getActiveId = (val) => {
    let activeId = val && val.match(ACTIVE_REGEXP);
    if (activeId) {
        return +activeId[2]
    }
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
            if (typeof activeId === "number") {
                if (activeId === -1) {
                    // skip
                } else {
                    result.active[key] = value;
                }
            } else {
                result.notActive[key] = value;
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
