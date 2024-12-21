import { SdkBase } from "../SdkBase";
import * as env from 'cc/env';
import { AdConfigInfo } from "../SdkConfig";
import { emAdPlacement } from "./AdDef";


export class AdBase extends SdkBase {
    public Init() {
    }
    public UnInit() {
    }
    protected bannerAd: any;
    protected isShowingBanner: boolean;
    isCanUseBannerAd(): boolean {
        if (env.PREVIEW || env.EDITOR) {
            return false;
        }
        return AdConfigInfo.bannerUnitId != "";
    }
    protected rewardedVideoAd = null;
    protected isPlayVideoAd: boolean = false;

    isCanUseRewardedViedeoAd(): boolean {
        if (env.PREVIEW || env.EDITOR) {
            return true;
        }
        return AdConfigInfo.rewardUnitId != "";
    }
    protected interstitialAd = null;
    isCanUseInterstitialAd(): boolean {
        if (env.PREVIEW || env.EDITOR) {
            return false;
        }
        return AdConfigInfo.insertUnitId != "";
    }
    protected customAd: any;
    isCanUseCustomAd(): boolean {
        if (env.PREVIEW || env.EDITOR) {
            return false;
        }
        return AdConfigInfo.customGridUnitId != "";
    }
    loadBannerAd(scene: string, adUnitId: string,placement:emAdPlacement): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    showBannerAd(scene: string, show: boolean): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    loadRewardedVideoAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    showRewardedVideoAd(scene: string,adUnitId: string): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    loadInterstitialAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    public showInterstitialAd(scene: string): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    public loadCustomAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    isCustomAdShow() {
        return false;
    }
    showCustomAd(scene: string, show: boolean): Promise<any> {
        return new Promise<(void)>((resolve, reject) => {
            resolve();
        });
    }
    public hasRewardedVideo():Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }
    public hasInterstitial():Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }
    destroy() {

    }
    
    setDynamicUserId(params){

    }
}

export { emAdPlacement };
