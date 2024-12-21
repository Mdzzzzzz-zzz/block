// import {ProcedureToGame} from '../fsm/state/ProcedureToGame';
// import {buildInfo} from '../define/GameDefine';
// import { Global } from '../data/Global';
// import { MsgData } from '../data/MsgData';
// import { MKSocket } from '../net/MKSocket';
// import { MKHeartbeat } from './MKHeartbeat';
import { InterfaceCtr } from './InterfaceCtr';
// import { MsgType } from '../event/MsgType';
// import { sendEvent } from '../event/MKEvent';
// import { Fsm } from '../fsm/FsmState';
// import { Timer } from '../util/Timer';
// import { Events } from '../event/EventType';
// import { sys } from 'cc';
// import { mk } from '../MK';

export interface IMsgData<T> {
    cmd: string,
    error_code: number,
    error_info: string,
    userId: number,
    result: T
}

export class CommonCtr implements InterfaceCtr {

    // public socket: MKSocket = null;
    // public heartbeat: MKHeartbeat = null;
    // public fsm = new Fsm.FsmManager();

    // private static _inst: CommonCtr = null;
    // public static get inst () {
    //     if (CommonCtr._inst == null) CommonCtr._inst = new CommonCtr();
    //     return CommonCtr._inst;
    // }

    // constructor () {
    //     this.socket = new MKSocket(this);
    //     this.heartbeat = new MKHeartbeat(this);
    // }

    // doHeartbeat () {
    //     this.sendHeartbeat();
    // }

    // onRecvHeartbeat () {
    //     this.heartbeat.onHeartbeat();
    // }

    // doTimeOut () {
    //     this.reConnect();
    // }

    // sendMsg (cmd: string, params?: object) {
    //     const request = {
    //         "cmd": cmd,
    //         "userId": MsgData?.UserInfo?.userId
    //     };
    //     if (params) request["params"] = params;
    //     if (MsgType.HEARTBEAT != cmd)
    //         console.log("[send Msg]", request);
    //     this.socket.send(request);
    // }

    // sendHeartbeat () {
    //     this.sendMsg(MsgType.HEARTBEAT);
    // }

    // reConnect () {
    //     this.socket.disconnect();
    //     this.socket.connect();
    // }

    // refreshPage () {
    //     location.reload();
    // }

    // onConnect () {
    //     if (sys.os == sys.OS.ANDROID && !buildInfo.debug) {
    //         this.bindUser();
    //     } else {
    //         this.login();
    //     }

    //     this.heartbeat.onConnect();
    // }

    // onMessage (msg: IMsgData<any>) {
    //     if (msg.error_code != 0) {
    //         console.error("onMsg:", msg.error_code, msg.error_info);
    //         return;
    //     }

    //     if (msg.cmd != MsgType.HEARTBEAT) {
    //         console.log("onMsg:", msg.cmd, msg.result);
    //     }

    //     if (msg.cmd) {
    //         const result = this.dispatchMsg(msg);
    //         result && sendEvent(msg.cmd, msg);
    //     }
    // }

    // /**
    //  *
    //  * @param msg
    //  * @returns  表示true是否需要统一事件通知，false自己处理的事件通知
    //  */
    // dispatchMsg (msg: IMsgData<any>): boolean {
    //     if (msg.cmd == MsgType.HEARTBEAT) {
    //         this.onRecvHeartbeat();
    //     } else if (msg.cmd == MsgType.LOGIN || msg.cmd == MsgType.BIND_USER) {
    //         this.onRecvLogin(msg);
    //     } else if (msg.cmd == MsgType.LOBBY) {
    //         this.onRecvLobby(msg);
    //     } else if (msg.cmd == MsgType.MATCH_LIST) {
    //         this.onRecvMatchList(msg);
    //     } else if (msg.cmd == MsgType.GAME_SIGN_UP) {
    //         this.onRecvSignUp(msg);
    //     } else if (msg.cmd == MsgType.GAME_START) {
    //         Global.curGameSN = msg.result.sn;
    //         // setItem("kLastGameSn", msg.result.sn);
    //         this.onRecvGameStart(msg);
    //     } else if (msg.cmd == MsgType.GAME_SIGN_OUT) {
    //         this.onRecvSignOut(msg);
    //     } else if (msg.cmd == MsgType.GAME_RESULT) {
    //         this.onRecvGameResult(msg);
    //     } else if (msg.cmd == MsgType.GAME_JOIN) {
    //         this.onRecvJoin(msg);
    //     } else if (msg.cmd == MsgType.GAME_AWAY) {
    //         this.onRecvAway(msg);
    //     }
    //     return true;
    // }

