import serviceData from './ajaxUrl';
import ErrorMsg from './errorMseeage';
import Validte from './validate';


var addressFn = function () {
    var _self = this;
    /*<收货地址>*/
    _self.$addressList = $('#addressList');
    _self.$addressItem = _getAddressItem;
    /*获取地址所有数据*/
    this.initGetAllAddressInfo = function (callback) {
        var url = serviceData.requestURL.promoAddressInfo;
        serviceData.requestdata(url, {
            method: 'GET'
        }, function (data) {
            window.ALLADDRESSINFO = data;
            if (typeof callback == 'function') {
                callback(data);
            }
        })
    }

    function _getAddressItem() {
        return _self.$addressList.find('.address-item');
    }

    function _getDefaultAddressItem() {
        return _getAddressItem().filter('.default');
    }
    /* 地址编辑时修改手机号并清空 */
    function clearCellphone(flag) {
        const clearItem = $('#newAddressCtn input[name="telephone"]');
        clearItem.focus(function (e) {
            e.preventDefault();
            if (flag) {
                clearItem.val('');
                flag = null;
            }
        });
    }
    /*<新增地址弹窗>*/
    this.initAddNewAddressHandler = function () {
        var $btnNewAddress = $('#btnNewAddress');
        $btnNewAddress.on('click', function (event) {
            _resetAddressForm();
            easyDialog.open({
                container: 'newAddressCtn'
            });
            /* 移除修改地址后添加的验证信息并重置 */
            $('#newAddressForm').find('[valid="true"]').removeAttr('valid');
            $('#clauseCheckbox').attr('valid', true);
        });
    }
    /*异步读取地址*/
    this.initAddress = function () {
        var url = serviceData.requestURL.promoAddressAllUrl;
        serviceData.requestdata(url, {
            method: 'GET'
        }, function (data) {
            if (data.status == 200) {
                var dataObj = data.data;
                var adressData = [];
                if (dataObj && dataObj.length > 0) {
                    dataObj = dataObj.reverse();
                    for (var i = 0; i < dataObj.length; i++) {
                        //把默认地址重新排到最前面
                        if (dataObj[i]
                            .default_shipping == 1) {
                            adressData.unshift(dataObj[i]);
                        } else {
                            adressData.push(dataObj[i]);
                        }

                    }
                }
                //console.log(adressData)
                // var data = adressData;
                // var htmlDom = addressPromoHbs({
                //     data
                // });
                //$('.address-ctn').html(htmlDom);
                _self.$addressList = $('#addressList');

                /*重置国家收货地址*/
                _self.initGetAllAddressInfo(function (data) {
                    var countryFlag = true;
                    var countryArr = data.country['0'];
                    for (var i in countryArr) {
                        if (countryArr[i].name == '港澳台') {
                            countryFlag = false;
                            break;
                        }
                    }
                    if (countryFlag) {
                        $('#country').find('option[value="港澳台"]').remove();
                    }
                })

                _self.$addressItem = _getAddressItem;
                _self.initCancelAddNewAddressHandler();
                _self.initToggleAddressEvent();
            }
        })
    }
    this.initCancelAddNewAddressHandler = function () {
        $('.btn-cancel').on('click', function (event) {
            _setNewAddressDialogTitle('add');
            easyDialog.close();
        });
    }

    function _setNewAddressDialogTitle(type) {
        type = type || 'add';
        var $addressTitle = $('#newAddressCtn').find('.newaddress-title');
        var $addressTitleToShow = $addressTitle.filter('.' + type).show();
        const addCtn = $('#newAddressCtn').find('#firstname');
        $addressTitle.not($addressTitleToShow).hide();
        if (type == 'verified') {
            addCtn.attr('readonly', 'readonly');
        } else {
            addCtn.removeAttr('readonly');
        }
    }
    /*</新增地址弹窗>*/
    /*<切换地址>*/
    this.initToggleAddressEvent = function () {
        _self.$addressList.on('click', function (event) {
            var $target = $(event.target);
            if ($target.is(event.currentTarget)) {
                return false;
            }
            if (!$target.is('.address-item')) { //点击地址内部元素时，找到对应的item
                $target = $target.parentsUntil('.address-list').filter('.address-item');
            }
            if ($target.is('.newaddress-item') || $target.length == 0) { //已经是被选择或是新增地址按钮，终止
                return false;
            }
            var $isCtrlTarget = $(event.target);
            if ($isCtrlTarget.is('.ctrl-setdefault')) { //点击设置默认
                var addressId = $isCtrlTarget.attr('data-address-id');
                _setDefaultAddress(addressId);
            } else if ($isCtrlTarget.is('.ctrl-edit')) { //点击编辑
                var addressId = $isCtrlTarget.attr('data-address-id');
                var isVerified = $isCtrlTarget.attr('data-verify');
                _editAddress(addressId, isVerified);
            } else if ($isCtrlTarget.is('.ctrl-delete')) { //点击删除
                var addressId = $isCtrlTarget.attr('data-address-id');
                _deleteAddress(addressId);
            }

        });
    }
    /*</切换地址>*/
    /*<保存地址表单验证>*/
    this.initNewAddressValidate = function () {
        $('#newAddressForm').on('click', '#btnSaveAddress', function () {
            if ($('#btnSaveAddress').is('.disabled') || $('#btnSaveAddress').is(':disabled')) {
                return false;
            }
            if (!_extraAddressValidate()) {
                return false;
            }
            _saveAddress();
            return false;
        });
    }
    /*</保存地址表单验证>*/
    function _extraAddressValidate() {
        var postcode = $.trim($('#postcode').val());
        var country = $.trim($('#country').val());
        var region_id = $.trim($('#region_id').val());
        var city = $.trim($('#city').val());
        var s_county = $.trim($('#s_county').val());
        if (country == '国家、地域' || region_id == '省份' || city == '地级市' || s_county == '市、县级市') {
            $('#s_county').trigger('blur');
            return false;
        }
        if ($('#country').val() == '中国大陆' && (postcode == '000000' || postcode.length != 6)) {
            $('#postcode').parent().addClass('error unvalid');
            $('#firstname,#street,#telephone,#postcode,#email').trigger('blur');
            return false;
        } else {
            return true;
        }
    }

    function _saveAddress() { //保存地址
        var addressParams = _getAddressParams();
        var newFirstName = addressParams.firstname;
        var isEdit = addressParams.id ? true : false;
        if (isEdit) {
            var url = serviceData.requestURL.promoSaveAddressUrl;
            if (newFirstName != window.initFirstName) {
                addressParams['identity'] = '';
            }
        } else {
            var url = serviceData.requestURL.promoCreateAddressUrl;
        }

        //检测是否通过检验
        if (!serviceData.isCheckoutValidate(formId)) {
            $('#btnSaveAddress').removeAttr('disabled').removeClass('disabled');
            return false;
        }
        serviceData.showBtnLoading($('#btnSaveAddress'));
        serviceData.requestdata(url, addressParams, function (data) {
            if (data.status == 200) {
                easyDialog.close();
                //_self.initAddress(); //重新请求一次全部数据展示，重新排序
                $('.no-items').addClass('hidden');
                const length = $('.address-list li').length;
                $('.page-bottom .left i').html(length);
            } else {
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: data.message,
                        yesFn: true
                    }
                })
            }
            serviceData.hideBtnLoading($('#btnSaveAddress'));
        })

    }
    /*<编辑地址>*/
    function _editAddress(addressId, isVerified) {
        let url = serviceData.requestURL.promoGetUserAddressInfoUrl;
        const argument = {
            id: addressId,
            method: 'GET'
        }
        clearCellphone('clear'); //当手机号输入框获取焦点时清除已存在的值
        serviceData.requestdata(url, argument, function (data) {
            if (data.status == 200) {
                for (var i in data.data) {
                    window.initFirstName = data.data[i].firstname;
                    data.data[i].isVerified = isVerified;
                    _openEditAddressDialog(data.data[i]);
                }

            } else {
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: data.msg,
                        yesFn: function () {}
                    }
                });
            }
        })
    }

    function _openEditAddressDialog(address) {
        _resetAddressForm();
        _setAddressFormParams(address);
        if (address.isVerified == 0) {
            _setNewAddressDialogTitle('edit');
        } else {
            _setNewAddressDialogTitle('verified');
        }
        easyDialog.open({
            container: 'newAddressCtn'
        });
    }
    /*</编辑地址>*/
    function _hideAddressItemTemporary($deleteAddressItem) {
        if ($deleteAddressItem.is('.default')) { //如果删除的是默认的，则删除后id最小为新的默认
            var $newDefaultAddressItem = _getNewDefaultAddressItem($deleteAddressItem);
            if ($newDefaultAddressItem) {
                $newDefaultAddressItem.addClass('default');
            }
            $deleteAddressItem.removeClass('default').addClass('last-default');
        }
        $deleteAddressItem.addClass('wait-for-delete').fadeOut();
    }

    function _updateAddressList(addressParams, isEdit) { //更新地址列表
        // const addressList = addressHbs({
        //     addressParams
        // });
        if (isEdit) {
            var $editAddressItem = _self.$addressItem().filter('[data-address-id="' + addressParams['id'] + '"]');
            $editAddressItem.replaceWith(addressList);
        } else {
            if (_getAddressItem().length) {
                _getAddressItem().first().before(addressList);
            } else {
                $('#addressList').html(addressList);
            }
        }
        /*         if (addressParams["default"]) {
                    $newAddressItem.siblings().removeClass("default");
                } */

    }

    function _resetAddressForm() {
        var $newAddressForm = $('#newAddressForm');
        $newAddressForm.find('.address-group').removeClass('error unvalid empty');
        $newAddressForm.get(0).reset();
        $newAddressForm.find('#addressId').val('');
        $newAddressForm.find('#entityId').val('');
        $newAddressForm.find('#setDefault').removeAttr('checked');
        $newAddressForm.find('.error').removeClass('error');
        $newAddressForm.find('#country').find('[value="国家、地域"]').attr('selected', 'selected');
        $newAddressForm.find('#region_id').find('[value="省份"]').attr('selected', 'selected');
        $newAddressForm.find('#city').find('[value="地级市"]').attr('selected', 'selected');
        $newAddressForm.find('#s_county').find('[value="市、县级市"]').attr('selected', 'selected');
        $('#btnSaveAddress').removeAttr('disabled').removeClass('disabled');
        $('.accout-error').removeClass('active');
        // change(0);
    }

    function _getAddressParams() { //获取新增/修改地址表单数据
        var specialCountry = {
            '香港': 'HK',
            '澳门': 'MO',
            '台湾': 'TW'
        };
        var $newAddressForm = $('#newAddressForm');
        // console.log($newAddressForm.get(0))
        var addressParams = {};
        addressParams['id'] = $newAddressForm.find('#entityId').val();
        addressParams['firstname'] = $.trim($newAddressForm.find('#firstname').val());
        addressParams['country'] = $newAddressForm.find('#country').val();
        addressParams['region'] = $newAddressForm.find('#region_id').val();
        addressParams['city'] = $newAddressForm.find('#city').val();
        addressParams['county'] = $newAddressForm.find('#s_county').val();
        addressParams['street'] = $newAddressForm.find('#street').val();
        addressParams['telephone'] = $newAddressForm.find('#telephone').val();
        addressParams['postcode'] = $newAddressForm.find('#postcode').val();
        addressParams['email'] = $newAddressForm.find('#email').val();
        addressParams['default_shipping'] = $newAddressForm.find('.clause-checkbox').is(':checked') ? 1 : 0;
        addressParams['lastname'] = '.';
        addressParams['form_key'] = $newAddressForm.find('#formkey').val();

        addressParams['default'] = $newAddressForm.find('.clause-checkbox').is(':checked') ? 1 : 0;

        addressParams['streetinfo'] = addressParams['street'];
        addressParams['isVerified'] = $newAddressForm.find('#verify').val();
        addressParams['country_id'] = specialCountry[addressParams['region']] ? specialCountry[addressParams['region']] : 'CN';
        if ($('#addressId').val()) {
            addressParams['id'] = $('#addressId').val();
        }
        if (_self.$addressItem().length == 0) {
            addressParams['default_shipping'] = 1;
            addressParams['default'] = 1;
        }
        return addressParams;
    }
    this.validte = function () {
        const formName = serviceData.removeSekector(formId);
        Validte.config(formName, {
            telephone: {
                required: ErrorMsg.phoneR,
                cellphone: ErrorMsg.phoneS
            },
            streetinfo: {
                required: ErrorMsg.streetinfoR,
                streetinfo: ErrorMsg.streetinfoRule,
                /* requireRule: ErrorMsg.streetinfoRule */
            },
            postcode: {
                required: ErrorMsg.postcodeR,
                postcode: ErrorMsg.postcodeS
            },
            email: {
                required: ErrorMsg.emailR,
                email: ErrorMsg.emailS
            },
            firstname: {
                required: ErrorMsg.firstnameR,
                firstname: ErrorMsg.firstnameRule,
                /* requireRule: ErrorMsg.firstnameRule, */
            },
            nation_NoUse: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            },
            region: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            },
            county: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            },
            city: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            }
        });
    }

    function _setAddressFormParams(address) {
        console.log(11111111)
        if (address.region == '香港' || address.region == '澳门' || address.region == '台湾') {
            address.countryId = '港澳台';
        } else {
            address.countryId = '中国大陆';
        }
        var $newAddressForm = $('#newAddressForm');
        var selection = [$newAddressForm.find('#country'), $newAddressForm.find('#region_id'), $newAddressForm.find('#city'), $newAddressForm.find('#s_county')];
        var selectionVal = [address.countryId, address.region, address.city, address.county];
        for (var i = 0; i < selection.length; i++) {
            // change(i); //func in area.js
            selection[i].find('[value="' + selectionVal[i] + '"]').attr('selected', 'selected');
        }


        if (address.countryId == '中国大陆') {
            var iRegion = window.ALLADDRESSINFO.region['1'];
        } else {
            var iRegion = window.ALLADDRESSINFO.region['2'];
        }
        var iRegionArr = ['<option value="省份">省份</option>'];
        var iCityArr = ['<option value="地级市">地级市</option>'];
        var iCountyArr = ['<option value="市、县级市">市、县级市</option>'];
        for (var i in iRegion) {
            if (iRegion[i].id) {
                if (iRegion[i].id) {
                    if (iRegion[i].name == address.region) {
                        iRegionArr.push('<option value="' + iRegion[i].name + '" selected="selected" add-id=' + iRegion[i].id + '>' + iRegion[i].name + '</option>');
                        window.promoRegion = iRegion[i].id;
                    } else {
                        iRegionArr.push('<option value="' + iRegion[i].name + '" add-id=' + iRegion[i].id + '>' + iRegion[i].name + '</option>');
                    }
                }
            }
        }
        iRegionArr = iRegionArr.join('');
        $newAddressForm.find('#region_id').html(iRegionArr);
        console.log(iRegionArr)

        var iCity = window.ALLADDRESSINFO.city[window.promoRegion];
        for (var i in iCity) {
            if (iCity[i].id) {
                if (iCity[i].name == address.city) {
                    iCityArr.push('<option value="' + iCity[i].name + '" selected="selected" add-id=' + iCity[i].id + '>' + iCity[i].name + '</option>');
                    // window.promoRegion = iCity[i].id;
                } else {
                    iCityArr.push('<option value="' + iCity[i].name + '" add-id=' + iCity[i].id + '>' + iCity[i].name + '</option>');
                }
            }
        }
        iCityArr = iCityArr.join('');
        $newAddressForm.find('#city').html(iCityArr);

        // _checkAddress();
        _checkCounty($newAddressForm.find('#city').find('option:selected').attr('add-id'), function () {
            $newAddressForm.find('#s_county').find('[value="' + address.county + '"]').attr('selected', 'selected');
        });

        $newAddressForm.find('#addressId').val(address.addressId).attr('valid', true);
        $newAddressForm.find('#firstname').val(address.firstname).attr('valid', true);
        $newAddressForm.find('#street').val(address.street).attr('valid', true);
        $newAddressForm.find('#postcode').val(address.postcode).attr('valid', true);
        $newAddressForm.find('#telephone').val(address.telephone).attr('valid', true);
        $newAddressForm.find('#email').val(address.email).attr('valid', true);
        $newAddressForm.find('#country_id').val(address.countryId).attr('valid', true);
        $newAddressForm.find('#verify').val(address.isVerified).attr('valid', true);
        $newAddressForm.find('#entityId').val(address.entity_id).attr('valid', true);

        if (address.isDefault) {
            $newAddressForm.find('#setDefault').attr('checked', 'checked');
        }
        if (address.isVerified == 1) {
            $newAddressForm.find('#firstname').attr('readonly', 'readonly');
        }


    }

    /*切换地址*/
    function _checkAddress() {
        $('#country').on('change', function () {
            var $target = $(this);
            if ($target.val() == '中国大陆') {
                _checkCountry(1);
            } else {
                _checkCountry(2);
            }
        });
        $('#region_id').on('change', function () {
            var $target = $(this);
            _checkGegion($target.find('option:selected').attr('add-id'));
        });
        $('#city').on('change', function () {
            var $target = $(this);
            _checkCounty($target.find('option:selected').attr('add-id'));
        });
    }

    /*切换国家*/
    function _checkCountry(id) {
        var $newAddressForm = $('#newAddressForm');
        var iRegion = window.ALLADDRESSINFO.region[id];
        var iRegionArr = ['<option value="省份">省份</option>'];
        for (var i in iRegion) {
            if (iRegion[i].id) {
                iRegionArr.push('<option value="' + iRegion[i].name + '" add-id=' + iRegion[i].id + '>' + iRegion[i].name + '</option>');
            }

        }
        iRegionArr = iRegionArr.join('');
        $newAddressForm.find('#region_id').html(iRegionArr);
        $newAddressForm.find('#city').find('[value="地级市"]').attr('selected', 'selected');
        $newAddressForm.find('#s_county').find('[value="市、县级市"]').attr('selected', 'selected');
    }

    /*切换省份*/
    function _checkGegion(id) {
        var $newAddressForm = $('#newAddressForm');
        var iCity = window.ALLADDRESSINFO.city[id];
        var iCityArr = ['<option value="地级市">地级市</option>'];
        for (var i in iCity) {
            if (iCity[i].id) {
                iCityArr.push('<option value="' + iCity[i].name + '" add-id=' + iCity[i].id + '>' + iCity[i].name + '</option>');
            }
        }
        iCityArr = iCityArr.join('');
        //console.log(iCityArr)
        $newAddressForm.find('#city').html(iCityArr);
        $newAddressForm.find('#s_county').find('[value="市、县级市"]').attr('selected', 'selected');
    }

    /*切换市区*/
    function _checkCounty(id, callback) {
        var url = serviceData.requestURL.promoAddressCounty;
        var argument = {
            method: 'GET',
            city_id: id
        }
        serviceData.requestdata(url, argument, function (data) {
            var $newAddressForm = $('#newAddressForm');
            var iCountyArr = ['<option value="市、县级市">市、县级市</option>'];
            for (var i in data) {
                if (data[i].id) {
                    iCountyArr.push('<option value="' + data[i].name + '" add-id=' + data[i].id + '>' + data[i].name + '</option>');
                }
            }
            iCountyArr = iCountyArr.join('');
            $newAddressForm.find('#s_county').html(iCountyArr);
            if (typeof callback == 'function') {
                callback();
            }
        })
    }
    _checkAddress();


    function _setDefaultAddress(addressId) { //设为默认地址
        var $lastDefaultAddressId = _getDefaultAddressItem().attr("data-address-id");
        let url = serviceData.requestURL.promoSetAddressDefaultUrl;
        const argument = {
            id: addressId
        }
        _toggleToDefaultAddress(addressId); //直接显示为默认地址，设置失败再重置
        serviceData.requestdata(url, argument, function (data) {
            if (data.ret == 1) { //设置失败，页面展示还原之前的显示效果
                _toggleToDefaultAddress($lastDefaultAddressId);
                easyDialog.open({ //设置失败，提醒用户。成功不提醒。
                    container: {
                        header: '提示',
                        content: data.msg,
                        yesFn: function () {}
                    }
                });
            }
        })
    }

    function _toggleToDefaultAddress(addressId) { //页面地址样式切换
        _self.$addressItem().filter('[data-address-id="' + addressId + '"]').addClass('default')
            .siblings('.default').removeClass('default');
    }

    function _deleteAddress(addressId) { //删除地址
        $('.easyDialog_wrapper').addClass('rebuy-alert bind-alert');
        easyDialog.open({
            container: {
                header: '提示',
                content: `<p class="warning"><i class='icon-status warning'></i>确认要删除该地址?</p>`,
                yesFn: function () {
                    var $deleteAddressItem = _self.$addressItem().filter('[data-address-id="' + addressId + '"]');
                    let url = serviceData.requestURL.promoDeleteAddressUrl;
                    const argument = {
                        id: addressId
                    }
                    serviceData.requestdata(url, argument, function (data) {
                        if (data.status == 200) {
                            _deleteAddressItemReally($deleteAddressItem);
                            if ($('.address-item').length < 1) {
                                $('.no-items').removeClass('hidden');
                            }
                            const length = $('.address-list li').length;
                            if (length == 0) {
                                serviceData.reload();
                            }
                        } else {
                            _recoveryDeleteAddressItem($deleteAddressItem);
                            $('.easyDialog_wrapper').addClass('rebuy-alert bind-alert');
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: data.message,
                                    yesFn: false,
                                    noFn: false
                                }
                            });
                        }
                    })
                },
                noFn: true
            }
        })
    }

    function _deleteAddressItemReally($deleteAddressItem) {
        $deleteAddressItem.remove();
    }

    function _recoveryDeleteAddressItem($deleteAddressItem) {
        $deleteAddressItem.removeClass('wait-for-delete').fadeIn();
        if ($deleteAddressItem.is('.last-default')) { //删除时是默认的，删除失败，恢复其默认的身份地位~~
            $deleteAddressItem.addClass('default').siblings().removeClass('.default');
        }
    }
}
$(function () {
    var address = new addressFn();
    window.formId = $('#newAddressForm');
    address.initAddress();
    address.initAddNewAddressHandler();
    address.initCancelAddNewAddressHandler();
    address.initToggleAddressEvent();
    address.initNewAddressValidate();
    address.validte();
    address.initGetAllAddressInfo();
})
