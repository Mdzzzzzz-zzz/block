import { SdkBase } from "../SdkBase";
import { emSdkErrorCode } from "../SdkError";

export enum emContentType {
    JSON,
    FORM_URLENCODED,
    MULTIPART_FORM_DATA,
    TEXT_PLAIN
}
export class HttpBase extends SdkBase {
    public test() {
        // const postData = async () => {
        //     const result = await this.post('https://jsonplaceholder.typicode.com/posts', {
        //         title: 'test post',
        //         body: 'bar',
        //         userId: 1,
        //     }, emContentType.TEXT_PLAIN);
        //     console.log("post:", result);
        // };
        // postData();

        // const getData = async () => {
        //     const result = await this.get('https://jsonplaceholder.typicode.com/todos/1');
        //     console.log(result);
        // };
        // getData(); // 输出：{"userId":1,"id":1,"title":"delectus aut autem","completed":false}
    }
    protected getPostRequestInit(url: string, data: Record<string, any>, contentType?: emContentType) {
        let body: any;
        let contentTypeStr: string = 'application/x-www-form-urlencoded';
        if (contentType === emContentType.JSON) {
            contentTypeStr = 'application/json';
            body = data;
            // body = JSON.stringify(data);
        } else if (contentType === emContentType.FORM_URLENCODED) {
            contentTypeStr = 'application/x-www-form-urlencoded';
            body = new URLSearchParams(data).toString();
        } else if (contentType === emContentType.MULTIPART_FORM_DATA) {
            contentTypeStr = 'multipart/form-data';
            const formData = new FormData();
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    formData.append(key, data[key]);
                }
            }
            body = formData;
        } else if (contentType === emContentType.TEXT_PLAIN) {
            contentTypeStr = 'text/plain';
            body = data;
        }
        return {
            contentType: contentTypeStr,
            body: body,
        };
    }
    public post(url: string, data: Record<string, any>, contentType?: emContentType): Promise<any> {
        return new Promise((resolve, reject) => {
            let requestData = this.getPostRequestInit(url, data, contentType);
            let headers: Headers = new Headers();
            headers.set("Content-Type", requestData.contentType);
            let requestInit: RequestInit = {
                body: requestData.body,
                method: 'POST',
                headers: headers
            }
            fetch(url, requestInit).then((response) => {
                response.json().then(resolve).catch((err) => {
                    reject({ errMsg: emSdkErrorCode.Net_Post_Res_Error, errData: err });
                });
            }).catch((err) => {
                reject({ errMsg: emSdkErrorCode.Net_Get_Req_Error, errData: err.message });
            });
        });
    }
    public get(url: string, params?: Record<string, string>): Promise<any> {
        return new Promise((resove, reject) => {
            let requestUrl = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
            fetch(requestUrl).then((response) => {
                response.json().then(resove).catch((err) => {
                    reject({ errMsg: emSdkErrorCode.Net_Post_Res_Error, errData: err });
                });
            }).catch((err) => {
                reject({ errMsg: emSdkErrorCode.Net_Get_Req_Error, errData: err.message });
            });
        });
    }
}