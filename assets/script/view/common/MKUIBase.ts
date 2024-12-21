
import { _decorator, Component, Node, UIOpacity, v3, tween, Vec3, BlockInputEvents, UITransform} from 'cc';
const { ccclass, property } = _decorator;
import { DEV } from 'cc/env';
import { nodeBind, parseNode } from '../../util/MKNodeBind';
/**
 * UI基类
 */
@ccclass('MKUIBase')
export class MKUIBase<Options = any> extends Component {
    @nodeBind('main')
    public main = new Node();

    /** 展示/隐藏动画的时长 */
    public animDuration: number = 0.3;

    /** 用于拦截点击的节点 */
    protected blocker: Node = null;

    /** 选项 */
    protected options: Options = null;

    public showView(options?: Options){
        this.init(options);
    }
    /**
     * 展示
     * @param options 选项
     * @param duration 动画时长
     */
    public showPopup(options?: Options, duration: number = this.animDuration):Promise<void> {
        return new Promise<void>(res => {
            // 储存选项
            this.options = options;
            // 初始化节点
            const main = this.main;
            this.node.active = true;

            main.active = true;
            main.scale = v3(0.5,0.5,0.5);

            let om  =  main.getComponent(UIOpacity);
            om.opacity = 0;

            // 初始化
            this.init(this.options);
            // 更新样式
            this.updateDisplay(this.options);

            // 主体动画
            tween(main)
                .to(duration, { scale: Vec3.ONE, }, { easing: 'backOut', onUpdate:(target?, ratio?)=>{
                    om.opacity = 255;
                }, })
                .call(() => {
                    // 已完全展示
                    this.onShow?.();
                    // Done
                    res();
                })
                .start();
        });
    }

    /**
     * 隐藏
     * @param suspended 是否被挂起
     * @param duration 动画时长
     */
    public hide(suspended: boolean = false, duration: number = this.animDuration) {
        return new Promise<void>(res => {
            const node = this.node;
            // 动画时长不为 0 时拦截点击事件（避免误操作）
            if (duration !== 0) {
                let blocker = this.blocker;
                if (!blocker) {
                    blocker = this.blocker = new Node('blocker');
                    blocker.addComponent(BlockInputEvents);
                    blocker.setParent(node);
                    let tb = blocker.addComponent(UITransform);
                    tb.contentSize = node.getComponent(UITransform).contentSize;
              
                }
                blocker.active = true;
            }


            // 主体动画
            let om  =  this.main.getComponent(UIOpacity);
            let omc = om.opacity;
            tween(this.main)
                .to(duration, { scale: v3(0.5,0.5,0.5) }, { easing: 'backIn',onUpdate:(target?, ratio?)=>{
                    om.opacity = (1-ratio) * omc;
                } })
                .call(() => {
                    // 关闭拦截
                    this.blocker && (this.blocker.active = false);
                    // 关闭节点
                    node.active = false;
                    // 已完全隐藏（动画完毕）
                    this.onHide?.(suspended);
                    // Done
                    res();
                    // 完成回调
                    this.finishCallback?.(suspended);
                })
                .start();
        });
    }

    /**
     * 初始化（派生类请重写此函数以实现自定义逻辑）
     */
    protected init(options: Options) { }

    /**
     * 更新样式（派生类请重写此函数以实现自定义样式）
     * @param options 选项
     */
    protected updateDisplay(options: Options) { }

    /**
     * 已完全展示（派生类请重写此函数以实现自定义逻辑）
     */
    protected onShow() { }

    /**
     * 已完全隐藏（派生类请重写此函数以实现自定义逻辑）
     * @param suspended 是否被挂起
     */
    protected onHide(suspended: boolean) { }

    /**
     * 流程结束回调（注意：该回调为管理器专用，重写 hide 函数时记得调用该回调）
     */
    protected finishCallback: (suspended: boolean) => void = null;

    /**
     * 设置完成回调（该回调为管理器专用）
     * @param callback 回调
     */
    public setFinishCallback(callback: (suspended: boolean) => void) {
        this.finishCallback = callback;
    }
}
