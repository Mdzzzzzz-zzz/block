/*
 * @Date: 2023-05-30 11:26:49
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-12 19:58:52
 */
import { getItem, setItem } from "../Boot";
import { RemoteConfig } from "../RemoteConfig/RemoteConfig";
import { UserRemoteData } from "./UserRemoteData";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
const kItemCountHammer: string = "kItemCount_Hammer";
const kItemLevelHammer: string = "kItemLevel_Hammer";
export class UserHammerData {
    private static _inst: UserHammerData = null;
    public static get inst() {
        if (UserHammerData._inst == null) UserHammerData._inst = new UserHammerData();
        return UserHammerData._inst;
    }
    public onDataCountChange: Function = null;
    private _itemCount: number = 0;
    public get itemCount(): number {
        let count = getItem(kItemCountHammer, -1);
        // console.log("localValHammer", count);
        if (count == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserHammerData();
            // console.log("remoteValHammer", remoteVal);
            if (remoteVal !== undefined && remoteVal !== null) {
                count = remoteVal;
                setItem(kItemCountHammer, remoteVal);
            } else {
                count = 1;
                setItem(kItemCountHammer, 1);
            }
        }
        if (count == undefined || count == null) {
            this._itemCount = 1;
            return this._itemCount;
        }
        this._itemCount = count;
        return this._itemCount;
    }
    public set itemCount(value: number) {
        this._itemCount = Math.max(0, value);
        // console.log("setItemHammer", value);
        setItem(kItemCountHammer, value);
        if (this.onDataCountChange) {
            this.onDataCountChange();
        }
    }
    private _itemLevel: number = 0;
    public get itemLevel(): number {
        let level = getItem(kItemLevelHammer);
        if (level == undefined || level == null) {
            this._itemLevel = 1;
            return this._itemLevel;
        }
        this._itemLevel = level;
        return this._itemLevel;
    }
    public set itemLevel(value: number) {
        this._itemLevel = Math.max(1, value);
        setItem(kItemLevelHammer, value);
    }
    constructor() {
        this._itemCount = Number(getItem(kItemCountHammer, -1));
        if (this._itemCount == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserHammerData();
            /// console.log("constructor remoteValHammer", remoteVal);
            if (remoteVal !== undefined && remoteVal !== null) {
                this._itemCount = remoteVal;
                setItem(kItemCountHammer, remoteVal);
            } else {
                this._itemCount = 1;
                setItem(kItemCountHammer, 1);
            }
        }
        this._itemLevel = Number(getItem(kItemLevelHammer, 1));
    }
    public isCanUseItem() {
        return this.itemCount > 0;
    }
    public getItemBlockIndex() {
        return 1000 + this._itemLevel;
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
        return 10;
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
        console.log("addHammerItem", cnt, overflow);
        this.itemCount = overflow ? Math.min(cnt + this.itemCount, this.getMaxOverFollowCount()) : Math.min(cnt + this.itemCount, this.getMaxItemCount());
        UserRemoteDataManager.inst.setUserHammerData(this.itemCount);
    }
    public initItem() {
        this.addItem(RemoteConfig.getInstance().PropHammerInitCount, false);
    }
    /**
     * 锤子升级 1 单块 2 十字 3 田字
     */
    public updateItemLevel() {
        if (this.itemLevel < 3) {
            this.itemLevel += 1;
        }
    }
}