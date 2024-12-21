import { sys } from "cc";
import { Singleton } from "../Singleton";
import { MKCrypto } from "../util/MKCrypto";
import { UserRemoteData } from "../data/UserRemoteData";
import { mk } from "../MK";
import { BIEventID } from "../define/BIDefine";
import { UserData } from "../data/UserData";

const CODE_OF_INIT_SUCCESS = 1000; // 初始化成功
const CODE_OF_INIT_FAILURE = 1001; // 初始化失败

const CODE_OF_LOGIN_SUCCESS = 2000; // 登录成功
const CODE_OF_LOGIN_FAILURE = 2001; // 登录失败

const CODE_OF_LOGOUT_SUCCESS = 3000; // 注销成功
const CODE_OF_LOGOUT_FAILURE = 3001; // 注销失败

const CODE_OF_CREATE_ORDER_SUCCESS = 4000; // 下单成功
const CODE_OF_CREATE_ORDER_FAILURE = 4001; // 下单失败
const CODE_OF_PAY_SUCCESS = 4003; // 支付成功
const CODE_OF_PAY_FAILURE = 4004; // 支付失败
const CODE_OF_PAY_CANCEL = 4005;
//https://jingyougame.feishu.cn/docx/WK5MdQPQJoJBNLxheU0cbibsn3b
export class JYSdkManager extends Singleton {
    sdk: any;
    version: string;
    enableDebug: boolean;
    initCallback: Function;

    //sdk内部退出登录可能需要重新登录
    // - SDK内部“退出登录”将会触发“注销”回调，请在接收到“注销成功”回调后进行退出当前游戏账号等逻辑操作，再重新调用“登录”接口完成切换账号操作。
    private isLoginedSdk: boolean = false;

    public Init() {
        console.log("init Jysdk");
        if (!window["JYSDK"]) return this;
        this.sdk = window["JYSDK"];
        console.log("sys.platform " + sys.platform);
        switch (sys.platform) {
            case sys.Platform.WECHAT_GAME:
            case sys.Platform.BYTEDANCE_MINI_GAME: {
                console.log("set global listener");
                let code = this.sdk.setGlobalListener(this.JYSdkListener.bind(this));
                console.log("set global listenr code " + code);
                break;
            }
        }
        // if (sys.platform == sys.Platform.WECHAT_GAME && window["JYSDK"]) {
        //     this.sdk = window["JYSDK"];
        //     console.log("set global listener");
        //     let code = this.sdk.setGlobalListener(this.JYSdkListener.bind(this));
        //     console.log("set global listenr code " + code.toString());
        //     // JYSDK.init(config: {app_id: string, app_key: string, channel_id: string, version: string, debug: boolean}): void;
        // }
        return this;
    }
    public getSdk() {
        return this.sdk;
    }
    public UnInit() {
        this.initCallback = null;
    }
    public isAvailable(): boolean {
        if (sys.platform == sys.Platform.WECHAT_GAME && window["JYSDK"]) {
            return true;
        }

        if (sys.platform == sys.Platform.BYTEDANCE_MINI_GAME && window["JYSDK"]) {
            return true;
        }

        return false;
    }
    public isInited() {
        if (this.isAvailable()) {
            return this.sdk.isInited();
        }
        return false;
    }
    public initSdk(version: string, debug: boolean) {
        if (this.isAvailable()) {
            this.version = version;
            this.enableDebug = debug;

            switch (sys.platform) {
                case sys.Platform.WECHAT_GAME:
                    this.sdk.init(this.getWxSdkConfig());
                    break;

                case sys.Platform.BYTEDANCE_MINI_GAME:
                    this.sdk.init(this.getDouyinSdkConfig());
                    console.log("init Douyin");
                    break;
            }
            // this.sdk.init(this.getWxSdkConfig());
        } else {
            if (this.initCallback) {
                console.log("init callback");
                this.initCallback(true, this.retryInitTimes);
            }
        }
    }

    private retryInitTimes: number = 0;
    public setInitCallback(callback: Function) {
        this.initCallback = callback;
        this.retryInitTimes = 0;
        return this;
    }

    public getWxSdkConfig(): any {
        return {
            app_id: 1716790859,
            app_key: "ofHCFJVjdl7Wr169G5uSOmXjKaMEIniT",
            channel_id: 1003,
            version: this.version,
            debug: this.enableDebug,
        };
    }

