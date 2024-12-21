import { SdkBase } from "../SdkBase";
import { UserInfo } from "../SdkConfig";
import { emSdkErrorCode } from "../SdkError";
export enum emUserInfoState {
    None,
    /**
     * 用户已经授权
     */
    Auth,
    /**
     * 拒绝过授权
     */
    Refuse,
    /**
     * 未询问过 未设置过
     */
    UnSet
}
export interface dtUserInfoButton {
    /**
     * 相对于屏幕左上角
     */
    left: number;
    /**
     * 相对于屏幕左上角
     */
    top: number;
    /**
     * 按钮宽度
     */
    width: number;
    height: number;
    /**
     *  withCredentials 为 true 时，要求此前有调用过 wx.login 且登录态尚未过期，此时返回的数据会包含 encryptedData, iv 等敏感信息；
     *  当 withCredentials 为 false 时，不要求有登录态，返回的数据不包含 encryptedData, iv 等敏感信息。
     */
    withCredentials?: boolean;
    btnText?: string;
    lineHeight?: number,
    backgroundColor?: string,
    color?: string,//
    fontSize?: number,
}
export interface dtSdkLogin {
    track:  string;
    result: dtSdkLoginResult;
    error:any;
}

export interface dtSdkLoginResult {
    code:               number;
    userId:             number;
    appId:              number;
    purl:               string;
    authorCode:         string;
    userName:           string;
    userEmail:          string;
    isCreate:           number;
    userType:           number;
    snsId:              string;
    userPwd:            string;
    mobile:             string;
    changePwdCount:     number;
    log_report:         number;
    exception_report:   number;
    "360.vip":          number;
    connectTimeOut:     number;
    heartBeat:          number;
    tcpsrv:             Tcpsrv;
    usercode:           string;
    authInfo:           string;
    token:              string;
    jwttoken:           string;
    channel_userInfo:   ChannelUserInfo;
    snsSex:             number;
    role_user_type:     string;
    partition:          string;
    wxgame_session_key: string;
    wxgame_openid:      string;
}

export interface ChannelUserInfo {
    channel_purl:     string;
    channel_userName: string;
}

export interface Tcpsrv {
    ip:     string;
    port:   number;
    wsport: number;
}
export abstract class AcccountBase extends SdkBase {
    protected tag: string = "account";

    abstract login(): Promise<dtSdkLoginResult>;
    abstract checkSession(): Promise<any>;

    public checkUserInfoScopeState(): Promise<emUserInfoState> {
        return new Promise((resolve, reject) => {
            resolve(emUserInfoState.Auth);
        });
    }
    /**
     * 
     * @param withCredentials 是否需要敏感信息
     * @returns 
     */
    public getUserInfo(withCredentials: boolean): Promise<IUserInfo> {
        return new Promise((resolve, reject) => {
            resolve({});
        });
    }

    protected userInfoButton: any;
    /**
     * 返回  userinfobutton 
     * 授权成功事件：START_AUTHORIZATION_SUCCESS 
     * 授权失败事件： START_AUTHORIZATION_FAILED 
     * @param dt 
     */
    public createUserInfoButton(dt: dtUserInfoButton): any {
        return null;
    }
    // protected createUserInfoButtonNoCredentials():any{

    // }
    // protected createUserInfoButtonWithCredentials():any{

    // }

    /**
     * wx.login成功后调用
     */
    protected onLoginSnsPlatorm(): void {

    }
    /**
     * 设置用户的ip地址
     * @param retryCount 
     * @returns 
     */
    public ReqIpLocInfo(retryCount: number = 1): Promise<any> {
        return new Promise((resolve, reject) => {
            var _url = 'https://iploc.ywdier.com/api/iploc5/search/city';
            this.http.get(_url).then((res) => {
                let data = res;
                if (data && data.loc && data.ip) {
                    UserInfo.ip = data.ip;
                    UserInfo.ipLocInfo = data;
                    this.logger.log("ReqIpLocInfo success:" + retryCount, res);
                    resolve(res);
                }
            }).catch((res) => {
                if (retryCount > 0) {
                    retryCount -= 1;
                    this.ReqIpLocInfo(retryCount).then(resolve).catch(reject);;
                }
                else {
                    this.logger.log("ReqIpLocInfo Fail", res);
                    reject({ errMsg: emSdkErrorCode.Req_pf_PLocInfoFail, errData: res });
                }
            });
        });
    }
}
export interface IAccountInfo {
    accountID: string;
    unionID: string;
    session_key?: string;
    time: number;
}
export interface IUserInfo {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;//0 未知 1男 2女
    encryptedData?: string;
    iv?: string;
}