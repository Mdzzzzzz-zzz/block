/*
 * @Date: 2023-06-15 17:22:56
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-16 15:16:14
 */
import { JsbNativeCall } from "../../../sdk/JsbNativeCall";
import { SdkBase } from "../SdkBase";

export class AndroidNative extends SdkBase {
    public showToast(content: string, duration: number = 1) {
        JsbNativeCall.exec("Toast", "show", { msg: content, duration: duration });
    }
    public showLoading(title: string) {
        // this.platform.showLoading({
        //     title: '加载中',
        // });
    }
    public hideToast(){
        
    }
    public hideLoading() {
        // this.platform.hideLoading();
    }
    public isIpx() {
        // if (!window.wx) {
        //     return false;
        // }
        // let ret = false;
        // let sys_info = wx.getSystemInfoSync();
        // if (sys_info.model.indexOf('iPhone X') >= 0 || (sys_info.system.indexOf('iOS') >= 0 && sys_info.windowHeight / sys_info.windowWidth > 1.9)) {
        //     return true;
        // }
        // return ret;
        return false
    }
    public is2To1() {
        // if (!window.wx) {
        //     return false;
        // }
        // let sys_info = wx.getSystemInfoSync();
        // return sys_info.windowHeight / sys_info.windowWidth > 1.9;
        return false;
    }
    public isPad() {
        return false;
    }
}