
# -- 环境参数 start
CocosCreatorPath=/Applications/CocosCreator/Creator/3.5.2/CocosCreator.app/Contents/MacOS/CocosCreator

projectPath=$(cd `dirname $0`/../; pwd)

appGradlePath=${projectPath}/native/engine/android/app/gradle.properties

if [ -e ./output ]; then
  rm -rf ./output/
fi

# -- 环境参数 end

# -- 打包参数 start
 versionName=$1
 versionCode=$2

 release=$3 # 打包模式
 exportApp=$4 # 导出apk

 # 热更cdn地址
 hotUrl=$5
 hotVersionName=$6

#versionName="1.0.0"
#versionCode=1
#
#release=false # 打包模式
#exportApp=true # 导出apk
#
## 热更cdn地址
#hotUrl="https://121-block-cdn-aws.qijihdhk.com/block/"
#hotVersionName="1.0.0"

echo ${versionName} ${versionCode} ${release} ${exportApp} ${hotUrl} ${hotVersionName}

# -- 打包参数 end

# 更换app版本号
sed -i '' "s/VERSION_NAME=.*/VERSION_NAME=${versionName}/g" ${appGradlePath}
sed -i '' "s/VERSION_CODE=.*/VERSION_CODE=${versionCode}/g" ${appGradlePath}

configPath=${projectPath}/build-depend/buildConfig_android_debug.json

# 清除改动
#git checkout ./assets/**/**

if [ $release == true ]; then
  echo "build config - mode: release"
  configPath=${projectPath}/build-depend/buildConfig_android_release.json

  sh ${projectPath}/build-depend/encryptConfig.sh
  sed -i '' "s?.*service.*?    service: 2,?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*cryptoConfig.*?    cryptoConfig: true,?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*debug.*?    debug: false,?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*gameVersion.*?    gameVersion: \"${versionName}\",?g" ${projectPath}/assets/script/define/GameDefine.ts
  hotUrl=${hotUrl}release/
else
  echo "build config - mode: debug"
  sed -i '' "s?.*service.*?    service: 1,?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*cryptoConfig.*?    cryptoConfig: false,?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*debug.*?    debug: true,?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*gameVersion.*?    gameVersion: \"${versionName}\",?g" ${projectPath}/assets/script/define/GameDefine.ts
  sed -i '' "s?.*blockmasterbraingames.*?    String server = \"https://116-hwcxft6fz-app-test01.qijihdhk.com\";?g" ${projectPath}/native/engine/android/app/src/com/brix/utils/LoginSDK.java
  hotUrl=${hotUrl}debug/
fi

sed -i '' "s?.*hotVersion.*?    hotVersion: \"${hotVersionName}\",?g" ${projectPath}/assets/script/define/GameDefine.ts

echo 'build config - project path: ' ${projectPath}
echo 'build config - config path: ' ${configPath}

echo 'build step - build project'

sed -i '' "s?.*\"versionName\":.*?      \"versionName\": \"${hotVersionName}\",?g" ${configPath}
sed -i '' "s?.*\"address\":.*?      \"address\": \"${hotUrl}${versionName}/\",?g" ${configPath}


# 更换为本机keystorePath
sed -i '' "s?.*keystorePath.*?      \"keystorePath\": \"${projectPath}/build-depend/android.keystore\",?g" ${configPath}

# 更换为本地图片地址
sed -i '' "s?.*url.*?    \"url\": \"${projectPath}/native/engine/android/res/mipmap-xxxhdpi/ic_launcher.png\",?g" ${projectPath}/settings/v2/packages/builder.json

sed -i '' "s/.*makeAfterBuild.*/      \"makeAfterBuild\": false,/g" ${configPath}

$CocosCreatorPath --project ${projectPath} --build "configPath=${configPath}"

outputName=$(cat ${configPath} | grep outputName | awk '{print $2}' | awk -F '"' '{print $2}')

echo "生成热更文件 "

echo "node ${projectPath}/build-depend/version_generator.js -v ${hotVersionName} -u ${hotUrl}${versionName}/ -s ${projectPath}/build/${outputName}/data/ -d ${projectPath}/update_package/"

node ${projectPath}/build-depend/version_generator.js -v ${hotVersionName} -u ${hotUrl}${versionName}/ -s ${projectPath}/build/${outputName}/data/ -d ${projectPath}/update_package/

echo "cp -rf ${projectPath}/update_package/** ${projectPath}/assets/resources/manifest/"

cp -rf ${projectPath}/update_package/** ${projectPath}/assets/resources/manifest/

if [ $exportApp == true ]; then
  sed -i '' "s/.*makeAfterBuild.*/      \"makeAfterBuild\": true,/g" ${configPath}
fi

$CocosCreatorPath --project ${projectPath} --build "configPath=${configPath}"

sed -i '' "s/.*makeAfterBuild.*/      \"makeAfterBuild\": false,/g" ${configPath}

#git checkout ./assets/**/**

echo "出包成功"

if [ -e ./output ]; then
  rm -rf ./output/
fi

mkdir ./output/
mkdir ./output/apk
mkdir ./output/${versionName}
mkdir ./output/${versionName}/manifest

cp -r ./update_package/** ./output/${versionName}/manifest/

cp -r ./build/${outputName}/data/** ./output/${versionName}/

exportAppType=debug

if [ $release == true ]; then
  exportAppType=release
fi

if [ $exportApp == true ]; then
  cp -r ./build/${outputName}/publish/${exportAppType}/** ./output/apk/
fi

echo "请复制./output${versionName}/** 上传至cdn"




