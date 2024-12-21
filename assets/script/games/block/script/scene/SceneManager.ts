import { mk } from "../../../../MK";
import { ResManager } from "../../../../resource/ResManager";
import { emSceneName } from './SceneDefine';
export class SceneManager {
    private static _inst: SceneManager;
    public static get inst() {
        if (this._inst) return this._inst;
        this._inst = new SceneManager();
        return this._inst;
    }
    private isLoadingScene: boolean;
    gotoScene(sceneName:emSceneName,bundleName:string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isLoadingScene) {
                reject();
                return;
            }
            this.isLoadingScene = true;
            ResManager.getInstance().gotoScene(sceneName,bundleName).then(() => {
                this.isLoadingScene = false;
                resolve();
            }).catch(() => {
                this.isLoadingScene = false;
                reject();
            });
        });
    }
}