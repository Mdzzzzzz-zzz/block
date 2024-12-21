import { _decorator, Node, Prefab, instantiate, Vec3 } from "cc";
import { SdkEventType } from "../SdkEventType";
import { ads_node } from "./ads_node";
import { ads_list } from "./ads_list";
import { ads_blink } from "./ads_blink";
import { dtAdNodeData, dtAddAdEvent, dtRawAdInfo, emCrossAdPath } from "./CrossAdConfig";
import { ResManager } from "../../../resource/ResManager";
import { SdkEventManager } from "../SdkEventManager";
const { ccclass, property } = _decorator;

let TAG = "[cross_ad/ads_manager.js]";
//#region 资源路径
let node_path = "ads/ads_node";
let list_path = "ads/ads_list";
let blink_path = "ads/ads_blink";
let cross_adBundleName = "resources";
//#endregion
@ccclass("ads_manager")
export class ads_manager {
    static ads_raw_data: Array<dtRawAdInfo>;
    static allevents: Array<dtAddAdEvent> = new Array<dtAddAdEvent>();
    static waitadd: boolean;
    static parent: Node;
    static ads_type: string;
    static scene: string;
    static pos: Vec3;
    static getTypeRawData(ads_type: string): dtAdNodeData {
        if (ads_manager.ads_raw_data) {
            let ads_raw_data = ads_manager.ads_raw_data;
            let allqzdata: Array<number> = [];
            for (var idIndex = 0; idIndex < ads_raw_data.length; idIndex++) {
                let rawData = ads_raw_data[idIndex];
                //blink的权重
                allqzdata.push(rawData.icon_weight);
            }
            let typedata: dtAdNodeData = {
                type: ads_type,
                blink_display: 5,
                ads_data: ads_raw_data,
                ads_qz: allqzdata,
                ads_subtype: ads_type,
            };
            // console.error(TAG, "节点数据s " + JSON.stringify(typedata));
            return typedata;
        } else {
            console.error(TAG, "没有设置交叉倒流数据");
        }
        return null;
    }
    static addAdsNode(ads_type: string, parent: Node, pos: Vec3, scene: string): Promise<Node> {
        ads_manager.parent = parent;
        ads_manager.ads_type = ads_type;
        ads_manager.pos = pos;
        ads_manager.scene = scene;

        return ads_manager.loadAdNodeByType(ads_type);
    }
    static listenADManagerData() {
        console.log(TAG, "开始监听Admanager倒流数据回调");
        SdkEventManager.getInstance().register(
            SdkEventType.GET_ADMANAGER_ICON_INFO_SUCCESS,
            ads_manager.AdmanagerCall,
            ads_manager
        );
    }

    //
    static AdmanagerCall() {}

    static setRawData(data: Array<dtRawAdInfo>) {
        ads_manager.ads_raw_data = data;
        ads_manager.allevents = [];
    }
    static loadAdNodeByType(ads_type): Promise<Node> {
        return new Promise<Node>((resolve, reject) => {
            if (ads_manager.ads_raw_data /*&& tt.configManager.getInstance().auditing == false*/) {
                const parent = ads_manager.parent;
                const pos = ads_manager.pos;
                const data = ads_manager.getTypeRawData(ads_type); //ads_manager.getTypeData(ads_manager.ads_type);
                if (data == null) {
                    console.error(TAG, "没有交叉倒流的数据2");
                    reject(null);
                    return;
                }
                if (data.ads_subtype == "banner") {
                    ResManager.getInstance()
                        .loadAsset<Prefab>(node_path, cross_adBundleName)
                        .then((prefab) => {
                            let adsnode = instantiate(prefab);
                            let ads_script = adsnode.getComponent(ads_node);
                            ads_script.setData(data, emCrossAdPath.Banner, 2);
                            adsnode.position = pos;
                            // console.log(TAG, "banner ads_manager.pos =" + JSON.stringify(pos))
                            parent.addChild(adsnode);
                            resolve(adsnode);
                        });
                } else if (data.ads_subtype == "list") {
                    ResManager.getInstance()
                        .loadAsset<Prefab>(list_path, cross_adBundleName)
                        .then((prefab) => {
                            let adsnode = instantiate(prefab);
                            let ads_script = adsnode.getComponent(ads_list);
                            ads_script.setData(data, emCrossAdPath.List);
                            adsnode.position = Vec3.ZERO;
                            parent.addChild(adsnode);
                            resolve(adsnode);
                        });
                } else if (data.ads_subtype == "blink") {
                    ResManager.getInstance()
                        .loadAsset<Prefab>(blink_path, cross_adBundleName)
                        .then((prefab) => {
                            let adsnode = instantiate(prefab);
                            let ads_script = adsnode.getComponent(ads_blink);
                            ads_script.setData(data, emCrossAdPath.Blink);
                            // console.log(TAG, "blink ads_manager.pos =" + JSON.stringify(pos))
                            adsnode.position = pos;
                            parent.addChild(adsnode);
                            resolve(adsnode);
                        });
                }
            } else {
                console.error(TAG, "没有交叉倒流的数据2");
                reject(null);
            }
        });
    }
}
