/*
 * @Date: 2024-06-20 10:17:26
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-21 22:22:25
 */
import { BlockGenetateWasm } from "./BlockGenetateWasm";

export class BlockGenetateWasmAdventure extends BlockGenetateWasm {
    protected onGenPreviews(ids: Array<number>): void {
        console.log("[BlockGenertateWasmAdventure] on Genpreviews")
        if (this.round == 1) {
            let preIds = this.levelConfig.recommend || [];
            for (let i = 0; i < preIds.length && i < ids.length; i++) {
                let preId = preIds[i];
                if (preId != undefined && preId != null && preId > 0 && preId <= 54) {
                    ids[i] = preId;
                }
            }
            if (preIds.length > 0) {
                this.random.shuffleArray(ids);
            }
        }
    }
}

