/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-30 10:06:50
 */
import { getItem, setItem } from "../util/MKLocalStorage";

const k_isMuteEffect = "isMuteEffect";
const k_isMuteMusic = "isMuteMusic";
const k_isAcceptTSP = "isAcceptTSP";
const k_isOpenShake = "k_isOpenShake";
const k_isOpenShakeCamera = "k_isOpenShakeCamera";

export class SettingData {
    private static _inst: SettingData = null;
    public static get inst() {
        if (SettingData._inst == null) SettingData._inst = new SettingData();
        return SettingData._inst;
    }
    constructor() {
        this._isMuteEffect = getItem(k_isMuteEffect, 0);
        this._isMuteMusic = getItem(k_isMuteMusic, 1);
        this._isAcceptTSP = getItem(k_isAcceptTSP, 0);
        this._isOpenShake = getItem(k_isOpenShake, 1);
        this._isOpenShakeCamera = getItem(k_isOpenShakeCamera, 1);
    }
    private _isMuteEffect: number;
    public get isMuteEffect(): number {
        return this._isMuteEffect;
    }
    public set isMuteEffect(value: number) {
        this._isMuteEffect = value;
        setItem(k_isMuteEffect, value);
    }
    private _isMuteMusic: number;
    public get isMuteMusic(): number {
        return this._isMuteMusic;
    }
    public set isMuteMusic(value: number) {
        this._isMuteMusic = value;
        setItem(k_isMuteMusic, value);
    }

    private _isAcceptTSP: number;
    public get isAcceptTSP(): number {
        return this._isAcceptTSP;
    }
    public set isAcceptTSP(value: number) {
        this._isAcceptTSP = value;
        setItem(k_isAcceptTSP, value);
    }

    private _isOpenShake: number;
    public get isOpenShake(): number {
        return this._isOpenShake;
    }
    public set isOpenShake(value: number) {
        this._isOpenShake = value;
        setItem(k_isOpenShake, value);
    }

    private _isOpenShakeCamera: number;
    public get isOpenShakeCamera(): number {
        return this._isOpenShakeCamera;
    }
    public set isOpenShakeCamera(value: number) {
        this._isOpenShakeCamera = value;
        setItem(k_isOpenShakeCamera, value);
    }
}
