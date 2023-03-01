/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { merchantApi } from '@/services';
import { gotoLogin, notify } from '@/utils/antdUtils';
import UA from 'ua-device';
import {
  getAccessToken,
  getCompanyId,
  getExpires,
  getRefreshToken,
  removeAccessToken,
  removeCompanyId,
  removeExpires,
  removeRefreshToken,
  setAccessToken,
  setExpires,
  setRefreshToken,
} from '@/utils/auth';
import securitySign from '@/utils/requestSignature';
import moment from 'moment';
import { getIntl, history } from 'umi';
import type { RequestOptionsInit } from 'umi-request';
import { extend } from 'umi-request';
import {
  FORCE_GOTO_LOGIN,
  NO_OUTPUT_CODES,
  FORCE_RESET_PASSWORD,
  ALLOWTOCHANGEPASSWORD,
} from './constants';
import { getErrorMsg, kToString } from './utils';

const { baseUrl } = process.env;

// 接口請求結構
export type IApiRequest = {
  // 是否自己托管錯誤提示處理
  noThrow?: boolean;
} & RequestOptionsInit;

// 接口響應結構
export type IApiResponse<T = any> = {
  code: string;
  data: T;
  success: boolean;
  message?: string;
  errData?: any;
  timestamp?: string;
};

// 彈出錯誤消息
const errorMessage = (
  error: any,
  showFlag?: boolean,
  req: RequestOptionsInit & { throwMsg?: string } = {},
) => {
  const intl = getIntl();
  const msg = req.throwMsg
    ? req.throwMsg
    : intl.formatMessage({ id: 'error.unknown.begin', defaultMessage: '發生未知錯誤, 請稍後重試' });
  if (showFlag !== true && !NO_OUTPUT_CODES.includes(kToString(error.code))) {
    if (kToString(error.code) === '60057') return;
    notify.error(getErrorMsg(error.code, error, msg));
  }
};

const headerExpand = () => {
  const myUa = new UA(window.navigator.userAgent);
  return {
    // 設置語言
    language: 'zh_HK',
    'terminal-system-info': `${myUa?.os?.name || ''},${myUa?.browser?.name || ''}`,
  };
};
/**
 * 配置request请求时的默认参数
 */
const request = extend({
  prefix: '/api',
  credentials: 'same-origin', // 默认请求是否带上cookie
});

let cacheRequest: any[] = [];
let cacheRejectRequest: any[] = [];
let ispending = false;

