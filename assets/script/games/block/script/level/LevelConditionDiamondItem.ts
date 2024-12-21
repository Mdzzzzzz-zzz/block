/*
 * @Date: 2023-07-07 11:11:52
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-14 23:24:55
 */
import { UITransform, tween, Vec3, Animation, UIOpacity, Color } from "cc";
import { _decorator, Component, Node, Label, Sprite } from "cc";
import { SpriteAtlas } from "cc";
import { BlockConstData } from "../define/BlockConstData";
const { ccclass, property } = _decorator;

@ccclass("LevelConditionDiamondItem")
export class LevelConditionDiamondItem extends Component {
    @property(Label)
    labNum: Label = null;
    @property(Node)
    sprImage: Node;
    @property(Node)
    ndComplete: Node = null;
    @property(SpriteAtlas)
    atlasBlocks: SpriteAtlas = null;

    @property(Node)
    collectAnimNode: Node = null;

    @property(Sprite)
    collectAnimGemSd: Sprite = null;

    @property(Sprite)
    collectAnimGemLe: Sprite = null;

    @property(Sprite)
    collectAnimGem: Sprite = null;

    // @property(Node)
    // collectAnimDoneOne: Node = null;

    oldLayoutParent: Node = null;

    public tarCount: number;
    public curCount: number;

    start() {
        this.sprImage.getComponent(Sprite).enabled = true;
        if (this.collectAnimNode) {
            this.collectAnimNode.active = false;
        }

        // if (this.collectAnimDoneOne) {
        //     this.collectAnimDoneOne.active = false;
        // }

        let anim = this.getComponent(Animation);
        if (anim && this.needShowAppear) {
            anim.play("LevelConditionDiamondItem_appear_anim");
        }
    }

    setOldLayoutParent(node: Node) {
        this.oldLayoutParent = node;
    }

    useOldLayoutParent() {
        if (!this.oldLayoutParent) {
            return;
        }

        let elementWorldPos = this.node.getWorldPosition();

        this.node.parent = this.oldLayoutParent;
        this.node.setWorldPosition(elementWorldPos);
    }


    public showNumInfo(isShow) {
        this.labNum.node.active = isShow;
    }
    public setImageType(imageType: number) {
        let spriteFrame = this.atlasBlocks.getSpriteFrame(`b${imageType}`);
        if (spriteFrame) {
            this.sprImage.getComponent(Sprite).spriteFrame = spriteFrame;
            if (this.collectAnimGem) {
                this.collectAnimGem.spriteFrame = spriteFrame;
            }
            if (this.collectAnimGemSd) {
                this.collectAnimGemSd.spriteFrame = spriteFrame;
            }

            if (this.collectAnimGemLe) {
                let leSpriteFrame = this.atlasBlocks.getSpriteFrame(BlockConstData.DimaondFlyLe[`b${imageType}`]);
                if (leSpriteFrame) {
                    this.collectAnimGemLe.spriteFrame = leSpriteFrame;
                }
            }
        }
        this.ndComplete.active = false;
    }
    public playFkAnim() {
        let anim = this.getComponent(Animation);
        if (anim) {
            anim.play("LevelConditionDiamondItem_fk_anim");
        }
    }

    playAppearAnim() {
        let anim = this.getComponent(Animation);
        if (anim) {
            console.log("print World pos: " + this.node.worldPosition);
            anim.play("LevelConditionDiamondItem_appear_anim");
        }
    }

    restoreScale() {
        this.node.scale = new Vec3(1, 1, 1);
    }

    public onFlyAnimFinish() {
        // this.updateProgress(this.curCount, this.tarCount);
        this.playFkAnim();
        this.updateRestOnly(this.curCount, this.tarCount, true);
    }
    public updateProgress(cur: number, tar: number) {
        this.curCount = cur;
        this.tarCount = tar;

        if (cur >= tar) {
            // this.showNumInfo(false);
            if (this.ndComplete) {
                this.showNumInfo(false);
                this.restoreScale();
                const ani = this.ndComplete.getComponent(Animation);
                this.scheduleOnce(() => {
                    this.ndComplete.active = true;
                    ani.play();
                }, 0.3);
            } else {
                //
                this.showNumInfo(true);
                this.labNum.string = `${cur}/${tar}`;
            }
            // console.error("完成状态：1");
        } else {
            this.showNumInfo(true);
            if (this.ndComplete) {
                this.ndComplete.active = false;
            }
            //显示的是剩余数量还是进度？
            this.labNum.string = `${cur}/${tar}`;
            // console.error("完成状态：2");
        }
    }

    public updateRestOnly(cur: number, tar: number, isShowNumInfo: boolean = false) {
        this.curCount = cur;
        this.tarCount = tar;

        if (cur >= tar) {
            // this.showNumInfo(false);
            if (this.ndComplete) {
                this.showNumInfo(false);
                this.ndComplete.active = true;
                const ani = this.ndComplete.getComponent(Animation);
                ani.play("LevelGameOver_diamond_yesapper_anim");
                this.scheduleOnce(() => {
                    this.ndComplete.getComponent(Sprite).color = new Color(255, 255, 255, 255);
                }, 0.3);
            } else {
                //
                this.showNumInfo(true);
                this.labNum.string = `${tar - cur}`;
            }
            // console.error("完成状态：1");
        } else {
            this.showNumInfo(true);
            if (this.ndComplete) {
                this.ndComplete.active = false;
            }
            //显示的是剩余数量还是进度？
            this.labNum.string = `${tar - cur}`;
            // console.error("完成状态：2");
        }

        this.labNum.string = `${tar - cur}`;
    }

    public playFlyDiamondAppearAnim() {
        if (this.collectAnimNode) {
            this.collectAnimNode.active = true;
            // this.sprImage.active = false;
            this.sprImage.getComponent(Sprite).enabled = false;
            let anim = this.collectAnimNode.getComponent(Animation);
            anim.play("eui_gem_appear_anim");
            // setTimeout(() => {
            //     anim.play("eui_gem_fly_anim");
            // }, 300)
        }
    }

    public playFlyDiamondFlyAnim() {
        if (this.collectAnimNode) {
            this.collectAnimNode.active = true;
            let anim = this.collectAnimNode.getComponent(Animation);
            anim.play("eui_gem_fly_anim");
        }
    }

    private needShowAppear = false;
    public moveToTarget(targetNode: Node, cur: number, tar: number) {
        this.showNumInfo(false);
        this.needShowAppear = true;
        let dest = targetNode.worldPosition;

        let pt = this.node.parent.getComponent(UITransform);
        dest = pt.convertToNodeSpaceAR(dest);

        let action = tween(this.node)
            .to(0.133, { scale: BlockConstData.CollectScale1 })
            .to(0.117, { scale: BlockConstData.CollectScale2 })
            .delay(0.3)
            .parallel(
                tween(this.node).to(0.25, { position: new Vec3(dest.x, dest.y) }, { easing: "sineInOut" }),
                tween(this.node).call(() => { })
            )
            .to(0.1, { scale: Vec3.ZERO });
        tween(this.node)
            .sequence(action)
            .then(
                tween(this.node).call(() => {
                    if (targetNode) {
                        //飞到目标点后更新进度
                        let condition = targetNode.getComponent(LevelConditionDiamondItem);
                        // condition.updateProgress(cur, tar);
                        condition.updateRestOnly(cur, tar);
                        this.scheduleOnce(() => {
                            let targetAnim = this.getComponent(Animation);
                            if (targetAnim) {
                                targetAnim.play("LevelConditionDiamondItem_fk_anim");
                            }
                        }, 0.1);
                    }
                })
            )
            .start();
    }
}
