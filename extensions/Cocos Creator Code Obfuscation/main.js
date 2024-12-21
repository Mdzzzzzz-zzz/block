// [如果需要加密资源和代码] 可以参考我的这个的做法->游戏资源加密插件-> https://store.cocos.com/app/detail/5202
// 【有疑问】也可以联系作者: 386437237@qq.com

const Fs = require('fs');
// 获取到的当前的目录路径,绝对路径
const requirePath = require('path');
const rqpathGet=requirePath;
// const JavascriptObfuscator = require('javascript-obfuscator');
const JavascriptObfuscatorClass = require('./main2JavascriptObfuscator');
// 用于快速过滤需要加密的文件
const ReqDeepFiles = require('deep-files');

const JsonObfuscatorJs = require('json-obfuscator');//我不建议使用这个,没啥意义的,不如直接对 JSON 文件进行加密处理之类的, 可以参考我的->游戏资源加密插件-> https://store.cocos.com/app/detail/5202

const get_package_json = require('./package.json'); //方便读取当前的插件版本

const PanelManager = require('./main-panel-manager');

// AST 抽象语法树结构, 一小部分
const Ast_Codeing_Do = require('./lib/common/ast_codeing_do');

// 获取 JSON 文件
// 兼容下 Cocos Dashboard 的解压和商品命名规则
// extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n
let cocosStoreDashboard_zh = "Cocos Creator Code Obfuscation";
let cocosStoreDashboard_en = "Cocos Creator 构建后 · 代码混淆 3.x 版";
let getRunTimeJson_zh = "/extensions/" + cocosStoreDashboard_zh + "/runtime_Ts/cc_obfuscated_js.json";
let getRunTimeJson_en = "/extensions/" + cocosStoreDashboard_en + "/runtime_Ts/cc_obfuscated_js.json";
let configFilePath = "", getRunTimeJson = "/extensions/cc-obfuscated-3_x/runtime_Ts/cc_obfuscated_js.json";
var get_json_uuid = "5571b22d-281e-41a6-b064-1a69b785fb0e";
const prsPath = (Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.remote.projectPath).replace(/\\/g, '/');
// 插件全局目录=> 主目录 Editor.App.home
// 编辑器的安装目录=> 编辑器程序文件夹 Editor.App.path
let global_path = "", local_path = "";
// global_path = requirePath.join(Editor.App.home, "extensions", "cc-obfuscated-3_x", "runtime_Ts", "cc_obfuscated_js.json");
global_path = requirePath.join(Editor.App.home);
// local_path = requirePath.join(prsPath, "extensions", "cc-obfuscated-3_x", "runtime_Ts", "cc_obfuscated_js.json");
local_path = requirePath.join(prsPath);

// console.log("当前路径 Path=[开始]=>\n", global_path, local_path);
if (Fs.existsSync(global_path + getRunTimeJson)) {
  // prsPath = global_path;
  // console.log("当前路径 [全局路径存在] Path=>\n", global_path, local_path);
  configFilePath = global_path + getRunTimeJson;
} else if (Fs.existsSync(local_path + getRunTimeJson)) {
  // console.log("当前路径 [本地路径存在] Path=>\n", global_path, local_path);
  // prsPath = local_path;
  configFilePath = prsPath + getRunTimeJson || local_path + getRunTimeJson;
} else if (Fs.existsSync(global_path + getRunTimeJson_zh)) {
  // 判断 Cocos Dashboard 解压的是不是中文商品名称
  configFilePath = global_path + getRunTimeJson_zh;
  // console.log("getRunTimeJson_zh 读取名称 =>", global_path + getRunTimeJson_zh);
} else if (Fs.existsSync(local_path + getRunTimeJson_zh)) {
  configFilePath = local_path + getRunTimeJson_zh;
  // console.log("getRunTimeJson_zh 读取名称 =>", local_path + getRunTimeJson_zh);
} else if (Fs.existsSync(global_path + getRunTimeJson_en)) {
  // 判断 Cocos Dashboard 解压的是不是中文商品名称
  configFilePath = global_path + getRunTimeJson_en;
  // console.log("getRunTimeJson_en 读取名称 =>", global_path + getRunTimeJson_en);
} else if (Fs.existsSync(local_path + getRunTimeJson_en)) {
  configFilePath = local_path + getRunTimeJson_en;
  // console.log("getRunTimeJson_en 读取名称 =>", local_path + getRunTimeJson_en);
} else {
  // console.log("当前路径 [其它路径存在] Path=>\n", global_path, local_path);
  // prsPath = (Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.remote.projectPath).replace(/\\/g, '/');
  configFilePath = prsPath + getRunTimeJson;
};
// console.log("Editor.Project.path || Editor.projectPath=>", Editor.Project.path, Editor.projectPath);


const { ipcRenderer } = require('electron');
 

// @ts-ignore
const package_json_objson = __importDefault(require("./package.json"));
// let getPathJoins1 = requirePath.join(prsPath, "extensions", package_json_objson.default.name, "runtime_Ts", "cc_obfuscated_js.json");
// console.log(package_json_objson.default.name, "getPathJoins=>\n", getPathJoins1);

/** 包信息 */
const GET_PACKAGE_JSON = require('./package.json');
// let getPathJoins2 = requirePath.join(prsPath, "extensions", GET_PACKAGE_JSON.name, "runtime_Ts", "cc_obfuscated_js.json");
// console.log(GET_PACKAGE_JSON.name, "getPathJoins=>\n", getPathJoins2);

/**
 * 包工具
 */
const getPackageUtil = {
  /**
   * 包名
   * @type {string}
   */
  get name() {
    return GET_PACKAGE_JSON.name;
  },

  /**
   * 版本
   * @type {string}
   */
  get version() {
    return GET_PACKAGE_JSON.version;
  }
};
/** 包名 */
const getPACKAGE_NAME = getPackageUtil.name;


const ConfigManager = require('./lib/common/config-manager');
// const GETcc_deep_copy_meta = require('./change_meta_uuid/ccPluginsDeepToCopyFileJs');


// exports.unload = exports.load = exports.methods = void 0;

// 准备加入 MD5 秘钥来指定每次混淆的结果代码都保证不一致, 免去面板调整参数的繁琐 !
// var get_all_miniTime = new Date().getTime();
// var get_md5_key = someMd5Js(get_all_miniTime);

