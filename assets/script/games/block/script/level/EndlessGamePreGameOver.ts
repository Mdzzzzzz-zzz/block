/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-11 20:20:27
 */
import { _decorator } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { biEventId } from "../../../../Boot";
import { mk } from "../../../../MK";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import { FlagData } from "../../../../data/FlagData";
import { BIEventID } from "../../../../define/BIDefine";
import { EndlessScoreHelper } from "../logic/EndlessScoreHelper";
import { EndlessProgressHelper } from "../logic/EndlessProgressHelper";
const { ccclass, property } = _decorator;

@ccclass("LevelGamePreGameOver")
export class EndlessGamePreGameOver extends PanelBase<any> {
    start() {
        this.scheduleOnce(() => {
            this.closeSelf();
            let cfg = AssetInfoDefine.prefab.endlessOver;
            let result = this.data.result;
            let times = FlagData.inst.getTimes(BIEventID.af_classicgame);
            EndlessProgressHelper.getInstance().resetProgressBar();
            EndlessProgressHelper.getInstance().resetReachPercent();
            EndlessProgressHelper.getInstance().resetReachEnhance();
            if (result.isBestScore) {
                cfg = AssetInfoDefine.prefab.endlessBest;
                mk.audio.playSubSound(AssetInfoDefine.audio.level_finish);
                mk.sdk.instance.reportBI(biEventId.classic_finish, {
                    proj_af_classicbest: UserScoreLevelData.inst.getHighestScore(),
                    proj_af_classicnew: true,
                    proj_af_classictimes: times,
                    proj_af_classicscores: result.score,
                    proj_is_first_game: result.is_first_game,
                    proj_round: result.round,
                });
            } else {
                mk.audio.playSubSound(AssetInfoDefine.audio.game_over);
                mk.sdk.instance.reportBI(biEventId.classic_finish, {
                    proj_af_classicbest: UserScoreLevelData.inst.getHighestScore(),
                    proj_af_classicnew: false,
                    proj_af_classictimes: times,
                    proj_af_classicscores: result.score,
                    proj_is_first_game: result.is_first_game,
                    proj_round: result.round,
                });
            }
            PanelManager.inst.addPopUpView(cfg.path, {
                manager: this.data.manager,
                result: 0,
            });
        }, 1.5);
    }

    // update(deltaTime: number) {

    // }
}
