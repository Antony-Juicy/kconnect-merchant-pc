import { notification } from 'antd';
import type { LocationDescriptorObject } from 'history';
import moment from 'moment';
import { clearAuthInfo } from './auth';
import { history } from 'umi';
import { getIntl } from '@/hooks/useLocale';
import { DASHBOARD_DATA_SOURCE } from './constants';

let configuration = {};
export const notify = {
  resetConfig: () => {
    configuration = {};
  },
  config: (config: any) => {
    configuration = config;
    return notify;
  },
  success: (message: string, description?: string) => {
    notification.success({
      ...configuration,
      message,
      description,
    });
    notify.resetConfig();
  },
  // 新增成功
  createSuccess: (message?: string, description?: string) => {
    const { getMessage } = getIntl();
    const $message = getMessage('common.create.success', '新增成功');
    notify.success($message, description);
  },
  // 修改成功
  modifySuccess: (message?: string, description?: string) => {
    const { getMessage } = getIntl();
    const $message = getMessage('common.modify.success', '編輯成功');
    notify.success($message, description);
  },
  // 删除成功
  removeSuccess: (message?: string, description?: string) => {
    const { getMessage } = getIntl();
    const $message = getMessage('common.remove.success', '刪除成功');
    notify.success($message, description);
  },
  info: (message: string, description?: string) => {
    notification.info({
      ...configuration,
      message,
      description,
    });
    notify.resetConfig();
  },
  error: (message: string, description?: string) => {
    let desc = description || '';
    let msg = message || '';
    if (message.indexOf('$#$') !== -1) {
      const mess = message.split('$#$');
      if (mess.length > 1) {
        [msg] = mess;
        desc += mess[1];
      }
    }

    notification.destroy();
    notification.error({
      ...configuration,
      message: msg,
      description: desc,
    });
    notify.resetConfig();
  },
  warning: (message: string, description?: string) => {
    notification.warning({
      ...configuration,
      message,
      description,
    });
    notify.resetConfig();
  },
  open: (message: string, description?: string) => {
    notification.open({
      ...configuration,
      message,
      description,
    });
    notify.resetConfig();
  },
};

// 日期控件拒絕選擇今天之後的日期
export const afterRejectingToday = (current: moment.Moment) => {
  return current && current >= moment().endOf('day');
};

// 生成今日标识
export const genDataTodayTag = (type: string = DASHBOARD_DATA_SOURCE.KAPY, time?: number) => {
  if (type === DASHBOARD_DATA_SOURCE.KAPY && moment(time).isSame(moment(), 'day')) {
    return '(今日)';
  }
  return '';
};

// goto login
export const gotoLogin = (
  methods: string = 'push',
  loginOption: LocationDescriptorObject<any> = {},
): void => {
  clearAuthInfo();
  const chatDom = document.querySelector('.widget-visible');
  if (!!chatDom) {
    chatDom.classList.add('widget-Chat');
    chatDom.classList.remove('widget-visible');
  }

  history[methods]({
    pathname: `/user/login`,
    ...loginOption,
  });
};
