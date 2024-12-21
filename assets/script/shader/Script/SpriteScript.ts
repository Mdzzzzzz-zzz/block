
import { _decorator, Component, Node, UITransform, Sprite,Vec2} from 'cc';
const { ccclass, property,executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = SpriteScript
 * DateTime = Fri Aug 19 2022 11:00:02 GMT+0800 (中国标准时间)
 * Author = leehong
 * FileBasename = SpriteScript.ts
 * FileBasenameNoExtension = SpriteScript
 * URL = db://assets/Script/SpriteScript.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 */

//由于cocos 没有提供图片在shader 中没有提供 textrueSize 需要外部传入
@ccclass('SpriteScript')

//在编辑器中执行
//获取图片尺寸
@executeInEditMode()
export class SpriteScript extends Component {

    start () {
       let tf = this.getComponent(UITransform);
       let size = new Vec2(0,0);
       size.x = tf.contentSize.x;
       size.y = tf.contentSize.y;
       let sprite = this.getComponent(Sprite);
       sprite.getMaterial(0).setProperty("_textureSize",size);
    }
}

