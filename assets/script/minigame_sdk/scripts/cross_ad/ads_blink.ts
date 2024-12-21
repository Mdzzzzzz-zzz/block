/*
 * @Date: 2023-05-25 15:41:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-12 19:25:14
 */
import { _decorator, Component, Node, Prefab, Tween, instantiate, v2, UITransform, v3, TweenAction, tween, Vec3 } from 'cc';
import { ad_node } from './ad_node';
import { dtAdNodeData, emCrossAdPath } from './CrossAdConfig';
import * as env from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('ads_blink')
export class ads_blink extends Component {
    @property(Prefab)
    adnode:Prefab=null
    TAG = "[cross_ad/ads_blink.js]";

    data:dtAdNodeData
    alladnode:Node[];
    blinkindex:number
    preblinkindex:number
    blink_display:number
    
    showPath:emCrossAdPath;
    setData(data:dtAdNodeData,path:emCrossAdPath) {
        this.data = data;
        this.showPath = path;
        // if(env.PREVIEW){
        //     console.log(this.TAG, "广告设置了数据:"+JSON.stringify(data));
        // }
        this.initUI(); 
    }
    initUI() {
        this.alladnode=[];
        for (var t = 0; t < this.data.ads_data.length; t++) {
            let data = this.data.ads_data[t];
            let adnode =  instantiate(this.adnode);
            let ads_script = adnode.getComponent(ad_node);
            ads_script.SetData(data,emCrossAdPath.Blink,3);
            let uitrans = this.node.getComponent(UITransform)
            let vpos = v2(uitrans.width / 2, uitrans.height / 2);
            adnode.position  = v3( vpos.x,vpos.y,0); 
            adnode.active = false;
            this.node.addChild(adnode);
            this.alladnode.push(adnode);
        }
        this.blinkindex = this.getBlinkIndex();  
        this.effectAni(this.alladnode[this.blinkindex]);
        this.blink_display = this.data.blink_display;
        this.blink();
    }
    blink() {
        let action = tween(this.node)
        action.delay(this.data.blink_display).call(()=>{
            this.alladnode[this.blinkindex].active = false;
            this.blinkindex = this.getBlinkIndex();
            this.alladnode[this.blinkindex].active = true;
            this.effectAni(this.alladnode[this.blinkindex]);
        }).union().repeatForever().start()
    }
    effectAni(node:Node) {
        if (this.preblinkindex == this.blinkindex) {
            return;
        }
        if (node) {
            let angle = 20;
            Tween.stopAllByTarget(node)
            //    node.rotation = -angle;
            //    node.anchorX = 0.5;
            //    node.anchorY = 0.7;
            //    const delay1 = cc.delayTime(0.1);
            //    const delay2 = cc.delayTime(0.1);
            //    const delay3 = cc.delayTime(0.3);
            //    const left = cc.rotateBy(0.6, angle);
            //    const right = cc.rotateBy(0.6, -angle);
            //    const seq = cc.sequence(delay3,left, delay1, right, delay2);
            //    const rep = cc.repeatForever(seq);
            let tweenAction =  tween(node)
            tweenAction.to(0.5,{scale: new Vec3(1.0, 1.1, 1)}).to(0.5,{scale: new Vec3(0.8, 1, 1)}).union().repeatForever().start()
            this.preblinkindex = this.blinkindex;
        }
    }
    getBlinkIndex() {
        let random = Math.random() * 100;
        var trand = 0;
        for (var qzindex = 0; qzindex < this.data.ads_qz.length; qzindex++) {
            if (qzindex <= this.data.ads_qz.length - 2) {
                trand = trand + this.data.ads_qz[qzindex];
                if (random < trand) {
                    return qzindex;
                }
            } else {
                return qzindex;
            }
        }
    }
}

