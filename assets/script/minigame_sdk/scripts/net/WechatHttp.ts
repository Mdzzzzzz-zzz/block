/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-12 15:50:02
 */
import { emSdkErrorCode } from "../SdkError";
import { HttpBase, emContentType } from "./HttpBase";

export class WechatHttp extends HttpBase {
    public post(url: string, data: Record<string, any>, contentType?: emContentType): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let requestInit = this.getPostRequestInit(url, data, contentType);
            this.platform.request({
                url: url,
                header: {
                    'content-type': requestInit.contentType
                },
                data: requestInit.body,
                method: 'POST',
                dataType: 'json',
                success: (res) => {
                    resolve(res);
                },
                fail: (res) => {
                    let tips = `url:${url} data: ${data} contentType:${contentType}`
                    this.logger.error("http post error:", tips);
                    reject({ errMsg: emSdkErrorCode.Net_Post_Req_Error, errData: res });
                }
            });
        });
    }
    public get(url: string, params?: Record<string, string>): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let data = params||{};
            this.platform.request({
                url: url,
                data:data,
                method: "GET",
                success: (res) => {
                    resolve(res.data);
                },
                fail: (res) => {
                    let tips = `url:${url} data: ${params}`
                    this.logger.error("http get error:", tips);
                    reject({ errMsg: emSdkErrorCode.Net_Get_Req_Error, errData: res });
                }
            })
        });
    }
}