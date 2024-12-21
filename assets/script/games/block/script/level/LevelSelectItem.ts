/*
 * @Date: 2023-06-14 16:46:44
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-21 14:11:48
 */
import { Color } from 'cc';
import { _decorator, Component, Node, Label } from 'cc';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
import { kGameMode } from '../define/Enumrations';
import { ProcedureToLevel } from '../../../../fsm/state/ProcedureToLevel';
import { SceneMode } from '../define/SceneMode';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { biEventId } from '../../../../Boot';
import * as env from 'cc/env';
import { LanguageManager } from '../../../../data/LanguageManager';
const { ccclass, property } = _decorator;

@ccclass('LevelSelectItem')
export class LevelSelectItem extends Component {
    // @property(Node)
    // ndCurrent:Node = null;
    @property(Node)
    ndHighlight: Node = null;
    labLevel: Label = null;


    private lev: number = 0;
    private isCurrent: boolean;
    private maxLevel: number;
    initData(lev: number, highlight: boolean, isCurrent: boolean, maxLevel: number) {
        // this.labLevel.string = lev.toString();
        this.lev = lev;
        this.isCurrent = isCurrent;
        this.maxLevel = maxLevel;
        this.ndHighlight.active = highlight;
        this.labLevel.color = highlight ? Color.WHITE : Color.GRAY;
        this.labLevel.string = lev.toString();
        this.node.setScale(1, 1, 1);
        // if (this.isCurrent) {
        //     this.node.setScale(1, 1, 1);
        // } else {
        //     if (lev % 6 == 1 || lev == maxLevel) {
        //         this.node.setScale(1.2, 1.2, 1.2);
        //     }
        //     else {
        //         this.node.setScale(1, 1, 1);
        //     }
        // }
        // this.ndCurrent.active = isCurrent;
        if (env.PREVIEW) {
            this.node.on(Node.EventType.TOUCH_END, this.onClickLevelItem, this);
        }
    }
    onClickLevelItem() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        const param = {
            content: LanguageManager.translateText("tip_start_level").formatSafe(this.lev),
            title: LanguageManager.translateText("tip_tittle"),
            cancelBtnLabel: LanguageManager.translateText("btn_cancel"),
            confirmBtnLabel: LanguageManager.translateText("btn_super"),
            confirmCallback: () => {
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                SceneMode.gameMode = kGameMode.adventure_level;
                UserCollectLevelData.inst.updateHistoryLevel(this.lev);
                mk.fsm.changeState(ProcedureToLevel, "level_select_item");
                //mk.sdk.instance.reportBI(biEventId.level_replay, { level: this.lev, theme: UserCollectLevelData.inst.getLevelThemeName() });
            },
            cancelCallback: () => {
                // this.onClickRelife();
            }
        }
        mk.showView(mk.uiCfg.prefab.dialog, null, param);
    }
}

