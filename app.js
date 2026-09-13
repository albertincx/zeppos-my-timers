import {LocalStorage} from "@zos/storage";

App({
    globalData: {},
    onCreate() {
        this.globalData.localStorage = new LocalStorage();
    },
});
