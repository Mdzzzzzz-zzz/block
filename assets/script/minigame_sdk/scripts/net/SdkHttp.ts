import { sys } from "cc";
import { SdkSingleton } from "../common/SdkSingleton";
import { HttpBase } from "./HttpBase";

export class SdkHttp extends SdkSingleton{
    
    protected http:HttpBase;

    public Init() {
        

    }
    public UnInit() {

    }

}