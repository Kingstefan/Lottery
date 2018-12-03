import {CookieStorage, isSupported, MemoryStorage} from 'local-storage-fallback';

let storage = null;

if (isSupported('localStorage')) {
    // use localStorage
    storage = window.localStorage;
} else if (isSupported('cookieStorage')) {
    // use cookies
    storage = new CookieStorage();
}

const canLocalStorage = function () {
    return isSupported('localStorage');
};

const canSessionStorage = function () {
    return isSupported('sessionStorage');
};

export default storage;
export {isSupported, CookieStorage, canLocalStorage, canSessionStorage};
