import { _decorator, Node, UITransform, instantiate, Animation, tween, UIOpacity, Layout } from "cc";
import { AdventureLevelConditionView } from "./AdventureLevelConditionView";
import { Vec3 } from "cc";
import { AdventureLevelConditionViewScene } from "./AdventureLevelConditionViewScene";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BlockEventType } from "../define/Event";
import { LevelConditionDiamondItem } from "../level/LevelConditionDiamondItem";
import { mk } from "../../../../MK";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { BlockConstData } from "../define/BlockConstData";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelConditionViewEnter")
export class AdventureLevelConditionViewEnter extends AdventureLevelConditionView {
    @property(Node)
    public targetConditionView: Node = null;
    @property(Node)
    flyScoreNode: Node = null;

    flyDelay: number = 0.58;
    originScorePosition = Vec3.ZERO;

    anim: Animation;
    start(): void {
        super.start();
        this.originScorePosition = this.flyScoreNode.position.clone();
        this.isStarted = true;
        // if (this.playType == 1) {
        //     this.playScore();
        // } else if (this.playType == 2) {
        //     this.playCollect();
        // }
        this.moveToTarget = this.moveToTarget.bind(this);
    }

    private isStarted: boolean = false;
    private playType: number = 0;

    onInitScore(): void {
        this.playType = 1;
        this.node.active = true;
        this.playScore();

        // if (this.isStarted) {
        //     this.playScore();
        // }
    }
    private playScore() {
        mk.audio.playSubSound(AssetInfoDefine.audio.diamon_out);

        if (!this.anim) {
            this.anim = this.getComponent(Animation);
            this.anim.onLoad();
        }
        if (this.anim) {
            this.anim.play("LevelConditionViewEnter_score_anim");
        }
        this.scheduleOnce(() => {
            if (this.targetConditionView && this.targetConditionView.isValid) {
                let view = this.targetConditionView.getComponent(AdventureLevelConditionViewScene);
                let tarNode = view.getTargetScoreNode();
                if (tarNode) {
                    let flyAnim = this.flyScoreNode.getComponent(Animation);
                    if (flyAnim) {
                        flyAnim.once(Animation.EventType.FINISHED, () => {
                            mk.audio.playSubSound(AssetInfoDefine.audio.diamond_collect);
                            BlockEventManager.instance.emit(
                                BlockEventType.EVENT_TATGET_SCORE_SHOW,
                                0,
                                this.manager.targetScore
                            );
                            //隐藏目标展示
                            // this.flyScoreNode.setScale(1, 1, 1);
                            this.flyScoreNode.setPosition(this.originScorePosition);
                            this.flyScoreNode.active = false;
                            if (this.node && this.node.isValid) {
                                if (this.node.active) {
                                    this.node.active = false;
                                }
                            }

                        });
                        flyAnim.play();
                    }



                    // this.moveToTarget(tarNode, this.flyScoreNode, () => {
                    //     if (this.flyScoreNode && this.flyScoreNode.isValid) {
                    //     }
                    // });
                }
            }
        }, this.flyDelay);
    }

    onInitCollect(): void {
        this.playType = 2;

        this.playCollect();

        // if (this.isStarted) {
        //     this.playCollect();
        // }
    }