// 打开构建进程的调试工具
// https://docs.cocos.com/creator/manual/zh/editor/publish/custom-build-plugin.html
// 下三种方式均可打开调试工具：
// 1.在 构建发布 面板点击构建任务窗口右上方的 打开构建调试工具 按钮。
// 2.点击编辑器主菜单中的 开发者 -> 打开构建调试工具 即可。
// 3.在任意控制台或者扩展的代码中，执行以下代码：
// 可以在这个消息方法的基础上，根据自己的需要进行加工处理。（例如：可以在自己编写的构建扩展代码中捕获错误，一旦有异常就自动打开调试工具）。
// Editor.Message.send('builder', 'open-devtools');


// javascript-obfuscator ./ --output ./：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行修改，不会生成新的js文件
// javascript-obfuscator ./ ：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行拷贝，会生成新的js文件，在新的js文件中进行修改。


// 后续判断是否为编辑器的预览环境
// 2.x CC_PREVIEW
// 3.x PREVIEW
// if(CC_PREVIEW){}
// if(PREVIEW){}
// https://docs.cocos.com/creator/manual/zh/editor/extension/api/app.html

// 使用的用户代理信息
// Editor.App.userAgent

// Creator 版本号
// Editor.App.version

// 是否是开发模式
// Editor.App.dev

// 手机端 web-mobile + 桌面端 desktop-mobile
const defaultConfig = PanelManager.set_obfus_obj.defaultConfig;

// 微信小游戏和抖音小游戏
const wxDefaultConfig = PanelManager.set_obfus_obj.wxDefaultConfig;

// let presetFileUrl = 'packages://cc-obfuscated-3_x/preset.json';
// let presets = null;

/**
 *
 * @param {BuildOptions} options
 * @param {Function} callback
 */
function onBuildStart(options, callback) {
  const config = getConfig();
  if (config.auto) console.log('[CC]', '[😎] 将在项目构建完成后自动混淆代码');
  callback();
};



/**
 * 公共的日志输出系统
 * @param  {...any} msg 
 */
function cclog(...msg) {
  console.log(...msg);

  // if (typeof Editor !== "undefined"&&typeof Editor.log !== "undefined") {
  //   ; Editor.log(...msg);
  // } else {
  //   ; console.log(...msg);
  // };
};

// https://docs.cocos.com/creator/manual/zh/editor/extension/profile.html?h=setconfig
// setConfig
// ▸ setConfig(name: string, key: string, value: any, type ?: preferencesProtocol): Promise < void>
//   设置插件配置
// 请求参数
// Name	Type	Description
// name	string	插件名
// key	string	配置路径
// value	any	配置的值
// type ? preferencesProtocol	配置的类型，选填

// https://docs.cocos.com/creator/manual/zh/editor/extension/api/profile.html?h=setconfig
// 读取项目配置
// Editor.Profile.getProject 最后一个参数为空的情况，会进行 优先级 匹配。
// 若指定了获取位置（local 、default 二者之一），则会返回对应的值。如下所示，获取到的 local 为 undefined 是因为未对其进行设置。
// await Editor.Profile.getProject(packageJSON.name, 'test.a'); // 1
// await Editor.Profile.getProject(packageJSON.name, 'test.a', 'local'); // undefined
// 修改项目配置
// 用以下代码修改配置后再调用 getProject 可以看到对应变化。
// await Editor.Profile.setProject(packageJSON.name, 'test.a', 1);
// await Editor.Profile.setProject(packageJSON.name, 'test.a', 'local', 2);
// 存储路径
// 编辑器配置存储路径
// 层级	路径
// local	{projectPath}/profiles/v2/extensions/{extensionName}.json
// global(mac)	Users/{name}/.CocosCreator/profiles/v2/extensions/{extensionName}.json
// global(window)	c/Users/{name}/.CocosCreator/profiles/v2/extensions/{extensionName}.json
// default	{extensionPath}/package.json
// 项目配置存储路径
// 层级	路径
// local	{projectPath}/settings/v2/extensions/{extensionName}.json
// default	{extensionPath}/package.json

/**
 * 打开一个提示面板, 自定义的
 * tipType = info || warn || error
 * titleT = Cocos Creator 混淆代码·提示框
 * tipTitile = 混淆·提示
 * tipInfo = 已打开构建面板, 请在面板内调整混淆代码的参数
 */
async function open_msg_tipPage(tipType, titleT, tipTitile, tipInfo) {
  const tip_config = {
    title: titleT || tipType,
    detail: tipInfo || 'detail',
    buttons: ['请稍等一会', '好的'],
  };
  // const code = await Editor.Dialog[type](`${type} + message`, tip_config);
  const tip_code = await Editor.Dialog[tipType](`${tipTitile}`, tip_config);
  // console.log(tip_code);

  // // 重新加载扩展
  // const args = [`${getPACKAGE_NAME}:reload`];
  // for (let i = 1, l = arguments.length; i < l; i++) {
  //   args.push(arguments[i]);
  // };
  // ipcRenderer.send.apply(ipcRenderer, args);
};
/**
 * 获取配置信息, 也可以用来刷新面板
 * getConfig
 * getProject
 * packName  'cc-obfuscated-3_x'
 * itemCanshu 'jsObfusTip'
 */
// const getObfusJsParam = null;
async function getConfig_getProject(packName, itemCanshu) { 

  // return "getConfig_getProject";
  // return getItemParm;
  let getconfig_getSliderVal0 = await Editor.Profile.getConfig(packName, itemCanshu);
  let getconfig_getSliderVal1 = await Editor.Profile.getConfig(packName, itemCanshu, 'local');

  let getconfig_getSliderVal0_1 = await Editor.Profile.getConfig(packName, itemCanshu, 'default');
  let getconfig_getSliderVal2 = await Editor.Profile.getConfig(packName, itemCanshu, 'global');
  // console.log("on_default_obfu_value_change getConfig [getconfig getSliderVal]==0==", [getconfig_getSliderVal0_1, getconfig_getSliderVal0, getconfig_getSliderVal1, getconfig_getSliderVal2]);

  let getProject_getSliderVal0 = await Editor.Profile.getProject(packName, itemCanshu);
  let getProject_getSliderVal1 = await Editor.Profile.getProject(packName, itemCanshu, 'local');

  let getProject_getSliderVal0_1 = await Editor.Profile.getProject(packName, itemCanshu, 'default');
  let getProject_getSliderVal2 = await Editor.Profile.getProject(packName, itemCanshu, 'global');
  // console.log("on_default_obfu_value_change getConfig [getProject getSliderVal]==1==", [getProject_getSliderVal0_1, getProject_getSliderVal0, getProject_getSliderVal1, getProject_getSliderVal2]);

  // getItemParm = {
  //   getConfigParm: getconfig_getSliderVal0 || getconfig_getSliderVal1,
  //   getProjectParm: getProject_getSliderVal0 || getProject_getSliderVal1,
  // };
  // return getItemParm;
  let getObfusJsParam = getconfig_getSliderVal0 || getconfig_getSliderVal1 || getProject_getSliderVal0 || getProject_getSliderVal1;
  // console.log(`[获取] [${packName}] [${itemCanshu}] [${new Date().getTime()}]`, getObfusJsParam);
  return getObfusJsParam;
};

