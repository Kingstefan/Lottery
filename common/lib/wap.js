import 'es5-shim';
import 'es6-shim';
import FastClick from 'fastclick'
import lazyload from './lazyload'
import './normalize/_normalize';

import './slick/slick.js';
import './cookies';
import './common/bfd';
import './common/browser';
import './emarsys/index';
import './emarsys/helper';
import './modal';
import './sensordata/sensorsAnalytics.js';

// 单独引入jQuery cookies只是为了htag上报数据使用，开发使用系统封装的cookies
import './cookies/jquery.cookie.js'

import dropDownSearch from '@lib/dropDownSearch/wap';

setTimeout(dropDownSearch.init.bind(dropDownSearch), 100);

lazyload($('.fn-lazyload'));

// 检测手机端对 0.5px 的支持情况
if (window.devicePixelRatio && devicePixelRatio >= 2) {
    const testElem = document.createElement('div');
    testElem.style.border = '.5px solid transparent';
    document.body.appendChild(testElem);

    if (testElem.offsetHeight === 1) {
        document.querySelector('html').classList.add('half-px');
    }

    document.body.removeChild(testElem);
}

$(function() {
    FastClick.attach(document.body);
});
