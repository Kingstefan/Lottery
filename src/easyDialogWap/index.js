import './index.scss';

const DialogLottery = function () {
    this.ele = {
        bg: $('.dialog-bg-l'),
        dialog: $('.dialog-wrap-l'),
        header: $('.dialog-wrap-l .dialog-header'),
        content: $('.dialog-wrap-l .dialog-content'),
        cancelBtn: $('.dialog-wrap-l .btn-cancel-l'),
        confirmBtn: $('.dialog-wrap-l .btn-confirm-l'),
        closeBtn: $('.dialog-wrap-l .btn-close-l'),
        closeButton: $('.dialog-wrap-l .btn_dialog'),
    }
    this.defaultOptions = {
        header: '',
        content: '',
        yesText: '',
        noText: '',
        bg: true,
        yesFn: null,
        noFn: null,
        scrollTop: null
    };
    this.finalOptions = {};
    this.ele.closeButton.on('click', (e) => {
        e.stopPropagation();
        this._close_(this.finalOptions.scrollTop);
    })
}
DialogLottery.prototype = {
    constructor: DialogLottery,
    _init_(options) {
        //let finalOptions;
        if (options.container) { //为了兼容pc端移植过来的easyDialog的调用
            options.container.noText ? this.ele.cancelBtn.show() : this.ele.cancelBtn.hide();
            this.finalOptions = $.extend({}, this.defaultOptions, options.container);
        } else {
            this.finalOptions = $.extend({}, this.defaultOptions, options);
        }
        this.ele.header.html(this.finalOptions.header);
        this.ele.content.html(this.finalOptions.content);
        this.ele.confirmBtn.html(this.finalOptions.yesText);
        this.ele.cancelBtn.html(this.finalOptions.noText);
        if (this.finalOptions.bg) {
            this.ele.bg.show();
        }
        if (this.finalOptions.yesFn) {
            this._bindFn_(this.ele.confirmBtn, this.finalOptions.yesFn);
        }
        if (this.finalOptions.noFn) {
            this._bindFn_(this.ele.cancelBtn, this.finalOptions.noFn);
        }
        this._bindFn_(this.ele.closeBtn, this.finalOptions.noFn);


        // this.ele.dialog.on('click', this.ele.closeButton, () => {
        //     this._close_(finalOptions.scrollTop);
        // })
    },
    _close_(scrollTop) {
        this.ele.bg.hide();
        this.ele.dialog.hide();
        this.ele.content.html('');
        $('html').removeClass('noscroll');
        $(window, document).scrollTop(scrollTop);
    },
    _bindFn_($btn, fn) {
        let _this = this;
        let _fnToBind_ = function (e) {
            if (typeof fn === "function") {
                fn.call(null);
            }
            _this._unbindFn_($('.btn_dialog'));
        };
        $btn.on("click.userFn", _fnToBind_);
    },
    _unbindFn_($btn, fnToUnbind) {
        $btn.unbind(".userFn");
    },
    open(options) {
        this._init_(options);
        this.ele.dialog.show();
    }
}
$(function () {
    let easyDialogLottery = new DialogLottery();
    window.easyDialogLottery = easyDialogLottery;
})

