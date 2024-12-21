export var clickStatEventType = {
    /**
     * SystemInfo.errorLogServer = "https://clienterr.touch4.me/api/bilog5/clientlog"
     * SystemInfo.biLogServer = "https://cbi.touch4.me/api/bilog5/text"
     * 使用方法:
     * 将bilog.js加入工程后,在需要打点的地方调用BiLog.clickStat(事件id,[参数列表]);
     * 以下是由BI组规定的必须进行上报的打点,请各个项目组不要修改
     */
    clickStatEventTypeUserFrom: 99990001,
    clickStatEventTypeUserShare: 99990002,
    clickStatEventTypeClickFirstAd: 99990003,
    clickStatEventTypeClickShowQRCode: 99990004,
    clickStatEventTypeClickDirectToMiniGameSuccess: 99990005,
    clickStatEventTypeClickDirectToMiniGameFail: 99990006,
    clickStatEventTypeClickAdBtn: 99990007,
    clickStatEventTypeClickWXPayStart: 99990008,
    clickStatEventCreatPayOrderSuccess: 99990009,
    clickStatEventCreatPayOrderFail: 99990010,
    clickStatEventTypeWXPaySuccess: 99990011,
    clickStatEventTypeWXPayFail: 99990012,
    clickStatEventTypeOnShowTYWXVersionSubmit: 99990013,
    clickStatEventTypeSubmitVersionInfo: 9999,
    clickStatEventTypeWxLoginStart: 10001,
    clickStatEventTypeWxLoginSuccess: 10002,
    clickStatEventTypeWxLoginFailed: 10003,
    clickStatEventTypeAuthorizationStart: 10004,
    clickStatEventTypeAuthorizationSuccess: 10005,
    clickStatEventTypeAuthorizationFailed: 10006,
    clickStatEventTypeLoginSDKStart: 10007,
    clickStatEventTypeLoginSDKSuccess: 10008,
    clickStatEventTypeLoginSDKFailed: 10009,
    clickStatEventTypeTCPStart: 10010,
    clickStatEventTypeTCPSuccess: 10011,
    clickStatEventTypeTCPFailed: 10012,
    clickStatEventTypeSmsSendSuccess: 10013,
    clickStatEventTypeSmsSendFailed: 10014,
    clickStatEventTypeSmsBindSuccess: 10015,
    clickStatEventTypeSmsBindFailed: 10016




    /**
     * 请在下方添加游戏相关的具体打点,另起声明放在业务层也可以
     */

};