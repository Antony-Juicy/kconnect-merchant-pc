import { EMAIL, PWD, SPECIAL_VALUE, MOBILE, INCORRECTFORMAT } from './reg';

export const msg = {
  pwd: '請輸入至少8位由數字及字母組成的新密碼。',
  email: '電郵格式不正確/電郵未註冊/請輸入註冊電郵',
  specialValue: '只限30字內的中文或英文名稱，不可包括符號及表情等元素',
  mobile: '聯絡電話格式不正確',
  errEmail: '電郵格式不正確',
  IncorrectFormat: '密碼格式不正確',
};

export const reg_exp = {
  pwd: PWD,
  email: EMAIL,
  specialValue: SPECIAL_VALUE,
  mobile: MOBILE,
  errEmail: EMAIL,
  IncorrectFormat: INCORRECTFORMAT,
};

export const pattern = (name: string, para: string = 'g') => {
  return {
    pattern: new RegExp(reg_exp[name], para),
    message: msg[name],
  };
};
