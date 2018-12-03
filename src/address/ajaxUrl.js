const serviceData = {
     removeSekector: function (item) {
         if (!item || !item.selector) return false;
         return item = item.selector.indexOf('#') != -1 ? item.selector.split('#')[1] : item.selector.split('.')[1];
     },
    getRequstdata: function (url, argument) {
        const that = this;
        let xhr = false;

        //const data = this.fitterStr(argument,'method');//干掉传值
        //argument.timestamp = parseInt(new Date().getTime() / 1000);
        var promise = new Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: argument.method || 'POST',
                dataType: 'json',
                cache: false,
                data: argument,
                beforeSend: function () {
                    if (xhr) {
                        xhr && xhr.abort();
                        xhr = jqXHR;
                    }
                },
                success: function (data) {
                    xhr = true;
                    if (data) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                },
                complete: function () {
                    xhr = false;
                    try {
                        that.hideBtnLoading();
                    } catch (error) {
                        //console.log("不存在formid")
                    }
                }
            });
        });
        return promise;
    },
    requestdata: function (url, argument, callback, errCallback, options) {
        this.getRequstdata(url, argument).then(function (data) {
            typeof callback === 'function' && callback(data);
        }, function (error) {
            typeof errCallback === 'function' && errCallback(data);
        });
    },
    requestURL: {
        promoAddressAllUrl: '/order/address/all', //地址信息
        promoSetAddressDefaultUrl: '/order/address/default', //设为默认地址
        promoGetUserAddressInfoUrl: '/order/address/edit', //编辑地址
        promoDeleteAddressUrl: '/order/address/delete', //删除地址
        promoSaveAddressUrl: '/order/address/update', //保存地址
        promoCreateAddressUrl: '/order/address/create', //新增地址
       promoAddressInfo: '/api/address/allCity', //地址联动城市信息
        promoAddressCounty: '/api/address/county', //地址联动城区信息
    }
}
export default serviceData;
