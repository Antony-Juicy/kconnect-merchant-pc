import emptyIcon from '@/assets/images/common/empty.png';
import { default as DoubleLeftArrowIcon } from '@/assets/svgs/doubleLeftArrowIcon';
import { default as DoubleRightArrowIcon } from '@/assets/svgs/doubleRightArrowIcon';
import NextIcon from '@/assets/svgs/next-icon';
import PrevIcon from '@/assets/svgs/prev-icon';
import NormalLayout from '@/components/Layout/NormalLayout';
import NoviceGuide from '@/components/NoviceGuide';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type {
  ApplicationCaseListPageResponse,
  ApplicationCaseListPageResponseDetail,
  ApplicationCategoryListResponse,
  ApplicationListPageResponse,
  ApplicationRecommendationListResponse,
} from '@/services/api';
import { getCompanyId } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { BURIEDKEY } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Card, Pagination, Spin, Tabs } from 'antd';
import cx from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { history, useModel } from 'umi';
import Feedback from '../component/FeedBack';
import AppCategory from './AppCategory';
import Case from './Case';
import Style from './index.less';
import Recommend from './Recommend';

export type appRecommendProps = {
  highLight?: string[];
  characteristic?: string;
  applicationId?: string | number;
  icon: string;
  name: string;
  description: string;
  scene: string;
  price: string;
};
export type caseProps = {
  applicationCaseId?: number | string;
} & ApplicationCaseListPageResponseDetail;

export interface categoryListProps {
  name: string;
  applicationCategoryId: string | number;
}

export type categoryAppProps = {
  applicationId: string | number;
  name: string;
  description: string;
  icon: string;
  [key: string]: any;
};

