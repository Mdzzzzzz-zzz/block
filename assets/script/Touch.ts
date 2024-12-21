/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-05 22:39:43
 */
import { Animation, isValid, game } from "cc";
import { _decorator, Component, Node, Prefab, instantiate, UITransform, Vec3, NodePool } from "cc";
import { mk } from "./MK";

const { ccclass, property } = _decorator;

@ccclass("Touch")
export class Touch extends Component {
    @property(Prefab)
    prefabTouch: Prefab;

    private nodePool: NodePool = new NodePool();

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.MOUSE_UP, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_START, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_DOWN, this.dontBeSwallowed, this);
        this.node.off(Node.EventType.MOUSE_MOVE, this.dontBeSwallowed, this);
        this.node.off(Node.EventType.MOUSE_UP, this.dontBeSwallowed, this);
        this.node.off(Node.EventType.TOUCH_START, this.dontBeSwallowed, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.dontBeSwallowed, this);
        this.node.off(Node.EventType.TOUCH_END, this.dontBeSwallowed, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.dontBeSwallowed, this);
    }

    onTouchStart(event) {
        const location = event.getUILocation();
        const xunHuanAni = this.getNodePool();
        const trans = this.node.getComponent(UITransform);
        const location3D = new Vec3(location.x, location.y, 0);
        const cc_p = trans.convertToNodeSpaceAR(location3D);
        if (!xunHuanAni || !cc_p) return;
        xunHuanAni.setPosition(cc_p);
        xunHuanAni.parent = this.node;
        const ani = xunHuanAni.getComponent(Animation);
        if (ani) {
            ani.play();
            ani.on(
                Animation.EventType.FINISHED,
                () => {
                    this.recycleNode(xunHuanAni);
                },
                this
            );
        } else {
            this.scheduleOnce(() => {
                this.recycleNode(xunHuanAni);
            }, 0.6);
        }
        mk.sendEvent(mk.eventType.ON_TOUCH_START);
    }

    getNodePool() {
        let targetNode: Node = null;
        if (this.nodePool.size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            targetNode = this.nodePool.get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 instantiate 重新创建
            targetNode = instantiate(this.prefabTouch);
        }
        return targetNode;
    }

    /**
     * 回收节点
     * @param nodePool 节点池
     * @param node 节点
     */
    recycleNode(node) {
        if (isValid(node) && node.parent) {
            node.removeFromParent();
        }
        this.nodePool.put(node);
    }

    dontBeSwallowed(event) {
        // 事件向下穿透
        event.preventSwallow = true;
    }
    onTouchEnd(event) {
        event.preventSwallow = true;
        mk.sendEvent(mk.eventType.ON_TOUCH_END);
    }
}
