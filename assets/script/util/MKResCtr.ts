// import { trace, error, log, warn } from "./MKLog";
import {AssetManager,assetManager,find,instantiate,Prefab,Node,director,resources,Asset,SpriteFrame,TextAsset,AudioClip,js,__private} from "cc";
import { IUICfg } from "../view/config/MKUICfg";
import { JsonAsset } from "cc";

type Constructor<T = unknown> = new (...args: any[]) => T;
export type ProgressCallback = (finish: number, total: number, item: any) => void;
export type CompleteCallback<T = any> = (error: Error, resource: T) => void;
export type AssetType<T = Asset> = Constructor<T>;
export type IRemoteOptions = Record<string, any> | null;

interface ResArgs<T extends Asset> {
    bundle?: string;
    hashKey?: string;
    dir?: string;
    paths?: string | string[];
    type?: AssetType<T>;
    onProgress?: ProgressCallback;
    onComplete?: CompleteCallback<T | T[]>;
}

interface IBundleOptions {
    keepSub?: boolean; // 保存为 子bundle 后续可用 MKSubResCtr
    bundleName?: string
}

export class MKResCtr {

    static bundleName: string="block";

    static _getBundle(): AssetManager.Bundle {
        return resources;
    }

    /**
     *  提供两种加载预制体方式 Promise ， callback
     * @param cfg
     */
    public static loadPrefab(cfg: IUICfg): Promise<Prefab>;
    public static loadPrefab(cfg: IUICfg, onComplete: CompleteCallback): void;
    public static loadPrefab(cfg: IUICfg, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    public static loadPrefab(cfg: IUICfg, onProgress?: ProgressCallback | CompleteCallback, onComplete?: CompleteCallback): Promise<Prefab> | void {
        // log('resCtr loadPrefab', cfg.path);
        if (onComplete == null && onProgress == null) {
            return new Promise<Prefab>((res, rej) => {
                MKResCtr.load(cfg.bundle, cfg.path, Prefab, (err, prefab) => {
                    if (err) {
                        res(null);
                        // trace('MKResCtr load fail', err, cfg);
                    } else {
                        res(prefab);
                    }
                });
            });
        } else {
            if (onComplete == null) {
                MKResCtr.load(cfg.bundle, cfg.path, onProgress as CompleteCallback);
            } else {
                MKResCtr.load(cfg.bundle, cfg.path, onProgress as ProgressCallback, onComplete);
            }
        }
    }

    /**
     *  对cc接口的封装调用，便于控制
     * @param paths
     * @param type
     * @param onProgress
     * @param onComplete
     */
    public static load<T extends Asset>(paths: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(paths: string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string[], type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(paths: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(paths: string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string[], onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(paths: string, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(paths: string[], onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string[], onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(paths: string, type: AssetType<T> | null, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(paths: string[], type: AssetType<T> | null, onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string, type: AssetType<T> | null, onComplete: CompleteCallback<T> | null): void;
    public static load<T extends Asset>(bundleName: string, paths: string[], type: AssetType<T> | null, onComplete: CompleteCallback<T[]> | null): void;
    public static load<T extends Asset>(
        bundleName: string | string[],
        paths?: string | string[] | AssetType<T> | ProgressCallback | CompleteCallback<T | T[]> | null,
        type?: AssetType<T> | ProgressCallback | CompleteCallback<T | T[]> | null,
        onProgress?: ProgressCallback | CompleteCallback<T | T[]> | null,
        onComplete?: CompleteCallback<T | T[]> | null,
    ) {
        let args: ResArgs<T> | null = null;
        if (typeof paths === "string" || paths instanceof Array) {
            args = this.parseResArgs(paths, type, onProgress, onComplete);
            args.bundle = bundleName as string;
        } else {
            args = this.parseResArgs(bundleName, paths, type, onProgress);
        }
        this.loadAssetByArgs(args);
    }

    /**
     *   加载目录资源
     * @param bundleName
     * @param dir
     * @param type
     * @param onProgress
     * @param onComplete
     */
    public static loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T> | null, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public static loadDir<T extends Asset>(bundleName: string, dir: string, onProgress: ProgressCallback | null, onComplete: CompleteCallback<T[]> | null): void;
    public static loadDir<T extends Asset>(bundleName: string, dir: string, onComplete?: CompleteCallback<T[]> | null): void;
    public static loadDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T> | null, onComplete?: CompleteCallback<T[]> | null): void;
    public static loadDir<T extends Asset>(
        bundleName: string,
        dir: string,
        type?: AssetType<T> | ProgressCallback | CompleteCallback<T[]> | null,
        onProgress?: ProgressCallback | CompleteCallback<T[]> | null,
        onComplete?: CompleteCallback<T[]> | null,
    ) {
        let args: ResArgs<T> | null = null;
        if (typeof dir === "string") {
            args = this.parseResArgs(dir, type, onProgress, onComplete);
            args.bundle = bundleName;
        } else {
            args = this.parseResArgs(bundleName, dir, type, onProgress);
        }
        args.dir = args.paths as string;
        this.loadAssetByArgs(args);
    }

    /**
     * 加载 remote 资源
     * @param url
     * @param options
     * @param onComplete
     */
    public static loadRemote<T extends Asset>(url: string, options: IRemoteOptions | null, onComplete?: CompleteCallback<T> | null): void;
    public static loadRemote<T extends Asset>(url: string, onComplete?: CompleteCallback<T> | null): void;
    public static loadRemote<T extends Asset>(url: string, options?: IRemoteOptions | CompleteCallback<T> | null, onComplete?: CompleteCallback<T> | null) {
        assetManager.loadRemote(url, options, onComplete);
    }

    private static parseResArgs<T extends Asset>(
        paths: string | string[],
        type?: AssetType<T> | ProgressCallback | CompleteCallback | null,
        onProgress?: AssetType<T> | ProgressCallback | CompleteCallback | null,
        onComplete?: ProgressCallback | CompleteCallback | null
    ) {
        let pathsOut: any = paths;
        let typeOut: any = type;
        let onProgressOut: any = onProgress;
        let onCompleteOut: any = onComplete;
        if (onComplete === undefined) {
            const isValidType = js.isChildClassOf(type as AssetType, Asset);
            if (onProgress) {
                onCompleteOut = onProgress as CompleteCallback;
                if (isValidType) {
                    onProgressOut = null;
                }
            } else if (onProgress === undefined && !isValidType) {
                onCompleteOut = type as CompleteCallback;
                onProgressOut = null;
                typeOut = null;
            }
            if (onProgress !== undefined && !isValidType) {
                onProgressOut = type as ProgressCallback;
                typeOut = null;
            }
        }
        let finalComplete = (error: Error, resource: any | any[], urls?: string[]) => {
            if (onCompleteOut) {
                onCompleteOut(error, resource, urls);
            }
        }
        return { paths: pathsOut, type: typeOut, onProgress: onProgressOut, onComplete: finalComplete };
    }

    private static loadAssetByArgs<T extends Asset>(args: ResArgs<T>) {
        if (args.bundle) {
            const bundle = assetManager.getBundle(args.bundle);
            if (bundle) {
                this.loadByBundleAndArgs(bundle, args);
            } else {
                console.error("无bundle 请先加载", args.bundle);
            }
        } else {
            this.loadByBundleAndArgs(resources, args);
        }
    }

    private static loadByBundleAndArgs<T extends Asset>(bundle: AssetManager.Bundle, args: ResArgs<T>): void {
        if (args.dir) {
            bundle.loadDir(args.paths as string, args.type, args.onProgress, args.onComplete as CompleteCallback<T[]>);
        } else {
            if (typeof args.paths == 'string') {
                bundle.load(args.paths, args.type, args.onProgress, args.onComplete as CompleteCallback<T>);
            } else {
                bundle.load(args.paths, args.type, args.onProgress, args.onComplete as CompleteCallback<T[]>);
            }
        }
    }

    static loadSubGamePrefab(name: string, parent?: Node, callback?: (err: Error, node: Node) => void) {
        MKSubResCtr.loadPrefabNew(name, parent).then((node) => {
            callback?.(null, node);
        }).catch(() => {
            callback?.(null, null);
        });
    }

    static loadSubSpriteFrame(sfName: string, bundleName?: string) {
        return MKSubResCtr.loadSpriteFrame(sfName, bundleName);
    }

    static loadBundle(_optionsOrName: string | IBundleOptions): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            let options: IBundleOptions;
            let bundleName: string;
            if (typeof _optionsOrName == "string") {
                bundleName = _optionsOrName;
                options = {};
            } else {
                options = _optionsOrName;
                bundleName = options.bundleName;
            }

            // log("loadBundle ~ ", bundleName, options);
            assetManager.loadBundle(bundleName, options, (error, bundle) => {
                if (error) {
                    // warn("don`t have bundle ", bundleName);
                    reject(error);
                    return;
                }
                if (!options.keepSub && options.bundleName) {
                    let names = options.bundleName.split('/');
                    this.bundleName = names[names.length - 1];
                }

                resolve(bundle);
            }
            );
        });
    }

    static releaseBundle(_bundleName?: string) {
        _bundleName = _bundleName ?? this.bundleName;
        let bundle: AssetManager.Bundle = assetManager.getBundle(_bundleName);
        if (!bundle) return
        bundle.releaseAll();
        assetManager.removeBundle(bundle);
        this.bundleName = null;
    }

    static loadBundleRes(paths: string[] = ["res/"], onProgress?: (finished: number, total: number) => void) {

        return new Promise<void>((resolve, reject) => {
            let bundle: AssetManager.Bundle = this._getBundle();
            if (bundle == null) {
                // warn("don`t have bundle ", this.bundleName);
                reject();
                return;
            }

            let totalPaths = [];
            paths?.forEach((path) => {
                totalPaths = totalPaths.concat(bundle.getDirWithPath(path).map(_ => {
                    return _.path;
                }))
            })
            let totalCount = totalPaths.length;

            let tasks = [];
            for (let i = 0; i < paths.length; i++) {
                tasks.push(new Promise<void>((_resolve, _reject) => {
                    bundle.loadDir(paths[i], (finished, total, item) => {
                        let index = -1;
                        if (item.info) {
                            index = totalPaths.indexOf(item.info["path"], 0);
                        }
                        if (index > -1) {
                            totalPaths.splice(index, 1);
                        }
                        onProgress?.(totalCount - totalPaths.length, totalCount);
                    }, (error, _) => {
                        if (error != null) {
                            _reject();
                            return;
                        }
                        _resolve();
                        // log('bundle {0}\{1} preload success'.format(this.bundleName, paths[i]));
                    });
                }))
            }
            Promise.all(tasks).then(() => {
                resolve();
            }).catch(() => {
                reject();
            })
        });
    }

    static preloadBundleRes(paths?: string[]) {

        if (paths == null) return;

        let bundle: AssetManager.Bundle = this._getBundle();
        if (bundle == null) {
            // warn("don`t have bundle ", this.bundleName);
            return;
        }

        for (let i = 0; i < paths.length; i++) {
            bundle.preloadDir(paths[i]);
        }
    }

    static loadPrefabNew(prefabName: string, parent?: Node): Promise<Node> {
        return new Promise<Node>((resolve, reject) => {
            this.loadAsset<Prefab>(prefabName).then((_prefab) => {
                if (parent == null) {
                    parent = find('Canvas');
                }
                const _node: Node = instantiate(_prefab);
                parent?.addChild(_node);
                resolve(_node);
            }).catch(reject);
        });
    }

    static loadAsset<T extends Asset>(assetName: string, bundleName?: string | IBundleOptions) {
        return new Promise<T>((resolve, reject) => {
            let bundle: AssetManager.Bundle;
            if (bundleName == null) {
                bundle = this._getBundle();
            } else {
                this.loadBundle(bundleName).then((_bundle) => {
                    this._loadAsset<T>(assetName, _bundle).then((_) => {
                        resolve(_);
                    }).catch(reject);
                }).catch(() => {
                    // warn("don`t have bundle ", this.bundleName);
                    reject();
                })
            }
            if (bundle == null) {
                // warn("don`t have bundle ", this.bundleName);
                reject();
                return;
            }
            this._loadAsset<T>(assetName, bundle).then((_) => {
                resolve(_);
            }).catch(reject);
        });
    }

    private static _loadAsset<T extends Asset>(assetName: string, bundle: AssetManager.Bundle) {
        return new Promise<T>((resolve, reject) => {
            bundle.load<T>(assetName, (error, _) => {
                if (error) {
                    // warn('loadAsset error {0} with {1}'.format(error, "type "));
                    reject();
                    return;
                }
                // log('load{0}Asset {1} : success'.format(_.constructor.name, assetName));
                resolve(_);
            });
        })
    }

    static loadTextAsset(assetName: string, bundleName?: string) {
        return this.loadAsset<TextAsset>(assetName, bundleName);
    }

    static loadSpriteFrame(assetName: string, bundleName?: string) {
        return this.loadAsset<SpriteFrame>(assetName + "/spriteFrame", bundleName);
    }

    static loadAudio(assetName: string, bundleName?: string) {
        return this.loadAsset<AudioClip>(assetName, bundleName);
    }

    static loadScene(sceneName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let bundle: AssetManager.Bundle = this._getBundle();
            if (bundle == null) {
                // warn("don`t have bundle ", this.bundleName);
                reject();
                return;
            }
            bundle.loadScene(sceneName, (err, scene) => {
                if (err) {
                    // warn('bundle {0} don`t have scene {1} exists; '.format(bundle.name, sceneName));
                    reject();
                    return;
                }
                director.runScene(scene);
                resolve();
                // log('load bundle {0} scene {1} end '.format(bundle.name, sceneName));
            });
        });
    }
    static gotoScene(sceneName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let bundle: AssetManager.Bundle = this._getBundle();
            if (bundle == null) {
                // warn("don`t have bundle ", this.bundleName);
                reject();
                return;
            }
            bundle.loadScene(sceneName, (err, scene) => {
                if (err) {
                    // warn('bundle {0} don`t have scene {1} exists; '.format(bundle.name, sceneName));
                    reject();
                    return;
                }
                director.runScene(scene, () => { }, () => {
                    resolve();
                });
                // log('load bundle {0} scene {1} end '.format(bundle.name, sceneName));
            });
        });
    }

