import {log} from "@zos/utils";
import hmUI from "@zos/ui";
import {setScrollLock} from "@zos/page";
import {getText} from "@zos/i18n";

import * as Styles from "zosLoader:../styles/style.[pf].layout.js";

import {DEVICE_HEIGHT, DEVICE_WIDTH, goHome, initSwipeBack} from "../utils/utils";
import {showModalWindow} from "../components/showModalWindow";

const {TIMER_BTN} = Styles;

Page({
    onInit(param) {
        if (param === 'skip') setScrollLock({lock: false});
        initSwipeBack(-1)
    },

    build() {
        let marginTop = 20;

        // 1. App Title
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: 1,
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
        let infoHeight = 300
        // 3. Developer Info
        hmUI.createWidget(hmUI.widget.TEXT, {
            x: 20,
            y: marginTop,
            w: DEVICE_WIDTH - 40,
            h: infoHeight,
            align_h: hmUI.align.CENTER_H,
            text: "Developer: Safiullin \nFeedback & Support:\n" +
                "If you encounter\n any issues or\n have suggestions, please \nfeel free to contact me \nat albertincx@gmail.com",
            text_size: 28,
            color: 0x409EFF,
        });

        marginTop += infoHeight;

        // 4. "Discussion Chat" Button
        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...TIMER_BTN,
            y: marginTop,
            text: "💬 " + getText('Discussion Chat'),
            text_size: 32,
            normal_color: 0x409EFF,
            press_color: 0x2d75bc,
            h: 60,
            click_func: () => {
                showModalWindow({
                    renderContent: (vc) => {
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
                    },
                    buttons: [
                        {
                            text: "Close",
                            normal_color: 0x555555,
                            press_color: 0x333333,
                        }
                    ]
                });
            },
        });

        marginTop += 80;

        // 5. Home Button
        hmUI.createWidget(hmUI.widget.BUTTON, {
            ...TIMER_BTN,
            y: marginTop,
            text: "↩️ " + getText('Home'),
            text_size: 32,
            h: 55,
            press_color: 0x409EFF,
            normal_color: 0x000000,
            click_func: goHome,
        });

        hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {});
    },

    onDestroy() {
        log.debug("About page destroyed");
    }
});
