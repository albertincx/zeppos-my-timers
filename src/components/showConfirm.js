import {getText} from "@zos/i18n";

import {showModalWindow} from "./showModalWindow";

export function showConfirm({message, onConfirm, onCancel, icon = ''}) {
    showModalWindow({
        message: message,
        alpha: 150,
        buttons: [
            {
                text: icon + getText('Yes!'),
                normal_color: 0x409EFF,
                press_color: 0x2d75bc,
                click_func: () => {
                    if (onConfirm) onConfirm();
                }
            },
            {
                text: getText('No!'),
                normal_color: 0x555555,
                press_color: 0x333333,
                click_func: () => {
                    if (onCancel) onCancel();
                }
            }
        ]
    });
}
