/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-21 16:06:23
 */
import { Vec3 } from "cc";
import { tween } from "cc";
import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("TweenScaleShow")
export class TweenScaleShow extends Component {
    @property({ type: [Node] })
    nodes: Node[] = [];
    @property
    animDelay: number = 0;
    @property
    animDelayDelta: number = 0;
    private startScale: Vec3;
    private animScale: Vec3;
    protected onLoad(): void {
        this.startScale = Vec3.ZERO;
        this.animScale = new Vec3(1.1, 1.1);
        for (let i = 0; i < this.nodes.length; i++) {
            // 延迟时间
            let node = this.nodes[i];
            if (node) {
                node.scale = this.startScale;
            }
        }
    }
    start() {
        // 循环遍历节点数组
        for (let i = 0; i < this.nodes.length; i++) {
            // 延迟时间
            let node = this.nodes[i];
            if (node) {
                let delayTime = i * this.animDelayDelta + this.animDelay;
                // 缩放动画
                tween(node).delay(delayTime).to(0.4, { scale: this.animScale }).to(0.2, { scale: Vec3.ONE }).start();
            }
        }
    }
}
