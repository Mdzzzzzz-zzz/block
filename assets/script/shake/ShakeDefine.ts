/*
 * @Date: 2024-05-30 10:16:48
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-04 21:32:07
 */
export enum emShakeLevel {
    heavy = "heavy",
    medium = "medium",
    light = "light",
}

export var ShakeCameraConfig: { [key: string]: IShakeConfig } = {
    heavy: {
        duration: 0.8,
        onceDuration: 0.02,
        maxNum: 10,
        minNum: -10,
        factor: [],
        times: 0,
        backNum: 0,
        onceDutations: []
    },
    medium: {
        duration: 0.24,
        onceDuration: 0.03,
        maxNum: 10,
        minNum: -10,
        factor: [1, 1, 0.6, 0.4, 0.2],
        times: 5,
        backNum: 3,
        onceDutations: [0.02,0.02,0.03,0.04,0.05]
    },
    light: {
        duration: 0.24,
        onceDuration: 0.03,
        maxNum: 5,
        minNum: -5,
        factor: [1, 0.8, 0.6],
        times: 3,
        backNum: 2,
        onceDutations: [0.02,0.03,0.04]
    },
};
