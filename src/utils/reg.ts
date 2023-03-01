// 密碼正則
export const PWD = /^(?![a-zA-Z]+$)(?![0-9]+$)[a-zA-Z0-9]{8,}$/;
// 電子郵件
export const EMAIL = /^([a-z0-9A-Z]+[-_|.]?)+[\w]?@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\.)+[a-zA-Z]{2,}$/;
// 名称正则 不允许输入特殊  . _ $ ! ^ % & 等特殊字符，不支持输入表情符号
export const SPECIAL_VALUE = /^[\u4e00-\u9fa5\w ]+$/;
// 名称正则 允许输入特殊  . _ $ ! ^ % & 等特殊字符，不支持输入表情符号
export const WITH_SPECIAL_VALUE =
  /^[\u4e00-\u9fa5\w `~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]+$/;
// 字母数字
export const CHINESE_DENY = /^[\w]+$/;
// 中文正則
export const CHINESE_REG = /[\u4e00-\u9fa5]/g;
// 数字
export const NUMBER_ONLY = /^[\d]+$/;

// 文本输入框正则 不允许输入表情
export const describe =
  /^[A-Za-z0-9 \u4e00-\u9fa5  \…\\￥\%\\\！\!\@\#\$\^\&\*\-\-\_\+\=\:\：\ \\~\\～\\\'\"\”\“\;\；\,\，\。\τ\\π\\.\、\/\?\？\(\)\{\}\[\]\～\ \·\\！\@\#\$\%\*\&\\（\）\\—\—\-\+\=\|\】\【\「\」\“\\”\；\：\’\‘\/\，\。\《\》\<\>\?\<\>]*$/;

// 数字(允許空格)
export const NUMBER_ONLY_ALLOW_SPACE = /^[\d ]+$/;
// 聯絡電話
export const MOBILE = /^\d{8,11}$/;
// 用戶標籤（只包含英文大小寫，中文，數字，30字內）
export const MEMBERTAGS = /^[\u4e00-\u9fa5 a-zA-Z0-9]{0,30}$/;
//INCORRECTFORMAT 密碼正則
export const INCORRECTFORMAT = /^(?![a-zA-Z]+$)(?![0-9]+$)[a-zA-Z0-9]{8,}$/;

//禁止输空字符串
export const DISABLESPACES = /\S+/;

//自然数
export const NATURALNUMBER = /^(?:0|[1-9][0-9]*)$/;

// 大陸手機正則
export const CNPHONE_NUMBER_REG = /^(1[3-9])\d{9}$/;
// 香港手機正則
export const HKPHONE_NUMBER_REG = /^\d{8}$/;
// 其他手機正則
export const OTHERPHONE_NUMBER_REG = /^\d{1,20}$/;

// 用于商品sku编号，条码编号（只包含英文大小寫，中文，- _，）
export const SKU_CODE = /^[\u4e00-\u9fa5a-zA-Z0-9-_]*$/;
