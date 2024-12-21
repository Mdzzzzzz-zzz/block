import { _decorator } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { mk } from "../../../../MK";
import { biEventId } from "../../../../Boot";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { UserLevelData } from "db://assets/script/data/UserLeveData";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelGamePreGameOver")
export class AdventureLevelGamePreGameOver extends PanelBase<any> {
    start() {


        if (SceneMode.gameMode == kGameMode.daily_challenge) {
            this.scheduleOnce(() => {
                this.closeSelf();
                let cfg = AssetInfoDefine.prefab.dailyChallengeGameOver;
                PanelManager.inst.addPopUpView(cfg.path, this.data);
            }, 1.5);
        } else if (SceneMode.gameMode == kGameMode.adventure_level) {
            this.scheduleOnce(() => {
                this.closeSelf();
                let cfg = AssetInfoDefine.prefab.levelOver;
                PanelManager.inst.addPopUpView(cfg.path, this.data);
            }, 1.5);
        } else if (SceneMode.gameMode == kGameMode.level) {
            this.scheduleOnce(() => {
                this.closeSelf();
                let cfg = AssetInfoDefine.prefab.levelOverNew;
                PanelManager.inst.addPopUpView(cfg.path, this.data);
            }, 1.5);
        }
    }
    protected onSetData(value: any): void {
        if (SceneMode.gameMode == kGameMode.adventure_level) {
            let inst = UserAdventureLevelData.inst;
            mk.sdk.instance.reportBI(biEventId.level_finish, {
                proj_level: value.level,
                proj_result: 1,
                proj_stage: inst.getLevelBatchNumber(),
                proj_round: this.data.manager.getRound(),
            });
        } else if (SceneMode.gameMode == kGameMode.daily_challenge) {
            let d = new Date();
            mk.sdk.instance.reportBI(biEventId.daily_finish, {
                proj_level: d.getDate(),
                proj_month: d.getMonth() + 1,
                proj_star: UserDailyChallengeData.inst.getFinishedDays(),
            });
        } else if (SceneMode.gameMode == kGameMode.level) {
            mk.sdk.instance.reportBI(biEventId.levelmode_finish, {
                proj_level: UserLevelData.inst.getHistoryLevel(),
                proj_result: 1,
                proj_round: this.data.manager.getRound(),
            });
        }
    }

    // update(deltaTime: number) {

    // }
}
