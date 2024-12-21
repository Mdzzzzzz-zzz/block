import { _decorator, Component, Node, Vec3, EventTouch, tween } from 'cc';
import { mk } from '../../../../MK';
import { BlockEventType } from '../define/Event';
import { BlockConstData } from '../define/BlockConstData';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
import { BlockEventManager } from '../../../../event/BlockEventManager';

const { ccclass, property } = _decorator;

@ccclass('HammerTouchMove')
export class HammerTouchMove extends Component {

    private touchHeight: number;
    private targetNode: Node;
    private SCALE_TOUCH = 1;
    private targetPosition: Vec3;

    start() {
        this.touchHeight = BlockConstData.BlockSpriteSize.y * 3;
        this.targetNode = this.targetNode ?? this.node;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.clickDelta = Math.max(this.clickDelta, BlockConstData.BlockParam.clickTime * 1000);
    }


    // touchType: TouchType;
    private lastTouchTime = 0;
    private clickDelta = 300;
    private touchId = 0;
    private onTouchStart(event: EventTouch) {
        if (Date.now() - this.lastTouchTime < this.clickDelta) {
            return;
        }
        this.touchId = event.getID();
        this.lastTouchTime = Date.now();
        BlockEventManager.instance.emit(BlockEventType.BLOCK_TOUCH_START, event);
        mk.audio.playSubSound(AssetInfoDefine.audio.block_pick);
        // this.touchType = TouchType.NONE;
        this.canMove = true;
        this.canEnd = true;

        let scale = new Vec3(this.SCALE_TOUCH, this.SCALE_TOUCH, 1);
        let pos = new Vec3(this.node.position.x, this.node.position.y + this.touchHeight, 0);
        tween(this.node).to(BlockConstData.BlockParam.clickTime, { scale: scale, position: pos }, {
            easing: "sineOut"
        }).start();
        this.node.setSiblingIndex(7);
        this.targetNode = this.node;
        this.targetPosition = new Vec3(this.targetNode.position.x, this.touchHeight + this.targetNode.position.y);
    }

    private onTouchEnd(touchEvent: EventTouch) {
        this.handleTouchEnd(touchEvent);
    }

    private onTouchCancel(touchEvent: EventTouch) {
        this.handleTouchEnd(touchEvent);
    }

    private canEnd = false;
    private canMove = false;

    private handleTouchEnd(touchEvent: EventTouch) {
        if (!this.canEnd) {
            return;
        }
        if (this.touchId != touchEvent.getID()) {
            return;
        }
        this.canMove = false;
        this.canEnd = false;
        this.touchId = 0;
        // this.targetPosition = null;
        mk.sendEvent(BlockEventType.kEvent_Game_Move_Block_End, this.node, this.sumDis);
        this.sumDis = 0;
    }
    private sumDis: number = 0;
    private onTouchMove(event: EventTouch) {
        // if (this.sumDis < 1e-2) {
        //     const delta = this.pretouchpos.subtract(pos);
        //     this.sumDis += delta.length();
        //     this.pretouchpos = pos;
        //     return;
        // }
        this.sumDis += event.getDelta().length();
        if (!this.canMove) {
            return;
        }
        if (this.touchId != event.getID()) {
            return;
        }

        const p = event.getUIDelta();
        this.targetPosition = this.targetPosition.add3f(p.x, p.y, 0);
        this.targetNode.setPosition(this.targetPosition);
        mk.sendEvent(BlockEventType.kEvent_Game_Move_Block, this.node, this.sumDis);
    }

    // lateUpdate(deltaTime: number) {
    //     // if (!this.followMove) return;

    //     // const x = this.targetPosition.x;
    //     // const y = this.targetPosition.y;
    //     // if (this.targetNode.position.x == x && this.targetNode.position.y == y) {
    //     //     return;
    //     // }

    //     // this.currentDelayTime++;
    //     // this.currentDelayTime = Math.min(this.currentDelayTime, this.delayTime);

    //     // const ratio = this.currentDelayTime / this.delayTime;
    //     // this.targetNode.position = new Vec3(
    //     //     math.lerp(this.targetNode.position.x, x, ratio),
    //     //     math.lerp(this.targetNode.position.y, y, ratio),
    //     //     0
    //     // )
    // }
}