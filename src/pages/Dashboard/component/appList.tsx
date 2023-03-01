import defaultIcon from '@/assets/images/common/default-app-icon.png';
import emptyIcon from '@/assets/images/common/empty.png';
import prevArrowDeep from '@/assets/svgs/prevArrowDeep.svg';
import prevArrowGrey from '@/assets/svgs/prevArrowGrey.svg';
import rightArrowDeep from '@/assets/svgs/rightArrowDeep.svg';
import rightArrowGrey from '@/assets/svgs/rightArrowGrey.svg';
import useLocale from '@/hooks/useLocale';
import type { ApplicationRecommendationListResponse } from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { BURIEDKEY } from '@/utils/constants';
import { randomRangeId } from '@/utils/utils';
import { Carousel, Typography } from 'antd';
import React, { useState } from 'react';
import { history } from 'umi';
import css from './appList.less';

// 已开通应用程式暂改为应用推荐 保留勿删
// import { merchantApi } from '@/services';
// import type { AuthorizationApplicationResponse } from '@/services/api';
// import type { allowConfigTS } from '@/utils/auth';
// import { getAllowSkipAuthorize } from '@/utils/auth';
// import { APPSTATE, BURIEDKEY } from '@/utils/constants';
// import type { IApiResponse } from '@/utils/request';
// import { openNewTabs, randomRangeId } from '@/utils/utils';
// import { Carousel, message, Typography } from 'antd';
// import { history, useModel } from 'umi';

type TSprops = {
  data: ApplicationRecommendationListResponse;
  showAppListLoad: () => void;
  hideAppListLoad: () => void;
};

