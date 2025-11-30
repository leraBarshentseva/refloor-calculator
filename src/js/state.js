import { STORAGE_KEY, DEFAULT_STATE } from './constants.js';

// функция для безопасного получения данных из localStorage
export const getInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return structuredClone(DEFAULT_STATE);

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.warn('Ошибка чтения данных, сброс калькулятора');
        localStorage.removeItem(STORAGE_KEY);
        return structuredClone(DEFAULT_STATE);
    }
};

export const state = getInitialState();

export const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const resetStateToDefaults = () => {
    // Используем structuredClone для создания полной копии
    // чтобы избежать мутаций оригинального объекта
    const defaults = structuredClone(DEFAULT_STATE);
    // Перезаписываем содержимое текущего объекта state (объявлен как const)
    Object.assign(state, defaults);
};