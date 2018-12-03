import Cookies from 'js-cookie';

window.Cookies = window.Cookies || Cookies;
Cookies.KEYS = {
    CART_COUNT: 'cart_item_count',
    DROP_DOWN_SEARCH: 'latelysearch'
};

Cookies.setWithHost = function (key, name) {
    Cookies.set(key, name, {path: '/', domain: location.hostname});
};

const initCartCount = function () {
    const key = Cookies.KEYS.CART_COUNT;
    const callback = (count) => {
        $('._g-cart-count').text(count);
    }

    if (!Cookies.get(key)) {
        return $.get('/v2/item/count')
        .then((resp) => {
            if(resp.error){
                return $.Deferred().reject(resp)
            }

            if (resp.status === 200) {
                Cookies.setWithHost(key, resp.data.count);
            }
            return resp.data.count;
        })
        .then(callback, (err) => {
            console.error(err)
        })
    }

    callback(Cookies.get(key))
};

initCartCount();

export default Cookies;
