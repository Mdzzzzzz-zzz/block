/**
 * 深拷贝函数
 * @param value     要拷贝的目标
 * @param maxDeep   拷贝的深度限制，如果拷贝时深度超过了这个限制，将直接抛出错误
 */
export function deepClone<T> (value: T, maxDeep = 10): T {
    if (maxDeep < 0) throw new Error('deepClone Error: deep is exceed maxDeep');
    if (!value) return value;
    switch (typeof value) {
        case "object":
            if (value instanceof Map) {
                const map = new Map();
                for (let [_key, _value] of value) {
                    map.set(_key, deepClone(_value, maxDeep - 1));
                }
                return map as any;
            }
            if (value instanceof Set) {
                const set = new Set();
                for (let valueElement of value) {
                    set.add(deepClone(valueElement, maxDeep - 1));
                }
                return set as any;
            }
            if (value instanceof Array) {
                const array = Array(value.length);
                for (let i = 0; i < value.length; i++) {
                    array[i] = deepClone(value[i], maxDeep - 1);
                }
                return array as any
            }
            // 其它类型均当做普通对象处理
            const object: Record<string, any> = {}
            for (let key of Object.keys(value)) {
                object[key] = deepClone(value[key], maxDeep - 1);
            }
            return object as any
        case "function":
            console.warn('deepClone warn: 不支持 function 类型对象的 deep clone');
            return undefined;
        case "bigint":
            console.warn('deepClone warn: 不支持 bigint 类型的 deep clone');
            return undefined;
        case "symbol":
            console.warn('deepClone warn: 不支持 symbol 类型的 deep clone');
            return undefined;
        default:
            return value;
    }
}