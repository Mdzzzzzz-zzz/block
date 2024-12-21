/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-29 11:15:46
 */
import { SdkBase } from "../SdkBase";

export class NativeBase extends SdkBase {
    public showToast(content: string, duration: number = 3000) {
        // this.platform.showToast({
        //     title: content,
        //     icon: 'none',
        //     duration: 2000
        // })
        console.log(content);
    }
    public hideToast() {}
    public showLoading(title: string) {
        // this.platform.showLoading({
        //     title: '加载中',
        // });
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
        return false;
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

    public vibrateShort(level: "heavy" | "medium" | "light"): Promise<any> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }
}
