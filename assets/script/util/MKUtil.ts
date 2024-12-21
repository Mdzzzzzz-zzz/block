/**
 *游戏内相关一些函数
 */

import { Button } from "cc";
import { getItem, setItem } from "./MKLocalStorage";

export class MKUtil {

    /**
     * @description 获取两点间的距离

     * @static
     * @returns
     */
    static distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }

    /**
     * @description 获取两点成的角度
     * @static
     * @returns
     */
    static degree(p1, p2) {
        let degree = Math.asin(this.getSine(p1, p2));
        degree = degree * 180 / 3.1415;
        if (p2.x > p1.x && p2.y > p1.y) degree = 90 + 90 - degree;
        if (p2.x > p1.x && p2.y < p1.y) degree = 180 + Math.abs(degree);
        //if(p2.x < p1.x && p2.y < p1.y) degree += 270;
        if (Math.abs(p2.y - p1.y) <= 1 && p2.x > p1.x) degree = 180;
        return degree;
    }

    /**
     * @description 获取亮点的sine值
     * @author
     * @static
     * @returns
     */
    static getSine(p1, p2) {
        let dis = this.distance(p1, p2);
        let dis_y = p2.y - p1.y;
        return dis_y / dis;
    }

    public static gameHttpUrl(service:number): string {
        let url;
        switch (service) { // 0:测试服  1:仿真  2:线上
            case 0:
                url = "116-hwcxft6fz-app-test01.qijihdhk.com";
                break;
            case 1:
                url = "app-yuanzuxiang-dev.tugameworld.com";
                break;
            case 2:
                url = "121-block-app-online01.blockmasterbraingames.com";
                break;
        }
        return url;
    }

    public static getGameURL(service:number): string {
        let url;
        switch (service) { // 0:测试服  1:仿真  2:线上
            case 0:
                url = "116-hwcxft6fz-wss-test01.qijihdhk.com";
                break;
            case 1:
                url = "app-yuanzuxiang-dev.tugameworld.com";
                break;
            case 2:
                url = "121-block-wss-online01.blockmasterbraingames.com";
                break;
        }
        return url;
    }

    public static getSDKURL(): string {
        return "https://" + this.gameHttpUrl(0) + "/api/arc8/hello";
    }

    public static getWSURL(): string {
        return "wss://" + this.getGameURL(0);
    }

    /**
     * 从字符串中查找第N个字符
     * @param str 目标字符串
     * @param cha 要查找的字符
     * @param num 第N个
     */
    static findCharPos(str: string, cha: string, num: number): number {
        let x = str.indexOf(cha);
        let ret = x;
        for (var i = 0; i < num; i++) {
            x = str.indexOf(cha, x + 1);
            if (x != -1) {
                ret = x;
            } else {
                return ret;
            }
        }
        return ret;
    }

    static generateUUID(): string {
        let d = new Date().getTime();
        // if (window.performance && typeof window.performance.now === "function") {
        //     d += performance.now(); //use high-precision timer if available
        // }
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid
    }

    static deviceId(): string {
        let deviceId = getItem("k_deviceId", "");
        if (deviceId == "") {
            deviceId = this.generateUUID();
            setItem("k_deviceId", deviceId);
        }
        return deviceId;
    }
    static localUserId(): string {
        let deviceId = getItem("k_localUserId", "");
        if (deviceId == ""||deviceId.length>10) {
            deviceId = parseInt((Date.now() * 0.001).toString()).toString()
            setItem("k_localUserId", deviceId);
        }
        return deviceId;
    }

    static invalidateButtonTemporarily(button: Button, delay: number) {
        if (button instanceof Button && button.interactable) {
            delay = delay || 0.5;
            button.interactable = false;
            button.scheduleOnce(() => {
                button.interactable = true;
            }, delay);
        }
    }
}
