import { _decorator, Component, Node } from 'cc';
import { mk } from '../../../../MK';
import { ProcedureToHome } from '../../../../fsm/state/ProcedureToHome';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
import { kGameMode } from '../define/Enumrations';
import { SceneMode } from '../define/SceneMode';
const { ccclass, property } = _decorator;

@ccclass('SceneTheme')
export class SceneTheme extends Component {
    start() {

    }
    onClickHome() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToHome, "level_select");
    }
    // update(deltaTime: number) {
        
    // }
}