const AppList: React.FC<TSprops> = (props) => {
  const intl = useLocale();
  const [flag, setFlag] = useState<boolean>(true);
  // 已开通应用程式暂改为应用推荐 保留勿删
  // const { initialState } = useModel('@@initialState');

  const spArr = (arr: any[], num: number) => {
    const newArr = [];
    for (let i = 0; i < arr.length; ) {
      newArr.push(arr.slice(i, (i += num)));
    }
    return newArr;
  };

  // 右箭头
  const NextArrow = (attrs: any) => {
    const { className, style, onClick } = attrs;
    const clickNext = () => {
      setFlag(!flag);
      onClick();
    };
    return (
      <div className={className} style={{ ...style, display: 'block' }} onClick={clickNext}>
        <img
          key="pre"
          style={{ height: '16px', width: '16px' }}
          src={flag ? rightArrowDeep : rightArrowGrey}
        />
      </div>
    );
  };

  // 左箭头
  const PrevArrow = (attrs: any) => {
    const { className, style, onClick } = attrs;
    const clickPrev = () => {
      setFlag(!flag);
      onClick();
    };
    return (
      <div className={className} style={{ ...style, display: 'block' }} onClick={clickPrev}>
        <img
          key="pre"
          style={{ height: '16px', width: '16px' }}
          src={flag ? prevArrowGrey : prevArrowDeep}
        />
      </div>
    );
  };

  // 跳转应用详情
  const turnAppDetail = (id: string) => {
    history.push(`/main/application/detail/${id}`);
  };

  const onClickApp = (item: any) => {
    turnAppDetail(item.applicationId);
    // 埋点
    const params = {};
    params[BURIEDKEY.NAME] = `${item.name}`;
    event(BuriedPoint.KC_OA_APPS_TAPPED, params);
  };

  // 应用程式 保留勿删
  // const gotoDetail = (data: any) => {
  //   const { applicationId, applicationState, state } = data;
  //   const AllowConfig: allowConfigTS = JSON.parse(
  //     getAllowSkipAuthorize() || '{"account":"","appId":[]}',
  //   );
  //   // console.log('AllowConfig: ', AllowConfig)
  //   if (applicationId && initialState?.currentUser) {
  //     if (APPSTATE.DEACTIVATE !== applicationState && APPSTATE.DEACTIVATE !== state) {
  //       const { companyAccountId, companyId } = initialState.currentUser;
  //       // 判断是否命中已授权缓存，是的话直接进入第三方应用。授权缓存为{"account":"","appId":[]}，其中 account 是 companyAccountId 拼上 companyId, appId 为点击过授权按钮的应用id数组
  //       if (
  //         `${companyAccountId}_${companyId}` === AllowConfig.account &&
  //         AllowConfig.appId.includes(`${applicationId}`)
  //       ) {
  //         // return
  //         props.showAppListLoad();
  //         merchantApi
  //           .getAuthorizationApplication({ applicationId })
  //           .then((res: IApiResponse<AuthorizationApplicationResponse>) => {
  //             props.hideAppListLoad();
  //             if (
  //               res.success &&
  //               res.data &&
  //               res.data.redirectUri &&
  //               initialState?.currentUser?.companyId
  //             ) {
  //               const href = history.createHref({
  //                 pathname: `${res.data.redirectUri}&companyId=${initialState.currentUser.companyId}`,
  //               });
  //               openNewTabs(href);
  //             }
  //           })
  //           .catch(() => {
  //             props.hideAppListLoad();
  //           });
  //       } else {
  //         // 已授權應用緩存裡不包含該應用的id，跳去授權頁
  //         const href = history.createHref({
  //           pathname: `/auth/authorize/${applicationId}`,
  //         });
  //         openNewTabs(href);
  //       }
  //     } else {
  //       // 該應用狀態(state 为 cms 系统操作的状态，applicationState 为 boss 系统操作的状态) !== 已開通(APPSTATE.ACTIVATE)，則提示已禁用
  //       message.error(
  //         `${intl.getMessage('application.detail.DEACTIVATE.message', '此應用已被管理員暫停使用')}`,
  //       );
  //     }
  //   }
  // };

  return (
    <div className={css.appList}>
      <div className={css.title}>{intl.getMessage('dashboard.app', '應用')}</div>
      <div className={css.carouselBox}>
        {props.data && 0 < props.data.length ? (
          <div className={css.carouselWapper}>
            <Carousel
              dots={{ className: css.dots }}
              arrows
              autoplaySpeed={5000}
              prevArrow={<PrevArrow />}
              nextArrow={<NextArrow />}
            >
              {spArr(props.data, 4).map((items: any) => {
                return (
                  <div className={css.carouselItem} key={`key_${randomRangeId(8)}`}>
                    {items.map((item: any) => {
                      return (
                        // 应用程式 保留勿删
                        // <div
                        //   className={css.appItem}
                        //   key={`key_${randomRangeId(8)}`}
                        //   onClick={gotoDetail.bind(null, item)}
                        // >
                        //   <img
                        //     className={css.appIcon}
                        //     src={item.icon || defaultIcon}
                        //     onError={(e: any) => {
                        //       e.target.src = defaultIcon;
                        //       e.target.onerror = null;
                        //     }}
                        //   />
                        //   <div className={css.iconInfo}>
                        //     <Typography.Paragraph
                        //       className={css.name}
                        //       ellipsis={{ rows: 2, tooltip: true }}
                        //     >
                        //       {item.name || ''}
                        //     </Typography.Paragraph>
                        //   </div>
                        // </div>
                        <div
                          className={css.appItem}
                          key={item.applicationId}
                          onClick={() => onClickApp(item)}
                        >
                          <img
                            className={css.appIcon}
                            src={item.icon || defaultIcon}
                            onError={(e: any) => {
                              e.target.src = defaultIcon;
                              e.target.onerror = null;
                            }}
                          />
                          <div className={css.iconInfo}>
                            <div className={css.name}>
                              <Typography.Paragraph
                                className={css.name}
                                ellipsis={{ rows: 1, tooltip: true }}
                              >
                                {item.name || ''}
                              </Typography.Paragraph>
                            </div>
                            <div className={css.info}>
                              <Typography.Paragraph
                                className={css.info}
                                ellipsis={{ rows: 1, tooltip: true }}
                              >
                                {item.description}
                              </Typography.Paragraph>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </Carousel>
          </div>
        ) : (
          <div className={css.emptyBox}>
            <img src={emptyIcon} className={css.emptyImg} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppList;
