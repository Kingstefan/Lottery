!function(t){var e={};function n(i){if(e[i])return e[i].exports;var o=e[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(i,o,function(e){return t[e]}.bind(null,o));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=21)}([function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}();e.hasCookies=function(){var t=new s;try{t.setItem("__test","1");var e=t.getItem("__test");return t.removeItem("__test"),"1"===e}catch(t){return!1}};var o=function(t){return t&&t.__esModule?t:{default:t}}(n(12));var r="lS_",s=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.cookieOptions=Object.assign({path:"/"},e),r=void 0===e.prefix?r:e.prefix}return i(t,[{key:"getItem",value:function(t){var e=o.default.parse(document.cookie);return e&&e.hasOwnProperty(r+t)?e[r+t]:null}},{key:"setItem",value:function(t,e){return document.cookie=o.default.serialize(r+t,e,this.cookieOptions),e}},{key:"removeItem",value:function(t){var e=Object.assign({},this.cookieOptions,{maxAge:-1});return document.cookie=o.default.serialize(r+t,"",e),null}},{key:"clear",value:function(){var t=o.default.parse(document.cookie);for(var e in t)0===e.indexOf(r)&&this.removeItem(e.substr(r.length));return null}}]),t}();e.default=s},function(t,e,n){"use strict";e.a=function(t){var e=this.constructor;return this.then(function(n){return e.resolve(t()).then(function(){return n})},function(n){return e.resolve(t()).then(function(){return e.reject(n)})})}},function(t,e,n){"use strict";n.r(e),function(t){var i=n(2),o=setTimeout;function r(){}function s(t){if(!(this instanceof s))throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(t,this)}function a(t,e){for(;3===t._state;)t=t._value;0!==t._state?(t._handled=!0,s._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null!==n){var i;try{i=n(t._value)}catch(t){return void c(e.promise,t)}l(e.promise,i)}else(1===t._state?l:c)(e.promise,t._value)})):t._deferreds.push(e)}function l(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof s)return t._state=3,t._value=e,void u(t);if("function"==typeof n)return void f(function(t,e){return function(){t.apply(e,arguments)}}(n,e),t)}t._state=1,t._value=e,u(t)}catch(e){c(t,e)}}function c(t,e){t._state=2,t._value=e,u(t)}function u(t){2===t._state&&0===t._deferreds.length&&s._immediateFn(function(){t._handled||s._unhandledRejectionFn(t._value)});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null}function f(t,e){var n=!1;try{t(function(t){n||(n=!0,l(e,t))},function(t){n||(n=!0,c(e,t))})}catch(t){if(n)return;n=!0,c(e,t)}}s.prototype.catch=function(t){return this.then(null,t)},s.prototype.then=function(t,e){var n=new this.constructor(r);return a(this,new function(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}(t,e,n)),n},s.prototype.finally=i.a,s.all=function(t){return new s(function(e,n){if(!t||void 0===t.length)throw new TypeError("Promise.all accepts an array");var i=Array.prototype.slice.call(t);if(0===i.length)return e([]);var o=i.length;function r(t,s){try{if(s&&("object"==typeof s||"function"==typeof s)){var a=s.then;if("function"==typeof a)return void a.call(s,function(e){r(t,e)},n)}i[t]=s,0==--o&&e(i)}catch(t){n(t)}}for(var s=0;s<i.length;s++)r(s,i[s])})},s.resolve=function(t){return t&&"object"==typeof t&&t.constructor===s?t:new s(function(e){e(t)})},s.reject=function(t){return new s(function(e,n){n(t)})},s.race=function(t){return new s(function(e,n){for(var i=0,o=t.length;i<o;i++)t[i].then(e,n)})},s._immediateFn="function"==typeof t&&function(e){t(e)}||function(t){o(t,0)},s._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)},e.default=s}.call(this,n(4).setImmediate)},function(t,e,n){(function(t){var i=void 0!==t&&t||"undefined"!=typeof self&&self||window,o=Function.prototype.apply;function r(t,e){this._id=t,this._clearFn=e}e.setTimeout=function(){return new r(o.call(setTimeout,i,arguments),clearTimeout)},e.setInterval=function(){return new r(o.call(setInterval,i,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(i,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},n(5),e.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==t&&t.setImmediate||this&&this.setImmediate,e.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==t&&t.clearImmediate||this&&this.clearImmediate}).call(this,n(0))},function(t,e,n){(function(t,e){!function(t,n){"use strict";if(!t.setImmediate){var i,o=1,r={},s=!1,a=t.document,l=Object.getPrototypeOf&&Object.getPrototypeOf(t);l=l&&l.setTimeout?l:t,"[object process]"==={}.toString.call(t.process)?i=function(t){e.nextTick(function(){u(t)})}:function(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}()?function(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&u(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),i=function(n){t.postMessage(e+n,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){u(t.data)},i=function(e){t.port2.postMessage(e)}}():a&&"onreadystatechange"in a.createElement("script")?function(){var t=a.documentElement;i=function(e){var n=a.createElement("script");n.onreadystatechange=function(){u(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n)}}():i=function(t){setTimeout(u,0,t)},l.setImmediate=function(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var s={callback:t,args:e};return r[o]=s,i(o),o++},l.clearImmediate=c}function c(t){delete r[t]}function u(t){if(s)setTimeout(u,0,t);else{var e=r[t];if(e){s=!0;try{!function(t){var e=t.callback,i=t.args;switch(i.length){case 0:e();break;case 1:e(i[0]);break;case 2:e(i[0],i[1]);break;case 3:e(i[0],i[1],i[2]);break;default:e.apply(n,i)}}(e)}finally{c(t),s=!1}}}}}("undefined"==typeof self?void 0===t?this:t:self)}).call(this,n(0),n(6))},function(t,e){var n,i,o=t.exports={};function r(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}function a(t){if(n===setTimeout)return setTimeout(t,0);if((n===r||!n)&&setTimeout)return n=setTimeout,setTimeout(t,0);try{return n(t,0)}catch(e){try{return n.call(null,t,0)}catch(e){return n.call(this,t,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:r}catch(t){n=r}try{i="function"==typeof clearTimeout?clearTimeout:s}catch(t){i=s}}();var l,c=[],u=!1,f=-1;function d(){u&&l&&(u=!1,l.length?c=l.concat(c):f=-1,c.length&&p())}function p(){if(!u){var t=a(d);u=!0;for(var e=c.length;e;){for(l=c,c=[];++f<e;)l&&l[f].run();f=-1,e=c.length}l=null,u=!1,function(t){if(i===clearTimeout)return clearTimeout(t);if((i===s||!i)&&clearTimeout)return i=clearTimeout,clearTimeout(t);try{i(t)}catch(e){try{return i.call(null,t)}catch(e){return i.call(this,t)}}}(t)}}function h(t,e){this.fun=t,this.array=e}function m(){}o.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];c.push(new h(t,e)),1!==c.length||u||a(p)},h.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=m,o.addListener=m,o.once=m,o.off=m,o.removeListener=m,o.removeAllListeners=m,o.emit=m,o.prependListener=m,o.prependOnceListener=m,o.listeners=function(t){return[]},o.binding=function(t){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(t){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(module,exports){module.exports=function(obj){obj||(obj={});var __t,__p="",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,"")}with(obj)data&&data.length>0&&(__p+='\r\n    <ul class="gird-wrap">\r\n        <li class="action gird"></li>\r\n        ',data.forEach(function(t,e){__p+='\r\n            <li class="item-'+(null==(__t=e+1)?"":__t)+' gird" data-seq="'+(null==(__t=t.seq)?"":__t)+'">\r\n                <img src="'+(null==(__t=t.image)?"":__t)+'" alt="">\r\n            </li>\r\n        '}),__p+="\r\n    </ul>\r\n"),__p+="\r\n\r\n\r\n\r\n\r\n";return __p}},function(module,exports){module.exports=function(obj){obj||(obj={});var __t,__p="",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,"")}with(obj)__p+='<div class="records">\r\n    ',records&&records.length>0?(__p+='\r\n        <div class="record-th">\r\n            <span class="name-th">奖品名称</span>\r\n            <span class="time-th">中奖时间</span>\r\n        </div>\r\n        <ul class="record-tr">\r\n            ',records.forEach(function(t){__p+='\r\n                <li class="record">\r\n                    <span class="name-tr">'+(null==(__t=t.name)?"":__t)+'</span>\r\n                    <span class="time-tr">'+(null==(__t=t.time)?"":__t)+"</span>\r\n                </li>\r\n            "}),__p+="\r\n        </ul>\r\n    "):__p+='\r\n        <div class="no-record">暂无中奖纪录，快去抽奖吧</div>\r\n    ',__p+='\r\n</div>\r\n<div class="fixed-tips"></div>\r\n';return __p}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.canSessionStorage=e.canLocalStorage=e.CookieStorage=e.isSupported=void 0;var i=n(10),o=null;(0,i.isSupported)("localStorage")?o=window.localStorage:(0,i.isSupported)("cookieStorage")&&(o=new i.CookieStorage);e.default=o,e.isSupported=i.isSupported,e.CookieStorage=i.CookieStorage,e.canLocalStorage=function(){return(0,i.isSupported)("localStorage")},e.canSessionStorage=function(){return(0,i.isSupported)("sessionStorage")}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.MemoryStorage=e.CookieStorage=e.isSupported=e.storage=void 0;var i=s(n(11)),o=s(n(1)),r=s(n(13));function s(t){return t&&t.__esModule?t:{default:t}}var a=null;(0,i.default)("localStorage")?e.storage=a=window.localStorage:(0,i.default)("sessionStorage")?e.storage=a=window.sessionStorage:(0,i.default)("cookieStorage")?e.storage=a=new o.default:e.storage=a=new r.default,e.default=a,e.storage=a,e.isSupported=i.default,e.CookieStorage=o.default,e.MemoryStorage=r.default},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"localStorage",e=String(t).replace(/storage$/i,"").toLowerCase();if("local"===e)return r("localStorage");if("session"===e)return r("sessionStorage");if("cookie"===e)return(0,i.hasCookies)();if("memory"===e)return!0;throw new Error("Storage method `"+t+"` is not available.\n    Please use one of the following: localStorage, sessionStorage, cookieStorage, memoryStorage.")};var i=n(1),o="__test";function r(t){try{var e=window[t];return e.setItem(o,"1"),e.removeItem(o),!0}catch(t){return!1}}},function(t,e,n){"use strict";
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */e.parse=function(t,e){if("string"!=typeof t)throw new TypeError("argument str must be a string");for(var n={},o=e||{},s=t.split(r),l=o.decode||i,c=0;c<s.length;c++){var u=s[c],f=u.indexOf("=");if(!(f<0)){var d=u.substr(0,f).trim(),p=u.substr(++f,u.length).trim();'"'==p[0]&&(p=p.slice(1,-1)),void 0==n[d]&&(n[d]=a(p,l))}}return n},e.serialize=function(t,e,n){var i=n||{},r=i.encode||o;if("function"!=typeof r)throw new TypeError("option encode is invalid");if(!s.test(t))throw new TypeError("argument name is invalid");var a=r(e);if(a&&!s.test(a))throw new TypeError("argument val is invalid");var l=t+"="+a;if(null!=i.maxAge){var c=i.maxAge-0;if(isNaN(c))throw new Error("maxAge should be a Number");l+="; Max-Age="+Math.floor(c)}if(i.domain){if(!s.test(i.domain))throw new TypeError("option domain is invalid");l+="; Domain="+i.domain}if(i.path){if(!s.test(i.path))throw new TypeError("option path is invalid");l+="; Path="+i.path}if(i.expires){if("function"!=typeof i.expires.toUTCString)throw new TypeError("option expires is invalid");l+="; Expires="+i.expires.toUTCString()}i.httpOnly&&(l+="; HttpOnly");i.secure&&(l+="; Secure");if(i.sameSite){var u="string"==typeof i.sameSite?i.sameSite.toLowerCase():i.sameSite;switch(u){case!0:l+="; SameSite=Strict";break;case"lax":l+="; SameSite=Lax";break;case"strict":l+="; SameSite=Strict";break;default:throw new TypeError("option sameSite is invalid")}}return l};var i=decodeURIComponent,o=encodeURIComponent,r=/; */,s=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function a(t,e){try{return e(t)}catch(e){return t}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}();var o=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._data={}}return i(t,[{key:"getItem",value:function(t){return this._data.hasOwnProperty(t)?this._data[t]:null}},{key:"setItem",value:function(t,e){return this._data[t]=String(e)}},{key:"removeItem",value:function(t){return delete this._data[t]}},{key:"clear",value:function(){return this._data={}}}]),t}();e.default=o},,,,,,,,function(t,e,n){"use strict";n(22),n(24);var i=l(n(3)),o=l(n(7)),r=l(n(8)),s=l(n(27)),a=n(9);function l(t){return t&&t.__esModule?t:{default:t}}!function(t){var e=function(e,n){this.$ele=n,this.defaults={index:0,speed:280,times:0,circle:4,prize:-1,totleTimes:64,loginUrl:"/customer/account/login/referer/"+this.encode_base64(window.location.href),id:5},this.timer=null,this.isLottery=!0,this.isActive=!0,this.element={},this.ajax={url:{detailUrl:"/activity/lucky-draw/detail",listUrl:"/activity/lucky-draw/award-list",timesUrl:"/activity/lucky-draw/times",drawUrl:"/activity/lucky-draw/draw",recordUrl:"/activity/lucky-draw/my-award-list",addrUrl:"/activity/lucky-draw/update-address"}},this.tips={lost_tips:"",ineligible_tips:""},this.opts=t.extend({},this.defaults,e),this.init()};e.prototype={constructor:e,init:function(){this.initViews(),this.action(),this.observeRecord(),this.checkInput()},ajaxRequest:function(e,n,o){var r=this;return new i.default(function(i,s){t.ajax({url:e,type:n,data:o,dataType:"json"}).then(function(t){if(t.status-0==200)i(t);else if(204===t.status){var e=r.noScroll();easyDialogLottery.open({container:{content:'<p class="lottery-tips">您还未登录，请前往登录</p>',yesText:"前往登录",yesFn:function(){window.location.href=r.opts.loginUrl},scrollTop:e}})}else s(t.message)}).fail(function(t){s(t)})})},initViews:function(){var t=this,e=function(t){return a.canSessionStorage&&!sessionStorage.getItem(t)||!a.canSessionStorage},n=["girds","list","rules"];t.ajaxRequest(t.ajax.url.detailUrl,"GET",{id:t.opts.id}).then(function(i){var r=e(n[0])?(0,o.default)({data:i.data.prizes}):sessionStorage.getItem(n[0]);if(t.$ele.find(".lottery-girdview").html(r),a.canSessionStorage&&sessionStorage.setItem(n[0],(0,o.default)({data:i.data.prizes})),t.tips.lost_tips=i.data.lost_tips,t.tips.ineligible_tips=i.data.ineligible_tips,i.data.is_show?t.$ele.find(".lottery-list_bg").show():t.$ele.find(".lottery-list_bg").hide(),i.data.status+0!=6)return t.isActive=!1,t.$ele.find(".action").addClass("activity-over"),t.isActive;t.element.item=t.$ele.find(".gird")}).catch(function(t){return console.log("获取九宫格图片异常"+t)}),e(n[1])?t.ajaxRequest(t.ajax.url.listUrl,"GET",{id:t.opts.id}).then(function(e){e.data.length>0&&(t.$ele.find(".list-wrap").html((0,s.default)({data:e.data})),a.canSessionStorage&&sessionStorage.setItem(n[1],(0,s.default)({data:e.data})),t.element.list=t.$ele.find(".list"),t.loopPlay())}).catch(function(t){console.log("中奖名单获取异常"+t)}):(t.$ele.find(".list-wrap").html(sessionStorage.getItem(n[1])),t.element.list=t.$ele.find(".list"),t.loopPlay())},encode_base64:function(t){for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n="",i=t.length,o=void 0,r=void 0,s=0;i-- >0;){if(o=t.charCodeAt(s++),n+=e.charAt(o>>2&63),i--<=0){n+=e.charAt(o<<4&63),n+="==";break}if(r=t.charCodeAt(s++),n+=e.charAt(63&(o<<4|r>>4&15)),i--<=0){n+=e.charAt(r<<2&63),n+="=";break}o=t.charCodeAt(s++),n+=e.charAt(63&(r<<2|o>>6&3)),n+=e.charAt(63&o)}return n},checkInput:function(){var e={name:[[/^\s*$/,/^[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\d]{2,40}$/,/^\S{41,}|^\S{1}$/,/^[\u4e00-\u9fa5a-zA-z]{2,40}$/],["请填写收货人姓名","请填写真实姓名","最少2个字符，最多40个字符","您的输入正确，请继续"]],tel:[[/^\s*$/,/\D+/,/^\d{21,}|^\d{1,5}$/,/^\d{6,20}$/],["请填写手机号码","手机号码格式错误","6-20个数字","您的输入正确，请继续"]],addr:[[/^\s*$/,/^[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\w]{8,100}$/,/^\S{101,}|^\S{1,7}$/,/[\u4e00-\u9fa5]+[\u4e00-\u9fa5`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\w]{7,100}$/],["请填写详细地址","请填写真实收货人地址","最少8个字符，最多100个字符","您的输入正确，请继续"]]};t("body").on("blur",".input-field",function(){var n=t(this).data("action"),i=e[n],o=t(this).val().trim(),r=t(this).siblings(".error-tips");i[0].map(function(t,e){t.test(o)&&(r.show().html(i[1][e]),3===e&&r.hide(),setTimeout(function(){r.hide()},1e3))})})},loopPlay:function(){var t=this.$ele.find(".list-wrap"),e=this.element.list.length,n=t.find(".list").outerHeight(),i=0,o=0;t.append(this.element.list.slice(0,8).clone());setInterval(function(){o=2*n*++i,t.animate({top:-o},300,function(){i>=e/2&&(t.css({top:0}),i=0)})},3e3)},saveAddress:function(e){var n=t(".newaddress-ctn"),i=n.find(".fixed-tips"),o=!1,r=[{rule:/^\s*$/,msg:["请填写收货人姓名","请填写手机号码","请填写详细地址"]},/^[\u4e00-\u9fa5a-zA-z]{2,40}$/,/^\d{6,20}$/,/[\u4e00-\u9fa5]+[\u4e00-\u9fa5`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\w]{7,100}$/];n.find(".input-field").each(function(e,n){r[0].rule.test(t(n).val().trim())&&(t(n).siblings(".error-tips").show().html(r[0].msg[e]),setTimeout(function(){t(n).siblings(".error-tips").hide()},2e3),o=!1)}),r[1].test(t(n).find(".input-field").eq(0).val().trim())&&r[2].test(t(n).find(".input-field").eq(1).val().trim())&&r[3].test(t(n).find(".input-field").eq(2).val().trim())&&(o=!0),o&&this.ajaxRequest(this.ajax.url.addrUrl,"POST",{id:e,name:t(n).find(".input-field").eq(0).val(),phone:t(n).find(".input-field").eq(1).val(),address:t(n).find(".input-field").eq(2).val()}).then(function(e){e.status+0===200&&(i.html("地址添加成功").show(),setTimeout(function(){i.hide(),n.removeClass("active"),t(n).find(".input-field").val(""),t("html").removeClass("noscroll1")},3e3))}).catch(function(e){i.html("地址添加失败，请重试").show(),setTimeout(function(){t(n).find(".input-field").val(""),i.hide()},3e3)})},observeRecord:function(){var t=this,e=this;this.$ele.on("click",".record-btn",function(){var n=e.noScroll();t.ajaxRequest(e.ajax.url.recordUrl,"GET",{id:e.opts.id}).then(function(t){t.data.length>0?easyDialogLottery.open({container:{header:"我的中奖纪录",content:(0,r.default)({records:t.data}),yesText:"确定",yesFn:function(){},scrollTop:n}}):easyDialogLottery.open({container:{content:'<div class="lottery-tips"><span class="name">暂无中奖纪录，快去抽奖吧</span></div>',yesText:"确定",yesFn:function(){},scrollTop:n}})}).catch(function(t){return console.log("获取我的中奖纪录异常"+t)})})},initData:function(){this.len=this.element.item.length,this.element.item.removeClass("active"),this.opts.index++,this.opts.index>this.len-1&&(this.opts.index=1),this.seq=this.$ele.find(".item-"+this.opts.index).data("seq"),this.$ele.find(".item-"+this.opts.index).addClass("active")},roll:function(e,n,i,o){var r=this,s=this;this.isLottery=!1,this.initData(),this.opts.times++;var a=this.opts.speed/this.opts.circle;if(this.opts.times>=this.opts.totleTimes&&this.opts.prize===this.seq){var l=s.noScroll();clearTimeout(this.timer),a=this.opts.speed/this.opts.circle,this.opts.prize=-1,this.opts.times=0,this.opts.circle=this.opts.totleTimes/(this.len-1)/2,this.isLottery=!0;var c=setTimeout(function(){e+0===0?easyDialogLottery.open({container:{content:'<div class="lottery-tips">'+i+"</div>",yesText:"确定",yesFn:function(){clearTimeout(c)},scrollTop:l}}):e+0===1?easyDialogLottery.open({container:{content:'<div class="lottery-tips"><span>'+i+"</span></div>",noText:"取消",noFn:!0,yesText:"填写收货地址",yesFn:function(){return clearTimeout(c),event.preventDefault(),t("html").addClass("noscroll1"),t(".newaddress-ctn").addClass("active"),t(".newaddress-ctn").on("click",".icon-back",function(e){return e.preventDefault(),t(".newaddress-ctn").removeClass("active"),t("html").removeClass("noscroll1"),!1}).on("click",".save-btn",function(){s.saveAddress(o)}),!1},scrollTop:l}}):e+0===2&&easyDialogLottery.open({container:{content:'<div class="lottery-tips"><span>'+i+"</span></div>",yesText:"确定",yesFn:function(){clearTimeout(c)},scrollTop:l}})},400)}else this.opts.times<this.opts.totleTimes/2?this.opts.index>=this.len-1&&this.opts.circle++:this.opts.times>this.opts.totleTimes/2&&this.opts.times<this.opts.totleTimes?this.opts.index>=this.len-1&&this.opts.circle--:this.opts.times===this.opts.totleTimes?this.opts.prize=n:this.opts.times>=this.opts.totleTimes&&(0===this.opts.prize&&this.opts.index===this.len-1||this.opts.prize===this.opts.index+1)&&(a+=80),this.timer=setTimeout(function(){r.roll(e,n,i,o)},a);return!1},noScroll:function(){var e=t(window,document).scrollTop();return t("html").addClass("noscroll"),t(window).scrollTop(e),e},action:function(){var e=this;this.$ele.on("click",".action",function(){e.isActive&&e.isLottery&&t.ajax({url:e.ajax.url.drawUrl,type:"GET",data:{id:e.opts.id},dataType:"json"}).then(function(t){var n=null;if(t.status-0==204)n=e.noScroll(),easyDialogLottery.open({container:{content:'<div class="lottery-tips">您还未登录，请前往登录</div>',yesText:"前往登录",yesFn:function(){window.location.href=e.opts.loginUrl},scrollTop:n}});else if(t.status-0==406)n=e.noScroll(),easyDialogLottery.open({container:{content:'<div class="lottery-tips">'+e.tips.ineligible_tips+"</div>",yesText:"确定",yesFn:function(){},scrollTop:n}});else if(t.status-0==200){var i=[t.data.type,t.data.seq,t.data.tips,t.data.id],o=i[0],r=i[1],s=i[2],a=i[3];e.roll(o,r,s,a)}}).fail(function(t){console.log("点击开始抽奖数据获取异常"+t)})})}},t.fn.lottery=function(t,n){return new e(t,this)}}(jQuery)},function(t,e,n){},,function(t,e,n){"use strict";n(25);var i=function(){var t=this;this.ele={bg:$(".dialog-bg-l"),dialog:$(".dialog-wrap-l"),header:$(".dialog-wrap-l .dialog-header"),content:$(".dialog-wrap-l .dialog-content"),cancelBtn:$(".dialog-wrap-l .btn-cancel-l"),confirmBtn:$(".dialog-wrap-l .btn-confirm-l"),closeBtn:$(".dialog-wrap-l .btn-close-l"),closeButton:$(".dialog-wrap-l .btn_dialog")},this.defaultOptions={header:"",content:"",yesText:"",noText:"",bg:!0,yesFn:null,noFn:null,scrollTop:null},this.finalOptions={},this.ele.closeButton.on("click",function(e){e.stopPropagation(),t._close_(t.finalOptions.scrollTop)})};i.prototype={constructor:i,_init_:function(t){t.container?(t.container.noText?this.ele.cancelBtn.show():this.ele.cancelBtn.hide(),this.finalOptions=$.extend({},this.defaultOptions,t.container)):this.finalOptions=$.extend({},this.defaultOptions,t),this.ele.header.html(this.finalOptions.header),this.ele.content.html(this.finalOptions.content),this.ele.confirmBtn.html(this.finalOptions.yesText),this.ele.cancelBtn.html(this.finalOptions.noText),this.finalOptions.bg&&this.ele.bg.show(),this.finalOptions.yesFn&&this._bindFn_(this.ele.confirmBtn,this.finalOptions.yesFn),this.finalOptions.noFn&&this._bindFn_(this.ele.cancelBtn,this.finalOptions.noFn),this._bindFn_(this.ele.closeBtn,this.finalOptions.noFn)},_close_:function(t){this.ele.bg.hide(),this.ele.dialog.hide(),this.ele.content.html(""),$("html").removeClass("noscroll"),$(window,document).scrollTop(t)},_bindFn_:function(t,e){var n=this;t.on("click.userFn",function(t){"function"==typeof e&&e.call(null),n._unbindFn_($(".btn_dialog"))})},_unbindFn_:function(t,e){t.unbind(".userFn")},open:function(t){this._init_(t),this.ele.dialog.show()}},$(function(){var t=new i;window.easyDialogLottery=t})},function(t,e,n){},,function(module,exports){module.exports=function(obj){obj||(obj={});var __t,__p="",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,"")}with(obj)__p+=" ",data&&data.length>0&&(__p+="\r\n    ",data.forEach(function(t){__p+='\r\n        <li class="list">\r\n            <span class="username">'+(null==(__t=t.username)?"":__t)+'</span>\r\n            <span class="name">'+(null==(__t=t.name)?"":__t)+"</span>\r\n        </li>\r\n    "}),__p+="\r\n"),__p+="\r\n";return __p}}]);