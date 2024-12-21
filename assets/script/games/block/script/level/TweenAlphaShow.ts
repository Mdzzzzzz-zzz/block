/*
 * @Date: 2024-05-14 23:19:22
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-21 23:36:39
 */
import { UIOpacity } from 'cc';
import { Vec3, tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenAlphaShow')
export class TweenAlphaShow extends Component {
    @property({type:[UIOpacity]})
    nodes:UIOpacity[] = [];
    @property
    animDelay:number = 0;
    @property
    animDelayDelta:number = 0;
    protected onLoad(): void {
        for (let i = 0; i < this.nodes.length; i++) {
            // 延迟时间
            let node = this.nodes[i];
            if(node){
                if (node.opacity) {
                    node.opacity = 128;
                }
                node.node.active = false;
            }
        }
    }
    start() {
        // 循环遍历节点数组
        for (let i = 0; i < this.nodes.length; i++) {
            // 延迟时间
            let node = this.nodes[i];
            if(node){
                let delayTime = i * this.animDelayDelta+this.animDelay;
                // 缩放动画
                tween(this.nodes[i])
                    .delay(delayTime)
                    .call(()=>{
                        node.node.active = true;
                    })
                    .to(0.5, {opacity: 255 })
                    .start();
            }
        }
    }
}

