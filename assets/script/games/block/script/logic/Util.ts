import { Prefab, instantiate } from "cc";
import { ResManager } from "../../../../resource/ResManager";
import { NodePoolManager } from "../../../../util/NodePool";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import * as env from "cc/env";
import { emShareType, emSharePath } from "../../../../sdk/wechat/SocialDef";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { Random } from "../../../../util/Random";
export class Util {
    public static delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public static createOrGetPool(poolType: string, prefabPath: string, count: number, assetBundle: string = "block") {
        // 如果创建过就只更改size
        let ret = NodePoolManager.inst.getPool(poolType, false)
        if (ret != null && ret.cloneNode != null) {
            ret.size = count;
            return ret;
        }
        Util.createPool(poolType, prefabPath, count, assetBundle);
    }

    public static createPool(poolType: string, prefabPath: string, count: number, assetBundle: string = "block") {
        let node = ResManager.getInstance().loadAssetSync<Prefab>(prefabPath, assetBundle);
        if (node == null) {
            if (env.PREVIEW) {
                console.warn("null pool node ", prefabPath);
            }
            NodePoolManager.initPool(poolType, assetBundle, count);
            return;
        }
        const pool = NodePoolManager.inst.createPool(poolType);
        if (node) {
            pool.cloneNode = instantiate(node);
            pool.size = count;
        }
    }

    public static getRandomNumber(seed: number): number {
        const arr = [10100, 10101, 10102, 10103, 10104, 10200, 10201, 10202, 10203,
            10204, 10300, 10301, 10302, 10303, 10304,
            10400, 10401, 10402, 10403, 10404, 10500, 10501, 10502, 10503, 10504
        ];
        const randomIndex = Math.floor(seed / 100 * arr.length) % arr.length;
        return arr[randomIndex];
    }

    public static generateRandomShowOffShare() {
        const randomSeed = new Date().getTime() % 1000; // Use current time as seed
        return this.getRandomNumber(randomSeed);
    }

    static deepCopy<T>(value: T): T {
        // 如果值为 null 或不是对象类型，直接返回值
        if (value === null || typeof value !== 'object') {
            return value;
        }

        // 如果值是数组，递归地复制每一个元素
        if (Array.isArray(value)) {
            return value.map(item => Util.deepCopy(item)) as unknown as T;
        }

        // 如果值是对象，递归地复制每一个属性
        const result: any = {};
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                result[key] = Util.deepCopy((value as any)[key]);
            }
        }

        return result as T;
    }

    static shareMsg(type: emShareType, path: emSharePath, target: any, succ: Function, param: { key?: string; data?: any; content?: string } = null, fail: Function = null) {
        if (env.PREVIEW || env.EDITOR || env.WECHAT) {
            WechatMiniApi.getInstance().showShare(type, path, target, succ, param, fail);
        }
    }

    public static showShareFailedHint() {
        let num = Random.inst.randomInt(1, 2);
        if (num == 1) {
            SdkManager.getInstance().native.showToast("请分享给其他群");
        } else {
            SdkManager.getInstance().native.showToast("请分享给其他好友");
        }

    }

    public static padMonthStart(num: number): string {
        return (num < 10 ? '0' : '') + num;
    }

    public static deepEqual<T>(obj1: T, obj2: T): boolean {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!keys2.includes(key) || !Util.deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }

    public static deepEqualAllTypes<T>(obj1: T, obj2: T): boolean {
        if (obj1 === obj2) return true;

        // 检查类型是否一致
        if (typeof obj1 !== typeof obj2) return false;

        // 检查是否为 null
        if (obj1 === null || obj2 === null) return obj1 === obj2;

        // 检查是否为数组
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!Util.deepEqual(obj1[i], obj2[i])) {
                    return false;
                }
            }
            return true;
        } else if (Array.isArray(obj1) || Array.isArray(obj2)) {
            // 一个是数组，一个不是，返回 false
            return false;
        }

        // 检查是否为 Map
        if (obj1 instanceof Map && obj2 instanceof Map) {
            if (obj1.size !== obj2.size) return false;
            for (const [key, value] of obj1) {
                if (!obj2.has(key) || !Util.deepEqual(value, obj2.get(key))) {
                    return false;
                }
            }
            return true;
        } else if (obj1 instanceof Map || obj2 instanceof Map) {
            // 一个是 Map，一个不是，返回 false
            return false;
        }

        // 检查是否为 Set
        if (obj1 instanceof Set && obj2 instanceof Set) {
            if (obj1.size !== obj2.size) return false;
            for (const value of obj1) {
                if (!obj2.has(value)) {
                    return false;
                }
            }
            return true;
        } else if (obj1 instanceof Set || obj2 instanceof Set) {
            // 一个是 Set，一个不是，返回 false
            return false;
        }

        // 检查是否为 Date
        if (obj1 instanceof Date && obj2 instanceof Date) {
            return obj1.getTime() === obj2.getTime();
        } else if (obj1 instanceof Date || obj2 instanceof Date) {
            // 一个是 Date，一个不是，返回 false
            return false;
        }

        // 检查是否为正则表达式
        if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
            return obj1.toString() === obj2.toString();
        } else if (obj1 instanceof RegExp || obj2 instanceof RegExp) {
            // 一个是 RegExp，一个不是，返回 false
            return false;
        }

        // 检查是否为对象
        if (typeof obj1 === 'object' && typeof obj2 === 'object') {
            const keys1 = Object.keys(obj1 as any);
            const keys2 = Object.keys(obj2 as any);

            if (keys1.length !== keys2.length) return false;

            for (let key of keys1) {
                if (!keys2.includes(key) || !Util.deepEqual((obj1 as any)[key], (obj2 as any)[key])) {
                    return false;
                }
            }
            return true;
        }

        // 其他类型直接比较
        return obj1 === obj2;
    }

    public static arraysAreEqualDeep<T>(arr1: T[], arr2: T[]): boolean {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (!Util.deepEqual(arr1[i], arr2[i])) {
                return false;
            }
        }
        return true;
    }
    // public static extractNumberFromKey(key) {
    //     // 定义一个正则表达式，匹配中间的数字
    //     const regex = /\D+(\d+)\D+/;

    //     // 使用正则表达式进行匹配
    //     const match = key.match(regex);

    //     // 如果匹配成功，返回匹配到的数字部分
    //     return match ? match[1] : null;
    // }
    // public static isTwoMapEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
    //     if (map1.size !== map2.size) {
    //         return false;
    //     }
    //     for (const [key, value] of map1) {
    //         if (!map2.has(key) || map2.get(key) !== value) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }
}