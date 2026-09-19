import {log} from "@zos/utils";
import hmUI from "@zos/ui";
import {replace} from "@zos/router";
import {setScrollLock} from "@zos/page";
import {GESTURE_RIGHT, onGesture} from "@zos/interaction";
import {getText} from "@zos/i18n";

import * as Styles from "zosLoader:./style.[pf].layout.js";

import {DEVICE_HEIGHT, DEVICE_WIDTH} from "../utils/utils";
import {HOME_TARGET} from "../config/constants";


const {BUTTON_Y, TIMER_BTN} = Styles;

Page({
    onInit(param) {
        if (param === 'skip') {
            setScrollLock({lock: false});
        }

        onGesture(function (event) {
            if (event === GESTURE_RIGHT) {
                replace({
                    url: HOME_TARGET,
                    params: 'skip',
                });
                return true;
            }
            return false;
        });
    },

    build() {
        let marginTop = BUTTON_Y + 20;

        // 1. App Title
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: marginTop,
            w: DEVICE_WIDTH,
            h: 50,
            align_h: hmUI.align.CENTER_H,
            text: "⏰ My timers",
            text_size: 38,
            color: 0xffffff,
        });

        marginTop += 60;

        // 2. Version
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: marginTop,
            w: DEVICE_WIDTH,
            h: 40,
            align_h: hmUI.align.CENTER_H,
            text: "Version: 2.0",
            text_size: 26,
            color: 0xaaaaaa,
        });

        marginTop += 60;

        // 3. Developer Info
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 20,
            y: marginTop,
            w: DEVICE_WIDTH - 40,
            h: 90,
            align_h: hmUI.align.CENTER_H,
            text: "Developer:\n Safiullin (safiullin.com)",
            text_size: 28,
            color: 0x409EFF,
        });

        marginTop += 100;

        // 4. "Discussion Chat" Button
        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...TIMER_BTN,
            y: marginTop,
            text: "💬 " + getText('Discussion Chat'),
            text_size: 32,
            normal_color: 0x409EFF,
            press_color: 0x2d75bc,
            click_func: () => {
                let vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
                    x: 0,
                    y: 0,
                    w: DEVICE_WIDTH,
                    h: DEVICE_HEIGHT,
                    scroll_enable: 0,
                });

                vc.createWidget(hmUI.widget.FILL_RECT, {
                    x: 0,
                    y: 0,
                    w: DEVICE_WIDTH,
                    h: DEVICE_HEIGHT,
                    color: 0x000000,
                    alpha: 180,
                });

                vc.createWidget(hmUI.widget.TEXT, {
                    x: 20,
                    y: DEVICE_HEIGHT / 2 - 80,
                    w: DEVICE_WIDTH - 40,
                    h: 80,
                    align_h: hmUI.align.CENTER_H,
                    align_v: hmUI.align.CENTER_V,
                    text: "https://gram.ws/#zepp",
                    text_size: 30,
                    color: 0xffffff,
                });

                vc.createWidget(hmUI.widget.BUTTON, {
                    x: DEVICE_WIDTH / 2 - 100,
                    y: DEVICE_HEIGHT / 2 + 20,
                    w: 200,
                    h: 60,
                    text: "Close",
                    text_size: 28,
                    normal_color: 0x555555,
                    press_color: 0x333333,
                    radius: 16,
                    click_func: () => {
                        hmUI.deleteWidget(vc);
                    },
                });
            },
        });

        marginTop += Styles.BUTTON_LIST;

        // 5. Home Button
        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...TIMER_BTN,
            y: marginTop,
            text: "↩️ " + getText('Home'),
            text_size: 32,
            normal_color: 0x000000,
            press_color: 0x000000,
            click_func: () => {
                replace({
                    url: HOME_TARGET,
                    params: 'skip',
                });
            },
        });

        hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {});
    },

    onDestroy() {
        log.debug("About page destroyed");
    }
});
