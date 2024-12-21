/*
 * @Date: 2023-06-14 16:46:44
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-15 20:06:52
 */
import { SdkBase } from "../SdkBase";

export class WebbrowserNative extends SdkBase {
    public showToast(content: string, duration: number = 3000) {
        // this.platform.showToast({
        //     title: content,
        //     icon: 'none',
        //     duration: 2000
        // })
        console.log(content);
    }
    public showLoading(title: string) {
        // this.platform.showLoading({
        //     title: '加载中',
        // });
    }
    public hideLoading(title: string) {
        // this.platform.hideLoading();
    }
}