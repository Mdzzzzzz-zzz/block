import { Node } from "cc";
import { Singleton } from "../../Singleton";
import { emSharePath, emShareType, IShareInfo, ShareConfig } from "./SocialDef";
import { Vec2 } from "cc";
import * as env from "cc/env";
import { mk } from "../../MK";
import { SdkUtil } from "../SdkUtil";
import { sys } from "cc";
import { biEventId } from "../../Boot";

export class WechatMiniApi extends Singleton {
    public Init() { }
    public UnInit() { }

    private wx = null;

    // 分享成功失败判定相关
    private curShareParam: any = null;

    // 本机信息
    // private deviceInfo: any = null;

    public constructor() {
        super();
        if (!this.isWechatGame()) {
            return;
        }

        if (sys.platform == sys.Platform.WECHAT_GAME) {
            this.wx = window["wx"];
        }
        //@ts-ignore
        this.wx.onShareAppMessage(() => {
            mk.sdk.instance.reportBI(biEventId.share_click, {
                proj_share_type: emSharePath.default, //分享点击微信默认
            });
            let shareinfo: IShareInfo = ShareConfig[10009];
            return {
                title: shareinfo.tittle,
                imageUrl: shareinfo.imageUrl,
            };
        });
        //@ts-ignore
        this.wx.showShareMenu({
            withShareTicket: true,
        });
        //@ts-ignore
        this.wx.onShow((res: IOnShowInfo) => {
            //@ts-ignore
            let launchInfo = this.wx.getLaunchOptionsSync();
            if (launchInfo.shareTicket != undefined && launchInfo.shareTicket != "") {
                //@ts-ignore
                this.wx.getShareInfo({
                    shareTicket: launchInfo.shareTicket,
                    timeout: 5000,
                    success: (shareres) => {
                        // MSG.release<edShareWakeUp>(SocialEvt.ShareWakeUp, {
                        //   result: true,
                        //   share: launchInfo,
                        // });
                        // if(shareres.errMsg==undefined||shareres.errMsg=="")
                        // {
                        //     MSG.release<edShareWakeUp>(SocialEvt.ShareWakeUp,{result:true,share:res});
                        // }
                        // else
                        // {
                        //     console.error(shareres.errMsg);
                        //     MSG.release<edShareWakeUp>(SocialEvt.ShareWakeUp,{result:false,share:res});
                        // }
                    },
                    fail: () => {
                        // MSG.release<edShareWakeUp>(SocialEvt.ShareWakeUp, {
                        //   result: false,
                        //   share: launchInfo,
                        // });
                    },
                });
            }
            console.log("微信唤醒：", launchInfo);
            // this.deviceInfo = this.wx.getDeviceInfo();
            if (this.curShareParam) {
                let passTime = Date.now() - this.curShareParam.startTime;
                if (passTime > 1500) {
                    console.log("分享成功", launchInfo);
                    this.curShareParam.success && this.curShareParam.success.call(this.curShareParam.target, true);
                } else {
                    console.log("分享失败 1", launchInfo);
                    this.curShareParam.fail && this.curShareParam.fail.call(this.curShareParam.target, false);
                }
                this.curShareParam = null;
            }
            //上传分享数据
            let sceneId = launchInfo.scene;
            //分享卡片拉起的次数
            if (sceneId == 1007 || sceneId == 1008 || sceneId == 1036 || sceneId == 1044 || sceneId == 1096) {
                let shareQuery = launchInfo.query;
            }
        });
    }
    public getLaunchOptionsSync() {
        return this.wx.getLaunchOptionsSync();
    }

    // 短震动
    public shakeShort() {
        if (!this.isWechatGame()) return;

        this.wx.vibrateShort();
    }

    // 长震动
    public shakeLong() {
        if (!this.isWechatGame()) return;

        this.wx.vibrateLong();
    }

    // 是否是微信平台
    public isWechatGame() {
        // if (CC_WECHATGAME) {
        //   return true;
        // }
        if (env.PREVIEW || env.EDITOR) {
            return false;
        }
        return true;
    }

