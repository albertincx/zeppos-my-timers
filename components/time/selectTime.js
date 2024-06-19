import hmUI from "@zos/ui";
import {
    clearParam,
    DEVICE_HEIGHT,
    DEVICE_WIDTH,
    getAlarmTime,
    getCTime,
    getCurrentTime,
    showTimeStr,
    showTimeVal
} from "../../utils/utils";
import * as alarmMgr from "@zos/alarm";

import {replace} from "@zos/router";
import {ALARM_TARGET, HOME_TARGET} from "../../config/constants";

let showTime = getCurrentTime();
let dateTime = new Date();
let vc = null;
const globalData = getApp()._options.globalData;

let changedHour;
let changedMin;
let changedSec;

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

export function setupAlarm(dTime, timer = false) {
    try {
        const isCreateTimer = timer === true;
        const isStartTimer = typeof timer === 'string';
        let name = showTimeStr(dTime);

        if (timer) {
            let cTime = getCTime();
            let h = dTime.getHours();
            let m = dTime.getMinutes();
            let s = dTime.getSeconds();
            cTime.setHours(
                cTime.getHours() + h,
                cTime.getMinutes() + m,
                cTime.getSeconds() + s,
            );
            alarmObj.time = getAlarmTime(dTime);
        } else {
            dTime.setHours(dTime.getHours() + 8)
            alarmObj.time = Math.floor(dTime.getTime() / 1000);
        }
        const paramVal = `${timer ? 't_' : 'c_'}${alarmObj.time}${timer ? `_${name}` : ''}`;
        alarmObj.param = paramVal;

        let id = isCreateTimer ? -1 : alarmMgr.set(alarmObj);
        if (id == 0) {
            //
        } else {
            // save w Time
            if (timer) {
                let ALARM_KEY = `alarmId${timer ? name : paramVal}`;
                if (typeof timer === 'string') {
                    ALARM_KEY = timer
                }
                if (isCreateTimer && globalData.localStorage.getItem(ALARM_KEY)) {
                    // exists
                } else {
                    let val = paramVal;
                    if (isStartTimer) val = clearParam(paramVal) + `_=${id}=`;

                    globalData.localStorage.setItem(ALARM_KEY, val);
                }
            }
            replace({
                url: HOME_TARGET,
                params: 'skip',
            });
        }
    } catch (e) {
        console.log(e);
    }
}

function hideDialog() {
    hmUI.deleteWidget(vc), (vc = null);
    hmUI.redraw();
}

const timePickerCb = (timer = false) => (picker, event_type, column, value_index) => {
    const dTime = dateTime;

    if (event_type == 1) {
        // changedTimer = true;
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
    } else if (event_type == 2) {
        // done
        if (!changedHour) dTime.setHours(0);
        if (!changedMin) dTime.setMinutes(5);
        if (!changedSec) dTime.setSeconds(0);

        setupAlarm(dTime, timer);
        hideDialog();

        changedHour = undefined
        changedMin = undefined
    }
} // end timePickerCb

export function selectTime(timer = false, vc) {
    vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 0,
    });
    // just show time
    showTime = getCurrentTime()
    const h = !timer ? showTime.getHours() : 0
    const m = !timer ? showTime.getMinutes() : 5
    if (!timer) {
        dateTime = new Date();
        dateTime.setMinutes(dateTime.getMinutes() + 5);
    }

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
        picker_cb: timePickerCb(timer),
    });
} // end selectTime
