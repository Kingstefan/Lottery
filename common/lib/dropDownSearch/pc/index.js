import ParamUtils from '../public/params';
import storageUtils from '../public/service';
import './index.scss';
import completeTpl from './tpl/autocomplete.ejs';
import historiesTpl from './tpl/histories.ejs';

const CLS_PLUGIN = 'cmp-dropdownsearch-dropcontent';
const Cache = {};

const CLS_ACTIVE = 'cls-active';

const TYPES = {
    AUTO_COMPLETE: 'AUTO_COMPLETE',
    HISTORY_SEARCH: 'HISTORY_SEARCH'
};

const format = keyword => $.trim(keyword);

let showDropDownType;
let activeIndex;

const biz = {
    init() {
        this.$dropdownSearch = $('.cmp-dropdownsearch');
        this.$input = this.$dropdownSearch.find('input:visible');
        this.$btnSearch = this.$dropdownSearch.find('.js-btn-search').length > 0 ? this.$dropdownSearch.find('.js-btn-search') : this.$dropdownSearch.find('button').length > 0 ? this.$dropdownSearch.find('button') : null;

        if (!window.SEARCH_TIP_API || $.trim(SEARCH_TIP_API) === '') {
            // console.error('SEARCH_TIP_API is not set');
            return false;
        }

        if (this.$dropdownSearch.length === 0 || this.$input.length === 0 || !this.$btnSearch) {
            console.error('html structure error');
            return false;
        }

        this.$dropDownCon = $(`<div class="${CLS_PLUGIN}">`).insertAfter(this.$dropdownSearch);

        this.actionUrl = '/search/result';

        this.bindEvents();
    },
    bindEvents() {
        this.$input.on('focus input', () => {
            if (this.fetchTimer) {
                clearTimeout(this.fetchTimer);
                this.fetchTimer = 0;
            }

            this.fetchTimer = setTimeout(() => {
                if (this.isEmpty()) {
                    this.switchLayout(TYPES.HISTORY_SEARCH);
                } else {
                    this.switchLayout(TYPES.AUTO_COMPLETE);
                }
            }, 200);
        });

        this.$dropDownCon
        .on('click', '.cmp-btn-clean', (e) => {
            storageUtils.clear();
            this.$dropDownCon.empty();
        })
        .on('click', '.cmp-btn-remove', (e) => {
            const $target = $(e.currentTarget);
            const $item = $target.closest('.cmp-history-item');
            const value = $item.data('value');

            e.stopPropagation();
            storageUtils.removeItem(value);
            this.refreshHistories();
        }).on('click', '.cmp-history-item, .cmp-autocomplete-item', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            this.$input.val($target.data('value'));
            this.submit();
        });

        this.$input
        .on('keydown', (e) => {
            const code = e.keyCode;
            const list = showDropDownType === TYPES.HISTORY_SEARCH ? storageUtils.get() : this.response;
            const len = list ? list.length : 0;
            const $target = this.$dropDownCon.find('.' + CLS_ACTIVE);

            if(len === 0){
                return -1
            }

            switch (code) {
                // enter
                case 13:
                    if (activeIndex !== undefined) {
                        this.$input.val($target.data('value'));
                    }
                    this.submit();
                    // 和keydown一起，避免enter会导致form提交
                    return false;
                // del
                case 46:
                    if (showDropDownType !== TYPES.HISTORY_SEARCH) {
                        return false;
                    }

                    $target.find('.cmp-btn-remove').click();
                    break;

                // up
                case 38:
                    activeIndex = activeIndex !== undefined ? (activeIndex > 0 ? activeIndex - 1 : len - 1) : len - 1;

                    this.activeHistories(activeIndex);
                    break;

                // down
                case 40:
                    activeIndex = activeIndex !== undefined ? (activeIndex < len - 1 ? activeIndex + 1 : 0) : 0;

                    this.activeHistories(activeIndex);
                    break;

                // esc
                case 27:
                    this.hideDropDown();
                    break;
            }
        });


        this.$btnSearch.on('click', this.submit.bind(this));

        $(document).on('click', (e) => {
            if ($(e.target).closest(CLS_PLUGIN).length === 0) {
                this.hideDropDown();
            }
        });
    },
    submit() {
        const name = this.$input.attr('name') || 'q';

        const oldQuery = ParamUtils.getParams(location.search)[name];
        const value = this.$input.val() || this.$input.data('value');
        const params = {[name]: format(value)};

        if (this.isEmpty() && !value) {
            this.$input.focus();
            return false;
        }

        if (oldQuery) {
            params.oldQuery = oldQuery;
        }

        storageUtils.addItem(format(value));

        window.location.href = ParamUtils.appendParam(this.actionUrl, params);
        $(window).trigger('sensor.set.first-search')
        return false;
    },
    switchLayout(type) {
        showDropDownType = type;
        activeIndex = undefined;

        if (type === TYPES.AUTO_COMPLETE) {
            this.autoComplete();
        } else {
            this.refreshHistories();
        }

        this.$dropDownCon.show();
    },
    autoComplete() {
        // [refer rxjs combineLastest](https://www.learnrxjs.io/operators/combination/combinelatest.html)
        const keyword = format(this.$input.val());
        const data = Cache[format(keyword)];

        if (this.isEmpty()) {
            return false;
        }

        if (data !== undefined) {
            return $.Deferred().resolve(data).then(this.renderCompleteBox.bind(this));
        }

        // 200ms后第二次请求时候，如果上一次请求尚未响应，abort并且重置
        if(this.fetchRequest){
            this.fetchRequest.abort()
            this.fetchRequest = null
        }

        this.fetchRequest = $.get($.trim(window.SEARCH_TIP_API), {query: keyword})
        .always(() => {
            this.fetchRequest = null
        })
        // [mock] ajax latency
        // .then(resp => {
        //     return $.Deferred((deferred) => {
        //         this.count = this.count || 1
        //         this.count++
        //
        //         setTimeout(() => {
        //             deferred.resolve(resp)
        //         }, this.count * 800 + 100)
        //     }).promise()
        // })

        return this.fetchRequest.then(resp => {
            // [notice] 200ms后，第一次的请求仍未响应禁止阻止ui更新
            if(keyword !== this.$input.val()){
                return $.Deferred().promise()
            }

            return resp
        })
        .then(resp => resp && resp.results ? resp.results.map(item => item.text) : [])
        // dev环境添加搜索词标识
        // .then(list => {
        //     return [keyword, ...list]
        // })
        .then(this.renderCompleteBox.bind(this))
        .then(data => {
            if (data.length > 0) {
                Cache[keyword] = data;
                this.response = data;
            }
            return data;
        }, (e) => {
            console.log(e);
        });
    },
    renderCompleteBox(data) {
        this.$dropDownCon.html(completeTpl({data: data}));
        return data;
    },
    refreshHistories() {
        this.$dropDownCon.html(storageUtils.isSupport() ? historiesTpl({data: storageUtils.get()}) : '');
    },
    activeHistories(index) {
        this.$dropDownCon.find('.list-item').eq(index).addClass(CLS_ACTIVE).siblings().removeClass(CLS_ACTIVE);
    },
    hideDropDown() {
        this.$dropDownCon.hide();
        activeIndex = showDropDownType = undefined;
    },
    isEmpty() {
        return format(this.$input.val()) === '';
    }
};

export default biz;
