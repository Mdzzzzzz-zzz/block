/*
 * @Date: 2023-06-12 19:28:07
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-12 19:43:45
 */
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { SdkEventManager } from '../SdkEventManager';
import { SdkEventType } from '../SdkEventType';
import { CrossRewardConfig, dtCrossAdRewardChange } from './CrossAdConfig';
import { CrossAdRewardData } from './CrossAdRewardData';
const { ccclass, property } = _decorator;

@ccclass('ads_exchange')
export class ads_exchange extends Component {
    @property(Label)
    labState: Label = null;

    start() {
        this.onEvtRewardStateChange(null);
        SdkEventManager.getInstance().register(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, this.onEvtRewardStateChange, this)
    }
    onEvtRewardStateChange(dt: dtCrossAdRewardChange) {
        if (this.labState) {
            this.labState.string = `${CrossAdRewardData.inst.rewardValue}/${CrossRewardConfig.exchange_consume}`;
        }
    }
    protected onDestroy(): void {
        SdkEventManager.getInstance().unregister(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, this.onEvtRewardStateChange, this)
    }
}