/**
 * 设置配置面板
 * setConfig
 * setProject
 * packName  'cc-obfuscated-3_x'
 * itemCanshu 'jsObfusTip'
 * valueNew  "临时页面, 暂时未找到可以实时刷新数据的 API , <br>所以用这个页面来做刷新" + 2333
 */
async function setConfig_setProject(packName, itemCanshu, valueNew) {
  // function setConfig_setProject(packName, itemCanshu, valueNew) {
  await Editor.Profile.setConfig(packName, itemCanshu, valueNew);
  await Editor.Profile.setConfig(packName, itemCanshu, 'local', valueNew);
  // await Editor.Profile.setConfig(packName, itemCanshu, 'default', valueNew);
  // await Editor.Profile.setConfig(packName, itemCanshu, 'global', valueNew);

  await Editor.Profile.setProject(packName, itemCanshu, valueNew);
  await Editor.Profile.setProject(packName, itemCanshu, 'local', valueNew);
  // await Editor.Profile.setProject(packName, itemCanshu, 'default', valueNew);
  // await Editor.Profile.setProject(packName, itemCanshu, 'global', valueNew);

  return "setConfig_setProject";
};

/**
 * 读取混淆参数配置的 JSON 文件
 */
// async function getJsonConfig() {
function getJsonConfig() {
  // 超短代码, 但是占地方, 改了
  // const getConfigObjVal = ConfigManager.get();

  let configFilePath_0 = configFilePath || prsPath + getRunTimeJson;
  let getConfigObjVal = null;
  if (Fs.existsSync(configFilePath_0)) {
    getConfigObjVal = JSON.parse(Fs.readFileSync(configFilePath_0, 'utf8'));
    // console.log("getConfigObjVal=>", [configFilePath_0, getConfigObjVal]);
  };

  if (!getConfigObjVal) return null;
  return getConfigObjVal;
};

/**
 * 设置混淆参数配置的 JSON 文件
 */
async function setJsonConfig(saveConfigObjVal) {
  select_node_type_uuid("asset", get_json_uuid);
  // 保存到本地的 ./runtime_Ts/cc_obfuscated_js.json 文件内
  // ConfigManager.set(saveConfigObjVal);
  // console.log("[CC] [😏] [混淆] [参数调整] saveConfigObjVal=>", saveConfigObjVal);
  let configFilePath_1 = configFilePath || prsPath + getRunTimeJson;
  // Fs.writeFileSync(configFilePath_1, JSON.stringify(config, null, 2));
  if (Fs.existsSync(configFilePath_1)) {
    Fs.writeFileSync(configFilePath_1, JSON.stringify(saveConfigObjVal, null, 2));
    console.log('[CC]', '[😏] 已保存混淆参数到文件目录=>\n', configFilePath_1);
  } else {
    console.log('[CC]', '[🤨] 默认保存混淆参数的 JSON 文件已丢失, 请检查目录是否存在=>\n' + configFilePath_1);
  };
  select_node_type_uuid("asset", get_json_uuid);
};


/**
 * 自动定位选中当前组件节点,高亮+闪动
 */
function select_node_type_uuid(selectType, selectUuid) {
  // Editor is not defined in the editor-preview window.
  // Editor.Selection.clear(selectType);
  // this.clog("select_node_type_uuid selectType=>", selectType, selectUuid);
  Editor.Selection.unselect(selectType, selectUuid);
  Editor.Selection.select(selectType, selectUuid);
  // 闪动
  // Editor.Selection.select("asset", selectUuid);
  Editor.Message.broadcast('selection:select', selectUuid);
  Editor.Message.broadcast('selection:activated', selectUuid);
  // Editor.Message.send(selectType, "ui-kit:touch-asset", selectUuid);
  // Editor.Message.send(selectType, "ui-kit", selectUuid);
  // Editor.Message.send(selectType, "touch-asset", selectUuid);
  // Editor.Message.broadcast('ui-kit:touch-asset', selectUuid);
  Editor.Message.broadcast('assets:hint', selectUuid);
  // 高亮资产
  // Editor.Message.send(selectType, "twinkle", selectUuid);
  // Editor.Message.broadcast('twinkle', selectUuid);
};

