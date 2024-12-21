import { _decorator, Component, Node } from 'cc';
import PanelBase from './PanelBase';
const { ccclass, property } = _decorator;

@ccclass('PanelBaseMask')
export class PanelBaseMask extends Component {

    public container: PanelBase<any>;
    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.MOUSE_UP, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_START, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_END, this.dontBeSwallowed, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.dontBeSwallowed, this);
    }

    onTouchStart(event) {
        if (this.container) {
            this.container.closeSelf();
        }
    }

    dontBeSwallowed(event) {
        // 事件向下穿透
        event.preventSwallow = true;
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
}

