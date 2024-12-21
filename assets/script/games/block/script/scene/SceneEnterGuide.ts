import { _decorator, Component } from "cc";
import { mk } from "../../../../MK";
import { ProcedureToLevel } from "../../../../fsm/state/ProcedureToLevel";
import { ProcedureToEntryGuide } from "../../../../fsm/state/ProcedureToEntryGuide";
import { BlockEventType } from "../define/Event";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { PanelManager } from "../../../../panel/PanelManager";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { ProcedureToDailyChallenge } from "../../../../fsm/state/ProcedureToDailyChallenge";

const { ccclass, property } = _decorator;

@ccclass("SceneEnterGuide")
export class SceneEnterGuide extends Component {
    onLoad() {
        mk.regEvent(BlockEventType.EVENT_ENTER_ADVENTURE_LEVEL, this.goNext, this);
    }

    start() {
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.levelGuide.path)
    }

    goNext() {
        if (SceneMode.gameMode == kGameMode.adventure_level) {
            let info = mk.fsm.getData(ProcedureToEntryGuide, "defaultKey")
            mk.fsm.setData(ProcedureToEntryGuide, "defaultKey", null);
            let batchNum = 1;
            if (info != null && info != undefined) {
                batchNum = info.batch;
            }
            mk.fsm.changeState(ProcedureToLevel, { source: "adventure_level_select", batch: batchNum });
        } else if (SceneMode.gameMode == kGameMode.daily_challenge) {
            mk.fsm.changeState(ProcedureToDailyChallenge, "block");
        }
    }


}
    