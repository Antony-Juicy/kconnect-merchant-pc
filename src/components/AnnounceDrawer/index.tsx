import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type {
  ApplicationNotificationListResponse,
  ApplicationNotificationListResponseDetail,
  AuthorizationApplicationResponse,
} from '@/services/api';
import type { allowConfigTS } from '@/utils/auth';
import { getAllowSkipAuthorize } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { BURIEDKEY } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { formatUnixTimestamp, openNewTabs } from '@/utils/utils';
import { RightOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Badge, Divider, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';

type TKayAnnounceDrawer = {
  visible: boolean;
  applicationId?: string | number;
  onClose?: any;
};

const AnnounceDrawer: React.FC<TKayAnnounceDrawer> = (props) => {
  const { visible, applicationId, onClose } = props;
  const { listRefresh } = useModel('useNotificationModel');
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);

  const [selected, setSelected] = useState<number>(0);
  const [noticeData, setNoticeData] = useState<any>([]);
  const { initialState } = useModel('@@initialState');
  const { getMessage } = useLocale();
  let startTime = new Date().getTime();

  const gotoDetail = (appId: any) => {
    event(BuriedPoint.KC_OA_NOTIF_GOT_OAPP_TAPPED);
    const AllowConfig: allowConfigTS = JSON.parse(
      getAllowSkipAuthorize() || '{"account":"","appId":[]}',
    );
    if (appId && initialState?.currentUser) {
      const { companyAccountId, companyId } = initialState.currentUser;
      // 判断是否命中已授权缓存，是的话直接进入第三方应用。授权缓存为{"account":"","appId":[]}，其中 account 是 companyAccountId 拼上 companyId, appId 为点击过授权按钮的应用id数组
      if (
        `${companyAccountId}_${companyId}` === AllowConfig.account &&
        AllowConfig.appId.includes(`${appId}`)
      ) {
        // return
        merchantApi
          .getAuthorizationApplication({ applicationId: appId })
          .then((res: IApiResponse<AuthorizationApplicationResponse>) => {
            if (!!res.data && !!res.data.redirectUri && !!initialState?.currentUser?.companyId) {
              const href = history.createHref({
                pathname: `${res.data.redirectUri}&companyId=${initialState.currentUser.companyId}`,
              });
              openNewTabs(href);
            }
          })
          .catch(() => {});
      } else {
        // 已授權應用緩存裡不包含該應用的id，跳去授權頁
        const href = history.createHref({
          pathname: `/auth/authorize/${appId}?path=appNotification`,
        });
        openNewTabs(href);
      }
    }
  };
  const clickAppIcon = async (item: any, index: any) => {
    setNoticeData(noticeData);
    const applicationNotificationIdList: any = [];
    if (!noticeData[index]?.readFlag) {
      noticeData[index].readFlag = 1;
      noticeData[index].notificationList.map((data: any) => {
        applicationNotificationIdList.push(data?.applicationNotificationId);
      });
      await merchantApi.postApplicationNotificationRead(
        {
          applicationNotificationIdList: applicationNotificationIdList,
        },
        {
          noThrow: true,
        },
      );
    }
    showLoading();
    setNoticeData(noticeData);
    setSelected(index);
    hideLoading();
  };

  const getNoticeData = async (refresh?: boolean) => {
    showLoading();
    await merchantApi
      .getApplicationNotificationList()
      .then((res: IApiResponse<ApplicationNotificationListResponse>) => {
        if (!!res?.data?.data) {
          const data: ApplicationNotificationListResponseDetail[] = res.data.data;
          data.map(async (item: any, index) => {
            if (item?.applicationId == applicationId) {
              if (!!refresh) {
                setNoticeData(data);
                return;
              } else {
                setSelected(index);
              }
              const applicationNotificationIdList: any = [];
              if (!item.readFlag) {
                item.notificationList.map((listItem: any) => {
                  applicationNotificationIdList.push(listItem?.applicationNotificationId);
                });
                item.readFlag = 1;
                await merchantApi.postApplicationNotificationRead(
                  { applicationNotificationIdList },
                  {
                    noThrow: true,
                  },
                );
              }
            } else if (!applicationId && index === 0) {
              setNoticeData(data);
            }
          });
          setNoticeData(data);
        }
      });
    hideLoading();
  };

  useEffect(() => {
    if (!!listRefresh) {
      getNoticeData(true);
    }
  }, [listRefresh]);

  useEffect(() => {
    if (!!visible) {
      startTime = new Date().getTime();
      getNoticeData();
    }
  }, [visible]);

  const hideModal = () => {
    const endTime = new Date().getTime();
    const TimeDiff = Math.trunc((endTime - startTime) / 1000);
    const params = {};
    params[BURIEDKEY.RETENTIONPERIOD] = `${TimeDiff}s`;
    event(BuriedPoint.KC_OA_NOTIF_VIEWED, params);
    onClose();
  };

  return (
    <KPayDrawer
      maskClosable={true}
      maskStyle={{ backgroundColor: 'transparent' }}
      title={getMessage('notice.noticedrawer.applicationnotification', '應用通知')}
      width={560}
      onClose={hideModal}
      open={visible}
      className={styles.announceDrawer}
    >
      <Spin spinning={loading}>
        <div className={styles.announceContent}>
          <div className={styles.iconContainer}>
            {!!noticeData &&
              noticeData.map((data: any, index: number) => {
                return (
                  <div
                    key={data.applicationId}
                    onClick={() => {
                      clickAppIcon(data, index);
                    }}
                    className={`${styles.iconItem}  ${
                      index === 0 && selected === index
                        ? styles.iconSelectedFirst
                        : selected === index
                        ? styles.iconSelected
                        : ''
                    }`}
                  >
                    <Badge dot={!data.readFlag ? true : false}>
                      <img src={data.icon} className={styles.imgContainer} alt="" />
                    </Badge>
                  </div>
                );
              })}
          </div>
          <div className={styles.detailContainer}>
            {!!noticeData &&
              noticeData.map((item: any, index: number) => {
                if (selected === index) {
                  return (
                    <>
                      <div
                        key={item.applicationId}
                        onClick={() => {
                          gotoDetail(item.applicationId);
                        }}
                        className={styles.appContainer}
                      >
                        <img src={item.icon} alt="" className={styles.applogo} />
                        <Typography.Paragraph
                          className={styles.appName}
                          ellipsis={{ rows: 2, tooltip: true }}
                        >
                          {item.applicationName}
                        </Typography.Paragraph>

                        <div className={styles.guide}>
                          <p>
                            {getMessage('notice.noticedrawer.gotoapp', '前往應用')}
                            <RightOutlined
                              style={{ color: '#292929', fontSize: 12 }}
                              className={styles.rightArrow}
                            />
                          </p>
                        </div>
                      </div>
                      {!!item.notificationList &&
                        item.notificationList.map((data: any) => {
                          return (
                            <div
                              key={item.applicationNotificationId}
                              className={styles.infoContainer}
                              onClick={() => {
                                gotoDetail(item.applicationId);
                                event(BuriedPoint.KC_OA_NOTIF_DTL_TAPPED);
                              }}
                            >
                              <Typography.Paragraph
                                className={styles.infoTitle}
                                ellipsis={{ rows: 1, tooltip: true }}
                              >
                                {data?.title}
                              </Typography.Paragraph>
                              <p className={styles.infoDate}>
                                {formatUnixTimestamp(data?.notificationTime, 'DD/MM/YYYY HH:mm')}
                              </p>
                              <p className={styles.infoContent}>{data?.content}</p>
                              <Divider />
                            </div>
                          );
                        })}
                      {item?.notificationList.length > 4 ? (
                        <div className={styles.noticeBottomTip}>
                          <p>
                            {getMessage(
                              'notice.noticedrawer.showonlyfivelatestnotifications',
                              '僅顯示五項最新通知',
                            )}
                          </p>
                        </div>
                      ) : (
                        ''
                      )}
                    </>
                  );
                }
              })}
          </div>
        </div>
      </Spin>
    </KPayDrawer>
  );
};

export default AnnounceDrawer;
