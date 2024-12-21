// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Graphics } from "cc";


export default class Utils {
 

    public static getRandom(lower, upper): number {
        return Math.random() * (upper - lower) + lower;
    };

    public static getRandomInt(lower, upper): number {
        upper++;
        return Math.floor(Math.random() * (upper - lower)) + lower;
    };

}
