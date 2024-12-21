import { instantiate, isValid, Prefab, warn, Node, find, UITransform, resources, Component } from "cc";
import { MAX_ZINDEX } from "../../define/MacroDefine";
import { MKResCtr } from "../../util/MKResCtr";
import { IUICfg, MKUIConfig } from "../config/MKUICfg";
import { MKUIBase } from "./MKUIBase";

/** 缓存模式 */
export enum CacheMode {
    /** 一次性的（立即销毁节点，预制体资源随即释放） */
    Once = 1,
    /** 正常的（立即销毁节点，但是缓存预制体资源） */
    Normal,
    /** 频繁的（只关闭节点，且缓存预制体资源） */
    Frequent
}

/**
 * 管理器
 */
class MKUICtr {

    /** 预制体缓存 */
    public static get prefabCache () {
        return MKUICtr._prefabCache;
    }

    private static _prefabCache: Map<string, Prefab> = new Map<string, Prefab>();

    /** 节点缓存 */
    public static get nodeCache () {
        return MKUICtr._nodeCache;
    }

    private static _nodeCache: Map<string, Node> = new Map<string, Node>();

    /** 当前请求 */
    public static get current () {
        return MKUICtr._current;
    }

    private static _current: MKUIRequest = null;

    /** 等待队列 */
    public static get queue () {
        return MKUICtr._queue;
    }

    private static _queue: MKUIRequest[] = [];

    /** 被挂起的队列 */
    public static get suspended () {
        return MKUICtr._suspended;
    }

    private static _suspended: MKUIRequest[] = [];

    /** 锁定状态 */
    private static locked: boolean = false;

    /** 用于存放节点的容器节点（不设置则默认为当前 Canvas） */
    public static container: Node = null;

    /** 连续展示的时间间隔（秒） */
    public static interval: number = 0.05;

    /** 缓存模式 */
    public static get CacheMode () {
        return CacheMode;
    }

    /**
     * 动态加载开始回调
     * @example
     * MKUICtr.loadStartCallback = () => {
     *     LoadingTip.show();
     * }
     */
    public static loadStartCallback: () => void = null;

    /**
     * 动态加载结束回调
     * @example
     * MKUICtr.loadFinishCallback = () => {
     *     LoadingTip.hide();
     * }
     */
    public static loadFinishCallback: () => void = null;

    /**
     *  加载UI
     *  @param options 可选参数
     *  @param path 预制体相对路径
     *  @param compName 动态挂载组件名字
     */
    public static showPgs<Options> (options?: Options, cfg?: IUICfg): Promise<Node> {
        let parent = find('Presist/MKProgress');
        cfg = cfg ?? MKUIConfig.prefab.progress;
        return MKUICtr._show(cfg, parent, options);
    }

    /**
     * 提示UI
     * @param options 可选参数
     * @param path 预制体相对路径
     * @param compName 动态挂载组件名字
     */
    public static showTips<Options> (options?: Options, cfg?: IUICfg): Promise<Node> {
        let parent = find('Presist/MKTips');
        cfg = cfg ?? MKUIConfig.prefab.tips;
        return MKUICtr._show(cfg, parent, options);
    }

    /**
     * 全屏UI、组合UI（非弹窗类UI）
     * @param path 预制体相对路径
     * @param compName 动态挂载组件名字
     * @param parent  指定父节点，或者全局Canvas
     * @param options 可选参数
     *
     */
    public static showView<Options> (cfg: IUICfg, parent?: Node, options?: Options): Promise<Node> {
        return MKUICtr._show(cfg, parent, options);
    }

