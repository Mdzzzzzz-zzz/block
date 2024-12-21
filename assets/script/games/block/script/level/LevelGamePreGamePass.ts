/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-07 20:04:22
 */
import { _decorator, Component, Node } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { UserCollectLevelData } from "../../../../data/UserCollectLevelData";
import { biEventId } from "../../../../Boot";
import { mk } from "../../../../MK";
const { ccclass, property } = _decorator;

@ccclass("LevelGamePreGamePass")
export class LevelGamePreGamePass extends PanelBase<any> {
    start() {
        this.scheduleOnce(() => {
            this.closeSelf();
            let cfg = AssetInfoDefine.prefab.levelPass;
            PanelManager.inst.addPopUpView(cfg.path, this.data);
        }, 1.5);
    }
    protected onSetData(value: any): void {
        let inst = UserCollectLevelData.inst;
        mk.sdk.instance.reportBI(biEventId.level_finish, {
            proj_level: value.level,
            proj_result: 0,
            proj_stage: inst.getLevelThemeName(),
            proj_round: this.data.manager.getRound(),
        });
    }

    // update(deltaTime: number) {

    // }
}
