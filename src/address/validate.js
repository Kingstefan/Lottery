import RegExpRule from './regExpRule';

const formValid = function () {
    var _self = this,
        result = false;
    // 绑定Change事件
    const _bindChangeEvent = function (targetElement, validator) {
        var vItem;
        for (vItem in validator) {
            if (vItem !== 'compared') {
                _self.rules[vItem].call(_self, targetElement, validator[vItem]);
            } else {
                _self.rules['compared'].call(_self, targetElement, validator[vItem], validator[vItem]);
            }
        }
    };
    const _bindBlurEvent = function (targetElement, validator, isCheck) {
        var vItem;
        for (vItem in validator) {

            if (vItem === 'compared') {
                _self.rules['compared'].call(_self, targetElement, validator[vItem], validator[vItem]);
            } else {
                _self.rules[vItem].call(_self, targetElement, validator[vItem], isCheck);
            }
        }
    };
    _self.config = function (formTarget, options) {
        var formElement = $('#' + formTarget);
        $.each(options, function (item) {
            (function (item) {

                if (formElement.find('input[name=' + item + ']').length < 1 && formElement.find('select[name=' + item +
                        ']').length < 1) {
                    return;
                }
                var $childEle = formElement.find('input[name=' + item + ']');
                //兼容select选择触发
                if ($childEle.length < 1) {
                    $childEle = formElement.find('select[name=' + item + ']');
                }
                if (typeof options[item].required === 'string') {
                    //$childEle.attr('required', true);
                    //$childEle.attr('required-msg', options[item].required);
                }
                // 输入框值改变进行验证
                $childEle.on('change', function () {
                    // 表单不需验证时直接返回
                    if ($(this).attr('require')) {
                        return true;
                    }
                    //选择港澳台的正则改变
                    if ($(this).attr('id') == 'country') {
                        if (!($('.add').css('display') == 'block' && $('#newAddressForm input[name="telephone"]').val() ==
                                '' && $('#newAddressForm input[name="postcode"]').val() == '')) {
                            $('#newAddressForm input[name="telephone"]').trigger('blur');
                            $('#newAddressForm input[name="postcode"]').trigger('blur');
                        }
                    }
                    // 绑定验证器
                    _bindChangeEvent($childEle, options[item]);
                });
                // 输入框获取焦点移除报错
                $childEle.on('focus', function () {
                    $childEle.parents('.input-group').find('.icon-check-ok').removeClass('active');
                    $childEle.parents('.input-group').find('.accout-error').removeClass('active');
                });
                /* // 输入回车值改变进行验证
                $childEle.on('keyup', function(){
                    // 表单不需验证时直接返回
                    if(!$(this).attr('required')){
                        return true;
                    }
                    // 绑定验证器
                    _bindChangeEvent($childEle, options[item]);

                });
                // 输入回车值改变进行验证
                $childEle.on('keydown', function(){
                    // 表单不需验证时直接返回
                    if(!$(this).attr('required')){
                        return true;
                    }
                    // 绑定验证器
                    _bindChangeEvent($childEle, options[item]);

                }); */
                // 输入框值失去焦点进行验证
                $childEle.on('blur', function () {
                    // 表单不需验证时直接返回
                    if ($(this).attr('require')) {
                        return true;
                    }
                    // 绑定验证器
                    _bindBlurEvent($childEle, options[item], 'check');

                });
            })(item);
        });

    };
    // 表单提交验证
    _self.valid = function (formTarget, callback) {

        var formElement = $('#' + formTarget);
        var elementList = $(formElement).find('input:requerd');

        for (var i = 0; i < elementList.length; i++) {

            if ($(elementList[i]).attr('required') === true && $(elementList[i]).val() === '') {
                _self.rules.required.call(_self, $(elementList[i]), $(elementList[i]).attr('required-msg'));
                $(elementList[i]).attr('valid', false);
                result = false;
                return result;
            } else if ($(elementList[i]).attr('valid') === false) {
                result = false;
                return result;
            }
        }
        result = true;
        return result;
    };
}
// 验证器
formValid.prototype = {
    // 验证规则
    rules: {
        required: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (value === '' || ($(element).is(':checkbox') && !$(element).is(':checked'))) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                self.process.validateHold(element);
            }
        },
        nickname: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (!RegExpRule.nickNameRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        username: function (element, errorMsg, isCheck) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (value.indexOf('@') == -1 && !RegExpRule.cellphoneRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else if (value.indexOf('@') != -1 && !RegExpRule.emailRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                let check = '';
                /* 需要检测用户是否合法 */
                if (!serviceData.isNeedCheckUser() && isCheck) {
                    check = true;
                    serviceData.usernameCheck(element);
                } else {
                    $(element).attr('valid', true);
                }
                // $(element).attr('valid', true);
                return self.process.validateHold.call(self, element, check);
            }
        },
        cellphone: function (element, errorMsg, isCheck) {
            var value = element.val(),
                self = this;
            let phone = RegExpRule.cellphoneRule;
            /* 港澳台的手机号正则 */
            if ($('#newAddressForm').find('#country').val() == '港澳台') {
                phone = RegExpRule.HkcellphoneRule;
            }
            if (value === '') {
                return;
            } else if (value !== '' && !phone.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        email: function (element, errorMsg, isCheck) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (value !== '' && !RegExpRule.emailRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                // let check = '';
                /* 需要检测用户是否合法 */
                // if (!serviceData.isNeedCheckUser() && isCheck) {
                //  check = true;
                //  serviceData.usernameCheck(element);
                // }else{
                //  $(element).attr('valid', true);
                // }
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        password: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            /* 兼容支持老密码登录 */
            let pwd = RegExpRule.pwdRule;

            if (value === '') {
                return;
            } else if (!pwd.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        captcha: function (element, errorMsg, isCheck) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (!RegExpRule.captchaRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                let check = '';
                if (isCheck) {
                    check = true;
                    // serviceData.checkCaptcha(element); //检测验证码是否合法,TODO
                    element.parents('.input-group').find('.accout-error').removeClass("active");
                    $('[data-event-check]').removeAttr('isChecked');
                    $('.phone-captcha').removeAttr('disabled');
                } else {
                    check = false;
                }
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element, true);
            }
        },
        phoneCaptcha: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (formId.selector.indexOf('email') > -1) {
                return true;
            } else if (value === '') {
                return;
            } else if (!RegExpRule.phoneCapthcaRule.test(value)) {
                $(element).attr('valid', false);
                errorMsg = $(formId).find('.phone-captcha').attr('data-type') == 'email' ? '邮箱验证码错误' : errorMsg;
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        emailCaptcha: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (formId.selector.indexOf('cellphone') > -1 || formId.selector.indexOf('Phone') > -1) {
                return true;
            } else if (value === '') {
                return;
            } else if (!RegExpRule.emailCaptchaRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        compared: function (element, compareId, errorMsg) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (formId.selector == '#changePasswordForm' && (formId.find('input[name="current_password"]').val() ==
                    formId.find('input[name="password"]').val())) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, '不允许与旧密码一致');
            } else if (value !== formId.find('input[name="password"]').val()) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        choose: function (element) {
            if (!$(element).is(':checkbox')) {
                return;
            }
            if (!$(element).is(':checked')) {
                $(element).parents('form').find('[type="submit"]').addClass('disabled').attr('disabled', true);
                $(element).attr('valid', false);
            } else {
                $(element).attr('valid', true);
                $(element).parents('form').find('[type="submit"]').removeClass('disabled').attr('disabled', false);
            }
        },
        firstname: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (RegExpRule.pureNameRule.test(value) || RegExpRule.requireItemRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else if (!RegExpRule.fristNameRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, '最少2个字符，最多40个字符');
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        streetinfo: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (RegExpRule.pureNameRule.test(value) || RegExpRule.requireItemRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else if (!RegExpRule.streetInfoRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, '最少8个字符，最多100个字符');
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        postcode: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            /* 港澳台的手机号正则 */
            let code = RegExpRule.postCodeRule;
            if ($('#newAddressForm').find('#country').val() == '港澳台') {
                code = RegExpRule.HkpostCodeRule;
            }
            if (value === '') {
                return;
            } else if (!code.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        address: function (element, errorMsg) {
            var value = element.find('[selected="selected"]').val(),
                self = this;
            if (value === '') {
                return;
            } else if (!RegExpRule.addressRule.test(value) && (value == '国家、地域' || value == '省份' || value == '地级市' ||
                    value == '市、县级市')) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        requireRule: function (element, errorMsg) {
            var value = element.val(),
                self = this;
            if (value === '') {
                return;
            } else if (Number.isNaN(value) || !RegExpRule.requireItemRule.test(value)) {
                $(element).attr('valid', false);
                return self.process.errorHold.call(self, element, errorMsg);
            } else {
                $(element).attr('valid', true);
                return self.process.validateHold.call(self, element);
            }
        },
        remote: function (element, callback) {
            var value = element.val();
            if (value === '') {
                return false;
            }
            if (typeof callback == 'function') {
                callback();
            }
        }
    },
    // 处理验证结果
    process: {
        // 验证出错
        errorHold: function (element, msg) {
            const item = element.parents('.input-group');
            item.find('.accout-error').removeClass('is-ok');
            item.find('.accout-error').addClass('form-error').html('<i class="icon-error"></i>' + msg).addClass(
                'active').attr('sel-id', 'error-tip');
            item.find('.icon-check-ok').removeClass('active');
            return false;
        },
        // 验证通过
        validateHold: function (element, check) {
            const item = element.parents('.input-group');
            item.find('.accout-error').removeClass('form-error active is-ok').html('').removeAttr('sel-id');
            if (check) {
                item.find('.icon-check-ok').removeClass('active');
            } else {
                item.find('.icon-check-ok').addClass('active');
            }
            return true;
        },
        // 表单提交错误提示
        formErrorHold: function (formElement, errMsg) {
            $(formElement).find('.accout-error-all').html('<i class="i-error"></i>' + errMsg).addClass('active');
        }
    }
}

export default new formValid()
