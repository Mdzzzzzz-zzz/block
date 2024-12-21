import { GAEvent, GAPropValue, SdkStorageKeys, SystemInfo, UserInfo } from "../SdkConfig";
import { emSdkErrorCode } from "../SdkError";
import { SdkEventType } from "../SdkEventType";
import { SdkUtils } from "../SdkUtils";
import { clickStatEventType } from "../bi/GaClickStatEventDef";
import {AcccountBase,IUserInfo,dtSdkLogin,dtSdkLoginResult,dtUserInfoButton,emUserInfoState} from "./AccountBase";

export class WechatAccount extends AcccountBase {
    //#region 用户登录
    login(): Promise<dtSdkLoginResult> {
        return new Promise((resolve, reject) => {
            this.bi.clickStat(clickStatEventType.clickStatEventTypeWxLoginStart, []);
            this.bi.track(GAEvent.gsm_login_sns, { login_state: GAPropValue.start, login_code: "" });
            this.platform.login({
                success: (res) => {
                    this.logger.log(this.tag, "wx login success, params:", res);
                    this.bi.track(GAEvent.gsm_login_sns, { login_state: GAPropValue.success, login_code: res.code });
                    this.onLoginSnsPlatorm();
                    this.loginUserCenterWithCode(res.code, UserInfo).then(resolve).catch(reject);
                    this.bi.clickStat(clickStatEventType.clickStatEventTypeWxLoginSuccess, [res.code]);
                    this.notifer.emit(SdkEventType.WEIXIN_LOGIN_SUCCESS);
                },
                fail: (res) => {
                    this.bi.clickStat(clickStatEventType.clickStatEventTypeWxLoginFailed, []);
                    this.bi.track(GAEvent.gsm_login_sns, { login_state: GAPropValue.failed, login_code: "" });
                    this.logger.log(this.tag, "wx login fail, params:", res);
                    this.notifer.emit(SdkEventType.WEIXIN_LOGIN_FAIL);
                    reject({ errMsg: emSdkErrorCode.Req_LoginFail, errData: res });
                },
            });
        });
    }
    protected onLoginSnsPlatorm(): void {
        //登录后分享设置
        this.platform.showShareMenu({
            withShareTicket: true,
        });
    }
    loginUserCenterWithCode(code, userInfo): Promise<dtSdkLoginResult> {
        return new Promise((resolve, reject) => {
            let sdkPath = SystemInfo.loginUrl;
            let local_uuid = SdkUtils.getLocalUUID();
            this.logger.log("local_uuid:", local_uuid);
            let dataObj = this.getLoginDataObject(local_uuid, code, userInfo);
            this.bi.track(GAEvent.gsm_login_sdk, {
                login_state: GAPropValue.start,
                login_code: code,
                login_local_uuid: local_uuid,
            });
            this.bi.clickStat(clickStatEventType.clickStatEventTypeLoginSDKStart, [
                code,
                local_uuid,
                userInfo.nickName,
            ]);
            this.logger.log(this.tag, "login request start , params:", dataObj);
            this.platform.request({
                url: sdkPath + "open/v6/user/LoginBySnsIdNoVerify",
                header: {
                    "content-type": "application/x-www-form-urlencoded",
                },
                data: dataObj,
                method: "POST",
                success: (params) => {
                    this.logger.log(this.tag, "login request success , params:", params, sdkPath);
                    var checkData: dtSdkLogin = params.data;
                    if (
                        (checkData.error && checkData.error.code == 1) ||
                        !(checkData.result && checkData.result.userId)
                    ) {
                        this.logger.log("LOGIN_FAIL", params);
                        // reject(checkData);
                        reject({ errMsg: emSdkErrorCode.Req_pf_LoginBySnsIdNoVerifyError, errData: checkData });
                        return;
                    }
                    // 保存用户名/用户ID/用户头像
                    var result = checkData.result;
                    UserInfo.userId = result.userId;
                    UserInfo.nickName = result.userName;
                    UserInfo.avatarUrl = result.purl;
                    UserInfo.authorCode = result.authorCode;
                    UserInfo.wxgame_openid = result.wxgame_openid;
                    UserInfo.wxgame_session_key = result.wxgame_session_key;
                    UserInfo.snsId = result.snsId;
                    UserInfo.token = result.token;
                    UserInfo.jwttoken = result.jwttoken;
                    UserInfo.launch_scene_id = "";
                    UserInfo.launch_scene_param = "";
                    UserInfo.role_user_type = result.role_user_type || "";
                    this.logger.log(
                        this.tag,
                        "userId:" +
                            UserInfo.userId +
                            " userName:" +
                            UserInfo.nickName +
                            " userPic:" +
                            UserInfo.avatarUrl
                    );
                    // if (UserInfo.userId && UserInfo.userName) {
                    //     NotificationCenter.trigger(tt.events.LOGIN_SUCCESS);
                    //     LOGD("", JSON.stringify(params));
                    // } else {
                    //     LOGE("", JSON.stringify(params));
                    // }
                    let token = result.token;
                    this.logger.log(this.tag, "token:" + token);
                    this.platform.setStorage({
                        key: SdkStorageKeys.SESSION_KEY,
                        data: token,
                    });

                    // if (result.isCreate) {
                    //     this.bi.track(GAEvent.sdk_s_create_succ, {});
                    // }
                    // this.bi.track(GAEvent.sdk_s_login_succ, {});

                    let showScene = UserInfo.showScene;
                    let showQuery = UserInfo.showQuery;
                    this.bi.track(GAEvent.gsm_login_sdk, {
                        login_state: GAPropValue.success,
                        login_code: code,
                        login_local_uuid: local_uuid,
                        login_openId: result.wxgame_openid,
                    });

                    this.bi.clickStat(clickStatEventType.clickStatEventTypeLoginSDKSuccess, [
                        code,
                        local_uuid,
                        userInfo.nickName,
                        result.userId,
                    ]);
                    //@ts-ignore
                    if (showScene && showQuery && showQuery.sourceCode) {
                        //@ts-ignore
                        this.bi.clickStat(clickStatEventType.clickStatEventTypeUserFrom, [
                            showScene,
                            showQuery.inviteCode,
                            showQuery.sourceCode,
                            showQuery.imageType,
                            "GameStart",
                        ]);
                    }
                    // TuyooSDK.initWebSocketUrl(result);
                    // PropagateInterface.processRawShareConfigInfo();    //处理分享数据
                    // AdManager.processRawConfigInfo();          //处理交叉导流数据
                    // 发送登录成功事件
                    this.notifer.emit(SdkEventType.SDK_LOGIN_SUCCESS);
                    resolve(checkData.result);
                },
                fail: (params) => {
                    this.bi.track(GAEvent.gsm_login_sdk, {
                        login_state: GAPropValue.failed,
                        login_code: code,
                        login_local_uuid: local_uuid,
                    });
                    this.bi.clickStat(clickStatEventType.clickStatEventTypeLoginSDKFailed, [
                        code,
                        local_uuid,
                        userInfo.nickName,
                    ]);
                    this.logger.error(null, "login fail, params:", params);
                    this.logger.error("SDK_LOGIN_FAIL", params);
                    this.notifer.emit(SdkEventType.SDK_LOGIN_FAIL);
                    reject({ errMsg: emSdkErrorCode.Req_pf_LoginBySnsIdNoVerifyFail, errData: params.data });
                },
            });
        });
    }
    checkSession(): Promise<boolean> {
        return new Promise((reslove, reject) => {
            this.platform.checkSession({
                //session_key 未过期，并且在本生命周期一直有效
                success: reslove,
                // session_key 已经失效，需要重新执行登录流程
                fail: reject,
            });
        });
    }
    protected getLoginDataObject(uuid, code, userInfo): any {
        //咱们后端 0 是男 1 是女,要转换
        let gender = userInfo.gender || 0;

        // let sdkPath = SystemInfo.loginUrl;
        let dataObj: any = {
            appId: SystemInfo.appId,
            wxAppId: SystemInfo.wxAppId,
            clientId: SystemInfo.clientId,
            snsId: "wxapp:" + code,
            uuid: uuid,
            //以下为上传玩家的微信用户信息
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: gender,
            scene_id: UserInfo.scene_id || "",
            scene_param: UserInfo.scene_param || "",
            invite_id: UserInfo.invite_id || 0,
            encryptedData: UserInfo.SNSEncryptedData,
            iv: UserInfo.iv,
        };
        if (userInfo) {
            if (userInfo.nickName) {
                dataObj.nickName = userInfo.nickName;
            }
            //QQ: 性别 0：未知、1：男、2：女
            if (userInfo.gender >= 0) {
                dataObj.gender = userInfo.gender || 1;
            }
            if (userInfo.avatarUrl) {
                dataObj.avatarUrl = userInfo.avatarUrl;
            }
        }
        return dataObj;
    }
    //#endregion

