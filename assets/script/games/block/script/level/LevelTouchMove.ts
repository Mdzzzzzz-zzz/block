import { _decorator, Component, Node, Vec3, EventTouch, tween } from "cc";
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
import { BlockConstData } from "../define/BlockConstData";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { sys } from "cc";
import { BlockPlaceholder3 } from "../boardView/BlockPlaceholder3";
import { Game } from "../logic/Game";

const { ccclass, property } = _decorator;

@ccclass("LevelTouchMove")
export class LevelTouchMove extends Component {
    private touchHeight: number;
    private targetNode: Node;
    private SCALE_TOUCH = 1;
    // private defaultScale = 0.3;
    private targetPosition: Vec3;
    private touchScacle: Vec3;
    private touchOffsetPos: Vec3;
    private isMoving: boolean = false;

    protected onLoad(): void {
        this.targetNode = this.targetNode ?? this.node;
    }

    start() {
        this.touchHeight = BlockConstData.BlockSpriteSize.y * 2.25;
        this.targetNode = this.targetNode ?? this.node;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.clickDelta = Math.max(this.clickDelta, BlockConstData.BlockParam.clickTime * 1000);
        this.touchScacle = new Vec3(this.SCALE_TOUCH, this.SCALE_TOUCH, 1);
        this.touchOffsetPos = new Vec3();
        if (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX) {
            this.moveDeltaFrame = 2;
        } else {
            this.moveDeltaFrame = 0;
        }
        this.currMoveFrame = 0;
    }

    // touchType: TouchType;
    private lastTouchTime = 0;
    private clickDelta = 300;
    private touchId = 0;
    private onTouchStart(event: EventTouch) {

        const blockPlaceholder = this.node.getComponent(BlockPlaceholder3);
        for (const entity of blockPlaceholder.blocks) {
            if (!entity.canMove) {
                return;
            }
        }

        if (Game.inst.canMoveBlock == false) {
            return;
        }
        if (Date.now() - this.lastTouchTime < this.clickDelta) {
            return;
        }

        this.getComponent(BlockPlaceholder3).removeAllBgLight();

        this.touchId = event.getID();
        this.lastTouchTime = Date.now();
        BlockEventManager.instance.emit(BlockEventType.BLOCK_TOUCH_START, event);
        mk.audio.playSubSound(AssetInfoDefine.audio.block_pick);
        // this.touchType = TouchType.NONE;
        this.canMove = true;
        this.canEnd = true;

        this.touchOffsetPos.x = this.node.position.x;
        this.touchOffsetPos.y = this.node.position.y + this.touchHeight;
        this.touchOffsetPos.z = 0;
        tween(this.node)
            .to(
                BlockConstData.BlockParam.clickTime,
                { scale: this.touchScacle, position: this.touchOffsetPos },
                {
                    easing: "sineOut",
                }
            )
            .start();

        this.node.setSiblingIndex(7);
        this.targetNode = this.node;
        this.targetPosition = this.touchOffsetPos;
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
        if (Game.inst.canMoveBlock == false) {
            return;
        }
        if (!this.canEnd) {
            return;
        }
        if (this.touchId != touchEvent.getID()) {
            return;
        }
        this.currMoveFrame = 0;
        this.isMoving = false;
        this.canMove = false;
        this.canEnd = false;
        this.touchId = 0;
        // this.targetPosition = null;
        if (this.moveDeltaFrame > 0) {
            mk.sendEvent(BlockEventType.kEvent_Game_Move_Block, this.node, this.sumDis);
        }
        mk.sendEvent(BlockEventType.kEvent_Game_Move_Block_End, this.node, this.sumDis);
        this.sumDis = 0;
    }
    private moveDeltaFrame: number = 2;
    private currMoveFrame: number = 0;
    private sumDis: number = 0;
    private onTouchMove(event: EventTouch) {
        // if (this.sumDis < 1e-2) {
        //     const delta = this.pretouchpos.subtract(pos);
        //     this.sumDis += delta.length();
        //     this.pretouchpos = pos;
        //     return;
        // }
        const blockPlaceholder = this.node.getComponent(BlockPlaceholder3);
        for (const entity of blockPlaceholder.blocks) {
            if (!entity.canMove) {
                return;
            }
        }
        if (Game.inst.canMoveBlock == false) {
            return;
        }
        this.sumDis += event.getDelta().length();
        if (!this.canMove) {
            return;
        }
        if (this.touchId != event.getID()) {
            return;
        }
        this.isMoving = true;
        const p = event.getUIDelta();
        this.targetPosition.x += p.x * 1.4;
        this.targetPosition.y += p.y * 1.4;
        this.targetPosition.z = 0;
        this.targetNode.setPosition(this.targetPosition);
        if (this.moveDeltaFrame > 0) {
            if (this.currMoveFrame % this.moveDeltaFrame == 0) {
                mk.sendEvent(BlockEventType.kEvent_Game_Move_Block, this.node, this.sumDis);
            }
            this.currMoveFrame += 1;
        } else {
            mk.sendEvent(BlockEventType.kEvent_Game_Move_Block, this.node, this.sumDis);
        }
    }
    // protected lateUpdate(dt: number): void {
    //     if (this.isMoving) {
    //         this.targetNode.setPosition(this.targetPosition);
    //     }
    // }
    // protected onDestroy(): void {
    //     this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    //     this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    //     this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    //     this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    // }

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
