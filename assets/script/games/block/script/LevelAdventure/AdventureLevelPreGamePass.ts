/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-28 15:35:26
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
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelGamePreGamePass")
export class AdventureLevelGamePreGamePass extends PanelBase<any> {
    @property(Label)
    label: Label = null;
    @property(Node)
    itemNode: Node = null;
    @property(Node)
    scoreNode: Node = null;
    @property(Node)
    conditionNode: Node = null;
    @property(Node)
    rewardNode: Node = null;

    @property(Animation)
    conditionAnimNode: Animation = null;
    @property(Animation)
    tittleAnimNode: Animation = null;

    conditionMap: Map<number, LevelConditionDiamondItem>;

    start() {
        if (SceneMode.gameMode == kGameMode.daily_challenge) {
            this.scheduleOnce(() => {
                this.closeSelf();
                let cfg = AssetInfoDefine.prefab.dailyChallengeGamePass;
                PanelManager.inst.addPopUpView(cfg.path, this.data);
            }, 1.5);
        } else {
            this.scheduleOnce(() => {
                this.closeSelf();
                let cfg = AssetInfoDefine.prefab.adventureLevelPass;
                PanelManager.inst.addPopUpView(cfg.path, this.data);
            }, 1.5);
        }

    }
    protected onSetData(value: any): void {
        this.itemNode.destroyAllChildren();
        this.conditionAnimNode.play();
        this.tittleAnimNode.play();
        this.conditionMap = new Map<number, LevelConditionDiamondItem>();
        let targetScore = this.data.manager.targetScore;
        if (this.data.manager.conditionType == emLevCondition.Score) {
            // 得分
            this.label.string = targetScore;
            this.scoreNode.active = false;
            this.itemNode.active = false;
            this.scoreNode.setScale(0.6, 0.6, 1);
            tween(this.scoreNode)
                .delay(0.083)
                .call(() => {
                    this.scoreNode.active = true;
                })
                .to(0.167, { scale: new Vec3(1.4, 1.4, 1) }, { easing: "sineOut" })
                .to(0.133, { scale: Vec3.ONE }, { easing: "sineOut" })
                .start();
        } else if (this.data.manager.conditionType == emLevCondition.Collect) {
            // 收集
            this.itemNode.active = true;
            // this.conditionAnimNode.node.active = true;
            this.scoreNode.active = false;
            let collects = this.data.manager.targetCollects; // map
            let num = 0;
            let posSize = collects.size - 1;
            if (posSize > DiamondDisplayLoc.length - 1) {
                posSize = DiamondDisplayLoc.length - 1;
            }
            let posArray = DiamondDisplayLoc[collects.size - 1];
            collects.forEach((value, index) => {
                let cItemNode = instantiate(this.conditionNode);
                //cItemNode.setPosition(0, 0, 0)
                // cItemNode.setPosition(DiamondDisplayLoc[collects.size()][index])
                let conditionItem = cItemNode.getComponent(LevelConditionDiamondItem);
                conditionItem.setImageType(index);
                // cItemNode.setScale(1.2, 1.2, 1);
                conditionItem.node.active = true;
                conditionItem.node.setPosition(new Vec3(0, 32, 0));
                conditionItem.node.setParent(this.itemNode);
                this.conditionMap.set(index, conditionItem);
                if (num > posArray.length - 1) {
                    num = posArray.length - 1;
                }
                let pos = posArray[num];
                num++;
                let twPos = tween(cItemNode).to(0.167, { position: pos }, { easing: "sineOut" });
                let twScale = tween(cItemNode)
                    .to(0.167, { scale: new Vec3(1.4, 1.4, 1) }, { easing: "sineOut" })
                    .to(0.133, { scale: Vec3.ONE }, { easing: "sineOut" })
                    .start();
                tween(cItemNode).parallel(twPos, twScale).start();
            });
            let layout = this.itemNode.getComponent(Layout);
            layout && layout.updateLayout(true);
            this.itemNode.active = true;
        }
        if (SceneMode.gameMode == kGameMode.adventure_level) {
            let inst = UserAdventureLevelData.inst;
            mk.sdk.instance.reportBI(biEventId.level_finish, {
                proj_level: value.level,
                proj_result: 0,
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
        }
    }

    // update(deltaTime: number) {

    // }
}