    //#region 用户信息授权
    /**
     * 检查用户信息授权状态
     * @returns 用户授权状态
     */
    public checkUserInfoScopeState(): Promise<emUserInfoState> {
        return new Promise((resole, reject) => {
            var scope = "scope.userInfo";
            this.platform.getSetting({
                success: (res) => {
                    var authSetting = res.authSetting;
                    if (authSetting[scope] == true) {
                        // 用户已授权，可以直接调用相关 API
                        UserInfo.userInfoScopeState = true;
                        resole(emUserInfoState.Auth);
                    } else if (authSetting[scope] == false) {
                        // 用户已拒绝授权，再调用相关 API 或者 wx.authorize 会失败，需要引导用户到设置页面打开授权开关
                        UserInfo.userInfoScopeState = false;
                        UserInfo.SNSLoginInfo = {};
                        UserInfo.SNSEncryptedData = "";
                        UserInfo.SNSIV = "";
                        resole(emUserInfoState.Refuse);
                    } else {
                        // 未询问过用户授权，调用相关 API 或者 wx.authorize 会弹窗询问用户
                        UserInfo.userInfoScopeState = false;
                        resole(emUserInfoState.UnSet);
                    }
                },
                fail: (err) => {
                    // 用户已拒绝授权
                    UserInfo.userInfoScopeState = false;
                    UserInfo.SNSLoginInfo = {};
                    UserInfo.SNSEncryptedData = "";
                    UserInfo.SNSIV = "";
                    reject({ errMsg: emSdkErrorCode.Req_GetSettingFail, errData: err });
                },
            });
        });
    }
    //创建用户授权按钮

