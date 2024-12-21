import { _decorator, Component, instantiate, Label, Layout, Node, Tween, tween, UIOpacity } from "cc";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { emLevCondition, AdventureLevelGame } from "../logic/AdventureLevelGame";
import { LevelConditionDiamondItem } from "../level/LevelConditionDiamondItem";
import { BlockEventType } from "../define/Event";
import { UITransform, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelConditionViewNew")
export class AdventureLevelConditionViewNew extends Component {
    @property(Label)
    labLevel: Label = null;
    @property(Node)
    rootScoreCondition: Node = null;
    @property(Label)
    labScore: Label = null;
    @property(Label)
    labTargetScore: Label = null;
    @property(Node)
    rootDiamondCondition: Node = null;
    @property(Node)
    conditionItem: Node = null;

    @property
    isTargetDisplayed: boolean = false;

    @property
    isInScene: boolean = false;

    @property
    diamondScale: number = 1.0;

    @property
    isShowDiamondWhenInit: boolean = true;

    protected conditionMap: Map<number, LevelConditionDiamondItem>;
    protected score: number;
    protected manager: AdventureLevelGame;

    fromGameOver: boolean = false;
    public getTargetScoreNode(): Node {
        return this.labTargetScore.node ? this.labTargetScore.node : this.node;
    }

    public getTargetCollectNode(key: number): Node {
        let item = this.conditionMap.get(key);
        if (item) {
            return item.node;
        }
        return this.node;
    }
    public initView(manager: AdventureLevelGame) {
        this.manager = manager;
        if (this.labLevel) {
            this.labLevel.string = `Level ${this.manager.levelConfig.id}`;
        }
        this.initConditions();
    }
    start() {
        BlockEventManager.instance
            .listen(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.setScore, this)
            .listen(BlockEventType.EVENT_SCENE_PLAY_SET_COLLECT, this.setCollect, this);
    }
    onDestroy() {
        BlockEventManager.instance
            .unlisten(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.setScore, this)
            .unlisten(BlockEventType.EVENT_SCENE_PLAY_SET_COLLECT, this.setCollect, this);
    }

    initConditions() {
        if (!this.conditionItem) {
            console.error("异常的过关条件view:LevelConditionView ");
            return;
        }
        this.rootDiamondCondition.active = false;
        this.rootScoreCondition.active = false;

        this.unscheduleAllCallbacks();
        if (this.manager.conditionType == emLevCondition.Score) {
            this.restoreOrigin();
            this.score = 0;
            this.labScore.string = "0";
            this.labTargetScore.string = this.manager.targetScore + "";

            if (!this.isInScene) {
                if (this.manager.scoreHelper.score > 999) {
                    this.labScore.fontSize = 25;
                } else {
                    this.labScore.fontSize = 30;
                }
                this.setScore(this.manager.scoreHelper.score);
            }
            if (this.isTargetDisplayed) {
                this.labTargetScore.node.active = true;
            }
            this.onInitScore();
        } else if (this.manager.conditionType == emLevCondition.Collect) {
            this.rootDiamondCondition.destroyAllChildren();
            let op = this.rootDiamondCondition.getComponent(UIOpacity);
            if (!op) {
                op = this.rootDiamondCondition.addComponent(UIOpacity);
            }
            op.opacity = 255;
            let keyArr = [];
            this.manager.targetCollects.forEach((value, key) => {
                keyArr.push(key);
            });
            keyArr.sort((a, b) => {
                return a - b;
            });
            this.conditionMap = new Map<number, LevelConditionDiamondItem>();
            if (keyArr.length > 3 && this.fromGameOver) {
                this.rootDiamondCondition.setScale(0.75, 0.75, 1);
                this.rootDiamondCondition.getComponent(Layout).spacingX = 35;
                this.fromGameOver = false;
            } else {
                this.rootDiamondCondition.setScale(1, 1, 1);
                this.rootDiamondCondition.getComponent(Layout).spacingX = 70;
            }
            for (let index = 0; index < keyArr.length; index++) {
                let key = keyArr[index];
                let targetNum = this.manager.targetCollects.get(key);
                let currentNum = this.manager.currentCollects.get(key);
                let itemNode = instantiate(this.conditionItem);
                itemNode.setScale(this.diamondScale, this.diamondScale, 1);
                // itemNode.setScale(1.2, 1.2, 1)
                let conditionItem = itemNode.getComponent(LevelConditionDiamondItem);
                conditionItem.setImageType(key);
                // conditionItem.updateProgress(currentNum, targetNum);
                conditionItem.updateRestOnly(currentNum, targetNum);
                conditionItem.node.active = true;
                if (!this.isShowDiamondWhenInit) {
                    conditionItem.node.scale = new Vec3(0, 0, 1);
                }
                conditionItem.node.setParent(this.rootDiamondCondition);
                this.conditionMap.set(key, conditionItem);
            }
            let layout = this.rootDiamondCondition.getComponent(Layout);
            layout && layout.updateLayout(true);
            this.rootDiamondCondition.active = true;
            this.onInitCollect();


        }
    }
    onInitScore() { }
    onInitCollect() { }
    SetFromGameOver(status: boolean) {
        this.fromGameOver = status;
    }
    setCollectFly(fromNode: Node, key: number, curr: number, tar: number, callBack: Function, target: any) {
        this.setCollect(key, curr, tar);
    }
    setCollect(key: number, curr: number, tar: number) {
        if (this.manager.conditionType == emLevCondition.Collect) {
            if (this.conditionMap.has(key)) {
                let item = this.conditionMap.get(key);
                if (item) {
                    // item.updateProgress(curr, tar);
                    item.updateRestOnly(curr, tar);
                }
            }
        }
    }

    setScore(score: number) {
        // console.log("setScore设置分数：",score,"目标分数：",this.manager.targetScore);
        score = Math.min(this.manager.scoreHelper.score, this.manager.targetScore);
        let self = this;
        if (this.manager.conditionType == emLevCondition.Score) {
            let tscore = this.score;
            let scorecz = score - this.score;
            if (scorecz > 0) {
                Tween.stopAllByTarget(this.labScore.node);
                this.score = score;
                let call = tween(this.node).call(() => {
                    tscore = tscore + 1;
                    tscore = tscore > self.manager.targetScore ? self.manager.targetScore : tscore;
                    let s = tscore.toString();
                    if (tscore > 999) {
                        self.labScore.fontSize = 25;
                    } else {
                        self.labScore.fontSize = 30;
                    }
                    self.labScore.string = s;
                    // console.log("setScore设置分数： tweeen:",score,"目标分数：",self.manager.targetScore);
                    self.onScoreChange(tscore, self.manager.targetScore);
                });
                let usetime = 0.5;
                let time = usetime / scorecz;
                let delay = tween().delay(time);
                tween(this.node)
                    .repeat(scorecz, tween(this.node).sequence(delay, call))
                    .then(
                        tween(this.node).call(() => {
                            if (this.isInScene) {
                                this.manager && this.manager.checkIsLevelComplete();
                            }
                        })
                    )
                    .start();
            }
            this.score = score;
        }
    }
    onScoreChange(showScore, score) { }
    public moveToTarget(targetNode: Node, flyNode: Node, callBack: Function) {
        this.moveTotargetByCurve(targetNode, flyNode, callBack);
        // let dest = targetNode.worldPosition;
        // let pt = flyNode.parent.getComponent(UITransform);
        // dest = pt.convertToNodeSpaceAR(dest);
        // if (!flyNode.active) {
        //     flyNode.active = true;
        // }
        // flyNode.getComponent(LevelConditionDiamondItem).playFlyAnim();
        // tween(flyNode)
        //     .to(0.1, { scale: new Vec3(2, 2, 1) })
        //     .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
        //     .to(0.1, { scale: new Vec3(1.6, 1.6, 1) })
        //     .to(0.1, { scale: new Vec3(1.4, 1.4, 1) })
        //     .delay(0.5)
        //     .parallel(
        //         tween().to(0.4, { position: new Vec3(dest.x, dest.y) }, { easing: "cubicIn" }),
        //         tween().to(0.4, { scale: new Vec3(0.5, 0.5, 1) })
        //     )
        //     .to(0.1, { scale: new Vec3(0, 0, 0) })
        //     .call(() => {
        //         callBack && callBack.call(this);
        //     })
        //     .start();
    }

    moveTotargetByCurve(targetNode: Node, flyNode: Node, callBack: Function) {
        let dest = targetNode.worldPosition;
        let destWx = dest.x;
        let flyWx = flyNode.worldPosition.x;
        let pt = flyNode.parent.getComponent(UITransform);
        dest = pt.convertToNodeSpaceAR(dest);
        if (!flyNode.active) {
            flyNode.active = true;
        }
        let fixPosX = 0;
        let fixPosY = 0;
        //console.log("fly:", flyWx, "dist:", destWx);
        if (destWx > flyWx) {
            fixPosX = -200;
            fixPosY = -300;
        } else {
            fixPosX = 200;
            fixPosY = -300;
        }
        let startPos = flyNode.position; //起点，抛物线开始的坐标
        let middlePos = new Vec3(flyNode.position.x + fixPosX, flyNode.position.y + fixPosY, 0); //中间坐标，即抛物线最高点坐标
        let destPos = dest;
        let tweenDuration: number = 0.4;
        tween(flyNode.position)
            .to(tweenDuration, destPos, {
                onUpdate: (target: Vec3, ratio: number) => {
                    flyNode.position = this.twoBezier(ratio, startPos, middlePos, destPos);
                },
                onComplete: () => {
                    callBack && callBack.call(this);
                    tween(targetNode.getChildByName("img_score")).to(0.05, { scale: new Vec3(1.25, 1.25, 1) }).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
                },
            })
            .start();
    }
    //计算贝塞尔曲线坐标函数
    twoBezier(t: number, p1: Vec3, cp: Vec3, p2: Vec3) {
        let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
        return new Vec3(x, y, 0);
    }

    restoreOrigin() {
        this.rootScoreCondition.active = true;
        this.rootScoreCondition.scale = new Vec3(1, 1, 1);
        this.rootScoreCondition.getComponent(UIOpacity).opacity = 255;
    }
}