    static loadConfigAsset(assetName: string, bundleName?: string) {
        this.loadTextAsset(assetName).then((_) => {
            const configs = _.text.split("\n").map(item => {
                return item.split('\t')
            })
            configs.shift(); // 去除第一行
            return configs;
        })
    }

    private static AesKey: string = 'tIUHSA1cDlMQpPT5dQM0BQ3srNBbriekKUlBrFCLpKCp6y0h8TEXjQpGsyn+hVo9';

    static loadJsonConfig(assetName: string, bundleName: string="block") {
        const config = this.loadAssetSync<JsonAsset>(assetName, bundleName).json;

        // if (false) {
        //     const configStr = config["config"];
        //     return JSON.parse(MKCrypto.inst.aesDecrypt(this.AesKey, configStr));
        // }
        return config;
    }

    static loadTextConfig(assetName: string, bundleName?: string) {
        // if (false) {
        //     const config = this.loadAssetSync<TextAsset>(assetName, bundleName).text;
        //     const configStr = JSON.parse(config).config;
        //     return MKCrypto.inst.aesDecrypt(this.AesKey, configStr);
        // }
        return this.loadAssetSync<TextAsset>(assetName, bundleName).text;
    }

    static loadAssetSync<T extends Asset>(assetName: string, bundleName?: string) {
        let bundle: AssetManager.Bundle;
        if (bundleName == null) {
            bundle = this._getBundle();
        }
        else {
            bundle = assetManager.getBundle(bundleName);
        }

        const info = bundle?.getInfoWithPath(assetName);

        if (info == null || info.uuid == null) {
            return null;
        }

        return assetManager.assets.get(info.uuid) as T;
    }
}

export class MKSubResCtr extends MKResCtr {

    static _getBundle() {
        return assetManager.getBundle(this.bundleName);
    }

}
