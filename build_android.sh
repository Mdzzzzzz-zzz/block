#!/bin/sh
###
# @Date: 2023-08-03 14:19:13
 # @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 # @LastEditTime: 2024-04-02 22:18:16
###
CocosCreatorPath=/Applications/CocosCreator/Creator/3.7.2/CocosCreator.app/Contents/MacOS/CocosCreator
projectPath=$(
    cd $(dirname $0)
    pwd
)
# 版本名称  1.0.0
versionName='1.0.0'
# 资源版本号
versionCode='1'
# 打包模式
buildCoco=true
release=false
tinypng=true
debug=false

while [[ $# -gt 0 ]]; do
    case "$1" in
    --versionName)
        versionName="$2"
        echo "$1 $2"
        shift 2
        ;;
    --versionCode)
        versionCode="$2"
        echo "$1 $2"
        shift 2
        ;;
    --buildCoco)
        buildCoco="$2"
        echo "$1 $2"
        shift 2
        ;;
    --tinypng)
        tinypng="$2"
        echo "$1 $2"
        shift 2
        ;;
    --release)
        release="$2"
        echo "$1 $2"
        shift 2
        ;;
    *)
        echo "Error: Invalid option $1 $2"
        exit 1
        ;;
    esac
done
buildTargetPath=""
buildNativePath=${projectPath}/native/engine/android
appGradlePath=${buildNativePath}/app/gradle.properties

if [ $release == true ]; then
    configPath=${projectPath}/build-depend/buildConfig_android.json
    buildTargetPath=${projectPath}/build/android
else
    configPath=${projectPath}/build-depend/buildConfig_android_debug.json
    buildTargetPath=${projectPath}/build/android-debug
fi

sed -i '' "s/versionCode=.*/VERSION_NAME=${versionName}/g" ${appGradlePath}
sed -i '' "s/VERSION_CODE=.*/VERSION_CODE=${versionCode}/g" ${appGradlePath}

echo 'build config - project path: ' ${projectPath}
echo 'build config - target path: ' ${buildTargetPath}

# 执行构建任务
if [ $buildCoco == true ]; then
    $CocosCreatorPath --project ${projectPath} --build "configPath=${configPath}"
fi

# 压缩图片
if [ $tinypng == true ]; then
    echo "tiny png start"
    # 导出环境变量，供parallel使用
    # 定义需要遍历的文件夹路径
    build_folder_path="$buildTargetConfig"
    # 定义tinypng命令路径
    tinypng_command="tinypng"
    # 导出环境变量，供parallel使用
    export build_folder_path
    export tinypng_command
    # 定义并行执行函数
    process_image() {
        file="$1"
        echo "Processing file: $file"
        # 执行tinypng命令
        tinypng $file $file
    }
    # 设置并行执行的最大线程数
    parallel_max_jobs=4
    # 遍历文件夹内的所有png和jpg文件，并使用parallel并行执行
    find "$build_folder_path" \( -name "*.png" -o -name "*.jpg" \) -type f -print0 |
        # parallel -0 -j "$parallel_max_jobs" process_image
        xargs -0 -P "$parallel_max_jobs" -I {} sh -c "$tinypng_command {}"
    echo "tiny png finish"
fi
# 记录构建的次数
# 定义存储数字的文件路径
build_code_txt="$projectPath/build_code.txt"
build_code=0
# 检查文件是否存在
if [ -f "$build_code_txt" ]; then
    # 如果文件存在，则读取其中的数字，并对其进行 +1 操作
    build_code=$(cat "$build_code_txt")
    build_code=$((build_code + 1))

else
    # 如果文件不存在，则将初始值设置为 0
    build_code=0
fi
if [ "$build_code" -lt "$versionCode" ]; then
    build_code="$versionCode"
fi
echo "build code:$build_code"
echo $build_code >"$build_code_txt"
