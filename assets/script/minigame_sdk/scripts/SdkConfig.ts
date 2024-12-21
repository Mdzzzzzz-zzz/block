import { sys } from "cc"

// cloudID: 8

// gameId（projectId）：20197

// appid：20197

// clientId：H5_2.0_weixin.weixin.0-hall20197.weixin.elsfkptnew, 编码：38096

export var SystemInfo = {
    clientId: "H5_2.0_weixin.weixin.0-hall20197.weixin.elsfkptnew",
    intClientId: 38096,
    cloudId: 8,
    version: 1.12,
    webSocketUrl: "",
    loginUrl: "https://openelsfk.nalrer.cn/",
    shareManagerUrl: "https://market.tuyoo.com/",
    deviceId: "wechatGame",
    wxAppId: "wx45e02fc734c7b568",
    appId: 9999,
    gameId: 20197,
    hall_version: "hall37",
    cdnPath: "",
    remotePackPath: "",
    biLogServer: "https://cbi.tuyoo.com/api/bilog5/text",//"https://cbi.touch4.me/api/bilog5/text
    errorLogServer: "https://cbi.tuyoo.com/api/bilog5/text/error",//https://clienterr.touch4.me/api/bilog5/clientlog
    tywxVersion: "1.6.6_20230103_release",
    openFeatureFilter: !1,
    wxPayVersion: "2.0",
    gaServer: "https://cbi.tuyoo.com/api/bilog5/ga",
    projectId: 20197,
    gameEnvVersion: "release",
    gameVersion:"0.0.0",
    gameAppId:"",//获取线上的appId

    douyinAppId: "1716790859",
    douyinAppKey: "ofHCFJVjdl7Wr169G5uSOmXjKaMEIniT",
    douyinChannelId: 1018,
    douyinAdBanner: "p3qjb34kp18q42kff6",
    douyinAdVideo: "1feb87k366lg48c0up",
    douyinAdSplitScreen: "914052lgci4977dbbo",
}
export var SystemInfoEnv = {
    "online": {
        loginUrl: "https://xyxsf.nalrer.cn/",
    },
    "sim": {
        loginUrl: "http://ztfz.nalrer.cn/"
    },
    "test": {
        loginUrl: "http://ztfz.nalrer.cn/"
    }
}

export var StateInfo = {
    debugMode: !0,
    networkConnected: sys.getNetworkType()!=0,
    networkType: "none",
    isOnForeground: !0
}
export var UserInfo = {
    userId: 0,
    nickName: "TuWechatGame",
    avatarUrl: "",
    authorCode: "",
    systemType: 0,
    wechatType: "6.6.1",
    model: "未知设备",
    system: "iOS 10.0.1",
    loc: "",
    scene_id: 0,
    scene_param: "",
    invite_id: 0,
    wxgame_openid:"",
    wxgame_session_key:"",
    signature: "",
    encryptedData: "",
    iv: "",
    wxUserInfo: {},
    showScene: 0,
    showQuery: {},
    ip: "0",
    ipLocInfo: {},
    brand: "0",
    roleId: 0,
    serverId: 0,
    platform: "0",
    snsAppVer: "0",
    sdkVersion: "0",
    benchmarkLevel: 1,
    SNSEncryptedData: "",
    SNSIV: "",
    SNSLoginInfo: {},
    userInfoScopeState: false,
    snsId: "",
    token: "",
    wipw: 0, //微信iOS支付切换
    jwttoken: "",
    launch_scene_id: '',
    launch_scene_param: '',
    launch_invite_id: 0,
    role_user_type: ""  // 登录类型，channel 渠道 guest 游客
}
export var SdkStorageKeys = {
    SESSION_KEY: 'TU_SESSION_STORAGE',
    LOCAL_GAME_TIME_RECORD: 'LOCAL_GAME_TIME_RECORD',
    LOCAL_SHARE_TIMES_RECORD: 'LOCAL_SHARE_TIMES_RECORD'
}
//#region Ga 定义相关
//ga事件
//前端自己定义的事件，事件名前面带上c_前缀
//产品提需求的事件，事件名按需求来
export var GAEvent = {
    //前端自定义事件
    /**
     * 渠道登录
     */
    gsm_login_sns: "gsm_login_sns",
    /**
     * 平台sdk登录
     */
    gsm_login_sdk: "gsm_login_sdk",
    /**
     * 交叉推广
     */
    cross_ad_jump:"cross_ad_jump",
    /**
     * 平台登录的服务器事件前端不用上报
     */
    // sdk_s_login_succ: "sdk_s_login_succ",
    // sdk_s_create_succ: "sdk_s_create_succ"
}

//多处经常使用的事件属性值
export var GAPropValue = {
    start: "start",
    success: "success",
    failed: "failed",
    req: "req",
    resp: "resp",
    wx: "wx",
}

export interface IGaLoginSns {
    state: string;
    local_uuid: string;
}
export interface IGaLoginSdk {
    state: string;
    local_uuid: string;
    code: string;//wx.login 返回的code
}
//#endregion
//#region 广告配置相关
export var AdConfigInfo = {
    /**
     * 激励视频广告id
     */
    rewardUnitId: "adunit-635316d9cf458d26",
    rewardUnitIdiOS:"adunit-2bc26cc15f6b7c4f",
    /**
     * banner广告id
     */
    bannerUnitId: "adunit-97b6975b7ee1ebe4",

    /**
     * 插屏广告Id
     */
    insertUnitId: "adunit-e93757fedee115b8",
    /**
    * 原生模板格子广告
    */
    customGridUnitId: "adunit-2e9669086b290f21",

    douyinBannerUnitId: "p3qjb34kp18q42kff6",
    douyinRewardUnitId: "1feb87k366lg48c0up",
    douyinInsertUnitid: "914052lgci4977dbbo",
    /**
     * 不同渠道要求插屏启动后多少秒才能展示 微信测试是15秒
     */
    insertCanShowSinceStart: 5000,
    /**
     * 不同渠道要求每次插屏展示间隔最小时间 微信20秒以上能展示下一次
     */
    insertDelat: 5000,

}
//#endregion