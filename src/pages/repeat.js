import {log} from "@zos/utils";
import {exit} from "@zos/router";

import {getTimeFromStr} from "../utils/utils";
import {ALARM_KEY, COUNTDOWN_KEY} from "../config/constants";

import {setupAlarm} from "../components/time/selectTime";

Page({
    onInit(param) {
        log.debug('\n\nrepeat start', param);
        this.invokeRepeat(param);
    },
    invokeRepeat(params) {
        let data = "";
        try {
            if (params && typeof params === 'string' && params !== 'skip') {
                data = params;
            }
        } catch (e) {
            log.debug('\nParse params error:', e);
        }
        if (data) {
            let dateTime = data.split('_')[2]
            // for (let ii in globalData.localStorage) {
            //     log.debug(ii, globalData.localStorage.getItem(ii))
            // }

            let STORE_KEY = `${params.startsWith('c_') ? COUNTDOWN_KEY : ALARM_KEY}`;
            STORE_KEY += `${dateTime}`
            dateTime = getTimeFromStr(dateTime);
            log.debug(`\ndateTime, dt = ${dateTime}`, "STORE_KEY=", STORE_KEY)

            setupAlarm(dateTime, STORE_KEY);
            setTimeout(() => {
                exit();
            }, 50)
        } else {
            log.debug('repeat timer skip');
        }
    },
    onDestroy() {
        log.debug('timer run destroy');
    }
});
