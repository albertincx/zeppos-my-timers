import * as notificationMgr from "@zos/notification";

import {HOME_TARGET, REPEAT_TARGET} from "../config/constants";

AppService({
    onInit(param) {
        this.invokeNotification(param);
    },
    invokeNotification(param) {
        console.log('param alarm notify', param)
        notificationMgr.notify({
            title: "My Timer",
            content: "Its time ..",
            vibrate: 6,
            actions: [
                {
                    text: "Go to timers",
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
