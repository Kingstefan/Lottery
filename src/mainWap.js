import './scss/index-m.scss';
import './easyDialogWap';
import Promise from 'promise-polyfill';
import girdsTpl from './views/girds.ejs';
import recordTpl from './views/record.ejs';
import listTpl from './views/list.ejs';

import {canSessionStorage} from './storage/index';

(function ($) {
    const Lottery = function (opts, ele) {
        this.$ele = ele;
        this.defaults = {
            index: 0, //当前转动到哪个位置，起点位置
            speed: 280, //初始转动速度设置，但是真正的转动速度为(speed/circle)
            times: 0, //转动次数
            circle: 4, //n圈之前加速运动，转动n圈后进入减速阶段，最好是(totleTimes/8/2)近似值相等
            prize: -1, //中奖位置
            totleTimes: 64, //转动基本次数：即至少需要转动多少圈再进入抽奖环节，建议不要少于50次，否则动画效果欠佳
            loginUrl: '/customer/account/login/referer/' + this.encode_base64(window.location.href), //跳转的登录页地址
            id: 5, //大转盘活动ID
            // failImgSrc: 'http://orw3q8coq.bkt.clouddn.com/active/img/fail.png', //未抽到奖品的背景图
            // winImgSrc: 'http://orw3q8coq.bkt.clouddn.com/active/img/win.png', //抽到奖品的背景图
            // defaultFailImgSrc: 'http://orw3q8coq.bkt.clouddn.com/active/img/fail.png', //默认未抽到奖品的背景图
            // defaultWinImgSrc: 'http://orw3q8coq.bkt.clouddn.com/active/img/win.png', //默认抽到奖品的背景图
        }

        this.timer = null;
        this.isLottery = true;//是否正在抽奖中
        this.isActive = true;//抽奖活动是否开启
        this.element = {}
        this.ajax = {
            url: {
                detailUrl: '/activity/lucky-draw/detail',
                listUrl: '/activity/lucky-draw/award-list',
                timesUrl: '/activity/lucky-draw/times',
                drawUrl: '/activity/lucky-draw/draw',
                recordUrl: '/activity/lucky-draw/my-award-list',
                addrUrl: '/activity/lucky-draw/update-address',
            }
        }
        this.tips = {
            lost_tips: '',
            ineligible_tips: ''
        }
        this.opts = $.extend({}, this.defaults, opts);
        this.init();
    }
    Lottery.prototype = {
        constructor: Lottery,
        init() {
            this.initViews();
            this.action();
            this.observeRecord();
            this.checkInput();
        },
        ajaxRequest(url, type, data) {
            let _this = this;
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: url,
                    type: type,
                    data: data,
                    dataType: 'json'
                }).then(res => {
                    if (res.status - 0 === 200) {
                        resolve(res);
                    } else if (res.status === 204) { //未登录
                        let scrollTop = _this.noScroll();
                        easyDialogLottery.open({
                            container: {
                                //header: '提示',
                                content: `<p class="lottery-tips">您还未登录，请前往登录</p>`,
                                yesText: '前往登录',
                                yesFn: function () {
                                    window.location.href = _this.opts.loginUrl;
                                },
                                scrollTop
                            }
                        });
                    } else {
                        reject(res.message);
                    }
                }).fail((err) => {
                    reject(err)
                });
            });
        },
        initViews() {
            let _this = this;
            const hasStorage = (key) => {
                return canSessionStorage && !sessionStorage.getItem(key) || !canSessionStorage;
            }
            const STORAGE_KEY = ['girds', 'list', 'rules'];
            //初始化九宫格转盘
            _this.ajaxRequest(_this.ajax.url.detailUrl, 'GET', {id: _this.opts.id})
            .then(
                res => {
                    let isFetch = hasStorage(STORAGE_KEY[0]);
                    let HTML = isFetch ? girdsTpl({ data: res.data.prizes }) : sessionStorage.getItem(STORAGE_KEY[0]);
                    _this.$ele.find('.lottery-girdview').html(HTML);

                    if (canSessionStorage) sessionStorage.setItem(STORAGE_KEY[0], girdsTpl({ data: res.data.prizes }));
                     _this.tips.lost_tips = res.data.lost_tips;
                    _this.tips.ineligible_tips = res.data.ineligible_tips;
                    //是否显示中奖名单
                    res.data.is_show ? _this.$ele.find('.lottery-list_bg').show() : _this.$ele.find('.lottery-list_bg').hide();
                    if (res.data.status + 0 != 6) { //活动暂停或结束
                        _this.isActive = false;
                        _this.$ele.find('.action').addClass('activity-over');
                        return _this.isActive;
                    }
                    _this.element.item = _this.$ele.find('.gird');
                }
            )
            .catch(err => console.log('获取九宫格图片异常' + err));

            if (hasStorage(STORAGE_KEY[1])) { //有会话存储就读取，没有就发起请求
                _this.ajaxRequest(_this.ajax.url.listUrl, 'GET', {id: _this.opts.id})
                    .then(
                        res => {
                            if (res.data.length > 0) {
                                _this.$ele.find('.list-wrap').html(listTpl({
                                    data: res.data
                                }));
                                if (canSessionStorage) sessionStorage.setItem(STORAGE_KEY[1], listTpl({data: res.data}));
                                _this.element.list = _this.$ele.find('.list');
                                _this.loopPlay();
                            }
                        }
                    )
                    .catch(err => {console.log('中奖名单获取异常' + err)});
            } else {
                _this.$ele.find('.list-wrap').html(sessionStorage.getItem(STORAGE_KEY[1]));
                _this.element.list = _this.$ele.find('.list');
               _this.loopPlay();
            }
        },
        encode_base64(what) {
            let base64_encodetable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let result = '';
            let len = what.length;
            let x, y;
            let ptr = 0;
            while (len-- > 0) {
                x = what.charCodeAt(ptr++);
                result += base64_encodetable.charAt((x >> 2) & 63);

                if (len-- <= 0) {
                    result += base64_encodetable.charAt((x << 4) & 63);
                    result += "==";
                    break;
                }

                y = what.charCodeAt(ptr++);
                result += base64_encodetable.charAt(((x << 4) | ((y >> 4) & 15)) & 63);

                if (len-- <= 0) {
                    result += base64_encodetable.charAt((y << 2) & 63);
                    result += "=";
                    break;
                }

                x = what.charCodeAt(ptr++);
                result += base64_encodetable.charAt(((y << 2) | ((x >> 6) & 3)) & 63);
                result += base64_encodetable.charAt(x & 63);

            }

            return result;
        },
        checkInput() {
            const actions = {
                name: [
                    [/^\s*$/, /^[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\d]{2,40}$/, /^\S{41,}|^\S{1}$/, /^[\u4e00-\u9fa5a-zA-z]{2,40}$/],
                    ['请填写收货人姓名', '请填写真实姓名', '最少2个字符，最多40个字符','您的输入正确，请继续']
                ],
                tel: [
                    [/^\s*$/, /\D+/, /^\d{21,}|^\d{1,5}$/, /^\d{6,20}$/],
                    ['请填写手机号码', '手机号码格式错误', '6-20个数字','您的输入正确，请继续']
                ],
                addr: [
                    [/^\s*$/, /^[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\w]{8,100}$/, /^\S{101,}|^\S{1,7}$/, /[\u4e00-\u9fa5]+[\u4e00-\u9fa5`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\w]{7,100}$/],
                    ['请填写详细地址', '请填写真实收货人地址', '最少8个字符，最多100个字符','您的输入正确，请继续']
                ]
            }
            $('body').on('blur', '.input-field', function () {
                let attr = $(this).data('action'),
                    action = actions[attr],
                    val = $(this).val().trim(),
                    $tips = $(this).siblings('.error-tips');
                action[0].map((reg, i) => {
                    if (reg.test(val)) {
                        $tips.show().html(action[1][i]);
                        if (i === 3) $tips.hide();
                        setTimeout(() => {
                             $tips.hide();
                        }, 1000);
                    }
                });

            })
        },
        loopPlay() {
            let $lists = this.$ele.find('.list-wrap'),
                len = this.element.list.length,
                liHeight = $lists.find('.list').outerHeight(),
                MaxHeight = liHeight * len,
                count = 0,
                top = 0;
            $lists.append(this.element.list.slice(0, 8).clone())
            const loop = () => {
                count++;
                top = liHeight * 2 * count;
                $lists.animate({
                    top: -top
                }, 300, () => {
                    if (count >= len / 2) {
                        $lists.css({
                            top: 0
                        });
                        count = 0;
                    }
                })
            }
            setInterval(loop, 3000)
        },
        saveAddress(addrID) {
            let $addr = $('.newaddress-ctn'),
                $tips = $addr.find('.fixed-tips'),
                isSuccess = false,
                _this = this;
            const regexp = [
                {
                    rule: /^\s*$/,
                    msg: ['请填写收货人姓名', '请填写手机号码', '请填写详细地址']
                },
                /^[\u4e00-\u9fa5a-zA-z]{2,40}$/,
                /^\d{6,20}$/,
                /[\u4e00-\u9fa5]+[\u4e00-\u9fa5`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、\w]{7,100}$/
            ]
            $addr.find('.input-field').each((i, item) => {
                if (regexp[0].rule.test($(item).val().trim())) {
                    $(item).siblings('.error-tips').show().html(regexp[0].msg[i]);
                    setTimeout(() => {
                        $(item).siblings('.error-tips').hide();
                    }, 2000)
                    isSuccess = false;
                }
            })
            if (regexp[1].test($($addr).find('.input-field').eq(0).val().trim()) && regexp[2].test($($addr).find('.input-field').eq(1).val().trim()) && regexp[3].test($($addr).find('.input-field').eq(2).val().trim())) isSuccess = true;

            if (isSuccess) {
                this.ajaxRequest(_this.ajax.url.addrUrl, 'POST', {
                    id: addrID,
                    name: $($addr).find('.input-field').eq(0).val(),
                    phone: $($addr).find('.input-field').eq(1).val(),
                    address: $($addr).find('.input-field').eq(2).val()
                })
                .then(
                    res => {
                        if (res.status + 0 === 200) {
                            $tips.html('地址添加成功').show();
                            setTimeout(() => {
                                $tips.hide();
                                $addr.removeClass('active');
                                $($addr).find('.input-field').val('');
                                $('html').removeClass('noscroll1');
                            }, 3000)
                        }
                    }
                )
                .catch(err => {
                    $tips.html('地址添加失败，请重试').show();
                    setTimeout(() => {
                        $($addr).find('.input-field').val('');
                        $tips.hide();
                    }, 3000)
                });
            }
        },
        observeRecord() {
            let _this = this;
            this.$ele.on('click', '.record-btn', () => {
                let scrollTop = _this.noScroll();
                this.ajaxRequest(_this.ajax.url.recordUrl, 'GET', {id: _this.opts.id})
                    .then(
                        res => {
                            if (res.data.length > 0) {
                                easyDialogLottery.open({
                                    container: {
                                        header: '我的中奖纪录',
                                        content: recordTpl({
                                            records: res.data
                                        }),
                                        yesText: '确定',
                                        yesFn: function () { },
                                        scrollTop
                                    }
                                });
                            } else {
                                 easyDialogLottery.open({
                                     container: {
                                         //header: `<img src="${_this.opts.failImgSrc}" alt="" onError=this.src="${_this.opts.defaultFailImgSrc}">`,
                                         content: '<div class="lottery-tips"><span class="name">暂无中奖纪录，快去抽奖吧</span></div>',
                                         yesText: '确定',
                                         yesFn: function () { },
                                         scrollTop
                                     }
                                 });
                            }

                        }
                    )
                    .catch(err => console.log('获取我的中奖纪录异常' + err));
            })

        },
        initData() {
            this.len = this.element.item.length;
            this.element.item.removeClass('active');
            this.opts.index++;

            if (this.opts.index > this.len - 1) {
                this.opts.index = 1;
            }
            this.seq = this.$ele.find('.item-' + this.opts.index).data('seq');
            this.$ele.find('.item-' + this.opts.index).addClass('active');
        },
        roll(type, seq, tips, addrID) {
            let _this = this;
            this.isLottery = false;
            this.initData();
            this.opts.times++;
            let s = this.opts.speed / this.opts.circle;
            if (this.opts.times >= this.opts.totleTimes && this.opts.prize === this.seq) {//中奖
                let scrollTop = _this.noScroll();
                clearTimeout(this.timer);
                s = this.opts.speed / this.opts.circle;
                this.opts.prize = -1;
                this.opts.times = 0;
                this.opts.circle = this.opts.totleTimes / (this.len-1) / 2;
                this.isLottery = true;
                let timer = setTimeout(() => {
                    /***
                     * type=0谢谢参与
                     * type=1实物奖品
                     * type=2优惠券
                     */
                    if(type+0 === 0) {
                        easyDialogLottery.open({
                            container: {
                                //header: `<img src="${_this.opts.failImgSrc}" alt="" onError=this.src="${_this.opts.defaultFailImgSrc}">`,
                                content: `<div class="lottery-tips">${tips}</div>`,
                                yesText: '确定',
                                yesFn: function () {
                                    clearTimeout(timer);
                                },
                                scrollTop
                            }
                        });
                    }else if(type+0 === 1) {
                        easyDialogLottery.open({
                            container: {
                                //header: `<img src="${_this.opts.winImgSrc}" alt="" onError=this.src="${_this.opts.defaultWinImgSrc}">`,
                                content: `<div class="lottery-tips"><span>${tips}</span></div>`,
                                noText: '取消',
                                noFn: true,
                                yesText: '填写收货地址',
                                yesFn: function () {
                                    clearTimeout(timer);
                                    event.preventDefault();
                                    $('html').addClass('noscroll1');
                                    $('.newaddress-ctn').addClass('active');
                                     $('.newaddress-ctn').on('click', '.icon-back', function (event) {
                                         event.preventDefault();
                                         $('.newaddress-ctn').removeClass('active');
                                         $('html').removeClass('noscroll1');
                                         return false;
                                    })
                                    .on('click', '.save-btn', () => {
                                        _this.saveAddress(addrID)
                                    })
                                     return false;
                                },
                                scrollTop
                            }
                        });
                    }else if(type+0 === 2) {
                        easyDialogLottery.open({
                            container: {
                                //header: `<img src="${_this.opts.winImgSrc}" alt="" onError=this.src="${_this.opts.defaultWinImgSrc}">`,
                                content: `<div class="lottery-tips"><span>${tips}</span></div>`,
                                yesText: '确定',
                                yesFn: function () {
                                    clearTimeout(timer);
                                },
                                scrollTop
                            }
                        });
                    }
                }, 400)

            } else {

                if (this.opts.times < this.opts.totleTimes / 2) {
                    if (this.opts.index >= this.len - 1) {//加速
                        this.opts.circle++;
                    }

                } else if (this.opts.times > this.opts.totleTimes / 2 && this.opts.times < this.opts.totleTimes) {
                    if (this.opts.index >= this.len - 1) {//减速
                        this.opts.circle--;
                    }

                } else if (this.opts.times === this.opts.totleTimes) {
                    this.opts.prize = seq;
                } else {
                    if (this.opts.times >= this.opts.totleTimes && ((this.opts.prize === 0 && this.opts
                            .index === this.len - 1) || this.opts.prize === this.opts.index + 1)) {
                        s += 80;
                    }
                }

                this.timer = setTimeout(() => {//循环调用
                    this.roll(type, seq, tips, addrID)
                }, s);
            }
            return false;
        },
        noScroll() {
            let scrollTop = $(window, document).scrollTop();
            $('html').addClass('noscroll');
            $(window).scrollTop(scrollTop);
            return scrollTop;
        },
        action() {
            let _this = this;
            this.$ele.on('click', '.action', () => {
                if(_this.isActive && _this.isLottery) {//活动启用中的状态
                    $.ajax({
                        url: _this.ajax.url.drawUrl,
                        type: 'GET',
                        data: {
                            id: _this.opts.id
                        },
                        dataType: 'json'
                    }).then(res => {
                        let scrollTop = null;
                        if (res.status - 0 === 204) {//未登录
                            scrollTop = _this.noScroll();
                            easyDialogLottery.open({
                                container: {
                                    //header: '提示',
                                    content: `<div class="lottery-tips">您还未登录，请前往登录</div>`,
                                    yesText: '前往登录',
                                    yesFn: function () {
                                        window.location.href = _this.opts.loginUrl;
                                    },
                                    scrollTop
                                }
                            });
                        } else if (res.status - 0 === 406) {//用户没有抽奖机会
                            scrollTop = _this.noScroll();
                            easyDialogLottery.open({
                                container: {
                                    //header: `<img src="${_this.opts.failImgSrc}" alt="" onError=this.src="${_this.opts.defaultFailImgSrc}">`,
                                    content: `<div class="lottery-tips">${_this.tips.ineligible_tips}</div>`,
                                    yesText: '确定',
                                    yesFn: function () { },
                                    scrollTop
                                }
                            });
                        }else if(res.status-0 === 200) {//开始抽奖
                            let [type, seq, tips, addrID] = [res.data.type, res.data.seq, res.data.tips, res.data.id];
                            _this.roll(type, seq, tips, addrID);
                        }

                    })
                    .fail((err) => {
                        console.log('点击开始抽奖数据获取异常' + err)
                    });
                }
            })

        }
    }
    $.fn.lottery = function (opts, callback) {
        return new Lottery(opts, this)
    }
})(jQuery)
