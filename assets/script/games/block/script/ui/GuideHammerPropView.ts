import { _decorator, Toggle, Node, Vec3, tween, Label } from "cc";
import { mk } from "../../../../MK";
import PanelBase from "../../../../panel/PanelBase";
import { Game } from "../logic/Game";
import { BlockEventType } from "../define/Event";

const { ccclass, property } = _decorator;

@ccclass("GuideHammerPropView")
export class GuideHammerPropView extends PanelBase<Game> {

    @property(Node)
    Step1: Node = null;
    @property(Node)
    Step2: Node = null;

    @property(Node)
    guideHand: Node = null;
    @property(Node)
    guideArrow: Node = null;

    @property(Label)
    countLabel: Label = null;
    @property(Label)
    countLabel2: Label = null;

    count: number = null;
    onLoad() {
        this.setMaskLayerEnable(false);
    }
    start() {
        //mk.regEvent(BlockEventType.EVENT_BLOCK_CLICKED, this.onBlockClicked, this);
        this.playHandGuide();
        this.arrowAnim();
        mk.regEvent(BlockEventType.EVENT_BLOCK_CLICKED, this.onBlockClicked, this);
        let count = this.count > 1 ? this.count : 1;
        this.countLabel.string = count.toString();
        this.countLabel2.string = count.toString();
    }
    protected onSetData(value: any): void {
        console.log("[onSetData]", value);
        this.count = Number(value);
    }
    onStep1ClickHammer() {
        this.Step1.active = false;
        this.Step2.active = true;

    }
    onBlockClicked(row, col) {
        if (row == 2 && col == 2) {
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_HAMMER, row, col, 1);
            mk.unRegEvent(this);
            this.closeSelf();
        }
    }
    playHandGuide() {
        this.guideHand.active = true;
        let cPos = new Vec3(200, -80, 0);
        tween(this.guideHand)
            .repeatForever(
                tween()
                    .to(
                        0.5,
                        { position: new Vec3(175, -55, 0) },
                        {
                            easing: "circOut",
                        }
                    )
                    .to(0.5, { position: cPos }, { easing: "circOut" })
            )
            .start();
    }
    arrowAnim() {
        this.guideArrow.active = true;
        let cPos = new Vec3(180, -80, 0);
        tween(this.guideArrow)
            .repeatForever(
                tween()
                    .to(
                        0.5,
                        { position: new Vec3(180, -50, 0) },
                        {
                            easing: "circOut",
                        }
                    )
                    .to(0.5, { position: cPos }, { easing: "circOut" })
            )
            .start();
    }
}

