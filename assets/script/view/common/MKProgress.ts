import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;
import * as cc from "cc";
import { mk } from '../../MK';
import { eventBind, nodeBind, parseNode } from '../../util/MKNodeBind';

interface IProgressParam{
    content:string;
    duration?: number; 
}

@ccclass('MKProgress')
export class MKProgress extends mk.UIBase<IProgressParam> {
    @nodeBind('txtProgress')
    desLabel = new cc.Label();
    
    param:IProgressParam = null;

    onLoad() {
        parseNode(this);
    }

    onClose() {
        this.node.destroy();
    }

    init(param:IProgressParam) {
        this.param = param;
        this.desLabel.string = param.content || "首次加载较慢，请稍候片刻~";
        this.timerClose(param);
    }

    timerClose(param:IProgressParam){
        if(param.duration){
            cc.tween(this.node).delay(param.duration).call(()=>{
                this.onClose();
            }).start();
        }
    }
}

