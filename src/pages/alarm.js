import {log} from "@zos/utils";
import hmUI from "@zos/ui";
import {replace} from "@zos/router";
import * as alarmMgr from "@zos/alarm";
import {getText} from "@zos/i18n";
import {showToast} from "@zos/interaction";

import {setScrollLock} from '@zos/page'

import * as Styles from "zosLoader:./style.[pf].layout.js";

import {putLiveTime} from "../components/time";
import {showConfirm} from "../components/showConfirm";
import {
    clearParam,
    getActiveId,
    getSortedKeys,
    getSortedObj,
    getTimeFromStr,
    getTT,
    goHome,
    initSwipeBack,
    showHumanTimerStr,
    showHumanTimeStr,
    sortObjectByTimeKeys,
    splitObjectByValue
} from "../utils/utils";
import {selectTime, setupAlarm} from "../components/time/selectTime";
import {ABOUT_TARGET, ALARM_KEY, COUNTDOWN_KEY} from "../config/constants";

const {DEVICE_WIDTH, BUTTON_Y, TIMER_BTN} = Styles;
const globalData = getApp()._options.globalData;

let selectTimeVc = null;
let globalTimer = null;
let updateCallbacks = []; // Массив функций обновления

Page({
    state: {
        activeIds: [],
    },
    onInit(param) {
        if (param === 'skip') {
            setScrollLock({lock: false});
        }
        // Очищаем массив при инициализации
        updateCallbacks = [];

        const runScheduledTask = () => {
            updateCallbacks.forEach(cb => cb());
        };

        globalTimer = setInterval(runScheduledTask, 1000);

        initSwipeBack(() => selectTimeVc);
    },
    build() {
        let mcb = putLiveTime('main');
        updateCallbacks.push(mcb)

        const that = this;
        const activeAlarms = alarmMgr.getAllAlarms();
        const conditionFunction = (k, v) => {
            const activeId = getActiveId(v);
            if (activeId) {
                if (activeAlarms.includes(activeId)) return activeId;

                // remove expired countdown
                if (k.match(COUNTDOWN_KEY)) {
                    globalData.localStorage.removeItem(k);
                    return -1;
                }
            }
        }
        const {active, notActive} = splitObjectByValue(
            globalData.localStorage.store,
            conditionFunction,
        );
        let sortActiveObj = getSortedObj(active);
        let sortNotActiveObj = getSortedObj(notActive);
        sortActiveObj = sortObjectByTimeKeys(sortActiveObj);
        function listAlarms(alarms, fromLs = false, iiParam = 0) {
            if (alarms.length === 0) return 0

            let ii = iiParam;
            // render alarms
            alarms.forEach((alarmNumOrKey) => {
                const A_KEY = fromLs ? alarmNumOrKey : `${ALARM_KEY}${alarmNumOrKey}`;
                if (!fromLs && that.state.activeIds.includes(alarmNumOrKey)) {
                    return;
                }
                let storeVal = globalData.localStorage.getItem(A_KEY);

                const isCountDown = !!A_KEY.match(COUNTDOWN_KEY);

                if (!fromLs && !storeVal) {
                    storeVal = globalData.localStorage.getItem(`${COUNTDOWN_KEY}${alarmNumOrKey}`)
                }
                let timeRaw = storeVal;
                let activeId = getActiveId(storeVal)
                if (activeId) {
                    if (!activeAlarms.includes(activeId)) {
                        storeVal = clearParam(storeVal)
                        timeRaw = storeVal
                        globalData.localStorage.setItem(A_KEY, storeVal);
                        activeId = false
                    } else {
                        that.state.activeIds.push(activeId);
                    }
                }
                if (fromLs && !timeRaw) {
                    ii -= 1
                    if (ii < 0) ii = 0
                    return;
                }
                ii += 1
                let mtt;
                let alarmTime;
                let name = '';
                try {
                    if (timeRaw) {
                        mtt = getTT(timeRaw);
                        if (mtt) {
                            name = mtt.name;
                            alarmTime = mtt.timeRaw;
                            timeRaw = name && showHumanTimerStr(name) || mtt.time;
                        } else {
                            timeRaw = showHumanTimeStr(new Date(timeRaw * 1000));
                        }
                    }
                    const dateFromStr = getTimeFromStr(name);
                    const click_func = () => {
                        if (fromLs) {
                            if (!activeId) {
                                // start saved timer
                                setupAlarm(dateFromStr, alarmNumOrKey);
                                setTimeout(() => {
                                    goHome()
                                }, 50)
                            } else {
                                showToast({
                                    content: `${showHumanTimerStr(name)}${isCountDown ? ' countdown' : ' timer'}`
                                })
                            }
                            log.debug('from ls')
                            return;
                        }

                        alarmMgr.cancel(activeId || alarmNumOrKey);
                        goHome()
                    };

                    if (activeId) {
                        let updActiveTimer = putLiveTime({
                            alarmTime: alarmTime || alarmNumOrKey,
                            dateFromStr,
                            isCountDown
                        }, 75, BUTTON_Y + Styles.BUTTON_LIST * ii, click_func);
                        // put for redraw
                        updateCallbacks.push(updActiveTimer);
                    } else {
                        let txtSize = timeRaw && timeRaw.length >= 10 ? TIMER_BTN.text_size - 10 : TIMER_BTN.text_size;
                        let text = `${fromLs ? '' : 'Alarm '}${activeId ? '' : (timeRaw || alarmNumOrKey)}`;
                        hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            text_size: txtSize,
                            normal_color: activeId ? 0x1976d2 : TIMER_BTN.normal_color,
                            y: BUTTON_Y + Styles.BUTTON_LIST * ii,
                            text,
                            w: fromLs ? TIMER_BTN.w / 1.3 : TIMER_BTN.w,
                            click_func,
                        });
                    }
                    if (fromLs) {
                        let leftMini = 95;
                        !isCountDown && hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            ...Styles.DELETE_BTN,
                            text: '',
                            h: activeId ? TIMER_BTN.h / 2 - 5 : TIMER_BTN.h,
                            x: DEVICE_WIDTH / 2 + leftMini,
                            y: BUTTON_Y + Styles.BUTTON_LIST * ii + 5,
                            w: TIMER_BTN.w / 5,
                            click_func: () => {
                                showConfirm({
                                    message: getText('Delete?'),
                                    onConfirm: () => {
                                        let deleteAlarm = activeId || alarmNumOrKey;
                                        globalData.localStorage.removeItem(alarmNumOrKey);
                                        if (deleteAlarm) alarmMgr.cancel(deleteAlarm);
                                        goHome()
                                    },
                                    icon: "🗑️ ",
                                });
                            },
                        });
                        let offsetEdit = TIMER_BTN.h / 2 + 10;
                        if (isCountDown) offsetEdit = 0;
                        activeId && hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            ...Styles.EDIT_BTN,
                            h: !isCountDown ? TIMER_BTN.h / 2 - 5 : TIMER_BTN.h,
                            x: DEVICE_WIDTH / 2 + leftMini,
                            y: BUTTON_Y + Styles.BUTTON_LIST * ii + offsetEdit,
                            w: TIMER_BTN.w / 5,
                            click_func: () => {
                                showConfirm({
                                    message: getText('Stop?'),
                                    onConfirm: () => {
                                        alarmMgr.cancel(activeId);
                                        goHome()
                                    },
                                    icon: "⏹️ ",
                                });
                            },
                        });
                    }
                } catch (e) {
                    log.debug(`err2 ${e}`);
                }
            });

            return ii
        } // end listAlarms()

        // List notification list items
        let marginTopItems = 0;
        let savedActiveAlarms = getSortedKeys(sortActiveObj);
        let savedNotActiveAlarms = getSortedKeys(sortNotActiveObj);

        // render saved active timers or countdowns
        marginTopItems = listAlarms(savedActiveAlarms, true, marginTopItems);

        // render saved not active timers or countdowns
        const marginTopItemsNA = listAlarms(savedNotActiveAlarms, true, marginTopItems);
        if (marginTopItemsNA) marginTopItems = marginTopItemsNA;

        // render active alarms
        let marginTopItemsA = listAlarms(activeAlarms, false, marginTopItems);

        if (marginTopItemsA) marginTopItems = marginTopItemsA;

        const sB = {...Styles.TIMER_BTN};

        marginTopItems += 1;

        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...sB,
            h: TIMER_BTN.h,
            w: DEVICE_WIDTH / 2,
            x: DEVICE_WIDTH / 4,
            text: '✚' + getText('Timer') + '⏰',
            text_size: 40,
            y: BUTTON_Y + Styles.BUTTON_LIST * marginTopItems,
            click_func: function () {
                let _selectTimeVc = selectTime(true)
                selectTimeVc = _selectTimeVc.vc
                setScrollLock({lock: true})
            },
        });

        marginTopItems += 1;

        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...sB,
            h: TIMER_BTN.h,
            text: '🚀' + getText('COUNTDOWN') + '⏳',
            text_size: 40,
            press_color: 0x409EFF,
            normal_color: 0x409EFF,
            y: BUTTON_Y + Styles.BUTTON_LIST * marginTopItems,
            click_func: function () {
                let _selectTimeVc = selectTime(false)
                selectTimeVc = _selectTimeVc.vc
                setScrollLock({lock: true})
            },
        });

        marginTopItems += 1;

        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...sB,
            x: DEVICE_WIDTH / 2 - 110,
            w: 230,
            h: 55,
            text: 'ℹ️ ' + getText('About'),
            text_size: 26,
            radius: 16,
            press_color: 0x409EFF,
            normal_color: 0x000000,
            y: BUTTON_Y + Styles.BUTTON_LIST * marginTopItems,
            click_func: function () {
                replace({
                    url: ABOUT_TARGET,
                    params: 'skip',
                });
            },
        });
        // Show scrollbar
        hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {});
    },
    onDestroy() {
        log.debug("page on destroy invoke");
        if (globalTimer) {
            clearInterval(globalTimer);
            globalTimer = null;
            log.debug("timer cleared");
        }
        updateCallbacks = [];
    },
});
