import { Button, Component, EventHandler, find, js, Node } from "cc";
import { error } from "./MKLog";

export const kNodeBind = '__NODE_BIND__';
export const kEventBind = '__EVENT_BIND__';

/**
 * 
 * @param o  构造函数的prototype 
 * @param key 自定义静态变量名
 * @returns 存储节点/事件绑定的信息
 */
function ctorSetGetVal(o:any,key:string):[any,any][]{
    if(!o.constructor.hasOwnProperty(key)){
      o.constructor[key] = [];
    }
    return o.constructor[key];
}

/**
 * 
 * @param path 默认是节点全路径。请使用编辑器右键复制获取该节点的节点全路径
 *             后续可支持多个路径、自定义参数
 * @returns 
 */
export function nodeBind(path:any){
  return function(o:any, attr:string){
      let nb = ctorSetGetVal(o,kNodeBind);
      nb.push([attr,path]);
    }
}

/**
 * 
 * @param path 默认是节点全路径。请使用编辑器右键复制获取该节点的节点全路径
 *             后续可支持多个路径、自定义参数
 * @returns 
 */
export function eventBind(path:any){
  return function(o:any,func:string){
    let eb = ctorSetGetVal(o,kEventBind);
    eb.push([func,path]);
  }
}

/**
 * 
 * @param o  解析该组件绑定的节点，事件。执行运行时绑定信息 
 */
export function parseNode(o:any){
  const name = js.getClassName(o);
  const ctor = js.getClassByName(name);
  _parseNode(o,ctor);
}

/**
 * 递归向父节点绑定到该变量
 * @param o  组件运行时变量
 * @param ctor 该组件的构造函数，用于查找节点，事件绑定的信息
 * @returns 
 */
 function _parseNode(o:any, ctor:Function){
  if(ctor == Component){
    return;
  } 

  const ctorName = js.getClassName(o);
  const parent =  js.getSuper(ctor);
  if(parent != Component){
    _parseNode(o, parent);
  } 

  // 节点绑定
  const nodeBind = ctor[kNodeBind] as [any,any][];
  if (Object.prototype.toString.call(nodeBind) === '[object Array]') {
    for (let index = 0; index < nodeBind.length; index++) {
      const nb = nodeBind[index];
      const name = nb[0];
      const path = nb[1];
      const property = o[name];
      const className = js.getClassName(property);
      const node = find(path,o.node);
      if(!node){
        error('nodeBind node not find', path);
        continue;
      }
      if(className == js.getClassName(Node))
        o[name] = node;
      else {
        const comp = node.getComponent(className);
        if(!comp){
          error('nodeBind comp not exist', className);
          continue;
        }
        o[name] = comp;
      }
    }
  }

  // 事件绑定
  const eventBind = ctor[kEventBind] as [any,any][];
  if (Object.prototype.toString.call(eventBind) === '[object Array]') {
    for (let index = 0; index < eventBind.length; index++) {
      const eb = eventBind[index];
      const funcName = eb[0];
      const path = eb[1];
      const node = find(path,o.node);
      if(!node){
        error('eventBind node not find', path);
        continue;
      }
      const btn = node.getComponent(Button);
      if(btn){
        const eh = new EventHandler()
        eh.target = o.node;
        eh.component = ctorName;
        eh.handler = funcName;
        eh.customEventData = '';
        btn.clickEvents.push(eh);
      } else {
        error('eventBind button comp not exist', path);
        continue;
      }
    }
  }
}