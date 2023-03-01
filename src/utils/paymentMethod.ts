import visa from '@/assets/images/payment-method/visa.svg';
import alipay from '@/assets/images/payment-method/alipay.svg';
import wechat from '@/assets/images/payment-method/wechat.svg';
import unionpay from '@/assets/images/payment-method/unionpay.svg';
import jcb from '@/assets/images/payment-method/jcb.svg';
import master from '@/assets/images/payment-method/master.svg';
import dinersclub from '@/assets/images/payment-method/dinersclub.svg';
import quickpass from '@/assets/images/payment-method/quickpass.svg';
import americanexpress from '@/assets/images/payment-method/americanexpress.svg';

export const paymentMethods = {
  VISA: visa,
  MASTERCARD: master,
  CHINAUNIONPAY: unionpay,
  WECHATPAY: wechat,
  ALIPAY: alipay,
  AMERICAEXPRESS: americanexpress,
  DINERSCLUB: dinersclub,
  JCB: jcb,
  UNIONPAYQUICKPASS: quickpass,
};

// 支付渠道映射
export const PAYMENT_CHANNEL = {
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  CHINAUNIONPAY: '中國銀聯',
  JCB: 'JCB',
  AMERICAEXPRESS: 'AMERICANEXPRESS',
  DINERSCLUB: 'DINERSCLUB',
  ALIPAY: '支付寶',
  WECHATPAY: '微信支付',
  UNIONPAYQUICKPASS: '銀聯雲閃付',
};
