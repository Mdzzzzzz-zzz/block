import { _decorator, Component, Node, Prefab, UITransform, Vec3, instantiate, game, tween } from 'cc';
import { ad_node } from './ad_node';
import { dtAdNodeData, emCrossAdPath } from './CrossAdConfig';
import { audio } from '../../../Boot';
import { mk } from '../../../MK';
const { ccclass, property } = _decorator;

@ccclass('ads_list')
export class ads_list extends Component {
    node_path = "prefabs/ads_node";
    TAG = "[game/cross_ad/ads_node.js]";
    @property(Prefab)
    adnode: Prefab = null
    @property(Node)
    contentnode: Node = null
    @property(Node)
    background: Node = null
    @property(Node)
    scrollNode: Node = null
    data: dtAdNodeData
    @property(Vec3)
    hidePos: Vec3 = new Vec3(-440, 0, 0)

    @property(Node)
    arrowNode: Node

    state: number = 0
    showing: boolean
    hiding: boolean
    hasShow: boolean
    showPath: emCrossAdPath;
    setData(data: dtAdNodeData, path: emCrossAdPath) {
        this.data = data;
        this.showPath = path;
        // if(env.PREVIEW){
        //     console.log(this.TAG, "广告设置了数据 " + JSON.stringify(data));
        // }
        //this.initUI();
    }
    showOrHide() {
        if (this.state == 0) {
            this.show();
        } else {
            this.hide();
        }
    }
    hide() {
        if (this.showing) {
            return;
        }
        this.state = 0;
    }


    show() {
        if (this.hiding) {
            return;
        }
        this.state = 1;
    }
    initUI() {
        this.node.position = this.hidePos
        var tnode = new Node();
        let uitrans = tnode.addComponent(UITransform)
        uitrans.width = 560;
        uitrans.height = 140;
        this.contentnode.addChild(tnode);
        var tindex = 0;
        var trow = 1;
        var listHeight = 140;
        var listHeightDelta = 10;

        for (var t = 0; t < this.data.ads_data.length; t++) {
            if ((t + 1) % 3 == 1) {
                tnode = new Node();
                uitrans = tnode.addComponent(UITransform)
                uitrans.width = 460;
                uitrans.height = listHeight;
                uitrans.anchorX = 0;
                uitrans.anchorY = 0;
                tindex = 0;
                trow++;
                this.contentnode.addChild(tnode);
            }
            tnode.setPosition(0, (trow - 2) * -listHeight - listHeightDelta, 0);
            let data = this.data.ads_data[t];
            let adnode = instantiate(this.adnode);
            let ads_script = adnode.getComponent(ad_node);
            ads_script.SetData(data, this.showPath, 1);
            // console.log(this.TAG, "vpos = " + JSON.stringify(vpos));
            adnode.setPosition(140 + (tindex * 140) - 260, -90, 0);
            tnode.addChild(adnode)
            tindex++;
        }
    }
    onload() {
        let uitrans = this.node.getComponent(UITransform)
        uitrans.width = game.canvas.width;
        uitrans.height = game.canvas.height;
        this.scrollNode.position = new Vec3(-this.scrollNode.getComponent(UITransform).width)
        this.background.active = false;
        //background 需要一个background component
        /*(this.background.getComponent("background") as any).setTouchEndCall(()=>{
            this.hide();
        });*/
        this.state = 0;
        this.scrollNode.position = new Vec3(-Math.abs(this.scrollNode.getComponent(UITransform).width + 360));
        this.node.position = this.hidePos

    }
    OnShowBtnClick() {
        mk.audio.playBtnEffect();
        if (this.hasShow) {
            this.HideAdList()
            this.hasShow = false
        } else {
            this.ShowAdList()
            this.hasShow = true
        }
        // console.log(this.hasShow)
    }
    ShowAdList() {
        let action = tween(this.node)
        action.call(() => {
            this.scrollNode.active=true
        }).to(0.3, { position: Vec3.ZERO }).call(() => {
            this.arrowNode.scale = Vec3.ONE
        }).start()
    }
    HideAdList() {
        let action = tween(this.node)
        action.to(0.3, { position: this.hidePos }).call(() => {
            this.scrollNode.active=false
            this.arrowNode.scale = new Vec3(-1, 1, 1)
        }).start()
    }
    // update(){
    //     if(this.state == 0){
    //        if (Math.abs(this.scrollNode.position.x - 30) < Math.abs(this.scrollNode.getComponent(UITransform).width + 360)) {
    //            this.scrollNode.position = new Vec3(this.scrollNode.position.x - 30)
    //            this.hiding = true;
    //        } else if(this.background.active == true){
    //            this.background.active = false;
    //            //this.listBackbtn.setScale(new Vec3(-1,1,1))
    //            this.hiding = false;
    //            SdkAdManager.getInstance().showBanner()
    //            this.scrollNode.position = new Vec3( -Math.abs(this.scrollNode.getComponent(UITransform).width + 360))
    //        }
    //     } else if(this.state == 1) {
    //        if (this.scrollNode.position.x + 25 < -360) {
    //            this.showing = true;
    //            this.scrollNode.position = new Vec3(this.scrollNode.position.x + 25)
    //        }else if (this.background.active == false ){
    //            this.background.active = true;
    //            this.listBackbtn.setScale(new Vec3(1,1,1))
    //            this.scrollNode.position  =  new Vec3(-360);
    //            this.showing = false;
    //            SdkAdManager.getInstance().hideBanner()
    //        }
    //     }
    // }
}