    public isSupportShare() {
        if (env.PREVIEW || env.EDITOR) {
            return true;
        }
        return true;
    }
    // 是否是ios平台
    public isIOS(): boolean {
        let sys = this.getSystemInfo();
        if (sys && sys.system) {
            let str: string = sys.system.toLowerCase();
            if (str.indexOf("ios") > -1) {
                return true;
            }
        }
        return false;
    }
    protected deviceId(): string {
        let deviceId = sys.localStorage.getItem("k_deviceId");
        if (!deviceId) {
            deviceId = SdkUtil.generateUUID();
            sys.localStorage.setItem("k_deviceId", deviceId);
        }
        return deviceId;
    }
    protected doShare(
        shareType: emShareType,
        sharePath: emSharePath,
        param: { key?: string; data?: any; content?: string }
    ) {
        let shareinfo: IShareInfo = ShareConfig[shareType];
        if (shareinfo == undefined) {
            console.error("未配置的分享id:" + shareType);
            return;
        }
        //点击游戏内分享打点
        mk.sdk.instance.reportBI(biEventId.share_click, {
            proj_share_type: sharePath,
        });
        let openId = this.deviceId();
        let shareUid = SdkUtil.generateUUID();
        let time = Date.now();
        let query = `shareId=${shareType}&openId=${openId}&time=${time}&sharePath=${sharePath}&shareUid=${shareUid}`;
        // let data = {
        //   title: shareinfo.tittle,
        //   imageUrl: shareinfo.imageUrl,
        //   query: query,
        //   imageUrlId: shareinfo.imageUrlId,
        //   shareType: shareType,
        // };
        // console.log("分享参数：", query);
        //记录分享
        // BiTrack.getInstance().trackEvent(BiEventKey.button_click_share, data);
        //@ts-ignore
        this.wx.shareAppMessage({
            title: param && param.content ? param.content : shareinfo.tittle,
            imageUrl: shareinfo.imageUrl,
            query: query,
            imageUrlId: shareinfo.imageUrlId,
            success: (res) => {
                if (this.curShareParam) {
                    let passTime = Date.now() - this.curShareParam.startTime;
                    if (passTime > 3000) {
                        //console.log("分享成功", res);
                        this.curShareParam.success && this.curShareParam.success.call(this.curShareParam.target, true);
                    } else {
                        //console.log("分享失败 1", res);
                        this.curShareParam.fail && this.curShareParam.fail.call(this.curShareParam.target, false);
                    }
                } else {
                    //console.log("分享失败 2", res);
                    this.curShareParam.fail && this.curShareParam.fail.call(this.curShareParam.target, false);
                }
            },
            fail: function fail(res) {
                console.log("分享失败", res);
            },
        });
    }
    public showShare(
        shareType: emShareType,
        sharePath: emSharePath,
        target: any,
        success: Function,
        param: { key?: string; data?: any; content?: string } = null,
        fail: Function = null
    ) {
        // if (CC_PREVIEW) {
        //   let shareinfo: IShareInfo = ShareConfig[shareType];
        //   if (shareinfo == undefined) {
        //     console.error("未配置的分享id:" + shareType);
        //     fail&&fail();
        //     return;
        //   }
        //   success && success();
        //   return;
        // }
        if (!this.isWechatGame()) {
            success && success();
            return;
        }
        if (!this.curShareParam) {
            this.curShareParam = {
                startTime: Date.now(),
                success: success,
                fail: fail,
                shareCount: 1,
                target: target,
            };
        }
        this.doShare(shareType, sharePath, param);
        //this.addShowShareType(shareType, emShareShowType.Share);
    }
    /**
     * 分享高光时刻 截图分享
     */
    public showShareHapppy(sharePath: emSharePath, x, y, width, height, destWidth?: number, destHeight?: number): void {
        let shareId = emShareType.s_66666;
        let openId = this.deviceId();
        let shareUid = SdkUtil.generateUUID();
        let time = Date.now();
        let query = `shareId=${emShareType.s_66666}&openId=${openId}&time=${time}&sharePath=${sharePath}&shareUid=${shareUid}`;
        //@ts-ignore
        let tempFilePath = canvas.toTempFilePathSync({
            x: x,
            y: y,
            width: width || 200,
            height: height || 150,
            destWidth: destWidth || 400,
            destHeight: destHeight || 300,
            fileType: "jpg",
            quality: 1,
        });
        let desc = ["宁神静气,就等你来", "称心如意,块从人愿", "轻轻一摆,烦恼全消"];
        let descIndex = SdkUtil.getRandomIntInclusive(0, desc.length - 1);
        descIndex = descIndex % desc.length;
        let tittle = desc[descIndex];
        // 绑定分享参数
        // this.wx.onShareTimeline(() => {
        //     return {
        //         title: tittle,
        //         imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/share_icon.png", // 图片 URL
        //         query: query,
        //     };
        // });
        this.wx.shareAppMessage({
            title: tittle,
            imageUrl: tempFilePath, //"https://waxiaoqn.nalrer.cn/waxiao/share/share_icon.png",
            query: query,
            success: (res) => { },
            fail: (res) => {
                console.log("分享失败", res);
            },
        });
    }

    // 获取缩放比
    // public getScreenScale() {
    //   let systemInfo = window["systemInfo"];
    //   let scale = systemInfo.screenHeight / 720;
    //   return scale;
    // }

