/*
 * @Date: 2023-05-22 10:44:08
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-06 12:53:59
 */
import { _decorator, Component } from "cc";
import { mk } from "../../../../MK";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
// import { LevelGame } from '../logic/LevelGame';
import { AdventureLevelGame } from "../logic/AdventureLevelGame";
import { AdSdk } from "../../../../sdk/AdSdk";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { ResManager } from "../../../../resource/ResManager";
import { BIEventID, emButtonScene, emButtonType, emPropType } from "../../../../define/BIDefine";
import { audioManager } from "../../../../util/MKAudio";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { SdkEventType } from "../../../../minigame_sdk/scripts/SdkEventType";
import { emAdPath } from "../../../../sdk/emAdPath";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { emAdStatus } from "../../../../define/BIDefine";
import { BlockEventType } from "../define/Event";
import { UserHammerData } from '../../../../data/UserHammerData';
import { UserVRocketData } from '../../../../data/UserVRocketData';
import { UserHRocketData } from '../../../../data/UserHRocketData';
import { UserChangeData } from '../../../../data/UserChangeData';
import { biEventId, getItem } from "../../../../Boot";
import { ProcedureToLevel } from "../../../../fsm/state/ProcedureToLevel";
import { AdventureLevelBoardView } from "../LevelAdventure/AdventureLevelBoardView";

const { ccclass, property } = _decorator;

@ccclass("SceneLevel")
export class SceneLevel extends Component {
    @property(AdventureLevelBoardView)
    board: AdventureLevelBoardView = null;

    isWatching: boolean
    protected onLoad(): void {
        this.isWatching = false;
    }
    protected start(): void {
        if (LevelGuideData.inst.isGuideFinished()) {
            this.scheduleOnce(() => {
                //AdSdk.inst.showMainPageBannerAd("SceneLevel"); 冒险模式关卡中关闭banner广告
            }, 2);
        }
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_SHOW,
            () => {
                audioManager.instance.playMusic(true);
            },
            this
        );

        let info = mk.fsm.getData(ProcedureToLevel, "defaultKey")
        this.board.setBatchNum(info.batch);

        audioManager.instance.changeMusic(AssetInfoDefine.audio.block_game_bgm, true);
    }

    // async waitLoadTarget() {
    //     await Util.delay(2000);
    // }
    onBtnLevelSeclect() {
        mk.audio.playBtnEffect();

        // ResManager.getInstance().gotoScene("level_select","level").then();
        if (SceneMode.gameMode == kGameMode.level) {
            SceneMode.gameMode = kGameMode.none;
            ResManager.getInstance().gotoScene("home", "block").then();
        } else {
            SceneMode.gameMode = kGameMode.none;
            ResManager.getInstance().gotoScene("adventure_level_selectv2", "block").then();
        }

    }
    onBtnClicKSetting() {
        mk.audio.playBtnEffect();
        // console.log("[click_button] btn_click " + emButtonType.enter_settings + " " + emButtonScene.from_adventure)
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_settings,
            proj_scene: emButtonScene.from_adventure,
        });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.setting.path, AdventureLevelGame.levlInstance);
    }

    protected onDestroy(): void {
        AdventureLevelGame.levlInstance.destroy();
    }
}
