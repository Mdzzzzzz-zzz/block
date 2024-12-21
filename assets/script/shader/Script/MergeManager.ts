import { _decorator, Component, Node, Texture2D, Vec2, SpriteFrame, resources, ImageAsset, v2 } from 'cc';
import { TextureManager } from './TextureManager';
const { ccclass, property } = _decorator;


@ccclass('MergeManager')
export class MergeManager  {
    
    //图片行数
    _rowMax:number = 0;

    //图片列数
    _colMax:number = 0;

    //图片行计数
    _rowCount:number = 0;

    //图片列计数
    _colCount:number = 0;

    //图片计数
    _imageCount:number = 0;

    //单个图片宽
    _imageWidth:number = 0;

    //单个图片高
    _imageHeight:number = 0;

    //下载路径
    _paths:string[];

    _mergeTexture:Texture2D;

    _imageMap = new Map();

    _loaded:boolean = false;

    onLoaded:Function;

    /*
        paths:路径数组
        col:列数
        row:行数
        imageWidth:单个图片宽度
        imageHeight:单个图片高度
    */
    constructor(paths:string[],col:number,row:number,imageWidth:number,imageHeight:number)
    {
        this._paths = paths;
        this._colMax = col;
        this._rowMax = row;
        this._imageWidth = imageWidth;
        this._imageHeight = imageHeight;
    }
    
    init()
    {
        let array_length = this._imageWidth*this._colMax *this._imageHeight* this._rowMax *4;
        let imageData = new Uint8Array(array_length);
        for(let i = 0; i < imageData.length;i++)
        {
            if(i%4 == 3)
            {
                imageData[i] = 255;
            }
            else
            {
                imageData[i] = 255;
            }
        }
        this._mergeTexture = TextureManager.createTexture(imageData,this._imageWidth*this._colMax,this._imageHeight* this._rowMax);
        for(let path of this._paths)
        {
            this.loadImage(path);
        }
    }

    loadImage(path:string,loaded?:Function)
    {
            resources.load(path, ImageAsset, (err, image) => {
            if(err)
            {
                console.error(err);
            }
            else
            {
                let frame = SpriteFrame.createWithImage(image);
                let add:any = frame.texture;
                let pos:Vec2 = v2(this._colCount*this._imageWidth,this._rowCount*this._imageHeight);
                this._imageMap.set(path,pos);
                this._colCount++;
                if(this._colCount == this._colMax)
                {
                    this._colCount = 0;
                    this._rowCount++;
                }
                this._mergeTexture = TextureManager.addImage(this._mergeTexture,add,pos);
                //let frame1 = new SpriteFrame();
            }
            this._imageCount++; 
            if(this._imageCount == this._paths.length)
            {
                this._loaded = true;
                this.onLoaded&&this.onLoaded(this._mergeTexture)
            }
        });
    }
}