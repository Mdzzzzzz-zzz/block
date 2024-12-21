/*
 * @Date: 2024-06-25 14:53:32
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-12 17:41:24
 */
import { _decorator, Component, game, Node, view, Animation } from "cc";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import PanelBase from "../../../../panel/PanelBase";
import * as env from "cc/env";
import { SdkUtils } from "../../../../minigame_sdk/scripts/SdkUtils";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { emShareType } from "../../../../sdk/wechat/SocialDef";
import { UserData } from "../../../../data/UserData";
import { UserLevelData } from "../../../../data/UserLeveData";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { mk } from '../../../../MK';
import { PanelManager } from "db://assets/script/panel/PanelManager";
import { ABTestManager } from 'db://assets/script/ABTest/ABTestManager';
import { ABTestParam } from 'db://assets/script/ABTest/ABTestDefine';

const { ccclass, property } = _decorator;
let a = false;
@ccclass("SkinSelectView")
export class SkinSelectView extends PanelBase<any> {
    @property(Node)
    skin1: Node = null;
    @property(Node)
    skin2: Node = null;
    @property(Node)
    skin3: Node = null;
    @property(Node)
    skin4: Node = null;



    private skinId: number = 1;
    onLoad() {
        this.setMaskLayerEnable(false);
        this.initData()
    }

    initData() {
        this.skinId = UserData.inst.getSkinID();
    }

    start() {
        this.node.getComponent(Animation).play("FriendRankList_enter");
        this.refreshView()

        let group = ABTestManager.getInstance().getGroup(ABTestParam.ScoreChallenge);
        if (group == 0) {
            this.skin4.active = false;
        }
    }

    initNode() {

    }

    refreshView() {
        let useing1 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell1/useing");
        let useBtn = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell1/useBtn");
        useing1.active = this.skinId == 1;
        useBtn.active = this.skinId != 1;

        let useing2 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell2/useing");
        let useBtn2 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell2/useBtn");
        let lockN = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell2/lockN");
        let historyMaxScore = UserScoreLevelData.inst.getHighestScore() || 0;
        useing2.active = this.skinId == 2;
        useBtn2.active = this.skinId != 2 && historyMaxScore > 10000;
        lockN.active = this.skinId != 2 && historyMaxScore <= 10000;

        let useing3 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell3/useing");
        let useBtn3 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell3/useBtn");
        let lockN3 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell3/lockN");

        let guankaLv = UserLevelData.inst.getHistoryLevel(true)
        useing3.active = this.skinId == 3;
        useBtn3.active = this.skinId != 3 && guankaLv > 50;
        lockN3.active = this.skinId != 3 && guankaLv <= 50;

        let finishNum = UserData.inst.getScoreFinishNum()
        let useing4 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell4/useing");
        let useBtn4 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell4/useBtn");
        let unlockBtn4 = this.node.getChildByPath("rootUI/bg/contentLayout/skinCell4/unlockBtn");
        useing4.active = this.skinId == 4;
        useBtn4.active = this.skinId != 4 && finishNum == 1;
        unlockBtn4.active = this.skinId != 4 && finishNum != 1;
    }

    onClickUseBtn(event: Event, id: number) {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        id = Number(id)
        UserData.inst.setSkinID(id)
        this.skinId = id
        this.refreshView()
    }

    onUnlockBtn() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.scoreChallenge.path);
        this.closeSelf()
    }

    onCloseBtn() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        this.closeSelf()
    }

    onDestroy() {

    }
}
