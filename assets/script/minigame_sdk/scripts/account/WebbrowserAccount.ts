import { AcccountBase, dtSdkLoginResult, dtUserInfoButton } from "./AccountBase";

export class WebbrowserAccount extends AcccountBase {
    checkSession(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
    // {
    //     "code": 0,
    //     "userId": 10005,
    //     "appId": 20557,
    //     "purl": "http://ddz.image.tuyoo.com/avatar/head_female_0.png",
    //     "authorCode": "",
    //     "userName": "是耘志吖",
    //     "userEmail": "",
    //     "isCreate": 0,
    //     "userType": 4,
    //     "snsId": "wxapp:o1gwD5n6zz76NN5KG7K4zQ4MCWLQ",
    //     "userPwd": "",
    //     "mobile": "",
    //     "changePwdCount": 0,
    //     "log_report": 0,
    //     "exception_report": 0,
    //     "360.vip": 0,
    //     "connectTimeOut": 35,
    //     "heartBeat": 6,
    //     "tcpsrv": {
    //         "ip": "127.0.0.1",
    //         "port": 8080,
    //         "wsport": 8081
    //     },
    //     "usercode": "520309192cfb1a43dc769c2c70ef3c35",
    //     "authInfo": "{\"authcode\": \"==\", \"account\": \"\", \"uid\": 10005, \"usercode\": \"520309192cfb1a43dc769c2c70ef3c35\"}",
    //     "token": "914fecd8-5ccd-42af-b7d8-25c2970be42a",
    //     "jwttoken": "",
    //     "channel_userInfo": {
    //         "channel_purl": "",
    //         "channel_userName": ""
    //     },
    //     "snsSex": 1,
    //     "role_user_type": "channel",
    //     "partition": "",
    //     "wxgame_session_key": "whQD8LTS9jwQv1cSTWY6LA==",
    //     "wxgame_openid": "o1gwD5n6zz76NN5KG7K4zQ4MCWLQ"
    // }
    /**
     * 模拟数据 慎用
     * @returns 
     */
    login(): Promise<dtSdkLoginResult> {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }
    public createUserInfoButton(dt: dtUserInfoButton) {
        this.logger.log(this.tag, dt);
    }
}