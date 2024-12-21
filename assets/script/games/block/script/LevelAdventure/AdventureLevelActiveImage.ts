import { _decorator, Component, Node } from 'cc';
import { UserAdventureLevelData } from '../../../../data/UserAdventureLevelData';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelActiveImage')
export class LevelActiveImage extends Component {
    onLoad() {
        let curLevel = UserAdventureLevelData.inst.getMaxHistoryLevel();
        let imageIndex = Math.floor(curLevel / 6 + 1);
        let levelIndex = this.node.getSiblingIndex()+1;
        let sprite = this.node.getComponent(Sprite);
        sprite.grayscale = levelIndex > imageIndex;
    }
}