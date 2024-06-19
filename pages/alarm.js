import {log} from "@zos/utils";
import hmUI from "@zos/ui";
import {replace} from "@zos/router";
import * as alarmMgr from "@zos/alarm";
import * as Styles from "zosLoader:./style.[pf].layout.js";
import {putLiveTime} from "../components/time";
import {
    clearParam,
    getActiveId,
    getSortedKeys,
    getSortedObj,
    getTime,
    getTT,
    showHumanTimerStr,
    showHumanTimeStr,
    sortObjectByTimeKeys,
    splitObjectByValue
} from "../utils/utils";
import {selectTime, setupAlarm} from "../components/time/selectTime";
import {ALARM_KEY, HOME_TARGET} from "../config/constants";

const {DEVICE_WIDTH, BUTTON_Y, TIMER_BTN, BUTTON_LIST} = Styles;

//✓

const globalData = getApp()._options.globalData;
Page({
    state: {
        activeIds: [],
    },
    build() {
        putLiveTime();
        const that = this;
        const activeAlarms = alarmMgr.getAllAlarms();

        const {active, notActive} = splitObjectByValue(
            globalData.localStorage.store
            ,
            k => {
                const ma = getActiveId(k);
                if (ma && activeAlarms.includes(ma)) {
                    return ma;
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
                let ttRaw = globalData.localStorage.getItem(A_KEY);
                let tt = ttRaw;
                let activeId = getActiveId(ttRaw)
                if (activeId) {
                    if (!activeAlarms.includes(activeId)) {
                        ttRaw = clearParam(ttRaw)
                        tt = ttRaw
                        globalData.localStorage.setItem(A_KEY, ttRaw);
                        activeId = false
                    } else {
                        that.state.activeIds.push(activeId);
                    }
                }
                if (fromLs && !tt) {
                    ii -= 1
                    if (ii < 0) ii = 0
                    return;
                }
                ii += 1
                let mtt;
                let mttime;
                let name = '';
                try {
                    if (tt) {
                        mtt = getTT(tt);
                        if (mtt) {
                            name = mtt.name;
                            mttime = mtt.timeRaw;
                            tt = name && showHumanTimerStr(name) || mtt.time;
                        } else {
                            tt = showHumanTimeStr(new Date(tt * 1000));
                        }
                    }
                    const click_func = () => {
                        // start
                        if (fromLs && !activeId) {
                            const stDate = getTime(name);
                            if (stDate) setupAlarm(stDate, alarmIndex);
                        } else {
                            alarmMgr.cancel(activeId || alarmIndex);
                            replace({
                                url: HOME_TARGET,
                                params: 'skip',
                            });
                        }
                    };
                    if (activeId) {
                        putLiveTime({mttime, name}, hmUI, 75, BUTTON_Y + BUTTON_LIST * ii, click_func);
                    } else {
                        let txtSize = tt.length > 10 ? TIMER_BTN.text_size - 18 : TIMER_BTN.text_size;

                        hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            text_size: txtSize,
                            normal_color: activeId ? 0x1976d2 : TIMER_BTN.normal_color,
                            y: BUTTON_Y + BUTTON_LIST * ii,
                            text: `${fromLs ? (activeId ? '' : '') : 'Alarm '}${activeId ? '' : tt}`,
                            w: fromLs ? TIMER_BTN.w / 1.3 : TIMER_BTN.w,
                            click_func,
                        });
                    }

                    if (fromLs && mtt.timeRaw) {
                        let leftMini = 95;
                        hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            ...Styles.DELETE_BTN,
                            text: '',
                            h: activeId ? TIMER_BTN.h / 2 - 5 : TIMER_BTN.h,
                            x: DEVICE_WIDTH / 2 + leftMini,
                            y: BUTTON_Y + BUTTON_LIST * ii + 5,
                            w: TIMER_BTN.w / 5,
                            click_func: () => {
                                let deleteAlarm = alarmIndex;
                                if (fromLs) {
                                    globalData.localStorage.removeItem(alarmIndex);
                                    deleteAlarm = activeId;
                                }
                                if (deleteAlarm) alarmMgr.cancel(deleteAlarm)

                                replace({
                                    url: HOME_TARGET,
                                    params: 'skip',
                                });
                            },
                        });
                        activeId && hmUI.createWidget(hmUI.widget.BUTTON, {
                            ...TIMER_BTN,
                            ...Styles.EDIT_BTN,
                            h: TIMER_BTN.h / 2 - 5,
                            x: DEVICE_WIDTH / 2 + leftMini,
                            y: BUTTON_Y + BUTTON_LIST * ii + TIMER_BTN.h / 2 + 10,
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
        marginTopItems = listAlarms(savedActiveAlarms, true, 0);
        const marginTopItemsNA = listAlarms(savedNotActiveAlarms, true, marginTopItems);
        if (marginTopItemsNA) marginTopItems = marginTopItemsNA;

        // active alarms
        let marginTopItemsA = listAlarms(
            activeAlarms,
            false,
            marginTopItems
        );

        if (marginTopItemsA) marginTopItems = marginTopItemsA;

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
                selectTime(true)
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
