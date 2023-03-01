import emptyIcon from '@/assets/images/common/empty.png';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type {
  ApplicationFavouriteListPageResponse,
  ApplicationOpenedResponse,
} from '@/services/api';
import { getCompanyId } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import type { FavAppProps } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Spin, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { history } from 'umi';
import FavApp from './FavApp';
import Style from './index.less';
import OpenApp from './OpenApp';

const MyApp: React.FC = () => {
  const { getMessage } = useLocale();
  const [openAppData, setOpenAppData] = useState<ApplicationOpenedResponse>([]);
  const [favApp, setFavApp] = useState<FavAppProps[]>([]);
  const [favAppPage, setFavAppPage] = useState<number>(1);
  const [favAppTotal, setFavAppTotal] = useState<number>(0);
  const [favAppLoading, { setTrue: showFavAppLoading, setFalse: hideFavAppLoading }] =
    useBoolean(false);
  const [openAppLoading, { setTrue: showOpenAppLoading, setFalse: hideOpenAppLoading }] =
    useBoolean(false);
  const getMyOpenApp = () => {
    showOpenAppLoading();
    merchantApi
      .getApplicationOpened(
        {
          companyId: (getCompanyId() || '').toString(),
        },
        { noThrow: true },
      )
      .then((res: IApiResponse<ApplicationOpenedResponse>) => {
        setOpenAppData(res?.data);
        hideOpenAppLoading();
      })
      .catch(() => {
        hideOpenAppLoading();
      });
  };

  const goAppMark = () => {
    event(BuriedPoint.KC_APPCTR_MYAPPS_MOREAPPS_TAPPED);
    history.push('/main/application/appMark');
  };

  // 获取应用数据
  const getFavApp = (scroll?: boolean) => {
    showFavAppLoading();
    merchantApi
      .getApplicationFavouriteListPage({
        page: scroll ? String(favAppPage + 1) : '1',
        rows: '20',
      })
      .then((res: IApiResponse<ApplicationFavouriteListPageResponse>) => {
        const { data = [], totalCount = 0 } = res?.data;
        data.map((item: any) => {
          item.highLight = item.characteristic.split('\n');
        });
        setFavAppTotal(totalCount);
        if (scroll) {
          const prevFavApp = [...favApp];
          setFavApp([...prevFavApp, ...data]);
          setFavAppPage(favAppPage + 1);
        } else {
          setFavApp(data);
        }
        hideFavAppLoading();
      })
      .catch(() => {
        hideFavAppLoading();
      });
  };

  const scrollFavApp = () => {
    showFavAppLoading();
    getFavApp(true);
  };

  // 跳转应用详情
  const turnAppDetail = (id: string | number) => {
    history.push(`/main/application/detail/${id}?path=myApp`);
  };

  const onTabChange = (key: string) => {
    if (key === '1') {
      event(BuriedPoint.KC_APPCTR_MYAPPS_APPLIED_VIEWED);
    } else {
      getFavApp();
      event(BuriedPoint.KC_APPCTR_MYAPPS_SAVED_VIEWED);
    }
  };

  useEffect(() => {
    getMyOpenApp();
    event(BuriedPoint.KC_APPCTR_MYAPPS_APPLIED_VIEWED);
  }, []);
  return (
    <>
      <NormalLayout className={Style.layout}>
        <div className={Style.wrapper}>
          <p>{getMessage('application.appDetail.myapp', '我的應用')}</p>
          <Tabs className={Style.tab} onChange={onTabChange} defaultActiveKey="1">
            <Tabs.TabPane tab={getMessage('application.myapp.opened', '已開通')} key="1">
              <div className={Style.topContainer}>
                <Spin spinning={openAppLoading}>
                  <div className={Style.openAppList}>
                    {openAppData.length > 0 ? (
                      openAppData.map((item) => {
                        return (
                          <OpenApp
                            onClick={() => turnAppDetail(item.applicationId)}
                            key={item.applicationId}
                            data={item}
                          />
                        );
                      })
                    ) : (
                      <div className={Style.noDataContainer}>
                        <img src={emptyIcon} className={Style.noDataImg} />
                      </div>
                    )}
                  </div>
                </Spin>
              </div>

              <div onClick={goAppMark} className={Style.exporeContainer}>
                {getMessage('application.myapp.exploremoreapp', '探索更多應用 >>')}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={getMessage('application.myapp.collect', '收藏')} key="2">
              <Spin spinning={favAppLoading}>
                <InfiniteScroll
                  hasMore={favApp.length < favAppTotal}
                  dataLength={favApp.length}
                  loader={null}
                  next={scrollFavApp}
                  endMessage={null}
                >
                  <div className={Style.favAppList}>
                    {favApp.length > 0 ? (
                      favApp.map((item) => {
                        return (
                          <FavApp
                            data={item}
                            key={item.applicationId}
                            refresh={getFavApp}
                            onClick={() => turnAppDetail(item.applicationId)}
                          />
                        );
                      })
                    ) : (
                      <div className={Style.noDataFavContainer}>
                        <img src={emptyIcon} className={Style.noDataImg} />
                      </div>
                    )}
                  </div>
                </InfiniteScroll>
              </Spin>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </NormalLayout>
    </>
  );
};

export default MyApp;
