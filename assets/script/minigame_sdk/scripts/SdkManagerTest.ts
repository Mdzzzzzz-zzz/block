import { SDKAD } from "./SdkAdManager";
import { dtSdkError, emSdkErrorCode } from "./SdkError";
import { SdkSingleton } from "./common/SdkSingleton";

export class SdkManagerTest extends SdkSingleton {
    public Init() {
    }
    public UnInit() {
    }
    public TestAd() {

        //激励视频
        // SDKAD.showRewardVideoAd("情景").then(() => {
        //     //完成完整观看可以发放奖励

        // }).catch((err: dtSdkError) => {
        //     if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
        //         //主动关闭可在此弹窗提示
        //         console.log(err.errData);
        //         return;
        //     }
        //     if (err.errMsg == emSdkErrorCode.Sdk_Ad_Show_Repeat_Error) {
        //         //连续点击播放
        //         console.log(err.errData);
        //         return;
        //     }
        //     if (err.errMsg == emSdkErrorCode.Sdk_Ad_Load_Error || err.errMsg == emSdkErrorCode.Sdk_Ad_Show_Error) {
        //         //广告加载或者播放失败
        //         console.log(err.errData);
        //         return;
        //     }
        // });
        // //插屏
        // SDKAD.showInsterstital("情景");
        // //显示格子广告 目前是底部5格广告 
        // SDKAD.showCustomGridAd("情景");
        // //隐藏格子广告
        // SDKAD.hideCustomGridAd("情景");
        // // banner调用方式  placement:0 屏幕顶部 1 屏幕中间 2 屏幕底部
        // SDKAD.showBanner("情景", 2)
        // SDKAD.hideBanner("情景")
    }
}