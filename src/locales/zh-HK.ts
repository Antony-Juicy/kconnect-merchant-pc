import application from './zh-HK/application';
import commodity from './zh-HK/commodity';
import common from './zh-HK/common';
import dashboard from './zh-HK/dashboard';
import error from './zh-HK/error';
import member from './zh-HK/member';
import memberCategory from './zh-HK/memberCategory';
import menu from './zh-HK/menu';
import notice from './zh-HK/notice';
import inventory from './zh-HK/inventory';
import price from './zh-HK/price';

export default {
  'navBar.lang': '語言',
  'layout.user.link.help': '幫助',
  'layout.user.link.privacy': '隱私',
  'layout.user.link.terms': '條款',
  ...common,
  ...menu,
  ...dashboard,
  ...application,
  ...error,
  ...memberCategory,
  ...member,
  ...notice,
  ...commodity,
  ...inventory,
  ...price,
};
