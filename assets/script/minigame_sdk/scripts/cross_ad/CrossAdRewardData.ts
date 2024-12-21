import { getItem, setItem } from "../../../Boot";
import { SdkEventManager } from "../SdkEventManager";
import { SdkEventType } from "../SdkEventType";
import { CrossRewardConfig, dtRawAdInfo } from "./CrossAdConfig";

/*
 * @Date: 2023-06-12 10:49:44
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-13 11:02:48
 */
/**
 * 按天记录每日领取的状态和总数
 */
export class CrossAdRewardData {
    private static _inst: CrossAdRewardData = null;
    public static get inst() {
        if (CrossAdRewardData._inst == null) CrossAdRewardData._inst = new CrossAdRewardData();
        return CrossAdRewardData._inst;
    }
    krewardState = "cad_rwstate";
    krewardValue = "cad_rwvalue";

    constructor() {
        this._rewardState = getItem(this.krewardState, {});
        this._rewardValue = getItem(this.krewardValue, 0);
    }
    private _rewardState: Record<string, number> = {};
    public get rewardState(): Record<string, number> {
        return this._rewardState;
    }
    public set rewardState(value: Record<string, number>) {
        setItem(this.krewardState, value);
        this._rewardState = value;
    }

    /**
     * 每天获取的总积分
     */
    private _rewardValue: number = 0;
    public get rewardValue(): number {
        return this._rewardValue;
    }
    public set rewardValue(value: number) {
        setItem(this.krewardValue, value);
        this._rewardValue = value;
    }
    public isCanGetReward(dt: dtRawAdInfo) {
        let gotTimes = this.rewardState[dt.toappid] || 0;
        return gotTimes < dt.reward_limit;
    }
    public gotReward(dt: dtRawAdInfo) {
        let state = this.rewardState;
        let lastTimes = state[dt.toappid] || 0;
        state[dt.toappid] = lastTimes + 1;
        //加积分
        this.rewardValue += dt.reward_value;
        this.rewardState = state;
        let consume = CrossRewardConfig.exchange_consume;
        let exchangeCount: number = 0;
        while (this.rewardValue >= consume) {
            //直接兑换一个道具
            this.rewardValue -= CrossRewardConfig.exchange_consume;
            exchangeCount += 1;
        }
        SdkEventManager.getInstance().emit(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, {
            appid: dt.toappid,
            canGetReward: this.isCanGetReward(dt),
            rewardValue: this.rewardValue,
            rewardGetValue: dt.reward_value,
            rewardName: CrossRewardConfig.reward_name,
            consumeValue: consume
        });
        if (exchangeCount > 0) {
            //积分满足兑换条件
            SdkEventManager.getInstance().emit(SdkEventType.CROSS_AD_REWARD_EXCHANGE_CHANGE, {
                appid: dt.toappid,
                exchangeCount: exchangeCount,
                exchangeId: CrossRewardConfig.exchange_id,
                exchangeName: CrossRewardConfig.exchange_name
            });
        }
    }
    /**
     * 每天清理一次
     */
    public clearRewardState() {
        this.rewardState = {};
        this.rewardValue = 0;
    }
}