/*
 * @Date: 2024-05-28 19:19:52
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-28 20:52:50
 */

import { _decorator, Animation } from 'cc';
import { EndlessGameOverView } from './EndlessGameOverView';
import { mk } from "../../../../MK";
import { BIEventID, emButtonScene, emButtonType } from "../../../../define/BIDefine";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { ProcedureToAdventureLevelSelectV2 } from '../../../../fsm/state/ProcedureToAdventureLevelSelectV2';
import { PanelManager } from '../../../../panel/PanelManager';
import { WechatMiniApi } from '../../../../sdk/wechat/WechatMiniApi';
import { emSharePath } from '../../../../sdk/wechat/SocialDef';
import { emShareType } from '../../../../sdk/wechat/SocialDef';
import { FlagData } from '../../../../data/FlagData';
import { BlockEventType } from '../define/Event';
import { ABTestManager } from 'db://assets/script/ABTest/ABTestManager';
import { ABTestParam } from 'db://assets/script/ABTest/ABTestDefine';
import { biEventId } from 'db://assets/script/Boot';
const { ccclass, property } = _decorator;

@ccclass('EndlessBestScoreView')
export default class EndlessBestScoreView extends EndlessGameOverView {
    private group: number;

    start(): void {
        super.start();


        this.group = ABTestManager.getInstance().getGroup(ABTestParam.FirstGameSubscribe);
        // 测试
        //this.group = 1;
        if (this.group == 0) {
            if (!FlagData.inst.hasFlag("kHowToPlayFlagKey")) {
                this.scheduleOnce(() => {
                    FlagData.inst.recordFlag("kHowToPlayFlagKey")
                    let cfg = AssetInfoDefine.prefab.howToFindExplain;
                    PanelManager.inst.addPopUpView(cfg.path);
                }, 1.5);
            }
        }
    }
    protected isCanShowInstersitial(): boolean {
        return false;
    }



    onClickLeaderBoardFromBestScore() {
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_leaderboard,
            proj_scene: emButtonScene.from_new_record_classic,
        });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.friendListRank.path);
    }

    onClickBtnShare() {
        WechatMiniApi.getInstance().showShare(emShareType.s_10010, emSharePath.level_success, this, null);
    }

    protected playAnim() {
        let animation = this.mainAnimNode.getComponent(Animation);
        animation.play("eui_Endless_BestSocreArea_02_anim");
    }
    protected playAnimWithLeaderRank() {
        let animation = this.mainAnimNode.getComponent(Animation);
        animation.play("eui_Endless_BestSocreArea_anim");
    }

    onClose() {
        mk.unRegEvent(this);
    }
}

