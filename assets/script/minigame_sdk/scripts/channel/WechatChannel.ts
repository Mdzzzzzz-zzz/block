import { WechatMiniApi } from "../../../sdk/wechat/WechatMiniApi";
import { StateInfo, SystemInfo, UserInfo } from "../SdkConfig";
import { SdkEventType } from "../SdkEventType";
import { SdkUtils } from "../SdkUtils";
import { clickStatEventType } from "../bi/GaClickStatEventDef";
import { EncodeDecode } from "../common/encode_decode";
import { ChannelBase } from "./ChannelBase";

export class WechatChannel extends ChannelBase {
    public isSupportShare() {
        return false;
    }
    public Init(): void {
        this.platform.onShow((result) => {
            this.logger.log("wx", "+++++++++++++++++onShow+++++++++++++++++");
            let scene = result.scene;
            let query = result.query;
            UserInfo.showScene = scene;
            UserInfo.showQuery = query;
            UserInfo.scene_id = scene;
            UserInfo.scene_param = query.from || "";
            UserInfo.invite_id = query.inviteCode || 0;
            StateInfo.isOnForeground = true;
            this.reportUserFrom(result);
            this.notifer.emit(SdkEventType.GAME_SHOW, result);
        });
        /**
         * 小程序进入后台
         */
        this.platform.onHide(() => {
            this.logger.log("wx", "+++++++++++++++++onHide++++++++++++++++");
            // this.bi.clickStat(clickStatEventType.clickStatEventTypeOnHideTimeStampSubmit, []);
            UserInfo.scene_id = 0;
            StateInfo.isOnForeground = false;
            this.notifer.emit(SdkEventType.GAME_HIDE);
        });

        this.platform.getNetworkType({
            success: (res) => {
                if (res.hasOwnProperty("isConnected")) {
                    StateInfo.networkConnected = res.isConnected;
                } else if (res.hasOwnProperty("errMsg")) {
                    StateInfo.networkConnected = res.errMsg == "getNetworkType:ok";
                } else {
                    StateInfo.networkConnected = res.networkType != "none";
                }
                StateInfo.networkType = res.networkType; //wifi,2g,3g,4g,none,unknown
                this.notifer.emit(SdkEventType.NET_STATE_CHANGE);
            },
        });
        this.platform.onNetworkStatusChange((res: dtNetworkStatusChange) => {
            this.logger.log("net", "+++++++++++++++++ net change or get net info ++++++++++++++++");
            if (res.hasOwnProperty("isConnected")) {
                StateInfo.networkConnected = res.isConnected;
            } else if (res.hasOwnProperty("errMsg")) {
                StateInfo.networkConnected = res.errMsg == "getNetworkType:ok";
            } else {
                StateInfo.networkConnected = res.networkType != "none";
            }
            StateInfo.networkType = res.networkType; //wifi,2g,3g,4g,none,unknown
        });

        this.platform.onError((res) => {
            var d = new Date();
            var errMsg =
                "userId:" + UserInfo.userId + "time:" + d.toDateString() + " " + d.toTimeString() + ";" + res.message;
            this.bi.uploadLogTimely("platform_onError:", errMsg);
        });
        this.platform.getSystemInfo({
            success: (result) => {
                UserInfo.platform = result.platform;
                UserInfo.brand = result.brand;
                UserInfo.snsAppVer = result.version;
                UserInfo.model = result.model;
                UserInfo.system = result.system;
                UserInfo.sdkVersion = result.SDKVersion;
                /*
                 设备性能等级（仅Android小游戏）。
                 取值为：-2 或 0（该设备无法运行小游戏），-1（性能未知），>=1（设备性能值，该值越高，设备性能越好，目前最高不到50）
                 */
                UserInfo.benchmarkLevel = result.benchmarkLevel;
                // this.setFrameRate();
                // success && success();
                // Notifier.trigger(FrameEventType.ON_SYSTEMINFO_UPDATE);
                //上报顺序为微信版本 基础库版本 平台 操作系统版本
                // this.bi.track(GAEvent.c_sys_info, {
                //     platform: GAPropValue.wx,
                //     platform_ver: result.version,
                //     platform_sdk_ver: result.SDKVersion,
                //     platform_os_type: result.platform,
                //     platform_os: result.system
                // });
            },
            fail: (res) => {},
        });
        //根据启动参数设置用户来源信息
        let launchData = this.platform.getLaunchOptionsSync();
        this.parseUserFromInfo(launchData);
        this.reportUserFrom(launchData);
        //获取app信息
        let appInfo = this.platform.getAccountInfoSync();
        if (appInfo) {
            let appParam = appInfo.miniProgram;
            if (appParam) {
                SystemInfo.gameAppId = appParam.appId;
                let envVersion = appParam.envVersion || "release";
                SystemInfo.gameEnvVersion = envVersion;
                if (envVersion == "release") {
                    //正式版才可以获取线上版本号 体验版和开发版本默认使用本地的version
                    SystemInfo.gameVersion = appParam.version;
                }
            }
        }
        WechatMiniApi.getInstance().Init();
        // this.getUserSettings();
    }
    protected parseUserFromInfo(result) {
        let scene = result.scene;
        let query = result.query;
        UserInfo.showScene = scene;
        UserInfo.showQuery = query;
        UserInfo.scene_id = scene;
        UserInfo.scene_param = query.from || "";
        UserInfo.invite_id = query.inviteCode || 0;
    }

