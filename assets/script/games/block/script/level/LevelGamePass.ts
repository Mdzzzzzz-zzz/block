/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-09 19:41:43
 */
import { _decorator, instantiate, Node, Label, Layout, Animation, tween, Vec3 } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { LevelConditionDiamondItem } from "../level/LevelConditionDiamondItem";
import { emLevCondition } from "../logic/AdventureLevelGame";
import { DiamondDisplayLoc } from "../define/LocationData";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { biEventId } from "../../../../Boot";
import { mk } from "../../../../MK";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { ProcedureToHome } from "db://assets/script/fsm/state/ProcedureToHome";
import { UserLevelData } from "db://assets/script/data/UserLeveData";
import { ResManager } from "db://assets/script/resource/ResManager";
import { JsonAsset } from "cc";
import { AdSdk } from "db://assets/script/sdk/AdSdk";
const { ccclass, property } = _decorator;

@ccclass("LevelGamePass")
export class LevelGamePass extends PanelBase<any> {
    @property(Label)
    label: Label = null;


    start() {
        this.label.string = (UserLevelData.inst.getHistoryLevel() - 1).toString();
        // this.scheduleOnce(() => {
        //     this.closeSelf();
        //     let cfg = AssetInfoDefine.prefab.LevelPassNew;
        //     PanelManager.inst.addPopUpView(cfg.path, this.data);
        // }, 1.5);
        console.log("打点 关卡模式 levelmode_finish")
        mk.sdk.instance.reportBI(biEventId.levelmode_finish, {
            proj_level: UserLevelData.inst.getHistoryLevel() - 1,
            proj_result: 0,
            proj_round: this.data.manager.getRound(),
        });

        let level = UserLevelData.inst.getHistoryLevel() - 1;
        if (level > 5) {
            // if (level < 20) {
            //     if ((level % 2 == 1)) {
            //         AdSdk.inst.showInsterstital("LevelGamePass");
            //     }
            // } else {
            //     AdSdk.inst.showInsterstital("LevelGamePass");
            // }
            AdSdk.inst.showInsterstital("LevelGamePass");
        }

        ResManager.getInstance()
            .loadAsset<JsonAsset>("res/configs/myWorkConfig", "block")
            .then((asset) => {
                const configBlocks = asset.json;
                let mapData = configBlocks.mapping;
                for (let index = 0; index < mapData.length; index++) {
                    if (level <= mapData[index].rewardList.length) {
                        UserLevelData.inst.currLevelTotalBlocks = mapData[index].rewardList[level - 1];
                        break;
                    }
                    level = level - mapData[index].rewardList.length;
                }
            })
    }

    onClickNextLevel() {
        // let cfg = AssetInfoDefine.prefab.LevelPassNew;
        // PanelManager.inst.addPopUpView(cfg.path, this.data);
        // SceneMode.gameMode = kGameMode.level;
        mk.fsm.changeState(ProcedureToHome, "levelPass");
        this.closeSelf();
    }

}
