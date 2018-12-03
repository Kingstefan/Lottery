const userAgent = navigator.userAgent

function isWeiXin() {
    // 使用 userAgent 判断是否微信内置浏览器
    // 不推荐使用 用户可能会自行修改浏览器的 userAgent
    if (userAgent.toLowerCase().indexOf('micromessenger') > -1 || navigator.wxuserAgent !== undefined) {
        return true
    }

    // 使用微信 JS 对象判断是否微信内置浏览器
    // 建议使用此方法进行判断
    if (typeof window.WeixinJSBridge !== 'undefined') {
        return true
    }
}

window.BrowserInfo = {
    isWeiXin
}
