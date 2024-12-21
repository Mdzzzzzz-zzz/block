#!/bin/sh
CocosCreatorPath=/Applications/Cocos/Creator/3.7.3/CocosCreator.app/Contents/MacOS/CocosCreator
projectPath=$WORKSPACE
if [ -z "$projectPath" ]; then
    projectPath=$(
        cd "$(dirname "$0")"
        pwd
    )
fi
configPath=${projectPath}/build-depend/buildConfig_wechatgame.json
$CocosCreatorPath --project ${projectPath} --build "configPath=${configPath}"
buildTargetPath=${projectPath}/build/wechatgame
wechatCli=/Applications/wechatwebdevtools.app/Contents/MacOS/cli
result=$($wechatCli islogin)
isLoggedIn=$([[ $result == *"\"login\":true"* ]] && echo true || echo false )
hasLogged=false
while [ $isLoggedIn == false ]; do
    result=$($wechatCli islogin)
    if [[ $result == *"\"login\":true"* ]]; then
        echo "Wechatdevtools is logged in."
        isLoggedIn=true
        break
    else
        echo "Wechatdevtools is not logged in. Please log in."
        if [ $hasLogged == false ]; then
            $wechatCli login
            hasLogged=true
        fi
    fi
    sleep 3  # Wait for 5 seconds before the next iteration
done
$wechatCli quit
sleep 5
$wechatCli open --project ${buildTargetPath}
sleep 5
if [ ! -d "/Users/apple/jenkins/jobs/BlockWx" ]; then
  mkdir -p /Users/apple/jenkins/jobs/BlockWx
fi
imagePath=${projectPath}/qr_preview.png
$wechatCli preview --project ${buildTargetPath} -f image -o ${imagePath}
#$wechatCli preview --project ${buildTargetPath} --qr-size small
now=$(date +%s)
expires=$(($now + 25 * 60))
QRCode_Expires=$(date -r $expires "+%Y-%m-%d %H:%M")
echo QRCode_Expires=$QRCode_Expires > wx-minipro-env.txt
sleep 5
if [ -z "$IS_NEED_UPLOAD_WX" ]; then
    IS_NEED_UPLOAD_WX=false
fi
if [ ${IS_NEED_UPLOAD_WX} == true ]; then
    echo "Uploading code..."
    if [[ -z "${PROJ_UPLOAD_DESC}" || -z "${PROJ_UPLOAD_DESC// }" ]]; then
        desc="${GIT_AUTHOR_NAME} upload by jenkins build ${BUILD_ID}"
    else
        desc="${PROJ_UPLOAD_DESC}"
    fi
    $wechatCli upload  --project "${buildTargetPath}" --version "${PROJ_UPLOAD_VERSION}" --desc "$desc"
fi
exit 0