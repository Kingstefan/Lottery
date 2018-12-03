import ParamUtils from '../public/params';
import storageUtils from '../public/service';
import './index.scss';
import completeTpl from './tpl/autocomplete.ejs';
import historiesTpl from './tpl/histories.ejs';
import searchBoxTpl from './tpl/index.ejs';

const TYPES = {
    AUTO_COMPLETE: 'AUTO_COMPLETE',
    HISTORY_SEARCH: 'HISTORY_SEARCH'
};

const format = keyword => keyword.trim();

const CLS_ACTIVE = 'cls-active';
const Cache = {};

const biz = {
    init() {
        if (!window.SEARCH_TIP_API || $(document.body).attr('diable-dropsearch')) {
            return false;
        }

        this.initData();
        this.initView();
        this.$dropBoxCon = $('.js-search-box');
        this.$searchForm = this.$dropBoxCon.find('.js-search-form');
        this.$searchHistory = this.$dropBoxCon.find('.js-search-history');
        this.$hotSearch = this.$dropBoxCon.find('.js-hot-search');
        this.$autoCompleteBox = this.$dropBoxCon.find('.js-complete-box');
        this.$input = this.$searchForm.find('input');
        this.refreshHistories();
        this.addEvents();
    },
    initData() {
        const res = {};
        const template = $('#hot_term_h5');

        if (window.SEARCH_HISTORY !== undefined) {
            return;
        }

        res.action = '/search/result';
        res.name = 'q';
        res.inputPlaceHolder = $(template).find('input').attr('placeholder') || '请输入商品名称';
        res.value = $(template).find('input').data('value') || '';
        res.hotSearch = $(template).find('a').filter(item => item.innerText !== '').toArray().map(item => {
            return {
                isCommUse: item.classList.contains('hot'),
                value: item.innerText,
                href: item.getAttribute('href')
            };
        });

        window.SEARCH_HISTORY = res;

        return res;
    },
    initView() {
        const $oldBox = $('.js-search-box');

        if ($oldBox.length > 0) {
            $oldBox.remove();
        }

        // !-- 暂时在这里处理
        $(document.body).append(searchBoxTpl(window.SEARCH_HISTORY || {}).replace(/<a(\s+[-\w]+="?[-\w]*"?)*\s*>\s*<\/a>/gmi, ''));
    },
    addEvents() {
        this.$dropBoxCon
        .on('click', '.js-clear-history', (e) => {
            storageUtils.clear();
            this.$searchHistory.empty();
        })
        .on('click', '.js-back', (e) => {
            this.$dropBoxCon.removeClass(CLS_ACTIVE);
            return false;
        })
        .on('click', '.js-item-del', (e) => {
            const $target = $(e.currentTarget);
            const $item = $target.closest('.js-history-item');
            const value = $item.data('value');

            storageUtils.removeItem(value);
            this.refreshHistories();
            return false;
        }).on('click', '.js-history-item, .js-complete-item', (e) => {
            const $target = $(e.currentTarget);
            this.$input.val($target.data('value'));
            this.$searchForm.submit();
        });

        this.$searchForm.on('submit', (e) => {
            const oldQuery = ParamUtils.getParams(location.search)[SEARCH_HISTORY.name];
            let params;

            if (this.isEmpty()) {
                if (!SEARCH_HISTORY.value) {
                    return false;
                }

                this.$input.val(SEARCH_HISTORY.value);
            }

            params = {[SEARCH_HISTORY.name]: format(this.$input.val())};

            if (oldQuery) {
                params.oldQuery = oldQuery;
            }

            storageUtils.addItem(format(this.$input.val()));

            window.location.href = ParamUtils.appendParam(SEARCH_HISTORY.action, params);
            $(window).trigger('sensor.set.first-search');
            return false;
        });

        this.$input.on('input', (e) => {
            if (this.fetchTimer) {
                clearTimeout(this.fetchTimer);
                this.fetchTimer = 0;
            }

            this.fetchTimer = setTimeout(this.switchHandler.bind(this), 200);
        });

        $(document.body)
        .on('click', '.cmp-dropdownsearch', (e) => {
            const $target = $(e.currentTarget);
            let value;

            if ($(e.target).is('.js-cmp-ignore')) {
                return false;
            }

            if ($target.is('input')) {
                value = $target.val();
            } else {
                value = $target.find('input').length > 0 ? $target.find('input').val() : '';
            }

            this.$input.val(value);
            this.switchHandler();
            this.$dropBoxCon.addClass(CLS_ACTIVE);
            this.$input.focus();
        })
        .on('click', '.cmp-dropdownsearch button, .cmp-dropdownsearch .btn-search', (e) => {
            e.stopPropagation();
        });
    },
    switchHandler() {
        if (this.isEmpty()) {
            this.switchLayout(TYPES.HISTORY_SEARCH);
        } else {
            this.switchLayout(TYPES.AUTO_COMPLETE);
        }
    },
    switchLayout(type) {
        if (type === TYPES.AUTO_COMPLETE) {
            this.autoComplete();
            this.$searchHistory.add(this.$hotSearch).hide();
            this.$autoCompleteBox.show();
        } else {
            this.refreshHistories();
            this.$autoCompleteBox.hide();
            this.$searchHistory.add(this.$hotSearch).show();
        }
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
            }
            return data;
        }, (e) => {
            console.log(e);
        });
    },
    renderCompleteBox(data) {
        this.$autoCompleteBox.html(completeTpl({data: data}));
        return data;
    },
    refreshHistories() {
        this.$searchHistory.html(storageUtils.isSupport() ? historiesTpl({data: storageUtils.get()}) : '');
    },
    isEmpty() {
        return format(this.$input.val()) === '';
    }
};


export default biz;
