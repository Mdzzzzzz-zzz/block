import { _decorator, Component, Node, Texture2D, gfx, Vec2, v2, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

export class TextureManager {

   //通过data创建texture
   public static createTexture(imgData:any,width:number,height:number):Texture2D
   {

       //默认一张白色纹理
       let tex = new Texture2D();

       // /包含 RGBA 四通道的 32 位整形像素格式：RGBA8888。 一字节8位
       tex.reset({width: width, height: height, format: Texture2D.PixelFormat.RGBA8888, mipmapLevel: 0 });
       tex.uploadData(imgData, 0, 0);

       // 更新 0 级 Mipmap。
       tex.updateImage();
       return tex;
   }

   //扩展图片
   public static expandImage(imgData:Uint8Array,width:number,height:number,expand:number = 0):Uint8Array
   {
       let buffer = new Uint8Array(imgData.length + 4 * (expand * width * 2 + expand * height * 2 + height*width*4));   
       let row = 0;
       let col = 0;
       let img_index = 0;
       let new_width =  width + expand * 2;
       let new_height = height + expand * 2;
       let color_value = 0;

       for(let index =0;index< buffer.length;index  = index + 4)
       {
           if(row < expand)
           {
            buffer[index] = color_value;
            buffer[index+1] = color_value;
            buffer[index+2] = color_value;
            buffer[index+3] = color_value;
           }
           else if(row >= height + expand)
           {
               buffer[index] = color_value;
               buffer[index+1] = color_value;
               buffer[index+2] = color_value;
               buffer[index+3] = color_value;
           }
           else
           {
               if(col < expand)
               {
                    buffer[index] = color_value;
                    buffer[index+1] = color_value;
                    buffer[index+2] = color_value;
                    buffer[index+3] = color_value;
               }
               else if(col >= width + expand)
               {
                    buffer[index] = color_value;
                    buffer[index+1] = color_value;
                    buffer[index+2] = color_value;
                    buffer[index+3] = color_value;
               }
               else
               {
                   buffer[index] = imgData[img_index];
                   buffer[index+1] = imgData[img_index+1];
                   buffer[index+2] = imgData[img_index+2];
                   buffer[index+3] = imgData[img_index+3];
                   img_index = img_index + 4;
               }
           }
           col++;
           if(col >= new_width)
           {
               col = 0;
               row++;
           }
       }
       return buffer;

   }

   public static addImage(oriTex:Texture2D,addTex:Texture2D,offset:Vec2 = v2(0,0))
   {
        let oriData = this.readPixelsForTexture(oriTex);
        let addData =  this.readPixelsForTexture(addTex);   
        let row = 0;
        let col = 0; 
        let addIndex = 0;
        //console.log(addData);
        for(let index =0;index< oriData.length;index  = index + 4)
        {   
            
            if(col >= offset.x && col < addTex.width +  offset.x && row >= offset.y && row < addTex.height +  offset.y )
            {
                let alpha = addData[addIndex+3]
                oriData[index] = addData[addIndex];
                oriData[index+1] = addData[addIndex+1];
                oriData[index+2] = addData[addIndex+2];
                oriData[index+3] = alpha;
                addIndex  += 4;
            }
            col++;
            if(col == oriTex.width)
            {
                col = 0;
                row++;
                /*
                let alpha = addData[addIndex+3]
                oriData[index] = addData[addIndex];
                oriData[index+1] = addData[addIndex+1];
                oriData[index+2] = addData[addIndex+2];
                oriData[index+3] = alpha;
                addIndex  += 4;*/
            }
        }  
        return this.createTexture(oriData,oriTex.width,oriTex.height);
   }
        

   //读取数组
   public static readPixelsForTexture(tex: any):Uint8Array {
       const gfxTexture = tex.getGFXTexture();
       if (!gfxTexture) {
           return null;
       }

       //数组长度
       const needSize = 4 * tex.width * tex.height;
       let buffer = new Uint8Array(needSize);
       const gfxDevice = tex._getGFXDevice();
       const bufferViews: ArrayBufferView[] = [];
       const regions: gfx.BufferTextureCopy[] = [];
       const region0 = new gfx.BufferTextureCopy();
       
       //数组设置起始和宽高
       region0.texOffset.x = 0;
       region0.texOffset.y = 0;
       region0.texExtent.width = tex.width;
       region0.texExtent.height =tex.height;

       //copy数据
       regions.push(region0);
       bufferViews.push(buffer);
       gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, regions);
       return buffer;
   }

    
}