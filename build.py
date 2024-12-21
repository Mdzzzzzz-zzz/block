#!/usr/bin/python
#coding=utf-8
import os
from string import Template
import platform
import json

# build_args_array = []

# def load_json(file_name):
#     with open(file_name, "r") as f:
#         data = json.load(f)
#     return data

if __name__ == '__main__':
    # scriptRoot = os.path.split(os.path.realpath(__file__))[0]
    # os.chdir(scriptRoot)

    # config = load_json("config.json")

    # creator_app_path = config["creator_app_path"]
    # os.chdir(creator_app_path)
    # os.system("pwd")

    # project_path = config["project_path"]
    # platform = config["platform"]
    # build_path = config["buildPath"]
    # encryptJs = config["encryptJs"]
    # apiLevel = config["apiLevel"]
    # configPath = scriptRoot + "/build_config.json"
    project_path = '/Users/tuyoo_zzg/Documents/ibgame/cli_arc8'
    print("----------------------开始构建-------------")

    # build_args = "platform=" + platform + ";configPath=" + configPath + ";encryptJs=" + encryptJs

    os.system('/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --projectPath %s ' %(project_path))

    print("----------------------构建完成-------------")