/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
  open_panel: function () {
    // configFilePath = prsPath + getRunTimeJson;
    Editor.Panel.open('cc-obfuscated-3_x');
  },
  open_setting_panel: function () {
    // configFilePath = prsPath + getRunTimeJson;
    Editor.Panel.open('cc-obfuscated-3_x');
  },
  /**
   * electron 打开设置面板参数的详情
   */
  open_settings_detail_panel() {
    // console.log("into openSettingsPanel " + 12345, PanelManager.openSettingsPanel);
    PanelManager.openSettingsDetailPanel();
    // console.log("into openSettingsPanel " + 67890, PanelManager);
  },
  // 开始设置-混淆的具体参数(会打开项目设置的面板进行设置)
  async open_obfus_comp_setting() {
    // open-settings
    // 打开项目设置面板
    // name {string} 需要打开的选项卡属于哪一个插件注册
    // tab {string} 注册功能的时候使用的 key
    // await Editor.Message.request('project', 'open-settings', package_json_objson.default.name, 'comp-obfuscated-setting');


    // 默认打开微信+抖音小游戏的参数调整面板
    await Editor.Message.request('project', 'open-settings', package_json_objson.default.name, 'comp-seelook-set');

    // console.log("打开项目设置面板");
  },
  async open_obfus_web_setting() {
    // 默认打开用来试验 jsob 的混淆参数的面板(启动的是本地服务器)
    Editor.Panel.open("cc-obfuscated-3_x.jsObfusWeb");

  },
  /**
   * 更改项目内的所有的长短码 UUID 
   */
  selectChangePath_uuid() {
    console.log("[CC][UUID][CHANGE][✅][SELECT]" + " 已移除更改当前项目内的 UUID 的功能 !");
    // console.log("[CC][UUID][CHANGE][✅][SELECT]" + " 默认更改当前项目内的 UUID 的值 !");
    // console.log('[CC][✅]', '开始处理当前项目内所有的 .meta 文件和关联的 UUID=>\n 会先备份所有的 .meta 文件到插件内的 /assets_clone 文件夹下,\n将会处理此目录下所有的 .meta 文件=>\n', prsPath + "/assets/");
    // console.log('[CC][✅]', '开始处理当前项目内所有的 .meta 文件和关联的长短码 UUID=>\n将会处理此目录下所有的 .meta 文件=>\n', prsPath + "/assets/");
    // GETcc_deep_copy_meta.ccUuidCopyChangeSimp(prsPath + "/assets");
  },
  /**
   * AST 混淆 Js
   * 正在完善中.......... autoAstObfusJs
   */
  is_AST_obfusOpen: function (event, config) {
    // configFilePath = prsPath + getRunTimeJson;
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.autoAstObfusJs = true;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      console.log('[CC]', '[😏] 已开启构建后->使用 AST (抽象语法树) 执行不可逆 MD5 混淆代码的功能(会彻底改写引用类名函数名,使用时请谨慎使用)', getPreset('autoAstObfusJs'));
    } else {
      console.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + prsPath + "\n" + configFilePath + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 extensions/cc-obfuscated-3_x \n或者如此 extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
    };
  },
  is_AST_obfusClose: function (event, config) {
    // configFilePath = prsPath + getRunTimeJson;
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.autoAstObfusJs = false;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      console.log('[CC]', '[😏] 已关闭构建后->使用 AST (抽象语法树) 执行不可逆 MD5 混淆代码的功能(会彻底改写引用类名函数名,使用时请谨慎使用)', getPreset('autoAstObfusJs'));
    } else {
      console.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + prsPath + "\n" + configFilePath + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 extensions/cc-obfuscated-3_x \n或者如此 extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
    };
  },
  /**
   * 混淆 JSON 文件
   */
  is_json_obfusOpen: function (event, config) {
    // configFilePath = prsPath + getRunTimeJson;
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.autoObfusJson = true;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      console.log('[CC]', '[😏] 已开启构建后自动混淆 [构建目录下所有的 JSON 文件]', getPreset('autoObfusJson'));
    } else {
      console.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + prsPath + "\n" + configFilePath + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 extensions/cc-obfuscated-3_x \n或者如此 extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
    };
  },
  is_json_obfusClose: function (msgName, paramsVal) {
    // configFilePath = prsPath + getRunTimeJson;
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.autoObfusJson = false;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      console.log('[CC]', '[😏] 已关闭构建后自动混淆 [构建目录下所有的 JSON 文件] ', getPreset('autoObfusJson'));
    } else {
      console.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + prsPath + "\n" + configFilePath + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 extensions/cc-obfuscated-3_x \n或者如此 extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
    };
  },
  /**
   * 读取数据, 实时更改混淆参数到默认的 JSON 文件里面去
   * @param {*} msgName 参数名称
   * @param {*} paramsVal 实时更改的参数值
   */
  async is_auto_obfusJsOpen(msgName, paramsVal) {
    // 读取参数
    let getParmTest = await getConfig_getProject('cc-obfuscated-3_x', msgName);
    // console.log(msgName + "  获取参数 getObfusJsParam=", [getParmTest]);
    // is_auto_obfusJS
    // 此行设置可以注释, 不然会卡死的
    // await setConfig_setProject('cc-obfuscated-3_x', msgName, paramsVal);

    let getObfusJson = await getJsonConfig();
    // for (let kk in getObfusJson) {
    //   console.log("json=> ", [kk, getObfusJson[kk], getObfusJson]);
    // };
    let getH5_obs = getObfusJson.defaultConfig;
    let getMiniGame_obs = getObfusJson.wxDefaultConfig;
    let getH5_obsNAME = getH5_obs[msgName];
    let getMiniGame_obsNAME = getMiniGame_obs[msgName.split("mini_")[1]];
    // console.log("[CC] [😏] [混淆] [读取 JSON 2] ", [typeof getObfusJson, getObfusJson, getH5_obs, getMiniGame_obs]);

    // console.log("[CC] [😏] [混淆] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
    // 开关混淆做特殊处理
    if (msgName == 'is_auto_obfusJS' || msgName == 'mini_is_auto_obfusJS') {
      if (paramsVal) {
        // console.log("开启混淆", [msgName, paramsVal, typeof paramsVal]);
        // console.log("[CC] [😏] [混淆] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
        await Editor.Message.send('cc-obfuscated-3_x', 'open_ob_build');
      } else {
        // console.log("关闭混淆", [msgName, paramsVal, typeof paramsVal]);
        // console.log("[CC] [😏] [混淆] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
        await Editor.Message.send('cc-obfuscated-3_x', 'close_ob_build');
      };
    } else if (msgName == 'is_json_obfus' || msgName == 'mini_is_json_obfus') {
      if (paramsVal) {
        await Editor.Message.send('cc-obfuscated-3_x', 'is_json_obfusOpen');
      } else {
        await Editor.Message.send('cc-obfuscated-3_x', 'is_json_obfusClose');
      };
    } else if (msgName == 'is_AST_obfus' || msgName == 'mini_is_AST_obfus') {
      if (paramsVal) {
        // let getMd5Val = Ast_Codeing_Do.ast_md5_func("Cocos抽象语法树加密ast_md5_func");
        // console.log("AST 抽象语法树 [开]=>", getMd5Val);
        await Editor.Message.send('cc-obfuscated-3_x', 'is_AST_obfusOpen');
      } else {
        await Editor.Message.send('cc-obfuscated-3_x', 'is_AST_obfusClose');
      };
    } else if (getH5_obsNAME != null || getMiniGame_obsNAME != null) {
      // console.log("getH5_obsNAME || getMiniGame_obsNAME=> ", [getH5_obsNAME, getMiniGame_obsNAME]);
      console.log("[CC] [😏] [混淆] [参数调整] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);

      // 适配三个多选选项的值
      let select_identifierNamesGenerator = [
        "identifierNamesGenerator", [
          "dictionary",
          "hexadecimal",
          "mangled",
          "mangled-shuffled",
        ]
      ];
      let select_target = [
        "target", [
          "browser",
          "browser-no-eval",
          "node",
        ]
      ];

      if (getH5_obsNAME != null) {
        getH5_obs[msgName] = paramsVal;
        if (msgName == select_identifierNamesGenerator[0]) {
          getH5_obs[msgName] = select_identifierNamesGenerator[1][Number(paramsVal)];
        };
        if (msgName == select_target[0]) {
          getH5_obs[msgName] = select_target[1][Number(paramsVal)];
        };

        // console.log("准备设置=getH5_obs>", [msgName, paramsVal, getH5_obs[msgName], getH5_obs]);
        // await setJsonConfig(getH5_obs);
        await setJsonConfig(getObfusJson);
      } else if (getMiniGame_obsNAME != null) {
        getMiniGame_obs[msgName.split("mini_")[1]] = paramsVal;
        if (msgName.split("mini_")[1] == select_identifierNamesGenerator[0]) {
          getMiniGame_obs[msgName.split("mini_")[1]] = select_identifierNamesGenerator[1][Number(paramsVal)];
        };
        if (msgName.split("mini_")[1] == select_target[0]) {
          getMiniGame_obs[msgName.split("mini_")[1]] = select_target[1][Number(paramsVal)];
        };

        // console.log("准备设置=getMiniGame_obs>", [msgName, paramsVal, getMiniGame_obs[msgName.split("mini_")[1]], getMiniGame_obs]);
        // await setJsonConfig(getMiniGame_obs);
        await setJsonConfig(getObfusJson);
      } else { };

    } else {
      // console.log("getH5_obs || getMiniGame_obs=> ", [getH5_obs, getMiniGame_obs]);
      // console.log("getH5_obsNAME || getMiniGame_obsNAME=> ", [getH5_obsNAME, getMiniGame_obsNAME]);
      console.log("[CC] [😏] [混淆] [参数无效] " + "该参数未定义", [getH5_obs, getMiniGame_obs, getH5_obsNAME, getMiniGame_obsNAME]);
      console.log("[CC] [😏] [混淆] [参数调整] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
    };
    await getConfig_getProject('cc-obfuscated-3_x', msgName);
  },
  // 测试更改绑定的 JSON 文件时触发的事件
  async on_default_obfu_value_change() {
    console.log("[CC] [😏] [混淆] 虽然此 Json 文件可以不用绑定, 但是仍旧不建议您更改 !");

    // getConfig_getProject('cc-obfuscated-3_x', 'jsObfusTip');
    // setConfig_setProject('cc-obfuscated-3_x', 'jsObfusTip', rand_0_1);

    // // open_msg_tipPage("info", "Cocos Creator 混淆代码·提示框", "混淆·提示", "已打开构建面板, 请在面板内调整混淆代码的参数");

    // // https://docs.cocos.com/creator/manual/zh/editor/extension/profile.html?h=setconfig
    // // https://docs.cocos.com/creator/manual/zh/editor/extension/api/profile.html?h=setconfig
    // // 修改编辑器配置
    // let randNum = Math.floor(Math.random() * 100) / 100;
    // // await Editor.Profile.setConfig('cc-obfuscated-3_x', 'bind_slider', randNum); 
    // setConfig_setProject('cc-obfuscated-3_x', 'test.a', randNum);
    // getConfig_getProject('cc-obfuscated-3_x', 'test.a');

    // open_msg_tipPage("info", "Cocos Creator 混淆代码·提示框", "混淆·提示", "参数==" + randNum); 
  },
  async onDefaultFontChanged2() {
    // let getSliderVal0 = await Editor.Profile.getConfig('cc-obfuscated-3_x', 'bind_slider');
    // let getSliderVal1 = await Editor.Profile.getConfig('cc-obfuscated-3_x', 'bind_slider', 'local'); 

    getConfig_getProject('cc-obfuscated-3_x', 'bind_slider');

    let rand_0_1 = Math.floor(Math.random() * 100) / 100;
    setConfig_setProject('cc-obfuscated-3_x', 'bind_slider', rand_0_1);
    getConfig_getProject('cc-obfuscated-3_x', 'bind_slider');


    // 设置第二页
    setConfig_setProject('cc-obfuscated-3_x', 'bind_check4_1', "临时页面, 暂时未找到可以实时刷新数据的 API , <br>所以用这个页面来做刷新" + rand_0_1);
    getConfig_getProject('cc-obfuscated-3_x', 'bind_check4_1');

    // await Editor.Message.send('scene', 'soft-reload');
    // await Editor.Message.send('builder', 'preferences-changed');
    let pattern_Params = await Editor.Message.request('asset-db', 'query-assets', { "pattern": "db://**/*.rpp" });
    // let open_settings = await Editor.Message.request('project', 'open-settings', 'cc-obfuscated-3_x', 'comp-setting2');
    // let open_settings = 10000;
    // console.log("onDefaultFontChanged2 setConfig pattern_Params 触发事件 open-setting2 代码-更改值 =" + rand_0_1, [rand_0_1, open_settings, pattern_Params]);


    // console.log("onDefaultFontChanged2 setConfig soft-reload 触发事件 代码-更改值 =" + rand_0_1);
    // window.location.reload();
    // console.log("onDefaultFontChanged2 触发事件 代码-更改值 rand_0_1=" + rand_0_1);
    // console.log("onDefaultFontChanged2 触发事件 代码-更改值" + new Date().getTime());
  },
  async onDefaultFontChanged3() {
    getConfig_getProject('cc-obfuscated-3_x', 'bind_slider');
  },
  async onDefaultFontChanged4() {
    let open_settings = await Editor.Message.request('project', 'open-settings', 'cc-obfuscated-3_x', 'comp-setting');
    // console.log("onDefaultFontChanged4 open_settings ==2==", [open_settings]);

  },
  // TODO
  open_ob_build: function (event, config) {
    select_node_type_uuid("asset", get_json_uuid);
    // config = getConfig();
    // config.auto = true;
    // console.log("prsPath=>", prsPath);
    // configFilePath = prsPath + getRunTimeJson;
    // console.log("configFilePath=>", configFilePath);
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.auto = true;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      // , getPreset('auto')
      console.log('[CC]', '[😏]['+get_package_json.version+'] 已开启构建后自动混淆代码 ', getPreset('auto'));
    } else {
      console.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + prsPath + "\n" + configFilePath + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 extensions/cc-obfuscated-3_x \n或者如此 extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
    };
    select_node_type_uuid("asset", get_json_uuid);
    // Fs.existsSync(presetFilePath) && Fs.unlinkSync(presetFilePath);
  },
  close_ob_build: function (event) {
    select_node_type_uuid("asset", get_json_uuid);
    // config = getConfig();
    // // config.auto = getPreset('auto');
    // config.auto = false;
    // console.log("prsPath=>", prsPath);
    // configFilePath = prsPath + getRunTimeJson;
    // console.log("configFilePath=>", configFilePath);
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.auto = false;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      // , getPreset('auto')
      console.log('[CC]', '[🤨]['+get_package_json.version+'] 已关闭构建后自动混淆代码 ', getPreset('auto'));
    } else {
      console.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + prsPath + "\n" + configFilePath + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 extensions/cc-obfuscated-3_x \n或者如此 extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
    };
    select_node_type_uuid("asset", get_json_uuid);
  },

  // 手动选择需要混淆的 JS 文件, 选择混淆方式, 进行混淆
  selectAST_jsOb(params) {
    if (params) {
      if (params.path.length > 0) {
        // console.log("[CC]", "[✅][" + params.type + "][params] 正在开始混淆 JS 代码=>\n", [params.path.match(".js"), params.path]);
        console.log("[CC]", "[✅][" + params.type + "][params] 正在开始混淆 JS 代码=>\n", [params.type, params.path]);

        if (params.type == "AST") {
          // 启动 AST 混淆方式
          Ast_Codeing_Do.ast_mix_jsMAIN(params.path, false);
        } else if (params.type == "JSob") {
          var startTime = new Date().getTime();
          // 构建时, 读取 JSON 的参数来进行混淆
          var buildStartGetObfusJson = getJsonConfig();
          var buildStartGetH5_obs = buildStartGetObfusJson.defaultConfig;
          var buildStartGetMiniGame_obs = buildStartGetObfusJson.wxDefaultConfig;
          // 启动 JS-OB 混淆方式, 用小游戏的参数
          js_obfuscate(params.path, buildStartGetMiniGame_obs);

          var EndTime = new Date().getTime();
          var usingTime = EndTime - startTime;
          usingTime = (usingTime / 1000).toFixed(2);
          console.log("[CC]", "[✅][" + usingTime + "s][JS-OB] 混淆完成, 已写入文件\n文件路径为=>\n" + params.path);
        };
      };
    } else {
      console.error("[CC]", "[❌][SELECT]" + " 请选择一个需要混淆的 JS 文件 !");
    };
  },
};

