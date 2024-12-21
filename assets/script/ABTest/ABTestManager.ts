import { Singleton } from "../Singleton";
import { ABTestParam } from "./ABTestDefine";
export class ABTestManager extends Singleton {
    group: { [key: string]: number };
    public Init() {
        this.group = {};
    }
    public UnInit() {
        this.group = {};
    }

    public getGroup(testParam: string): number {
        if (!this.group) {
            return 0;
        }

        return this.group[testParam] || 0;
    }
    public setGroup(testParam: string, val: number) {
        if (!this.group) {
            this.group = {};
        }
        this.group[testParam] = val;
        return this;
    }
}
