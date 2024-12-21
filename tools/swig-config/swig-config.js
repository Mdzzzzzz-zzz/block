/*
 * @Date: 2024-02-22 11:22:29
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-02-22 14:41:53
 */
'use strict';
const path = require('path');

// 开发者自己的模块定义配置
// configList 是必须的
const configList = [
  ["blk-helper.i","jsb_blk_helper_auto.cpp"]
];

const projectRoot = path.resolve(path.join(__dirname, '..', '..'));
// interfaceDir 是可选的
const interfacesDir = path.join(projectRoot, 'tools', 'swig-config');
// bindingsOutDir 是可选的
const bindingsOutDir = path.join(projectRoot, 'native', 'engine', 'common', 'Classes', 'bindings', 'auto');
// includeDirs 意思是 swig 执行时候使用的头文件搜索路径
const includeDirs = [
  path.join(projectRoot, 'native', 'engine', 'common', 'Classes'),
];
module.exports = {
  interfacesDir, // 可选参数, 如果没有指定，configList 中的路径必须为绝对路径或者相对于当前 swig-config.js 的相对路径
  bindingsOutDir, // 可选参数，如果没有指定, configList 中的路径必须为绝对路径或者相对于当前 swig-config.js 的相对路径
  includeDirs,
  configList // 必填参数
};