    public getDouyinSdkConfig(): any {
        return {
            app_id: 1716790859,
            app_key: "ofHCFJVjdl7Wr169G5uSOmXjKaMEIniT",
            channel_id: 1018,
            version: this.version,
            debug: this.enableDebug,
        };
    }

    private JYSdkListener(code: number, data: object, err: object): void {
        switch (code) {
            case CODE_OF_INIT_SUCCESS: // 初始化成功
                {
                    console.log("***初始化成功***");
                    if (this.initCallback) {
                        this.initCallback(true, this.retryInitTimes);
                    }
                }
                break;
            case CODE_OF_INIT_FAILURE: // 初始化失败
                {
                    console.error("***初始化失败***", JSON.stringify(err));
                    this.retryInitTimes += 1;
                    if (this.initCallback) {
                        this.initCallback(false, this.retryInitTimes);
                    }
                    let retryTime = 2000 * this.retryInitTimes;
                    if (retryTime > 20000) {
                        retryTime = 20000;
                    }
                    let _self = this;
                    setTimeout(() => {
                        switch (sys.platform) {
                            case sys.Platform.WECHAT_GAME:
                                _self.sdk.init(_self.getWxSdkConfig());
                                break;
                            case sys.Platform.BYTEDANCE_MINI_GAME:
                                _self.sdk.init(_self.getDouyinSdkConfig());
                                break;
                        }
                        // _self.sdk.init(_self.getWxSdkConfig());
                    }, retryTime);
                }
                break;
            case CODE_OF_LOGIN_SUCCESS: // 登录成功
                {
                    let str = JSON.stringify(data);
                    console.log("***登录成功***", str);
                    this.isLoginedSdk = true;
                    console.log("***登录成功***", data["open_id"]);
                    console.log("***登录成功***", data["pf_openid"]);
                    UserData.inst.setOpenID(data["open_id"])
                    this.InitJYGameSDK(data["open_id"], data["pf_openid"]);
                    mk.sdk.instance.reportAf(BIEventID.jingyou_sdk_login, {}, true);
                    // SdkManager.getInstance().track("jingyou_sdk_login", { state: 1, data: str });
                }
                break;
            case CODE_OF_LOGIN_FAILURE: // 登录失败
                {
                    let error = JSON.stringify(err);
                    console.error("***登录失败***", error);
                    this.isLoginedSdk = false;
                    // SdkManager.getInstance().track("jingyou_sdk_login", { state: 2, data: err });
                }
                break;
            case CODE_OF_LOGOUT_SUCCESS: // 注销成功
                {
                    console.log("***注销成功***");
                    this.isLoginedSdk = false;
                }
                break;
            case CODE_OF_LOGOUT_FAILURE: // 注销失败
                {
                    console.error("***注销失败***", JSON.stringify(err));
                }
                break;
            case CODE_OF_CREATE_ORDER_SUCCESS: // 下单成功
                {
                    console.log("***下单成功***", data, err);
                    if (data["pay_code_url"]) {
                        console.log("显示支付二维码");
                    }
                }
                break;
            case CODE_OF_CREATE_ORDER_FAILURE: // 下单失败
                {
                    console.error("***下单失败***", JSON.stringify(err));
                }
                break;
            case CODE_OF_PAY_SUCCESS: // 支付成功
                {
                    console.log("***支付成功***");
                }
                break;
            case CODE_OF_PAY_FAILURE: // 支付失败
                {
                    console.error("***支付失败***", JSON.stringify(err));
                }
                break;
            case CODE_OF_PAY_CANCEL: // 支付取消
                {
                    console.warn("***支付取消***");
                }
                break;
        }
    }

    login() {
        if (this.isAvailable() && this.isInited()) {
            console.log("try login");
            this.sdk.login();
            // SdkManager.getInstance().track("jingyou_sdk_login", { state: 0, data: "" });
        }
    }

    isLogined() {
        if (this.isAvailable() && this.isInited()) {
            return this.sdk.isLogined() && this.isLoginedSdk;
        }
        return false;
    }

    // JYSDK.getUserInfo().then(res => {
    //     // 获取用户信息成功
    //     const avatar = res['avatar']        // 用户头像
    //     const nickname = res['nickname']    // 用户昵称
    // }).catch(err => {
    //     // 获取用心信息失败
    // })