    /**
     * 先检查checkUserInfoScopeState 用户授权状态才可以调用这个方法
     * @returns
     */
    public getUserInfo(withCredentials: boolean): Promise<IUserInfo> {
        return new Promise((resolve, reject) => {
            if (withCredentials) {
                this.checkUserInfoScopeState()
                    .then((state) => {
                        if (state == emUserInfoState.Auth) {
                            this.platform.getUserInfo({
                                withCredentials: true,
                                success: (res) => {
                                    //解析用户信息
                                    this.logger.log("getUserInfo success", res);
                                    if (res.encryptedData && res.iv) {
                                        UserInfo.SNSEncryptedData = res.encryptedData;
                                        UserInfo.SNSIV = res.iv;
                                        let userInfo = res.userInfo;
                                        UserInfo.nickName = userInfo.nickName;
                                        UserInfo.avatarUrl = userInfo.avatarUrl;
                                        var dataObj = {
                                            userId: UserInfo.userId,
                                            wxAppId: SystemInfo.appId,
                                            encryptedData: res.encryptedData,
                                            iv: res.iv,
                                            setattr: true,
                                        };
                                        this.platform.request({
                                            url: SystemInfo.loginUrl + "open/v6/user/setWxEncryptedData",
                                            header: {
                                                "content-type": "application/x-www-form-urlencoded",
                                            },
                                            data: dataObj,
                                            method: "POST",

                                            success: (params) => {
                                                let data = params.data;
                                                let result = data.result;
                                                let error = data.error;

                                                if (error || !result) {
                                                    this.logger.error("upLoad error", error ? error.info : "no result");
                                                    reject({
                                                        errMsg: emSdkErrorCode.Req_pf_SetWxEncryptedDataError,
                                                        errData: error ? error.info : "no result",
                                                    });
                                                } else if (0 === result.code) {
                                                    let info = res.userInfo;
                                                    UserInfo.nickName = info.nickName;
                                                    UserInfo.avatarUrl = info.avatarUrl;
                                                    this.logger.log("uploadUserInfo success ", result.info);
                                                    this.notifer.emit(SdkEventType.SET_WX_SENSITIVE_DATA_SUCCESS);
                                                    resolve(info);
                                                    return;
                                                } else if (1 === result.code) {
                                                    this.logger.error("uploadUserInfo error ", result.info);
                                                    this.notifer.emit(SdkEventType.SET_WX_SENSITIVE_DATA_FAIL);
                                                    reject({
                                                        errMsg: emSdkErrorCode.Req_pf_SetWxEncryptedDataError,
                                                        errData: result,
                                                    });
                                                } else {
                                                    this.logger.error("uploadUserInfo2 error ", result.info);
                                                    this.notifer.emit(SdkEventType.SET_WX_SENSITIVE_DATA_FAIL);
                                                    reject({
                                                        errMsg: emSdkErrorCode.Req_pf_SetWxEncryptedDataError,
                                                        errData: result,
                                                    });
                                                }
                                            },
                                            fail: (params) => {
                                                this.logger.error(
                                                    "uploadUserInfo",
                                                    " fail, params:" + JSON.stringify(params)
                                                );
                                                reject({
                                                    errMsg: emSdkErrorCode.Req_pf_SetWxEncryptedDataFail,
                                                    errData: params,
                                                });
                                            },
                                        });
                                    } else {
                                        reject({ errMsg: emSdkErrorCode.No_EncryptedData_IV });
                                    }
                                },
                                fail: (err) => {
                                    reject({ errMsg: emSdkErrorCode.Req_GetUserInfo_Fail, errData: err });
                                },
                            });
                        } else {
                            reject({ errMsg: emSdkErrorCode.Not_Auth });
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                this.platform.getUserInfo({
                    withCredentials: false,
                    success: (res) => {
                        let userInfo = res.userInfo;
                        UserInfo.nickName = userInfo.nickName;
                        UserInfo.avatarUrl = userInfo.avatarUrl;
                        resolve(userInfo);
                    },
                    fail: (err) => {
                        reject({ errMsg: emSdkErrorCode.Req_GetUserInfo_Fail, errData: err });
                    },
                });
            }
        });
    }
    public createUserInfoButton(dt: dtUserInfoButton) {
        if (this.userInfoButton) {
            this.userInfoButton.destroy();
        }
        let button = this.platform.createUserInfoButton({
            type: "text",
            text: dt.btnText || "获取用户信息",
            style: {
                left: dt.left,
                top: dt.top,
                width: dt.width,
                height: dt.height,
                // lineHeight: dt.lineHeight || 40,
                backgroundColor: dt.backgroundColor || "#ff0000",
                color: dt.color, // || '#ffffff',
                fontSize: dt.fontSize || 16,
            },
        });
        this.userInfoButton = button;
        if (button) {
            button.onTap((res) => {
                if (this.userInfoButton) {
                    this.userInfoButton.destroy();
                }
                if (!res.userInfo) {
                    //授权失败打点
                    this.notifer.emit(SdkEventType.START_AUTHORIZATION_FAILED, res);
                    this.bi.clickStat(clickStatEventType.clickStatEventTypeAuthorizationFailed, []);
                    return;
                }
                UserInfo.userInfoScopeState = true;
                let info = res.userInfo;
                UserInfo.nickName = info.nickName;
                UserInfo.avatarUrl = info.avatarUrl;
                if (res.encryptedData && res.iv) {
                    UserInfo.SNSEncryptedData = res.encryptedData;
                    UserInfo.SNSIV = res.iv;
                }
                this.notifer.emit(SdkEventType.START_AUTHORIZATION_SUCCESS, res);
                this.bi.clickStat(clickStatEventType.clickStatEventTypeAuthorizationSuccess, []);
            });
        }
        return button;
    }

    public ReqIpLocInfo(retryCount: number = 1): Promise<any> {
        return new Promise((resolve, reject) => {
            var _url = "https://iploc.ywdier.com/api/iploc5/search/city";
            this.platform.request({
                url: _url,
                success: (res) => {
                    if (res.statusCode == 200) {
                        let data = res.data;
                        if (data && data.loc && data.ip) {
                            UserInfo.ip = data.ip;
                            UserInfo.ipLocInfo = data;
                            this.logger.log("ReqIpLocInfo success:" + retryCount, res);
                            resolve(res.data);
                        }
                    } else {
                        if (retryCount > 0) {
                            this.logger.log("ReqIpLocInfo retry:" + retryCount, res);
                            retryCount -= 1;
                            this.ReqIpLocInfo(retryCount).then(resolve).catch(reject);
                        } else {
                            this.logger.log("ReqIpLocInfo Error", res);
                            reject({ errMsg: emSdkErrorCode.Req_pf_PLocInfoError, errData: res });
                        }
                    }
                },
                fail: (res) => {
                    if (retryCount > 0) {
                        retryCount -= 1;
                        this.ReqIpLocInfo(retryCount).then(resolve).catch(reject);
                    } else {
                        this.logger.log("ReqIpLocInfo", res);
                        reject({ errMsg: emSdkErrorCode.Req_pf_PLocInfoFail, errData: res });
                    }
                },
            });
        });
    }
}
//#endregion
