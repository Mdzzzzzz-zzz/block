import { Sprite } from 'cc';
import { EventTouch } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
import { kGameMode } from '../define/Enumrations';
import { SceneMode } from '../define/SceneMode';
import { ProcedureToLevelSeclect } from '../../../../fsm/state/ProcedureToLevelSeclect';
import { ProcedureToGame } from '../../../../fsm/state/ProcedureToGame';
const { ccclass, property } = _decorator;

@ccclass('LevelChapter')
export class LevelChapterItem extends Component {

    @property
    levelTheme: string = "cat";
    @property(Node)
    trophyNode: Node = null;
    private trophySpr: Sprite;
    start() {
        //设置奖杯的状态
        this.trophySpr = this.trophyNode.getComponent(Sprite);
        let isAllFinished = UserCollectLevelData.inst.getIsAllLevelFinishedByTheme(this.levelTheme);
        this.trophySpr.grayscale = isAllFinished == 0;
    }
    onClickLevelTheme(evt: EventTouch) {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        UserCollectLevelData.inst.setLevelThemeName(this.levelTheme);
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToLevelSeclect, "LevelChapterItem");
    }
    onClickClassical() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.endless;
        mk.fsm.changeState(ProcedureToGame, "block");
    }
}