    getUserInfo(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.isAvailable() && this.isInited() && this.isLogined()) {
                this.sdk
                    .getUserInfo()
                    .then((res) => {
                        // 获取用户信息成功
                        let avatar = res["avatar"]; // 用户头像
                        let nickname = res["nickname"]; // 用户昵称
                        let open_id = res["open_id"]; //京游平台的openID
                        let pf_openid = res["pf_openid"]; //
                        console.log("用户信息：", avatar, nickname, open_id, pf_openid);
                        resolve(res);
                    })
                    .catch((err) => {
                        console.error(err);
                        reject(null);
                    });
            }
            reject(null);
        });
    }
    logout() {
        if (this.isAvailable() && this.isInited() && this.isLogined()) {
            this.sdk.logout();
        }
    }
    sendLoadingStartLog() {
        if (this.isAvailable() && this.isInited()) {
            this.sdk.sendLoadingStartLog();
        }
    }
    sendLoadingEndLog() {
        if (this.isAvailable() && this.isInited()) {
            this.sdk.sendLoadingEndLog();
        }
    }

    private InitJYGameSDK(openId, pfOpenid) {
        if (sys.Platform.WECHAT_GAME) {
            // @ts-ignore
            JYGameSDK.init({
                app_id: String(this.getWxSdkConfig().app_id),
                app_key: this.getWxSdkConfig().app_key,
                channel_id: String(this.getWxSdkConfig().channel_id),
                version: this.getWxSdkConfig().version,
                debug: this.getWxSdkConfig().debug,
            })
                .then((res) => {
                    console.log("***初始化成功***", res);
                    // 登录
                    // @ts-ignore
                    JYGameSDK.login({ open_id: openId, pf_openid: pfOpenid })
                        .then((res) => {
                            let obj = JSON.parse(JSON.stringify(res));
                            //console.log("JYGameSDK.login:", obj);
                            let saveData = JSON.parse(obj["user_ext"].data);
                            let encryData = saveData.user_blk_data;
                            //console.log("JYGameSDK.login: encryData", encryData);
                            let decryData = MKCrypto.getInstance().aesDecrypt(encryData);
                            UserRemoteData.inst.setUserRemoteDataToLocal(decryData);
                        })
                        .catch((err) => {
                            console.error("***登录失败***", JSON.stringify(err));
                        });
                })
                .catch((err) => {
                    console.error("***初始化失败***", err);
                });
        } else {
            // @ts-ignore
            JYGameSDK.init({
                app_id: this.getDouyinSdkConfig().app_id,
                app_key: this.getDouyinSdkConfig().app_key,
                channel_id: this.getDouyinSdkConfig().channel_id,
                version: this.getDouyinSdkConfig().version,
                debug: this.getDouyinSdkConfig().debug,
            })
                .then((res) => {
                    console.log("***初始化成功***", res);
                    // 登录
                    // @ts-ignore
                    JYGameSDK.login({ open_id: openId, pf_openid: pfOpenid })
                        .then((res) => {
                            console.log("***登录成功***", JSON.stringify(res));
                        })
                        .catch((err) => {
                            console.error("***登录失败***", JSON.stringify(err));
                        });
                })
                .catch((err) => {
                    console.error("***初始化失败***", err);
                });
        }
    }

    public UpdateDataJYGameSDK(data) {
        // console.log("*** UpdateDataJYGameSDK", data);
        if (sys.Platform.WECHAT_GAME) {
            data = MKCrypto.getInstance().aesEncrypt(JSON.stringify(data));
            // console.log("*** UpdateDataJYGameSDK Encrypt", data);
            let saveData = { user_blk_data: data, version: 1000 };
            // @ts-ignore
            JYGameSDK.updateGameData(JSON.stringify(saveData))
                .then((res) => {
                    console.log("***玩家数据更新成功updaet***", JSON.stringify(res));
                })
                .catch((err) => {
                    console.error("***玩家数据更新失败***", JSON.stringify(err));
                });
        }
    }

    public ClearDataJYGameSDK() {
        if (sys.Platform.WECHAT_GAME) {
            // @ts-ignore
            JYGameSDK.updateGameData(JSON.stringify({}))
                .then((res) => {
                    console.log("***玩家数据更新成功clear***", JSON.stringify(res));
                })
                .catch((err) => {
                    console.error("***玩家数据更新失败***", JSON.stringify(err));
                });
        }
    }

    
}
