import ERRORMAP from '@/utils/errorMap';

import unknowIcon from '@/assets/images/member/gender-unknow.png';
import maleIcon from '@/assets/images/member/gender-male.png';
import femaleIcon from '@/assets/images/member/gender-female.png';
import dayRegisteredCount from '@/assets/images/member/dayRegisteredCount.png';
import deletedMember from '@/assets/images/member/deletedMember.png';
import memberCount from '@/assets/images/member/memberCount.png';
import momthRegisteredCount from '@/assets/images/member/momthRegisteredCount.png';
import weekRegisteredCount from '@/assets/images/member/weekRegisteredCount.png';

export type TLineDataProps = {
  statisticalDate?: string;
  statisticalCount?: number;
};
export type optionValues = {
  value?: number;
  label?: string;
};

export const PollingPeriodOfNotice = 100000;

// 商品模板更新提示错误码
export const TEMP_UPDATE_ERROR_CODE = 66040;

// 首页收入对比和交易总额数据源更变后的错误码
export const DASHBOARD_DATA_SOURCE_CHANGE_CODE = 1011;

// 首页收入对比和交易总额数据源
export const DASHBOARD_DATA_SOURCE = {
  KAPY: 'KPAY',
  OATS: 'OATS',
};

export type TPieDataProps = {
  title?: string;
  explain?: string;
  pieData?: any[];
};

export type FavAppProps = {
  applicationFavouriteId?: string | number;
  applicationId: string | number;
  icon: string;
  name: string;
  description: string;
  scene: string;
  characteristic: string;
  price: string;
  highLight?: string[];
};
export type TCountDataProps = {
  label: string;
  tip: string;
  url: any;
  count: number;
};
// 接口簽名常量
export const SID = '899088294013054428';
export const SECRET = 'iY5jO4bP5lD3gS8aQ6nW4wT0pX0zT3cL8eO7lV0qX8aW2oE0pL3zM3aQ9rL2bA3f';
export const TERMINAL = 'merchant-web';
export const VERSION = '1.0.0';
export const pieListData = [
  {
    title: '',
    explain: '',
    pieData: [],
  },
  {
    title: '',
    explain: '',
    pieData: [],
  },
  {
    title: '',
    explain: '',
    pieData: [],
  },
  {
    title: '',
    explain: '',
    pieData: [],
  },
];
export const defaultCountList = [
  {
    label: '',
    tip: '',
    url: memberCount,
    count: 0,
  },
  {
    label: '',
    tip: '',
    url: dayRegisteredCount,
    count: 0,
  },
  {
    label: '',
    tip: '',
    url: weekRegisteredCount,
    count: 0,
  },
  {
    label: '',
    tip: '',
    url: momthRegisteredCount,
    count: 0,
  },
  {
    label: '',
    tip: '',
    url: deletedMember,
    count: 0,
  },
];

// 需要强制返回登錄頁的狀態
export const FORCE_GOTO_LOGIN = ['40001', '10104', '1004', '1008', '61014'];

/** 需要特殊處理的狀態碼 */
// 處理不提示的狀態碼數組
export const NO_OUTPUT_CODES = ['40001'];
// 认证失败
export const AUTH_FAILURE = '40001';
/** 需要特殊處理的狀態碼 */
// 賬戶已被暫停使用
export const SUSOENDED_ACCOUNT = '61014';

// Mine Type 映射
export const MINE_TYPE = {
  COMMON: 'application/octet-stream',
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PNG: 'image/png',
  JPG: 'image/jpeg',
  GIF: 'image/gif',
  APK: 'application/vnd.android.package-archive',
  TXT: 'text/plain',
};

export const ERROR_MAP = ERRORMAP;

// 應用可見範圍
export const VISIBLERANGE = {
  ALL_EMPLOYEE: 1,
  PART_EMPLOYEE: 2,
};

// 應用申请类型
export const APPLY_TYPE = {
  OPEN: 1,
  TRY: 2,
};

// 應用程式列表，可選擇的操作按鈕
export const ABOUT_LANGUAGE = {
  HK: 'zh_HK',
  EN: 'en_US',
};

// 语种
export const APPOPERATION = {
  ACTIVATE: 0,
  DETAIL: 1,
  SETTING: 2,
  DEACTIVATE: 3,
};

// 應用程式列表，應用是否已開通
export const APPSTATUS = {
  OPENED: 0,
  NOTOPENED: 1,
};

// 應用啟用、停用狀態
export const APPSTATE = {
  DEACTIVATE: 0,
  ACTIVATE: 1,
};
// 應用啟用、停用狀態
export const APPSUBSTATE = {
  UNSUBSCRIBED: 0,
  SUBSCRIBED: 1,
};

export const BURIEDKEY = {
  NAME: 'item_name',
  ACCESSTIME: 'view_time',
  APPSTATE: 'app_state',
  RETENTIONPERIOD: 'stay_time',
};

/**
 * 角色權限
 * 非管理员: 1
 * 主管理员: 2
 * 子管理员: 3
 * 创建者（企业主管理员组的创建人）: 4
 */
