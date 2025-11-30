import { CLASSES} from './constants.js';

// Валидация инпутов
export const getCleanValue = (input) => {
    let value = parseFloat(input.value);

    if (isNaN(value)) return 0;

    if (value < 0) {
        value = Math.abs(value);
        input.value = value;
    }

    return value;
};

// Обновление текста в блоке расчета
export const updateText = (element, newText) => {
    if (element.textContent === newText) return;

    element.classList.remove(`${CLASSES.isUpdateText}`);
    element.textContent = newText;

    element.animate([
        { transform: 'scale(1)', color: 'inherit' },
        { transform: 'scale(1.1)', color: '#8CCB5E', offset: 0.5 },
        { transform: 'scale(1)', color: 'inherit' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });

};

// Отображение ошибки в блкое визуализации сегментов
export const showBrickError = (brickElement, message) => {
    const oldError = brickElement.querySelector('.visualizer__error-tooltip');
    if (oldError) oldError.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'visualizer__error-tooltip';
    tooltip.textContent = message;

    brickElement.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 3000);
};
