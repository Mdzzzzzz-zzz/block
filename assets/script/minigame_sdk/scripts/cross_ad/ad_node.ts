/*
 * @Date: 2023-05-25 15:41:39
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2023-07-15 00:36:54
 */
import { _decorator, assetManager, Component, Label, Sprite, SpriteFrame, UITransform, ImageAsset } from 'cc';
import { CrossAdConfig, dtCrossAdRewardChange, dtRawAdInfo, emCrossAdPath } from './CrossAdConfig';
import { SdkEventManager } from '../SdkEventManager';
import { SdkEventType } from '../SdkEventType';
import { Node } from 'cc';
import { CrossAdRewardData } from './CrossAdRewardData';
import { ResManager } from '../../../resource/ResManager';
import { SpriteAtlas } from 'cc';
import { JsonAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ad_node')
export class ad_node extends Component {

    @property(Sprite)
    icon: Sprite = null;
    @property(Label)
    nameLabel: Label = null
    @property(Node)
    rewardRoot: Node = null
    @property(Label)
    rewardLabel: Label = null
    @property(SpriteAtlas)
    adSpriteAtlas = null;
    @property(JsonAsset)
    ad_boxConfig = null;


    data: dtRawAdInfo;
    showPath: string;
    adType: number;
    onLoad(): void {
        SdkEventManager.getInstance().register(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, this.onRewardStateChange, this);
        this.SetData();
    }
    onRewardStateChange(dt: dtCrossAdRewardChange) {
        if (dt.appid == this.data.toappid) {
            //刷新下状态
            this.flushIcon();
            this.flushName();
        }
    }
    SetData(data?: dtRawAdInfo, path?: emCrossAdPath, adType?: number) {
        let ad_Config = this.ad_boxConfig.json as Array<dtRawAdInfo>;
        if(this.node.parent!=null){
           this.data = ad_Config[this.node.getSiblingIndex()];
        }
        this.showPath = emCrossAdPath.List;
        this.adType = 1;
        this.flushIcon();
        this.flushName();
    }
    flushIcon() {
        let spritename = this.data.toappid;
            this.icon.spriteFrame = this.adSpriteAtlas.getSpriteFrame(spritename);

    }
    flushName() {
        if (CrossAdRewardData.inst.isCanGetReward(this.data)) {
            this.nameLabel.node.active = false;
            this.rewardRoot.active = true;
            this.rewardLabel.node.active = true;
            this.rewardLabel.string = `+${this.data.reward_value}` //`奖励【${this.data.reward_name}+${this.data.reward_value}】`;
        }
        else {
            this.rewardRoot.active = false;
            this.rewardLabel.node.active = false;
            this.nameLabel.node.active = true;
            this.nameLabel.string = this.data.appName;
        }
    }
    gotoMiniProgram() {
        SdkEventManager.getInstance().emit(SdkEventType.GO_TO_MINIGAME, this.data, this.showPath, this.adType);
        // SdkCrossAdManager.getInstance().jump2MiniProgramByConfig(SdkCrossAdManager.getInstance().getCrossAdConfigByAppId(this.data.appid));
    }
    protected onDestroy(): void {
        SdkEventManager.getInstance().unregister(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, this.onRewardStateChange, this);
    }
}

