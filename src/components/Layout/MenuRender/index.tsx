import closeIcon from '@/assets/images/closeIcon.png';
import useLocale from '@/hooks/useLocale';
import type { IEnterpriseProps } from '@/interfaces';
import type { MenuDataItem } from '@ant-design/pro-layout';
import type { HeaderViewProps } from '@ant-design/pro-layout/lib/Header';
import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import type { RouteChildrenProps } from 'react-router';
import { history, Link, useModel } from 'umi';
import iconMap from './IconMap';

import { Ellipsis } from '@/components/Fields';
import NoviceGuide from '@/components/NoviceGuide';
import type { TypeEnterprise } from '@/models/useEnterpriseModel';
import { merchantApi } from '@/services';
import type {
  ApplicationNotificationListLatestResponse,
  AuthorizationApplicationResponse,
  CompanyPageResponse,
} from '@/services/api';
import { getCompanyId, setCompanyInfo } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { PollingPeriodOfNotice } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { kToString, openNewTabs } from '@/utils/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Affix, Menu, notification, Spin, Typography } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import InfiniteScroll from 'react-infinite-scroll-component';
import Style from './index.less';

type TMenuRender = {
  headerView: HeaderViewProps & RouteChildrenProps & any;
};

let latestInterval: NodeJS.Timeout;
let dataInterval: NodeJS.Timeout;

export const MenuItemRender = (menuItemProps: MenuDataItem, defaultDom: React.ReactNode) => {
  const intl = useLocale();
  if (menuItemProps.isUrl || !menuItemProps.path) {
    return defaultDom;
  }
  return (
    <Link className={Style.subMenuItem} key={menuItemProps.name} to={menuItemProps.path}>
      {intl.getMessage(('menu.' + menuItemProps.name) as any, menuItemProps.defaultMessage)}
    </Link>
  );
};

export const SubMenuItemRender = (itemProps: MenuDataItem) => {
  const intl = useLocale();
  return (
    <p className={Style.subMenu}>
      {intl.getMessage(('menu.' + itemProps.name) as any, itemProps.defaultMessage)}
    </p>
  );
};

