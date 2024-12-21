import { JsbNativeCall } from "../../../sdk/JsbNativeCall";
import { GAEvent, GAPropValue, UserInfo } from "../SdkConfig";
import { emSdkErrorCode } from "../SdkError";
import { SdkEventType } from "../SdkEventType";
import { clickStatEventType } from "../bi/GaClickStatEventDef";
import { AcccountBase, dtSdkLoginResult } from "./AccountBase";

export class VisitorAccount extends AcccountBase {
    checkSession(): Promise<any> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }
    //#region 用户登录
    login(): Promise<dtSdkLoginResult> {
        return new Promise((resolve, reject) => {
            this.bi.clickStat(clickStatEventType.clickStatEventTypeWxLoginStart, []);
            this.bi.track(GAEvent.gsm_login_sns, { login_state: GAPropValue.start, login_code: "" });
            JsbNativeCall.exec(
                "LoginSDK",
                "login",
                {},
                (result) => {
                    this.logger.log(this.tag, 'login request success , params:', result);
                    // 保存用户名/用户ID/用户头像
                    UserInfo.userId = result.userId;
                    UserInfo.nickName = result.userName;
                    UserInfo.avatarUrl = result.purl;
                    UserInfo.authorCode = result.authorCode;
                    // UserInfo.wxgame_openid = result.wxgame_openid;
                    // UserInfo.wxgame_session_key = result.wxgame_session_key;
                    this.logger.log(this.tag, 'userId:' + UserInfo.userId + ' userName:' + UserInfo.nickName + ' userPic:' + UserInfo.avatarUrl + " authorCode:" + result.authorCode);
                    let token = result.token;
                    this.logger.log(this.tag, 'token:' + token);
                    // if (result.isCreate) {
                    //     this.bi.track(GAEvent.sdk_s_create_succ, {});
                    // }
                    // this.bi.track(GAEvent.sdk_s_login_succ, {});
                    this.notifer.emit(SdkEventType.SDK_LOGIN_SUCCESS);
                    resolve(result);
                },
                (error) => {
                    this.logger.error(null, 'login fail, params:', error);
                    this.notifer.emit(SdkEventType.SDK_LOGIN_FAIL);
                    reject({ errMsg: emSdkErrorCode.Req_pf_LoginBySnsIdNoVerifyFail, errData: error });
                });
        });
    }
    //#endregion
}
//#endregion