const appendParam = (url, obj) => {
    let append;

    if (!url) {
        url = '/';
    } else {
        url = url.trim();
    }

    append = $.map(obj, (val, key) => {
        return `${key}=${encodeURIComponent(val)}`;
    }).join('&');

    return [url, url.charAt(0) !== '?' ? '?' : '', append].join('');
};

const getParams = url => {
    let res = {},
        groups;

    if (!url || url.trim() === '') {
        url = location.search;
    }

    url = url.charAt(0) === '?' ? url.slice(1) : url;

    if (url === '') {
        return {};
    }

    groups = url.split('&');

    groups.forEach(item => {
        const parts = item.split('=');
        const key = parts[0];

        let value = decodeURIComponent(decodeURIComponent(parts[1]));

        // 0开头的字符串不做转换，比如0012345
        if (isFinite(value) && !/0\d+/.test(value)) {
            value = +value;
        }

        if (value === 'true' || value === 'false') {
            value = value === 'true';
        }

        res[key] = value;
    });

    return res;
};

export default {
    getParams,
    appendParam
};
