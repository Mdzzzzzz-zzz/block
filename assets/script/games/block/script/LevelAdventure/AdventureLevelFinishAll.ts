import { _decorator, Sprite, Label, Animation, Node, tween, Vec3, UITransform, easing } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { AdventureLevelGame } from "../logic/AdventureLevelGame";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { mk } from "../../../../MK";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { ResManager } from "../../../../resource/ResManager";
import { ProcedureToAdventureLevelSelectV2 } from "../../../../fsm/state/ProcedureToAdventureLevelSelectV2";

const { ccclass, property } = _decorator;

@ccclass("AdventureLevelFinishAll")
export class AdventureLevelFinishAll extends PanelBase<{ bookNode: Node, batch: number }> {
    @property(Sprite)
    frameSprite: Sprite = null;

    @property(Sprite)
    imgSprite: Sprite = null;

    @property(Label)
    seasonNumLabel: Label = null;

    @property(Node)
    stickerNode: Node = null;

    private anim: Animation;
    start() {
        
    }

    onSetData(value: {bookNode: Node, batch: number}) {
        this.anim = this.getComponent(Animation);
        let batchNum = value.batch;// UserAdventureLevelData.inst.getLevelBatchNumber();
        if (this.seasonNumLabel) this.seasonNumLabel.string = batchNum.toString();
        ResManager.getInstance()
            .loadSpriteFrame("res/texture/adventure/UI_Stickerreward_fish" + batchNum.toString() + "light", "block")
            .then((sprite) => {
                this.frameSprite.spriteFrame = sprite;
            });

        ResManager.getInstance()
            .loadSpriteFrame("res/texture/adventure/UI_Stickerreward_fish" + batchNum.toString(), "block")
            .then((sprite) => {
                this.imgSprite.spriteFrame = sprite;
            });
        if (this.anim) {
            this.anim.play("LevelFinishedAll_enter_anim");
        }
    }

    onclick() {
        //播放界面退出动画
        if (this.anim) {
            // this.anim.once(Animation.EventType.FINISHED, () => {
            // });
            this.anim.play("LevelFinishedAll_exit_anim");
        }

        let flyTargetNode = this.data.bookNode;
        if (flyTargetNode) {
            let position = this.stickerNode.position;
            let flyPos = this.stickerNode.parent
                .getComponent(UITransform)
                .convertToNodeSpaceAR(flyTargetNode.worldPosition);
            tween(this.stickerNode)
                .to(0.133, { position: new Vec3(position.x, position.y - 60, 0) }, { easing: "sineOut" })
                .to(0.3, { position: flyPos })
                .call(() => {
                    this.closeSelf();
                }).start();
            //book 反馈
            this.scheduleOnce(() => {
                if (flyTargetNode) {
                    let anim = flyTargetNode.getComponent(Animation);
                    if (anim) {
                        anim.stop();
                    }
                    flyTargetNode.setScale(Vec3.ONE);
                    tween(flyTargetNode)
                        .to(0.05, { scale: new Vec3(1.15, 1.15, 1) }, { easing: "sineInOut" })
                        .to(0.1, { scale: Vec3.ONE }, { easing: "sineInOut" })
                        .call(() => {
                            if (flyTargetNode && flyTargetNode.isValid) {
                                let anim = flyTargetNode.getComponent(Animation);
                                if (anim) {
                                    anim.play();
                                }
                            }
                        }).start();
                }
            }, 0.383);
        }
        SceneMode.gameMode = kGameMode.none;
        // mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "block");
    }

    // start() {
    //     this.scheduleOnce(() => {
    //         this.closeSelf();
    //         let cfg = AssetInfoDefine.prefab.levelPass;
    //         PanelManager.inst.addPopUpView(cfg.path, this.data);
    //     }, 1.5);
    // }
}
