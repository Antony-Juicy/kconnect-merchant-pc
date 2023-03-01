import backTop from '@/assets/images/common/back-top.png';
import emptyIcon from '@/assets/images/common/empty.png';
import NormalLayout from '@/components/Layout/NormalLayout';
import { merchantApi } from '@/services';
import type {
  ApplicationListPageResponse,
  ApplicationOpenedResponse,
  CommonAccountInfoResponse,
} from '@/services/api';
import type { allowConfigTS } from '@/utils/auth';
import {
  getAllowSkipAuthorize,
  getCompanyId,
  removeAllowSkipAuthorize,
  setAllowSkipAuthorize,
} from '@/utils/auth';
import { APPSTATE, APPSTATUS } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { BackTop, Card, List, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import AppItem from './appItem';
import styles from './index.less';

const Application: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [openApp, setOpenApp] = useState<any[]>([]);
  const [appList, setAppList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [page, setPage] = useState<string>('1');
  const [hasMore, setHasMore] = useState<boolean>(false);

  const checkAllowSkipConfig = (currentUser: CommonAccountInfoResponse) => {
    const allowConfig: allowConfigTS = JSON.parse(
      getAllowSkipAuthorize() || '{"account":"","appId":[]}',
    );
    const { companyAccountId, companyId } = currentUser;
    if (allowConfig.account !== `${companyAccountId}_${companyId}`) {
      removeAllowSkipAuthorize();
    }
  };

  const initAppOpened = () => {
    if (appLoading) {
      return;
    }
    setAppLoading(true);
    merchantApi
      .getApplicationOpened({ companyId: (getCompanyId() || '').toString() }, { noThrow: true })
      .then((res: IApiResponse<ApplicationOpenedResponse>) => {
        if (res.success && res.data) {
          const openedApp = res.data;
          // const testObj = openedApp.slice(0, openedApp.length);
          // testObj[1].applicationState = 0;
          setOpenApp(openedApp);
          setAppLoading(false);
          // activateAppSet 是已開通app裡狀態為APPSTATE.ACTIVATE的集合
          const activateApp: any[] = [];
          openedApp.map((item: any) => {
            if (item.applicationState === APPSTATE.ACTIVATE && item.state === APPSTATE.ACTIVATE) {
              activateApp.push(item.applicationId);
            }
          });
          const activateAppSet = new Set(activateApp);
          // allowAppSet 是擁有已授權緩存的app集合
          const allowConfig: allowConfigTS = JSON.parse(
            getAllowSkipAuthorize() || '{"account":"","appId":[]}',
          );
          // const allowApp = allowConfig.appId;
          const allowAppSet = new Set(allowConfig.appId);
          // console.log('接口返回可用app: ', activateApp, '緩存記錄: ', allowApp);
          // 求 activateAppSet 和 allowAppSet 的交集 intersect, 如果 intersect.size < allowAppSet.size, 則更新已授權的緩存，把[...intersect] 更新到 allowConfig.appId
          const intersect = new Set([...allowAppSet].filter((i) => activateAppSet.has(i)));
          // console.log('intersect: ', intersect, intersect.size, allowAppSet.size);
          if (intersect.size < allowAppSet.size && allowConfig.account) {
            setAllowSkipAuthorize(allowConfig.account, [...intersect]);
          }
        }
      })
      .catch(() => {
        setAppLoading(false);
      });
  };

  const initAppList = (pageNumber: string) => {
    if (listLoading) {
      return;
    }
    setListLoading(true);
    merchantApi
      .getApplicationListPage({
        companyId: (getCompanyId() || '').toString(),
        page: pageNumber,
        rows: '20',
      })
      .then((res: IApiResponse<ApplicationListPageResponse>) => {
        if (res.success && res.data && res.data.data) {
          const getListData = [...appList, ...res.data.data];
          const more: boolean = getListData.length < res.data.totalCount;
          setAppList(getListData);
          setHasMore(more);
          setPage(() => (Number(page) + 1).toString());
          setListLoading(false);
        }
      })
      .catch(() => {
        setListLoading(false);
      });
  };

  useEffect(() => {
    initAppOpened();
    initAppList(page);
  }, []);

  useEffect(() => {
    if (initialState?.currentUser?.companyId && initialState?.currentUser?.companyAccountId) {
      checkAllowSkipConfig(initialState.currentUser);
    }
  }, [initialState?.currentUser]);

  const appWrapper = (title: string, type: number, data: any) => {
    return (
      <div className={styles.appWrapper}>
        <div className={styles.title}>{title}</div>
        {APPSTATUS.NOTOPENED === type ? (
          <div id="scrollList" className={styles.scrollAppList}>
            <List
              grid={{ gutter: 24, column: 5 }}
              dataSource={data}
              locale={{
                emptyText: (
                  <>
                    <img src={emptyIcon} className={styles.emptyImg} />
                    <div className={styles.emptyTxt}>更多應用接入中，敬請期待</div>
                  </>
                ),
              }}
              renderItem={(item: any) => (
                <List.Item className={styles.listItem} key={item.applicationId}>
                  <AppItem
                    key={`app_key_${item.applicationId}`}
                    setAppLoading={setAppLoading}
                    type={type}
                    data={item}
                  />
                </List.Item>
              )}
            />
            {0 < data.length && hasMore && (
              <div onClick={initAppList.bind(null, page)} className={styles.moreBtn}>
                更多應用程式
              </div>
            )}
            <BackTop>
              <img src={backTop} className={styles.backTop} />
            </BackTop>
          </div>
        ) : (
          <div className={styles.appList}>
            {0 < data.length && (
              <List
                grid={{ gutter: 24, column: 5 }}
                dataSource={data}
                renderItem={(item: any) => (
                  <List.Item className={styles.listItem} key={item?.applicationId}>
                    <AppItem type={type} data={item} setAppLoading={setAppLoading} />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <NormalLayout>
      <Card className={styles.card}>
        <Spin spinning={appLoading || listLoading}>
          {appWrapper('使用中/已開通', APPSTATUS.OPENED, openApp)}
          {appWrapper('應用中心', APPSTATUS.NOTOPENED, appList)}
        </Spin>
      </Card>
    </NormalLayout>
  );
};

export default Application;
