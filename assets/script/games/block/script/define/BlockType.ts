/*
 * @Date: 2023-06-13 15:03:35
 * @LastEditors: lzb 2589358976@qq.com
 * @LastEditTime: 2023-09-27 17:39:44
 */
export interface IBlockType {
	id: number;
	block: Array<number[]>;
	simple: Array<number[]>;
	count: number;
	// offset: number[];
	// ani: IBlockAni;
	// border: { [key: string]: number[] };
}

export interface IBlockAni {
	name: string;
	offset: number[];
	angle: number;
	scale: number[];
}

export interface IBlockScoreWeight {
	id: number;
	score: number;
	first: number[];
	second: number[];
	third: number[];
	replace: number;
	remedy: number;
	except: number[];
}
export interface IBlockGenWeight { index: number; weight: number; genRound?: number; cdRound?: number, roundWeight?: number }
export const EasyBlocks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const MediumBlocks = [
	12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
];
export const HardBlocks = [33, 34, 35, 36, 37, 38];
export const HardExBlocks = [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54];
export const BigBlocks = [39, 40, 41];
export const BarBlocks = [6, 7, 14, 15, 33, 34];
export const SimpleBlocks = [14, 15, 16, 33, 34, 39, 40, 41];
export const ReviviBlocks = [16, 15, 14, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
export const RoundCdBlocks = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54];
export var BlockConst = window["BlockConst"];
export var BlockItemConst = {
	"1001": {
		"id": 1001,
		"block": [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 1001, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		"simple": [
			[1001]
		],
		"count": 1,
		"scale": 0.8
	},
	"1002": {
		"id": 1002,
		"block": [
			[0, 0, 0, 0, 0],
			[0, 0, 1001, 0, 0],
			[0, 1001, 1001, 1001, 0],
			[0, 0, 1001, 0, 0],
			[0, 0, 0, 0, 0]
		],
		"simple": [
			[0, 1001, 0],
			[1001, 1001, 1001],
			[0, 1001, 0]
		],
		"count": 4,
		"scale": 0.5
	},
	"1003": {
		"id": 1003,
		"block": [
			[0, 0, 0, 0, 0],
			[0, 1001, 1001, 1001, 0],
			[0, 1001, 1001, 1001, 0],
			[0, 1001, 1001, 1001, 0],
			[0, 0, 0, 0, 0]
		],
		"simple": [
			[1001, 1001, 1001],
			[1001, 1001, 1001],
			[1001, 1001, 1001]
		],
		"count": 9,
		"scale": 0.5
	},
	"1101": {
		"id": 1101,
		"block": [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 1101, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		"simple": [
			[1101]
		],
		"count": 1,
		"scale": 0.8
	},
	"1102": {
		"id": 1102,
		"block": [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 1102, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		],
		"simple": [
			[1102]
		],
		"count": 1,
		"scale": 0.8
	},
}
// const win = window as any;
