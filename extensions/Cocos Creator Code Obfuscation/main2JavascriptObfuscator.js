/*
 * @FilePath: main2JavascriptObfuscator.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-24 19:35:16
 * @LastEditors: fileheader
 * @LastEditTime: 2023-10-14 00:51:24
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
const JavascriptObfuscator = require('javascript-obfuscator');
var JsConfuser = require("js-confuser");
const md5 = require('md5');
var parse = require('esprima').parse;
var toString = require('escodegen').generate;
var confusion = require('confusion');
var Fs = require('fs');
var rqpathGet= require('path');
const JavascriptObfuscatorClass = {
  /**
   * 随机乱序排序算法, 可以传数组或者字符串
  */
  ast_shuffleCardArr(arr) {
      // console.log("ast_shuffleCardArr 开始", arr);
      // var len = arr.length;
      // for (var astInd = 0; astInd < len - 1; astInd++) {
      //     var index = parseInt(Math.random() * (len - astInd));
      //     var temp = arr[index];
      //     arr[index] = arr[len - astInd - 1];
      //     arr[len - astInd - 1] = temp;
      // };
      // console.log("ast_shuffleCardArr 结束", arr);
      // return arr;


      // typeof []
      // 'object'
      // typeof ""
      // 'string'
      var getPostArr = arr;
      var getLen = getPostArr.length;
      if (typeof arr == 'object') {
          getPostArr = arr;
          getLen = getPostArr.length;
          for (var astInd = 0; astInd < getLen - 1; astInd++) {
              var index = parseInt(Math.random() * (getLen - astInd));
              var temp = getPostArr[index];
              getPostArr[index] = getPostArr[getLen - astInd - 1];
              getPostArr[getLen - astInd - 1] = temp;
          };
          return getPostArr;
      } else {
          getPostArr = arr.split("");
          getLen = getPostArr.length;
          for (var astInd = 0; astInd < getLen - 1; astInd++) {
              var index = parseInt(Math.random() * (getLen - astInd));
              var temp = getPostArr[index];
              getPostArr[index] = getPostArr[getLen - astInd - 1];
              getPostArr[getLen - astInd - 1] = temp;
          };
          return getPostArr.join("");
      };
  },
  /**
   * AST 获取混沌名称 [MAIN-2] 1.1
   * @postVal 加密的值
   * @getLength 要获取的长度值
  */
  ast_md5_func(postVal, getLength) {
      // 加入奇门遁甲混沌钟计时器
      var encodeKey = postVal || "CocosCreator" + "_AST_抽象语法树_";
      var zhexue_num = new Date().getTime() + Math.random() * 142857 + 1024 + Math.random() * 129600 + 540 * 2;
      var getThis = this;
      // 乱序
      var mixSortOrderStr = getThis.ast_shuffleCardArr(encodeKey + "" + zhexue_num);
      // console.log("mixSortOrderStr=>", mixSortOrderStr);
      // 获取乱序的 MD5 的值-> "ca7c2a15f35de48b44c5711900d2e5bd".length==32
      // this.ast_md5_val = md5(mixSortOrderStr);
      this.ast_md5_val = this.ast_getMd5_length(md5(mixSortOrderStr), 12);
      this.ast_md5_val = this.createVariableName(getThis.ast_md5_val) || this.ast_getMd5_length(md5(mixSortOrderStr), 8);
      // var getLength_get = getLength || 8;
      // this.ast_md5_val = "_c" + this.ast_getMd5_length(md5(mixSortOrderStr), getLength_get);

      // console.log("this.ast_md5_val=>", this.ast_md5_val);

      // this.ast_md5_val = encodeKey + md5(zhexue_num);
      // var getBeforeMd5 = this.ast_md5_val;
      // console.log("this.ast_md5_val [乱序前]=", getBeforeMd5);
      // console.log(this.ast_shuffleCardArr("获取到的 this.ast 的值") + "_md5=", this.ast_md5_val);
      // console.log("this.ast_md5_val [乱序后]=", this.ast_shuffleCardArr("" + this.ast_md5_val));

      return this.ast_md5_val;
  },
  /**
   * 获取 md5 的 32 位值里面的指定位数, 每次获取的都是再次乱序的 md5 的值, 保证不唯一
  */
  ast_getMd5_length(md5_32_val, getLength) {
      if (getLength < md5_32_val.length) {
          return md5_32_val.slice(0, getLength);
      } else {
          return md5_32_val;
      };
  },

  /**
   * 创作一个随机名称, 这个仅供参考
   * @param {*} variableNames 
   * @returns 随机名称
   */
  createVariableName(variableNames) {
      var name = '_cc' || '_x'; do { name += (Math.random() * 0xffff) | 0; } while (variableNames.indexOf(name) !== -1);
      return name;
  },
  /**
   * 混淆传入的代码内容并返回值
   * @param {*} sourceCode 源码
   * @param {*} options 混淆参数
   */
  JavascriptObfuscatorFunc(sourceCode, options) {
    return JavascriptObfuscator.obfuscate(sourceCode, options);
  },
  /**
   * AST 形式的混淆逻辑
   * @param {*} sourceCode 
   * @param {*} outNewFilePath 
   */
  jsconfuserObfuscatorFunc(sourceCode, outNewFilePath) {
    // console.log("[CC]", "[👍] [AST] 抽象语法树-JsConfuser-处理中=>\n", typeof sourceCode, sourceCode.length);
    var js_ast = parse(sourceCode);
    var getThis=this;
    var counter = Math.floor(Math.random()*142857)+2857;
    var startTime = new Date().getTime();
    var obfuscated = confusion.transformAst(js_ast, (variableNames) => {
      return getThis.ast_md5_func("Cocos抽象语法树加密ast_md5_func", 8); 
    });
    var confusEndString = toString(obfuscated);
    JsConfuser.obfuscate(confusEndString, {
      target: "node",
      calculator: true,
      compact: true,
      hexadecimalNumbers: true,
      deadCode: 0.1,
      dispatcher: 0.2,
      stringConcealing: true,
      // stringEncoding: false, // <- Normally enabled
      renameVariables: true,
      identifierGenerator: function () {
        return "_" + (counter += Math.floor(Math.random() * 64)) + "C" + Math.random().toString(36).substring(7);
      },
    }).then(obfuscated => {
      // console.log("[CC]", "[👍] [AST] 抽象语法树-JsConfuser-混淆完成=>\n", typeof obfuscated, obfuscated.length);
      // let getHunXiaoFile_0 = "index" || "game.js";
      // let getHunXiaoFile_1 = SourceCodePath.split(getHunXiaoFile_0)[1];
      var EndTime = new Date().getTime();
      var usingTime = EndTime - startTime;
      usingTime = (usingTime / 1000).toFixed(2);
      // console.log("[CC]", "[👍][" + usingTime + "s] [AST] 抽象语法树 => 混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n AST 混淆的 JS 文件路径为 => \n" + SourceCodePath);
      // console.log("[CC]", "[👍][" + usingTime + "s] [AST] 抽象语法树 => 混淆完成, 已写入文件\n AST 混淆的 JS 文件路径为 => \n" + outNewFilePath);
      console.log(`[CC][${usingTime} s][⭐][JS][AST][👍][✅][${rqpathGet.basename(outNewFilePath)}] 抽象语法树 => 混淆完成, 已写入文件\n`, outNewFilePath); 
      if (Fs.existsSync(outNewFilePath)) {
        //   Fs.writeFileSync(outNewFilePath, JSON.stringify(obfuscatedCode, null, 2));
        // // 加密下字符串内容, 放在 main.js de  js-ob 前面吧,  不太兼容 // var ENCODE_string_obfuscated = getThis.replace_encode_string(obfuscated, 311527);

        var ENCODE_string_obfuscated = obfuscated;
        Fs.writeFileSync(outNewFilePath, ENCODE_string_obfuscated, 'utf8');
        // console.log("[SourceCodePath] 保存路径=>\n", SourceCodePath, typeof obfuscated, obfuscated.length);
      };
      // console.log("[SourceCodePath] 保存路径=>\n", SourceCodePath, typeof obfuscated, obfuscated.length);
    });
  },
};

// 发布给其它脚本使用
module.exports = JavascriptObfuscatorClass;