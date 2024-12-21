
import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UserHammerData } from '../../../../data/UserHammerData';
import { UserVRocketData } from '../../../../data/UserVRocketData';
import { UserHRocketData } from '../../../../data/UserHRocketData';
import { UserChangeData } from '../../../../data/UserChangeData';
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
import { UserData } from '../../../../data/UserData';
import { RemoteConfig } from '../../../../RemoteConfig/RemoteConfig';
import { kGameMode } from '../define/Enumrations';
import { SceneMode } from '../define/SceneMode';
import { PanelManager } from '../../../../panel/PanelManager';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
const { ccclass, property } = _decorator;

@ccclass('PropRewardIcon')
export class PropRewardIcon extends Component {

    @property(Node)
    guideHand: Node = null;

    start() {
        this.PlayAdventureHandGuide();
    }

    private OnClickOpenGiftPackView() {
        this.node.active = false;
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.giftPackView.path);
    }

    PlayAdventureHandGuide() {
        this.guideHand.active = true;
        let cPos = new Vec3(85, -80, 0);
        tween(this.guideHand)
            .repeatForever(
                tween()
                    .to(
                        0.5,
                        { position: new Vec3(60, -55, 0) },
                        {
                            easing: "circOut",
                        }
                    )
                    .to(0.5, { position: cPos }, { easing: "circOut" })
            )
            .start();
    }
}

