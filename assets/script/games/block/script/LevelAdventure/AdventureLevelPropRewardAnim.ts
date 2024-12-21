import { _decorator, Component, instantiate, Label, Layout, Node, Tween, tween, UIOpacity, v3 } from "cc";
import { BlockEventType } from "../define/Event";
import { UITransform, Vec3, Sprite } from "cc";
import { mk } from "../../../../MK";
import { ResManager } from "../../../../resource/ResManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelPropRewardAnim")
export class AdventureLevelPropRewardAnim extends Component {

    @property(Node)
    hammerNode: Node = null;
    @property(Node)
    hRocketNode: Node = null;
    @property(Node)
    vRocketNode: Node = null;
    @property(Node)
    refreshNode: Node = null;

    @property(Node)
    prop1Pos: Node = null;

    @property(Node)
    prop2Pos: Node = null;

    @property(Sprite)
    prop1sp: Sprite = null;
    @property(Sprite)
    prop2sp: Sprite = null;

    start() {
        mk.regEvent(BlockEventType.EVENT_PROP_GIFT_PACK_FLY_PROP, this.startAnim, this);
    }
    onDestroy() {

    }

    startAnim(propInfo) {
        let base_path = "res/texture/props/UI_Props_New/UI_Congrats_icon_"

        let asset = AssetInfoDefine.prefab.flyProp;
        ResManager.getInstance()
            .loadNode(asset.path, asset.bundle, this.prop1Pos)
            .then((nd) => {

                ResManager.getInstance()
                    .loadSpriteFrame(base_path + propInfo.prop1, "block")
                    .then((sprite) => {
                        nd.getComponent(Sprite).spriteFrame = sprite;
                    });
                let targetNode = this.hammerNode;
                if (propInfo.prop1 == 2) {
                    targetNode = this.vRocketNode;
                } if (propInfo.prop1 == 3) {
                    targetNode = this.hRocketNode;
                } if (propInfo.prop1 == 4) {
                    targetNode = this.refreshNode;
                }

                this.moveTotargetByCurve(targetNode, nd, () => {
                    nd.destroy();
                });
            });


        ResManager.getInstance()
            .loadNode(asset.path, asset.bundle, this.prop2Pos)
            .then((nd) => {

                ResManager.getInstance()
                    .loadSpriteFrame(base_path + propInfo.prop2, "block")
                    .then((sprite) => {
                        nd.getComponent(Sprite).spriteFrame = sprite;
                    });
                let targetNode = this.hammerNode;
                if (propInfo.prop2 == 2) {
                    targetNode = this.vRocketNode;
                } if (propInfo.prop2 == 3) {
                    targetNode = this.hRocketNode;
                } if (propInfo.prop2 == 4) {
                    targetNode = this.refreshNode;
                }

                this.moveTotargetByCurve(targetNode, nd, () => {
                    nd.destroy();
                });
            });
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
                    let num = flyNode.scale.x - ratio * 0.1 > 0 ? flyNode.scale.x - ratio * 0.03 : 0;
                    flyNode.scale = new Vec3(num, num, num);
                },
                onComplete: () => {
                    callBack && callBack.call(this);
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

}