const MenuRender: React.FC<TMenuRender> = (props) => {
  const [selected, setSelectedKeys] = useState<any[]>([]);
  const [opened, setOpened] = useState<any[]>([]);
  const [openCompany, setOpenCompany] = useState<boolean>(false);
  const [enterpriseInfoList, setEnterpriseInfoList] = useState<IEnterpriseProps[]>([]);
  const [showEndMessage, setShowEndMessage] = useState<boolean>(false);
  const [noticeInfoData, setNoticeInfoData] = useState<any[]>([]);
  const { setListRefresh } = useModel('useNotificationModel');
  const { setOperationRefresh, operationRefresh } = useModel('useOperationGuidanceModel');
  const { appMenuGuide, setAppMenuGuide } = useModel('useNoviceGuideModal');
  // 全局通知消息列表

  const intl = useLocale();
  const {
    route: { routes: menuData },
    location,
  } = props.headerView;

  const { enterprise, updateEnterprise } = useModel('useEnterpriseModel');
  const { initialState, refresh } = useModel('@@initialState');

  const [
    selectCompanyLoading,
    { setTrue: showSelectCompanyLoading, setFalse: hideSelectCompanyLoading },
  ] = useBoolean(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { kpayAppid } = process.env;

  const filterMenuData = (menuData || []).filter((item: any) => {
    if (item.name) {
      return true;
    }
    return false;
  });

  // 菜单名和图标着色
  const getActiveName = (path?: string, icon?: string) => {
    const pathname = location.pathname.replace(/\/+$/, '');

    if (location && path && pathname === path) {
      return icon ? 'active-' + icon : Style.subMenuItemActive;
    }
    return icon ? icon : '';
  };

  // 菜单名和图标着色
  const getSubActiveName = (path?: string, icon?: string) => {
    const pathname = location.pathname.replace(/\/+$/, '');
    if (location && path && pathname.includes(path)) {
      return icon ? 'active-' + icon : Style.subMenuSubItemActive;
    }
    return icon ? icon : '';
  };

  // 菜单名和图标着色
  const getActiveColor = (path?: string) => {
    const pathname = location.pathname.replace(/\/+$/, '');

    if (location && path && pathname === path) {
      return Style.subMenuActiveColor;
    }

    return Style.subMenuInactiveColor;
  };

  // 选中的菜单
  const handleMenuSelected = (e: any) => {
    if (e.key === 'settlementRecord') {
      event(BuriedPoint.KC_TX_MGMT_SETTLEMENT_DETAILS_TAPPED);
    } else if (e.key === 'transactionOverview') {
      event(BuriedPoint.KC_TX_MGMT_OA_TAPPED);
    } else if (e.key === 'transactionRecord') {
      event(BuriedPoint.KC_TX_MGMT_TXS_TAPPED);
    }
    setSelectedKeys([e.key]);
    if (e.key === 'appMark') {
      event(BuriedPoint.KC_APPCTR_MKTPLACE_TAPPED);
    } else if (e.key === 'myApp') {
      event(BuriedPoint.KC_APPCTR_MYAPPS_TAPPED);
    }
  };

  // 菜单展开切换
  const handleMenuOpen = (e: string[]) => {
    setOpened(e);
    const menuList = [...e];
    const lastmenu: string = menuList.pop() || '';
    if (!!lastmenu && (lastmenu === 'myApp' || lastmenu === 'application')) {
      event(BuriedPoint.KC_APPCTR_TAPPED);
    }
  };

  // 获取企业資訊分页列表
  const getEnterpriseInfoList = (pageParam?: number) => {
    const requestPage = pageParam ?? page;
    if (requestPage === 1) {
      showSelectCompanyLoading();
    }
    merchantApi
      .getCompanyPage({ page: `${requestPage}`, rows: '20' })
      .then((res: IApiResponse<CompanyPageResponse>) => {
        hideSelectCompanyLoading();
        if (res.success && res.data) {
          if (requestPage * 20 < res.data.totalCount) {
            setPage(requestPage + 1);
            setHasMore(true);
            setShowEndMessage(false);
          } else {
            setHasMore(false);
            setShowEndMessage(true);
          }
          // 查找返回的条件的id 字段下标
          // const arrIndex: number = findIndex(enterpriseInfoList.concat(res.data.data), (item) => {
          //   return item.companyId === getCompanyId();
          // });

          const arr = (requestPage === 1 ? [] : enterpriseInfoList).concat(res.data.data);
          // const fruits: any = arr.splice(arrIndex, 1);
          // arr.unshift(fruits[0]);

          setEnterpriseInfoList(arr);
        }
      })
      .catch(() => {
        hideSelectCompanyLoading();
      });
  };

  // 商户列表点击展开
  const infoClick = () => {
    setOpenCompany(!openCompany);
  };

  // 切换企业
  const changeEnterprise = (info: TypeEnterprise) => {
    // setPage(1)
    if (kToString(info.companyId) !== getCompanyId()) {
      updateEnterprise(info);
      setCompanyInfo(info);
      refresh();
      setOpenCompany(false);
      history.replace('/main/dashboard');
    }
  };

  const gotoDetail = (appId: any, path?: string) => {
    if (appId && initialState?.currentUser) {
      merchantApi
        .getAuthorizationApplication({ applicationId: appId })
        .then((res: IApiResponse<AuthorizationApplicationResponse>) => {
          if (
            res.success &&
            res.data &&
            res.data.redirectUri &&
            initialState?.currentUser?.companyId
          ) {
            if (!!path) {
              const href = history.createHref({
                pathname: `${res.data.redirectUri}&companyId=${
                  initialState.currentUser.companyId
                }&path=${path}&originPath=${encodeURIComponent(
                  window.location.origin,
                )}&project=kconenctpc`,
              });
              openNewTabs(href);
            } else {
              const href = history.createHref({
                pathname: `${res.data.redirectUri}&companyId=${
                  initialState.currentUser.companyId
                }&originPath=${encodeURIComponent(window.location.origin)}&project=kconenctpc`,
              });
              openNewTabs(href);
            }
          }
        })
        .catch(() => {});
    }
  };

  const openNotification = (item: any) => {
    notification.open({
      message: (
        <Typography.Paragraph
          style={{ wordBreak: 'break-all' }}
          className={Style.noticeTitle}
          ellipsis={{ rows: 1, tooltip: true }}
        >
          <span className={Style.noticeContentContainer}>{item?.applicationName}</span>
        </Typography.Paragraph>
      ),
      onClick: async () => gotoDetail(item.applicationId),
      style: {
        borderRadius: 8,
        padding: 16,
        width: 384,
        height: 126,
        boxShadow: ' 0 0 40 0 rgba(0, 0, 0, 0.20)',
        background: '#FFFFFF',
      },
      key: item.applicationNotificationId,
      closeIcon: <img src={closeIcon} className={Style.closeIcon} />,
      duration: 5,
      className: `${Style.realNotification}`,
      description: (
        <Typography.Paragraph
          style={{ wordBreak: 'break-all' }}
          className={Style.noticeContent}
          ellipsis={{ rows: 3, tooltip: true }}
        >
          <span className={Style.noticeContentContainer}>{item?.content}</span>
        </Typography.Paragraph>
      ),
      icon: (
        <img
          src={item.icon}
          className={Style.noticeIcon}
          style={{ height: '40px', width: '40px' }}
        />
      ),
    });
  };

  // 实时获取通知最新消息
  const getRealTimeNotice = () => {
    merchantApi
      .getApplicationNotificationListLatest({}, { noThrow: true })
      .then((res: IApiResponse<ApplicationNotificationListLatestResponse>) => {
        if (res?.data?.length > 0) {
          setListRefresh(true);
          setNoticeInfoData(res.data);
          setTimeout(() => {
            setListRefresh(false);
          }, 800);
        }
      });
  };
  // 一轮显示两条通知信息
  const showTwoNotificationAround = (data: any) => {
    const noticeListData = data;
    clearInterval(latestInterval);
    const clearNoticeIntervalAround = () => {
      clearInterval(dataInterval);
    };
    dataInterval = setInterval(() => {
      if (noticeListData.length > 1) {
        const aroundData = noticeListData.splice(0, 2);
        aroundData.map((item: any, index: number) => {
          item.applicationNotificationId = `${item.applicationId}${String(
            noticeListData.length + index,
          )}`;
          openNotification(item);
        });
      } else if (noticeListData.length === 1) {
        setNoticeInfoData([]);
        noticeListData[0].applicationNotificationId = `${noticeListData[0].applicationId}${String(
          noticeListData.length - 1,
        )}`;
        openNotification(noticeListData[0]);
        noticeListData.shift();
        clearNoticeIntervalAround();
        latestInterval = setInterval(getRealTimeNotice, PollingPeriodOfNotice);
        return;
      } else {
        setNoticeInfoData([]);
        clearNoticeIntervalAround();
        latestInterval = setInterval(getRealTimeNotice, PollingPeriodOfNotice);
        return;
      }
    }, 6000);
  };

  // 定义轮询接口定时器
  const controlInterval = () => {
    latestInterval = setInterval(getRealTimeNotice, PollingPeriodOfNotice);
  };

  useEffect(() => {
    if (!openCompany) {
      document.body.style.position = 'static';
      setShowEndMessage(false);
    } else {
      document.body.style.position = 'fixed';
      getEnterpriseInfoList(1);
    }
  }, [openCompany]);

  useEffect(() => {
    if (noticeInfoData.length > 0) {
      showTwoNotificationAround(noticeInfoData);
    }
  }, [noticeInfoData]);

  // 完成新手引导
  const onGuideStepAchieved = () => {
    merchantApi
      .postAccountOperateGuideRecordAdd({
        accountOperateGuideType: 'DASHBOARD_TEACHING',
      })
      .then(() => {
        const operationRefreshCopy = { ...operationRefresh };
        operationRefreshCopy.needDashboardTeachingFlag = false;
        setOperationRefresh(operationRefreshCopy);
        setAppMenuGuide(false);
      });
  };

  useEffect(() => {
    if (initialState?.currentUser?.companyId) {
      updateEnterprise(initialState?.currentUser);
    }
  }, [initialState?.currentUser?.companyId]);

  useEffect(() => {
    if (appMenuGuide) {
      setOpened([]);
    }
  }, [appMenuGuide]);

  useEffect(() => {
    controlInterval();
    if (location.pathname) {
      const splitPathname = location.pathname.split('/');
      setOpened([...selected, ...splitPathname]);
    }
    return () => {
      clearInterval(latestInterval);
      clearInterval(dataInterval);
    };
  }, []);

  return (
    <>
      <div>
        {appMenuGuide && <div className={Style.guideHeaderMask} />}
        <div className={cx(Style.closeBackgroud, Style.sideWapperContent)} />
        <aside className={cx(Style.sideWapper, Style.sideWapperContent)}>
          {appMenuGuide && <div className={Style.guideMask} />}
          <div className={Style.sideContent}>
            <div
              className={cx(
                Style.merchnatInfo,
                enterprise.relateCompanyCount > 1 ? Style.merchnatInfoHover : '',
                openCompany ? Style.merchnatInfoActive : '',
              )}
              style={{ cursor: enterprise.relateCompanyCount > 1 ? 'pointer' : 'default' }}
              onClick={() => {
                event(BuriedPoint.KC_SWITCHSTORE_TAPPED);
                if (enterprise.relateCompanyCount > 1) {
                  infoClick();
                }
              }}
            >
              {enterprise.companyAvatar ? (
                <div className={Style.imgAvater}>
                  <img src={enterprise.companyAvatar} />
                </div>
              ) : enterprise.companyName ? (
                <div className={Style.merchnatAvater}>
                  {enterprise.companyName.trimStart().substring(0, 1)}
                </div>
              ) : (
                ''
              )}
              <div className={Style.merchnatName}>
                <Ellipsis style={{ wordBreak: 'break-word' }}>{enterprise.companyName}</Ellipsis>
                {/* <span className={Style.merchnatNameEllipsis}>{enterprise.companyName}</span> */}
              </div>

              {enterprise.relateCompanyCount > 1 &&
                (openCompany ? (
                  <div className={Style.triangleUpWapper}>
                    <span className={Style.invertedTriangleUp} />
                  </div>
                ) : (
                  <div className={Style.triangleWapper}>
                    <span className={Style.invertedTriangle} />
                  </div>
                ))}
            </div>

            <div className={cx(Style.menuWapper, appMenuGuide ? '' : Style.whileNotNoviceGuide)}>
              {(filterMenuData || [])?.map((item: any) => {
                if (!item.hideInMenu) {
                  return (
                    <div key={item.name} className={Style.menuContainer}>
                      {/* <p className={Style.subMenu}>
                        {intl.getMessage(('menu.' + item.name) as any, item.defaultMessage)}
                      </p> */}

                      <Menu
                        mode="inline"
                        onSelect={handleMenuSelected}
                        onOpenChange={handleMenuOpen}
                        openKeys={opened}
                        selectedKeys={selected}
                      >
                        {(item.children || []).map((val: MenuDataItem) => {
                          if (!val.hideInMenu) {
                            if (val.children) {
                              return (
                                <>
                                  {appMenuGuide && val.name == 'application' && (
                                    <>
                                      <div
                                        onClick={onGuideStepAchieved}
                                        className={Style.guideStepThirdContentMask}
                                      />

                                      <div key="noviceGuide" className={Style.guideStepThird}>
                                        <NoviceGuide
                                          title={intl.getMessage(
                                            'dashboard.seemoreapps',
                                            '查看更多應用',
                                          )}
                                          subTitle={intl.getMessage(
                                            'dashboard.moreappconsultationcanbeviewedinappcenter',
                                            '可在應用中心查看更多應用資訊',
                                          )}
                                          progress={intl.getMessage(
                                            'menuRender.three-thirds',
                                            '3/3',
                                          )}
                                          nextText={intl.getMessage('menuRender.complete', '完成')}
                                          onNext={onGuideStepAchieved}
                                        />
                                      </div>
                                    </>
                                  )}
                                  <SubMenu
                                    onTitleClick={() => {
                                      if (val.name === 'transaction') {
                                        event(BuriedPoint.KC_TX_MGMT_TAPPED);
                                      } else if (val.name === 'application') {
                                        event(BuriedPoint.KC_APPCTR_TAPPED);
                                      }
                                    }}
                                    key={val.name}
                                    className={cx(
                                      getSubActiveName(val.path),
                                      appMenuGuide && val.name == 'application'
                                        ? Style.menuGuide
                                        : '',
                                    )}
                                    icon={
                                      val.icon &&
                                      iconMap[
                                        getSubActiveName(val.path, val.icon as string) as string
                                      ]
                                    }
                                    title={`${intl.getMessage(
                                      ('menu.' + `${item.name}.` + val.name) as any,
                                      val.defaultMessage,
                                    )}`}
                                  >
                                    {(val.children || []).map((v: MenuDataItem) => {
                                      if (!v.hideInMenu) {
                                        if (
                                          v.path == '/main/transaction/overview' ||
                                          v.path == '/main/transaction/record' ||
                                          v.path == '/main/transaction/settlement'
                                        ) {
                                          return (
                                            <Menu.Item
                                              key={v.name}
                                              icon={<div style={{ minWidth: '4px' }} />}
                                              className={cx(
                                                Style.subMenuItem,
                                                getActiveName(v.path),
                                              )}
                                            >
                                              <a
                                                className={getActiveColor(v.path)}
                                                key={v.name}
                                                onClick={() => gotoDetail(kpayAppid, v.path)}
                                              >
                                                {intl.getMessage(
                                                  ('menu.' +
                                                    `${item.name}.` +
                                                    `${val.name}.` +
                                                    v.name) as any,
                                                  v.defaultMessage,
                                                )}
                                              </a>
                                            </Menu.Item>
                                          );
                                        } else {
                                          return (
                                            <Menu.Item
                                              key={v.name}
                                              icon={<div style={{ minWidth: '4px' }} />}
                                              className={cx(
                                                Style.subMenuItem,
                                                getActiveName(v.path),
                                              )}
                                            >
                                              <Link
                                                className={getActiveColor(v.path)}
                                                key={v.name}
                                                to={v.path}
                                              >
                                                {intl.getMessage(
                                                  ('menu.' +
                                                    `${item.name}.` +
                                                    `${val.name}.` +
                                                    v.name) as any,
                                                  v.defaultMessage,
                                                )}
                                              </Link>
                                            </Menu.Item>
                                          );
                                        }
                                      }
                                    })}
                                  </SubMenu>
                                </>
                              );
                            }
                            return (
                              <Menu.Item
                                key={val.name}
                                className={cx(Style.subMenuItem, getActiveName(val.path))}
                              >
                                <Link
                                  className={getActiveColor(val.path)}
                                  key={val.name}
                                  to={val.path}
                                >
                                  {val.icon &&
                                    iconMap[getActiveName(val.path, val.icon as string) as string]}
                                  {intl.getMessage(
                                    ('menu.' + `${item.name}.` + val.name) as any,
                                    val.defaultMessage,
                                  )}
                                </Link>
                              </Menu.Item>
                            );
                          }
                          return null;
                        })}
                      </Menu>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </aside>
        {openCompany ? (
          <>
            <div className={Style.mask} onClick={infoClick} />
            <Affix className={Style.affix}>
              <div className={Style.selectMenuWapper}>
                <div
                  id="selectMenuListWapper"
                  className={cx(
                    Style.selectMenuList,
                    appMenuGuide ? '' : Style.whileNotNoviceGuide,
                  )}
                >
                  <Spin spinning={selectCompanyLoading}>
                    <InfiniteScroll
                      className={Style.selectInfiniteScroll}
                      dataLength={enterpriseInfoList.length}
                      next={getEnterpriseInfoList}
                      refreshFunction={getEnterpriseInfoList}
                      hasMore={hasMore}
                      loader={
                        enterpriseInfoList.length > 0 && (
                          <p style={{ height: '100px' }} className={Style.selectStoreLoadTips}>
                            <LoadingOutlined /> &nbsp;
                            {intl.getMessage('menuRender.loading', '加載中……')}
                          </p>
                        )
                      }
                      endMessage={
                        showEndMessage ? (
                          <p className={Style.selectStoreLoadTips}>
                            {enterpriseInfoList?.length > 10 &&
                              intl.getMessage('dashboard.select.store.end', '已經到底啦～')}
                          </p>
                        ) : (
                          <p className={Style.selectStorebegin} style={{ height: '72px' }}>
                            {''}
                          </p>
                        )
                      }
                      scrollableTarget="selectMenuListWapper"
                    >
                      {enterpriseInfoList.map((item: any, index: number) => (
                        <div
                          className={cx(
                            Style.item,
                            item.companyId === getCompanyId() ? Style.itemActive : '',
                          )}
                          key={item.companyId}
                          onClick={() => changeEnterprise(item)}
                        >
                          {item.companyAvatar ? (
                            <img
                              src={item.companyAvatar}
                              className={Style.merchnatAvater}
                              alt="login"
                              onError={() => {
                                item.companyAvatar = undefined;
                                enterpriseInfoList[index] = item;
                                setEnterpriseInfoList([...enterpriseInfoList]);
                              }}
                            />
                          ) : (
                            <div className={Style.merchnatAvater}>
                              {item.companyName.trimStart().substring(0, 1)}
                            </div>
                          )}
                          <div className={Style.merchnatName}>
                            <Ellipsis style={{ wordBreak: 'break-word' }}>
                              {item.companyName}
                            </Ellipsis>
                          </div>
                        </div>
                      ))}
                    </InfiniteScroll>
                  </Spin>
                </div>
              </div>
            </Affix>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default MenuRender;