// 请求拦截器
request.interceptors.request.use(async (url, options) => {
  let headers: any = {
    ...options.headers,
  };

  const { params }: any = options;

  if (params && params.current && params.pageSize) {
    params.page = params.current;
    params.rows = params.pageSize;
    params.current = undefined;
    params.pageSize = undefined;
  }

  const token = getAccessToken();

  const signatureData = securitySign(token);

  const companyId = getCompanyId();

  if (!signatureData.accessToken) {
    delete signatureData.accessToken;
  }

  if (companyId) {
    headers.companyId = companyId;
  }

  headers = Object.assign(headers, signatureData, headerExpand());

  if (token) {
    // 如果地址是刷新地址繞過判斷
    if (url.includes('token/refresh') || '/api/v1/agreement/read' === url) {
      return {
        url: `${baseUrl}${url}`,
        options: {
          ...options,
          headers,
          params,
        },
      };
    }

    if (getExpires()) {
      if (moment(parseInt(getExpires()!, 10)).diff(moment(), 'second') <= 50) {
        if (!ispending) {
          ispending = true;
          merchantApi
            .postCommonTokenRefresh(
              {
                accessToken: getAccessToken() || '',
                refreshToken: getRefreshToken() || '',
              },
              {
                headers: headers,
                noThrow: true,
              },
            )
            .then((res: any) => {
              ispending = false;
              //60057
              // * refresh 返回60057，应该是走拦截器逻辑，不会走下面注释的逻辑
              // if (FORCE_RESET_PASSWORD.includes(res.code)) {
              //   if (!window.location.href.includes('/user/ChangePassword')) {
              //     history.push(`/user/ChangePassword`);
              //     return;
              //   }
              //   res.code = 10000;
              // }

              if (kToString(res.code) === '10000') {
                const { accessToken, refreshToken, expired } = res.data;
                setAccessToken(accessToken);
                setExpires(moment().add(expired, 'seconds').valueOf());
                setRefreshToken(refreshToken);
                cacheRequest.map((cb) => cb());
                cacheRequest = [];
              } else {
                removeAccessToken();
                removeExpires();
                removeRefreshToken();
                removeCompanyId();
                if (kToString(res.code) === '40001') {
                  notify.error(
                    getIntl().formatMessage({
                      id: 'common.login.out.time',
                      defaultMessage: '你在一定時間內未進行任何操作，請重新登入驗證',
                    }),
                  );
                }

                gotoLogin();
                cacheRejectRequest.map((cb) => cb());
                cacheRejectRequest = [];
              }
            })
            .catch((err) => {
              ispending = false;
              cacheRequest = [];

              removeAccessToken();
              removeExpires();
              removeRefreshToken();
              if (kToString(err.code) === '40001') {
                notify.error(
                  getIntl().formatMessage({
                    id: 'common.login.out.time',
                    defaultMessage: '你在一定時間內未進行任何操作，請重新登錄驗證',
                  }),
                );
              }

              gotoLogin();
              cacheRejectRequest.map((cb) => cb());
              cacheRejectRequest = [];
            });
        }
        return new Promise<void>((resolve, reject) => {
          cacheRequest.push(() => {
            resolve();
          });
          cacheRejectRequest.push(() => {
            reject();
          });
        });
      }
    }
    return {
      url: `${baseUrl}${url}`,
      options: {
        ...options,
        headers,
        params,
      },
    };
  }

  // headers.Authorization = '37CC0A14-E5CF-4C26-88FF-6E34AA0305C6'
  return {
    url: `${baseUrl}${url}`,
    options: {
      ...options,
      headers,
      params,
    },
  };
});

request.interceptors.request.use((url, options) => {
  let headers: any = {
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    const signatureData = securitySign(token);

    if (!signatureData.accessToken) {
      delete signatureData.accessToken;
    }

    headers = Object.assign(headers, signatureData, headerExpand());
  }
  return {
    url: `${url}`,
    options: {
      ...options,
      headers,
    },
  };
});

// 返回拦截器
request.interceptors.response.use(
  async (response, req: RequestOptionsInit & { noThrow?: boolean }) => {
    if (!response) {
      errorMessage(response, req.noThrow, req);
      return Promise.reject(response);
    }

    if (response.ok === false) {
      errorMessage(response, req.noThrow, req);
      return Promise.reject(response);
    }

    if (response.headers.get('Content-Type') === 'application/octet-stream') {
      return response;
    }

    const data = await response.clone().json();

    data.success = !!(kToString(data.code) === '10000') && data.data && !data.data.errorCode;

    if (!data.success) {
      if (response.url.includes('token/refresh')) {
        return Promise.reject(data);
      }

      if (data.data && data.data.errorCode) {
        data.code = data.data.errorCode;
        data.errData = data.data;
      }

      if (FORCE_GOTO_LOGIN.includes(kToString(data.code))) {
        removeAccessToken();
        removeRefreshToken();

        if (!response.url.includes('login')) {
          errorMessage(data, req.noThrow, req);
          gotoLogin();

          return Promise.reject(data);
        }
      }

      //60057
      if (FORCE_RESET_PASSWORD.includes(data.code)) {
        if (ALLOWTOCHANGEPASSWORD.includes(window.location.pathname)) {
          const { accessToken = '' } = data.data
          if (accessToken) {
            setAccessToken(accessToken)
          }
          history.push(`/user/ChangePassword`);
          return data;
        }
        gotoLogin();
      }

      errorMessage(data, req.noThrow, req);

      return Promise.reject(data);
    }

    // 刷新 token
    // if ( response.headers['x-token'] ) {
    //   setToken(response.headers['x-token'])
    // }

    return data;
  },
);

export default request;
