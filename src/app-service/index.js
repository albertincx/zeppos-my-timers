import * as notificationMgr from "@zos/notification";
import {log} from "@zos/utils";
import {getText} from "@zos/i18n";

import {HOME_TARGET, REPEAT_TARGET, TIMER_PREFIX} from "../config/constants";
import {formatHumanTime} from "../utils/utils";

AppService({
    onInit(param) {
        this.invokeNotification(param);
    },
    invokeNotification(param) {
        log.debug('\n\nparam alarm notify', param)
        notificationMgr.notify({
            title: `${formatHumanTime(param, param.startsWith(TIMER_PREFIX))}`,
            content: getText("Its time, Repeat?"),
            vibrate: 6,
            actions: [
                {
                    text: getText("Go to App"),
                    file: HOME_TARGET,
                    param: 'skip',
                },
                {
                    text: getText("Repeat"),
                    file: REPEAT_TARGET,
                    param,
                },
            ],
        });
    },
});
