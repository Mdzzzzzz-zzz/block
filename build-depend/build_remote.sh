
# -- 环境参数 start
CocosCreatorPath=/Applications/CocosCreator/Creator/3.5.2/CocosCreator.app/Contents/MacOS/CocosCreator

projectPath=$(cd `dirname $0`/../; pwd)

appGradlePath=${projectPath}/native/engine/android/app/gradle.properties

# -- 环境参数 end

# -- 打包参数 start 
# 源版本 
versionName="1.0.0"

# 热更文件版本 
hotVersionName="1.0.0"

# 热更cdn地址 
url="https://121-block-cdn-aws.qijihdhk.com/block/release/"

configPath=${projectPath}/build-depend/buildConfig_android_remote.json

releaseConfigPath=${projectPath}/build-depend/buildConfig_android_release.json

cp -r ${releaseConfigPath} ${configPath}


sed -i '' "s?.*\"versionName\":.*?      \"versionName\": \"${hotVersionName}\",?g" ${projectPath}/build-depend/buildConfig_android_remote.json
sed -i '' "s?.*\"address\":.*?      \"address\": \"${url}${versionName}/\",?g" ${projectPath}/build-depend/buildConfig_android_remote.json
sed -i '' "s?.*\"outputName\":.*?  \"outputName\": \"android-remote\",?g" ${projectPath}/build-depend/buildConfig_android_remote.json
sed -i '' "s?.*\"hotVersion\":.*?    hotVersion: \"${hotVersionName}\",?g" ${projectPath}/assets/script/define/GameDefine.ts

versionCode=1

# -- 打包参数 end

# 更换app版本号
sed -i '' "s/VERSION_NAME=.*/VERSION_NAME=${versionName}/g" ${appGradlePath}
sed -i '' "s/VERSION_CODE=.*/VERSION_CODE=${versionCode}/g" ${appGradlePath}

echo 'build config - project path: ' ${projectPath}
echo 'build config - config path: ' ${configPath}

echo 'build step - build project'

# 更换为本机keystorePath
sed -i '' "s?.*keystorePath.*?      \"keystorePath\": \"${projectPath}/build-depend/android.keystore\",?g" ${configPath}

# 更换为本地图片地址
sed -i '' "s?.*url.*?    \"url\": \"${projectPath}/native/engine/android/res/mipmap-xxxhdpi/ic_launcher.png\",?g" ${projectPath}/settings/v2/packages/builder.json

sed -i '' "s/.*makeAfterBuild.*/      \"makeAfterBuild\": false,/g" ${configPath}

$CocosCreatorPath --project ${projectPath} --build "configPath=${configPath}"

# $CocosCreatorPath --project ${projectPath} --build "configPath=${configPath}"

rm -rf ./update_files
mkdir ./update_files
mkdir ./update_files/manifest

cp -r ./update_package/** ./update_files/manifest/

cp -r ./build/android-remote/data/** ./update_files/

echo "请复制./update_files/** 上传至cdn"