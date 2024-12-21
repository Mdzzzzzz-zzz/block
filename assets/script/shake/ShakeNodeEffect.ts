import { tween, Vec3, Tween, v3, Node } from "cc";
import { PREVIEW } from "cc/env";

export class ShakeNodeEffect {
    /**
     * 震动节点
     * @param targetNode 目标节点
     * @param duration 震动时间
     * @param cb 震动结束回调
     * @param once 多节点是否只回调一次
     */
    static shakeNodes(targetNode: Node, config: IShakeConfig, cb?: Function) {
        this.onceNodeShake(targetNode, config, cb);
        // if (targetNode instanceof Array) {
        //     let tweens: Promise<void>[] = [];
        //     for (let i = 0; i < targetNode.length; i++) {
        //         let tween = this.onceNodeShake(targetNode[i], config, cb);
        //         tweens.push(tween);
        //     }
        //     Promise.all(tweens).then(() => cb && cb());
        // } else {
        //     this.onceNodeShake(targetNode, config, cb);
        // }
        // this.shakeNodeEx(targetNode as Node, 39);
    }

    static shakeNodeEx(targetNode: Node, shockTimes) {
        let a = 0,
            b = 0;

        for (let i = 0; i < shockTimes; i++) {
            a = Math.ceil(Math.random() * 7) - 1;
            if (a === 0) {
                b = (Math.ceil(Math.random() * 5) + 1) * Math.pow(-1, Math.ceil(Math.random() * 10));
            } else {
                b = (Math.ceil(Math.random() * 7) - 1) * Math.pow(-1, Math.ceil(Math.random() * 10));
            }
            a += a;
            b += b;

            // 使用 tween 代替 runAction
            tween(targetNode)
                .delay(0.01 * i)
                .to(0.01, {
                    position: new Vec3(targetNode.position.x + a, targetNode.position.y + b, targetNode.position.z),
                })
                .start();
        }

        // 最后将节点位置复位到 (0, 0)
        tween(targetNode)
            .delay(shockTimes * 0.01)
            .to(0.01, { position: new Vec3(0, 0, targetNode.position.z) })
            .start();
    }

    static getRandomAngleInDifferentQuadrant(lastAngle) {
        let lastQuadrant = Math.floor(lastAngle / 90) + 1;
        let newQuadrant;
        do {
            newQuadrant = Math.floor(Math.random() * 4) + 1;
        } while (newQuadrant === lastQuadrant);
        if (PREVIEW) {
            console.log("上次象限：", lastQuadrant, "当前象限：", newQuadrant);
        }
        return (newQuadrant - 1) * 90 + Math.random() * 90;
    }
    static shake(
        targetNode,
        currentDuration,
        times,
        factors,
        onceDuration,
        onceDurations,
        maxNum,
        lastAngle,
        nodeStartPos
    ) {
        if (currentDuration >= times) {
            return;
        }

        let decayFactor = 1;
        if (currentDuration < factors.length) {
            decayFactor = factors[currentDuration];
        }
        let duration = onceDuration;
        if (currentDuration < onceDurations.length) {
            duration = onceDurations[currentDuration];
        }

        let currentMaxNum = maxNum * decayFactor;

        // 随机生成一个新的角度，并确保不在同一个象限内
        let angle = this.getRandomAngleInDifferentQuadrant(lastAngle);

        // 计算新点的坐标
        let randomX = parseFloat((nodeStartPos.x + currentMaxNum * Math.cos((angle * Math.PI) / 180)).toFixed(2));
        let randomY = parseFloat((nodeStartPos.y + currentMaxNum * Math.sin((angle * Math.PI) / 180)).toFixed(2));

        // 更新上一个点的角度
        lastAngle = angle;

        let isNeedBack = true; //Math.abs(randomX) > backNum || Math.abs(randomY) > backNum;
        let z = nodeStartPos.z;

        if (isNeedBack) {
            // 执行震动动画
            tween(targetNode)
                .to(duration, { position: v3(randomX, randomY, z) })
                .to(duration, { position: nodeStartPos })
                .call(() => {
                    currentDuration += 1;
                    this.shake(
                        targetNode,
                        currentDuration,
                        times,
                        factors,
                        onceDuration,
                        onceDurations,
                        maxNum,
                        lastAngle,
                        nodeStartPos
                    );
                })
                .start();
        } else {
            // 执行震动动画
            tween(targetNode)
                .to(onceDuration, { position: v3(randomX, randomY, z) })
                .call(() => {
                    currentDuration += 1;
                    this.shake(
                        targetNode,
                        currentDuration,
                        times,
                        factors,
                        onceDuration,
                        onceDurations,
                        maxNum,
                        lastAngle,
                        nodeStartPos
                    );
                })
                .start();
        }
        if (PREVIEW) {
            console.log(
                "当前次数：",
                currentDuration,
                " 当前半径：",
                currentMaxNum,
                " 当前衰减：",
                decayFactor,
                " 当前随机位置：",
                randomX,
                randomY,
                "是否返回原点：",
                isNeedBack
            );
        }
    }
    /** 单个节点震动 */
    static onceNodeShake(targetNode: Node, config: IShakeConfig, cb: Function) {
        // 获取目标节点的初始位置
        const nodeStartPos = targetNode.getPosition();
        // 单次震动的时间
        const onceDuration = config.onceDuration;
        const onceDurations = config.onceDutations;
        const maxNum = config.maxNum;
        const minNum = config.minNum;
        const times = config.times;
        const factors = config.factor;
        const backNum = config.backNum;
        let totalDuration = 0; //config.onceDuration * times * 2;
        let currentDuration = 0;

        if (times != factors.length) {
            console.warn("震动次数和衰减次数不匹配：", config.times, config.factor, config.factor.length);
        }
        onceDurations.forEach((element) => {
            totalDuration += element * 2;
        });

        // 停止目标动画
        Tween.stopAllByTarget(targetNode);

        // 获取当前象限
        // 获取不同象限的随机角度

        let lastAngle = Math.random() * 360;

        this.shake(
            targetNode,
            currentDuration,
            times,
            factors,
            onceDuration,
            onceDurations,
            maxNum,
            lastAngle,
            nodeStartPos
        );
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                Tween.stopAllByTarget(targetNode);
                targetNode.setPosition(nodeStartPos.x, nodeStartPos.y);
                resolve();
            }, totalDuration * 1000);
        });
    }
}
