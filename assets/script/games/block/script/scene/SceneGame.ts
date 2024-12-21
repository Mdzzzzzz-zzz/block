/*
 * @Date: 2023-06-14 16:46:44
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-10-11 20:32:04
 */
import { _decorator, Component, Node } from "cc";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { Game } from "../logic/Game";
import { mk } from "../../../../MK";
import { GuideData } from "../../../../data/GuideData";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { UserData } from "../../../../data/UserData";
import { BIEventID, emButtonScene, emButtonType } from "../../../../define/BIDefine";
import { audioManager } from "../../../../util/MKAudio";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { SdkEventType } from "../../../../minigame_sdk/scripts/SdkEventType";
import { BlockEventType } from "../define/Event";
import * as env from "cc/env";

const { ccclass, property } = _decorator;

@ccclass("SceneGame")
export class SceneGame extends Component {
    @property(Node)
    RootItem: Node = null;

    protected start(): void {
        if (SceneMode.gameMode == kGameMode.endless) {
            if (GuideData.inst.isGuideFinished()) {
                //AdSdk.inst.showMainPageBannerAd("SceneGame");
            }
        } else if (SceneMode.gameMode == kGameMode.adventure_level) {
            if (LevelGuideData.inst.isGuideFinished()) {
                //AdSdk.inst.showMainPageBannerAd();
            }
        }
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_SHOW,
            () => {
                audioManager.instance.playMusic(true);
            },
            this
        );
        audioManager.instance.changeMusic(AssetInfoDefine.audio.block_game_bgm, true);
        mk.regEvent(BlockEventType.EVENT_GUIDE_COMPLETED, this.showPropList, this);
        // let group = ABTestManager.getInstance().getGroup(ABTestParam.EndlessProp);
        // if (group == 1 && GuideData.inst.isGuideFinished()) {
        //     this.RootItem.active = true;

        // }
        //SdkCrossAdManager.getInstance().AddAd("list_play",this.node,v3(0,0,0))

        // else{
        //     this.scheduleOnce(() => {
        //         AdSdk.inst.showMainPageBannerAd();
        //     }, 15);
        // }
    }
    onBtnClicKSetting() {
        mk.audio.playBtnEffect();
        if (UserData.inst.isOpenLevel) {
            // console.log("[click_button] btn_click " + emButtonType.enter_settings + " " + emButtonScene.from_classic)
            mk.sdk.instance.reportBI(BIEventID.btn_click, {
                proj_btn_type: emButtonType.enter_settings,
                proj_scene: emButtonScene.from_classic,
            });
            PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.setting.path, Game.inst);
            return;
        }
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.setting.path, Game.inst);
    }
    protected onDestroy(): void {
        if (env.WECHAT) {
            //更新当前的分数
            // @ts-ignore
            wx.getOpenDataContext().postMessage({
                event: "clear",
            });
        }
        Game.inst.destroy();
    }

    showPropList() {
        // let group = ABTestManager.getInstance().getGroup(ABTestParam.EndlessProp);
        // if (group == 1) {
        //     this.RootItem.active = true;
        //     UserHammerData.inst.addItem(1);
        //     UserHRocketData.inst.addItem(1);
        //     UserVRocketData.inst.addItem(1);
        //     UserChangeData.inst.addItem(1);
        // }
    }

    showGameExplain() {
        let asset = AssetInfoDefine.prefab.gameExplain.path;
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.how_to_play,
            proj_scene: emButtonScene.from_classic,
        });
        PanelManager.inst.addPopUpView(asset);
    }
}
