import type { DashboardMerchantOverviewRequest } from '../api/index';
import type { IApiRequest } from '@/utils/request';
import { merchantApi } from '..';
import { DASHBOARD_DATA_SOURCE } from '@/utils/constants';

// 交易总览数据
export const getDefinedDashboardMerchantOverview = (
  type: string = DASHBOARD_DATA_SOURCE.KAPY,
  params: DashboardMerchantOverviewRequest,
  config: IApiRequest,
) => {
  const conf = {
    ...config,
    headers: { ...config?.headers, 'data-source': type },
  };
  if (type === DASHBOARD_DATA_SOURCE.KAPY) {
    return merchantApi.getDashboardMerchantOverviewV2(params, conf);
  }
  return merchantApi.getDashboardMerchantOverview(params, conf);
};

// 收入对比、付款方式
export const getDefinedDashboardMerchantTransactionStatistics = (
  type: string = DASHBOARD_DATA_SOURCE.KAPY,
  params: DashboardMerchantOverviewRequest,
  config: IApiRequest,
) => {
  const conf = {
    ...config,
    headers: { ...config?.headers, 'data-source': type },
  };
  if (type === DASHBOARD_DATA_SOURCE.KAPY) {
    return merchantApi.getDashboardMerchantTransactionStatisticsV2(params, conf);
  }
  return merchantApi.getDashboardMerchantTransactionStatistics(params, conf);
};
