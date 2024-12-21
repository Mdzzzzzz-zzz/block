
import { _decorator } from "cc";
import { mk } from "../../../../MK";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { ResManager } from "../../../../resource/ResManager";
import { audioManager } from "../../../../util/MKAudio";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { SdkEventType } from "../../../../minigame_sdk/scripts/SdkEventType";
import { DailyChallengeBoardView } from "../dailychallenge/DailyChallengeBoardView";
import { SceneLevel } from "./SceneLevel";
import { DailyChallengeLevelGame } from "../logic/DailyChallengeLevelGame";

const { ccclass, property } = _decorator;

@ccclass("SceneDailyChallenge")
export class SceneDailyChallenge extends SceneLevel {

    @property(DailyChallengeBoardView)
    board: DailyChallengeBoardView = null;

    isWatching: boolean
    protected onLoad(): void {
        SceneMode.gameMode = kGameMode.daily_challenge;
        this.isWatching = false;
    }
    protected start(): void {
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_SHOW,
            () => {
                audioManager.instance.playMusic(true);
            },
            this
        );
        audioManager.instance.changeMusic(AssetInfoDefine.audio.block_game_bgm, true);
    }

    onBtnBack() {
        mk.audio.playBtnEffect();
        ResManager.getInstance().gotoScene("daily_challenge_home", "block").then();
    }

    onBtnClicKSetting() {
        mk.audio.playBtnEffect();
        // console.log("[click_button] btn_click " + emButtonType.enter_settings + " " + emButtonScene.from_adventure)
        // mk.sdk.instance.reportBI(BIEventID.btn_click, {
        //     btn_type: emButtonType.enter_settings,
        //     scene: emButtonScene.from_adventure,
        // });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.setting.path, DailyChallengeLevelGame.levlInstance);
    }
}