    /**
     * 弹窗类UI
     * 展示，如果当前已有在展示中则加入等待队列
     * @param path 预制体相对路径
     * @param options 选项（将传递给的组件）
     * @param params 展示参数
     */
    public static showPopup<Options> (cfg: IUICfg, options?: Options, params?: MKUIParams): Promise<Node> {
        return new Promise(async res => {
            // 解析处理参数
            params = MKUICtr.parseParams(params);
            // 当前已有在展示中则加入等待队列
            if (MKUICtr._current || MKUICtr.locked) {
                // 是否立即强制展示
                if (params && params.immediately) {
                    MKUICtr.locked = false;
                    // 挂起当前
                    await MKUICtr.suspend();
                } else {
                    // 将请求推入等待队列
                    MKUICtr.push(cfg, options, params);
                    res(null);
                    return;
                }
            }
            // 保存为当前，阻止新的请求
            MKUICtr._current = {
                cfg,
                options,
                params
            };
            // 先在缓存中获取节点
            let node = MKUICtr.getNodeFromCache(cfg.path);
            // 缓存中没有，动态加载预制体资源
            if (!isValid(node)) {
                // 开始回调
                MKUICtr.loadStartCallback?.();
                // 等待加载
                const prefab = await MKUICtr.load(cfg);
                // 完成回调
                MKUICtr.loadFinishCallback?.();
                // 加载失败（一般是路径错误导致的）
                if (!isValid(prefab)) {
                    warn('MKUICtr', `加载失败 ${cfg.path}`);
                    MKUICtr._current = null;
                    res(null);
                    return;
                }
                // 实例化节点
                node = instantiate(prefab);
            }

            if (cfg.component) {
                const comp = node.components.find((value) => {
                    if (value.name === cfg.component) return true;
                    return false;
                });
                if (comp == undefined) {
                    node.addComponent(cfg.component);
                }
            }
            // 获取继承自 MKUIBase 的组件
            const UI = node.getComponent(MKUIBase);
            if (!UI) {
                warn('MKUICtr', `未找到组件 ${cfg.path}`);
                MKUICtr._current = null;
                res(null);
                return;
            }
            let canvas = find('Canvas');
            let trans = canvas.getComponent(UITransform);
            // 保存组件引用
            MKUICtr._current.UI = UI;
            // 保存节点引用
            MKUICtr._current.node = node;
            // 添加到场景中
            node.setParent(MKUICtr.container || canvas);
            // 显示在最上层
            node.setSiblingIndex(MAX_ZINDEX);
            // 设置完成回调
            const finishCallback = async (suspended: boolean) => {
                if (suspended) {
                    return;
                }
                MKUICtr.locked = (MKUICtr._suspended.length > 0 || MKUICtr._queue.length > 0);
                MKUICtr.recycle(cfg.path, node, params.mode);
                MKUICtr._current = null;
                res(node);
                // 延迟
                await new Promise(_res => trans.scheduleOnce(_res, MKUICtr.interval));
                // 下一个
                MKUICtr.next();
            }
            UI.setFinishCallback(finishCallback);
            // 展示
            UI.showPopup(options);
        });
    }

    /**
     * 隐藏当前
     */
    public static hide () {
        if (MKUICtr._current.UI) {
            MKUICtr._current.UI.hide();
        }
    }

    /**
     * 从缓存中获取节点
     * @param path 路径
     */
    private static getNodeFromCache (path: string): Node {
        // 从节点缓存中获取
        const nodeCache = MKUICtr._nodeCache;
        if (nodeCache.has(path)) {
            const node = nodeCache.get(path);
            if (isValid(node)) {
                return node;
            }
            // 删除无效引用
            nodeCache.delete(path);
        }
        // 从预制体缓存中获取
        const prefabCache = MKUICtr._prefabCache;
        if (prefabCache.has(path)) {
            const prefab = prefabCache.get(path);
            if (isValid(prefab)) {
                return instantiate(prefab);
            }
            // 删除无效引用
            prefabCache.delete(path);
        }
        // 无
        return null;
    }

    /**
     * 展示挂起或等待队列中的下一个
     */
    private static next () {
        if (MKUICtr._current || (MKUICtr._suspended.length === 0 && MKUICtr._queue.length === 0)) {
            return;
        }
        // 取出一个请求
        let request: MKUIRequest = null;
        if (MKUICtr._suspended.length > 0) {
            // 挂起队列
            request = MKUICtr._suspended.shift();
        } else {
            // 等待队列
            request = MKUICtr._queue.shift();
        }
        // 解除锁定
        MKUICtr.locked = false;
        // 已有实例
        if (isValid(request.UI)) {
            // 设为当前
            MKUICtr._current = request;
            // 直接展示
            request.UI.showPopup(request.options);
            return;
        }
        // 加载并展示
        MKUICtr.showPopup(request.cfg, request.options, request.params);
    }

    /**
     * 添加一个请求到等待队列中，如果当前没有展示中的则直接展示该。
     * @param path 预制体相对路径
     * @param compName 组件名称
     * @param options 选项
     * @param params 展示参数
     */
    private static push<Options> (cfg: IUICfg, options?: Options, params?: MKUIParams) {
        // 直接展示
        if (!MKUICtr._current && !MKUICtr.locked) {
            MKUICtr.showPopup(cfg, options, params);
            return;
        }
        // 加入队列
        MKUICtr._queue.push({cfg, options, params});
        // 按照优先级从大到小排序
        MKUICtr._queue.sort((a, b) => (b.params.priority - a.params.priority));
    }

    /**
     * 挂起当前展示中的
     */
    private static async suspend () {
        if (!MKUICtr._current) {
            return;
        }
        const request = MKUICtr._current;
        // 将当前推入挂起队列
        MKUICtr._suspended.push(request);
        // 关闭当前（挂起）
        await request.UI.hide(true);
        // 置空当前
        MKUICtr._current = null;
    }

    /**
     * 回收
     * @param path 路径
     * @param node 节点
     * @param mode 缓存模式
     */
    private static recycle (path: string, node: Node, mode: CacheMode) {
        const nodeCache = MKUICtr._nodeCache;
        switch (mode) {
            // 一次性
            case CacheMode.Once:
                node.destroy();
                MKUICtr._nodeCache.delete(path);
                MKUICtr.release(path);
                break;
            // 正常
            case CacheMode.Normal:
                node.destroy();
                MKUICtr._nodeCache.delete(path);
                break;
            // 频繁
            case CacheMode.Frequent:
                node.removeFromParent();
                MKUICtr._nodeCache.set(path, node);
                break;
        }
    }

