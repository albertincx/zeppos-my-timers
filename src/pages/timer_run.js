import {log} from "@zos/utils";

import {setupAlarm} from "../components/time/selectTime";
import {getTimeFromStr} from "../utils/utils";
import {ALARM_KEY, COUNTDOWN_KEY, HOME_TARGET} from "../config/constants";
import {replace} from "@zos/router";
// Добавьте нужные импорты Zepp OS для работы с UI (например, @zos/ui, timer и т.д.)
const globalData = getApp()._options.globalData;
Page({
    onInit(param) {
        log.log('repeat start', param);
        this.invokeRepeat(param);
    },
    invokeRepeat(params) {
        // params содержат то, что передали из уведомления, например:
        // JSON.stringify({ action: 'repeat', duration: timerDuration })
        log.log('repeat start 1', params);

        console.log(params, params)
        let data = "";
        log.log(params);
        try {
            if (params && typeof params === 'string' && params !== 'skip') {
                data = params;
            }
        } catch (e) {
            log.log('Parse params error:', e);
        }

        // Если пришло действие повтора — вызываем логику создания/запуска таймера
        if (data) {
            log.log(data);
            // data.duration здесь выступает как dTime (длительность)
            // Передаем true или нужный флаг в зависимости от того, как у вас устроен timer
            let dateTime = data.split('_')[2]
            dateTime = getTimeFromStr(dateTime);

            // const exists = globalData.localStorage.getItem(STORE_KEY);
            // console.log('exists')
            // console.log(exists)
            console.log(globalData.localStorage)
            // dateTime += `_=${1}=`;
            let STORE_KEY = `${true ? ALARM_KEY : COUNTDOWN_KEY}${dateTime}`;
            console.log('dateTime, STORE_KEY')
            console.log(dateTime, STORE_KEY)
            setupAlarm(dateTime, STORE_KEY);
            setTimeout(() => {
                replace({
                    url: HOME_TARGET,
                    params: 'skip',
                });
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
