import hmUI from "@zos/ui";
import {log} from "@zos/utils";
import * as alarmMgr from "@zos/alarm";
import {replace} from "@zos/router";

import {
    clearParam,
    DEVICE_HEIGHT,
    DEVICE_WIDTH,
    getAlarmTime,
    getCurrentTime,
    getTimeStr,
    showTimeVal
} from "../../utils/utils";

import {ALARM_KEY, ALARM_TARGET, COUNTDOWN_KEY, HOME_TARGET} from "../../config/constants";

const globalData = getApp()._options.globalData;

let showTime;
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
        let id;
        alarmObj.time = getAlarmTime(alarmTime);
        let paramVal = `${timer ? 't_' : 'c_'}${alarmObj.time}${name ? `_${name}` : ''}`;
        alarmObj.param = paramVal;

        let STORE_KEY = `${timer ? ALARM_KEY : COUNTDOWN_KEY}${name}`;
        if (timer && typeof timer === 'string') STORE_KEY = timer

        const exists = globalData.localStorage.getItem(STORE_KEY);

        if (isCreateTimer) {
            id = -1
        } else {
            if (!timer && exists) {
                // skip exists countdown
                log.log('no skipped')
            } else {
                id = alarmMgr.set(alarmObj);
            }
        }
        if (id === 0) {
            // cant setup
            console.log('cant setup id, something wrong');
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
        console.log(e);
    }
}

function hideDialog(vc) {
    hmUI.deleteWidget(vc), (vc = null);
    hmUI.redraw();
}

const timePickerCb = (timer = false, vc) => (picker, event_type, column, value_index) => {
    const dTime = dateTime;

    oldDate = getCurrentTime();

    if (event_type === 1) {
        // update
        switch (column) {
            case 0: // hour
                if (!timer) {
                    showTime.setHours(value_index);
                } else {
                    dTime.setHours(value_index);
                }
                changedHour = true;
                break;
            case 1: // minute
                if (!timer) {
                    showTime.setMinutes(value_index);
                } else {
                    dTime.setMinutes(value_index);
                }
                changedMin = true;
                break;
            case 2: // second
                dTime.setSeconds(value_index);
                changedSec = true;
                break;
        }
    } else if (event_type === 2) {
        // done
        if (timer) {
            if (!changedHour) dTime.setHours(0);
            if (!changedMin) dTime.setMinutes(5);
        } else {
            dTime.setMinutes(showTime.getMinutes() - oldDate.getMinutes());
            dTime.setHours(showTime.getHours() - oldDate.getHours());
        }

        if (!changedSec) dTime.setSeconds(0);

        setupAlarm(dTime, timer);
        hideDialog(vc);

        changedHour = undefined
        changedMin = undefined
        changedSec = undefined
        setTimeout(() => {
            replace({
                url: HOME_TARGET,
                params: 'skip',
            });
        }, 50)
    }
} // end timePickerCb

export function selectTime(timer = false) {
    let vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 0,
    });
    // just show time
    showTime = getCurrentTime()
    dateTime = new Date();

    showTime.setMinutes(showTime.getMinutes() + 5);

    const h = !timer ? showTime.getHours() : 0
    const m = !timer ? showTime.getMinutes() : 5

    changedHour = false;
    changedMin = false;
    changedSec = false;

    vc.createWidget(hmUI.widget.WIDGET_PICKER, {
        title: timer ? 'Create timer' : 'CountDown',
        nb_of_columns: timer ? 3 : 2,
        data_config: [
            {
                data_array: new Array(24)
                    .fill(0).map((d, index) => `${showTimeVal(index)}h`),
                init_val_index: h,
                unit: 'Hour',
                support_loop: true,
            },
            {
                data_array: new Array(60)
                    .fill(0).map((d, index) => `${showTimeVal(index)}m`),
                init_val_index: m,
                unit: 'Min',
            },
            {
                data_array: new Array(60).fill(0).map((d, index) => `${showTimeVal(index)}s`),
                init_val_index: 0,
                unit: 'Sec',
            },
        ],
        picker_cb: timePickerCb(timer, vc),
    });

    return vc;
} // end selectTime
