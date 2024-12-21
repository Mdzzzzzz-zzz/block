import { Fsm } from "../FsmState";
import * as env from "cc/env";
import { IBundleConfig, buildInfo } from "../../Boot";
import { mk } from "../../MK";
import { UserData } from "../../data/UserData";
import { ResManager } from "../../resource/ResManager";
import { AssetInfoDefine } from "../../define/AssetInfoDefine";
import { Prefab, JsonAsset, AssetManager, game, director } from "cc";
import { UserHammerData } from "../../data/UserHammerData";
import { UserChangeData } from "../../data/UserChangeData";
import { UserHRocketData } from "../../data/UserHRocketData";
import { UserVRocketData } from "../../data/UserVRocketData";
import { LanguageManager } from "../../data/LanguageManager";
import { BIEventID } from "../../define/BIDefine";
import { FlagData } from "../../data/FlagData";
import { GuideData } from "../../data/GuideData";
import { NetManager } from "../../net/NetManager";
import { evtNetwork } from "../../net/NetDefine";
import { ToastManager } from "../../toast/ToastManager";
import { RemoteConfig } from "../../RemoteConfig/RemoteConfig";
import { SdkManager } from "../../minigame_sdk/scripts/SdkManager";
import { UserAdventureLevelData } from "../../data/UserAdventureLevelData";
import { Util } from "../../games/block/script/logic/Util";

export class ProcedureLaunch extends Fsm.FsmState {
    private subGameConfig: IBundleConfig;
    checkNetworkInterval: number;
    isNetworkAvailable: boolean;

    constructor() {
        super("ProcedureLaunch");
    }

    private downloadProgress = [0, 0, 0, 0, 0, 0];
    private totalDownTask = 6;

    onEnter() {
        super.onEnter();
        if (env.PREVIEW || env.EDITOR) {
            // localStorage.clear();
        }
        let network = NetManager.getInstance().Init();
        network.event.on(evtNetwork.networkChange, this.onNetworkChange, this);
        this.initData();
        network.checkNetwork().then(this.onNetworkReconnect.bind(this)).catch(this.onNetworkDisconnect.bind(this));
    }

    private onNetworkChange(isConnected, networkType) {
        if (!isConnected || networkType == "none") {
            this.onNetworkDisconnect();
        }
        // else{
        //     this.onNetworkReconnect();
        // }
    }

    private setupResourceLoader() {
        this.subGameConfig = buildInfo.bundle["block"];

        if (!this.subGameConfig) {
            // director.loadScene('game');
            return;
        }

        const op = {
            bundleName: this.subGameConfig.bundleName,
            keepSub: false,
        };

        const prefabRes = [
            "res/prefab/blocks/blockEntity",
            "res/prefab/blocks/block-normal",
            "res/prefab/blocks/ef_cleaarup_heng_pb",
            "res/prefab/blocks/ef_cleaarup_shu_pb",
            "res/prefab/blocks/block-normal-level",
            // "res/prefab/effect/fangge_kaichang_ani",
            // "res/prefabs/effect_art/effect/ef_breakrecords_pb",
            AssetInfoDefine.prefab.comboScore.path,
            AssetInfoDefine.prefab.cool.path,
            AssetInfoDefine.prefab.addScore.path,
            AssetInfoDefine.prefab.reachPercent.path,
            AssetInfoDefine.prefab.reachEnhance.path,
            // AssetInfoDefine.prefab.clear_all.path,
            // AssetInfoDefine.prefab.clear_all_qipan.path,
            // AssetInfoDefine.prefab.adventure_btn.path,
            // AssetInfoDefine.prefab.adventure_num_dark.path,
            // AssetInfoDefine.prefab.adventure_num_normal.path,
        ];

        const guideRes = [
            "res/effectres/guide/eui_guidefk1_particle",
            "res/effectres/guide/eui_guidefk1_bgle_pb",
            "res/effectres/guide/eui_guidefk1_le_pb",
            "res/effectres/guide/eui_guidefk2_le_pb",
            "res/effectres/guide/eui_guidefk2_bgle_pb",
            "res/effectres/guide/eui_guidefk2_particle",
            "res/effectres/guide/eui_guidefk3_le_pb",
            "res/effectres/guide/eui_guidefk2_bgle_pb-001",
            "res/effectres/guide/eui_guidefk2_particle-001",
            "res/effectres/guide/eui_guidefk3_bgle_pb-001",
            "res/effectres/guide/eui_guidefk3_particle-001",
        ];

        if (!GuideData.inst.isGuideFinished()) {
            prefabRes.push(...guideRes);
        }
        // let adventureConfigPath = UserAdventureLevelData.inst.getLevelConfigPath();
        const jsonRes = [
            "res/configs/language",
            "res/configs/block",
            "res/configs/global",
            "res/configs/level_block",
            "res/configs/score_block",
            "res/configs/score_new_block",


            "res/configs/level_stage1",
            "res/configs/level_stage2",
            "res/configs/level_stage3",
            "res/configs/level_stage4",
            "res/configs/level_stage5",
            "res/configs/level_stage6",
            "res/configs/level_stage7",
            "res/configs/level_stage8",
            "res/configs/level_stage9",
            "res/configs/level_stage10",

            "res/configs/level_blockLevel",
            // "res/configs/level_select_stage1",
            // "res/configs/level_select_stage2",
            // "res/configs/level_select_stage3",
            // "res/configs/level_select_stage4",
            // "res/configs/level_select_stage5",
            // "res/configs/level_select_stage6",
            // "res/configs/level_select_stage7",
            // "res/configs/level_select_stage8",
            // "res/configs/level_select_stage9",
            // "res/configs/level_select_stage10",

            // "res/configs/level_month1",
            // "res/configs/level_month2",
            // "res/configs/level_month3",
            // "res/configs/level_month4",
            // "res/configs/level_month5",
            // "res/configs/level_month6",
            // "res/configs/level_month7",
            // "res/configs/level_month8",
            // "res/configs/level_month9",
            // "res/configs/level_month10",
            // "res/configs/level_month11",
            // "res/configs/level_month12",
        ];
        // let batch = UserAdventureLevelData.inst.getLevelBatchNumber();
        // console.log("batch", batch);
        // jsonRes.push(`res/configs/level_stage${batch}`);
        // if (batch < 10) {
        //     jsonRes.push(`res/configs/level_stage${batch + 1}`);
        // }
        // jsonRes.push(`res/configs/level_select_stage${batch}`);
        // if (batch < 10) {
        //     jsonRes.push(`res/configs/level_select_stage${batch + 1}`);
        // }
        let month = new Date().getMonth() + 1;
        jsonRes.push(`res/configs/level_month${month}`);
        if (month != 12) {
            jsonRes.push(`res/configs/level_month${month + 1}`);
        } else {
            jsonRes.push(`res/configs/level_month1`);
        }

        this.initResourceLoader(op, prefabRes, jsonRes);
    }

