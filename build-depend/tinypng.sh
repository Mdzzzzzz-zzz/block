projectPath=$(cd "$(dirname "$0")"/../ && pwd)
###
 # @Author: dengchongliiang 958169797@qq.com
 # @Date: 2024-12-10 10:31:22
 # @LastEditors: dengchongliiang 958169797@qq.com
 # @LastEditTime: 2024-12-13 11:49:06
 # @FilePath: \cli_arc8\build-depend\tinypng.sh
 # @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
### 
pngPath='D:\pingtu\build\wechatgame-score'
pngquantPath='D:\pingtu\build-depend\tinypng/pngquant'
chmod +x "${pngquantPath}"
min=40
max=60
find "${pngPath}" -name '*.png' -print0 | xargs -0 -P8 -L1 "${pngquantPath}" --ext .png --force 256 --speed 1 --quality=${min}-${max}
exec /bin/bash