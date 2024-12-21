/*
 * @Date: 2023-06-02 18:22:12
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-20 11:22:30
 */
/**
 * 扩展基础类常用方法
 */

import { sys } from "cc";

declare global {
    interface String {
        format: (...replacement: any[]) => string;
        formatSafe: (...replacement: any[]) => string;
    }

    interface Array<T> {

        removeIndex(idx: number): Array<T>;

        removeObject(obj: T): Array<T>;

        randomObject(): T;

        lastObject(): T;

    }
}

String.prototype.format = function (...replacement: any[]): string {
    let tempStr = this;
    for (let i = 0; i < replacement.length; i++) {
        let reg = new RegExp("\\{" + i + "\\}", "gm");
        tempStr = tempStr.replace(reg, replacement[i]);
    }
    return tempStr.toString();
}

Array.prototype.removeIndex = function (index) {
    if (isNaN(index) || index >= this.length || index < 0) {
        return false;
    }
    this.splice(index, 1);
    return this;
};

Array.prototype.removeObject = function (object) {
    let idx = this.indexOf(object);
    if (isNaN(idx) || idx >= this.length || idx < 0) {
        return false;
    }
    this.splice(idx, 1);
    return this;
};

Array.prototype.randomObject = function () {
    if (this.length === 0) {
        return;
    }
    return this[Math.floor(Math.random() * this.length)]
};
Array.prototype.lastObject = function () {
    return this[this.length - 1];
};
String.prototype.formatSafe = function () {
    if (arguments.length <= 0) {
        return this;
    } else {
        var format = this;
        var args = arguments;

        var s = format.replace(/(?:[^{]|^|\b|)(?:{{)*(?:{(\d+)}){1}(?:}})*(?=[^}]|$|\b)/g, function (match, number) {
            number = parseInt(number);

            return typeof args[number] != "undefined" ? match.replace(/{\d+}/g, args[number]) : match;
        });

        return s.replace(/{{/g, "{").replace(/}}/g, "}");
    }
};