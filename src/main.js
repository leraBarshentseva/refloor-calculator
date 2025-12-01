import './scss/style.scss';

import { CLASSES, MATERIAL_DATA, LAYING_DATA } from './js/constants.js';
import { getCleanValue, updateText, showBrickError } from './js/utils.js';
import { state, saveToStorage, clearStorage, resetStateToDefaults } from './js/state.js';

const DOM = {
    mainRoom: {
        widthInput: document.getElementById('width'),
        lengthInput: document.getElementById('length'),
    },
    baseBrick: {
        width: document.getElementById('base-brick-width'),
        length: document.getElementById('base-brick-length'),
        area: document.getElementById('base-brick-area'),
    },
    buttons: {
        addSegment: document.querySelector('[data-action="add-segment"]'),
        subtractSegment: document.querySelector('[data-action="subtract-segment"]'),
        resetButton: document.querySelector('.calculator__reset-btn'),
    },
    selects: {
        materialType: document.getElementById('material-type'),
        layingMethod: document.getElementById('laying-method'),
    },
    containers: {
        visualizer: document.querySelector('.calculator__visualizer'),
    },
    results: {
        area: document.getElementById('result-area'),
        waste: document.getElementById('result-waste'),
        material: document.getElementById('result-material'),
        totalPrice: document.getElementById('result-total-price'),
        packSize: document.getElementById('result-pack-size'),
        packCount: document.getElementById('result-pack-count'),
        pricePerMeter: document.getElementById('result-price-per-meter'),
    }
};

const calculate = () => {
    let totalArea = state.mainRoom.width * state.mainRoom.length;

    if (state.segments.length > 0) {
        state.segments.forEach(segment => {
            const segmentArea = segment.width * segment.length;
            totalArea += segment.type === 'add' ? segmentArea : -segmentArea;
        });
    }

    totalArea = Math.max(0, totalArea);

    const material = MATERIAL_DATA[state.materialType];
    const laying = LAYING_DATA[state.layingMethod];
    const wastePercent = laying.waste;
    const wasteArea = totalArea * (wastePercent / 100);
    const totalAreaWithWaste = totalArea + wasteArea;

    const packsNeeded = Math.ceil(totalAreaWithWaste / material.packSize);
    const finalAreaToBuy = packsNeeded * material.packSize;
    const totalPrice = finalAreaToBuy * material.price;

    return { baseArea: totalArea, wastePercent, wasteArea, finalAreaToBuy, totalPrice, packsNeeded, packSize: material.packSize, pricePerMeter: material.price };
};

// Сброс расчета
const resetCalculator = () => {
    if (!confirm('Вы уверены, что хотите сбросить расчет?')) return;

    resetStateToDefaults();
    clearStorage();
    resetToBricks();

    renderSelects();
    renderMainInputs();
    renderBaseBrick();

    updateResults();
};

const removeSegment = (id) => {
    state.segments = state.segments.filter(segment => segment.id !== id);
    renderRemoveSegment(id);
    updateResults();
};

const renderRemoveSegment = (id) => {
    const brickToRemove = DOM.containers.visualizer.querySelector(`[data-id="${id}"]`);
    if (brickToRemove) {
        brickToRemove.classList.add(CLASSES.isDeleting);
        setTimeout(() => {
            brickToRemove.remove();
        }, 300);
    }
};

const getNextSegmentNumber = (type, currentId) => {
    let count = 0;
    for (const segment of state.segments) {
        if (segment.type === type) {
            count++;
            if (segment.id === currentId) {
                return count;
            }
        }
    }
    return count;
};

const addSegment = (type) => {
    const newSegment = {
        id: crypto.randomUUID(),
        type: type,
        width: 0,
        length: 0
    };

    state.segments.push(newSegment);
    renderNewSegment(newSegment);
    updateResults();

    const newBrick = DOM.containers.visualizer.querySelector(`[data-id="${newSegment.id}"]`);
    
    if (newBrick) {
        const firstInput = newBrick.querySelector('input[name="width"]');

        if (firstInput) {
            firstInput.focus();
        }
    }
};

