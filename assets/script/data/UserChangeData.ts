/*
 * @Date: 2023-05-30 11:26:49
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-07 16:35:07
 */
import { getItem, setItem } from "../Boot";
import { RemoteConfig } from "../RemoteConfig/RemoteConfig";
import { UserRemoteData } from "./UserRemoteData";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
const kItemCountChange: string = "kItemCountChange";
const kItemLevelChange: string = "kItemLevelChange";
/**
 * 换一换道具数量
 */
export class UserChangeData {
    private static _inst: UserChangeData = null;
    public static get inst() {
        if (UserChangeData._inst == null) UserChangeData._inst = new UserChangeData();
        return UserChangeData._inst;
    }
    private _itemCount: number = 0;
    public get itemCount(): number {
        let count = getItem(kItemCountChange, -1);
        if (count == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserRefreshData();
            if (remoteVal !== undefined && remoteVal !== null) {
                count = remoteVal;
                setItem(kItemCountChange, remoteVal);
            } else {
                count = 1;
                setItem(kItemCountChange, 1);
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
        setItem(kItemCountChange, value);
    }
    private _itemLevel: number = 0;
    public get itemLevel(): number {
        let level = getItem(kItemLevelChange);
        if (level == undefined || level == null) {
            this._itemLevel = 1;
            return this._itemLevel;
        }
        this._itemLevel = level;
        return this._itemLevel;
    }
    public set itemLevel(value: number) {
        this._itemLevel = Math.max(1, value);
        setItem(kItemLevelChange, value);
    }
    constructor() {
        this._itemCount = Number(getItem(kItemCountChange, -1));
        if (this._itemCount == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserRefreshData();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._itemCount = remoteVal;
                setItem(kItemCountChange, remoteVal);
            } else {
                this._itemCount = 1;
                setItem(kItemCountChange, 1);
            }
        }
        this._itemLevel = Number(getItem(kItemLevelChange, 1));
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
        UserRemoteDataManager.inst.setUserRefreshData(this.itemCount);
    }
    public initItem() {
        this.addItem(RemoteConfig.getInstance().PropRefreshInitCount, false);
    }
    /**
     * 锤子升级 1*1 2*2 3*3
     */
    public updateItem() {
        if (this.itemLevel < 2) {
            this.itemLevel += 1;
        }
    }

}