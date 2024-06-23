import * as hmUI from "@zos/ui";
import {getDeviceInfo} from "@zos/device";
import {Time} from "@zos/sensor";

import * as Styles from "zosLoader:../../pages/style.[pf].layout.js";

import {getTimeStr, showHumanTimeStr} from "../../utils/utils";

export const {TIMER_BTN} = Styles
export const {width: DEVICE_WIDTH} = getDeviceInfo()
const timeSensor = new Time();

let animTimers = {};

function countdown(targetDate, {minusTime}) {
    let percent = 100;
    const now = new Date().getTime();
    const targetTime = targetDate.getTime();
    const timeLeft = targetTime - now;

    if (timeLeft < 0) return {text: 'Finished'};

    const tmp = targetDate
    let startDate = targetTime;
    let endDate = 0;

    if (minusTime) {
        tmp.setHours(
            tmp.getHours() + minusTime.getHours(),
            tmp.getMinutes() + minusTime.getMinutes(),
            tmp.getSeconds() + minusTime.getSeconds(),
        );
        endDate = tmp.getTime();
    }

    const total = endDate - startDate;
    const current = now - startDate;
    percent = Math.abs((current / total) * 100);

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const text = showHumanTimeStr({
        getHours() {
            return hours
        },
        getMinutes() {
            return minutes
        },
        getSeconds() {
            return seconds
        }
    }, true)

    return {text, percent};
}

export function putLiveTime(name = 'main', vc = hmUI, x, y, click_func) {
    let minusTime, isCountDown = false;
    if (typeof name === 'object') {
        isCountDown = name.isCountDown;
        minusTime = name.dateFromStr;
        name = name.alarmTime;
    }
    if (!animTimers[name]) {
        animTimers[name] = {
            timerCount: 0,
            animTimer: null,
            minusTime,
            isCountDown
        };
    }

    const isNotMain = name !== "main";

    function createWid() {
        let text, t, percent;
        if (isNotMain) {
            t = new Date(name * 1000);
            const obj = countdown(t, animTimers[name])
            text = obj.text;
            percent = obj.percent || 100;
            if (isCountDown) {
                text = `Countdown\n${text}`
            }
        } else {
            text = 'Time: ' + getTimeStr(timeSensor)
        }
        if (isNotMain) {
            let txtSize = text.length > 10 ? 32 : 38;
            const tW = Math.floor(TIMER_BTN.w / 1.3)

            const btn = vc.createWidget(hmUI.widget.BUTTON, {
                ...TIMER_BTN,
                y: y || 40,
                w: tW,
                text_size: txtSize,
                press_color: 0xFF343934,
                normal_color: 0xFF343934,
                text,
                click_func,
            });

            animTimers[name].rect = vc.createWidget(hmUI.widget.FILL_RECT, {
                ...TIMER_BTN,
                y,
                w: (tW / 100) * percent,
                text_size: txtSize,
                align_h: hmUI.align.CENTER_H,
                color: 0xffffff,
                alpha: 60,
            })

            return btn;
        }

        return vc.createWidget(hmUI.widget.TEXT, {
            x: x || 0,
            y: y || 60,
            w: isNotMain ? DEVICE_WIDTH / 2 : DEVICE_WIDTH,
            h: 60,
            text_size: isNotMain ? 38 : 38,
            align_h: hmUI.align.CENTER_H,
            color: 0xffffff,
            text,
        });
    }

    function timerCB() {
        animTimers[name].timerCount = animTimers[name].timerCount + 1;
        if (animTimers[name].timerCount === 15) {
            animTimers[name].timerCount = 1;
        }
        hmUI.deleteWidget(animTimers[name].rect), (animTimers[name].rect = null);
        hmUI.deleteWidget(animTimers[name].wid), (animTimers[name].wid = null);
        animTimers[name].wid = createWid()
    }

    function animStart() {
        if (animTimers[name].animTimer === null) {
            animTimers[name].wid = createWid()
            animTimers[name].animTimer = setInterval(timerCB, 1000);
        }
    }

    animStart();
}