    private initResourceLoader(op: { bundleName: string; keepSub: boolean }, prefabRes: string[], jsonRes: string[]) {
        const resLoader = ResManager.getInstance();

        resLoader
            .loadBundleWithProgress(
                op.bundleName,
                (progress) => {
                    this.updateDownloadProgress(1, progress);
                },
                this
            )
            .then((bundle) => {
                this.updateDownloadProgress(1, 100);
                return Promise.all([
                    this.loadBundleResources(bundle, this.subGameConfig.loadDir, "block"),
                    this.loadRemoteConfig(),
                    this.loadJsonAssets(bundle, jsonRes),
                    this.loadPrefabs(bundle, prefabRes),
                    this.preloadScene(bundle),
                ])
                // return this.loadBundleResources(bundle, this.subGameConfig.loadDir, "block")
                //     .then(() => this.loadPrefabs(bundle, prefabRes))
                //     .then(() => this.loadJsonAssets(bundle, jsonRes))
                //     .then(() => this.preloadScene(bundle));
            })
            .catch((err) => {
                console.error(err);
                this.retryResourceLoader();
            });
    }

    private loadBundleResources(bundle: any, loadDir: string[], bundleName: string) {
        return ResManager.getInstance()
            .loadBundleRes(loadDir, bundleName, (finished, total) => {
                this.updateDownloadProgress(2, (finished / total) * 100);
            })
            .then(() => {
                this.updateDownloadProgress(2, 100);
            });
    }

