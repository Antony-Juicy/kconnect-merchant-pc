import { enc, AES, mode, pad } from 'crypto-js';
import NP from 'number-precision';
import {
  invert,
  isArray,
  isEmpty,
  isNumber,
  isObject,
  isString,
  isUndefined,
  toInteger,
  toString,
} from 'lodash';
import { getIntl } from '@/hooks/useLocale';
import { ERROR_MAP, MINE_TYPE } from './constants';
import type { IApiResponse } from './request';
import type { Moment } from 'moment';
import moment from 'moment';
import settings from './settings';
import type { RcFile } from 'antd/lib/upload';

// 默认错误提示对象
const defaultErrorObj = { id: 'error.unknown.begin', defaultMessage: '發生未知錯誤, 請稍後重試' };

// 獲取錯誤文本
export const getErrorMsg = (code: string, response: IApiResponse, defaultMsg?: any) => {
  const intl = getIntl();
  const $_defaultMsg = defaultMsg || intl.formatMessage(defaultErrorObj);

  return ERROR_MAP[`${code}`] ? ERROR_MAP[`${code}`] : response?.message || $_defaultMsg;
};

// 非空校驗
export const isEmptyUtils = (value: any, excludeZero: boolean = true) => {
  if (excludeZero) {
    if (!value && value !== 0 && value !== false) {
      return true;
    }
  } else if (!value || `${value}` === '0') {
    return true;
  }
  if ((isObject(value) || isArray(value)) && isEmpty(value)) {
    return true;
  }
  return false;
};

// 格式化時間戳
export const formatUnixTimestamp = (
  timestamp: number | string,
  format: string = settings.systemDateTimeFormat,
) => {
  if (timestamp) {
    let time = timestamp;
    if (isString(timestamp)) {
      time = parseInt(timestamp, 10);
    }
    if (!isEmptyUtils(time, false)) {
      return moment(time).format(format);
    }
  }
  return '';
};

// 格式化千分符
export const thousands = (number: number | string, separator: string = ',') => {
  const parts = `${number || number === 0 ? number : ''}`.split('.');

  if (parts.length) {
    parts[0] = parts[0].replace(/(\d)(?=(\d{3})+\b)/g, `$1${separator}`);
  }

  return parts.join('.');
};

export const generateTawkTo = (chatUrl: string, zIndex = null) => {
  if (!window) {
    throw new Error('Unvailable DOM');
  }

  const id = 'kpay_tawk_to';
  if (document.getElementById(id) === null) {
    const el = document.createElement('script');
    el.id = id;
    el.async = true;
    el.src = chatUrl;
    el.type = 'text/javascript';
    el.charset = 'UTF-8';
    el.crossOrigin = '*';
    const node = document.getElementsByTagName('script')[0];
    if (!node || !node.parentNode) {
      throw new Error('Unavailable DOM');
    }

    node.parentNode.insertBefore(el, node);
    document.body.appendChild(node);
    document.body.appendChild(el);
  }

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const tawk = window.Tawk_API;

  if (zIndex) {
    tawk.customStyle = { zIndex: zIndex };
  }

  return tawk;
};

// 强制固定N位小数
export const fixedDigit = (value: any, digit = 2, round = true) => {
  if (value) {
    if (round) {
      return (Math.round(parseFloat(value) * Math.pow(10, digit)) / Math.pow(10, digit)).toFixed(
        digit,
      );
    } else {
      return (
        parseInt((parseFloat(value) * Math.pow(10, digit)) as any) / Math.pow(10, digit)
      ).toFixed(digit);
    }
  }
  return (0).toFixed(digit);
};

// 金額精度計算
export const bigDecimalSub = (subtractor: number, minuend: number, precision: number = 2) => {
  return NP.round(NP.minus(subtractor, minuend), precision);
};

// 金額精度計算
export const bigDecimalAdd = (add1: number, add2: number, precision: number = 2) => {
  return NP.round(NP.plus(add1, add2), precision);
};

// 金額精度計算
export const bigDecimalMultiply = (
  multiplier1: number,
  multiplier2: number,
  precision: number = 2,
) => {
  return NP.round(NP.times(multiplier1, multiplier2), precision);
};

// 金額精度計算
export const bigDecimalDivide = (
  multiplier1: number,
  multiplier2: number,
  precision: number = 2,
) => {
  return NP.round(NP.divide(multiplier1, multiplier2), precision);
};

// 金額精度計算
export const bigDecimalSumBy = (array: any[], iteratee?: ((value: any) => number) | string) => {
  if (!Array.isArray(iteratee) && array.length <= 0) {
    return 0;
  }

  let sum = 0;

  if (iteratee) {
    const getNumberForItem = (item: any) => {
      switch (typeof iteratee) {
        case 'function':
          {
            const current = iteratee(item);
            if (current) {
              return current && isNumber(current) ? Number(current) : 0;
            }
          }
          break;
        default:
          return item[iteratee] && isNumber(item[iteratee]) ? Number(item[iteratee]) : 0;
      }
      return 0;
    };

    array.map((item) => {
      sum = bigDecimalAdd(sum, getNumberForItem(item));
      return sum;
    });
  }
  return sum;
};