    // onRecvGameResult (msg: any) {
    //     MsgData.GameResult = msg.result;
    //     Global.curGameSN = "";
    // }

    // onError () {
    //     this.heartbeat.onClose();
    // }

    // onClose () {
    //     this.heartbeat.onClose();
    // }

    // login () {
    //     this.sendMsg(MsgType.LOGIN, {"nonce": MsgData.UserInfo.nonce});
    // }

    // bindUser () {
    //     this.sendMsg(MsgType.BIND_USER, {"authorCode": MsgData.UserInfo.nonce});
    // }

    // onRecvLogin (msg: any) {
    //     if (msg.error_code == 0) {
    //         MsgData.Login = msg.result;
    //         this.getLobby();
    //     }
    // }

    // getLobby () {
    //     // 直接进入无尽模式，无需请求lobby
    //     // this.sendMsg(MsgType.LOBBY);
    // }

    // onRecvLobby (msg: any) {
    //     // if (msg.error_info == 0) {
    //     //     MsgData.Lobby = msg.result;
    //     //     MsgData.LobbyTask = msg.result.tasks;
    //     //     this.fsm.changeState(ProcedureToLobby);
    //     // }
    // }

    // getMatchList (gameId: string) {
    //     Global.curGameID = parseInt(gameId);
    //     this.sendMsg(MsgType.MATCH_LIST, {"game_id": gameId});
    // }

    // onRecvMatchList (msg: any) {
    //     if (msg.error_code == 0) {
    //         MsgData.MatchList = msg.result;
    //     } else {
    //         console.error("error_code:" + msg.error_code, msg.error_info);
    //     }
    // }

    // sendSignUp () {

    //     mk.global.curGameID = 6;
    //     mk.global.curMatchID = 6000 + 15;
    //     const id = mk.global.curGameID;
    //     const matchId = mk.global.curMatchID;

    //     this.sendMsg(MsgType.GAME_SIGN_UP, {
    //         "game_id": id,
    //         "match_id": parseInt(matchId.toString())
    //     });
    // }

    // onRecvSignUp (msg: any) {
    //     if (msg.error_code == 0) {
    //         // MsgData.SignUp = msg.result;
    //         // const path = mk.uiCfg.prefab.hallPipei;
    //         // mk.showView(path);
    //     } else {
    //         console.error("error_code:" + msg.error_code, msg.error_info);
    //     }
    // }

    // onRecvGameStart (msg: any) {
    //     MsgData.GameStart = msg.result;
    //     Global.startGameTime = Timer.unixTime();
    //     this.fsm.changeState(ProcedureToGame, "tetris");
    // }

    // sendSignOut (gameId: number, matchId: number) {
    //     this.sendMsg(MsgType.GAME_SIGN_OUT, {
    //         "game_id": gameId,
    //         "match_id": matchId
    //     });
    // }

    // onRecvSignOut (msg: any) {
    //     console.log("onMsg", msg.cmd, msg);
    // }

    // quitGame () {
    //     this.sendMsg(MsgType.GAME_QUIT, {
    //         "sn": MsgData.GameStart.sn
    //     });
    // }

    // postBroadcast (action: string, data: any) {
    //     this.sendMsg(MsgType.GAME_BROADCAST, {
    //         sn: MsgData.GameStart.sn,
    //         action: action,
    //         data: data
    //     })
    // }

    // onRecvJoin (msg: any) {
    //     if (msg.error_code == 0) {
    //         sendEvent(Events.EVENT_PIPEI_JOIN, msg);
    //     } else {
    //         console.error("error_code:" + msg.error_code, msg.error_info);
    //     }
    // }

    // onRecvAway (msg: any) {
    //     if (msg.error_code == 0) {
    //         sendEvent(Events.EVENT_PIPEI_AWAY, msg);
    //     } else {
    //         console.error("error_code:" + msg.error_code, msg.error_info);
    //     }
    // }

}