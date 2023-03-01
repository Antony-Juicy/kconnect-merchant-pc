import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = ProSettings & {
  pwa: boolean;
};

const proSettings: DefaultSettings = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#FFA400',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
    defaultOpenAll: true,
    ignoreFlatMenu: true,
  },
  headerHeight: 56,
  title: 'KConnect Merchant PC',
  pwa: false,
  iconfontUrl: '',
};

export type { DefaultSettings };

export default proSettings;
