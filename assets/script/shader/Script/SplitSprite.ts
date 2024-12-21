import { CCInteger, dynamicAtlasManager, IAssembler, Sprite, Vec2, _decorator } from "cc";
const { ccclass, property } = _decorator

@ccclass("SplitSprite")
export class SplitSprite extends Sprite {

    @property(CCInteger)
    col_index : number = 0;

    @property(CCInteger)
    row_index : number = 0;

    @property(CCInteger)
    col_count : number = 0;

    @property(CCInteger)
    row_count : number = 0;

    protected _flushAssembler () {
        const assembler = SpiltSpriteAssembler;

        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }

        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this._renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                if (this.spriteFrame) {
                    this._assembler.updateUVs(this);
                }
                this._updateColor();
            }
        }
    }
    
    /*
    update() {

    }*/
}

/**
 * 自定义组装器
 */
 export const SpiltSpriteAssembler: IAssembler = {
    createData (sprite: Sprite) {
        const renderData = sprite.requestRenderData();
        renderData.dataLength = 2;
        renderData.resize(4, 6);//顶点数,三角形顶点数
        return renderData;
    },

    updateRenderData (sprite: Sprite) {
        const frame = sprite.spriteFrame;
        this.updateUVs(sprite);
        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            this.updateUVs(sprite);// dirty need
            this.updateColor(sprite);// dirty need
            renderData.updateRenderData(sprite, frame);
        }
    },

    updateWorldVerts (sprite: Sprite, chunk: any) {
        const renderData = sprite.renderData!;
        //顶点长度9  1,2,3 屏幕位置坐标(x y z)    4,5 贴图位置坐标  6-9位 顶点颜色
        const vData = chunk.vb;

        const dataList: any[] = renderData.data;
        const node = sprite.node;

        const data0 = dataList[0];
        const data3 = dataList[1];
        const matrix = node.worldMatrix;
        const a = matrix.m00; const b = matrix.m01;
        const c = matrix.m04; const d = matrix.m05;

        const tx = matrix.m12; const ty = matrix.m13;
        const vl = data0.x; const vr = data3.x;
        const vb = data0.y; const vt = data3.y;


            
            const al = a * vl; const ar = a * vr;
            const bl = b * vl; const br = b * vr;
            const cb = c * vb; const ct = c * vt;
            const db = d * vb; const dt = d * vt;

            const cbtx = cb + tx;
            const cttx = ct + tx;
            const dbty = db + ty;
            const dtty = dt + ty;

            // left bottom
            vData[0] = al + cbtx;
            vData[1] = bl + dbty;
            // right bottom
            vData[9] = ar + cbtx;
            vData[10] = br + dbty;
            // left top
            vData[18] = al + cttx;
            vData[19] = bl + dtty;
            // right top
            vData[27] = ar + cttx;
            vData[28] = br + dtty;
        
    },

    fillBuffers (sprite: Sprite, renderer: any) {
        if (sprite === null) {
            return;
        }
        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        if (sprite.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(sprite, chunk);
            renderData.vertDirty = false;
        }

        // quick version
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(bid);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);
        let indexOffset = meshBuffer.indexOffset;
        ib[indexOffset++] = vid;
        ib[indexOffset++] = vid + 1;
        ib[indexOffset++] = vid + 2;
        ib[indexOffset++] = vid + 2;
        ib[indexOffset++] = vid + 1;
        ib[indexOffset++] = vid + 3;
        meshBuffer.indexOffset += 6;

        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    },

    updateVertexData (sprite: Sprite) {
        const renderData: any | null = sprite.renderData;
        if (!renderData) {
            return;
        }
        renderData.vertexFormat
        const uiTrans = sprite.node._uiProps.uiTransformComp!;
        const dataList: any[] = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        let l = 0;
        let b = 0;
        let r = 0;
        let t = 0;
        if (sprite.trim) {
            l = -appX;
            b = -appY;
            r = cw - appX;
            t = ch - appY;
        } else {
            const frame = sprite.spriteFrame!;
            const originSize = frame.getOriginalSize();
            const rect = frame.getRect();
            const ow = originSize.width;
            const oh = originSize.height;
            const rw = rect.width;
            const rh = rect.height;
            const offset = frame.getOffset();
            const scaleX = cw / ow;
            const scaleY = ch / oh;
            const trimLeft = offset.x + (ow - rw) / 2;
            const trimRight = offset.x - (ow - rw) / 2;
            const trimBottom = offset.y + (oh - rh) / 2;
            const trimTop = offset.y - (oh - rh) / 2;
            l = trimLeft * scaleX - appX;
            b = trimBottom * scaleY - appY;
            r = cw + trimRight * scaleX - appX;
            t = ch + trimTop * scaleY - appY;
        }

        dataList[0].x = l;
        dataList[0].y = b;

        dataList[1].x = r;
        dataList[1].y = t;

        renderData.vertDirty = true;
    },

    updateUVs (sprite: SplitSprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;

        let col_ratio = 1.0/sprite.col_count;
        let row_ratio = 1.0/sprite.row_count;

        //左上角
        vData[3] = sprite.col_index * col_ratio;
        vData[4] = (sprite.row_index + 1) * row_ratio;
        //右上角
        vData[12] = (sprite.col_index + 1) * col_ratio;
        vData[13] = (sprite.row_index + 1) * row_ratio;
        //左下角
        vData[21] = sprite.col_index * col_ratio;
        vData[22] = sprite.row_index * row_ratio;
        //右下角
        vData[30] = (sprite.col_index + 1) * col_ratio
        vData[31] = sprite.row_index * row_ratio;
    },

    updateColor (sprite: Sprite) {
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },
};