    playCollect() {
        mk.audio.playSubSound(AssetInfoDefine.audio.diamon_out);
        if (!this.anim) {
            this.anim = this.getComponent(Animation);
            this.anim.onLoad();
        }
        if (this.anim) {

            this.node.active = true;
            this.rootDiamondCondition.active = true;
            let layout = this.rootDiamondCondition.getComponent(Layout);
            layout && layout.updateLayout(true);

            layout.node.children.forEach(element => {
                if (element && element.isValid) {
                    //console.log("[element isValid] pos " + element.worldPosition.toString());
                }
            });

            this.anim.play("LevelConditionViewEnter_diamond_anim")
            this.scheduleOnce(() => {

                let collectMaps = this.conditionMap;
                collectMaps.forEach((element, index) => {
                    if (element && element.isValid) {
                        element.node.active = true;
                        element.showNumInfo(true);
                        // element.node.scale = new Vec3(0, 0, 1);  
                        let elementWorldPos = element.node.getWorldPosition();
                        element.setOldLayoutParent(element.node.parent.parent);
                        element.node.parent = element.node.parent.parent.parent.parent;
                        element.node.setWorldPosition(elementWorldPos);
                        //console.log("element world pos: " + elementWorldPos.toString());
                        element.playAppearAnim();
                    }
                });

            }, 0.05)


        }
        this.scheduleOnce(() => {
            if (this.targetConditionView && this.targetConditionView.isValid) {
                let view = this.targetConditionView.getComponent(AdventureLevelConditionViewScene);
                let collectMaps = this.conditionMap;
                let num = 0;
                collectMaps.forEach((element, index) => {
                    if (element && element.isValid) {
                        // element.showNumInfo(false);
                        // element.node.scale = new Vec3(0.5 ,0.5 ,0.5);
                        element.useOldLayoutParent();
                        let tarNode = view.getTargetCollectNode(index);
                        let flyRoot = element.node.parent.parent;
                        let localPosition = flyRoot
                            .getComponent(UITransform)
                            .convertToNodeSpaceAR(element.node.worldPosition);
                        //有动态布局所以复制一个节点放到上层
                        let node = instantiate(element.node);
                        node.setParent(flyRoot);
                        node.setPosition(localPosition);
                        node.active = true;
                        if (tarNode && tarNode.isValid) {
                            element.node.active = false;
                            this.scheduleOnce(() => {
                                if (tarNode && tarNode.isValid) {
                                    this.moveToTarget(tarNode, node, () => {
                                        mk.audio.playSubSound(AssetInfoDefine.audio.diamond_collect);
                                        if (node && node.isValid) {
                                            this.scheduleOnce(() => {
                                                if (tarNode && tarNode.isValid) {
                                                    let tarView = tarNode.getComponent(LevelConditionDiamondItem);
                                                    tarView.showNumInfo(true);
                                                    tarNode.getComponent(UIOpacity).opacity = 255;
                                                    tarView.restoreScale();
                                                    tarView.onFlyAnimFinish();
                                                    if (this.node.active) {
                                                        this.node.active = false;
                                                    };
                                                    node.destroy(); //销毁克隆的节点
                                                }
                                            }, 0);
                                        }
                                    });
                                }
                            }, 0);
                        }
                    }
                    num += 1;
                });
            }
        }, 0.3833);
    }

    public moveToTarget(targetNode: Node, flyNode: Node, callBack: Function) {
        let dest = targetNode.worldPosition;
        let pt = flyNode.parent.getComponent(UITransform);
        //console.log("world Pos: " + dest.toString());
        dest = pt.convertToNodeSpaceAR(dest);
        //console.log("NodeSpaceAR: " + dest.toString());
        if (!flyNode.active) {
            flyNode.active = true;
        }
        // flyNode.getComponent(LevelConditionDiamondItem).showNumInfo(false);

        tween(flyNode).delay(0.1)
            .parallel(
                tween().to(0.25, { position: new Vec3(dest.x, dest.y) }, { easing: "sineOut" }),
                tween().to(0.133, { scale: new Vec3(BlockConstData.CollectScale1.x, BlockConstData.CollectScale1.y, 1) })
                    .to(0.117, { scale: new Vec3(BlockConstData.CollectScale2.x, BlockConstData.CollectScale2.y, 1) })
                // tween().delay(0.25).call(()=> {
                //     callBack && callBack.call(this);
                // })          
            ).call(() => {
                callBack && callBack.call(this);
            })
            .start();
        let flyNodeNum = flyNode.getChildByPath("lab_num").getComponent(UIOpacity)
        flyNodeNum.opacity = 0;

        let flyNodeShadow = flyNode.getChildByPath("shadow").getComponent(UIOpacity)
        flyNodeShadow.opacity = 0;

    }
}
