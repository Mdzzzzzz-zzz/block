/*
 * @Date: 2023-06-06 17:12:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-30 14:54:46
 */
import { SdkBase } from "../SdkBase";
//用户授权情况
export interface dtSettings {
    userInfo: boolean; //用户授权
    userLocation: boolean; //位置授权
    WxFriendInteraction: boolean; //好友信息授权
}
export class ChannelBase extends SdkBase {
    settings: dtSettings;
    public isSupportShare() {
        return false;
    }
    public Init() {}

    navigateToMiniProgram(
        appid: string,
        path: string,
        envVersion: string,
        bi_paramlist: any,
        extraData?: string
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
    sendMsg(msg: any) {}
    setCloudStorage(kvData: any) {}
    getUserSettings() {}
    aggreePrivacy(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    reportABEvent(eventName: string, evtData: number) {
        
        
    }
    getABExpGroup(expParam: string): number {
        console.log("获取实验分组" + expParam);
        return 0;
    }

    reportPlatformEvent(eventName: string, evtData: number) {
        console.log("basereportPlatformEvent", eventName, evtData);
        let wx = window["wx"]
        if (wx) {
            wx.reportEvent(eventName, { expt_data: evtData });
        }
    }

}
