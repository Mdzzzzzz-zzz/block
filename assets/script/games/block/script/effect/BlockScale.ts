import { _decorator, Component, Node, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlockScale')
export class BlockScale extends Component {
    private _scalingTween: Tween<Node> | null = null;
    
    @property
    scaleUp: Vec3 = new Vec3(0.6, 0.6, 1);

    @property
    scaleDown: Vec3 = new Vec3(0.5, 0.5, 1);

    @property
    duration: number = 0.3;

    start() {
        // this.startScaling();
    }

    onLoad() {
        this.startScaling();
    }

    public startScaling() {
        if (this._scalingTween) {
            return
        }
        this._scalingTween = tween(this.node)
            .to(this.duration, { scale: this.scaleUp })
            .to(this.duration, { scale: this.scaleDown })
            .union() // Combine the two tweens into a single sequence
            .repeatForever()
            .start();
    }

    public stopScaling() {
        if (this._scalingTween) {
            this._scalingTween.stop();
            this._scalingTween = null;
        }
    }

    public SetMaxScale(scale: Vec3) {
        this.scaleUp = scale
    }

    public SetMinScale(scale: Vec3) {
        this.scaleDown = scale
    }
}