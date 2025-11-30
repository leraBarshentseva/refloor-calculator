export const STORAGE_KEY = 'refloor_calculator_state';

export const CLASSES = {
    brick: 'visualizer__brick',
    brickMain: 'visualizer__brick--base',
    brickAdd: 'visualizer__brick--add',
    brickRemove: 'visualizer__brick--remove',
    input: 'visualizer__brick-input',
    removeButton: 'visualizer__brick-remove',
    areaBrick: 'visualizer__brick-area',
    errorBrick: 'is-error',
    isDeleting: 'is-deleting',
    isAppearing: 'is-appearing',
};

export const DEFAULTS = {
    MATERIAL: 'pvc',
    LAYING: 'direct',
    MAIN_WIDTH: 3.0,
    MAIN_LENGTH: 4.0
};

export const DEFAULT_STATE = {
    mainRoom: {
        width: DEFAULTS.MAIN_WIDTH,
        length: DEFAULTS.MAIN_LENGTH,
    },
    segments: [
    ],
    materialType: DEFAULTS.MATERIAL,
    layingMethod: DEFAULTS.LAYING,
};

export const MATERIAL_DATA = {
    'pvc': {
        price: 1200, //цена м2
        packSize: 2.5, //м2 в одной упаковке
    },
    'spc-laminate': {
        price: 1800,
        packSize: 2.2,
    },
    'quartz-parquet': {
        price: 2500,
        packSize: 1.8,
    }
};

export const LAYING_DATA = {
    'direct': {
        waste: 5 // процент запаса
    },
    'diagonal': {
        waste: 10
    },
    'herringbone': {
        waste: 15
    }

};