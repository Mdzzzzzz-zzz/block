import { WechatNative } from "./WechatNative";

export class DouyinNative extends WechatNative {
    public vibrateShort(level: "heavy" | "medium" | "light"): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (typeof this.platform.vibrateShort === "function") {
                this.platform.vibrateShort({
                    success(res) {
                        //console.log(res);
                    },
                    fail(err) {
                        console.log(`vibrateShort调用失败`, err);
                    },
                  });
            } else {
                console.log("当前环境不支持 wx.vibrateShort");
                reject();
            }
        });
    }
}