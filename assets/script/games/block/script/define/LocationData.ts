import {Vec2, Vec3, FloatArray} from "cc";

export var DiamondDisplayLoc = [
    new Array<Vec3>(new Vec3(0, 32, 0)), 
    new Array<Vec3>(new Vec3(-67, 32, 0), new Vec3(67, 32, 0)), 
    new Array<Vec3>(new Vec3(-120, 32, 0), new Vec3(0, 115, 0), new Vec3(120, 32, 0)), 
    new Array<Vec3>(new Vec3(-120, 32, 0), new Vec3(120 ,32 ,0), new Vec3(-67, -84 ,0), new Vec3(67, -84, 0)), 
    new Array<Vec3>(new Vec3(0, 115, 0), new Vec3(-120, 32, 0), new Vec3(120 ,32 ,0), new Vec3(-67, -84 ,0), new Vec3(67, -84, 0))
]