// AES 加密
export const encryptWithCFB = (word: string, key: string, iv?: string) => {
  const srcs = enc.Utf8.parse(word);
  const encrypted = AES.encrypt(srcs, enc.Utf8.parse(key), {
    iv: iv ? enc.Utf8.parse(iv) : undefined,
    mode: mode.CFB,
    padding: pad.Pkcs7,
  });
  return `${encrypted.ciphertext.toString(enc.Base64)}`;
};

// AES 解密
export const decryptWithCFB = (word: string, key: string, iv?: string) => {
  const encryptedHexStr = enc.Base64.parse(word);
  const srcs = enc.Base64.stringify(encryptedHexStr);
  const decryptObj = AES.decrypt(srcs, enc.Utf8.parse(key), {
    iv: iv ? enc.Utf8.parse(iv) : undefined,
    mode: mode.CFB,
    padding: pad.Pkcs7,
  });
  const decryptedStr = decryptObj.toString(enc.Utf8);
  return decryptedStr.toString();
};

// await/wrap 处理错误
export const awaitWrap = <T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> => {
  return promise.then<[null, T]>((data: T) => [null, data]).catch<[U, null]>((err) => [err, null]);
};

// 包裝 lodash toString
export const kToString = toString;

// 格式化時間戳 只格式成日期
export const formatUnixTimestampIgnoreTime = (timestamp: number) => {
  return formatUnixTimestamp(timestamp, settings.systemDateFormat);
};

// 格式化 Moment Js 對象為 時間戳 默認毫秒
export const formatMomentObj = (momentTime: Moment, millisec: boolean = true) => {
  if (millisec) {
    return moment(momentTime).valueOf();
  }
  return moment(momentTime).unix();
};