const AppMark: React.FC = () => {
  const { getMessage } = useLocale();
  const { flag, setFlag, lastPage, setLastPage, lastTabId, setLastTabId } = useModel('useLastPage');
  const [appCategoryDict, setAppCategoryDict] = useState<categoryListProps[]>([]);
  const [appCategoryList, setAppCategoryList] = useState<categoryAppProps[]>([]);
  const [caseList, setCaseList] = useState<any[]>([]);
  const [categoryAppTotal, setCategoryAppTotal] = useState<number>(1);
  // *全部应用分页page
  const [currentPage, setCurrentPage] = useState<number>(1);
  // *全部应用tab的activeKey
  const [currentTabKey, setCurrentTabKey] = useState<string | undefined>();
  const [isScrollToAppList, setIsScrollToAppList] = useState<boolean>(false);
  const [guideState, setGuideState] = useState<number>(0);
  const [caseTotal, setCaseTotal] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [firstMaskHeight, setFirstMaskHeight] = useState<string>('275px');
  const [appRecommendList, setAppRecommendList] = useState<appRecommendProps[]>([]);
  const [FBVisible, { setTrue: showFBVisible, setFalse: hideFBVisible }] = useBoolean(false);
  const [
    appRecommendLoading,
    { setTrue: showAppRecommendLoading, setFalse: hideAppRecommendLoading },
  ] = useBoolean(true);
  const [caseLoading, { setTrue: showCaseLoading, setFalse: hideCaseLoading }] = useBoolean(false);
  const [categoryLoading, { setTrue: showCategoryLoading, setFalse: hideCategoryLoading }] =
    useBoolean(false);
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(true);

  //获取账号操作引导记录
  const { operationRefresh, setOperationRefresh } = useModel('useOperationGuidanceModel');

  const ref = useRef<any>();
  const firstRef = useRef<any>();
  const secondRef = useRef<any>();
  const thirdRef = useRef<any>();
  const fourthRef = useRef<any>();
  const fifthRef = useRef<any>();

  const allCategory = {
    applicationCategoryId: '',
    name: getMessage('application.appmark.all', '全部'),
  };

  // 完成应用市场新手教学
  const completeappMarkNoviceGuide = () => {
    event(BuriedPoint.KC_APPCTR_TUTORIA5_FINISH_TAPPED);
    merchantApi
      .postAccountOperateGuideRecordAdd({
        accountOperateGuideType: 'APP_CENTER_TEACHING',
      })
      .then(() => {
        setGuideState(0);
        const operationRefreshCopy = { ...operationRefresh };
        operationRefreshCopy.needAppCenterTeachingFlag = false;
        setOperationRefresh(operationRefreshCopy);
      });
  };

  // 是否需要应用中心教学操作引导
  useEffect(() => {
    if (JSON.stringify(operationRefresh) !== '{}') {
      const { needAppCenterTeachingFlag } = operationRefresh;
      if (needAppCenterTeachingFlag) {
        setGuideState(1);
        event(BuriedPoint.KC_APPCTR_TUTORIA1_VIEWED);
      }
    }
  }, [operationRefresh]);

  // 新手教学切换步骤逻辑
  useEffect(() => {
    switch (guideState) {
      case 1:
        setFirstMaskHeight(`${ref.current?.clientHeight}px`);
        break;
      case 2:
        secondRef.current?.scrollIntoView();
        break;
      case 3:
        thirdRef.current?.scrollIntoView();
        break;
      case 4:
        fourthRef.current?.scrollIntoView();
        break;
      case 5:
        fifthRef.current?.scrollIntoView();
        break;
      default:
        break;
    }
  }, [guideState, ref.current?.clientHeight]);

  // 获取个案列表数据
  const getCaseList = (page: number = 1) => {
    showCaseLoading();
    merchantApi
      .getApplicationCaseListPage({
        page: String(page),
        rows: '4',
      })
      .then((res: IApiResponse<ApplicationCaseListPageResponse>) => {
        setCaseList(res.data.data);
        setCaseTotal(res.data.totalCount);
        hideCaseLoading();
      })
      .catch(() => {
        setCaseList([]);
        setCaseTotal(0);
        hideCaseLoading();
      });
  };

  // 获取应用推荐数据
  const getAppRecommend = () => {
    showAppRecommendLoading();
    merchantApi
      .getApplicationRecommendationList()
      .then((res: IApiResponse<ApplicationRecommendationListResponse>) => {
        res.data.map((item: any) => {
          item.highLight = item.characteristic.split('\n');
        });
        setAppRecommendList(res.data);
        hideAppRecommendLoading();
      });
    hideAppRecommendLoading();
  };

  // 获取应用分类数据
  const getAppCategory = () => {
    merchantApi
      .getApplicationCategoryList()
      .then((res: IApiResponse<ApplicationCategoryListResponse>) => {
        setAppCategoryDict([allCategory, ...res.data]);
      })
      .catch(() => {
        setAppCategoryDict([allCategory]);
      });
  };

  //获取分类应用数据
  const getCategoryAppList = (id?: string, page?: number) => {
    if (!!id) {
      setCategoryId(id);
    } else {
      setCategoryId('');
    }
    showCategoryLoading();

    merchantApi
      .getApplicationListPage({
        companyId: (getCompanyId() || '').toString(),
        applicationCategoryId: flag ? lastTabId : id || '',
        page: flag ? String(lastPage) : String(page || 1),
        rows: '12',
      })
      .then((res: IApiResponse<ApplicationListPageResponse>) => {
        if (flag) {
          setFlag(false);
          setCategoryId(lastTabId);
        } else {
          setLastPage(page || 1);
          setLastTabId(id || '');
        }
        setCurrentPage(flag ? lastPage : page || 1);
        setCurrentTabKey(flag ? lastTabId : id);
        hideCategoryLoading();
        setCategoryAppTotal(res.data.totalCount);
        setAppCategoryList(res.data.data);
      })
      .catch(() => {
        hideCategoryLoading();
        setAppCategoryList([]);
      });
  };

  // 分类分页
  const changeCategoryPage = (page: number) => {
    getCategoryAppList(categoryId, page);
  };

  // 分类类别切换
  const onTabChange = (key: string) => {
    let catecoryName: string = '';
    getCategoryAppList(key);
    // 埋点
    appCategoryDict.map((item) => {
      if (String(item.applicationCategoryId) === key) {
        catecoryName = item.name;
        const params = {};
        params[BURIEDKEY.NAME] = catecoryName;
        event(BuriedPoint.KC_APPCTR_MKTPLACE_ALL_FUNCTION_TAPPED, params);
        return;
      }
    });
  };

  // 跳转应用详情
  const turnAppDetail = (id: string, isRecommend?: boolean) => {
    history.push(`/main/application/detail/${id}${isRecommend ? '?type=recommend' : ''}`);
  };

  // 跳转个案详情页
  const turnCaseDetail = (id: string, caseName: string) => {
    history.push(`/main/application/case/${id}`);
    const params = {};
    params[BURIEDKEY.NAME] = caseName;
    event(BuriedPoint.KC_APPCTR_MKTPLACE_MERCASE_TAPPED, params);
  };

  // 分页双箭头
  const doubleLeft = () => (
    <a className="ant-pagination-item-link">
      <div className="ant-pagination-item-container">
        <span
          role="img"
          aria-label="double-left"
          className="anticon anticon-double-left ant-pagination-item-link-icon"
        >
          <DoubleLeftArrowIcon />
        </span>
        <span className="ant-pagination-item-ellipsis">…</span>
      </div>
    </a>
  );

  // 分页双箭头
  const doubleRight = () => (
    <a className="ant-pagination-item-link">
      <div className="ant-pagination-item-container">
        <span
          role="img"
          aria-label="double-left"
          className="anticon anticon-double-left ant-pagination-item-link-icon"
        >
          <DoubleRightArrowIcon />
        </span>
        <span className="ant-pagination-item-ellipsis">…</span>
      </div>
    </a>
  );

  // 个案分页
  const onCasePageChange = (page: number) => {
    getCaseList(page);
  };

  useEffect(() => {
    if (!flag) {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    }
    setIsScrollToAppList(flag);
    event(BuriedPoint.KC_APPCTR_MKTPLACE_VIEWED);
    showLoading();
    try {
      getAppCategory();
      getAppRecommend();
      getCategoryAppList();
      getCaseList();
      hideLoading();
    } catch {
      hideLoading();
    }
    return () => {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
      setGuideState(0);
    };
  }, []);

  useEffect(() => {
    if (appRecommendList.length > 0 && isScrollToAppList) {
      document.documentElement.scrollTop = ref.current?.scrollHeight;
    }
  }, [appRecommendList, isScrollToAppList]);

  const TabContainer = () => {
    return (
      <Spin spinning={categoryLoading}>
        {appCategoryList.length > 0 ? (
          <div className={Style.tabContainer}>
            <div className={Style.appContainer}>
              {guideState === 3 && (
                <Card ref={thirdRef} className={cx(Style.guideStep, Style.guideThirdStepCard)}>
                  <NoviceGuide
                    title={getMessage('application.appDetail.appdetail', '應用詳情')}
                    subTitle={getMessage(
                      'application.appmark.clicktoviewthedetailedintroductionandinformationofeachapp',
                      '點擊查看每個應用的詳細介紹和資料',
                    )}
                    progress={getMessage('application.appmark.threeoutoffive', '3/5')}
                    nextText={getMessage('application.appmark.nextstep', '下一步')}
                    onNext={() => {
                      setGuideState(4);
                    }}
                  />
                </Card>
              )}
              {guideState === 3 && (
                <div
                  onClick={() => {
                    setGuideState(4);
                  }}
                  className={cx(Style.whiteMask, Style.h72)}
                />
              )}
              {appCategoryList?.map((item: any, index) => {
                return (
                  <AppCategory
                    index={index}
                    guideState={guideState}
                    onClick={() => turnAppDetail(item.applicationId)}
                    key={item.applicationId}
                    data={item}
                  />
                );
              })}
            </div>

            <div className={Style.pagination}>
              <Pagination
                hideOnSinglePage
                jumpPrevIcon={doubleLeft}
                jumpNextIcon={doubleRight}
                prevIcon={<PrevIcon />}
                nextIcon={<NextIcon />}
                className={Style.appCategoryPagination}
                onChange={changeCategoryPage}
                defaultCurrent={1}
                current={currentPage}
                pageSize={12}
                showQuickJumper={true}
                showSizeChanger={false}
                total={categoryAppTotal}
              />
            </div>
          </div>
        ) : (
          <div className={Style.noCategoryApp}>
            <img src={emptyIcon} className={Style.noCategoryImg} alt="" />
          </div>
        )}
      </Spin>
    );
  };
  return (
    <>
      <Spin spinning={loading}>
        <NormalLayout className={Style.wrapper}>
          <Spin spinning={appRecommendLoading}>
            {guideState > 0 && guideState < 6 && <div className={Style.mask} />}
            {appRecommendList.length > 0 ? (
              <Card className={cx(Style.guideFirstCard, guideState === 1 ? Style.guideCard : '')}>
                {guideState === 1 && (
                  <div
                    style={{ height: firstMaskHeight }}
                    className={Style.whiteMask}
                    onClick={() => {
                      setGuideState(2);
                    }}
                  />
                )}
                <div ref={ref} className={cx(Style.noImprove, Style.appRecommend)}>
                  {appRecommendList?.map((item: appRecommendProps) => {
                    return (
                      <Recommend
                        onClick={() => {
                          turnAppDetail(String(item.applicationId), true);
                          event(BuriedPoint.KC_APPCTR_MKTPLACE_HIGHLIGHTAPPS_TAPPED, {
                            appName: `${item?.name}`,
                          });
                        }}
                        key={item.applicationId}
                        data={item}
                      />
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card
                className={cx(Style.appGuideFirst, guideState === 1 ? Style.noviceGuide : '')}
                onClick={() => {
                  if (guideState === 1) {
                    setGuideState(2);
                  }
                }}
              >
                <p className={Style.recommendNoDatatitle}>
                  {getMessage('application.appmark.apprecommend', '應用推薦')}
                </p>
                <div className={Style.imgContainer}>
                  <img src={emptyIcon} className={Style.noGuideFirstImg} alt="" />
                </div>
              </Card>
            )}
          </Spin>
          {guideState === 1 && (
            <Card ref={firstRef} className={Style.guideStep}>
              <NoviceGuide
                title={getMessage('application.appmark.apprecommend', '應用推薦')}
                subTitle={getMessage(
                  'application.appmark.popularappsselectedbykconnect',
                  'KConnect為你精選的熱門應用',
                )}
                progress={getMessage('application.appmark.figthpart', '1/5')}
                nextText={getMessage('application.appmark.nextstep', '下一步')}
                onNext={() => {
                  setGuideState(2);
                }}
              />
            </Card>
          )}
          <Card className={cx(Style.guideFirstCard, guideState === 2 ? Style.guideCard : '')}>
            {guideState === 2 && (
              <Card ref={secondRef} className={cx(Style.guideStep, Style.guideSecondStepCard)}>
                <NoviceGuide
                  title={getMessage('application.appmark.appclassification', '應用分類')}
                  subTitle={getMessage(
                    'application.appmark.allappclassificationarelistedhereandtheindustryandfunctionareclearataglance',
                    '此處羅列了所有應用分類，行業及功能一目了然',
                  )}
                  progress={getMessage('application.appmark.two-fifths', '2/5')}
                  nextText={getMessage('application.appmark.nextstep', '下一步')}
                  onNext={() => {
                    setGuideState(3);
                  }}
                />
              </Card>
            )}
            {guideState === 2 && (
              <div
                onClick={() => {
                  setGuideState(3);
                }}
                className={cx(Style.whiteMask, Style.h450)}
              />
            )}
            <div className={cx(Style.appList)}>
              <p className={Style.title}>
                {getMessage('application.appmark.applyall', '全部應用')}
              </p>
              <Tabs
                className={Style.tab}
                defaultActiveKey="0"
                activeKey={currentTabKey}
                tabPosition="top"
                style={{ height: 220 }}
                onChange={onTabChange}
                items={appCategoryDict.map((_, i) => {
                  return {
                    label: appCategoryDict[i]?.name,
                    key: String(_.applicationCategoryId),
                    children: TabContainer(),
                  };
                })}
              />
            </div>
          </Card>
          <Card className={guideState === 4 ? Style.guideCard : Style.caseCard}>
            {guideState === 4 && (
              <Card ref={fourthRef} className={cx(Style.guideStep, Style.guideThirdStepCard)}>
                <NoviceGuide
                  title={getMessage('application.appmark.casesharing', '個案分享')}
                  subTitle={getMessage(
                    'application.appmark.thecaseofsuccessfulmerchantsmaygiveyoumoreinspiration',
                    '成功商戶的案例，帶給你更多啟發',
                  )}
                  progress={getMessage('application.appmark.fourfifths', '4/5')}
                  nextText={getMessage('application.appmark.nextstep', '下一步')}
                  onNext={() => {
                    setGuideState(5);
                    event(BuriedPoint.KC_APPCTR_TUTORIA5_VIEWED);
                  }}
                />
              </Card>
            )}
            {guideState === 4 && (
              <div
                onClick={() => {
                  setGuideState(5);
                  event(BuriedPoint.KC_APPCTR_TUTORIA5_VIEWED);
                }}
                className={cx(Style.whiteMask, Style.h460)}
              />
            )}
            <div className={Style.caseShare}>
              <p className={Style.title}>
                {getMessage('application.appmark.casesharing', '個案分享')}
              </p>
              <Spin spinning={caseLoading}>
                {caseList.length > 0 ? (
                  <div>
                    <div className={Style.caseContainer}>
                      {caseList.map((item: any) => {
                        return (
                          <Case
                            onClick={() => turnCaseDetail(item.applicationCaseId, item.name)}
                            key={item.applicationCaseId}
                            data={item}
                          />
                        );
                      })}
                    </div>
                    <div className={Style.pagination}>
                      <Pagination
                        hideOnSinglePage
                        prevIcon={<PrevIcon />}
                        nextIcon={<NextIcon />}
                        onChange={onCasePageChange}
                        pageSize={4}
                        simple
                        defaultCurrent={1}
                        total={caseTotal}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={Style.noCase}>
                    <img src={emptyIcon} className={Style.noCaseImg} alt="" />
                  </div>
                )}
                <div className={Style.help}>
                  <Card className={guideState === 5 ? Style.guideCard : Style.card}>
                    {guideState === 5 && (
                      <Card
                        ref={fifthRef}
                        className={cx(Style.guideStep, Style.guideFifthStepCard)}
                      >
                        <NoviceGuide
                          title={getMessage('application.appmark.needhelp', '需要幫助？')}
                          subTitle={getMessage(
                            'application.appmark.formoreinfopleasecontactushere',
                            '如需要更多資訊,可在此聯絡我們',
                          )}
                          progress={getMessage('application.appmark.five-fifths', '5/5')}
                          nextText={getMessage('application.appmark.complete', '完成')}
                          onNext={completeappMarkNoviceGuide}
                        />
                      </Card>
                    )}
                    {guideState === 5 && (
                      <div
                        onClick={completeappMarkNoviceGuide}
                        className={cx(Style.whiteMask, Style.h40)}
                      />
                    )}
                    <div
                      onClick={() => {
                        showFBVisible();
                        event(BuriedPoint.KC_APPCTR_MKTPLACE_FDBKFORM_TAPPED);
                      }}
                      className={Style.noviceGuideHelp}
                    >
                      {getMessage('application.appmark.needhelpcontactus', '需要幫助？聯絡我們')}
                    </div>
                  </Card>
                </div>
              </Spin>
            </div>
          </Card>
        </NormalLayout>
      </Spin>
      <Feedback onCancel={hideFBVisible} open={FBVisible} />
    </>
  );
};

export default AppMark;
