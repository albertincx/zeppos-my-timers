import {log} from "@zos/utils";
import {LocalStorage} from "@zos/storage";

const logger = log.getLogger("app");

App({
    globalData: {},
    onCreate() {
        this.globalData.localStorage = new LocalStorage();
        logger.log("app onCreate");
    },
    onDestroy() {
        logger.log("app onDestroy");
    },
});
