/*
 * @Date: 2023-02-09 15:20:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 11:12:34
 */

export interface IUICfg {
  component?: string;
  bundle?: string;
  dir?:string;
  path?:string;
}

export const MKUIConfig = {
  prefab:{
    tips: {
      path: 'view/prefab/common/tips',
      bundle:"resource",
      component: 'MKTips',
    },
    progress: {
      path: 'view/prefab/common/progress',
      component: 'MKProgress',
      bundle:"resource",
    },
    dialog: {
      path: 'view/prefab/common/windowTip',
      component: 'MKDialog',
      bundle:"resource",
    },
    // adviced: {
    //   path: 'view/prefab/common/windowAdvice',
    //   component: 'MKAdvice',
    // },
    hallPage1: {
      path: 'hall/prefab/hall_page1',
      component: 'HallPage1',
    },
    hallPage2: {
      path: 'hall/prefab/hall_page2',
      component: 'HallPage2',
    },
    hallPage3: {
      path: 'hall/prefab/hall_page3',
      component: 'HallPage3',
    },
    hallPage4: {
      path: 'hall/prefab/hall_page4',
      component: 'HallPage4',
    },
    page1Cell: {
      path: 'hall/prefab/page1_cell',
      component: 'Page1Cell',
    },
    page2Cell: {
      path: 'hall/prefab/page2_cell',
      component: 'Page2Cell',
    },
    page3Cell: {
      path: 'hall/prefab/page3_cell',
      component: 'Page3Cell',
    },
    hallJbs: {
      path: 'hall/prefab/hall_jbs',
      component: 'HallJbs',
    },
    hallGameOver: {
      path: 'hall/prefab/hall_gameover',
      component: 'HallGameOver',
    },
    hallMatchList: {
      path: 'hall/prefab/hall_matchlist',
      component: 'HallMatchList',
    },
    hallMatchCell: {
      path: 'hall/prefab/hall_match_cell',
      component: 'HallMatchCell',
    },
    hallPipei: {
      path: 'hall/prefab/hall_papei',
      component: 'HallPipei',
    },
    hallDuanwei: {
      path: 'hall/prefab/hall_duanwei',
      component: 'HallDuanwei',
    },
    menuLayer:{
      path:'2048/prefab/menuLayer',
    }
  }
}