    private loadPrefabs(bundle: AssetManager.Bundle, prefabRes: string[]) {
        const totalLoadCount = prefabRes.length;
        let loadCount = 0;

        return prefabRes
            .reduce((promise, element) => {
                return promise.then(
                    () =>
                        new Promise<void>((resolve, reject) => {
                            bundle.load<Prefab>(element, (err, data) => {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                    return;
                                }
                                loadCount++;
                                this.updateDownloadProgress(3, (loadCount / totalLoadCount) * 100);
                                resolve();
                            });
                        })
                );
            }, Promise.resolve())
            .then(() => {
                this.updateDownloadProgress(3, 100);
            });
    }

    private loadJsonAssets(bundle: AssetManager.Bundle, jsonRes: string[]) {
        const totalJsonCount = jsonRes.length;
        let loadJsonCount = 0;

        return jsonRes
            .reduce((promise, element) => {
                return promise.then(
                    () =>
                        new Promise<void>((resolve, reject) => {
                            bundle.load<JsonAsset>(element, (err, data) => {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                    return;
                                }
                                if (element === "res/configs/language") {
                                    window["languages"] = data.json;
                                    LanguageManager.updateRenders();
                                } else if (element === "res/configs/block") {
                                    window["BlockConst"] = data.json;
                                }
                                loadJsonCount++;
                                this.updateDownloadProgress(4, (loadJsonCount / totalJsonCount) * 100);
                                resolve();
                            });
                        })
                );
            }, Promise.resolve())
            .then(() => {
                this.updateDownloadProgress(4, 100);
            });
    }

    private preloadScene(bundle: any) {
        return new Promise<void>((resolve) => {
            // if (UserData.inst.isNewRegister) {
            //     director.preloadScene("game", () => {
            //         this.updateDownloadProgress(5, 100);
            //         resolve();
            //     });
            // } else 
            {
                bundle.preloadScene("home", () => {
                    Util.createOrGetPool("SelectBoardPool", "res/prefab/blocks/blockEntity", 30 * 18)
                    console.log("preloadScene")
                    Util.createOrGetPool("MyWorkPool", "res/prefab/blocks/blockEntity", 30 * 18)
                    this.updateDownloadProgress(5, 100);
                    resolve();
                });
            }
        });
    }

    private loadRemoteConfig() {
        return new Promise<void>((resolve, reject) => {
            RemoteConfig.LoadRemote()
                .then((config) => {
                    this.updateDownloadProgress(6, 100);
                    resolve();
                })
                .catch((err) => {
                    console.error(err);
                    this.updateDownloadProgress(6, 100);
                    resolve();
                });
        });
    }

    private updateDownloadProgress(taskIndex: number, progress: number) {
        this.downloadProgress[taskIndex - 1] = progress;
        let totalProgress = this.downloadProgress.reduce((acc, curr) => acc + curr, 0);
        let allProgress = this.totalDownTask * 100;
        if (env.PREVIEW) {
            console.log("下载进度：", taskIndex, totalProgress, allProgress);
        }
        mk.sendEvent(mk.eventType.EVENT_PRELOAD_RES, totalProgress, allProgress);
    }

    private onNetworkDisconnect() {
        console.log("Network disconnected. Waiting for reconnection...");
        this.isNetworkAvailable = false;
        ToastManager.getInstance().showToast("请检查网络环境！");
        const checkNetwork = () => {
            NetManager.getInstance()
                .checkNetwork()
                .then(() => {
                    console.log("Network reconnected. Retrying resource loading...");
                    clearInterval(this.checkNetworkInterval);
                    this.onNetworkReconnect();
                })
                .catch(() => {
                    ToastManager.getInstance().showToast("请检查网络环境！");
                    console.log("Still no network. Waiting...");
                });
        };

        this.checkNetworkInterval = setInterval(checkNetwork, 2000);
    }

    private onNetworkReconnect() {
        this.isNetworkAvailable = true;
        this.retryTimes = 3;
        console.log("Network is ok. trying resource loading...");
        this.setupResourceLoader();
    }
    private retryTimes = 3;
    private retryResourceLoader() {
        setTimeout(() => {
            console.log("load is err. trying resource loading...", this.retryTimes);
            if (this.retryTimes <= 0) {
                ToastManager.getInstance().showToast("尝试重启");
                game.restart();
                return;
            }
            this.retryTimes -= 1;
            this.setupResourceLoader();
        }, 1000);
    }

    onAgreePolicy() {
        // this.gotoFirstScene();
    }

    private initData() {
        LanguageManager.initLocalLanguage();
        const deviceId = mk.utils.deviceId();
        mk.sdk.instance.loginWithGuest(deviceId);
        if (UserData.inst.isNewUser) {
            UserData.inst.isNewRegister = true;
            // UserHRocketData.inst.initItem();
            // UserVRocketData.inst.initItem();
            // UserChangeData.inst.initItem();
            UserData.inst.hasGotLoginReward = true;
            console.log("registration registration");

        } else {
            UserData.inst.isNewRegister = false;

            // 老用户旧道具加到锤子上
            if (UserHRocketData.inst.itemCount > 0) {
                UserHammerData.inst.addItem(UserHRocketData.inst.itemCount);
                UserHRocketData.inst.itemCount = 0;
            }
            if (UserVRocketData.inst.itemCount > 0) {
                UserHammerData.inst.addItem(UserVRocketData.inst.itemCount);
                UserVRocketData.inst.itemCount = 0;
            }
        }
    }

    onExit() {
        super.onExit();
        mk.unRegEvent(this);
        NetManager.getInstance().event.off(evtNetwork.networkChange, this.onNetworkChange, this);
    }

    // onUpdate() {
    //     super.onUpdate();
    // }
}

// test
const win = window as any;

if (!win.Procedure) {
    win.Procedure = {};
}

win.Procedure.launch = ProcedureLaunch;
