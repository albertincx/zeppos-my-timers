import hmUI from "@zos/ui";

import {DEVICE_HEIGHT, DEVICE_WIDTH} from "../utils/utils";

/**
 * Универсальное модальное окно с затемнением фона
 *
 * @param {Object} options
 * @param {string} [options.message] - Текст сообщения по центру
 * @param {Function} [options.renderContent] - Функция для добавления кастомных виджетов внутрь контейнера `(vc) => {}`
 * @param {Array} [options.buttons=[]] - Массив кнопок [{ text, normal_color, press_color, click_func, ... }]
 * @param {number} [options.alpha=180] - Прозрачность темного фона (0-255)
 * @returns {Object} Экземпляр виджета VIEW_CONTAINER (для возможности ручного удаления через hmUI.deleteWidget)
 */
export function showModalWindow({message, renderContent, buttons = [], alpha = 180}) {
    // 1. Создаем контейнер на весь экран, перекрывающий текущий интерфейс
    let vc = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        scroll_enable: 0,
    });

    // 2. Полупрозрачный темный фон
    vc.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        color: 0x000000,
        alpha: alpha,
    });

    // 3. Текст сообщения (если передан)
    if (message) {
        vc.createWidget(hmUI.widget.TEXT, {
            x: 20,
            y: DEVICE_HEIGHT / 2 - 90,
            w: DEVICE_WIDTH - 40,
            h: 80,
            text: message,
            text_size: 30,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
            color: 0xffffff,
        });
    }

    // 4. Рендер кастомного контента (например, ссылки, картинки или дополнительные поля)
    if (typeof renderContent === 'function') {
        renderContent(vc);
    }

    // 5. Рендер кнопок управления
    if (buttons && buttons.length > 0) {
        const totalButtons = buttons.length;
        const buttonWidth = buttons.length === 1 ? 200 : (DEVICE_WIDTH - 60) / totalButtons;

        buttons.forEach((btnConfig, index) => {
            let xPos;
            if (totalButtons === 1) {
                xPos = DEVICE_WIDTH / 2 - buttonWidth / 2;
            } else {
                xPos = 20 + index * (buttonWidth + 20);
            }

            vc.createWidget(hmUI.widget.BUTTON, {
                x: btnConfig.x || xPos,
                y: btnConfig.y || DEVICE_HEIGHT / 2 + 20,
                w: btnConfig.w || buttonWidth,
                h: btnConfig.h || 60,
                text: btnConfig.text,
                text_size: btnConfig.text_size || 28,
                normal_color: btnConfig.normal_color ?? 0x555555,
                press_color: btnConfig.press_color ?? 0x333333,
                radius: btnConfig.radius ?? 16,
                click_func: () => {
                    // Автоматически закрываем модалку при клике, если не указано обратное
                    if (!btnConfig.preventAutoClose) {
                        hmUI.deleteWidget(vc);
                    }
                    if (btnConfig.click_func) {
                        btnConfig.click_func();
                    }
                },
            });
        });
    }

    return vc;
}
