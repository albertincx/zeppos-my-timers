import {log} from "@zos/utils";
import {exit} from "@zos/router";

import {getTimeFromStr} from "../utils/utils";
import {ALARM_KEY} from "../config/constants";

import {setupAlarm} from "../components/time/selectTime";

const globalData = getApp()._options.globalData;

Page({
    onInit(param) {
        log.log('repeat start', param);
        this.invokeRepeat(param);
    },
    invokeRepeat(params) {
        log.log('repeat start 1', params);
        let data = "";
        try {
            if (params && typeof params === 'string' && params !== 'skip') {
                data = params;
            }
        } catch (e) {
            log.log('Parse params error:', e);
        }
        if (data) {
            log.log(data);
            let dateTime = data.split('_')[2]
            dateTime = getTimeFromStr(dateTime);
            console.log(globalData.localStorage)
            let STORE_KEY = `${ALARM_KEY}${dateTime}`;
            console.log('dateTime, STORE_KEY')
            console.log(dateTime, STORE_KEY)
            setupAlarm(dateTime, STORE_KEY);
            setTimeout(() => {
                exit();
            }, 50)
        } else {
            log.log('repeat start 2 skip');
        }
    },
    onDestroy() {
        log.log('run destroy');
        // Очистка при необходимости
    }
});
