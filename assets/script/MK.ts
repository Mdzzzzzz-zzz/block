import * as env from 'cc/env';
import * as mk from './Boot'

// 调试用
if (env.PREVIEW||env.EDITOR) {
    window["mk"] = mk;
}

if (!env.EDITOR) {
    // mk.log("Game版本: {0} ".format(mk.buildInfo.gameVersion));
}

export { mk }