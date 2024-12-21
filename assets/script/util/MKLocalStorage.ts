/**
 * 持久化
 */

import { sys } from "cc";

class MKLocalStorage {
  static getItem<T = any>(key:string, def:T = undefined):T {
    const tmp = sys.localStorage.getItem(key);
    if (tmp) {
      try {
          const data = JSON.parse(tmp);
          return data;
      } catch (e) {
        // error('getItem', 'key:', key, 'def', def, e);
      }
    }
    return def;
  }

  static setItem(key:string, value:any) {
    if(key == undefined || value == undefined || key == null || value == null) {
      // error('setItem', 'key:', key, 'value', value);
      return
    }
    let valueStr = JSON.stringify(value);
    sys.localStorage.setItem(key, valueStr);
  }
  
  static removeItem(key:string){
    sys.localStorage.removeItem(key);
  }
}


/**
 *   设置本地存储数据
 */
export let setItem = MKLocalStorage.setItem;
/**
 *   获取本地存储数据
 */
export let getItem = MKLocalStorage.getItem;
/**
 *   删除本地存储数据
 */
export let removeItem = MKLocalStorage.removeItem;