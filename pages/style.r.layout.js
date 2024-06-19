import {px} from "@zos/utils";
import {getDeviceInfo} from "@zos/device";

export const {width: DEVICE_WIDTH, height: DEVICE_HEIGHT} = getDeviceInfo()

export const BUTTON_X = px(70);
export const BUTTON_W = DEVICE_WIDTH - 2 * BUTTON_X;
export const BUTTON_Y = 0;
export const MARGIN_TOP = 20;
export const BUTTON_H = 120;
export const BUTTON_LIST = BUTTON_H + MARGIN_TOP;

export const ADD_BUTTON = {
    x: BUTTON_X,
    w: BUTTON_W,
    h: px(93),
    press_color: 0x333,
    normal_color: 3355443,
    radius: 16,
    text_size: 50,
}

export const DELETE_BTN = {
    normal_color: undefined,
    press_color: undefined,
    normal_src: 'deleteIcon.png',
    press_src: 'deleteIcon.png',
}
export const EDIT_BTN = {
    normal_src: 'stopIcon.png',
    press_src: 'stopIcon.png',
    normal_color: undefined,
    press_color: undefined,
}

export const TIMER_BTN = {
    x: BUTTON_X,
    y: BUTTON_Y,
    w: BUTTON_W,
    h: BUTTON_H,
    press_color: 10066329,
    normal_color: 3355443,
    radius: 16,
    text_size: 50,
};