const renderNewSegment = (segment) => {
    const segmentHTML = createSegmentHTML(segment);
    DOM.containers.visualizer.insertAdjacentHTML('beforeend', segmentHTML);
};

const createSegmentHTML = (segment) => {
    const segmentNumber = getNextSegmentNumber(segment.type, segment.id);
    const typeClass = segment.type === 'add' ? CLASSES.brickAdd : CLASSES.brickRemove;
    const title = segment.type === 'add' ? `Доп. площадь #${segmentNumber}` : `Вычет #${segmentNumber}`;
    const areaPrefix = segment.type === 'add' ? '+' : '−';
    const area = segment.width * segment.length;

    const segmentHTML = `
      <div class="${CLASSES.brick} ${typeClass} ${CLASSES.isAppearing}" data-id="${segment.id}">
        <h5 class="visualizer__brick-title">${title}</h5>
        <button class="${CLASSES.removeButton}" aria-label="Удалить этот сегмент">×</button>
        <div class="visualizer__brick-body">
          <div class="visualizer__brick-group">
            <span class="visualizer__brick-label">Ширина</span>
            <input class="${CLASSES.input}" name="width" type="number" value="${segment.width}" min="0">
          </div>
          <span>×</span>
          <div class="visualizer__brick-group">
            <span class="visualizer__brick-label">Длина</span>
            <input class="${CLASSES.input}" name="length" type="number" value="${segment.length}" min="0">
          </div>
        </div>
        <div class="${CLASSES.areaBrick}">${areaPrefix} S = ${area.toFixed(2)} м<sup>2</sup></div>
      </div>
    `;

    return segmentHTML;
};

const renderResult = (results) => {
    updateText(DOM.results.area, `${results.baseArea.toFixed(2)} м²`);
    updateText(DOM.results.waste, `${results.wasteArea.toFixed(2)} м² (${results.wastePercent}%)`);
    updateText(DOM.results.material, `${results.finalAreaToBuy.toFixed(2)} м²`);

    updateText(DOM.results.packSize, `${results.packSize} м²`);
    updateText(DOM.results.packCount, `${results.packsNeeded} шт.`);

    updateText(DOM.results.pricePerMeter, `${results.pricePerMeter.toLocaleString('ru-RU')} ₽`);
    updateText(DOM.results.totalPrice, `${results.totalPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽`);
};

const updateResults = () => {
    saveToStorage();

    const results = calculate();
    renderResult(results);
};

const renderBaseBrick = () => {
    DOM.baseBrick.width.value = state.mainRoom.width;
    DOM.baseBrick.length.value = state.mainRoom.length;
    DOM.baseBrick.area.innerHTML = `S = ${(state.mainRoom.width * state.mainRoom.length).toFixed(2)} м<sup>2</sup>`;
};

const renderSegments = () => {
    if (state.segments.length === 0) return;

    state.segments.forEach(segment => {
        renderNewSegment(segment);
    });
};

const renderSelects = () => {
    if (DOM.selects.materialType) DOM.selects.materialType.value = state.materialType;
    if (DOM.selects.layingMethod) DOM.selects.layingMethod.value = state.layingMethod;
};

const renderMainInputs = () => {
    DOM.mainRoom.widthInput.value = state.mainRoom.width;
    DOM.mainRoom.lengthInput.value = state.mainRoom.length;
};

const resetToBricks = () => {
    const bricksToRemove = DOM.containers.visualizer.querySelectorAll(`.${CLASSES.brick}:not(.${CLASSES.brickMain})`);
    bricksToRemove.forEach(brick => brick.remove());
};

