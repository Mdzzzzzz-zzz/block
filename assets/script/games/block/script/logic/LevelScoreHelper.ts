/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2024-06-01 12:18:24
 */
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { ScoreHelper, emComboState } from "./ScoreHelper";
import { BlockEventType } from "../define/Event";
import { mk } from "../../../../MK";
import { BIEventID } from "../../../../define/BIDefine";
import { UserCollectLevelData } from "../../../../data/UserCollectLevelData";
import { ResManager } from "../../../../resource/ResManager";
import { JsonAsset } from "cc";
export class LevelScoreHelper extends ScoreHelper {
    // constructor(userId?: number) {
    //     super(userId);
    //     // this.configs = mk.subRes.loadJsonConfig("res/configs/global").level;
    // }
    public loadConfig():Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            ResManager.getInstance().loadAsset<JsonAsset>("res/configs/global","block").then((res) => {
                this.configs = res.json.level;
                resolve(true);
            }).catch(reject);
        })
    }
    protected addScore(score: number): void {
        if (score <= 0) {
            return;
        }
        super.addScore(score);
        BlockEventManager.instance.emit(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.score);
    }
    public checkCombo(clearCount: number): emComboState {
        return emComboState.Combo_WAIT;
    }
    protected onClearAllBlock(currScore: number, round: number): void {
        let theme = UserCollectLevelData.inst.getLevelThemeName();
        let level = UserCollectLevelData.inst.getHistoryLevel();
        //mk.sdk.instance.reportBI(BIEventID.level_clear_all, { theme: theme, round: round, level: level });
    }
}