    // 获得系统信息
    public getSystemInfo() {
        //pixelRatio
        if (window["systemInfo"] == undefined) {
            window["systemInfo"] = this.wx.getSystemInfoSync();
        }
        return window["systemInfo"];
    }

    // 添加游戏圈
    // public createWXGameClub() {
    //   if (!this.isWechatGame()) return;

    //   let info = this.getSysTemInfo();
    //   let scale = this.getScreenScale();
    //   let length = 60 * scale;
    //   this.wx.createGameClubButton({
    //     icon: "white",
    //     style: {
    //       left: info.screenWidth - length - 18 * scale,
    //       top: info.screenHeight / 2 - length / 2,
    //       width: length,
    //       height: length,
    //     },
    //   });
    // }

    public showLoading() {
        if (this.isWechatGame()) {
            //@ts-ignore
            this.wx.showLoading({
                tittle: "",
                mask: true,
                success: () => { },
                fail: () => { },
            });
        } else {
            //APP.connect.addLoadingLayer();
        }
    }
    public hideLoading() {
        if (this.isWechatGame()) {
            //@ts-ignore
            this.wx.hideLoading();
        } else {
            this.hideLoading();
        }
    }

    public isCanUseSdkVersion(version: string) {
        // let sys = this.getSystemInfo();
        // if (sys) {
        //   let ver = new CVersion(version);
        //   let sysVer = new CVersion(sys.SDKVersion);
        //   if (sysVer.isBig(ver) || sysVer.isEqual(ver)) {
        //     return true;
        //   }
        // }
        return true;
    }

    public checkAuthInfo(onCheckFinish: (isAuth: boolean) => {}, target: any) {
        try {
            this.wx.getSetting({
                success: (res) => {
                    // if (CC_DEBUG) {
                    //   console.info("授权信息:" + JSON.stringify(res));
                    // }
                    if (res.authSetting["scope.userInfo"] == false) {
                        onCheckFinish && onCheckFinish.call(target, false);
                    } else {
                        //@ts-ignore
                        this.wx.getUserInfo({
                            openIdList: ["selfOpenId"],
                            lang: "zh_CN",
                            withCredentials: true,
                            success: (res) => {
                                console.log("授权成功：", res);
                                // MSG.release<IAccountInfo>(SocialEvt.Auth, res.userInfo);
                            },
                            fail: (err) => {
                                console.log("授权失败：", err);
                                // MSG.release<IAccountInfo>(SocialEvt.Auth, null);
                            },
                        });
                        onCheckFinish && onCheckFinish.call(target, true);
                    }
                },
            });
        } catch (e) {
            onCheckFinish && onCheckFinish.call(target, false);
        }
    }

    public createAuthorizeBtnByNode(btnNode: Node, onSuccess: Function, onFail: Function, target: any) { }

    //创建一个透明按钮在cc.Button的node节点上
    public createAuthorizeBtn(
        worldPos: Vec2,
        w: number,
        h: number,
        onSuccess: Function,
        onFail: Function,
        target: any
    ): any { }

    public checkUpdate(onSuccess: Function, onFail: Function) {
        let updateManager = this.wx.getUpdateManager();

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log("wx.getUpdateManager:", res);
            if (!res.hasUpdate) {
                onSuccess && onSuccess();
            }
        });
        let self = this;
        updateManager.onUpdateReady(function () {
            self.wx.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启应用？",
                success(res) {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    } else if (res.cancel) {
                        onSuccess && onSuccess();
                    }
                },
            });
        });

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            onSuccess && onSuccess();
        });
    }
    /**
     *
     * @param appId 目标appid
     * @param onlineTime 在线时间
     * @param data 参数：channcelCode=qiuqiu&goto
     */
    public navigateToMiniProgram(
        appId: string,
        onlineTime: number,
        data: string,
        env: string,
        success: Function,
        fail: Function
    ) {
        this.wx.navigateToMiniProgram({
            appId: appId,
            //path: "pages/index/index?" + data,
            //extraData: { online: onlineTime, path: "navigate" },
            envVersion: env,
            success: (res) => {
                // 打开成功
                console.log("跳转成功：", res.errMsg);
                success && success(true);
            },
            fail: (err) => {
                fail && fail(err.errCode, err.errMsg);
            },
        });
    }
    public showToast(content: string) {
        if (this.wx) {
            this.wx.showToast({ title: content, icon: "none" });
        } else {
            console.log(content);
        }
    }

    public showDeviceInfo() {
        if (this.wx) {
            // console.log("[WechatMiniApi] show device info ")
            // this.deviceInfo = this.wx.getDeviceInfo();
            // console.log("[WechatMiniApi] finish get device info" + JSON.stringify(this.deviceInfo, null, 5))
            return 0;
        }
        return 0;
    }
}
