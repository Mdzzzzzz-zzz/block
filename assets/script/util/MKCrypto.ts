/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-07-30 11:23:01
 */
// import * as CryptoJS from "./third/crypto/crypto.js"

import { Singleton } from "../Singleton";

export class MKCrypto extends Singleton {
    public Init() {
        
    }
    public UnInit() {}
    key = "bkorHjv4bJMgr96EKqh621nv046aOSq69tePKEMmPv4=";
    // option = {
    //     mode: CryptoJS.mode.ECB,
    //     padding: CryptoJS.pad.NoPadding, //填充模式
    // };
    public aesEncrypt(str, key?) {
        key = key || this.key;

        return CryptoJS.AES.encrypt(str, key).toString();
    }

    public aesDecrypt(str, key?) {
        key = key || this.key;
        return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
    }

    // aesEncryptV2(key, body) {
    //     key = CryptoJS.default.enc.Utf8.parse(key);
    //     body = CryptoJS.default.enc.Utf8.parse(body);
    //     let ins = CryptoJS.default.AES.encrypt(body, key, {
    //         mode: CryptoJS.default.mode.ECB,
    //         padding: CryptoJS.default.pad.Pkcs7,
    //     });
    //     return ins.toString();
    // }

    // aesDecryptV2(key, body) {
    //     key = CryptoJS.default.enc.Utf8.parse(key);
    //     let ins = CryptoJS.default.AES.decrypt(body, key, {
    //         mode: CryptoJS.default.mode.ECB,
    //         padding: CryptoJS.default.pad.Pkcs7,
    //     });
    //     return CryptoJS.default.enc.Utf8.stringify(ins).toString();
    // }
}
