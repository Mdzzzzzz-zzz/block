/*
 * @Date: 2023-05-20 18:28:32
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-05-26 10:56:52
 */
import { Sprite } from 'cc';
import { _decorator, Component } from 'cc';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
const { ccclass, property } = _decorator;

@ccclass('LevelThemeImage')
export class LevelThemeTrophy extends Component {
    @property
    levelTheme: string = "";
    onLoad() {
        let imageSpr = this.node.getComponent(Sprite);
        let levelTheme =this.levelTheme==""? UserCollectLevelData.inst.getLevelThemeName():this.levelTheme;
        let isAllFinished = UserCollectLevelData.inst.getIsAllLevelFinishedByTheme(levelTheme);
        imageSpr.grayscale = isAllFinished == 0;
    }
}

