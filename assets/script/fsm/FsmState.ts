export namespace Fsm {

    interface IFsmState {

        readonly name: string;

        onEnter(): void;

        // onUpdate (): void;

        onExit(): void;

        changeState(type: _IFsmState): void;
    }

    export class FsmState implements IFsmState {

        readonly name: string;

        readonly Data = new Map();

        constructor(_name: string) {
            this.name = _name;
        }

        changeState(type: _IFsmState): void {
            FsmManager.inst.changeState(type);
        }

        onEnter(): void {
            // console.log("进入状态 " + this.name);
        }

        onExit(): void {
            // console.log("退出状态 " + this.name);
        }

        // onUpdate (): void {
        //     // console.log("更新状态 " + this.name);
        // }
    }

    class F1 extends FsmState {
        constructor() {
            super("F1");
        }
    }

    class F2 extends FsmState {
        constructor() {
            super("F2");
        }
    }

    class F3 extends FsmState {
        constructor() {
            super("F3");
        }
    }

    interface IFsmManager {

        currentState: IFsmState;

        changeState(type: _IFsmState);

        getState(type: _IFsmState): _IFsmState;

        setData(type: _IFsmState, key: string, data: any): void;

        getData(type: _IFsmState, key: string): any;

        // onUpdate (): void;
    }

    type _IFsmState<T = IFsmState> = new (...args: any[]) => T;

    export class FsmManager implements IFsmManager {

        public static inst = new FsmManager();

        currentState: IFsmState;
        private states: Map<string, IFsmState> = new Map<string, IFsmState>();

        getState(type: _IFsmState): any {
            let state: IFsmState = this.states.get(type.toString());
            if (state == null) {
                state = new type();
                this.states.set(type.toString(), state);
            }
            return state;
        }

        // onUpdate (): void {
        //     this.currentState?.onUpdate();
        // }

        changeState(type: _IFsmState, args?: any) {
            let st: IFsmState = this.getState(type);
            this.currentState?.onExit();
            this.currentState = st;
            this.setData(type, "defaultKey", args);
            this.currentState?.onEnter();
        }

        public test() {
            this.changeState(F1);
            this.setData(F2, "key1", "你好");
            setTimeout(() => {
                this.changeState(F2);
                console.log("数据是 " + this.getData(F2, "key1"));
            }, 10000);
        }

        setData(type: _IFsmState, key: string, data: any) {
            this.getState(type).Data.set(key, data);
        }

        getData(type: _IFsmState, key: string) {
            return this.getState(type).Data.get(key);
        }
    }
}