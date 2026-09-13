import {getPackageInfo} from "@zos/app";
import * as alarmMgr from "@zos/alarm";
import {log} from "@zos/utils";

import {ALARM_TARGET} from "../config/constants";

AppService({
    onInit(params) {
        this.delayAlarm(params);
    },
    delayAlarm(params) {
        log.log('SERVICE params 1', params)
        const {appId} = getPackageInfo();
        const alarm = {
            appid: appId,
            url: ALARM_TARGET,
            delay: 3,
            param: JSON.stringify(params),
            repeat_type: alarmMgr.REPEAT_ONCE,
            store: true,
        };
        alarmMgr.set(alarm);
    },
});
