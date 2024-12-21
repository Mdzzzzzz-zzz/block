export { Global as global } from "./data/Global";
export * from './util/MKPrototype';
export * as i18n from './i18n/LanguageData';
export { Events as eventType } from "./event/EventType";
export { MsgType as msgType } from "./event/MsgType";
export * from "./event/MKEvent";
export * from "./view/common/MKUICtr";
export { MKUIBase as UIBase } from "./view/common/MKUIBase";
export * from "./util/MKLocalStorage";

export { MKHttp as net } from "./net/MKHttp";
export { AudioKey as audioKey } from "./define/AudioDefine";
export * from './util/MKCopy';
export { Timer as timer } from "./util/Timer";
export { MKUtil as utils } from "./util/MKUtil";
export { MKResCtr as res } from "./util/MKResCtr";
export { MKSubResCtr as subRes } from "./util/MKResCtr"; // 子包内使用
export { MsgData as msgData } from './data/MsgData';
// export { CommonCtr as commonCtr } from "./controller/CommonCtr";
export { MKUIConfig as uiCfg } from "./view/config/MKUICfg";
import { Fsm } from "./fsm/FsmState"
export { BIEventID as biEventId } from "./define/BIDefine";

export * from "./define/GameDefine"

export const fsm = new Fsm.FsmManager();

export * from "./util/MKLog";

import { audioManager } from "./util/MKAudio";

export {SDK as sdk} from './sdk/sdk';

export const audio = audioManager.instance;