    protected reportUserFrom(result) {
        var scene = result.scene;
        var query = result.query;
        var scenePath = "";
        var hasUUID = SdkUtils.checkLocalUUID();
        var oldUserFlag = hasUUID ? 1 : 0;
        if (query && query.gdt_vid && query.weixinadinfo) {
            //从广点通广告跳过来的，from的开头加入gdt标识区分
            let from = "gdt." + query.weixinadinfo;
            UserInfo.scene_param = from;
            this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [scene, from, oldUserFlag]);
        } else if (query && query.clue_token) {
            let from = EncodeDecode.base64Encode(JSON.stringify(query));
            this.logger.warn("clue_token 1:", query, from);
            UserInfo.scene_param = from;
            this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [scene, from, oldUserFlag]);
        } else if (query && query.ksChannel && query.ksChannel === "kuaishou") {
            let from = EncodeDecode.base64Encode(JSON.stringify(query));
            UserInfo.scene_param = from;
            this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [scene, from, oldUserFlag]);
        } else if (query && query.sourceCode) {
            if (scene === 1088) {
                //从小程序动态消息推送进入，该场景为"点击用户分享卡片进入游戏注册时，param01为场景值，param02和param03分别代表分享点id和分享图文id"
                this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [
                    scene,
                    query.inviteCode,
                    query.sourceCode,
                    query.imageType,
                    query.entryType,
                    oldUserFlag,
                ]);
            } else {
                //从小程序消息卡片中点入,该场景为"点击用户分享卡片进入游戏注册时，分享用户的user_id直接当做场景参数放在param02，param03和param04分别代表分享点id和分享图文id"
                this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [
                    scene,
                    query.inviteCode,
                    query.sourceCode,
                    query.imageType,
                    "CardActive",
                    oldUserFlag,
                    query.template_type,
                    query.fun_type,
                ]);
            }
        } else {
            if (SdkUtils.isSceneApplicationCode(scene)) {
                //从小程序码进入,相关见文档微信开发者文档
                if (query.hasOwnProperty("scene")) {
                    scenePath = query.scene;
                } else if (result.hasOwnProperty("path")) {
                    scenePath = result.path;
                }
                scenePath.replace(".html", ""); //生成时可能会在path后面添加.html
                scenePath = decodeURIComponent(scenePath);
                UserInfo.scene_param = scenePath;
                this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [scene, scenePath, oldUserFlag]);
            } else {
                var referrerInfo = result.referrerInfo;
                if (referrerInfo && referrerInfo.appId === "wxd0e404d795ea6f80") {
                    // 从欢乐斗地主进入
                    var from = "hlddz";
                    UserInfo.scene_param = from;
                    this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [scene, from, oldUserFlag]);
                } else {
                    //场景值和场景参数分别记录到可选参数param01和param02当中，如param01=1058，param02=tuyouqipai
                    //场景参数由项目组接入推广渠道时配置，如公众号dacihua、tuyouqipai，二维码填写企业或个人标识
                    this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [scene, query.from, oldUserFlag]);
                }
            }
        }
    }
    navigateToMiniProgram(
        appid: string,
        path: string,
        envVersion: string,
        bi_paramlist: any,
        extraData?: string
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            this.platform.navigateToMiniProgram({
                appId: appid,
                path: path ? path : "?from=elsfkpt",
                envVersion: "release",
                extraData: {
                    from: path ? path : "?from=elsfkpt",
                },
                success: (res) => {
                    resolve(res);
                },
                fail: (res) => {
                    reject();
                },
                complete: (res) => {},
            });
        });
    }
    sendMsg(msg: any): void {
        this.platform.postMessage(msg);
    }
    setCloudStorage(kvData: any): void {
        this.platform.setUserCloudStorage({
            KVDataList: kvData,
            success: (res) => {
                this.logger.log("--success to setCloudStorage:", res);
            },
            fail: (res) => {
                this.logger.log("--fail to setCloudStorage:", res);
            },
        });
    }
    getUserSettings() {
        this.platform.getSetting({
            success: (res) => {
                this.settings = {
                    userInfo: res.authSetting["scope.userInfo"],
                    userLocation: res.authSetting["scope.userLocation"],
                    WxFriendInteraction: res.authSetting["scope.WxFriendInteraction"],
                };
            },
            fail: (res) => {
                console.log(res + "查询是否授权失败");
            },
        });
    }
    aggreePrivacy(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if (!this.platform.requirePrivacyAuthorize) {
                    // console.log("该版本不支持隐私权限接口")
                    reject();
                    return;
                }
                this.platform.requirePrivacyAuthorize({
                    success: (res) => {
                        // console.log(res + "同意了隐私政策")
                        resolve(true);
                    },
                    fail: () => {
                        reject();
                    },
                    complete: () => {},
                });
            } catch (err) {
                reject();
            }
        });
    }
    reportABEvent(eventName: string, evtData: number) {
        super.reportABEvent(eventName, evtData);
        if (typeof this.platform.reportEvent == "function") {
            this.platform.reportEvent(eventName, { expt_data: evtData });
        } else {
            console.error("不支持上报 reportEvent");
        }
    }

    reportPlatformEvent(eventName: string, evtData: number) {
        console.log("WxreportPlatformEvent", eventName, evtData);
        let wx = window["wx"]
        if (wx) {
            wx.reportEvent(eventName, { expt_data: evtData });
        }
    }

    getABExpGroup(expParam: string): number {
        if (typeof this.platform.getExptInfoSync == "function") {
            let data = this.platform.getExptInfoSync(expParam);
            return data[expParam] || 0;
        } else {
            console.error("不支持获取分组 getExptInfoSync");
        }
        console.error("未找到实验组：", expParam);
        return 0;
    }
}
