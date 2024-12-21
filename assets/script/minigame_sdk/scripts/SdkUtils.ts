/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-07-22 16:50:57
 */
import { Camera, Canvas, Node, UITransform, Vec2, Vec3, director, screen, sys, view } from "cc";
import { EncodeDecode } from "./common/encode_decode";

export class SdkUtils {
    static generateUUID(): string {
        let d = new Date().getTime();
        let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }
    static checkLocalUUID() {
        let local_uuid = sys.localStorage.getItem("LOCAL_UUID_KEY");
        return local_uuid != null;
    }
    static getLocalUUID() {
        let local_uuid = sys.localStorage.getItem("LOCAL_UUID_KEY");
        if (!local_uuid) {
            local_uuid = this.generateUUID();
            sys.localStorage.setItem("LOCAL_UUID_KEY", local_uuid);
        }
        return local_uuid;
    }
    static getLocalAccountId() {
        let local_uuid = sys.localStorage.getItem("LOCAL_ACCOUNT_KEY");
        if (!local_uuid) {
            local_uuid = this.generateUUID();
            sys.localStorage.setItem("LOCAL_ACCOUNT_KEY", local_uuid);
        }
        return local_uuid;
    }
    static isSceneApplicationCode(scene) {
        var qrList = [1047, 1048, 1049]; //扫描小程序码,选取小程序码,识别小程序码
        return qrList.indexOf(scene) > -1;
    }
    /**
     * 节点坐标转换成左上角世界坐标
     * 节点是的anchor 0.5 0.5
     */
    static convertNodeLTPosToWorldPos(nd: Node) {
        let trans = nd.getComponent(UITransform);
        if (!trans) {
            console.error("需要转换的节点不存在组件 UITransform");
            return { left: 0, top: 0, width: trans.width, height: trans.height };
        }

        let scene = director.getScene();
        let canvas = scene.getChildByName("Canvas");
        if (!canvas) {
            console.error("请检查Canvas的路径，默认使用scene/canvas");
            return { left: 0, top: 0, width: trans.width, height: trans.height };
        }
        let contentSize = trans.contentSize;
        let winSize = view.getVisibleSize();
        let authBtnPos = trans.convertToWorldSpaceAR(Vec3.ZERO);
        authBtnPos = canvas.getComponent(UITransform).convertToNodeSpaceAR(authBtnPos);

        //@ts-ignore
        let phoneInfo = wx.getSystemInfoSync();
        let scaleX = phoneInfo.screenWidth / winSize.width;
        let scaleY = phoneInfo.screenHeight / winSize.height;
        let width = contentSize.width * (phoneInfo.screenWidth / winSize.width);
        let height = contentSize.height * (phoneInfo.screenHeight / winSize.height);
        let xDes = phoneInfo.screenWidth / 2 + authBtnPos.x * scaleX - width * trans.anchorX;
        let yDes = phoneInfo.screenHeight / 2 - authBtnPos.y * scaleY - height * trans.anchorY;
        return { left: xDes, top: yDes, width: width, height: height };
    }
    static convertNodeToCanvasLTPosition(targetNode: Node) {
        let trans = targetNode.getComponent(UITransform);
        if (!trans) {
            console.error("需要转换的节点不存在组件 UITransform");
            return { left: 0, top: 0, width: trans.width, height: trans.height };
        }
        let winSize = view.getVisibleSize();
        let contentSize = trans.contentSize;
        //@ts-ignore
        let scaleX = canvas.width / winSize.width;
        //@ts-ignore
        let scaleY = canvas.height / winSize.height;
        // 转换坐标,  targetNode就是你截图的父节点，其范围要包含截图范围
        let worldpos = targetNode.getParent().getComponent(UITransform).convertToWorldSpaceAR(targetNode.getPosition());
        // 进行一些简单的属性设置
        let targetCanvasWidth = contentSize.width * scaleX;
        let targetCanvasHeight = contentSize.height * scaleY;
        let targetCanvasX = (worldpos.x - contentSize.width / 2) * scaleX;
        let targetCanvasY = (winSize.height - contentSize.height / 2 - worldpos.y) * scaleY;

        return { left: targetCanvasX, top: targetCanvasY, width: targetCanvasWidth, height: targetCanvasHeight };
    }
    static getConfigSignStr(reqObj) {
        var sortedKeys = Object.keys(reqObj).sort();
        var signStr = "";
        for (var i = 0; i < sortedKeys.length; i++) {
            var key = sortedKeys[i];
            if (key == "act" || key == "sign") {
                continue;
            } else {
                signStr += key + "=" + reqObj[key];
            }
        }
        var finalSign = EncodeDecode.hex_md5("market.tuyoo.com-api-" + signStr + "-market.tuyoo-api") || "";
        return finalSign;
    }
}
