/*
 * @Date: 2023-05-12 20:24:37
 * @LastEditors: lzb 2589358976@qq.com
 * @LastEditTime: 2023-07-11 16:29:44
 */
import { _decorator, Component, Node } from 'cc';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelActiveImage')
export class LevelActiveImage extends Component {
    onLoad() {
        let curLevel = UserCollectLevelData.inst.getMaxHistoryLevel();
        let imageIndex = Math.floor(curLevel / 6 + 1);
        let levelIndex = this.node.getSiblingIndex()+1;
        let sprite = this.node.getComponent(Sprite);
        sprite.grayscale = levelIndex > imageIndex;
    }
}

