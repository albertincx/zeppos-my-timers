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
            let dateTime = data.split('_')[2]
            console.log('data')
            console.log(data)
            for (let ii in globalData.localStorage) {
                console.log(ii, globalData.localStorage.getItem(ii))
            }

            let STORE_KEY = `${ALARM_KEY}${dateTime}`;
            dateTime = getTimeFromStr(dateTime);
            console.log('dateTime, STORE_KEY 1')
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
