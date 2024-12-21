import { error, log } from "../util/MKLog";


interface HttpCallback{
    (code : number, res?: any):void;
}
const HttpStatus = {
    Success : 0,
    Error:1,
    TimeOut:2,
}
interface HttpRequest{
    url: string,
    param: any,
    callback: HttpCallback,
}

export class MKHttp {
    public static post(request: HttpRequest,timeOut:number=3) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                const response = xhr.responseText;
                log(response);
                const responseObj = JSON.parse(response)
                request.callback(HttpStatus.Success,responseObj);
            }
        }
        xhr.onerror = (ev)=>{
            request.callback(HttpStatus.Error,{});
            error(ev);
        }

        xhr.ontimeout = (ev)=>{
            request.callback(HttpStatus.TimeOut,{});
            error(ev);
        }
    
        xhr.open("POST", request.url, true);
        xhr.setRequestHeader ('Content-type', 'application/json');
        xhr.timeout = timeOut * 1000;
        let data = JSON.stringify(request.param);
        log(request.url);
        log(data);
        xhr.send(data);
    }

    public static get(request: HttpRequest,timeOut:number=3) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ()=>{
            if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                const response = xhr.responseText;
                log(response);
                const responseObj = JSON.parse(response)
                request.callback(HttpStatus.Success,responseObj);
            }
        }
        xhr.onerror = (ev)=>{
            request.callback(HttpStatus.Error);
            error(ev);
        }

        xhr.ontimeout = (ev)=>{
            request.callback(HttpStatus.TimeOut);
            error(ev);
        }

        log(request.url);
        xhr.open("GET", request.url, true);
        xhr.setRequestHeader ('Content-type', 'application/json');
        xhr.timeout = timeOut * 1000;
        xhr.send();
    }

}