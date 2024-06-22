import {log} from "@zos/utils";
import hmUI from "@zos/ui";
import {replace} from "@zos/router";
import * as alarmMgr from "@zos/alarm";
import {GESTURE_RIGHT, onGesture} from "@zos/interaction";

import * as Styles from "zosLoader:./style.[pf].layout.js";
import {putLiveTime} from "../components/time";
import {
    clearParam,
    getActiveId,
    getSortedKeys,
    getSortedObj,
    getTimeFromStr,
    getTT,
    showHumanTimerStr,
    showHumanTimeStr,
    sortObjectByTimeKeys,
    splitObjectByValue
} from "../utils/utils";
import {selectTime, setupAlarm} from "../components/time/selectTime";
import {ALARM_KEY, COUNTDOWN_KEY, HOME_TARGET} from "../config/constants";
import {setScrollLock} from '@zos/page'

const {DEVICE_WIDTH, BUTTON_Y, TIMER_BTN, BUTTON_LIST} = Styles;

//✓
let selectTimeVc = null;

const globalData = getApp()._options.globalData;
Page({
    state: {
        activeIds: [],
    },
    onInit(param) {
        if (param === 'skip') {
            setScrollLock({lock: false});
        }
        onGesture(function (event) {
            if (event === GESTURE_RIGHT) {
                if (selectTimeVc) {
                    replace({
                        url: HOME_TARGET,
                        params: 'skip',
                    });
                    //! in dialog
                    return true;
                }
            }
            return false;
        });
    },
    build() {
        putLiveTime();
        const that = this;
        const activeAlarms = alarmMgr.getAllAlarms();
        const {active, notActive} = splitObjectByValue(
            globalData.localStorage.store
            ,
            (k, v) => {
                const activeId = getActiveId(v);
                if (activeId) {
                    if (activeAlarms.includes(activeId)) return activeId;

                    if (k.match(COUNTDOWN_KEY)) {
                        globalData.localStorage.removeItem(k);
                        return -1;
                    }
                }
            },
            activeAlarms
        );
        let sortActiveObj = getSortedObj(active);
        let sortNotActiveObj = getSortedObj(notActive);
        sortActiveObj = sortObjectByTimeKeys(sortActiveObj);
        sortNotActiveObj = sortObjectByTimeKeys(sortNotActiveObj);

        function listAlarms(alarms, fromLs = false, iiParam = 0) {
            if (alarms.length === 0) return 0

            let ii = iiParam;
            // render alarms
            alarms.forEach((alarmIndex) => {
                const A_KEY = fromLs ? alarmIndex : `${ALARM_KEY}${alarmIndex}`;
                if (!fromLs && that.state.activeIds.includes(alarmIndex)) {
                    return;
                }
                let storeVal = globalData.localStorage.getItem(A_KEY);

                const isCountDown = !!A_KEY.match(COUNTDOWN_KEY);

                if (!fromLs && !storeVal) {
                    storeVal = globalData.localStorage.getItem(`${COUNTDOWN_KEY}${alarmIndex}`)
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
                                // start from store
                                setupAlarm(dateFromStr, alarmIndex);
                            }
                            return;
                        }

                        alarmMgr.cancel(activeId || alarmIndex);

                        replace({
                            url: HOME_TARGET,
                            params: 'skip',
                        });
                    };

                    if (activeId) {
                        putLiveTime({
                            alarmTime,
                            dateFromStr,
                            isCountDown
                        }, hmUI, 75, BUTTON_Y + BUTTON_LIST * ii, click_func);
                    } else {
                        let txtSize = timeRaw && timeRaw.length > 10 ? TIMER_BTN.text_size - 18 : TIMER_BTN.text_size;
                        let text = `${fromLs ? '' : 'Alarm '}${activeId ? '' : (timeRaw || alarmIndex)}`;

                        hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            text_size: txtSize,
                            normal_color: activeId ? 0x1976d2 : TIMER_BTN.normal_color,
                            y: BUTTON_Y + BUTTON_LIST * ii,
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
                            y: BUTTON_Y + BUTTON_LIST * ii + 5,
                            w: TIMER_BTN.w / 5,
                            click_func: () => {
                                let deleteAlarm = activeId || alarmIndex;
                                globalData.localStorage.removeItem(alarmIndex);

                                if (deleteAlarm) alarmMgr.cancel(deleteAlarm)

                                replace({
                                    url: HOME_TARGET,
                                    params: 'skip',
                                });
                            },
                        });
                        let offsetEdit = TIMER_BTN.h / 2 + 10;
                        if (isCountDown) offsetEdit = 0;
                        activeId && hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            ...Styles.EDIT_BTN,
                            // h: TIMER_BTN.h / 2 - 5,
                            h: !isCountDown ? TIMER_BTN.h / 2 - 5 : TIMER_BTN.h,
                            x: DEVICE_WIDTH / 2 + leftMini,
                            y: BUTTON_Y + BUTTON_LIST * ii + offsetEdit,
                            w: TIMER_BTN.w / 5,
                            click_func: () => {
                                alarmMgr.cancel(activeId);
                                replace({
                                    url: HOME_TARGET,
                                    params: 'skip',
                                });
                            },
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            });

            return ii
        } // end listAlarms()

        // List notification list items
        let marginTopItems = 0;
        let savedActiveAlarms = getSortedKeys(sortActiveObj);
        let savedNotActiveAlarms = getSortedKeys(sortNotActiveObj);
        // show stored
        marginTopItems = listAlarms(savedActiveAlarms, true, marginTopItems);
        const marginTopItemsNA = listAlarms(savedNotActiveAlarms, true, marginTopItems);
        if (marginTopItemsNA) {
            marginTopItems = marginTopItemsNA;
        }

        // active alarms
        let marginTopItemsA = listAlarms(
            activeAlarms,
            false,
            marginTopItems
        );

        if (marginTopItemsA) {
            marginTopItems = marginTopItemsA;
        }

        const sB = {...Styles.TIMER_BTN};
        marginTopItems += 1;
        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...sB,
            h: TIMER_BTN.h,
            w: DEVICE_WIDTH / 2,
            x: DEVICE_WIDTH / 4,
            text: '+TIMER',
            y: BUTTON_Y + BUTTON_LIST * marginTopItems,
            click_func: function () {
                selectTimeVc = selectTime(true)
                setScrollLock({lock: true})
            },
        });
        marginTopItems += 1;

        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...sB,
            h: TIMER_BTN.h,
            text: '+COUNTDOWN',
            text_size: 42,
            y: BUTTON_Y + BUTTON_LIST * marginTopItems,
            click_func: function () {
                selectTimeVc = selectTime(false)
                setScrollLock({lock: true})
            },
        });
        marginTopItems += 1;

        hmUI.createWidget(hmUI.widget.TEXT, {
            x: DEVICE_WIDTH / 3,
            h: 40,
            text: '',
            text_size: 22,
            y: BUTTON_Y + BUTTON_LIST * marginTopItems,
        });

        // Show scrollbar
        hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {});
    },
    onDestroy() {
        log.log("page on destroy invoke");
    },
});
