/*
 * @Date: 2023-05-30 11:26:49
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2023-09-28 00:35:04
 */
import { getItem, setItem } from "../Boot";
import { RemoteConfig } from "../RemoteConfig/RemoteConfig";
import { UserRemoteData } from "./UserRemoteData";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
const kItemCountHRocket: string = "kItemCount_HRocket";
// const kItemLevelHammer:string ="kItemLevel_Hammer";
export class UserHRocketData {
    private static _inst: UserHRocketData = null;
    public static get inst() {
        if (UserHRocketData._inst == null) UserHRocketData._inst = new UserHRocketData();
        return UserHRocketData._inst;
    }
    public onDataCountChange: Function = null;
    private _itemCount: number = 0;
    public get itemCount(): number {
        let count = getItem(kItemCountHRocket, -1);
        if (count == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserHRocketData();
            if (remoteVal !== undefined && remoteVal !== null) {
                count = remoteVal;
                setItem(kItemCountHRocket, remoteVal);
            } else {
                count = 1;
                setItem(kItemCountHRocket, 1);
            }
        }
        if (count == undefined || count == null) {
            this._itemCount = 1
            return this._itemCount;
        }
        this._itemCount = count;
        return this._itemCount;
    }
    public set itemCount(value: number) {
        this._itemCount = Math.max(0, value);
        setItem(kItemCountHRocket, value);
        if (this.onDataCountChange) {
            this.onDataCountChange();
        }
    }
    // private _itemLevel: number = 0;
    // public get itemLevel(): number {
    //     let level = getItem(kItemLevelHammer);
    //     if (level == undefined || level == null) {
    //         this._itemLevel = 1;
    //         return this._itemLevel;
    //     }
    //     this._itemLevel = level;
    //     return this._itemLevel;
    // }
    // public set itemLevel(value: number) {
    //     this._itemLevel =Math.max(1,value);
    //     setItem(kItemLevelHammer, value);
    // }
    constructor() {
        this._itemCount = Number(getItem(kItemCountHRocket, -1));
        if (this._itemCount == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserHRocketData();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._itemCount = remoteVal;
                setItem(kItemCountHRocket, remoteVal);
            } else {
                this._itemCount = 1;
                setItem(kItemCountHRocket, 1);
            }
        }
        // this._itemLevel = Number(getItem(kItemLevelHammer, 1));
    }
    public isCanUseItem() {
        return this.itemCount > 0;
    }
    /**
     * todo 升级解锁数量或者范围
     * @returns 
     */
    public getMaxItemCount() {
        return 10000;
    }
    /**
     * 最多溢出5个
     * @returns 
     */
    public getMaxOverFollowCount() {
        return 5;
    }
    /**
     * 使用锤子敲掉对应的位置
     * @returns 
     */
    public useItem() {
        if (!this.isCanUseItem()) {
            return;
        }
        this.itemCount = Math.max(0, this.itemCount - 1);
    }
    /**
     * 添加锤子 是否可以溢出 溢出不允许超过最大数量
     * @param cnt 
     * @param overflow
     */
    public addItem(cnt: number, overflow: boolean = false) {
        this.itemCount = overflow ? Math.min(cnt + this.itemCount, this.getMaxOverFollowCount()) : Math.min(cnt + this.itemCount, this.getMaxItemCount());
    }
    public initItem() {
        this.addItem(RemoteConfig.getInstance().PropHRocketInitCount, false);
    }
    /**
     * 锤子升级 1 单块 2 十字 3 田字
     */
    // public updateItemLevel(){
    //     if(this.itemLevel<3){
    //         this.itemLevel+=1;
    //     }
    // }
    // public getItemBlockIndex(){
    //     return 1000+this._itemLevel;
    // }
}