/**
 * 读取配置
 */
function getConfig() {
  let config = null;
  if (Fs.existsSync(configFilePath)) {
    config = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
  };
  // if (!config) {
  //   config = JSON.parse(JSON.stringify(defaultConfig));
  //   config.options = getPreset('options');
  //   if (config.preset != 'close') {
  //     const preset = getPreset(config.preset);
  //     for (const key in preset) { config.options[key] = preset[key]; }
  //   };
  // };
  return config;
};

/**
 * 读取预设参数
 * @param {string} type 预设名
 */
function getPreset(type) {
  // if (presets) return presets[type];
  const presetFilePath = configFilePath;
  if (Fs.existsSync(presetFilePath)) {
    presets = JSON.parse(Fs.readFileSync(presetFilePath, 'utf8'));
    return presets[type];
  };
  return null;
};


/**
 * 异或加密代码里面的字符串内容(为了防止一些问题, 不加密 ``里面的字符串)
 * @param {*} postStr 
 * @param {*} encodeKey 9527
 * @return
 */
function replace_encode_string(postStr, encodeKey = 9527) {
  /**
   * 加解密代码逻辑-加密
   * @param {*} postCoddingStr 字符串代码格式
   * @returns 加密的字符串版本
   */
  function encodeJSstring(postCoddingStr) {
    postCoddingStr = postCoddingStr.toString();
    var getASCIIarr = [];
    for (var cStr = 0; cStr < postCoddingStr.length; cStr++) {
      getASCIIarr.push(postCoddingStr.charCodeAt(cStr) ^ encodeKey);
    };
    return getASCIIarr.join(',');
  };
  // /**
  //  * 加解密代码逻辑-解密
  //  * @param {*} postCoddingStr 加密的 ASCII 组合的字符串
  //  * @returns 解密的字符串(代码的原来样式)
  //  */
  // function decodeJSstring(postCoddingStr) {
  //     var getEnCodeArr = postCoddingStr.split(",");
  //     var getASCIIarr = [];
  //     for (var decStr = 0; decStr < getEnCodeArr.length; decStr++) {
  //         getASCIIarr.push(String.fromCharCode(Number(getEnCodeArr[decStr]) ^ encodeKey));
  //     };
  //     return getASCIIarr.join('');
  // };


  // 用来解密的
  var decode_ascii_str = `;function xor_de_d(s) { var a = s.split(","), r = []; for (var e = 0; e < a.length; e++) { r.push(String.fromCharCode(Number(a[e]) ^ ${encodeKey})); }; return r.join(""); };`;

  if (postStr.match(/`(.*)`/)) {
    console.log("[CC][混淆] 目前不支持加密 `` 之间的字符串!");
  } else if (postStr) {
    // 转换一下, 防止有什么非字符串出现
    postStr = postStr.toString();

    // 正则匹配内容
    var matArr_1 = [], matArr_2 = [], matArr_End = [];
    // matArr_1 = postStr.match(/'(.*)'/g) || [];
    // matArr_2 = postStr.match(/"(.*)"/g) || [];
    matArr_End = postStr.match(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'/g) || [];
    // Fs.writeFileSync("已匹配到字符串.filePath" + ".txt", matArr_End.join(""));
    console.log("已匹配到字符串=>", [matArr_End.length]);

    // 开始加密
    // for (var ii = 0; ii < matArr_1.length; ii++) {
    //   postStr = postStr.replace(matArr_1[ii], "xor_de_d('" + encodeJSstring(matArr_1[ii]) + "')");
    // };
    // for (var jj = 0; jj < matArr_2.length; jj++) {
    //   postStr = postStr.replace(matArr_2[jj], "xor_de_d('" + encodeJSstring(matArr_2[jj]) + "')");
    // };
    for (var kk = 0; kk < matArr_End.length; kk++) {
      postStr = postStr.replace(matArr_End[kk], "xor_de_d('" + encodeJSstring(matArr_End[kk]) + "')");
    };

    // 载入解密函数
    if (matArr_1.length > 0 || matArr_2.length > 0 || matArr_End.length > 0) {
      postStr = decode_ascii_str + postStr;
    };
  };

  return postStr;
};


/**
 * 混淆
 * @param {string} filePath 文件路径
 * @param {ObfuscatorOptions} options 混淆参数
 */
function js_obfuscate(filePath, options) {
  var startTime = new Date().getTime();

  var sourceCode = Fs.readFileSync(filePath, 'utf8');
  // 加密字符串, 有点可惜, 这个在某些代码上使用会报错, 还是手动改吧...// sourceCode = replace_encode_string(sourceCode, 7259);

  // javascript-obfuscator ./ --output ./：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行修改，不会生成新的js文件
  // javascript-obfuscator ./ ：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行拷贝，会生成新的js文件，在新的js文件中进行修改。
  // const obfuscationResult = JavascriptObfuscator.obfuscate(sourceCode, options);
  const obfuscationResult = JavascriptObfuscatorClass.JavascriptObfuscatorFunc(sourceCode, options);

  var obfuscatedCode = obfuscationResult.getObfuscatedCode();

  Fs.writeFileSync(filePath, obfuscatedCode);


  var EndTime = new Date().getTime();
  var usingTime = EndTime - startTime;
  usingTime = (usingTime / 1000).toFixed(2);
  // console.log("[CC]", "[👍][" + usingTime + "s][END][JS-OB] 混淆完成, 已写入 .js 文件\n文件路径为=>\n" + filePath);
};
// 构建后自动混淆代码=AST||JS-OB
async function builder_changed(options, params) {
  let isn_open_buildOb = true;
  let is_AST_obfusOpenCloseBool = true;
  let is_json_obfusOpenCloseBool = true;

  let getCongif = wxDefaultConfig || defaultConfig;
  // 构建时, 读取 JSON 的参数来进行混淆
  let buildStartGetObfusJson = await getJsonConfig();
  let buildStartGetH5_obs = buildStartGetObfusJson.defaultConfig;
  let buildStartGetMiniGame_obs = buildStartGetObfusJson.wxDefaultConfig;
  // 赋值
  let build_defaultConfig = buildStartGetH5_obs || PanelManager.set_obfus_obj.defaultConfig;
  let build_wxDefaultConfig = buildStartGetMiniGame_obs || PanelManager.set_obfus_obj.wxDefaultConfig;
  // console.log("[读取混淆参数] =读取>", [buildStartGetH5_obs, buildStartGetMiniGame_obs]);
  // console.log("[读取混淆参数] =赋值>", [build_defaultConfig, build_wxDefaultConfig]);

  if (params.options.platform == 'wechatgame' || params.options.platform == 'bytedance-mini-game') {
    getCongif = build_wxDefaultConfig;
    // 如果已经开起自动混淆就执行!! wechatgame
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  } else if (params.options.platform == 'web-mobile') {
    getCongif = build_defaultConfig;
    // 如果已经开起自动混淆就执行!! web-mobile
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  } else if (params.options.platform == 'web-desktop') {
    getCongif = build_defaultConfig;
    // 如果已经开起自动混淆就执行!! web-desktop
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  } else {
    getCongif = build_wxDefaultConfig;
    // 其它类型
    // console.log("[CC]", "[🌟] 目前仅支持加密 wechatgame || bytedance-mini-game || web-mobile || web-desktop 构建的 .js 代码<支持md5缓存模式> \n 暂不支持 [" + params.options.platform + "] 平台");
    // return false;
    // 全平台支持代码混淆的功能
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  }; 
  //   // cclog(`[CC][⭐][JS][✍][✅✅✅][总计] 当前已经递归混淆的 .js 文件集合==> \n`, [getAlljsListArr0,options.dest,tmpBuildFilePathArray,getBuildAllFilesJsArray]);
  //   cclog(`[CC][⭐][JS][✍][✅✅✅][总计] 当前已经递归混淆的 .js 文件集合==> \n`, [options.dest,tmpBuildFilePathArray,getBuildAllFilesJsArray]);
  // },1323); 
  if (params.state == "success" || params.progress == 1) {
    // 指定要读取的目录--start--- 
    // cclog("[CC]", "[⭐][AST] 正在开始混淆 [" + params.options.platform + "] 里面的代码===options, ====>>>>>>\n", [options]);
    // cclog("[CC]", "[⭐][AST] 正在开始混淆 [" + params.options.platform + "] 里面的代码===, params====>>>>>>\n", [params]);
    // 指定要读取的目录--end--- buildPath

    if (isn_open_buildOb) {
      // 开始使用 AST + MD5 秘钥来混淆函数内容, [ 1.0 ]
      // 保证每次混淆的结果不一致, 保证有最少 1/3 ~ 2/3 的代码是不可逆的 MD5 随机混淆
      // ...ConfigManager.cache.BuildOptions 完善中
      // 必须先用 AST 混淆, 否则逻辑落差会很大
      // var getAlljsListArr0=traverseJSFiles(options.dest);
      // 递归处理目录
      var getBuildsPaths = params.options.buildPath;
      if (getBuildsPaths.includes("project:")){
        getBuildsPaths = prsPath + "/" + getBuildsPaths.replace('project://', '') + "/" + params.options.outputName;
      }else{
        getBuildsPaths = getBuildsPaths+ "/" + params.options.outputName;
      };
      getBuildsPaths = getBuildsPaths.replace(new RegExp(/\\/, 'g'), '/');
      getBuildsPaths = getBuildsPaths.replace(new RegExp(/\"/, 'g'), '');
      getBuildsPaths = getBuildsPaths.replace(new RegExp(/\'/, 'g'), '');
      cclog("[CC]", "[⭐][AST] 正在开始混淆 [" + params.options.platform + "] 里面的代码===getBuildsPaths====>>>>>>\n", [getBuildsPaths]);

      var getBuildAllFilesJsArray = ReqDeepFiles(getBuildsPaths, "*.{js,js}");
      cclog("[CC]", "[⭐][AST] 已匹配到的待处理的 .js 文件集合====>>>>>>\n", [getBuildAllFilesJsArray]);
      var tmpBuildPath = "", tmpBuildFilePathArray = [];
      let lowerApath = tmpBuildPath.toLowerCase();// 过滤引擎目录, 建议混淆引擎不要在此处处理, 需要单独测试自行混淆处理
      for (var jj0 = 0; jj0 < getBuildAllFilesJsArray.length; jj0++) {
        tmpBuildPath = getBuildAllFilesJsArray[jj0];
        tmpBuildPath = tmpBuildPath.replace(new RegExp(/\\/, 'g'), '/');
        tmpBuildPath = tmpBuildPath.replace(new RegExp(/\"/, 'g'), '');
        tmpBuildPath = tmpBuildPath.replace(new RegExp(/\'/, 'g'), '');
        // 过滤引擎目录, 建议混淆引擎不要在此处处理, 需要单独测试自行混淆处理
        lowerApath = tmpBuildPath.toLowerCase();
        if (
          tmpBuildPath.match("cocos/") ||  //不混淆 Cocos3x 引擎 js
          tmpBuildPath.match("cocos-js/") || //不混淆 Cocos3x 引擎 js
          lowerApath.includes("/cocos/")||//不混淆 Cocos3x 引擎 js
          lowerApath.includes("/cc/")||//不混淆 Cocos3x 引擎 js
          lowerApath.includes("/cocos2d/")||//不混淆 Cocos3x 引擎 js
          lowerApath.includes("/cocos-2d/")||//不混淆 Cocos3x 引擎 js
          lowerApath.includes("/cocos-js/")||//不混淆 Cocos3x 引擎 js
            rqpathGet.basename(tmpBuildPath).match("vconsole") || 
            rqpathGet.basename(tmpBuildPath).match("physics") || 
            rqpathGet.basename(tmpBuildPath).match("cocos") || 
            rqpathGet.basename(tmpBuildPath).match("cocos2d") || 
            rqpathGet.basename(tmpBuildPath).match("cocos-2d") || 
            rqpathGet.basename(tmpBuildPath).match("cc")) {
            cclog(`[CC][⭐][JS][✍][XXX][${rqpathGet.basename(tmpBuildPath)}] 这个 .js 文件可能是引擎文件，不予混淆==> \n`, tmpBuildPath);
        } else { 
          if (is_AST_obfusOpenCloseBool) {
            var sourceCode = Fs.readFileSync(tmpBuildPath, 'utf8');
            JavascriptObfuscatorClass.jsconfuserObfuscatorFunc(sourceCode, tmpBuildPath); 
            tmpBuildFilePathArray.push(tmpBuildPath);
          } else {
            // JavascriptObfuscatorClass.JavascriptObfuscatorFunc();
            js_obfuscate(tmpBuildPath, getCongif);

            tmpBuildFilePathArray.push(tmpBuildPath);
            cclog(`[CC][⭐][JS][✍][✅][${rqpathGet.basename(tmpBuildPath)}] 当前正在递归混淆的 .js 文件==> \n`, tmpBuildPath); 
          };


          // tmpBuildFilePathArray.push(tmpBuildPath);
          // cclog(`[CC][⭐][JS][✍][✅][${rqpathGet.basename(tmpBuildPath)}] 当前正在递归混淆的 .js 文件==> \n`, tmpBuildPath); 
        };
      };
      // cclog(`[CC][⭐][JS][✍][✅✅✅][总计] 当前已经递归混淆的 .js 文件集合==> \n`, [getAlljsListArr0,options.dest,tmpBuildFilePathArray,getBuildAllFilesJsArray]);
      cclog(`[CC][⭐][JS][✍][✅✅✅][总计] 当前已经递归混淆的 .js 文件集合==> \n`, [options.dest, tmpBuildFilePathArray, getBuildAllFilesJsArray]);
 
    } else if (is_AST_obfusOpenCloseBool || is_json_obfusOpenCloseBool) { 
    } else {
      console.log("[CC]", "[🤨]["+get_package_json.version+"][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
    };
  } else if (params.state == "processing") {
    // console.log("构建开始 builder_changed:processing=params.options=params=>", [params]);
    // console.log("构建开始 builder_changed:processing=params.options.packages==>", [params.options.packages, params.options.packages["web-mobile"]]);
  } else if (params.state == "waiting") {
    // console.log("构建开始 builder_changed:=>", options, params);
    if (!isn_open_buildOb) {
      console.log("[CC]", "[🤨]["+get_package_json.version+"][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
    };
    var get_autoAstObfusJsBool = getPreset('autoAstObfusJs');
    if (!get_autoAstObfusJsBool) {
      // console.log("[CC]", "[🤨][AST] 混淆已关闭, 请在项目设置面板里面开启 AST 混淆");
    } else {
      // console.log("[CC]", "[😏][AST] 抽象语法树混淆已开启, 将在构建完成后使用 MD5 不可逆的方式自动混淆 JS 文件, 保证每次混淆的结果都是不一样的.");
    };
  } else {
    // console.log("构建状态未知 builder_changed:=>", options, params);
    // Editor.Message.removeBroadcastListener("builder:task-changed", remove_builder_broad);
  };

 
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
exports.load = function () {
  isn_open_buildOb = getPreset('auto');
  if (!isn_open_buildOb) {
    console.log("[CC]", "[🤨][JS-OB]["+get_package_json.version+"] 混淆已关闭, 请在拓展菜单开启混淆");
  } else {
    console.log("[CC]", "[😏][JS-OB]["+get_package_json.version+"] 代码混淆已开启, 将在构建完成后自动混淆主要的 JS 文件\n混淆参数保存的目录为=>\n" + configFilePath);
  };
  var get_autoAstObfusJsBool = getPreset('autoAstObfusJs');
  if (!get_autoAstObfusJsBool) {
    // console.log("[CC]", "[🤨][AST] 混淆已关闭, 请在项目设置面板里面开启 AST 混淆");
  } else {
    // console.log("[CC]", "[😏][AST] 抽象语法树混淆已开启, 将在构建完成后使用 MD5 不可逆的方式自动混淆 JS 文件, 保证每次混淆的结果都是不一样的.");
  };
  //当package被正确加载的时候执行
  // Editor.Message.on('build-start', onBuildStart);
  // Editor.Builder.on('before-change-files', onBeforeChangeFiles);
  // console.log("扩展加载完成后触发的钩子 load111222");
  // Editor.Builder.on('build-end', onBuildEnd);
  Editor.Message.addBroadcastListener("builder:task-changed", builder_changed);
};
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
exports.unload = function () {
  //当package被正确卸载的时候执行
  // Editor.Builder.removeListener('build-start', onBuildStart);
  // Editor.Builder.removeListener('before-change-files', onBeforeChangeFiles);
  Editor.Message.removeBroadcastListener("builder:task-changed", builder_changed);
};
