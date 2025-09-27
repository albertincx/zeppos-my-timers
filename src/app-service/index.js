import * as notificationMgr from "@zos/notification";

AppService({
    onInit(params) {
        this.invokeNotification(params);
    },
    invokeNotification() {
        notificationMgr.notify({
            title: "My Timer",
            content: "Its time ...",
            vibrate: 6,
            actions: [
                {
                    text: "Go to timers",
                    file: "pages/alarm",
                    param: 'skip',
                },
            ],
        });
    },
});
