import { _decorator, Component, Node, v2, Vec2, tween, Vec3, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PaperPlane')
export class PaperPlane extends Component {

    @property(Node)
    planeNode: Node = null;

    public lastPos: any = null;
    public targetPos: Vec2 = null;
    public onFinishCallBack: any = null;
    public afterQifeiAnimCallback: any = null;

    getAngleByVector(len_x, len_y, rotationoffset) {
        // console.log('getAngleByVector() lenx =' + len_x, 'leny = ' + len_y);
        if (len_y === 0) {
            if (len_x < 0) {
                return 270 - rotationoffset;
            } else if (len_x > 0) {
                return 90 - rotationoffset;
            }
            return 0;
        }
        if (len_x === 0) {
            if (len_y >= 0) {
                return 0;
            } else if (len_y < 0) {
                return 180 - rotationoffset;
            }
        }

        let tan_yx = Math.abs(len_y) / Math.abs(len_x);
        let angle;
        if (len_y > 0 && len_x < 0) {
            angle = 270 - rotationoffset + Math.atan(tan_yx) * 180 / Math.PI;
        } else if (len_y > 0 && len_x > 0) {
            angle = 90 - rotationoffset - Math.atan(tan_yx) * 180 / Math.PI;
        } else if (len_y < 0 && len_x < 0) {
            angle = 270 - rotationoffset - Math.atan(tan_yx) * 180 / Math.PI;
        } else if (len_y < 0 && len_x > 0) {
            angle = - rotationoffset + Math.atan(tan_yx) * 180 / Math.PI + 90;
        }
        return angle;
    }

    updateRotation(newPos, oldPos) {
        let rotation = this.getAngleByVector(newPos.x - oldPos.x, newPos.y - oldPos.y, -45);
        if (rotation != 0) {
            this.node.setRotation(rotation);
        }
    }
    lateUpdate() {
        this.updateRotation(this.node.position, this.lastPos);
    }
    update() {
        this.lastPos = this.node.position;
    }

    getBezierLength(beginpos, endPoint, control1, control2) {
        const midpoint = v2((control1.x + control2.x) / 2, (control1.y + control2.y) / 2);
        const length1 = v2(midpoint.x - beginpos.x, midpoint.y - beginpos.y).length();
        const length2 = v2(midpoint.x - endPoint.x, midpoint.y - endPoint.y).length();
        const length = length1 + length2;
        return length;
    }

    randomControlPoint(beginpos, endpos) {
        endpos = v2(endpos.x, endpos.y);
        beginpos = v2(beginpos.x, beginpos.y);

        let v1 = endpos.sub(beginpos);
        let n11 = v2(1, -v1.x * 1 / v1.y).normalize()
        if (v1.y == 0) {
            n11 = v2(v1.y / v1.x, -1).normalize()
        }

        let mag = beginpos.sub(endpos).mag();
        let randomx1 = Math.random() * mag + 250;
        if (randomx1 > 600) randomx1 = 600

        let n1 = n11.multiplyScalar(randomx1);
        let n2 = n11.multiplyScalar(randomx1);
        let p1 = beginpos.sub(n1)
        let p2 = endpos.sub(n2)
        let params = [p1, p2];
        return params
    }

    runMyBezier(endPoint) {
        let curPos = v2(this.node.position.x, this.node.position.y);
        let params = this.randomControlPoint(curPos, endPoint)

        let q1 = params[0];
        let q2 = params[1];
        let bezier = [q1, q2, endPoint];

        let length = this.getBezierLength(curPos, endPoint, q1, q2);
        let time = length / 200;

        time = time <= 0.5 ? 0.5 : time;
        time = time >= 1 ? 1 : time;
        return this.bezierTo(this.node, time, q1, q2, endPoint, { easing: "sineIn" });
        // return bezierTo(time, bezier);
    }

    runDisappearAnim() {
        this.node.destroy();
    }

    flyToTargetPosBoom(targetPos, callback, onPlaneBegin) {
        // console.log('flyToTargetPosBoom()');
        this.targetPos = targetPos;
        let self = this;

        this.onFinishCallBack = () => {
            // console.log('flyToTargetPosBoom()2');
            self.runDisappearAnim();
            if (typeof callback == "function") {
                callback();
            }
        }

        let myBezier = this.runMyBezier(targetPos);
        this.afterQifeiAnimCallback = (function () {
            // console.log('flyToTargetPosBoom()1');

            if (typeof onPlaneBegin == "function") {
                onPlaneBegin();
            }

            const act1 = myBezier;
            const act2 = this.onFinishCallBack
            tween(self.node)
                .sequence(act1, act2)
                .start;
        })
        this.afterQifeiAnimCallback();
    }

    /**
 *  二阶贝塞尔曲线 运动
 * @param target
 * @param {number} duration
 * @param {} c1 起点坐标
 * @param {} c2 控制点
 * @param {Vec3} to 终点坐标
 * @param opts
 * @returns {any}
 */
    bezierTo(target: any, duration: number, c1: Vec2, c2: Vec2, to: Vec3, opts: any) {
        opts = opts || Object.create(null);
        /**
         * @desc 二阶贝塞尔
         * @param {number} t 当前百分比
         * @param {} p1 起点坐标
         * @param {} cp 控制点
         * @param {} p2 终点坐标
         * @returns {any}
         */
        let twoBezier = (t: number, p1: Vec2, cp: Vec2, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            return v3(x, y, 0);
        };
        opts.onUpdate = (arg: Vec3, ratio: number) => {
            target.position = twoBezier(ratio, c1, c2, to);
        };
        return tween(target).to(duration, {}, opts);
    }
}

