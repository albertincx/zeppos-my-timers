import {px} from "@zos/utils";
import {getDeviceInfo} from "@zos/device";

export const {width: DEVICE_WIDTH} = getDeviceInfo()

export const BUTTON_X = px(30);
export const BUTTON_W = DEVICE_WIDTH - 2 * BUTTON_X;
export const BUTTON_H = 110;
export const BUTTON_LIST = BUTTON_H + 20;

export const ADD_BUTTON = {
    x: BUTTON_X,
    w: BUTTON_W,
    h: px(60),
    press_color: 0x333,
    normal_color: 3355443,
    radius: 12,
    text_size: 28,
}

export const DELETE_BTN = {
    normal_color: undefined,
    press_color: undefined,
    normal_src: 'raw/deleteIcon.png',
    press_src: 'raw/deleteIcon.png',
}
export const EDIT_BTN = {
    normal_src: 'raw/stopIcon.png',
    press_src: 'raw/stopIcon.png',
    normal_color: undefined,
    press_color: undefined,
}

export const TIMER_BTN = {
    x: BUTTON_X,
    y: 0,
    w: BUTTON_W,
    h: BUTTON_H,
    press_color: 10066329,
    normal_color: 3355443,
    radius: 12,
    text_size: 32,
}
