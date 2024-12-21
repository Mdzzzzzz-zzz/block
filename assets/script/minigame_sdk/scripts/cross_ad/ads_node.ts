/*
 * @Date: 2023-05-25 15:41:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-12 19:25:22
 */
import { _decorator, Button, Component, instantiate, Node, Prefab, v2, v3 } from 'cc';
import { ad_node } from './ad_node';
import { SdkManager } from '../SdkManager';
import { dtAdNodeData, emCrossAdPath } from './CrossAdConfig';
import * as env from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('ads_node')
export class ads_node extends Component {
    TAG = "[cross_ad/ads_node.js]";
    @property(Prefab)
    adnode:Prefab = null;
    @property(Node)
    adContent:Node = null;

    data:dtAdNodeData;
    showPath:emCrossAdPath;
    adType:number;
    setData(data:dtAdNodeData,path:emCrossAdPath,adType:number) {
        this.data = data;
        this.showPath = path;
        this.adType = adType;
        // if(env.PREVIEW){
        //     console.log(this.TAG,"广告设置了数据:" +JSON.stringify(data));
        // }
        this.initUI();
        // if(env.PREVIEW){
        //     console.log(data)
        // }
    }
    initUI(){
        if(env.PREVIEW){
            console.log(this.data.ads_data)
        }
        for (var t = 0; t < this.data.ads_data.length; t++) {
            let data = this.data.ads_data[t];
            let adnode = instantiate(this.adnode);
            let ads_script = adnode.getComponent(ad_node);
            ads_script.SetData(data,this.showPath,this.adType);
            let vpos = v2(90 + (t * 150) - 360, -120);
            
            // console.error(this.TAG,"vpos:" +JSON.stringify(data));
            
            adnode.position  = v3( vpos.x,vpos.y,0); 
            this.adContent.addChild(adnode);
        }
    }

}

