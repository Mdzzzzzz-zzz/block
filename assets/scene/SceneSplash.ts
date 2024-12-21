/*
 * @Date: 2024-09-21 11:32:01
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 21:03:32
 */
import { _decorator, assetManager, Component, director, screen, ProgressBar, ResolutionPolicy, view } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SceneSplash")
export class SceneSplash extends Component {
    @property(ProgressBar)
    bar: ProgressBar = null;
    onLoad() {
        let designSize = view.getDesignResolutionSize();
        let deviceSize = screen.windowSize;

        if (deviceSize.height / deviceSize.width > designSize.height / designSize.width) {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH);
        } else {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);
        }
    }
    start() {
        assetManager.loadBundle(
            "script",
            {
                onFileProgress: (progressData) => {
                    console.log("script 加载进度:", progressData);
                },
            },
            (err, bundle) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("脚本分包加载完成");
                    //加载loading场景
                    director.loadScene("loading", () => {
                        if (this.bar) {
                            this.bar.progress = 1;
                        }
                    });
                }
            }
        );
        // director.loadScene("loading", () => {
        //     if (this.bar) {
        //         this.bar.progress = 1;
        //     }
        // });
    }

    private progress: number;
    update(deltaTime: number) {
        this.progress = this.bar.progress;
        if (this.progress < 0.99) {
            this.progress += deltaTime * 0.05;
            this.bar.progress = this.progress;
        }
    }
}
