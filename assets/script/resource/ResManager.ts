import { Asset, AssetManager, assetManager, AudioClip, director, instantiate, Node, Prefab, resources, SceneAsset, SpriteFrame } from "cc";
import { JsonAsset } from "cc";
import { Singleton } from "../Singleton";

export class ResManager extends Singleton {
    public Init() { }
    public UnInit() { }
    // bundle包的加载
    loadBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            let cacheBundle = assetManager.getBundle(bundleName);
            if (cacheBundle) {
                resolve(cacheBundle);
                return;
            }
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(bundle);
                }
            });
        });
    }
    releaseBundle(bundleName: string): void {
        assetManager.removeBundle(assetManager.getBundle(bundleName));
    }
    //arg0 = {"totalBytesWritten":31707,"totalBytesExpectedToWrite":32850,"progress":96,"cookies":[]}
    public loadBundleWithProgress(bundleName: string, onProgress: Function, target: any): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            // let cacheBundle = assetManager.getBundle(bundleName);
            // if(cacheBundle){
            //     onProgress.call(target,100);
            //     resolve(cacheBundle);
            //     return;
            // }
            assetManager.loadBundle(
                bundleName,
                {
                    onFileProgress: (progressData) => {
                        onProgress.call(target, progressData.progress);
                    },
                },
                (err, bundle) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(bundle);
                    }
                }
            );
        });
    }
    public loadAsset<T extends Asset>(assetName: string, bundleName: string) {
        return new Promise<T>((resolve, reject) => {
            this.loadBundle(bundleName)
                .then((bundle) => {
                    bundle.load<T>(assetName, (error, asset) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(asset);
                    });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public loadNode(assetName: string, bundleName: string, parent?: Node) {
        return new Promise<Node>((resolve, reject) => {
            this.loadAsset<Prefab>(assetName, bundleName)
                .then((asset) => {
                    let nd = instantiate(asset);
                    if (parent) {
                        nd.setParent(parent);
                    }
                    resolve(nd);
                })
                .catch(console.error);
        });
    }
    public loadSpriteFrame(assetName: string, bundleName: string) {
        return this.loadAsset<SpriteFrame>(assetName + "/spriteFrame", bundleName);
    }
    public loadSpriteFrameSync(assetName: string, bundleName: string) {
        return this.loadAssetSync<SpriteFrame>(assetName + "/spriteFrame", bundleName);
    }
    public loadAssetSync<T extends Asset>(assetName: string, bundleName?: string) {
        let bundle: AssetManager.Bundle = resources;
        if (bundleName) {
            bundle = assetManager.getBundle(bundleName);
        }
        if (bundle) {
            const info = bundle?.getInfoWithPath(assetName);
            if (info == null || info.uuid == null) {
                return null;
            }
            return assetManager.assets.get(info.uuid) as T;
        }
        return null;
    }
    public loadAudio(assetName: string) {
        return this.loadAsset<AudioClip>(assetName, "sounds");
    }

    public loadScene(sceneName: string, bundleName: string) {
        return new Promise<SceneAsset>((resolve, reject) => {
            this.loadBundle(bundleName)
                .then((bundle) => {
                    bundle.loadScene(sceneName, (err, scene) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(scene);
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }
    public gotoScene(sceneName: string, bundleName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.loadBundle(bundleName)
                .then((bundle) => {
                    bundle.loadScene(sceneName, (err, scene) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        director.runScene(
                            scene,
                            () => { },
                            () => {
                                resolve();
                            }
                        );
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }
    public loadBundleRes(
        paths: string[] = ["res/"],
        bundleName: string,
        onProgress?: (finished: number, total: number) => void
    ) {
        return new Promise<void>((resolve, reject) => {
            if (paths.length == 0) {
                resolve();
                return;
            }
            this.loadBundle(bundleName)
                .then((bundle) => {
                    let totalPaths = [];
                    paths?.forEach((path) => {
                        totalPaths = totalPaths.concat(
                            bundle.getDirWithPath(path).map((_) => {
                                return _.path;
                            })
                        );
                    });
                    let totalCount = totalPaths.length;

                    let tasks = [];
                    for (let i = 0; i < paths.length; i++) {
                        tasks.push(
                            new Promise<void>((_resolve, _reject) => {
                                bundle.loadDir(
                                    paths[i],
                                    (finished, total, item) => {
                                        let index = -1;
                                        if (item.info) {
                                            index = totalPaths.indexOf(item.info["path"], 0);
                                        }
                                        if (index > -1) {
                                            totalPaths.splice(index, 1);
                                        }
                                        onProgress?.(totalCount - totalPaths.length, totalCount);
                                    },
                                    (error, _) => {
                                        if (error != null) {
                                            _reject();
                                            return;
                                        }
                                        _resolve();
                                        // log('bundle {0}\{1} preload success'.format(this.bundleName, paths[i]));
                                    }
                                );
                            })
                        );
                    }
                    Promise.all(tasks)
                        .then(() => {
                            resolve();
                        })
                        .catch(() => {
                            reject();
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    releaseAsset(assetName: string, bundleName?: string) {
        assetManager.getBundle(bundleName)?.release(assetName);
    }

    preloadAsset(assetName: string | string[], bundleName?: string) {
        this.loadBundle(bundleName)
            .then((bundle) => {
                bundle.preload(assetName);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    preloadScene(sceneName: string, bundleName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.loadBundle(bundleName)
                .then((bundle) => {
                    bundle.preloadScene(sceneName, () => {
                        resolve(sceneName);
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(sceneName);
                });
        });
    }
    // description:
    // 加载json文件，不需要预先加载，T为数据结构类型
    public loadJson<T>(assetName: string, bundleName: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.loadBundle(bundleName)
                .then((bundle) => {
                    bundle.load(assetName, JsonAsset, (err, asset: JsonAsset) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(asset.json as T);
                    });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
