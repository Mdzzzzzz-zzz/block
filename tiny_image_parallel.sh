#!/bin/bash
###
# @Date: 2023-08-14 16:56:37
 # @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 # @LastEditTime: 2024-09-21 11:52:26
###

# 获取命令行中的第一个参数
if [ -n "$1" ]; then
  folder_path="$1"
else
  folder_path="./build/wechatgame"
fi

if [ -n "$2" ]; then
  folder_path2="$2"
else
  folder_path2="./build/bytedance-mini-game"
fi

# 定义tinypng命令路径
tinypng_command="tinypng"

if [ -n "$2" ]; then
  tinypng_command="$2"
else
  tinypng_command="tinypng"
fi

# 导出环境变量，供parallel使用
export folder_path
export tinypng_command

# 定义并行执行函数
process_image() {
  file="$1"
  echo "Processing file: $file"

  # 执行tinypng命令
  "$tinypng_command" "$file"
}

# 设置并行执行的最大线程数
parallel_max_jobs=10

# 遍历文件夹内的所有png和jpg文件，并使用parallel并行执行
find "$folder_path" \( -name "*.png" -o -name "*.jpg" \) -type f -print0 |
  xargs -0 -P "$parallel_max_jobs" -I {} sh -c "$tinypng_command {}"

# find "$folder_path2" \( -name "*.png" -o -name "*.jpg" \) -type f -print0 |
#   xargs -0 -P "$parallel_max_jobs" -I {} sh -c "$tinypng_command {}"

echo "tiny image finish"

python3 ./replaceSubPath.py 
