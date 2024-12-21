#### 命名规则
1. 文件/文件夹 小写+下划线
2. 代码文件 大驼峰
3. 函数名 小驼峰 

#### 文件夹
- script/define 常量定义 
- script/scene  场景挂载组件 


### games 
#### 规则
- games内不用外界引用文件 若有需要则用MK命名空间下内容
- games外不留games内所用定义
- 
- assets/games/**  游戏子包
  - 此目录下
    - 可引用resources下内容 
    - 可引用mk基础模块

###  nodeBind  节点绑定
###  eventBind  事件绑定(点击)
@ccclass('test')
export class test extends mk.UIBase {
    <!-- 绑定节点 -->
    @nodeBind('bg')
    bg = new Node();
    <!-- 绑定函数 -->
    @eventBind('main/btn_close')
    onClose(){}
}

### 继承UIBase对应的Prefab需要加nodeBind的内容需要在main节点下 

全屏UI、组合UI（非弹窗类UI）
mk.showView
弹窗类UI
mk.showPopup
提示UI
mk.showTips
加载UI 
mk.showPgs


#### 子包配置文件夹 
configs/ct : text 配置 去除第一行《第一行为描述》 


#### 资源同步加载 
loadBundleRes(["res/configs]) 回调之后 可用loadAssetSync("res/configs/xxx"")同步加载资源

####  android 签名
android.keystore
密码 admin123 

### 热更相关
    步骤 
    1. build.sh  
    2. 复制update_package/** 到cnd/${version}/manifest/**
    3. 复制build/android/data/** 到cdn/${version}/**
    工程内 manifest 路径 assets/resources/manifest/**



#### GA 推送测试
http://analytics.tuyoo.com/login?redirect=%2Fgame%2Fgame


#### 打包机 
192.168.10.66   macpro   Tuyou@dtqp123

