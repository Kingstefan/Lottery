import 'es5-shim'
import 'es6-shim'
import './normalize/_normalize';
import lazyload from './lazyload'
import './cookies';

import './slick/slick.js';
import './common/bfd';
import './common/browser';
import './easyDialog';
import './emarsys/index';
import './emarsys/helper';
import './sensordata/sensorsAnalytics.js';

// 单独引入jQuery cookies只是为了htag上报数据使用，开发使用系统封装的cookies
import './cookies/jquery.cookie.js'

import dropDownSearch from '@lib/dropDownSearch/pc';

setTimeout(dropDownSearch.init.bind(dropDownSearch), 100);

lazyload($('.fn-lazyload'));
