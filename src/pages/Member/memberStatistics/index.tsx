import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { TCountDataProps, TLineDataProps, TPieDataProps } from '@/utils/constants';
import { defaultCountList, pieListData } from '@/utils/constants';

import type {
  DocumentationExplainDocumentResponse,
  MemberStatisticsGroupResponse,
  MemberStatisticsRegisterDailyResponse,
  MemberStatisticsRegisterResponse,
} from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import CountModule from './CountModule';
import LineChart from './LineChart';
import PieChart from './PieChart';

const Statistics: React.FC = () => {
  const { getMessage } = useLocale();
  const [pageLoading, { setTrue: setPageLoadingTrue, setFalse: setPageLoadingFalse }] =
    useBoolean(false);
  const [topCountList, setTopCountList] = useState<TCountDataProps[]>(defaultCountList);
  const [registerData, setRegisterData] = useState<TLineDataProps[]>([]);
  const [memberPieData, setMemberPieData] = useState<TPieDataProps[]>(pieListData);

  const getCompleteTopRegisterData = () => {
    const topCountListCopy = [...topCountList];
    topCountListCopy[0].label = getMessage('membermanage.memberstatistic.memberCount', '會員人數');
    topCountListCopy[1].label = getMessage(
      'membermanage.memberstatistic.todayregistercount',
      '今日註冊人數',
    );
    topCountListCopy[2].label = getMessage(
      'membermanage.memberstatistic.weekregistercount',
      '本週註冊人數',
    );
    topCountListCopy[3].label = getMessage(
      'membermanage.memberstatistic.monthregistercount',
      '本月註冊人數',
    );
    topCountListCopy[4].label = getMessage(
      'membermanage.memberstatistic.deletedmember',
      '已刪除會員',
    );
    setTopCountList(topCountListCopy);
  };

  const getCompletePieData = () => {
    const pieListDataCopy = [...pieListData];
    pieListDataCopy[0].title = getMessage(
      'membermanage.memberstatistic.memberconsumption',
      '會員消費額',
    );
    pieListDataCopy[0].explain = getMessage(
      'membermanage.memberstatistic.consumptionamount',
      '消費金額',
    );
    pieListDataCopy[1].title = getMessage(
      'membermanage.memberstatistic.memberconsumptiontimes',
      '會員消費次數',
    );
    pieListDataCopy[1].explain = getMessage(
      'membermanage.memberstatistic.consumptiontimes',
      '消費次數',
    );
    pieListDataCopy[2].title = getMessage('membermanage.memberstatistic.memberage', '會員年齡');
    pieListDataCopy[2].explain = getMessage('membermanage.memberstatistic.memberage', '會員年齡');
    pieListDataCopy[3].title = getMessage('membermanage.memberstatistic.membergender', '會員性別');
    pieListDataCopy[3].explain = getMessage(
      'membermanage.memberstatistic.membergender',
      '會員性別',
    );
  };

  const renderPieChartGroup = useCallback(() => {
    return <PieChart data={memberPieData} />;
  }, [memberPieData]);

  const renderTopCountListModule = useCallback(() => {
    return <CountModule data={topCountList} />;
  }, [topCountList]);

  const renderLineChart = useCallback(() => {
    return <LineChart data={registerData} />;
  }, [registerData]);

  // 更改企业
  const handleCompanyChange = () => {
    setPageLoadingTrue();
    const getDocumentationExplainDocument = merchantApi
      .getDocumentationExplainDocument()
      .then((res: IApiResponse<DocumentationExplainDocumentResponse>) => {
        if (!!res?.data) {
          const data = res.data;
          const topCountListCopy = [...topCountList];
          topCountListCopy[0].tip = data?.registerCountExplain;
          topCountListCopy[1].tip = data?.registerCountTodayExplain;
          topCountListCopy[2].tip = data?.registerCountWeekExplain;
          topCountListCopy[3].tip = data?.registerCountMonthExplain;
          topCountListCopy[4].tip = data?.deletedCountExplain;
          setTopCountList(topCountListCopy);
        }
      });

    const getMemberStatisticsRegister = merchantApi
      .getMemberStatisticsRegister()
      .then((res: IApiResponse<MemberStatisticsRegisterResponse>) => {
        if (!!res?.data) {
          const data = res.data;
          const topCountListCopy = [...topCountList];
          topCountListCopy[0].count = data.registerCount;
          topCountListCopy[1].count = data.registerCountToday;
          topCountListCopy[2].count = data.registerCountWeek;
          topCountListCopy[3].count = data.registerCountMonth;
          topCountListCopy[4].count = data.deletedCount;
          setTopCountList(topCountListCopy);
        }
      });

    const getMemberStatisticsRegisterDaily = merchantApi
      .getMemberStatisticsRegisterDaily()
      .then((res: IApiResponse<MemberStatisticsRegisterDailyResponse>) => {
        if (!!res?.data) {
          const data = res.data?.memberDailyRegisterStatisticsList;
          const lineData: any[] = [];
          data.map((item) => {
            const month = item?.month < 10 ? '0' + item?.month : item.month;
            const day = item?.dayOfMonth < 10 ? '0' + item?.dayOfMonth : item.dayOfMonth;
            lineData.push({
              statisticalDate: `${day}/${month}`,
              statisticalCount: item.registerMember,
            });
          });
          const totalRegister = lineData.reduce((r, d) => r + Number(d?.statisticalCount), 0);
          const lineChartData = !!totalRegister ? lineData : [];
          setRegisterData(lineChartData);
        }
      });

    const getMemberStatisticsGroup = merchantApi
      .getMemberStatisticsGroup()
      .then((res: IApiResponse<MemberStatisticsGroupResponse>) => {
        if (!!res?.data) {
          const data = res.data;
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const calculateTotal = (data: any) => {
            const totalCount = data.reduce((r: number, d: any) => r + Number(d?.sectionValue), 0);
            return totalCount;
          };
          const pieListDataCopy: any[] = [...pieListData];
          pieListDataCopy[0].pieData = !!calculateTotal(data?.totalAmountList)
            ? data?.totalAmountList
            : [];
          pieListDataCopy[1].pieData = !!calculateTotal(data?.consumeCountList)
            ? data?.consumeCountList
            : [];
          pieListDataCopy[2].pieData = !!calculateTotal(data?.ageList) ? data?.ageList : [];
          pieListDataCopy[3].pieData = !!calculateTotal(data?.genderList) ? data?.genderList : [];
          setMemberPieData(pieListDataCopy);
        }
      })
      .catch(() => {
        const pieListDataCopy: any[] = [...pieListData];
        pieListDataCopy[0].pieData = [];
        pieListDataCopy[1].pieData = [];
        pieListDataCopy[2].pieData = [];
        pieListDataCopy[3].pieData = [];
        setMemberPieData(pieListDataCopy);
      });
    Promise.all([
      getDocumentationExplainDocument,
      getMemberStatisticsRegister,
      getMemberStatisticsRegisterDaily,
      getMemberStatisticsGroup,
    ]).then(() => {
      setPageLoadingFalse();
    });
  };

  useEffect(() => {
    getCompleteTopRegisterData();
    getCompletePieData();
    handleCompanyChange();
  }, []);

  return (
    <>
      <NormalLayout>
        <Spin spinning={pageLoading}>
          {renderTopCountListModule()}
          {renderLineChart()}
          {renderPieChartGroup()}
        </Spin>
      </NormalLayout>
    </>
  );
};

export default Statistics;
