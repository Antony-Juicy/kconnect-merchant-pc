import defaultIcon from '@/assets/images/common/default-app-icon.png';
import NormalLayout from '@/components/Layout/NormalLayout';
import NoviceGuide from '@/components/NoviceGuide';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type {
  ApplicationRecommendationListResponse,
  DashboardMerchantOverviewResponse,
  DashboardMerchantTransactionStatisticsResponse,
  DocumentationHotNewsResponse,
  DocumentationUserExplainResponse,
} from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import {
  BURIEDKEY,
  DASHBOARD_DATA_SOURCE,
  DASHBOARD_DATA_SOURCE_CHANGE_CODE,
} from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { kToString } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import { Card, Col, Row, Skeleton } from 'antd';
import cx from 'classnames';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { notify } from '../../utils/antdUtils';
import { getErrorMsg } from '../../utils/utils';
import AppList from './component/appList';
import Explain from './component/explain';
import News from './component/news';
import Overview from './component/Overview';
import Pay from './component/Pay';
import Update from './component/update';
import css from './index.less';

export const titleNode = () => {
  return (
    <div className={css.titleNode}>
      <img
        className={css.appIcon}
        src={defaultIcon}
        onError={(e: any) => {
          e.target.src = defaultIcon;
          e.target.onerror = null;
        }}
      />
      <div className={css.iconInfo}>
        <div className={css.name}>KPay Merchant PC</div>
        {/* <div className={css.info}>{date}</div> */}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { getMessage } = useLocale();
  const secondRef = useRef<any>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { enterprise } = useModel('useEnterpriseModel');
  const { setOperationRefresh, operationRefresh } = useModel('useOperationGuidanceModel');
  const [overview, setOverview] = useState<string | null>(null);
  const [overviewLoad, { setTrue: showOverviewLoad, setFalse: hideOverviewLoad }] =
    useBoolean(true);
  const [statistics, setStatistics] = useState<DashboardMerchantTransactionStatisticsResponse>(
    {} as DashboardMerchantTransactionStatisticsResponse,
  );
  const [statisticsLoad, { setTrue: showStatisticsLoad, setFalse: hideStatisticsLoad }] =
    useBoolean(true);
  const [explain, setExplain] = useState<DocumentationUserExplainResponse>({});
  const [explainLoad, { setTrue: showExplainLoad, setFalse: hideExplainLoad }] = useBoolean(true);
  const [appList, setAppList] = useState<ApplicationRecommendationListResponse>([]);
  const [guideState, setGuideState] = useState<number>(0);
  const { setAppMenuGuide } = useModel('useNoviceGuideModal');
  const [appListLoad, { setTrue: showAppListLoad, setFalse: hideAppListLoad }] = useBoolean(true);
  const [news, setNews] = useState<any[]>([]);
  const [newsLoad, { setTrue: showNewsLoad, setFalse: hideNewsLoad }] = useBoolean(true);

  // 昨日交易总览数据
  const getOverview = (merchantId: string) => {
    showOverviewLoad();
    merchantApi
      .getDefinedDashboardMerchantOverview(
        initialState?.currentBaseInfo?.dataSource,
        {
          // merchantId: (initialState?.currentUser?.merchantId || '').toString(),
          merchantId,
        },
        { noThrow: true },
      )
      .then((res: IApiResponse<DashboardMerchantOverviewResponse>) => {
        if (res.success && '10000' === `${res.code}` && res.data) {
          setOverview(res.data.tradeAmountDisplay);
          hideOverviewLoad();
        }
        hideOverviewLoad();
      })
      .catch((err) => {
        if (err.code === DASHBOARD_DATA_SOURCE_CHANGE_CODE) {
          const changeSource =
            initialState?.currentBaseInfo?.dataSource === DASHBOARD_DATA_SOURCE.KAPY
              ? DASHBOARD_DATA_SOURCE.OATS
              : DASHBOARD_DATA_SOURCE.KAPY;
          setInitialState({
            ...initialState,
            currentBaseInfo: { ...initialState?.currentBaseInfo, dataSource: changeSource },
          });
          return;
        }
        hideStatisticsLoad();
        notify.error(getErrorMsg(err.code, err));
      });
  };

  // 昨日收入对比、付款方式
  const getStatistics = (merchantId: string) => {
    showStatisticsLoad();
    merchantApi
      .getDefinedDashboardMerchantTransactionStatistics(
        initialState?.currentBaseInfo?.dataSource,
        {
          merchantId,
        },
        { noThrow: true },
      )
      .then((res: IApiResponse<DashboardMerchantTransactionStatisticsResponse>) => {
        if (res.success && res.data) {
          setStatistics(res.data);
        }
        hideStatisticsLoad();
      })
      .catch((err) => {
        setStatistics({} as DashboardMerchantTransactionStatisticsResponse);
        if (err.code === DASHBOARD_DATA_SOURCE_CHANGE_CODE) {
          const changeSource =
            initialState?.currentBaseInfo?.dataSource === DASHBOARD_DATA_SOURCE.KAPY
              ? DASHBOARD_DATA_SOURCE.OATS
              : DASHBOARD_DATA_SOURCE.KAPY;
          setInitialState({
            ...initialState,
            currentBaseInfo: { ...initialState?.currentBaseInfo, dataSource: changeSource },
          });
          return;
        }
        hideStatisticsLoad();
        notify.error(getErrorMsg(err.code, err));
      });
  };

  // 使用说明
  const getExplain = () => {
    showExplainLoad();
    merchantApi
      .getDocumentationUserExplain()
      .then((res: IApiResponse<DocumentationUserExplainResponse>) => {
        if (res.success && '10000' === `${res.code}` && res.data) {
          setExplain(res.data);
        }
        hideExplainLoad();
      })
      .catch(() => {
        hideExplainLoad();
      });
  };

  // 已開通應用
  // 应用程式接口暂换应用推荐接口 不要删,保留
  // const getAppList = (companyId: number) => {
  const getAppList = () => {
    showAppListLoad();

    // 应用程式接口暂换应用推荐接口 不要删.保留
    // merchantApi
    //   .getApplicationOpened({ companyId: companyId.toString() })
    //   .then((res: IApiResponse<ApplicationOpenedResponse>) => {
    //     if (res.success && '10000' === `${res.code}` && res.data) {
    //       const resList = res.data;
    //       resList.splice(6);
    //       setAppList(resList);
    //     }
    //     hideAppListLoad();
    //   })
    //   .catch(() => {
    //     hideAppListLoad();
    //   });
    merchantApi
      .getApplicationRecommendationList()
      .then((res: IApiResponse<ApplicationRecommendationListResponse>) => {
        if (res.success && '10000' === `${res.code}` && res.data) {
          const resList = res.data;
          resList.splice(6);
          setAppList(resList);
        }
        hideAppListLoad();
      })
      .catch(() => {
        hideAppListLoad();
      });
  };

  // 熱點新聞輪播圖
  const getHotNews = () => {
    showNewsLoad();
    merchantApi
      .getDocumentationHotNews()
      .then((res: IApiResponse<DocumentationHotNewsResponse>) => {
        if (res.success && '10000' === `${res.code}` && res.data) {
          setNews(res.data);
        }
        hideNewsLoad();
      })
      .catch(() => {
        hideNewsLoad();
      });
  };

  // 操作引导记录
  useEffect(() => {
    if (JSON.stringify(operationRefresh) !== '{}') {
      const { needDashboardTeachingFlag } = operationRefresh;
      if (needDashboardTeachingFlag) {
        setGuideState(1);
        event(BuriedPoint.KC_OA_TUTORIAL1_VIEWED);
      }
    }
  }, [operationRefresh]);

  useEffect(() => {
    const startTime = new Date().getTime();
    return () => {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
      // 埋点
      const endTime = new Date().getTime();
      const TimeDiff = Math.trunc((endTime - startTime) / 1000);
      const params = {};
      params[BURIEDKEY.RETENTIONPERIOD] = `${TimeDiff}s`;
      event(BuriedPoint.KC_OA_VIEWED, params);
    };
  }, []);

  useEffect(() => {
    if (guideState === 1) {
      // 完成新手引导
      merchantApi.postAccountOperateGuideRecordAdd(
        {
          accountOperateGuideType: 'DASHBOARD_TEACHING',
        },
        { noThrow: true },
      );
      const operationRefreshCopy = { ...operationRefresh };
      operationRefreshCopy.needDashboardTeachingFlag = false;
      setOperationRefresh(operationRefreshCopy);
    }
  }, [guideState]);

  const initData = async () => {
    await getExplain();
    await getHotNews();
  };

  useEffect(() => {
    if (enterprise.companyId) {
      initData();
    }
  }, [enterprise.companyId]);

  useEffect(() => {
    if (initialState?.currentUser?.merchantId) {
      getOverview(kToString(initialState.currentUser.merchantId));
      getStatistics(kToString(initialState.currentUser.merchantId));
    }
    if (initialState?.currentUser?.companyId) {
      // 应用程式接口暂换应用推荐接口 不要删,保留
      // getAppList(initialState?.currentUser?.companyId);
      getAppList();
    }
  }, [
    initialState?.currentUser?.merchantId,
    initialState?.currentBaseInfo?.dataSource,
    initialState?.currentUser?.companyId,
  ]);

  const onGuideStepSecondNext = () => {
    setGuideState(3);
    setAppMenuGuide(true);
    event(BuriedPoint.KC_OA_TUTORIAL3_VIEWED);
  };

  const goNoviceGuideStepSecond = () => {
    setGuideState(2);
    secondRef?.current?.scrollIntoView(false);
  };

  return (
    <>
      <NormalLayout>
        {guideState === 1 || guideState === 2 ? <div className={css.mask} /> : ''}
        <div className={css.dashboardTitle}>
          <div className={css.name}>
            {getMessage('dashboard.welcometokconnect', ' 歡迎使用KConnect')}{' '}
          </div>
          <div className={css.date}>{moment().format('DD/MM/YYYY dddd')}</div>
        </div>
        <div className={css.dashBoard}>
          <Row>
            <Col span={14}>
              <Card className={cx(css.centerContainer, guideState == 1 ? css.guide : '')}>
                {guideState === 1 && (
                  <div onClick={goNoviceGuideStepSecond} className={css.contentMask} />
                )}

                <Card title={null} className={`${css.cardBox} ${css.l1}`}>
                  <Skeleton loading={overviewLoad && statisticsLoad} active>
                    <Overview
                      totalAmount={overview}
                      loading={overviewLoad}
                      startTime={parseInt(kToString(statistics.startTime), 10)}
                      growthRate={statistics.growthRate}
                      displayIncreaseAmount={statistics.displayIncreaseAmount}
                      revenueComparisonList={statistics.revenueComparisonList}
                    />
                  </Skeleton>
                </Card>

                <Card title={null} className={`${css.cardBox} ${css.l2}`}>
                  <Skeleton loading={statisticsLoad} active>
                    <Pay
                      loading={statisticsLoad}
                      startTime={parseInt(kToString(statistics.startTime), 10)}
                      mostPayMethod={statistics.mostPayMethod}
                      paymentMethodList={statistics.paymentMethodList}
                    />
                  </Skeleton>
                </Card>
              </Card>
            </Col>
            <Col span={10}>
              {guideState == 1 && (
                <Card className={css.guideStep}>
                  <NoviceGuide
                    skip={true}
                    onSkip={() => setGuideState(0)}
                    title={getMessage(
                      'dashboard.quickviewoftransactionoverview',
                      ' 快速查看交易概況',
                    )}
                    subTitle={getMessage(
                      'dashboard.dataisupdateddailytoquicklygraspthelatesttransactions',
                      '數據每日更新，快速掌握最新交易',
                    )}
                    progress={getMessage('dashboard.one-third', '1/3')}
                    nextText={getMessage('dashboard.nextstep', '下一步')}
                    onNext={goNoviceGuideStepSecond}
                  />
                </Card>
              )}
              {guideState === 2 && (
                <Card className={cx(css.guideStep, css.guideStepSecond)}>
                  <NoviceGuide
                    skip={true}
                    onSkip={() => setGuideState(0)}
                    title={getMessage(
                      'dashboard.quicklyviewofpopularrecommendedapps',
                      '熱門推薦應用快速查看',
                    )}
                    subTitle={getMessage(
                      'dashboard.hereyoucanquicklybrowsetherecommendedapprecommendedbyus',
                      '在此可快速瀏覽由我們推薦的推薦應用',
                    )}
                    progress={getMessage('dashboard.two-thirds', '2/3')}
                    nextText={getMessage('dashboard.nextstep', '下一步')}
                    onNext={() => onGuideStepSecondNext()}
                  />
                </Card>
              )}
              <Card
                ref={secondRef}
                title={null}
                className={cx(css.cardBox, css.r3, guideState === 2 ? css.guide : '')}
              >
                <Skeleton loading={appListLoad} active>
                  <AppList
                    data={appList}
                    showAppListLoad={showAppListLoad}
                    hideAppListLoad={hideAppListLoad}
                  />
                  {guideState === 2 && (
                    <div onClick={onGuideStepSecondNext} className={css.whiteMask} />
                  )}
                </Skeleton>
              </Card>
              <Card title={null} className={`${css.cardBox} ${newsLoad ? '' : css.r4}`}>
                <Skeleton loading={newsLoad} active>
                  <News data={news} />
                </Skeleton>
              </Card>
              <Card title={null} className={`${css.updateAnnounceBox} ${css.r2}`}>
                <Update />
              </Card>
              <Card title={null} className={`${css.cardBox} ${explainLoad ? '' : css.r1}`}>
                <Skeleton loading={explainLoad} active>
                  <Explain data={explain} />
                </Skeleton>
              </Card>
            </Col>
          </Row>
        </div>
      </NormalLayout>
    </>
  );
};

export default Dashboard;
