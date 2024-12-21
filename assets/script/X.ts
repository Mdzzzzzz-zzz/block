import { Scene } from "cc";
import { Node } from "cc";
import { director } from "cc";

module X
{
	/** 控制台颜色值 */
	export type ConsoleColor = "red" | "green" | "blue" | "orange" | "violet";

	/** 获取任意内容的文本信息 */
	function getString(args: any[]): string
	{
		var ret: string = "";
		var ary: string[] = [];
		if (args !== null && args !== undefined)
		{
			for (var i: number = 0; i < args.length; i++)
			{
				var a: any = args[i];
				if (a === null) ary.push("NULL");
				else if (a === undefined) ary.push("UNDEFINED");
				else ary.push(a.toString());
			}
		}
		ret = ary.join(" ");
		return ret;
	}

	/** 执行控制台指令 */
	function executeConsole(api: string, args: any[]): void
	{
		var handler: Function = console[api];
		if (!handler) return;

		if (XEnv.DEBUG_ADVANCED)
		{
			handler.apply(null, args);
		}
		else
		{
			handler.call(null, getString(args));
		}
	}

	/**
	 * 输出普通日志
	 * @param args 内容
	 */
	export function log(...args: any[]): void
	{
		if (!XEnv.DEBUG) return;

		executeConsole("log", args);
	}

	/**
	 * 输出信息日志
	 * @param args 内容
	 */
	export function info(...args: any[]): void
	{
		if (!XEnv.DEBUG) return;

		executeConsole("info", args);
	}

	/**
	 * 输出警告日志
	 * @param args 内容
	 */
	export function warn(...args: any[]): void
	{
		if (!XEnv.DEBUG) return;

		executeConsole("warn", args);
	}

	/**
	 * 输出借误日志
	 * @param args 内容
	 */
	export function error(...args: any[]): void
	{
		if (!XEnv.DEBUG) return;

		executeConsole("error", args);
	}

	/**
	 * 按照指定的颜色输出日志
	 * @param color {ConsoleColor} 按照
	 * @param args 任意内容
	 */
	export function color(color: ConsoleColor, ...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		var msg: string = getString(args);
		console.log("%c" + msg, "color:" + color);
	}

	/** 开始一段可展开和收起的日志项(展开状态) */
	export function group(...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		console.group.apply(null, args);

	}

	/** 开始一段可展开和收起的日志项(收起状态) */
	export function groupCollapsed(...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;
		console.groupCollapsed.apply(null, args);
	}

	/** 结束一段可展开和收起的日志项 */
	export function groupEnd(): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		console.groupEnd();
	}

	/** 表格形式输出数据 */
	export function table(...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		console.table.apply(null, args);
	}

	/** 计时开始 */
	export function time(...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		console.time.apply(null, args);
	}

	/** 计时结束 */
	export function timeEnd(...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		console.timeEnd.apply(null, args);
	}

	/** 输出堆栈调用 */
	export function trace(...args: any[]): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		console.trace.apply(null, args);
	}

	/** 输出节点树形结构 */
	export function treeNodes(target?: Node, collapsed: boolean = false): void
	{
		if (!XEnv.DEBUG_ADVANCED) return;

		if (!target) target = director.getScene();
		if (!target) return;

		//收起状态
		if(collapsed)
		{
			groupCollapsed(target);
		}
		else
		{
			group(target);
		}

		for (var i: number = 0; i < target.children.length; i++)
		{
			var child: Node = target.children[i];

			treeNodes(child, collapsed);
		}

		groupEnd();
	}

	/** 全局搜索一个指定名称的节点 */
	export function findNodeByName(name:string):Node
	{
		var findHandler:Function = function(n:Node|Scene, name:string):Node
		{
			if(n.name === name) return n;

			for(var i:number = 0; i < n.children.length; i++)
			{
				var c:Node = n.children[i];
				var r:Node = findHandler(c, name);
				if(r) return r;
			}

			return null;
		}

		return findHandler(director.getScene(), name);
    }
	export function clearCacheData(){
		localStorage.clear();
	}
    export class XEnv{
        public static DEBUG_ADVANCED:boolean = true;
        public static DEBUG:boolean = true;
    }
	export function OpenLevelFinishedAll(){
		// let cfg = AssetInfoDefine.prefab.adventureFinishAll;
        //     PanelManager.inst.addPopUpView(cfg.path, LevelGame.levlInstance);
	}

}
window["X"] = X;

