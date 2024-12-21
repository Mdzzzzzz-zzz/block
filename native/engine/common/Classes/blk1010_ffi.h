#include <cstdarg>
#include <cstdint>
#include <cstdlib>
#include <ostream>
#include <new>

struct rs_BlockFillMaster;

struct rs_Map;

extern "C" {

rs_BlockFillMaster *rs_Blk1010FillMaster_new(uint8_t task_per_frame);

void rs_Blk1010FillMaster_free(rs_BlockFillMaster *p_pcs);

int8_t rs_Blk1010FillMaster_fill_request(rs_BlockFillMaster *p_bfm, rs_Map *p_map);

int8_t rs_Blk1010FillMaster_update(rs_BlockFillMaster *p_bfm, uint8_t *p_out);

rs_Map *rs_Blk1010Map_new(uint8_t row, uint8_t col);

void rs_Blk1010Map_free(rs_Map *p_pcs);

int8_t rs_Blk1010Map_assign(rs_Map *p_pcs,
                            const uint8_t *p_data,
                            uintptr_t data_len,
                            uint8_t combo,
                            uint32_t score,
                            uint32_t clearAllScore);

int8_t rs_Blk1010Map_assign_by_mapid(rs_Map *p_pcs, uintptr_t mapid, uint8_t combo, uint32_t score);

} // extern "C"
