import * as notificationMgr from "@zos/notification";

import {HOME_TARGET, REPEAT_TARGET, TIMER_PREFIX} from "../config/constants";
import {formatHumanTime} from "../utils/utils";
import {log} from "@zos/utils";

AppService({
    onInit(param) {
        this.invokeNotification(param);
    },
    invokeNotification(param) {
        log.log('param alarm notify', param)
        notificationMgr.notify({
            title: `${formatHumanTime(param, param.startsWith(TIMER_PREFIX))}`,
            content: "Its time, Repeat?",
            vibrate: 6,
            actions: [
                {
                    text: "Go to App",
                    file: HOME_TARGET,
                    param: 'skip',
                },
                {
                    text: "Repeat",
                    file: REPEAT_TARGET,
                    param,
                },
            ],
        });
    },
});
