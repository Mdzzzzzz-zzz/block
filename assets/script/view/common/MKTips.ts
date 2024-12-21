import { _decorator, Component, Node, director, find } from 'cc';
import * as cc from "cc";
import { mk } from '../../MK';
import { nodeBind, parseNode } from '../../util/MKNodeBind';
const { ccclass, property } = _decorator;

interface ITipsParam {
    content: string;
    y?: number;
    duration?: number; 
}

@ccclass('MKTips')
export class MKTips extends mk.UIBase<ITipsParam> {
    @nodeBind('main/bg')
    bg = new Node();

    @nodeBind('main/labContent')
    labContent = new cc.Label();

    init(param: ITipsParam) {
        this.labContent.string = param.content;
        if (cc.js.isNumber(param.y)) {
            this.node.getPosition().y = param.y;
        }

        this.scheduleOnce(()=>{
            const contentWidth = this.labContent.node.getComponent(cc.UITransform).width;
            this.bg.getComponent(cc.UITransform).width = 60 + contentWidth + 60;
        }, 1/60);


        const duration = cc.js.isNumber(param.duration) ? param.duration : 2;
        cc.tween(this.node)
            .delay(duration)
            .call(() => {
                this.node.destroy();
            }).start();
    }

    onLoad(){
        parseNode(this);
    }
}

