import { SID, SECRET, TERMINAL, VERSION } from '@/utils/constants';
import { HmacSHA256 } from 'crypto-js';

interface ISecuritySign {
  sid: string;
  version: string;
  terminal: string;
  nonceStr: string;
  signature: string;
  timestamp: string;
  accessToken?: string | null;
}

// 生成随机字符串
const nonceStrGenerator = (length: number = 32) => {
  const chats = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  const max = chats.length;
  let hideText = '';
  for (let i = 0; i < length; i += 1) {
    hideText += chats.charAt(Math.floor(Math.random() * max));
  }

  return hideText;
};

// 拼接 sid + "&" + version + "&" + terminal + "&" + nonceStr + "&" + timestamp 成字符串stringA
const createBaseStr = (timestamp: string, nonceStr: string) => {
  return `${SID}&${VERSION}&${TERMINAL}&${nonceStr}&${timestamp}`;
};

// stringA進行HmacSHA256運算，加密密鑰為你的secret，再將得到的字符串所有字符轉換為大寫，得到signature值。
const createSignature = (timestamp: string, nonceStr: string) => {
  const baseStr = createBaseStr(timestamp, nonceStr);
  const hash = HmacSHA256(baseStr, SECRET);
  return `${hash}`.toUpperCase();
};

// 接口簽名方法
// sid	是	String	應用ID
// version	是	String	應用版本號
// terminal	是	String	終端編碼
// nonceStr	是	String	32位隨機字符串
// signature	是	String	簽名字符串
// timestamp	是	String	當前時間戳（精確到毫秒）
// accessToken	否	String	訪問憑證（除登錄相關接口外必填）

const securitySign = (accessToken: string | null = null) => {
  const timestamp = new Date().getTime().toString();
  const nonceStr = `${nonceStrGenerator()}`;

  const signData: ISecuritySign = {
    sid: SID,
    version: VERSION,
    terminal: TERMINAL,
    nonceStr,
    signature: createSignature(timestamp, nonceStr),
    timestamp,
    accessToken,
  };

  return signData;
};

export default securitySign;
