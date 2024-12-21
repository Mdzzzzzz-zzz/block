/*
 * @Date: 2024-06-04 11:49:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-06 17:35:00
 */
import { PREVIEW } from "cc/env";
import { SettingData } from "../data/SettingData";
import { SdkManager } from "../minigame_sdk/scripts/SdkManager";
import { Singleton } from "../Singleton";
import { ShakeAbleCamera } from "./ShakeAbleCamera";
import { ShakeCameraConfig } from "./ShakeDefine";
import { ShakeNodeEffect } from "./ShakeNodeEffect";

export class ShakeManager extends Singleton {
    public Init() { }
    public UnInit() { }

    public Shake(level: "heavy" | "medium" | "light") {
        let isOpenShake = SettingData.inst.isOpenShake;
        if (PREVIEW) {
            console.log("Shake toggle: " + isOpenShake);
        }
        if (isOpenShake == 1) {
            if (PREVIEW) {
                console.log("Shake Level: " + level);
            }
            SdkManager.getInstance().native.vibrateShort(level);
        }
    }
    public ShakeCamera(level: "heavy" | "medium" | "light") {
        let isOpenShakeCamera = SettingData.inst.isOpenShakeCamera;
        if (isOpenShakeCamera == 1) {
            if (PREVIEW) {
                console.log("Shake Camera: " + level);
            }
            let camera = ShakeAbleCamera.inst;
            if (camera && camera.node && camera.node.isValid) {
                let sc = ShakeCameraConfig[level];
                if (!sc) {
                    sc = ShakeCameraConfig["light"];
                }
                ShakeNodeEffect.shakeNodes(camera.node, sc);
            }
        }
    }
}
