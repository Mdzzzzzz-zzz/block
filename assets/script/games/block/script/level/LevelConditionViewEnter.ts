import { _decorator, Node, UITransform, instantiate } from 'cc';
import { LevelConditionView } from './LevelConditionView';
import { Vec3 } from 'cc';
import { LevelConditionViewScene } from './LevelConditionViewScene';
import { BlockEventManager } from '../../../../event/BlockEventManager';
import { BlockEventType } from '../define/Event';
import { LevelConditionDiamondItem } from './LevelConditionDiamondItem';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
const { ccclass, property } = _decorator;

@ccclass('LevelConditionViewEnter')
export class LevelConditionViewEnter extends LevelConditionView {
    @property(Node)
    public targetConditionView: Node = null;
    @property(Node)
    flyScoreNode: Node = null;

    flyDelay: number = 1;
    originScorePosition = Vec3.ZERO;
    start(): void {
        super.start();
        this.originScorePosition = this.flyScoreNode.position.clone();
    }

    onInitScore(): void {
        mk.audio.playSubSound(AssetInfoDefine.audio.diamon_out);
        this.scheduleOnce(() => {
            if (this.targetConditionView && this.targetConditionView.isValid) {
                let view = this.targetConditionView.getComponent(LevelConditionViewScene);
                let tarNode = view.getTargetScoreNode();
                if (tarNode) {
                    this.moveToTarget(tarNode, this.flyScoreNode, () => {
                        if(this.flyScoreNode&&this.flyScoreNode.isValid)
                        {
                            mk.audio.playSubSound(AssetInfoDefine.audio.diamond_collect);
                            BlockEventManager.instance.emit(BlockEventType.EVENT_TATGET_SCORE_SHOW, 0, this.manager.targetScore);
                            //隐藏目标展示
                            this.flyScoreNode.setScale(1, 1, 1);
                            this.flyScoreNode.setPosition(this.originScorePosition);
                            this.flyScoreNode.active = false;
                            if(this.node&&this.node.isValid)
                            {
                                if (this.node.active) {
                                    this.node.active = false;
                                }
                            }
                        }
                    });
                }
            }
        }, this.flyDelay);
    }


    onInitCollect(): void {
        mk.audio.playSubSound(AssetInfoDefine.audio.diamon_out);
        this.scheduleOnce(() => {
            if (this.targetConditionView && this.targetConditionView.isValid) {
                let view = this.targetConditionView.getComponent(LevelConditionViewScene);
                let collectMaps = this.conditionMap;
                let num = 0;
                collectMaps.forEach((element, index) => {
                    if (element && element.isValid) {
                        element.showNumInfo(false);
                        let tarNode = view.getTargetCollectNode(index);
                        let flyRoot = element.node.parent.parent;
                        let localPosition = flyRoot.getComponent(UITransform).convertToNodeSpaceAR(element.node.worldPosition);
                        //有动态布局所以复制一个节点放到上层
                        let node = instantiate(element.node);
                        node.setParent(flyRoot);
                        node.setPosition(localPosition);
                        if (tarNode && tarNode.isValid) {
                            element.node.active = false;
                            this.scheduleOnce(() => {
                                if (tarNode && tarNode.isValid) {
                                    this.moveToTarget(tarNode, node, () => {
                                        mk.audio.playSubSound(AssetInfoDefine.audio.diamond_collect);
                                        if (node && node.isValid) {
                                            node.destroy();//销毁克隆的节点
                                        }
                                        if (tarNode && tarNode.isValid) {
                                            let tarView = tarNode.getComponent(LevelConditionDiamondItem);
                                            if (tarView && tarView.isValid) {
                                                tarView.onFlyAnimFinish();
                                                if (this.node.active) {
                                                    this.node.active = false;
                                                }
                                            }
                                        }
                                    });
                                }
                            }, num * 0.1);
                        }
                    }
                    num += 1;
                });
            }
        }, this.flyDelay);
    }
}

