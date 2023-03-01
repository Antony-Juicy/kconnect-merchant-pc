import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
// import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
// import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
// import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import UnAccessible from '@/components/403';
import type {
  ApplicationNotificationListResponseDetail,
  ApplicationNotificationListSimpleResponse,
  CommonAccountInfoResponse,
  MerchantInfoBaseResponse,
} from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import type { HeaderViewProps } from '@ant-design/pro-layout/lib/Header';
import defaultSettings from '../config/defaultSettings';
import HeaderBar from './components/Layout/HeaderBar';
import MenuRender from './components/Layout/MenuRender';
import { merchantApi } from './services/index';
import { gotoLogin } from './utils/antdUtils';
import { setCompanyId, setCompanyInfo, setMerchantBaseInfo } from './utils/auth';
import type { IApiResponse } from './utils/request';
import { generateTawkTo, kToString } from './utils/utils';

// const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户資訊比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: CommonAccountInfoResponse;
  currentBaseInfo?: MerchantInfoBaseResponse;
  simpleNotices?: ApplicationNotificationListSimpleResponse;
  loading?: boolean;
  notificationList?: ApplicationNotificationListResponseDetail;
  fetchUserInfo?: () => Promise<
    { info: CommonAccountInfoResponse; baseInfo?: MerchantInfoBaseResponse } | undefined
  >;
}> {
  const whitelist = [
    loginPath,
    '/user/emailLogin',
    '/user/emailLogin/',
    '/user/codeLogin',
    '/user/ResetPassword',
    '/user/ResetPassword/',
    '/user/codeLogin/',
    '/agreement',
    '/agreement/',
    '/user/ChangePassword',
    '/user/ChangePassword/',
  ];

  const { chatUrl } = process.env;
  const initChat = () => {
    const tawk = generateTawkTo(chatUrl ?? '');
    tawk.minimize?.();
    tawk.onChatMaximized = function () {
      event(BuriedPoint.KC_LIVECHAT_TAPPED);
    };
  };

  const fetchUserInfo = async () => {
    let baseInfoResponse: MerchantInfoBaseResponse = {};
    try {
      const baseInfo: IApiResponse<MerchantInfoBaseResponse> =
        await merchantApi.getMerchantInfoBase();
      if (baseInfo.success && baseInfo.data) {
        setMerchantBaseInfo(baseInfo.data);
        baseInfoResponse = baseInfo.data;
      }
    } catch (error) {}

    try {
      const res: IApiResponse<CommonAccountInfoResponse> = await merchantApi.getCommonAccountInfo();

      if (res.success && res.data) {
        setCompanyId(kToString(res.data.companyId));
        setCompanyInfo(res.data);
        const chatDom = document.querySelector('.widget-Chat');
        const IMBox = document.querySelector('.widget-visible');
        // 拿不到dom对象的时候执行IM初始化
        if (!chatDom && !IMBox) {
          initChat();
        }
        if (!!chatDom) {
          chatDom.classList.add('widget-visible');
        }
      }
      return {
        info: res.data,
        baseInfo: baseInfoResponse,
      };
    } catch (error) {
      gotoLogin();
    }
    return undefined;
  };

  // 如果是登录页面，不执行
  if (!whitelist.includes(history.location.pathname)) {
    const userInfo = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser: userInfo?.info,
      currentBaseInfo: userInfo?.baseInfo,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    headerTheme: 'light',
    navTheme: 'light',
    style: { minWidth: '1080px', minHeight: '600px' },
    className: 'scroll-table-wrapper',
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: () => {},
    headerRender: () => <HeaderBar />,
    menuRender: (params: HeaderViewProps & any) => <MenuRender headerView={params} />,

    // openKeys: false,
    // menuItemRender: (menuItemProps, defaultDom) => (<>{MenuItemRender(menuItemProps, defaultDom)}</>),
    // subMenuItemRender: (menuItemProps) => (<>{SubMenuItemRender(menuItemProps)}</>),
    // menuProps: {
    //   expandIcon: <></>,
    // },

    // 自定义 403 页面
    unAccessible: <UnAccessible />,
    // 增加一个 loading 的状态
    childrenRender: (children: any) => {
      if (initialState?.loading) return <PageLoading />;
      return <>{children}</>;
    },
    ...initialState?.settings,
  };
};

// //sentry日志收集
// init({
//   dsn: sentryDSN,
//   tracesSampleRate: 1.0,
// });
