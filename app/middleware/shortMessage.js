const crypto = require('crypto');
const http = require("http");
const cfg = require('../../config/common').config;
var ShortMessageModel = require('../models/shortMessage');
var User = require('../models/user')

/*
 * 漫道短信接口平台接口对接
 */

/**
 * 登陆/注册验证码
 * @param {请求} req 
 * @param {返回} resp 
 */
exports.sendShortMessageForLogin = (req, resp) => {
    console.log('获取req信息')
    console.log(req);
    if (!req.body.mobile) {
        console.log('手机号为空' + req.body.mobile);
        return { code: -1, msg: '系统异常' };
    }
    if (!checkMobile(req.body.mobile)) {
        console.log('手机号格式错误');
        return { code: -1, msg: '手机号格式错误' };
    }
    // 校验手机号是否已经关联用户,如果没有关联则不发送验证码并返回错误提示
    var res = checkPhoneFromUser(req.body.mobile);
    if (res.code == 1) {
        return sendShortMessage(req.body.mobile, false, resp);
    } else {
        return { code: -1, msg: res.msg }
    }
}

/**
 * 找回密码验证码
 * @param {请求} req 
 * @param {返回} resp 
 */
exports.sendShortMessageForReset = (req, resp) => {
    if (!req.body.mobile) {
        console.log('手机号为空' + req.body.mobile);
        return { code: -1, msg: '系统异常' };
    }
    if (!checkMobile(req.body.mobile)) {
        console.log('手机号格式错误');
        return { code: -1, msg: '手机号格式错误' };
    }
    // 校验手机号是否已经关联用户,如果没有关联则不发送验证码并返回错误提示
    var res = checkPhoneFromUser(req.body.mobile);
    if (res.code == 1) {
        return sendShortMessage(req.body.mobile, true, resp);
    } else {
        return { code: -1, msg: res.msg }
    }
}

exports.checkShortMessage = (req, resp) => {
    if (req.body.mobile && req.body.num) {
        resp = findShortMessageByMobile(req.body.mobile, req.body.num);
    } else {
        console.log('手机号:' + mobile + '验证码校验失败,失败原因为:手机号或验证码为空');
        resp = { code: -1, msg: '手机号:' + mobile + '验证码校验失败,失败原因为:手机号或验证码为空' }
    }
}

/**
 * 正则校验手机号
 * @param {手机号} mobile 
 */
function checkMobile(mobile) {
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile))) {
        console.log("手机号码不合法，请重新输入");
        return false;
    } else {
        return true;
    }
}

/**
 * 校验手机号是否关联用户,如果没有关联则返回错误提示
 * @param {手机号} mobile 
 */
function checkPhoneFromUser(mobile) {
    User.find({ 'phone': mobile }, function (err, data) {
        if (err) {
            console.log('根据手机号:' + mobile + '查询用户失败,失败原因为:' + err);
            return { code: -1, msg: err };
        }
        if (!data) {
            console.log('根据手机号:' + mobile + '未查询到关联用户信息,请确认该手机号是否已经绑定');
            return { code: -1, msg: '根据手机号:' + mobile + '未查询到关联用户信息,请确认该手机号是否已经绑定' };
        }
        return { code: 1, msg: '校验成功!' };
    });
}

/**
 * 倒序查询出一个验证码信息,进行校验;
 * @param {手机号} mobile 
 * @param {验证码} num 
 */
function findShortMessageByMobile(mobile, num) {
    ShortMessageModel.find({ 'mobile': mobile }, function (err, data) {
        if (err) {
            console.log('根据手机号:' + mobile + '查询失败,失败原因为:' + err);
            rem(mobile);
            return { code: -1, msg: err };
        }
        if (!data) {
            console.log('手机号:' + mobile + '验证码校验失败,失败原因为:未查询到该手机号发送过验证码');
            return { code: -1, msg: '手机号:' + mobile + '验证码校验失败,失败原因为:未查询到该手机号发送过验证码!' };
        }
        // 1.校验短信验证码
        if (data.num != num) {
            console.log('手机号:' + mobile + '验证码校验失败,失败原因为:证码错误!');
            rem(mobile);
            return { code: -1, msg: '手机号:' + mobile + '验证码校验失败,失败原因为:验证码错误!' };
        }
        // 2.是否超过5分钟
        var time = data.time;
        var now = Date.now();
        if (now < (time + 5 * 60 * 1000)) {
            console.log('手机号:' + mobile + '验证码校验失败,失败原因为:超过五分钟!');
            rem(mobile);
            return { code: -1, msg: '手机号:' + mobile + '验证码校验失败,失败原因为:超过五分钟!' };
        }
        rem(mobile);
        return { code: 1, msg: '校验成功!' };
    }).sort({ time: -1 });;
}

