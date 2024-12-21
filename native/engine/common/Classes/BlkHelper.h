/*
 * @Date: 2024-02-22 14:05:21
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-02-26 15:30:06
 */
#pragma once

#include "cocos/cocos.h"
#include "blk1010_ffi.h"
namespace blk {
    class BlkHelper {
    public:
        BlkHelper() = default;

        virtual ~BlkHelper() = default;

        void print() {
            CC_LOG_DEBUG("BlkHelper ==> Hello Swig~");
        }

        void pass(ccstd::vector<unsigned char> &data) {
            CC_LOG_DEBUG("BlkHelper ==> Hello Swig~ %d", (int) data[1]);
        }

        void fillAsync(ccstd::vector<unsigned char> map, uint8_t combo, uint32_t score,
                       const std::function<void(ccstd::vector<unsigned char>)> &cb,
                       float deltaTime,uint32_t clearAllScore) {
            _fillCb = cb;
            unsigned char data[64] = {0}; // 将数组中的所有元素初始化为 0
            // 将 map 中的数据复制到 data 数组中
            for (size_t i = 0; i < map.size(); ++i) {
                if (i < 64) { // 防止越界
                    data[i] = map[i];
                } else {
                    break;
                }
            }
            rs_BlockFillMaster *f = rs_Blk1010FillMaster_new(6);
            rs_Map *a = rs_Blk1010Map_new(8, 8);
            rs_Blk1010Map_assign(a, data, 64, combo, score,clearAllScore);
            // rs_Blk1010Map_assign_by_mapid(a, 2, combo, score);
            rs_Blk1010FillMaster_fill_request(f, a);
            _fillFrame = 0;
            _fillFinish = false;
//            CC_LOG_DEBUG("BlkHelper ==> fillAsync~");
            CC_CURRENT_ENGINE()->getScheduler()->schedule([this, a, f](float dt) {
                                                              unsigned char out_array[3];
                                                              unsigned r = rs_Blk1010FillMaster_update(f, out_array);
                                                              _fillFrame = _fillFrame+1;
                                                              if (r > 0 && !_fillFinish) {
                                                                  _fillFinish = true;
                                                                  ccstd::vector<unsigned char> res;
                                                                  for (int i = 0; i < 3; i++) {
                                                                      res.push_back(out_array[i]);
                                                                      // CC_LOG_DEBUG("BlkHelper ==> blk[%d] = %d\n", i, out[i]);
                                                                  }
                                                                  if (_fillCb != nullptr)
                                                                      _fillCb(res);
//                                                                  rs_Blk1010Map_free(a);
//                                                                  rs_Blk1010FillMaster_free(f);
                                                                  CC_CURRENT_ENGINE()->getScheduler()->unscheduleAllForTarget(this);
                                                              }
                                                          },
                                                          this, 0.0167f, UINT_MAX - 1, 0.0f,
                                                          false, "iamblk");
        }

//        int8_t blk1010FillMaster_update(rs_BlockFillMaster *p_bfm, uint8_t *p_out) {
//            return rs_Blk1010FillMaster_update(p_bfm, p_out);
//        }

        ccstd::vector<unsigned char>
        fill(ccstd::vector<unsigned char> map, uint8_t combo, uint32_t score) {
            unsigned char data[64] = {0}; // 将数组中的所有元素初始化为 0
            unsigned char out[3] = {0};   // 同样将数组中的所有元素初始化为 0

            // 将 map 中的数据复制到 data 数组中
            for (size_t i = 0; i < map.size(); ++i) {
                if (i < 64) { // 防止越界
                    data[i] = map[i];
                } else {
                    break;
                }
            }

            rs_BlockFillMaster *f = rs_Blk1010FillMaster_new(10);
            rs_Map *a = rs_Blk1010Map_new(8, 8);
            rs_Blk1010Map_assign(a, data, 64, combo, score,0);
            // rs_Blk1010Map_assign_by_mapid(a, 2, combo, score);
            rs_Blk1010FillMaster_fill_request(f, a);
            unsigned r = 0;
            while (1) {
                r = rs_Blk1010FillMaster_update(f, out);
                // CC_LOG_DEBUG("BlkHelper ==> ret: %d", (int)r);
                if (r > 0)
                    break;
            }
            ccstd::vector<unsigned char> res;
            for (int i = 0; i < 3; i++) {
                res.push_back(out[i]);
                // CC_LOG_DEBUG("BlkHelper ==> blk[%d] = %d\n", i, out[i]);
            }
            rs_Blk1010Map_free(a);
            rs_Blk1010FillMaster_free(f);
            return res;
        }

    private:
        std::function<void(ccstd::vector<unsigned char>)> _fillCb;
        int8_t _fillFrame;
        bool _fillFinish;
    };
}
