import { NativeBase } from "./NativeBase";

export class WechatNative extends NativeBase {
    public showToast(content: string, duration: number = 3000) {
        super.showToast(content, duration);
        this.platform.showToast({
            title: content,
            icon: "none",
            duration: duration,
        });
    }
    public hideToast() {
        super.hideToast();
        this.platform.hideToast();
    }
    public showLoading(title: string) {
        this.platform.showLoading({
            title: title,
        });
    }
    public hideLoading() {
        this.platform.hideLoading();
    }
    public isIpx() {
        if (!this.platform) {
            return false;
        }
        let ret = false;
        let sys_info = this.platform.getSystemInfoSync();
        if (
            sys_info.model.indexOf("iPhone X") >= 0 ||
            (sys_info.system.indexOf("iOS") >= 0 && sys_info.windowHeight / sys_info.windowWidth > 1.9)
        ) {
            return true;
        }
        return ret;
    }
    public is2To1() {
        if (!this.platform) {
            return false;
        }
        let sys_info = this.platform.getSystemInfoSync();
        return sys_info.windowHeight / sys_info.windowWidth > 1.9;
    }
    public isPad() {
        let ret = false;
        let sys_info = this.platform.getSystemInfoSync();
        if (sys_info.windowHeight / sys_info.windowWidth < 1.777) {
            return true;
        }
        return ret;
    }
    public vibrateShort(level: "heavy" | "medium" | "light"): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (typeof this.platform.vibrateShort === "function") {
                this.platform.vibrateShort({ type: level }).then(resolve).catch(reject);
            } else {
                console.log("当前环境不支持 wx.vibrateShort");
                reject();
            }
        });
    }
}
