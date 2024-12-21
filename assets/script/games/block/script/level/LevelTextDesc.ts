/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-04-16 15:01:53
 */
import { _decorator, Component, Node } from 'cc';
import { emLevelTheme, UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { Label } from 'cc';
import { LanguageManager } from '../../../../data/LanguageManager';
const { ccclass, property } = _decorator;

@ccclass('LevelTextDesc')
export class LevelTextDesc extends Component {

    @property(Node)
    labTittleNode: Node = null;
    onLoad() {
        // let levelTheme = UserCollectLevelData.inst.getLevelThemeName();
        // let labTittle = this.labTittleNode.getComponent(Label);
        // switch (levelTheme) {
        //     case emLevelTheme.cat:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_cat");
        //         }
        //         break;
        //     case emLevelTheme.bear:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_bear");
        //         }
        //         break;
        //     case emLevelTheme.sheep:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_sheep");
        //         }
        //         break;
        //     case emLevelTheme.fruit:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_fruit");
        //         }
        //         break;
        //     case emLevelTheme.qixi:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_qixi");
        //         }
        //         break;
        //     case emLevelTheme.kaixue:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_kaixue");
        //         }
        //         break;
        //     case emLevelTheme.moon:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_moon");
        //         }
        //         break;
        //     case emLevelTheme.fish:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_fish");
        //         }
        //         break;
        //     default:
        //         if (labTittle) {
        //             labTittle.string = LanguageManager.translateText("theme_tittle_unknow") + levelTheme;
        //         }
        //         break;
        // }
    }

    // update(deltaTime: number) {

    // }
}

