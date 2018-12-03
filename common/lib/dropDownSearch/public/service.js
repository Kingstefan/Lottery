import storage from '@lib/storage/index';

const STORAGE_KEY = 'latelysearch';
const MAX_LENGTH = 9;

const add = (list, val) => {
    return list.filter(item => item !== val).concat(val);
};

const write = (newVal) => {
    storage.setItem(STORAGE_KEY, newVal);
    return storage;
};

const getHistories = () => {
    const str = storage.getItem(STORAGE_KEY);

    if (str === undefined || str === null || str === '') {
        storage.setItem(STORAGE_KEY, '');
        return [];
    }

    return str.split(',');
};

export default {
    get() {
        return getHistories().reverse(); // 从近到远逆序展示
    },
    addItem(value) {
        let newVal;

        if (!value || value.trim() === '') {
            return false;
        }

        newVal = add(getHistories(), value.toString().trim());

        if (newVal.length > MAX_LENGTH) {
            newVal = newVal.slice(-MAX_LENGTH);
        }

        write(newVal);
    },
    removeItem(value) {
        write(getHistories().filter(item => item !== value));
    },
    clear() {
        write([]);
    },
    isSupport() {
        return !!storage;
    }
};
