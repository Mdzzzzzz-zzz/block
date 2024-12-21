// import {buildInfo} from '../define/GameDefine';
import { error as _error, log as _log, sys, warn as _warn } from "cc";
// import { MKUtil } from "./MKUtil";

/**
 *  日志
 */

class MKLog {
    public static logD (...msg: any[]) {
        // if (!buildInfo.debug) return;
        // let con = ' ';
        // for (const v of [...msg]) {
        //     con += v + ' ';
        // }
        // _log(`[D][${MKLog.now()}][${con}]`);
    }

    public static logW (...msg: any[]) {
        // if (!buildInfo.debug) return;
        // let con = ' ';
        // for (const v of [...msg]) {
        //     con += v + ' ';
        // }
        // _warn(`%c[W][${MKLog.now()}][${con}]`, 'color:rgba(255,0,0,255)');
    }

    public static logE (...msg: any[]) {
        // if (!buildInfo.debug) return;
        // let con = ' ';
        // for (const v of [...msg]) {
        //     con += v + ' ';
        // }
        // _error(`%c[E][${MKLog.now()}][${con}]`, 'color:rgba(255,0,0,255)');
    }

    public static trace (...msg: any[]) {
        // if (!buildInfo.debug) return;
        // let con = ' ';
        // for (const v of [...msg]) {
        //     con += v + ' ';
        // }

        // if (console?.trace) {
        //     console.trace(`%c[T][${MKLog.now()}][${con}]`, 'color:rgba(0,255,0,255)');
        // } else {
        //     _log(`%c[T][${MKLog.now()}][${con}${MKLog.getCallStack(1)}]`, 'color:rgba(0,255,0,255)');
        // }
    }

    private static now () {
        // let dt = new Date();
        // let year = dt.getFullYear();
        // let month = dt.getMonth() + 1;
        // let day = dt.getDate();
        // let hour = this.padZero(dt.getHours());
        // let minute = this.padZero(dt.getMinutes());
        // let second = this.padZero(dt.getSeconds());
        // let milliSeconds = dt.getMilliseconds();
        // let currentTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + milliSeconds;
        // return currentTime;
    }

    private static padZero (t: number) {
        // return t > 9 ? `${t}` : `0${t}`;
    }

    /**
     * 获取当前调用堆栈
     * @param popCount 要弹出的堆栈数量
     */
    private static getCallStack (popCount: number): string {
        // let ret = (new Error()).stack;
        // let pos = MKUtil.findCharPos(ret!, '\n', popCount);
        // if (pos > 0) {
        //     ret = ret!.slice(pos);
        // }
        // return ret!;
        return "";
    }
}

/**
 * 日志
 */
export let log = MKLog.logD;
/**
 * 警告
 */
export let warn = MKLog.logW;
/**
 * 错误
 */
export let error = MKLog.logE;
/**
 * 堆栈
 */
export let trace = MKLog.trace;