const handleSegmentInput = (e) => {
    const input = e.target.closest(`.${CLASSES.input}`);
    if (!input) return;

    const brick = input.closest(`.${CLASSES.brick}`);
    if (brick.classList.contains(`${CLASSES.brickMain}`)) return;

    const segmentId = brick.dataset.id;
    const segment = state.segments.find(s => s.id === segmentId);

    const isWidth = input.name === 'width';
    const isLength = input.name === 'length';

    const value = getCleanValue(input);

    if (segment.type === 'subtract') {
        let availableArea = state.mainRoom.width * state.mainRoom.length;

        state.segments.forEach(segment => {
            if (segment.id === segmentId) return;

            const area = segment.width * segment.length;

            if (segment.type === 'add') availableArea += area;
            else availableArea -= area;
        });

        const potentialWidth = isWidth ? value : segment.width;
        const potentialLength = isLength ? value : segment.length;
        const potentialArea = potentialLength * potentialWidth;

        // если вычет больше, чем есть места, то оповещаем пользователя и сбрасываем в 0
        if (potentialArea > availableArea) {
            const widthInput = brick.querySelector('input[name="width"]');
            const lengthInput = brick.querySelector('input[name="length"]');

            widthInput.value = 0;
            lengthInput.value = 0;

            brick.classList.add(`${CLASSES.errorBrick}`);

            setTimeout(() => {
                brick.classList.remove(`${CLASSES.errorBrick}`);
            }, 500);

            showBrickError(brick, 'Вычитаемая площадь больше исходной');

            segment.width = 0;
            segment.length = 0;

            const areaEl = brick.querySelector(`.${CLASSES.areaBrick}`);
            areaEl.innerHTML = `− S = 0.00 м<sup>2</sup>`;

            updateResults();
            return;
        }
    }

    if (isWidth) segment.width = value;
    if (isLength) segment.length = value;

    const areaEl = brick.querySelector(`.${CLASSES.areaBrick}`);
    const areaPrefix = segment.type === 'add' ? '+' : '−';
    const area = segment.width * segment.length;
    areaEl.innerHTML = `${areaPrefix} S = ${area.toFixed(2)} м<sup>2</sup>`;

    updateResults();
};

const init = () => {
    document.addEventListener('keydown', (e) => {
        if (e.target.type === 'number') {
            const invalidCharts = ['-', '+', 'e', 'E'];

            if (invalidCharts.includes(e.key)) {
                e.preventDefault();
            }
        }
    });

    DOM.containers.visualizer.addEventListener('animationend', (e) => {
        if (e.target.classList.contains(`${CLASSES.isAppearing}`)) {
            e.target.classList.remove(`${CLASSES.isAppearing}`);
        }
    });

    DOM.buttons.resetButton.addEventListener('click', resetCalculator);

    DOM.buttons.addSegment.addEventListener('click', (e) => {
        e.preventDefault();
        addSegment('add')
    });

    DOM.buttons.subtractSegment.addEventListener('click', (e) => {
        e.preventDefault();
        addSegment('subtract')
    });

    DOM.mainRoom.widthInput.addEventListener('input', (e) => {
        state.mainRoom.width = getCleanValue(DOM.mainRoom.widthInput);
        renderBaseBrick();
        updateResults();
    });

    DOM.mainRoom.lengthInput.addEventListener('input', (e) => {
        state.mainRoom.length = getCleanValue(DOM.mainRoom.lengthInput);
        renderBaseBrick();
        updateResults();
    });

    DOM.selects.materialType.addEventListener('change', () => {
        state.materialType = DOM.selects.materialType.value;
        updateResults();
    });

    DOM.selects.layingMethod.addEventListener('change', () => {
        state.layingMethod = DOM.selects.layingMethod.value;
        updateResults();
    });

    DOM.containers.visualizer.addEventListener('click', (e) => {
        const removeButton = e.target.closest(`.${CLASSES.removeButton}`);
        if (!removeButton) return;
        e.preventDefault();

        const brick = removeButton.closest(`.${CLASSES.brick}`);
        removeSegment(brick.dataset.id);
    });

    DOM.containers.visualizer.addEventListener('input', (e) => {
        handleSegmentInput(e);
    });

    DOM.containers.visualizer.addEventListener('focusin', (e) => {
        const input = e.target.closest(`.${CLASSES.input}`);
        if (!input) return;

        if (input.value === '0') {
            input.value = '';
        }
    });

    DOM.containers.visualizer.addEventListener('focusout', (e) => {
        const input = e.target.closest(`.${CLASSES.input}`);
        if (!input) return;

        if (input.value === '') {
            input.value = '0';
        }
    });

};

const startApp = () => {
    init();

    if (state.segments.length > 0) {
        renderSegments();
    }

    renderSelects();
    renderMainInputs();

    renderBaseBrick();
    updateResults();
};

startApp();