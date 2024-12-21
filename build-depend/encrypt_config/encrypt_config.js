/*
 * 对 assets/resources/config 目录下的配置文件进行加密打包
 */

const AES_KEY = 'tIUHSA1cDlMQpPT5dQM0BQ3srNBbriekKUlBrFCLpKCp6y0h8TEXjQpGsyn+hVo9';

const CryptoJS = require('./crypto');
const path = require("path");
const fs = require("fs");

// Parse arguments
var i = 2;
while ( i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
	    case '--path' :
	    case '-p' :
	        work(process.argv[i+1]);
	    default :
	        i++;
	        break;
    }
}

function aesEncrypt (key, str) {
    return CryptoJS.AES.encrypt(str, key).toString();
}

function aesDecrypt (key, str) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
}

function work (path) {
	console.log("encrypt work ~ ", path);
	fs.readdir(path, (err, files) => {
		let jsonFiles = files.filter((file) => {
			let stat = fs.statSync(`${path}/${file}`);
			return !file.endsWith('.meta') && !stat.isDirectory();
		});

		jsonFiles.forEach((file) => {
			let fileName = `${path}${file}`;
			let str = fs.readFileSync(fileName).toString();
			let obj = {
				'config': aesEncrypt(AES_KEY, str)
			};

			fs.writeFileSync(fileName, JSON.stringify(obj));
		});

		// 目录的话，递归调用
		let dirs = files.filter((file) => {
			let stat = fs.statSync(`${path}/${file}`);
			return stat.isDirectory();
		});

		dirs.forEach((dir) => {
			work(`${path}/${dir}/`);
		});
	});
}