// 打開新標籤頁
export const openNewTabs = (url: string, id: string = 'newWindows') => {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('target', '_blank');
  a.setAttribute('id', id);
  if (!document.getElementById(id)) {
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

// 隨機生成num位的字符串
export const randomRangeId = (num: number) => {
  let returnStr = '';
  const charStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < num; i++) {
    const index = Math.round(Math.random() * (charStr.length - 1));
    returnStr += charStr.substring(index, index + 1);
  }
  return returnStr;
};

// 生成 uuid 格式
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 获取文件名后缀
const getFileSuffix = (filename: string) => {
  const index = filename.lastIndexOf('.');
  if (index !== -1) {
    return filename.substring(index + 1);
  }
  return false;
};

// 检查上传文件类型
export const checkTypes = (file: RcFile, typeList: string[], forceSuffix: boolean = false) => {
  const type = typeList;
  if (type && file && file.type && !forceSuffix) {
    return type.includes(file.type);
  }

  const suffix = getFileSuffix(file.name);
  if (suffix && file && file.name) {
    let pass = false;
    const mine = invert(MINE_TYPE);
    typeList.forEach((item) => {
      pass = suffix.toLocaleUpperCase() === mine[item];
    });
    return pass;
  }
  return false;
};

// 获取限制文件大小
export const checkMaxSize = (size: number, maxSize: number) => {
  return size / 1024 / 1024 < maxSize;
};

// 轉換文件為相應的單位
export const transSize = (limit: number, base: string = 'bytes', isBit: boolean = true) => {
  const baseByte = isBit ? 1024 : 1000;

  let bytes;
  switch (base.toLowerCase()) {
    case 'mb':
      bytes = limit * baseByte * baseByte;
      break;
    default:
      bytes = limit;
      break;
  }

  if (bytes === 0) return '0 B';
  const k = baseByte;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${toInteger((bytes / k ** i).toPrecision(3))} ${sizes[i]}`;
};

// 轉換為指定單位
export const convertSize = (
  limit: number,
  form: string = 'bytes',
  to: string = 'mb',
  isBit: boolean = true,
) => {
  const baseByte = isBit ? 1024 : 1000;
  let toValue;

  if (form.toLowerCase() === to.toLowerCase()) {
    toValue = limit;
  } else {
    let bytes;
    // 先轉換為bytes
    switch (form.toLowerCase()) {
      case 'mb':
        bytes = limit * baseByte * baseByte;
        break;
      case 'kb':
        bytes = limit * baseByte;
        break;
      default:
        bytes = limit;
        break;
    }

    // 需要轉換的單位
    switch (to.toLowerCase()) {
      case 'mb':
        toValue = bytes / baseByte / baseByte;
        break;
      case 'kb':
        toValue = bytes / baseByte;
        break;
      default:
        toValue = bytes;
        break;
    }
  }

  return parseFloat(`${toValue}`).toFixed(1);
};

// 獲取字符串首字母
export const getFirstSubStr = (str: string, limit: number = 1) => {
  if (!str) {
    return '';
  }
  if (str.length <= limit) {
    return str;
  }

  return str.trimStart().substring(0, limit);
};

// 只能输入数字校验
export const verifyNumber = (val: any, type: string = '', data: any = {}) => {
  let $_val = val;
  if ($_val) {
    if (type === 'integer') {
      $_val = $_val.replace(/[^\d]/g, '').replace(/\./g, '');
    } else {
      $_val = $_val
        .replace(/[^\d.]/g, '')
        .replace(/\.{2,}/g, '.')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');
      if ($_val) {
        const arr = $_val.match(/.{1}/g);
        if (arr[0] === '.') {
          $_val = `0${$_val}`;
        }
      }
    }

    if (data.noZero) {
      $_val = $_val.replace(/^[0]/g, '');
    }

    if (data.notPoint) {
      $_val = $_val.replace(/^[0]|[\.]/g, '');
    }

    if (data.range) {
      if (Array.isArray(data.range) && data.range.length === 2) {
        const [min, max] = data.range;
        let tempval = $_val;
        if ($_val.charAt($_val.length - 1) === '.') {
          tempval = `${$_val}0`;
        }
        tempval = parseFloat(tempval);
        if (!isUndefined(min) && tempval < parseFloat(min)) {
          $_val = min;
        }
        if (!isUndefined(max) && tempval > parseFloat(max)) {
          $_val = max;
        }
      }
    }

    if (data.toFixed) {
      const toFixed = data.toFixed === true ? 2 : data.toFixed;
      if ($_val) {
        $_val = `${$_val}`.replace(new RegExp(`([0-9]+\.[0-9]{${toFixed}})[0-9]*`, 'g'), '$1');
        if (data.isBlurred) {
          $_val = parseFloat($_val).toFixed(toFixed);
        }
      }
    }

    if (data.isBlurred && data.denyList) {
      if (Array.isArray(data.denyList) && data.denyList.includes(parseFloat($_val))) {
        $_val = '';
      }
    }

    if (data.price) {
      const priceList = $_val.split('.');
      const [intNum, floatNum] = priceList;
      const limitList = data.price.toString().split('.');
      const [intLimit, floatLimit] = limitList;
      if (priceList.length == 1) {
        if ($_val > parseFloat(intLimit)) {
          $_val = intNum.substr(0, $_val.length - 1);
        } else {
          $_val = intNum.substr(0, intLimit.length);
        }
      }
      if (priceList.length == 2) {
        if (parseFloat(intNum) < parseFloat(intLimit)) {
          $_val = intNum + '.' + floatNum.substr(0, floatLimit.length);
        } else {
          if (parseFloat(floatNum) > parseFloat(floatLimit)) {
            $_val = intNum + '.' + floatNum.substr(0, floatNum.length - 1);
          } else {
            $_val = intNum + '.' + floatNum.substr(0, floatLimit.length);
          }
        }
      }
    }
  }

  // 默认值为指定输入正数
  const $abs = data.abs === false ? false : true;

  if ($abs) {
    return $_val;
  }
  if (!$abs && parseFloat(val) < 0 && `${$_val}`.indexOf('-') === -1) {
    return `-${$_val}`;
  }
  return $_val;
};

/**
 *
 * @param key            就是key
 * @param value          就是value
 * @param time:number    以毫秒的形式设置过期时间         ===》3000
 * @param time:string    以时间字符的形式设置过期时间    ===》Sat, 13 Mar 2017 12:25:57 GMT
 * @param time:Date      以Date设置过期时间             ===》new Date(2017, 03, 12)
 *
 * @param defaultTime     如果没有时间参数，设置默认过期时间 单位毫秒
 */

const defaultTime = 86400000;
//设置cookie
export function setCookie(key: string, value: string, time?: number | Date) {
  let invalid = new Date();
  if (time) {
    switch (typeof time) {
      case 'number':
        invalid.setTime(invalid.getTime() + time);
        break;
      default:
        invalid = time;
    }
  } else {
    invalid.setTime(invalid.getTime() + defaultTime);
  }
  //字符串拼接cookie
  window.document.cookie = key + '=' + value + ';path=/;expires=' + invalid.toUTCString();
}

//读取cookie
export function getCookie(param: string) {
  let c_param = '';
  if (document.cookie.length > 0) {
    const arr = document.cookie.split('; ');

    for (let i = 0; i < arr.length; i++) {
      const arr2 = arr[i].split('=');
      if (arr2[0] == param) {
        c_param = arr2[1];
      }
    }
    return c_param;
  }
  return '';
}

// 清除cookie
export const removeCookie = (name: any, path: any, domain: any) => {
  setCookie(name, '', domain);
};

//从对象中选择特定值  创建一个新对象的方法
/**
 *
 * @param obj    原始对象，新对象将从中创建。
 * @param keys   要选择传输到新对象中的键数组。
 */
export const pick = (obj: object, keys: any) => {
  return keys.reduce((acc: any, key: string) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

// 从现有对象中删除某些属性
//从对象中选择特定值  创建一个新对象的方法
/**
 *
 * @param obj    原始对象，新对象将从中创建。
 * @param keys   不应该在新对象中的键数组。
 */
export const omit = (obj: object, keys: any) => {
  return Object.keys(obj)
    .filter((key) => !keys.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
};
