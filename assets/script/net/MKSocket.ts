import { sys, TextAsset } from "cc";
import { InterfaceCtr } from "../controller/InterfaceCtr";
import { MsgType } from "../event/MsgType";
import { log } from "../util/MKLog";
import { MKResCtr } from "../util/MKResCtr";

export enum NetStat {
    None = 1,
    Connecting,
    Connected,
    Colosed
}

export interface WSEvent {
    data: string
  }

export const SocketEvent = {
    ON_CONNECTED: "on_connected",
    ON_CLOSE: "on_close",
    ON_MESSAGE: "on_message",
    ON_ERROR: "on_error",
}

export class MKSocket {
    // private _url: string = "";
    // private _netStat: NetStat = NetStat.None;
    // private _ws: WebSocket = null;
    // private controller:InterfaceCtr = null;

    // constructor(ctr:InterfaceCtr){
    //     this.controller = ctr;
    // }

    // setURL(url: string): void {
    //     this._url = url;
    // }

    // getURL(): string {
    //     return this._url;
    // }

    // getNetStat(): NetStat {
    //     return this._netStat;
    // }

    // connect(): void {
    //     if(this._netStat == NetStat.None || this._netStat == NetStat.Colosed) {
    //         if (this._ws) {
    //             this._ws = null;
    //         }
    //         if (sys.isNative && sys.os == sys.OS.ANDROID) {
    //             MKResCtr.loadAsset<TextAsset>('cacert').then((asset)=>{
    //                 this._ws = new WebSocket(this._url,  asset.nativeUrl);
    //                 this.setCallback();
    //             });
    //         } else {
    //             this._ws = new WebSocket(this._url);
    //             this.setCallback();
    //         }
    //     }
    // }

    // setCallback(){
    //     this._ws.onopen = this.onOpen.bind(this);
    //     this._ws.onmessage = this.onMessage.bind(this);
    //     this._ws.onclose = this.onClose.bind(this);
    //     this._ws.onerror = this.onError.bind(this);
    // }

    // disconnect(): void {
    //     if (this._ws && this._netStat == NetStat.Connected) {
    //         this._ws.close();
    //     }
    // }

    // send(msg: any): void {
    //     if (this._netStat == NetStat.Connected && this._ws) {
    //         let msgStr = "";
    //         if (typeof(msg) == "string") {
    //             msgStr = msg;
    //         } else {
    //             msgStr = JSON.stringify(msg);
    //         }
    //         if (msg.cmd != MsgType.HEARTBEAT){
    //             log('[Socket Send]', msgStr);
    //         }
    //         this._ws.send(msgStr);
    //     }
    // }

    // onOpen() {
    //     this._netStat = NetStat.Connected;
    //     this.controller.onConnect();
    // }

    // onMessage(event: WSEvent) {
    //     const str = event.data.slice(4);
        
    //     const data = JSON.parse(str);
    //     if (data.cmd != MsgType.HEARTBEAT){
    //         // log('[Socket Recv]',str);
    //     }
    //     this.controller.onMessage(data);
    // }

    // onClose() {
    //     this._netStat = NetStat.Colosed;
    //     this.controller.onClose();
    // }

    // onError() {
    //     this.controller.onError();
    // }

    // isConnected(): boolean {
    //     return this._netStat == NetStat.Connected;
    // }
}
