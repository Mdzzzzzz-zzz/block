# -*- coding: utf-8 -*-
from PIL import Image
import os

# 设置目标大小和裁剪的大小
TARGET_SIZE = (256, 147)
CROP_SIZE = (256, 128)

themes = ["cat","bear","sheep","fruit"]
folder_path = "/Users/tuyoo_zzg/Documents/ibgame/cli_arc8/assets/bundle/level/"
save_path ="/Users/tuyoo_zzg/Documents/ibgame/cli_arc8/art/theme/"
for theme in themes:
    # 遍历文件夹里的所有图片文件
    theme_folder_path = os.path.join(folder_path,theme)
    theme_save_path = os.path.join(save_path,theme)
    if not os.path.exists(theme_save_path):
        os.makedirs(theme_save_path)
    for filename in os.listdir(theme_folder_path):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            # 打开图片并调整大小
            filePath = os.path.join(theme_folder_path, filename)
            print(filePath)
            image = Image.open(filePath)
            image.thumbnail(TARGET_SIZE, Image.ANTIALIAS)
            
            # 裁剪图片中心部分
            width, height = image.size
            left = (width - CROP_SIZE[0]) / 2
            top = (height - CROP_SIZE[1]) / 2
            right = left + CROP_SIZE[0]
            bottom = top + CROP_SIZE[1]
            image = image.crop((left, top, right, bottom))
            
            # 保存图片
            image.save(os.path.join(theme_save_path, filename))