import { AssetManager, game } from "cc";
import { Prefab } from "cc";
import { assetManager } from "cc";
import { instantiate, isValid, Node } from "cc";
import { ResManager } from "../resource/ResManager";

export class NodePool {
    name: string = "";
    private pool: Array<Node> = [];
    /**@description 用来克隆的节点 */
    private node: Node | null = null;

    public rootNode: Node;

    public static waitInstanceCount: number = 0;

    /**
     * @description 用来克隆的节点，在get时，如果发现对象池中不存在，会直接用此节点进行克隆
     * 注意，设置的克隆对象会从父节点移除，但不会进行cleanup操作
     * 在clear时，对该克隆节点进行释放操作
     * */
    public get cloneNode() {
        return this.node;
    }

    public set cloneNode(node: Node | null) {
        if (node && isValid(node)) {
            this.node = node;
            if (this.rootNode) {
                this.node.setParent(this.rootNode);
            } else {
                this.node.removeFromParent();
            }
        }
    }

    constructor(name: string, rootNode: Node) {
        this.name = name;
        this.rootNode = rootNode;
    }

    /**@description 当前对象池数据大小 */
    get size() {
        return this.pool.length;
    }

    set size(value) {
        if (value > this.size) {
            NodePool.waitInstanceCount += (value - this.size);
            for (let i = this.size; i < value; i++) {
                setTimeout(() => {
                    //异步帧加载对象池子
                    NodePool.waitInstanceCount -= 1;
                    this.pool.push(instantiate(this.cloneNode));
                }, NodePool.waitInstanceCount * game.deltaTime * 1000);
            }
        }
    }

    /**@description 销毁对象池中缓存的所有节点 */
    clear() {
        let count = this.pool.length;
        for (let i = 0; i < count; ++i) {
            this.pool[i].destroy();
        }
        this.pool = [];
        if (this.node && isValid(this.node)) {
            this.node.destroy();
        }
        this.node = null;
    }

    /**
     * @description 向缓冲池中存入一个不需要的节点对象
     * 这个函数会自动将目标节点从父节点移除，但不会进行 cleanup 操作
     *
     */
    put(obj: Node) {
        //console.log("get Async put nodes")
        if (obj && this.pool.indexOf(obj) === -1) {
            //从父节点移除，但不会对进入 cleanup 操作
            //console.log("put nodes here size", this.size);
            obj.removeFromParent();
            obj.setParent(this.rootNode);
            this.pool.push(obj);
        }
    }

    /**
     * @description 从对象池中取缓冲节点
     * */
    get(): Node | null {
        if (this.pool.length <= 0) {
            if (this.node) {
                let node = instantiate(this.node);
                return node;
            }
            return null;
        }
        let last = this.pool.length - 1;
        let obj = this.pool[last];
        this.pool.length = last;
        return obj;
    }
    private waitCount: number = 0;
    getAsync(): Promise<Node> {
        return new Promise<Node>((resolve, reject) => {
            //console.log("getAsync curr size: " + this.pool.length);
            if (this.pool.length <= 0) {
                //console.log("getAsync create nodes")
                if (this.node) {
                    this.waitCount += 1;
                    setTimeout(() => {
                        let node = instantiate(this.node);
                        resolve(node);
                        this.waitCount -= 1;
                    }, this.waitCount * game.deltaTime * 1000);
                } else {
                    reject(null);
                }
                return;
            }
            let last = this.pool.length - 1;
            let obj = this.pool[last];
            this.pool.length = last;
            resolve(obj);
        });
    }
}

/**
 * 对象池管理器
 */
export class NodePoolManager {
    private static _inst: NodePoolManager = null;
    public static get inst() {
        if (NodePoolManager._inst == null) NodePoolManager._inst = new NodePoolManager();
        return NodePoolManager._inst;
    }
    private _rootNode: Node;
    public get rootNode(): Node {
        return this._rootNode;
    }
    public set rootNode(value: Node) {
        this._rootNode = value;
    }
    static module: string = "【对象池】";
    module: string = null!;
    private pools: Map<string, NodePool> = new Map();
    /**
     * @description 创建对象池
     * @param type 对象池类型
     */
    createPool(type: string): NodePool | null {
        if (!this.pools.has(type)) {
            this.pools.set(type, new NodePool(type, this.rootNode));
        }
        return this.pools.get(type) as NodePool;
    }
    /**
     * @description 删除对象池
     * @param type 对象池类型
     * */
    deletePool(type: string | NodePool | null) {
        if (typeof type == "string") {
            if (this.pools.has(type)) {
                let pool = this.pools.get(type);
                //清除对象池数据
                pool && pool.clear();
                //删除对象池
                this.pools.delete(type);
            }
        } else if (type && type instanceof NodePool) {
            this.deletePool(type.name);
        }
    }

    /**
     * @description 获取对象池
     * @param type 对象池类型
     * @param isCreate 当找不到该对象池时，会默认创建一个对象池
     * */
    getPool(type: string, isCreate = true): NodePool {
        if (this.pools.has(type)) {
            return this.pools.get(type) as NodePool;
        } else {
            if (isCreate) {
                return this.createPool(type);
            } else {
                return null;
            }
        }
    }
    public getPoolFromBlock(assetName: string) {
        let bundleName = "block";
        let poolType: string = `${bundleName}/${assetName}`;
        return this.getPool(poolType, true);
    }
    //不同的bundle可能资源路径一样 放置出现异常 区分下bundle
    public getPoolWithBundleName(assetName: string, bundleName: string) {
        let poolType: string = `${bundleName}/${assetName}`;
        return this.getPool(poolType, true);
    }
    public static initPoolForBlock(assetName: string, count: number) {
        NodePoolManager.initPool(assetName, "block", count);
    }
    public static initPool(assetName: string, bundleName: string, count: number) {
        let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
        if (!bundle) {
            console.error("未加载bundle：", bundleName);
            return;
        }
        let info = bundle.getInfoWithPath(assetName);

        if (info == null || info.uuid == null) {
            console.error("bundle未包含资源：", bundleName);
            return;
        }
        let pool = NodePoolManager.inst.createPool(`${bundleName}/${assetName}`);

        let assetPrefab = assetManager.assets.get(info.uuid) as Prefab;
        if (!assetPrefab) {
            //不包含直接加载的
            ResManager.getInstance()
                .loadAsset<Prefab>(assetName, bundleName)
                .then((prefab) => {
                    if (prefab) {
                        pool.cloneNode = instantiate(prefab);
                        pool.size = count;
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
            return;
        }
        if (assetPrefab) {
            pool.cloneNode = instantiate(assetPrefab);
            pool.size = count;
        }
    }
}
