import { assetManager, JsonAsset } from "cc";
import { Singleton } from "../Singleton";
import { PREVIEW } from "cc/env";

export class RemoteConfig extends Singleton {
    public Init() {
        throw new Error("Method not implemented.");
    }
    public UnInit() {
        throw new Error("Method not implemented.");
    }
    ReviviTimesEndless: number = 3;
    ReviviTimesAdventure: number = 3;
    PropHammerInitCount: number = 1;            //锤子道具初始化数量
    PropVRocketInitCount: number = 1;           //竖火箭道具初始化数量
    PropHRocketInitCount: number = 1;           //横火箭道具初始化数量
    PropRefreshInitCount: number = 1;           //刷新道具道具初始化数量
    AccountShareCount: number = 0;              //账号分享次数
    DailyClassicTreasureChestCount: number = 3; //每日经典模式宝箱出现次数
    RoundUsedHammerMaxCount: number = 3;        //每局最多使用锤子次数
    RoundUsedVRocketMaxCount: number = 3;       //每局最多使用横火箭次数
    RoundUsedHRocketMaxCount: number = 3;       //每局最多使用横火箭次数
    RoundUsedRefreshMaxCount: number = 3;       //每局最多使用横火箭次数
    PropGiftNumOfRoundsAppear1Time: number = 1; //每N关出现1次
    newbieGameNumber: number = 1;

    protected originData: any;

    initConfig(jsonStr: JsonAsset) {
        let data = jsonStr.json;
        this.originData = data;
        if (data) {
            this.ReviviTimesEndless = data.ReviviTimesEndless || 3;
            this.ReviviTimesAdventure = data.ReviviTimesAdventure || 3;
            this.PropHammerInitCount = data.PropHammerInitCount || 1;
            this.PropVRocketInitCount = data.PropVRocketInitCount || 1;
            this.PropHRocketInitCount = data.PropHRocketInitCount || 1;
            this.PropRefreshInitCount = data.PropRefreshInitCount || 1;
            this.AccountShareCount = (data.AccountShareCount !== undefined && data.AccountShareCount !== null) ? data.AccountShareCount : 0;
            this.DailyClassicTreasureChestCount = (data.DailyClassicTreasureChestCount !== undefined &&
                data.DailyClassicTreasureChestCount !== null) ? data.DailyClassicTreasureChestCount : 3;
            this.RoundUsedHammerMaxCount = data.RoundUsedHammerMaxCount || 3;
            this.RoundUsedVRocketMaxCount = data.RoundUsedVRocketMaxCount || 3;
            this.RoundUsedHRocketMaxCount = data.RoundUsedHRocketMaxCount || 3;
            this.RoundUsedRefreshMaxCount = data.RoundUsedRefreshMaxCount || 3;
            this.PropGiftNumOfRoundsAppear1Time = data.PropGiftNumOfRoundsAppear1Time || 1;
            this.newbieGameNumber = data.NewbieGameNumber || 1;
        } else {
            console.log("CDN initConfig error")
        }
        console.log("CDN DailyClassicTreasureChestCount = ", this.DailyClassicTreasureChestCount);
        return this;
    }

    public static LoadRemote(): Promise<RemoteConfig> {
        return new Promise<RemoteConfig>((resolve, reject) => {
            let remoteUrl = "https://waxiaoqn.nalrer.cn/waxiao/block_remote_config.json";
            const currentDate = new Date();
            const dateWithHourPrecision = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate(),
                currentDate.getHours(),
                0,
                0,
                0
            );
            let hourTimestamp = dateWithHourPrecision.getTime();
            if (PREVIEW) {
                hourTimestamp = Date.now()
            }
            const urlWithTime = `${remoteUrl}?time=${hourTimestamp}`;

            assetManager.loadRemote<JsonAsset>(urlWithTime, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(null);
                    return;
                }
                let inst = RemoteConfig.getInstance().initConfig(data);
                if (PREVIEW) {
                    console.log(data);
                }
                resolve(inst);
            });
        });
    }
}
