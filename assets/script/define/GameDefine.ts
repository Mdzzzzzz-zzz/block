/*
 * @Date: 2023-05-20 17:29:36
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-04 11:59:13
 */
export interface IBundleConfig {
    bundleName: string;
    url: string; // 远程路径
    version: string; // 版本
    hashVersion: string; // 资源key
    loadingScene: string;
    scene: string;
    loadDir: string[]; // 需要预加载的资源 预加载后可同步获取 进度条相关
    preloadDir: string[]; // 需要预加载的资源 加载不影响进度
    theme: string;
}

// 基础配置
export const buildInfo = {
    gameVersion: "6.5.2",
    internalGameVersion: 0,
    hotVersion: "6.5.1",
    debug: false,
    cryptoConfig: false,
    service: 2, // 0:测试服  1:仿真  2:线上
    onlyEndless: false,
    bundle: {
        block: {
            bundleName: "block",
            url: "",
            hashVersion: "",
            version: "1.0.1",
            loadingScene: "loading", // 加载进度场景
            scene: "game", // 游戏场景
            home: "home", //主界面
            theme: "fish",
            loadDir: [],
            preloadDir: ["res/"],
        },
        level: {
            cat: "res/configs/level",
            bear: "res/configs/level_bear",
            sheep: "res/configs/level_sheep",
            fruit: "res/configs/level_fruit",
            qixi: "res/configs/level_qixi",
            moon: "res/configs/level_moon",
            fish: "res/configs/level_fish",
            // theme:["cat","bear"],
            // themeConfig:{

            // },
        },
    },
    serverUrl: {},
    hotUpdate: {
        main: {
            manifestFile: "manifest/main/project",
        },
        template: {
            manifestFile: "manifest/template/project",
        },
    },
};
