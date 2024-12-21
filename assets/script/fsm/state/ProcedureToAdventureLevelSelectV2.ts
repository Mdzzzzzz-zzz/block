import { AssetManager, director, JsonAsset } from "cc"
import { Fsm } from "../FsmState"
import { UserAdventureLevelData } from "../../data/UserAdventureLevelData"
import { ResManager } from "../../resource/ResManager";
import { LanguageManager } from "../../data/LanguageManager";

export class ProcedureToAdventureLevelSelectV2 extends Fsm.FsmState {
    constructor() {
        super("ProcedureToAdventureLevelSelectV2");
    }

    onEnter() {
        super.onEnter();


    //     let batch = UserAdventureLevelData.inst.getLevelBatchNumber();

    //     let resConfig = []
    //     resConfig.push(`res/configs/level_stage${batch}`);
    //     resConfig.push(`res/configs/level_select_stage${batch}`);

    //     for (let i = 0; i < resConfig.length; i++) {
    //         ResManager.getInstance().loadAsset(resConfig[i], "block")
    //     }

        director.loadScene("adventure_level_selectv2", () => {
            this.onClearAsset();
        });
    }

    onClearAsset() {

    }

    onExit() {
        super.onExit();
    }

    // private loadJsonAssets(bundle: AssetManager.Bundle, jsonRes: string[]) {
    //     const totalJsonCount = jsonRes.length;
    //     let loadJsonCount = 0;

    //     return jsonRes
    //         .reduce((promise, element) => {
    //             return promise.then(
    //                 () =>
    //                     new Promise<void>((resolve, reject) => {
    //                         bundle.load<JsonAsset>(element, (err, data) => {
    //                             if (err) {
    //                                 console.error(err);
    //                                 reject(err);
    //                                 return;
    //                             }
    //                             resolve();
    //                         });
    //                     })
    //             );
    //         }, Promise.resolve())
    //         .then(() => {
                
    //         });
    // }
}

// test
const win = window as any;

if (!win.Procedure) {
    win.Procedure = {};
}

win.Procedure.ProcedureToAdventureLevelSelectV2 = ProcedureToAdventureLevelSelectV2;