export const GROUPMANAGER = {
  NO_ADMIN: 1,
  ADMIN: 2,
  SUB_ADMIN: 3,
  CREATOR: 4,
};

// 二維碼狀態
export const QR_CODE_STATE = {
  /**
   * 新生成
   */
  NEW: 'NEW',

  /**
   * 已扫描待确认
   */
  SCANNED: 'SCANNED',

  /**
   * 已确认
   */
  CONFIRMED: 'CONFIRMED',

  /**
   * 已取消
   */
  REFUSED: 'REFUSED',

  /**
   * 已过期
   */
  EXPIRED: 'EXPIRED',
};

// 協議同意、拒絕
export const AGREEMENTREAD = {
  CANCEL: 0,
  OK: 1,
};

// 會員性別
export const MEMBERGENDER = {
  UNKNOW: 1,
  MALE: 2,
  FEMALE: 3,
};

// 會員性別
export const FEEDBACK = {
  More: 0,
  QUE: 1,
  SUGGEST: 2,
};

export const FEEDBACKDIC = {
  TIME: 'relation_time',
  QUE: 'feedback_question',
  MARK: 'feedback_rating',
};

export const APPUSEFLAG = {
  USED: 1,
  NOUSED: 0,
};

export const FEEDBACK_TEXT = {
  '0': ['application.feedback.needmoreinfo', '需要更多的資訊'],
  '1': ['application.feedback.havequestionaboutappbeingused', '對正在使用的應用有疑問'],
  '2': ['application.feedback.havesugonkconnectappCenter', '對“KConnect-應用中心”有些建議'],
};
// 性别文案
export const GENDER_TEXT = {
  '1': ['member.gender.unknow', '未登記'],
  '2': ['member.gender.male', '男'],
  '3': ['member.gender.female', '女'],
};

// 性别文案
export const PAGE_SOURCE = {
  appNotification: '應用通知',
  caseDetail: '個案詳情',
  appDetail: '應用詳情',
  '/main/transaction/overview': '交易概覽',
  '/main/transaction/record': '交易紀錄',
  '/main/transaction/settlement': '結算紀錄',
};

// 會員頭像
export const MEMBERAVATAR = [unknowIcon, maleIcon, femaleIcon];

// 會員唯一標識
export const MEMBERUNIQUEFLAG = {
  PHONE: 1,
  MAIL: 2,
};

// 區號
export const MOBILEAREACODE = {
  HK: '852',
  MAINLAND: '86',
  SP: '65',
  TW: '886',
  MS: '60',
};

// 商品状态
export const SALESSTATE = {
  ONSALE: 1,
  OFFSALE: 0,
};

// 分類等級
export const CATEGORY_LEVEL_STATE = {
  1: { id: 'commodity.class.level.first', defaultMessage: '一級' },
  2: { id: 'commodity.class.level.second', defaultMessage: '二級' },
  3: { id: 'commodity.class.level.third', defaultMessage: '三級' },
};

// 庫存狀態
export const PRODUCT_STOCK_STATUS_ACTION = {
  1: ['inventory.product.stock.take.up', '上架'],
  0: ['inventory.product.stock.take.down', '下架'],
};

// 初次登錄需要修改密碼
export const RESET_PASSWORD = '60057';

// 初次登錄需要修改密碼
export const RESET_PASSWORD_FIRST_LOGIN = 60057;

// 需要强制修改密碼的狀態
export const FORCE_RESET_PASSWORD = [RESET_PASSWORD_FIRST_LOGIN];

// 导入商品任务状态
export const IMPORTTASKSTATE = {
  ACTIVE: 0,
  PROCESSING: 1,
  SUCCESS: 2,
  FAIL: 3,
  ERROR: 4,
};

// 庫存变更类型
export const INVENTORY_CHANGE_TYPE = {
  1: {
    id: 'commodity.inventory.change.procurement',
    defaultMessage: '採購',
  },
  2: {
    id: 'commodity.inventory.change.return',
    defaultMessage: '退貨',
  },
  3: {
    id: 'commodity.inventory.change.transfer',
    defaultMessage: '轉移',
  },
  4: {
    id: 'commodity.inventory.change.issue',
    defaultMessage: '出庫',
  },
  5: {
    id: 'commodity.inventory.change.sales',
    defaultMessage: '銷售',
  },
};

// 列表需要显示情况类型的数据，但是搜索栏目不需要
export const ALL_INVENTORY_CHANGE_TYPE = {
  ...INVENTORY_CHANGE_TYPE,
  6: {
    id: 'commodity.inventory.change.empty',
    defaultMessage: '清空',
  },
};

// 变更类别枚举
export enum enumCategory {
  procurement = 1,
  return,
  transfer,
  issue,
  sales,
  empty,
}

// 上傳文件 所屬模塊參數
export const UPLOADMODULE = {
  PRODUCT: 'product',
};

// 其他支付系統
export const NUMERICAL_VALUE = 'other';

// 允许跳转修改初始密码页的路由
export const ALLOWTOCHANGEPASSWORD = [
  '/user/login',
  '/user/login/',
  '/user/codeLogin',
  '/user/codeLogin/',
  '/user/emailLogin',
  '/user/emailLogin/',
];
