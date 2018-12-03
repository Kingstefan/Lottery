const RegExpRule = {
    nickNameRule: /^[\s\S]{2,20}$/, //昵称
    cellphoneRule: /^1[3|4|5|6|7|8|9]\d{9}$/, //手机号
    HkcellphoneRule: /^\d{8,16}$/, //港澳台手机号
    emailRule: /^(?:[a-z0-9]+[_\-+\.]+)*[a-z0-9]+@(?:([a-z0-9]+-?)*[a-z0-9]+\.)+([a-z]{2,})+$/i, //邮箱
    pwdRule: /^(?=.*[a-zA-Z0-9~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{6,20}$/, //密码
    loginPwdRule: /^(?=.*[a-zA-Z0-9~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{4,30}$/, //登录密码
    captchaRule: /^\d{4}$/, //图形验证码
    phoneCapthcaRule: /^\d{6}$/, //手机验证码
    emailCaptchaRule: /^\d{6}$/, //邮箱验证码
    fristNameRule: /^[\s\S]{2,40}$/, //收货人名字
    pureNameRule: /^[0-9]*$/, //纯数字
    pureSignRule: /^[^\w\s]*$/, //纯符号和中文
    streetInfoRule: /^[\s\S]{8,100}/, //街道
    postCodeRule: /^\d{6}$/, //邮编
    HkpostCodeRule: /^\d{3,6}$/, //港澳台邮编
    addressRule: /^[\u4e00-\u9fa5_]$/, //省市区
    requireItemRule: new RegExp('^[`~!·@#$%^&*()=|{}":;",\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“"。，、？]*$') //特殊字符
};

export default RegExpRule;
