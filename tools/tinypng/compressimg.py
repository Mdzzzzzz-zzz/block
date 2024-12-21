#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import os,sys
import json

def getConfig():
    data = open(sys.path[0]+'/config.json','r')
    config = json.load(data)
    return config
def isTinypng(no_list, file_path):
    is_tiny = True
    for name in no_list:
        if file_path.find(name) != -1: 
            is_tiny = False
            print('forbidden tinypng ', file_path)
            break
    return is_tiny
def run(enc):
    print('run' + sys.path[0])
    config = getConfig()
    current_path = sys.path[0]
    #pngquant所在目录
    shell_path = current_path + '/pngquant'
    xxtea_path = current_path + '/../../tools/encres/xxtea'
    print(shell_path)
    #需要压缩的资源所在目录
    res_path = current_path + '/../../build/wechatgame'
    print(res_path)
    #获取权限
    os.popen('chmod 777 ' + shell_path)
    #命令
    q_min = config['quality_min']
    q_max = config['quality_max']
    #cmd = 'find ' + res_path + ' -name "*.png" | xargs -L1 -t |  '+ shell_path +' --ext .png --force 256 --speed 1 --quality=' + q_min + '-' + q_max
    cmd = 'find ' + res_path + ' -name "*.png" -o -name "*.jpg"'
    print cmd
    #执行
    process = os.popen(cmd)
    file_str = process.read()
    file_list = file_str.split("\n")
    for path in file_list:
        if path != '' and isTinypng(config['no_tinypng'],path):
            #print(path)
            cmd = shell_path + ' --ext .png --force 256 --speed 1 --quality=' + q_min + '-' + q_max + ' ' + path
            os.system(cmd)
            print(cmd)
        if enc and path != '':
            cmd = xxtea_path + ' ' + path + ' ' + path
            os.system(cmd)
            print('ZZZ'+cmd)

if __name__ == '__main__':
    if len(sys.argv)==2 and sys.argv[1]=='encode':
        run(True)
    else:
        run(False)


