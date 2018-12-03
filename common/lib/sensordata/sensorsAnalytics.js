//神策埋点
(function ($, window, sa) {
    if (!sa || !$) return;

    const RegMap = {
        search: /(\/search\/result|\/catalogsearch\/result)/i,
        detail: /^(\/product)?\/\d+\.html/i,
        login: /\/customer\/account\/login/,
        register: /\/customer\/account\/create/
    }

    var pathname = window.location.pathname;

    var search_product = '',
        isSearchRefresh = true;

    window.indexSensors = {
        init: function () {
            var _this = this;

            RegMap.login.test(pathname) && _this.login(false); //登录页

            RegMap.register.test(pathname) && _this.register(false); //注册页

            RegMap.search.test(pathname) && _this.search_result_to_product(); //搜索结果页

            _this.close_page(); //关闭页面
            _this.recommend_to_product(); //推荐列表进商详
            //搜索表单提交、点击搜索历史关键词和点击联想关键词跳转时,设置判断是否绝对搜索的会话型cookie
            $(document).on("submit", "[action*='search/result']", function () {
                _this.tool.cookie("SA_SEARCH_IS_FIRST", "1");
            });
            $(document).on("click", ".search-item, .g-sensor-search-item", function () {
                $("[action*='search/result']").length && _this.tool.cookie("SA_SEARCH_IS_FIRST", "1");
            });
            $(window).on('sensor.set.first-search', () => {
                _this.tool.cookie("SA_SEARCH_IS_FIRST", "1");
            })
            //2分钟后未关闭页面情况下上报浏览推荐栏事件
            clearTimeout(window.viewRecommendColumnTimer);
            window.viewRecommendColumnTimer = window.setTimeout(function () {
                _this.view_recommend_column();
            }, 2 * 60 * 1000);
        },
        //关闭页面
        close_page: function () {
            var _this = this,
                saStartTime = new Date();
            window.onunload = function () {
                var end = new Date(),
                    s = (end.getTime() - saStartTime.getTime()) / 1000,
                    data = $.extend({}, { page_stay_time: s, url: window.location.href });
                _this.recommendData.length && _this.view_recommend_column();
                sa.track('close_page', data);
            };
        },
        //登录反馈
        login: function (type, errorMsgArr, errorMsgId) {
            this.helper.reportErrorMsg.apply(this, ["login_feedback", type, errorMsgArr, errorMsgId])
        },
        //注册反馈
        register: function (type, errorMsgArr, errorMsgId) {
            this.helper.reportErrorMsg.apply(this, ["signup_feedback", type, errorMsgArr, errorMsgId])
        },
        //加入购物车
        add_shopping_cart: function (event, properties, recommend) { //加入购物车
            if (event && properties) {
                var data = $.extend({}, JSON.parse(properties)),
                    fromSearch = false,
                    searchKeyword = '',
                    searchPageNum = '',
                    searchResultNum = '',
                    isFirstSearch = false,
                    searchFilter = false,
                    fromRecommend = false,
                    recommendId = '',
                    recommendSource = '',
                    referrer = document.referrer,
                    searchReg = RegMap.search,
                    detailReg = RegMap.detail;

                if (searchReg.test(pathname) || searchReg.test(referrer) && detailReg.test(pathname)) {
                    //针对搜索转化加入购物车的采集
                    this.helper.cookieHandler.setCookie(this.helper.cookieHandler.saSearchInfoCookieName, data.sku);
                    var search = this.helper.cookieHandler.getSearchDataItem(data.sku);
                    fromSearch = search.from_search;
                    searchKeyword = search.search_keyword;
                    searchPageNum = search.search_page_num;
                    searchResultNum = search.search_result_num;
                    isFirstSearch = search.is_first_search;
                    searchFilter = search.search_filter;
                }
                // if (searchReg.test(referrer) && detailReg.test(pathname)) {
                if (detailReg.test(pathname) && !this.tool.isObject(recommend)) {
                    //针对来源于推荐加入购物车的采集，根据url携带的rec处理数据
                    var recArr = this.tool.getUrlParamValue('rec');
                    var rec_recommendId = '';
                    var rec_recommendSource = '';
                    if (recArr.indexOf('|') > -1) {
                        recArr = recArr.split('|');
                        if (recArr.length > 1) {
                            rec_recommendId = recArr[0];
                            rec_recommendSource = recArr[1];
                        }
                    } else {
                        rec_recommendId = this.tool.getUrlParamValue('rec_id') || '';
                        rec_recommendSource = this.tool.getUrlParamValue('rec_source') || '';
                    }
                    if (rec_recommendId) {
                        fromRecommend = true;
                        recommendId = rec_recommendId;
                        recommendSource = rec_recommendSource;
                    }
                } else if (this.tool.isInArray(recommend) || this.tool.isObject(recommend)) {
                    //针对来源于推荐加入购物车的采集，根据参数recommend处理数据
                    fromRecommend = true;
                    recommendId = recommend.recommend_id;
                    recommendSource = recommend.recommend_source;
                }
                //推荐商品数据存储在cookie里面
                this.helper.cookieHandler.setCookie(this.helper.cookieHandler.saRecommendInfoCookieName, data.sku, {
                    recommend_id: recommendId,
                    recommend_source: recommendSource
                })
                $.extend(data, {
                    from_search: fromSearch,
                    search_keyword: searchKeyword,
                    search_page_num: searchPageNum,
                    search_result_num: searchResultNum,
                    is_first_search: isFirstSearch,
                    search_filter: searchFilter,
                    from_recommend: fromRecommend,
                    recommend_id: recommendId,
                    recommend_source: recommendSource
                });
                sa.track(event, data);
            }
        },
        //删除购物车
        remove_cart_product: function (skus) {
            if (skus && skus.length) {
                this.helper.cookieHandler.removeDataItems(skus);
                sa.track('remove_cart_product', { sku_list: skus });
            }
        },
        //加入收藏夹
        add_favorite: function (properties) {
            if (properties) {
                var data = $.extend({}, JSON.parse(properties));
                sa.track('add_favorite', data);
            }
        },
        //确认订单反馈
        onestepcheckout: function (error_msg, errorMsgId) {
            error_msg = error_msg || '';
            errorMsgId = errorMsgId || '';

            if (error_msg === '' && errorMsgId === '') return false;
            var data = $.extend({}, { error_msg: error_msg, error_message_id: errorMsgId });
            sa.track('confirm_order', data);
        },
        //存储列表页的数据，提供此数据给到外面调用
        catalog: {},
        //访问列表页
        view_product_list: function (resJson, params) {
            if (typeof resJson.facets !== 'undefined') {
                //兼容搜索v1版本
                if (!resJson.facets.cateId.length) return false;
                var firstCate = resJson.facets.cateId[0],
                    currentId = params.cid,
                    firstId = firstCate.cateId,
                    firsName = firstCate.name,
                    secondId = '',
                    secondName = '',
                    thirdId = '',
                    thirdName = '';

                if (firstId !== currentId) {
                    if (typeof firstCate._child !== 'undefined') {
                        var secondCate = firstCate._child;
                        for (var i = 0; i < secondCate.length; i++) {
                            var secondCateItem = secondCate[i];
                            if (secondCateItem.cateId === currentId) {
                                //当前页面是二级分类情况下
                                secondId = secondCateItem.cateId;
                                secondName = secondCateItem.name;
                                break;
                            }
                            if (typeof secondCateItem._child === 'undefined') continue;
                            var thirdCate = secondCateItem._child;
                            for (var j = 0; j < thirdCate.length; j++) {
                                var thirdCateItem = thirdCate[j];
                                if (thirdCateItem.cateId === currentId) {
                                    //当前页面是三级分类情况下
                                    secondId = secondCateItem.cateId;
                                    secondName = secondCateItem.name;
                                    thirdId = thirdCateItem.cateId;
                                    thirdName = thirdCateItem.name;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            if (typeof resJson.breadcrumb !== 'undefined') {
                //兼容搜索v2版本
                var cateArr = resJson.breadcrumb.paths,
                    firstId = '',
                    firsName = '',
                    secondId = '',
                    secondName = '',
                    thirdId = '',
                    thirdName = '';
                for (var i = 0; i < cateArr.length; i++) {
                    var cateItem = cateArr[i];
                    switch (i) {
                        case 0:
                            firstId = String(cateItem.key);
                            firsName = cateItem.name;
                            break;
                        case 1:
                            secondId = String(cateItem.key);
                            secondName = cateItem.name;
                            break;
                        case 2:
                            thirdId = String(cateItem.key);
                            thirdName = cateItem.name;
                            break;
                    }
                }
            }
            var data = this.catalog = {
                level_1_base_category_id: '',
                level_1_operation_category_id: firstId,
                level_1_operation_category_name: firsName,
                level_2_base_category_id: '',
                level_2_operation_category_id: secondId,
                level_2_operation_category_name: secondName,
                level_3_base_category_id: '',
                level_3_operation_category_id: thirdId,
                level_3_operation_category_name: thirdName,
                level_4_base_category_id: '',
                level_4_operation_category_id: '',
                level_4_operation_category_name: '',
                level_5_operation_category_id: '',
                level_5_operation_category_name: '',
                level_6_operation_category_id: '',
                level_6_operation_category_name: ''
            }
            sa.track('view_product_list', data);
        },
        view_detail_page(data) {
            var params = {};
            var getUrlParamValue = this.tool.getUrlParamValue;
            var rec_id = getUrlParamValue('rec_id');
            var rec_source = getUrlParamValue('rec_source');

            var getPropertyName = function (propertyName, rowIndex, colIndex) {
                if (propertyName === 'base') {
                    return `level_${rowIndex + 1}_base_category_${colIndex === 0 ? 'id' : 'name'}`;
                }

                return `level_${rowIndex + 1}_operation_category_${colIndex === 0 ? 'id' : 'name'}`;
            };

            var combineToObj = function (data, propertyName) {
                var res = {};


                for (var i = 0; i < data[propertyName].length; i++) {
                    var row = data[propertyName][i];
                    for (var j = 0; j < row.length; j++) {
                        res[getPropertyName(propertyName, i, j)] = row[j];
                    }
                }

                delete data[propertyName]
                return res;
            };

            $.extend(params, combineToObj(data, 'operation'), combineToObj(data, 'base'), data);

            if (rec_id) {
                params.from_recommend = true;
                params.recommend_id = rec_id;
                params.recommend_source = rec_source;
            } else {
                params.from_recommend = false;
                params.recommend_id = '';
                params.recommend_source = '';
            }

            sa.track('view_product', params);
        },
        //搜索反馈
        search: function (params, resJson) {
            var data = {},
                search_id = '',
                search_type_id = '1',
                keyword = typeof (params.kw) !== "undefined" ? unescape(params.kw) : false,
                result_barcode_list = [],
                page_number = typeof (params.page) !== "undefined" ? Number(params.page) : false;

            //采集"result_page_size"属性（兼容模式）
            var result_page_size = typeof (params.pageSize) !== "undefined" ? Number(params.pageSize) : typeof (resJson.pagination.current) !== "undefined" ? Number(resJson.pagination.current.limit) : typeof (resJson.pagination.defaultPageSize) !== "undefined" ? Number(resJson.pagination.defaultPageSize) : false;
            //采集"search_result_num"属性（兼容模式）
            var search_result_num = typeof (resJson.pagination.totalCount) !== "undefined" ? String(resJson.pagination.totalCount) : (typeof (resJson.pagination.total) !== "undefined" ? String(resJson.pagination.total) : false);
            //采集"search_sort"属性（兼容模式）
            var search_sort = typeof (params.sort) !== "undefined" && params.sort !== "" ? params.sort : (typeof (params.search_sort) !== "undefined" ? params.search_sort : false);
            if (search_sort === "top") {
                search_sort = "0";
            }

            if (search_sort !== false && !isNaN(Number(search_sort))) {
                search_sort = this.helper.searchSortFilter.call(this, search_sort);
            }
            //采集"result_sku_list"属性（兼容模式）
            var result_sku_list = [];
            resJson.data = typeof (resJson.results) === "undefined" ? resJson.data : resJson.results;
            if (resJson.data.length > 0) {
                $.each(resJson.data, function (index, func) {
                    result_sku_list.push(func.sku_full || func.merchant_sku);
                });
            }

            //采集"search_filter"属性
            var search_filter = this.helper.getSearchFilter.apply(this, [params, isSearchRefresh, result_page_size, search_sort]);
            console.log(search_filter ? "已过滤" : "未过滤");

            //采集"is_first_search"属性
            var is_first_search = this.tool.cookie("SA_SEARCH_IS_FIRST") ? true : false;
            console.log(is_first_search ? "是绝对搜索" : "不是绝对搜索")

            //判断哪些属性是否有传进来，缺某个属性不做采集
            if (keyword === false || page_number === false || result_page_size === false || search_sort === false) return false;

            var product = search_product = {
                search_id: search_id,
                search_type_id: search_type_id,
                keyword: keyword,
                search_sort: search_sort,
                result_sku_list: result_sku_list,
                result_barcode_list: result_barcode_list,
                page_number: page_number,
                result_page_size: result_page_size,
                search_result_num: search_result_num,
                search_filter: search_filter,
                is_first_search: is_first_search
            }

            data = $.extend({}, product);

            //设置搜索转化cookie
            this.helper.cookieHandler.setCookie(this.helper.cookieHandler.lastSearchCookieName, '', {
                search_page_num: page_number,
                search_keyword: keyword,
                search_result_num: search_result_num,
                is_first_search: is_first_search,
                search_filter: search_filter
            });
            //刷新当前页不做采集
            if (data.is_first_search || !isSearchRefresh) {
                sa.track('search', data);
                this.tool.cookie("SA_SEARCH_IS_FIRST", "", -1);
            }
            isSearchRefresh = false;
        },
        //搜索为空反馈
        search_null: function (params, resJson) {
            var is_first_search = this.tool.cookie("SA_SEARCH_IS_FIRST") ? true : false;
            var search_result_num = typeof (resJson.pagination.totalCount) !== "undefined" ? String(resJson.pagination.totalCount) : (typeof (resJson.pagination.total) !== "undefined" ? String(resJson.pagination.total) : false);
            var search_id = '',
                search_type_id = '1',
                keyword = typeof (params.kw) !== "undefined" ? unescape(params.kw) : '',
                result_sku_list = [],
                result_barcode_list = [],
                page_number = typeof (params.page) !== "undefined" ? Number(params.page) : '',
                //兼容服务化后用户没有选择页数的选项
                result_page_size = typeof (params.pageSize) !== "undefined" ? Number(params.pageSize) : (typeof (resJson.pagination.current) !== "undefined" ? resJson.pagination.current.limit : '');

            //排序值兼容
            var search_sort = typeof (params.sort) !== "undefined" && params.sort !== "" ? params.sort : (typeof (params.search_sort) !== "undefined" ? params.search_sort : '');
            if (search_sort !== false && !isNaN(search_sort)) {
                search_sort = this.helper.searchSortFilter(search_sort);
            }

            //兼容服务化后sort值为top的情况下
            if (search_sort === "top") {
                search_sort = "0";
            }

            var search_filter = this.helper.getSearchFilter.apply(this, [params, isSearchRefresh, result_page_size, search_sort]);

            var product = search_product = {
                search_id: search_id,
                search_type_id: search_type_id,
                keyword: keyword,
                search_sort: search_sort,
                result_sku_list: result_sku_list,
                result_barcode_list: result_barcode_list,
                page_number: page_number,
                result_page_size: result_page_size,
                is_first_search: is_first_search,
                search_result_num,
                search_filter
            }

            sa.track('search', product || {});
        },
        //搜索结果进商详
        search_result_to_product: function () {
            var _this = this;

            $(document).on('click', '[data-type="search-sensor"] a', function () {
                if (!$(this).hasClass("sensor-ignore-link")) {
                    var product = _this.helper.getProductInfo.call(_this, $(this).parents('[data-type="search-sensor"]'));
                    if (product) {
                        var data = $.extend({}, product, search_product);
                        sa.track('search_result_to_product', data);
                    }
                }
            })
        },
        //存储百分点推荐数据
        recommendData: [],
        //获取当前是否是新增未上报数据
        getReportId: function (id) {
            return $('.recLimit-' + id).attr('data-view-report') || '';
        },
        //浏览推荐栏
        view_recommend_column: function () {
            var _this = this;
            if (!this.recommendData.length) return;
            for (var i = 0; i < this.recommendData.length; i++) {
                var t = this.recommendData[i],
                    recommendId = t.rec_id,
                    recommendMark = t.rec_ds,
                    recommendType = t.rec_type,
                    recommendName = t.name,
                    data_view_report = _this.getReportId(recommendType),
                    skuList = [],
                    skuQty = 0,
                    recommendSource = t.rec_source;
                if (+data_view_report === 1) {
                    var $percentage = $('.percentage').filter('.recLimit-' + recommendType);
                    $percentage.find('.item[data-view=1]').each(function () {
                        var sku = $(this).attr('data-sku');
                        skuList.push(sku);
                        $(this).attr('data-view_recommend-type', 1);
                    })
                    skuQty = skuList.length;
                    if (!recommendId || !recommendMark || !recommendName || !skuList.length || !skuQty || !recommendSource) return false;
                    var data = {
                        recommend_id: recommendId,
                        recommend_mark: recommendMark,
                        recommend_name: recommendName,
                        recommend_rec_type: recommendType,
                        sku_list: skuList,
                        sku_qty: skuList.length,
                        recommend_source: recommendSource
                    }
                    sa.track('view_recommend_column', data);
                    window.viewRecommendColumnTimer = null;
                }
                //this.recommendData = [];
                data_view_report = '';
            }
            $('.percentage-container').find('.percentage').attr('data-view-report', 0);
        },
        //推荐列表进商详
        recommend_to_product: function () {
            var _this = this;
            $(document).on('click', '[data-type="sensor"] a', function () {
                if (!$(this).hasClass("sensor-ignore-link")) {
                    var product = _this.helper.getProductInfo.call(_this, $(this).parents('[data-type="sensor"]'));
                    if (product) {
                        var data = $.extend({}, product);
                        sa.track('recommend_to_product', data);
                    }
                }
            })
        },
        /**
         * 用于采集事件的属性辅助过滤
         */
        helper: {
            reportErrorMsg: function (event, type, errorMsgArr, errorMsgId) {
                var leg = errorMsgArr.length;

                errorMsgArr = errorMsgArr || this.helper.getErrorMsg.call(this, type);
                errorMsgId = errorMsgId || '';

                for (var i = 0; i < leg; i++) {
                    var data = $.extend({}, { error_msg: errorMsgArr[i], error_message_id: errorMsgId });
                    sa.track(event, data);
                }
            },
            //获取登录注册页提交表单(同步)后页面提示的报错信息
            getErrorMsg: function (type) {
                var errorMsg = $('.messages').find('.error-msg'),
                    unionMsg = $('.union-login-tip'),
                    $msg = type === "union" ? unionMsg : errorMsg;
                if ($msg.length) {
                    var arr = [];
                    $msg.each(function () {
                        var t = $(this).text();
                        t && arr.push(t);
                    })
                    return arr;
                } else {
                    return []
                }
            },
            searchSortFilter: function (sort) {
                switch (Number(sort)) {
                    case 0:
                        sort = "0";
                        break;
                    case 3:
                        sort = "p_a";
                        break;
                    case 4:
                        sort = "p_d";
                        break;
                    case 5:
                        sort = "ot_a";
                        break;
                    case 6:
                        sort = "ot_d";
                        break;
                    case 7:
                        sort = "sv_d";
                        break;
                    case 8:
                        sort = "s_d";
                        break;
                }
                return sort;
            },
            getProductInfo: function (sensor) {
                var recommendId = sensor.attr('data-recommend-id') || '',
                    recommendTypeId = sensor.attr('data-recommend-type-id') || '',
                    recommendMark = sensor.attr('data-recommend-mark') || '',
                    recommendName = sensor.attr('data-recommend-name') || '',
                    applicationName = sensor.attr('data-application-name') || '',
                    recommendSource = sensor.attr('data-recommend-source') || '',
                    sku = sensor.attr('data-sku') || '',
                    barcode = '',
                    positionNumber = sensor.attr('data-display-position-number'),
                    positionRow = sensor.attr('data-display-position-row'),
                    positionColumn = sensor.attr('data-display-position-column');

                    positionNumber = (positionNumber !== undefined && positionNumber !== '') ? Number(positionNumber) : false;
                    positionRow = (positionRow !== undefined && positionRow !== '') ? Number(positionRow) : false;
                    positionColumn = (positionColumn !== undefined && positionColumn !== '') ? Number(positionColumn) : false;

                if (!sku || positionNumber === false || positionRow === false || positionColumn === false || recommendId && (!recommendMark || !recommendName || !applicationName || !recommendSource)) return false;

                if (recommendTypeId) {
                    switch (recommendTypeId.toUpperCase()) {
                        case 'HOME':
                            recommendTypeId = "1";
                            break;
                        case 'RELATED':
                            recommendTypeId = "2";
                            break;
                        case 'CART':
                            recommendTypeId = "3";
                            break;
                        case 'CATEGORY':
                            recommendTypeId = "4";
                            break;
                        case 'SEARCH':
                            recommendTypeId = "5";
                            break;
                        case 'DEPARTMENT':
                            recommendTypeId = "6";
                            break;
                        case 'ALSO_BOUGHT':
                            recommendTypeId = "7";
                            break;
                        case 'PERSONAL':
                            recommendTypeId = "8";
                            break;
                        case 'POPULAR':
                            recommendTypeId = "9";
                            break;
                    }
                }

                return { recommend_id: recommendId, recommend_type_id: recommendTypeId, recommend_mark: recommendMark, recommend_name: recommendName, application_name: applicationName, recommend_source: recommendSource, sku: sku, barcode: barcode, display_position_number: positionNumber, display_position_row: positionRow, display_position_column: positionColumn };
            },
            getSearchFilter: function (params, isSearchRefresh, result_page_size, search_sort) {
                for (var key in params) if (params.hasOwnProperty(key)) {
                    if (['kw', 'page', 'pageSize', 'sort', 'search_sort', 'platform', 'oldQuery', 'spellCheck'].indexOf(key) < 0) {
                        //console.log(key + ": " + params[key])
                        if (params[key] !== undefined && params[key] !== "" && params[key] !== "0" && params[key] !== 0 && params[key] !== false && JSON.stringify(params[key]) !== "{}" && params[key] !== "0,0") {
                            if (key === "filter") {
                                //"filter" 前三位是有效数字
                                var arr = params[key].split("_");
                                for (var i = 0; i < 3; i++) {
                                    if (arr[i] !== "0") {
                                        return true;
                                    }
                                }
                            } else if (key === "aggs" || key === "aggsAttr" || key === "aggsCategory") {
                                //"aggs"、"aggsAttr"、"aggsCategory"默认值是1
                                if (params[key] !== 1) {
                                    return true;
                                }
                            } else if (key === "resetPage") {
                                if (!params[key]) {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        }
                    }
                }
                //判断"pageSize"字段是否有过滤
                if (isSearchRefresh) {
                    this.tool.cookie("SA_SEARCH_FIRST_PAGE_SIZE", result_page_size);
                } else {
                    if (Number(this.tool.cookie("SA_SEARCH_FIRST_PAGE_SIZE")) !== Number(result_page_size)) {
                        return true;
                    }
                }
                //判断"search_sort"字段是否有过滤
                this.tool.cookie("SA_SEARCH_IS_FIRST") ? this.tool.cookie("SA_SEARCH_FIRST_SORT", search_sort) : !this.tool.cookie("SA_SEARCH_FIRST_SORT") && this.tool.cookie("SA_SEARCH_FIRST_SORT", search_sort);
                if (search_sort !== this.tool.cookie("SA_SEARCH_FIRST_SORT")) {
                    return true;
                }
                return false;
            },
            /**
             * 1.搜索转化处理数据
             * 目前只对add_shopping_cart、view_generate_order_item事件进行采集
             * 采集的六个属性：
             * @param  {Boolean}  from_search         [是否来自搜索转化]
             * @param  {String}   search_keyword      [搜索关键词，默认为空字符串]
             * @param  {String}   search_page_num     [搜索页码，默认为空字符串]
             * @param  {String}   search_result_num   [搜索结果商品总数，默认为空字符串]
             * @param  {Boolean}  is_first_search     [是否第一次有效搜索]
             * @param  {Boolean}  search_filter       [搜索是否已进行过滤，翻页page不属于过滤]
             *
             * 2.百分点推荐处理数据
             * 目前只对add_shopping_cart、view_generate_order_item事件进行采集
             * 采集的三个属性：
             * @param  {Boolean}  from_recommend    [是否来源于推荐]
             * @param  {String}   recommend_id      [推荐id]
             * @param  {String}   recommend_source  [推荐来源]
             */
            cookieHandler: {
                saSearchInfoCookieName: "SA_SEARCH_INFO", //存储搜索sku数据的主要cookie
                lastSearchCookieName: "LAST_SEARCH", //存储搜索属性的辅助cookie
                saRecommendInfoCookieName: "SA_RECOMMEND_INFO", //存储推荐sku数据的cookie
                cookieDate: 15, //cookie过期天数
                maxCookieSize: 3, //限制设置cookie最大内存，单位kb
                //设置主要cookie或辅助cookie的值
                setCookie: function (name, sku, o) {
                    if (!name) return false;
                    var tool = window.indexSensors.tool,
                        value = '';
                    if (sku) {
                        var data = JSON.parse(tool.cookie(name) || '{}'),
                            newData = $.extend({}, data),
                            newItem = {};
                        if (name === this.saRecommendInfoCookieName) {
                            //百分点推荐cookie
                            if (!o.recommend_id || !o.recommend_source) return false;
                            newItem[sku] = newData[sku] = {
                                i: String(o.recommend_id),
                                s: String(o.recommend_source)
                            }
                        }
                        if (name === this.saSearchInfoCookieName) {
                            //搜索转化主要cookie
                            var search = JSON.parse(tool.cookie(this.lastSearchCookieName));
                            if (!search) return false;
                            newData[sku] = {
                                k: search.search_keyword,
                                p: search.search_page_num,
                                t: search.search_result_num,
                                i: search.is_first_search,
                                f: search.search_filter
                            }
                        }
                        value = JSON.stringify(newData);
                        var size = encodeURIComponent(value + name).length;
                        if (size > this.maxCookieSize * 1024) {
                            value = JSON.stringify(this.updateDataPrevItem(name, data, newItem));
                        }
                        tool.cookie(name, value, this.cookieDate);
                    } else if (name === this.lastSearchCookieName) {
                        //搜索转化辅助cookie
                        if (!o.search_keyword || !o.search_page_num || !o.search_result_num || typeof o.is_first_search === 'undefined' || typeof o.search_filter === 'undefined') return false;
                        value = {
                            search_page_num: String(o.search_page_num),
                            search_keyword: o.search_keyword,
                            search_result_num: String(o.search_result_num),
                            is_first_search: o.is_first_search,
                            search_filter: o.search_filter
                        }
                        tool.cookie(name, JSON.stringify(value));
                    }
                },
                //如果cookie超过最大值，新sku数据替换第一个sku数据
                updateDataPrevItem: function (cookieName, oldObj, newObj) {
                    for (var key in oldObj) {
                        delete oldObj[key];
                        if (encodeURIComponent(JSON.stringify($.extend({}, oldObj, newObj)) + cookieName).length > this.maxCookieSize * 1024) {
                            this.updateDataPrevItem(cookieName, oldObj, newObj);
                        } else {
                            return $.extend({}, oldObj, newObj);
                        }
                    }
                },
                //批量删除cookie里面对应的sku值
                removeDataItems: function (skus) {
                    var tool = window.indexSensors.tool;
                    if (!tool.isArray(skus)) return false;
                    var searchObj = JSON.parse(tool.cookie(this.saSearchInfoCookieName) || "{}"),
                        recommendObj = JSON.parse(tool.cookie(this.saRecommendInfoCookieName) || "{}");
                    for (var i = 0; i < skus.length; i++) {
                        if (searchObj.hasOwnProperty(skus[i])) {
                            delete searchObj[skus[i]];
                        }
                        if (recommendObj.hasOwnProperty(skus[i])) {
                            delete recommendObj[skus[i]];
                        }
                    }
                    tool.cookie(this.saSearchInfoCookieName, JSON.stringify(searchObj), this.cookieDate);
                    tool.cookie(this.saRecommendInfoCookieName, JSON.stringify(recommendObj), this.cookieDate);
                    return true;
                },
                //获取搜索单个sku对应的属性组合对象
                getSearchDataItem: function (sku) {
                    if (!sku) return false;
                    var tool = window.indexSensors.tool,
                        obj = JSON.parse(tool.cookie(this.saSearchInfoCookieName) || "{}");
                    if (obj.hasOwnProperty(sku)) {
                        var o = obj[sku];
                        return {
                            from_search: true,
                            search_keyword: o.k,
                            search_page_num: o.p,
                            search_result_num: o.t,
                            is_first_search: o.i,
                            search_filter: o.f
                        }
                    }
                    return {
                        from_search: false,
                        search_keyword: "",
                        search_page_num: "",
                        search_result_num: "",
                        is_first_search: false,
                        search_filter: false
                    }
                },
                getCookie(name) {
                    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
                }
            }
        },
        tool: {
            isArray: $.isArray,
            isObject: $.isPlainObject,
            isEmptyObject: $.isEmptyObject,
            isInArray: function (arr, item) {
                if (!this.isArray(arr) || !item) return false;
                return $.inArray(arr, item) !== -1;
            },
            getUrlParamValue: function (param) {
                var searchArr = window.location.search.replace(/\?/, '').split('&');
                for (var i = 0; i < searchArr.length; i++) {
                    var data = searchArr[i].split('='),
                        reg = new RegExp('^' + param + '$');
                    if (reg.test(data[0])) {
                        return data[1];
                    }
                }
                return '';
            },
            /**
             * 用于添加、修改和删除cookie
             * @param  {String}   name     [必选，cookie名称]
             * @param  {String}   value    [必选，cookie的值]
             * @param  {Number}   end      [可选，cookie过期时间，单位天数，不设置cookie，则为session类型的cookie]
             * @param  {String}   path     [可选，默认当前文档全部路径可见]
             * @param  {Boolean}  domain   [可选，默认为当前文档位置的路径的域名部分]
             * @param  {Boolean}  secure   [可选，默认不加密]
             */
            cookie: function (name, value, end, path, domain, secure) {
                var leg = arguments.length, expires;

                function getCookie(name) {
                    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
                }
                if (leg === 1) {
                    return getCookie(name);
                } else if (leg > 1) {
                    if (!name || /^(?:expires|path|domain|secure)$/i.test(name)) { return false }
                    if (end) {
                        if (Object.prototype.toString.call(end) !== "[object Number]") {
                            throw TypeError("The time should be a number");
                        }
                        var e = end * 24 * 60 * 60 * 1000,
                            t = (new Date()).getTime(),
                            s = e + t;
                        expires = ";expires=" + (new Date(s)).toUTCString();
                    } else {
                        expires = "";
                    }
                    name = encodeURIComponent(name);
                    value = encodeURIComponent(value);
                    path = path ? ";path=" + path : ";path=/";
                    domain = domain ? ";domain=" + domain : "";
                    secure = secure ? ";secure=" + secure : "";
                    document.cookie = name + "=" + value + expires + path + domain + secure;
                    return getCookie(name);
                } else {
                    return false
                }
            }
        }
    }
    indexSensors.init();
}(window.jQuery || window.$, window, da_sensorsdata))
