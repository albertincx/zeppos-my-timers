import hmUI from "@zos/ui";
import {getText} from "@zos/i18n";

import {DEVICE_HEIGHT, DEVICE_WIDTH} from "../utils/utils"; // пути могут отличаться

export function showConfirm(message, onConfirm, onCancel) {
    // 1. Создаем контейнер на весь экран, чтобы перекрыть текущий интерфейс
    let vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 0,
    });

    // 2. Полупрозрачный фон для затемнения
    vc.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        color: 0x000000,
        alpha: 150, // степень затемнения
    });

    // 3. Текст сообщения
    vc.createWidget(hmUI.widget.TEXT, {
        x: 40,
        y: DEVICE_HEIGHT / 2 - 120,
        w: DEVICE_WIDTH - 80,
        h: 80,
        text: message,
        text_size: 36,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        color: 0xffffff,
    });

    // 4. Кнопка "Да" (Подтвердить)
    vc.createWidget(hmUI.widget.BUTTON, {
        x: 40,
        y: DEVICE_HEIGHT / 2 - 20,
        w: (DEVICE_WIDTH - 100) / 2,
        h: 60,
        text: getText('Yes!'),
        text_size: 30,
        normal_color: 0x409EFF,
        press_color: 0x2d75bc,
        radius: 16,
        click_func: () => {
            hmUI.deleteWidget(vc);
            if (onConfirm) onConfirm();
        },
    });

    // 5. Кнопка "Нет" (Отмена)
    vc.createWidget(hmUI.widget.BUTTON, {
        x: DEVICE_WIDTH / 2 + 10,
        y: DEVICE_HEIGHT / 2 - 20,
        w: (DEVICE_WIDTH - 100) / 2,
        h: 60,
        text: getText('No!'),
        text_size: 30,
        normal_color: 0x555555,
        press_color: 0x333333,
        radius: 16,
        click_func: () => {
            hmUI.deleteWidget(vc);
            if (onCancel) onCancel();
        },
    });

    return vc;
}
