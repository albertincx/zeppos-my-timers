import * as hmUI from "@zos/ui";
import {getDeviceInfo} from "@zos/device";
import {Time} from "@zos/sensor";
import {log} from "@zos/utils";
import {getText} from "@zos/i18n";

import * as Styles from "zosLoader:../../pages/style.[pf].layout.js";

import {getSensorTime, getTimeStrMain, showHumanTimeStr} from "../../utils/utils";

export const {TIMER_BTN} = Styles
export const {width: DEVICE_WIDTH} = getDeviceInfo()
const timeSensor = new Time();

let animTimers = {};

function countdown(targetDate, {minusTime}) {
    const now = getSensorTime().getTime();
    const targetTime = targetDate.getTime();
    const timeLeft = targetTime - now;

    if (timeLeft < 0) {
        return {
            text: getText('Finished'),
            end: true
        };
    }

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
    const percent = Math.abs((current / total) * 100);

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

export function putLiveTime(name, x, y, click_func) {
    let minusTime, isCountDown = false;
    if (typeof name === 'object') {
        isCountDown = name.isCountDown;
        minusTime = name.dateFromStr;
        name = name.alarmTime + "";
    }

    if (!animTimers[name]) animTimers[name] = {minusTime, isCountDown};

    const isNotMain = name !== "main";

    function createWidget() {
        log.debug('init', name, typeof name)

        if (isNotMain) {
            const obj = countdown(new Date(name * 1000), animTimers[name])
            let percent = obj.percent || 100;
            let text = obj.text;

            let txtSize = text.length >= 10 ? 36 : 38;
            const tW = Math.floor(TIMER_BTN.w / 1.3)
            const ww = (tW / 100) * percent
            if (isCountDown) text = `Countdown\n${text}`
            const btn = hmUI.createWidget(hmUI.widget.BUTTON, {
                ...TIMER_BTN,
                y: y || 40,
                w: tW,
                text_size: txtSize,
                press_color: isCountDown ? 0x409EFF : 0xFF343934,
                normal_color: isCountDown ? 0x409EFF : 0xFF343934,
                text,
                click_func,
            });
            animTimers[name].rect = hmUI.createWidget(hmUI.widget.FILL_RECT, {
                ...TIMER_BTN,
                y,
                w: ww,
                text_size: txtSize,
                align_h: hmUI.align.CENTER_H,
                color: 0xffffff,
                alpha: 60,
            })
            return btn;
        }

        return hmUI.createWidget(hmUI.widget.TEXT, {
            x: x || 0,
            y: y || 60,
            w: DEVICE_WIDTH,
            h: 60,
            text_size: 38,
            align_h: hmUI.align.CENTER_H,
            color: 0xffffff,
            text: getTimeStrMain(timeSensor),
        });
    }

    if (!animTimers[name].wid) animTimers[name].wid = createWidget()

    function updateWidget() {
        if (!animTimers[name] || !animTimers[name].wid) return log.debug('exit', name)

        let text = ''

        if (isNotMain) {
            const t = new Date(name * 1000);

            const obj = countdown(t, animTimers[name]);
            text = obj.text;
            let percent = obj.percent || 100;
            if (obj.end) percent = 0;

            if (isCountDown) text = `Countdown\n${text}`;

            let txtSize = text.length >= 10 ? 36 : 38;
            animTimers[name].wid.setProperty(hmUI.prop.TEXT_SIZE, txtSize)

            if (animTimers[name].rect) {
                const tW = Math.floor(TIMER_BTN.w / 1.3);
                const ww = Math.max(0, Math.floor((tW / 100) * percent))
                animTimers[name].rect.setProperty(hmUI.prop.W, ww);
            }
        } else text = getTimeStrMain(timeSensor)

        animTimers[name].wid.setProperty(hmUI.prop.TEXT, text)
    }

    // return callback function, with each timer context (js power!)
    return updateWidget
}
