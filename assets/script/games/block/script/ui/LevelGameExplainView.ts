
import { _decorator, Component, Node } from "cc";
import { mk } from "../../../../MK";
import PanelBaseNoMask from '../../../../panel/PanelBaseNoMask';
import { BlockEventType } from "../define/Event";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
const { ccclass, property } = _decorator;

@ccclass('LevelGameExplainView')
export class LevelGameExplainView extends PanelBaseNoMask<any> {
    @property(Node)
    scoreNode: Node = null;

    @property(Node)
    collectNode: Node = null;

    start() {
        this.scoreNode.active = false;
        this.collectNode.active = false;
        if (SceneMode.gameMode == kGameMode.adventure_level) {
            if (UserAdventureLevelData.inst.firstStartBatchOneLevelOne == 0) {
                UserAdventureLevelData.inst.firstStartBatchOneLevelOne = 1;
                this.scoreNode.active = true;
                this.collectNode.active = false;
            } else if (UserAdventureLevelData.inst.firstStartBatchOneLevelTwo == 0) {
                UserAdventureLevelData.inst.firstStartBatchOneLevelTwo = 1
                this.scoreNode.active = false;
                this.collectNode.active = true;
            } 
        } else if (SceneMode.gameMode == kGameMode.daily_challenge) {
            if (UserDailyChallengeData.inst.firstDailyChallengeFinish == 0) {
                UserDailyChallengeData.inst.firstDailyChallengeFinish = 1;
                this.scoreNode.active = false;
                this.collectNode.active = true;
            }
        }
    }
    
    onClickClose() {
        mk.sendEvent(BlockEventType.EVENT_ENTER_ADVENTURE_LEVEL);
        this.closeSelf();
        
    }
}