    /**
     *
     * @param path 预制体相对路径
     * @param parent  父节点
     * @param compName 动态挂载组件名字
     * @param options 可选参数
     * @returns
     */
    private static _show<Options> (cfg: IUICfg, parent: Node, options?: Options): Promise<Node> {
        return new Promise(async res => {
            // 先在缓存中获取节点
            let node = MKUICtr.getNodeFromCache(cfg.path);
            // 缓存中没有，动态加载预制体资源
            if (!isValid(node)) {
                // 开始回调
                const prefab = await MKUICtr.load(cfg, false);
                // 加载失败（一般是路径错误导致的）
                if (!isValid(prefab)) {
                    warn('MKUICtr', `加载失败 ${cfg.path}`);
                    MKUICtr._current = null;
                    res(null);
                    return;
                }
                // 实例化节点
                node = instantiate(prefab);
            }
            if (!parent || !isValid(parent)) {
                parent = find('Canvas');
                if (!parent || !isValid(parent)) {
                    res(null);
                    return;
                }
            }

            parent.addChild(node);
            if (cfg.component) {
                const comp = node.components.find((value) => {
                    if (value.name === cfg.component) return true;
                    return false;
                });
                if (comp == undefined) {
                    node.addComponent(cfg.component);
                }
            }
            const UI = node.getComponent(MKUIBase);
            UI?.showView(options);
            res(node);
        });
    }

    /**
     * 加载并缓存预制体资源
     * @param path 路径
     */
    public static load (cfg: IUICfg, cache: boolean = true): Promise<Prefab> {
        return new Promise(async (res) => {
            const prefabMap = MKUICtr._prefabCache;
            // 先看下缓存里有没有，避免重复加载
            if (prefabMap.has(cfg.path)) {
                const prefab = prefabMap.get(cfg.path);
                // 缓存是否有效
                if (isValid(prefab)) {
                    res(prefab);
                    return;
                }
            }

            const prefab = await MKResCtr.loadPrefab(cfg);
            if (cache) {
                prefabMap.set(cfg.path, prefab);  // 缓存预制体
                prefab.addRef();              // 增加引用计数
            }
            res(prefab);
        });
    }

    /**
     * 尝试释放资源（注意：内部动态加载的资源请自行释放）
     * @param path 路径
     */
    public static release (path: string) {
        // 移除节点
        const nodeCache = MKUICtr._nodeCache;
        let node = nodeCache.get(path);
        if (node) {
            nodeCache.delete(path);
            if (isValid(node)) {
                node.destroy();
            }
            node = null;
        }
        // 移除预制体
        const prefabCache = MKUICtr._prefabCache;
        let prefab = prefabCache.get(path);
        if (prefab) {
            prefabCache.delete(path);
            prefab.decRef();
            prefab = null;
        }
    }

    /**
     * 解析参数
     * @param params 参数
     */
    private static parseParams (params: MKUIParams) {
        if (params == undefined) {
            return new MKUIParams();
        }
        // 是否为对象
        if (Object.prototype.toString.call(params) !== '[object Object]') {
            warn('MKUICtr', `参数无效，使用默认参数`);
            return new MKUIParams();
        }
        // 缓存模式
        if (params.mode == undefined) {
            params.mode = CacheMode.Normal;
        }
        // 优先级
        if (params.priority == undefined) {
            params.priority = 0;
        }
        // 立刻展示
        if (params.immediately == undefined) {
            params.immediately = false;
        }
        return params;
    }

}

/** 展示参数 */
export class MKUIParams {
    /** 缓存模式 */
    mode?: CacheMode = CacheMode.Normal;
    /** 优先级（优先级大的优先展示） */
    priority?: number = 0;
    /** 立刻展示（将会挂起当前展示中的） */
    immediately?: boolean = false;
}

/** 展示请求 */
export interface MKUIRequest {
    /** 预制体配置 */
    cfg: IUICfg;
    /** 选项 */
    options: any;
    /** 缓存模式 */
    params: MKUIParams,
    /** 组件 */
    UI?: MKUIBase,
    /** 节点 */
    node?: Node
}

/**
 * 全屏UI、组合UI（非弹窗类UI）
 * @param path 预制体相对路径
 * @param compName 动态挂载组件名字
 * @param parent  指定父节点，或者全局Canvas
 * @param options 可选参数
 *
 */
export const showView = MKUICtr.showView;
/**
 * 弹窗类UI
 * 展示，如果当前已有在展示中则加入等待队列
 * @param path 预制体相对路径
 * @param options 选项（将传递给的组件）
 * @param params 展示参数
 */
export const showPopup = MKUICtr.showPopup;
/**
 * 提示UI
 * @param options 可选参数
 * @param path 预制体相对路径
 * @param compName 动态挂载组件名字
 */
export const showTips = MKUICtr.showTips;
/**
 *  加载UI
 *  @param options 可选参数
 *  @param path 预制体相对路径
 *  @param compName 动态挂载组件名字
 */
export const showPgs = MKUICtr.showPgs;

/**
 * 公共提示弹窗类型
 */
export enum DialogType {
    COMMON,  // 普通提示
    EXIT,    // 退出提示
}