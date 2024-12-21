/*
 * @Date: 2024-06-04 11:49:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-04 17:57:06
 */
import { EventTarget, sys } from "cc";
import { Singleton } from "../Singleton";
import { evtNetwork } from "./NetDefine";
let wx = null;
export class NetManager extends Singleton {
    event: EventTarget;
    public Init() {
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            wx = window["wx"];
        }
        this.event = new EventTarget();
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            if (wx.onNetworkStatusChange) {
                wx.onNetworkStatusChange((res) => {
                    let isConnected = res.isConnected;
                    let networkType = res.networkType;
                    this.event.emit(evtNetwork.networkChange, isConnected, networkType);
                    if (isConnected) {
                        this.event.emit(evtNetwork.online);
                    } else {
                        this.event.emit(evtNetwork.offline);
                    }
                });
            }
            if (wx.onNetworkWeakChange) {
                wx.onNetworkWeakChange((res) => {
                    let networkType = res.networkType;
                    let weakNet = res.weakNet;
                    this.event.emit(evtNetwork.networkWeak, networkType, weakNet);
                });
            }
        }
        return this;
    }
    public UnInit() {
        // 取消监听
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            wx.offNetworkStatusChange();
            wx.offNetworkWeakChange();
        }
    }

    public checkNetwork(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (sys.platform == sys.Platform.WECHAT_GAME) {
                wx.getNetworkType({
                    success(res) {
                        let networkType = res.networkType;
                        this.networkType = networkType;
                        if (networkType == "none") {
                            console.error("没有网络或者信号较弱:", res.signalStrength, res.hasSystemProxy);
                            reject(res);
                        } else {
                            resolve(res);
                        }
                    },
                });
            } else {
                resolve(true);
            }
        });
    }
}
