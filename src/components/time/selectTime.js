import hmUI from "@zos/ui";
import {log} from "@zos/utils";
import * as alarmMgr from "@zos/alarm";

import {
    addZeroToVal,
    clearParam,
    DEVICE_HEIGHT,
    DEVICE_WIDTH,
    getAlarmTime,
    getSensorTime,
    getTimeStr,
    goHome
} from "../../utils/utils";

import {ALARM_KEY, ALARM_TARGET, COUNTDOWN_KEY, DEF_CNT_MIN, DEF_TIMER_MIN} from "../../config/constants";

const globalData = getApp()._options.globalData;

let oldDate;
let changedHour;
let changedMin;
let changedSec;
let dateTime = new Date();
let alarmObj = {
    url: ALARM_TARGET,
    store: true,
    repeat_type: alarmMgr.REPEAT_ONCE,
    repeat_period: 1,
    repeat_duration: 1,
    week_days: 0,
    start_time: 0,
    end_time: 0,
};

export function setupAlarm(alarmTime, timer = false) {
    if (!alarmTime) return;

    try {
        const isCreateTimer = timer === true;
        const isStartTimer = typeof timer === 'string';

        let name = getTimeStr(alarmTime);
        if (name === "00:00:00") {
            // cant setup
            log.debug('cant setup, zeroes');
            return;
        }
        let id;
        alarmObj.time = getAlarmTime(alarmTime);
        let paramVal = `${timer ? 't_' : 'c_'}${alarmObj.time}${name ? `_${name}` : ''}`;
        alarmObj.param = paramVal;
        log.debug('\nalarmTime1 = ', alarmTime, name)
        let STORE_KEY = `${timer ? ALARM_KEY : COUNTDOWN_KEY}${name}`;
        if (timer && typeof timer === 'string') STORE_KEY = timer

        const exists = globalData.localStorage.getItem(STORE_KEY);

        if (isCreateTimer) {
            id = -1
        } else {
            if (!timer && exists) {
                // skip exists countdown
                log.debug('no skipped')
            } else {
                id = alarmMgr.set(alarmObj);
            }
        }
        if (id === 0) {
            // cant setup
            log.debug('cant setup id, something wrong');
            return;
        }

        if (timer) {
            if (isCreateTimer && exists) {
                paramVal = '';
            }
        } else if (exists) {
            paramVal = '';
        }

        // save to localStorage
        if (paramVal) {
            if (isStartTimer || (!timer && !exists)) {
                paramVal = clearParam(paramVal) + `_=${id}=`;
            }
            globalData.localStorage.setItem(STORE_KEY, paramVal);
        }
    } catch (e) {
        log.debug(`error ${e}`);
    }
}

function hideDialog(vc) {
    hmUI.deleteWidget(vc), (vc = null);
    hmUI.redraw();
}

const timePickerCb = (isTimer = false, vc) => (picker, event_type, column, value_index) => {
    const dTime = dateTime;

    oldDate = getSensorTime();

    if (event_type === 1) {
        // update
        switch (column) {
            case 0: // hour
                dTime.setHours(value_index);
                changedHour = true;
                break;
            case 1: // minute
                dTime.setMinutes(value_index);
                changedMin = true;
                break;
            case 2: // second
                dTime.setSeconds(value_index);
                changedSec = true;
                break;
        }
    } else if (event_type === 2) {
        // OK clicked
        if (!changedHour) dTime.setHours(0);
        if (!changedMin) dTime.setMinutes(isTimer ? DEF_TIMER_MIN : DEF_CNT_MIN);
        if (!changedSec) dTime.setSeconds(0);

        setupAlarm(dTime, isTimer);
        hideDialog(vc);

        changedHour = undefined
        changedMin = undefined
        changedSec = undefined

        setTimeout(() => {
            goHome()
        }, 50)
    }
}

export function selectTime(isTimer = false) {
    let vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 0,
    });
    dateTime = new Date();

    const isCountdown = !isTimer

    const h = 0
    const m = isCountdown ? DEF_CNT_MIN : DEF_TIMER_MIN

    changedHour = false;
    changedMin = false;
    changedSec = false;

    vc.createWidget(hmUI.widget.WIDGET_PICKER, {
        title: isTimer ? 'Create timer' : 'CountDown',
        nb_of_columns: 3,
        data_config: [
            {
                data_array: new Array(24)
                    .fill(0).map((d, index) => `${addZeroToVal(index)}h`),
                init_val_index: h,
                unit: 'Hour',
                support_loop: true,
            },
            {
                data_array: new Array(60)
                    .fill(0).map((d, index) => `${addZeroToVal(index)}m`),
                init_val_index: m,
                unit: 'Min',
            },
            {
                data_array: new Array(60).fill(0).map((d, index) => `${addZeroToVal(index)}s`),
                init_val_index: 0,
                unit: 'Sec',
            },
        ],
        picker_cb: timePickerCb(isTimer, vc),
    });

    return {vc, picker};
}
