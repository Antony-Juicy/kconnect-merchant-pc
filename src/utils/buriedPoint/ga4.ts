import UA from 'ua-device';
import GA4React from 'ga-4-react';
import { getMerchantBaseInfo, getCompanyInfo } from '@/utils/auth';
const { buriedPoint } = process.env;

const ga4react = new GA4React(buriedPoint, { debug_mode: false });
let location: GeolocationPosition;
function onGetLocation(geolocation: GeolocationPosition) {
  location = geolocation;
}
navigator.geolocation.getCurrentPosition(onGetLocation, null);
/**
 * google analytics 4 埋点工具
 * (https://github.com/unrealmanu/ga-4-react)
 * (https://developers.google.com/analytics/devguides/collection/ga4/event-parameters?client_type=gtag)
 * @param name 事件名字
 * @param para 事件内容{key:value}
 */
const myUa = new UA(window.navigator.userAgent);

export const event = (name: string, parameters?: Object) => {
  let eventOptions = {};
  eventOptions = {
    screen: `${screen.width * window.devicePixelRatio} * ${
      screen.height * window.devicePixelRatio
    }`, //分辨率
    'browser_type ': `${myUa?.browser?.name || ''}`,
    browser_device: `${myUa?.os?.name || ''}`,
    userid: `${getCompanyInfo().companyAccountId || 'null'}`,
    kpaymerchantid: `${getMerchantBaseInfo().merchantCode || 'null'}`, //商户号
    kpaymerchanamecn: `${getMerchantBaseInfo().merchantName || 'null'}`, // 商户中文名称
    kpaymerchanameen: `${getMerchantBaseInfo().merchantEnName || 'null'}`, //商户英文名称
    merchantindustry: `${getMerchantBaseInfo().businessNature || 'null'}`, //业务性质
    area: `${getMerchantBaseInfo().businessAddress || 'null'}`, //营业地区
    country: `${getMerchantBaseInfo().businessCountry || 'null'}`, //国家
    storetype: `${getMerchantBaseInfo().businessShop || 'null'}`, //营业铺位
    location: `${location?.coords?.latitude || '0'}_${location?.coords?.longitude || '0'}`, //定位
  };
  if (parameters != null) {
    eventOptions = Object.assign(eventOptions, parameters);
  }
  if (GA4React.isInitialized()) {
    ga4react.gtag('event', name, eventOptions);
  } else {
    ga4react.initialize().then(
      (ga4) => {
        ga4.gtag('event', name, eventOptions);
      },
      (err) => {
        console.error(err);
      },
    );
  }
};
