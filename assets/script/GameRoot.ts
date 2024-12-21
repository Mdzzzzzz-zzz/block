import { _decorator, Component, AudioSource, assert, Game, game, sys, Node, director } from "cc";
import { mk } from "./MK";
import { MsgData } from "./data/MsgData";
import { PanelManager } from "./panel/PanelManager";
import { ProcedureLaunch } from "./fsm/state/ProcedureLaunch";
import { NodePoolManager } from "./util/NodePool";
import { ResManager } from "./resource/ResManager";
import { NetManager } from "./net/NetManager";
import { ToastManager } from "./toast/ToastManager";

const { ccclass, property, requireComponent } = _decorator;

// macro.CLEANUP_IMAGE_CACHE = false;
// dynamicAtlasManager.enabled = true;
// dynamicAtlasManager.maxFrameSize = 512;

// 游戏入口
@ccclass("GameRoot")
@requireComponent(AudioSource)
export class GameRoot extends Component {
    @property(Node)
    panel: Node = null;
    @property(Node)
    pool: Node = null;
    @property(Node)
    panelMask: Node = null;

    onLoad() {
        // if (env.NATIVE) {
        //     game.frameRate = 60;
        // } else if (env.MINIGAME) {
        //     if (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX) {
        //         game.frameRate = 60;
        //     } else {
        //         game.frameRate = 30;
        //     }
        // } else {
        //     game.frameRate = 60;
        // }
        game.frameRate = 60;
        director.addPersistRootNode(this.node);
        ResManager.getInstance().Init();
        ToastManager.getInstance().Init();
        // mk.log(LanguageManager.translateText("label_text.formatStr").format("数据1", "结果"))
        // console.log("game version : ", buildInfo.gameVersion)
        // console.log("debug mode: ", buildInfo.debug)
        // console.log("hot version : ", buildInfo.hotVersion)

        this.listenGameState();
        this.initAudio();
        PanelManager.inst.setRootNode(this.panel, this.panelMask);
        NodePoolManager.inst.rootNode = this.pool;
        mk.fsm.changeState(ProcedureLaunch);
        // mk.eventUpdate(game.deltaTime);
        // mk.fsm.onUpdate();
        // mk.sdk.instance.login((_result) => {
        //     console.log("登录结果", _result);
        //     const result = JSON.parse(_result);
        //     MsgData.UserInfo = {
        //         userId: parseInt(result.userId),
        //         nonce: result.authorCode
        //     };
        //     console.log("登录结果", result.userId, result.authorCode);
        // }, (msg) => {
        //     console.log("登录失败了哦", msg);
        // });

        // 调试用
        // if (env.PREVIEW||env.EDITOR) {
        //     window["mk"] = mk;
        //     this.openID2UserID(mk.utils.deviceId());
        // }
    }
    protected start(): void {}

    openID2UserID(id: string) {
        console.log("login id = " + id);
        console.log(mk.utils.getSDKURL());
        mk.net.post({
            url: mk.utils.getSDKURL(),
            param: { token: id, nonce: "1", type: mk.global.PlatformTest },
            callback: (err, param: any) => {
                if (param.error_code == 0) {
                    mk.log("success", param.result);
                    MsgData.UserInfo = param.result;
                } else {
                    mk.error("error_code:" + param.error_code, param.error_info);
                }
            },
        });
    }

    // update(deltaTime: number) {
    //     mk.eventUpdate(deltaTime);
    //     // mk.fsm.onUpdate();
    // }

    private listenGameState() {
        game.on(Game.EVENT_HIDE, () => {
            mk.log("game hide ~");
            mk.sendEvent(mk.eventType.EVENT_HIDE);
        });
        game.on(Game.EVENT_SHOW, () => {
            mk.log("game show ~");
            mk.sendEvent(mk.eventType.EVENT_SHOW);
        });
    }

    private initAudio() {
        const audioSource = this.node.getComponent(AudioSource)!;
        assert(audioSource);
        // resources.load(mk.audioKey.GAME_MUSIC, AudioClip, (error, audioClip) => {
        //     assert(audioClip, `clip : {name} don\'t exists;`);
        //     this._audioSource.clip = audioClip;
        //     mk.audio.playMusic(true);
        // });
        mk.audio.init(audioSource);
    }
    // onEvtRewardStateChange(dt: dtCrossAdRewardChange) {
    //     if (dt.rewardValue > 0) {
    //         SdkManager.getInstance().native.showToast(`获得 ${dt.rewardName} +${dt.rewardGetValue}`);
    //     }
    // }
    // onEvtGotoMiniGameSuccess(data: dtRawAdInfo) {
    //     let dataInst = CrossAdRewardData.inst;
    //     if (dataInst.isCanGetReward(data)) {
    //         dataInst.gotReward(data);
    //     }
    // }
    // onEvtCrossAdExChangeReward(dt: dtCrossAdExchange) {
    //     if (dt.exchangeCount > 0 && dt.exchangeId == 1001) {
    //         SdkManager.getInstance().native.showToast(`获得 ${dt.exchangeName} +${dt.exchangeCount}`);
    //         UserHammerData.inst.addItem(dt.exchangeCount, true);
    //     }
    // }

    /**
     * 启动后做一次数据容错和校验
     */
    private initData() {
        // let maxLevel = UserCollectLevelData.inst.getMaxHistoryLevel();
    }
    protected onDestroy(): void {
        ResManager.getInstance().UnInit();
        NetManager.getInstance().UnInit();
        // SdkEventManager.getInstance().unregister(SdkEventType.GO_TO_MINIGAME_SUCCESS, this.onEvtGotoMiniGameSuccess, this)
        //     .unregister(SdkEventType.CROSS_AD_REWARD_EXCHANGE_CHANGE, this.onEvtCrossAdExChangeReward, this)
        //     .unregister(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, this.onEvtRewardStateChange, this);
    }
}