/**
 * 根据手机号删除信息
 * @param {手机号} mobile 
 */
function rem(mobile) {
    ShortMessageModel.remove({
        mobile: mobile
    }, function (err, ShortMessageModel) {
        res.json(ShortMessageModel);
    });
}
/**
 * 存储短信内容
 * @param {请求} req 
 * @param {返回} res 
 * @param {短信保存的数据信息} model 
 */
function saveShortMessage(model) {
    ShortMessageModel.create((model),
        function (err, ShortMessageModel) {
            if (err) {
                console.log('保存失败!失败原因:' + err);
                return { code: -1, msg: error };
            }
            return { code: 1, msg: '保存成功' };
            // res.json(ShortMessageModel);
        });
}

/**
 * 发送短信公共方法
 * @param {手机号} mobile 
 * @param {是否为找回密码:true 是; false 不是} isReset 
 */
function sendShortMessage(mobile, isReset, resp) {
    // pwd拼接
    var pwd = getMd5(cfg.mandao.sn + cfg.mandao.password);
    // 获取随机数
    var num = getNumber();
    // content拼接
    var content = getContent(num, isReset);
    // 请求地址拼接
    var url = cfg.mandao.url + '?sn=' + cfg.mandao.sn + '&pwd=' + pwd +
        '&mobile=' + mobile + '&content=' + content + '&ext=&stime=&rrid=&msgfmt=';
    // 请求漫道地址
    // 测试串: 'http://sdk.entinfo.cn:8061/mdsmssend.ashx?sn=SDK-BBX-010-38274&pwd=821B371DF4C7E744BAB9FE120E66DD2A&mobile=18698815868&content=【基数健康】登录/注册基数健康帐号验证码：521521，请勿转发，转发将导致帐号被盗。本验证码5分钟有效。注册后将绑定此安全手机&ext=&stime=&rrid=&msgfmt='
    return http.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            console.log(data);
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            console.log('sendShortMessage access', body); 3
            resp = getResMessage(mobile, body);
            console.log(resp);
            ShortMessageModel.mobile = mobile;
            ShortMessageModel.num = num;
            ShortMessageModel.time = new Date().getTime();
            saveShortMessage(ShortMessageModel);
        });
    })
}

/**
 * 获取六位随机数方法
 */
function getNumber() {
    return (Math.pow(10, 6) + Math.floor(Math.random() * 1000000) + '').substr(1)
}

/**
 * md5加密
 */
function getMd5(param) {
    var md5 = crypto.createHash('md5');
    return md5.update(param).digest('hex').toUpperCase();
}

/**
 * 根据请求不同生成不同的短信内容
 */
function getContent(num, isReset) {
    if (isReset) {
        return cfg.mandao.content.resetPassword.firstHalf + num + cfg.mandao.content.resetPassword.secondHalf;
    } else {
        return cfg.mandao.content.login.firstHalf + num + cfg.mandao.content.login.secondHalf;
    }
}

/**
 * 根据返回值获取对应的信息
 */
function getResMessage(mobile, param) {
    if (param > 0) {
        return { code: 1, msg: '发送短信成功', time: new Date() };
    } else {
        switch (param) {
            case -2:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '帐号/密码不正确');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -4:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '余额不足支持本次发送');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -5:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '数据格式错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -6:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '参数有误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -7:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '权限受限');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -8:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '流量控制错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -9:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '扩展码权限错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -10:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '内容长度长');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -11:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '内部数据库错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -12:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '序列号状态错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -14:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '服务器写文件失败');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -17:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '没有权限');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -19:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '禁止同时使用多个接口地址');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -20:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '相同手机号，相同内容重复提交');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -21:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + 'Ip鉴权失败');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -22:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + 'Ip鉴权失败');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -23:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '缓存无此序列号信息');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -601:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '序列号为空，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -602:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '序列号格式错误，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -603:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '密码为空，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -604:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '手机号码为空，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -605:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '内容为空，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -606:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + 'ext长度大于9，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -607:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '参数错误扩展码非数字');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -608:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '参数错误定时时间非日期格式');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -609:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + 'rrid长度大于18，参数错误');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -610:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '参数错误rrid非数字');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -611:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '参数错误内容编码不符合规范');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -623:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '手机个数与内容个数不匹配');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -624:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '扩展个数与手机个数不匹配');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -625:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '定时时间个数与手机个数不匹配');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            case -626:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + 'rrid个数与手机个数不匹配');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
            default:
                console.log('手机号为' + mobile + '发送失败,失败原因为:' + '其他为止原因导致');
                return { code: -1, msg: '发送短信失败,请稍后重试!' }
        }
    }
}