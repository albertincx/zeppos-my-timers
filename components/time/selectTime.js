import hmUI from "@zos/ui";
import {
    clearParam,
    DEVICE_HEIGHT,
    DEVICE_WIDTH,
    getAlarmTime,
    getCurrentTime,
    getTimeStr,
    showTimeVal
} from "../../utils/utils";
import * as alarmMgr from "@zos/alarm";

import {replace} from "@zos/router";
// import {showToast} from "@zos/interaction";

import {ALARM_KEY, ALARM_TARGET, COUNTDOWN_KEY, HOME_TARGET} from "../../config/constants";

let dateTime = new Date();
// visible time
let showTime;
// old time for countDown
let oldDate;
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
    if (!dTime) return;

    try {
        const isCreateTimer = timer === true;
        const isStartTimer = typeof timer === 'string';
        let name = getTimeStr(dTime);
        alarmObj.time = getAlarmTime(dTime);
        let paramVal = `${timer ? 't_' : 'c_'}${alarmObj.time}${name ? `_${name}` : ''}`;
        alarmObj.param = paramVal;

        let STORE_KEY = `${timer ? ALARM_KEY : COUNTDOWN_KEY}${name}`;
        if (timer && typeof timer === 'string') STORE_KEY = timer

        const exists = globalData.localStorage.getItem(STORE_KEY);
        let id;
        if (isCreateTimer) {
            id = -1
        } else {
            if (!timer && exists) {
                //
            } else {
                id = alarmMgr.set(alarmObj);
            }
        }
        if (id === 0) {
            // cant setup
            console.log('cant setup id');
            console.log(id);
        } else {
            // save w Time
            if (timer) {
                if (isCreateTimer && exists) {
                    paramVal = '';
                }
            } else {
                if (exists) paramVal = '';
            }
            if (isStartTimer || (!timer && !exists)) {
                paramVal = clearParam(paramVal) + `_=${id}=`;
            }
            if (paramVal) {
                globalData.localStorage.setItem(STORE_KEY, paramVal);
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
        // let s;
        // done
        if (!changedHour) {
            dTime.setHours(0);
        } else {
            if (!timer) {
                dTime.setHours(showTime.getHours() - oldDate.getHours());
            }
        }

        if (!changedMin) {
            if (timer) {
                dTime.setMinutes(5);
            } else {
                dTime.setMinutes((showTime.getMinutes()) - oldDate.getMinutes());
            }
        } else {
            if (!timer) {
                dTime.setMinutes(showTime.getMinutes() - oldDate.getMinutes());
            }
        }

        if (!changedSec) dTime.setSeconds(0);

        // showToast({content: `${JSON.stringify(dTime)}`});
        setupAlarm(dTime, timer);
        hideDialog(vc);

        changedHour = undefined
        changedMin = undefined
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
    showTime.setMinutes(showTime.getMinutes() + 5);
    const h = !timer ? showTime.getHours() : 0
    const m = !timer ? showTime.getMinutes() : 5
    dateTime = new Date();
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
