import emptyIcon from '@/assets/images/common/empty.png';
import activeStar from '@/assets/svgs/activeStar.svg';
import placeholderBg from '@/assets/svgs/grayEmptyBg.svg';
import nextArrow from '@/assets/svgs/nextArrow.svg';
import prevArrow from '@/assets/svgs/prevArrow.svg';
import coverloadBg from '@/assets/svgs/screenBg.svg';
import Star from '@/assets/svgs/star.svg';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';

import { KPayImageGroup } from '@/components/Fields';
import type {
  ApplicationDetailResponse,
  ApplicationFavouriteResponse,
  AuthorizationApplicationResponse,
} from '@/services/api';
import type { allowConfigTS } from '@/utils/auth';
import { getAllowSkipAuthorize } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { APPLY_TYPE, APPSTATE, APPSUBSTATE, BURIEDKEY } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { openNewTabs } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import { Breadcrumb, Button, Carousel, Spin, Typography } from 'antd';
import cx from 'classnames';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import Apply from '../component/Apply';
import Feedback from '../component/FeedBack';
import Style from './index.less';
import Similar from './Similar';

export type similarAppProps = {
  applicationId?: number | undefined;
  icon?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  price?: string | undefined;
  state?: number | undefined;
  subscriptionState?: number | undefined;
};

export type imgUrlProps = {
  imageUrl?: string;
};

const AppDetail: React.FC = (props: any) => {
  const { id, type } = usePageStatus(props);

  const { getMessage } = useLocale();
  // const [maskWidth, setMaskWidth] = useState<string>('0px');
  //* 商品圖片列表內容
  const [imgData, setImgData] = useState<any[] | undefined>(undefined);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [detailData, setDetailData] = useState<ApplicationDetailResponse>();
  const [aboutContent, setAboutContent] = useState<string>('');
  const [modalType, setModalType] = useState<number>(APPLY_TYPE.OPEN);
  const [appFavId, setAppFavId] = useState<string | undefined | number>(undefined);
  const [similarApp, setSimilarApp] = useState<similarAppProps[] | undefined>([]);
  const [imgList, setImgList] = useState<imgUrlProps[] | undefined>(undefined);
  const [visible, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [isOpen, { setTrue: isOpenTrue, setFalse: isOpenFalse }] = useBoolean(false);
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);
  const { initialState } = useModel('@@initialState');
  const { setFlag } = useModel('useLastPage');
  const [FBVisible, { setTrue: showFBVisible, setFalse: hideFBVisible }] = useBoolean(false);
  const { path = '' } = usePageStatus(props);
  const goPrev = () => {
    if (path === 'myApp') {
      history.push('/main/application/myApp');
    } else {
      history.goBack();
    }
  };

  const clickOpen = (applyType: number) => {
    setModalType(applyType);
    showModal();
  };

  const gotoDetail = (appId: any) => {
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
                pathname: `${res.data.redirectUri}&companyId=${
                  initialState.currentUser.companyId
                }&originPath=${encodeURIComponent(window.location.origin)}&project=kconenctpc`,
              });
              openNewTabs(href);
            }
          })
          .catch(() => {});
      } else {
        // 已授權應用緩存裡不包含該應用的id，跳去授權頁
        const href = history.createHref({
          pathname: `/auth/authorize/${appId}?path=appDetail`,
        });
        openNewTabs(href);
      }
    }
  };

  // 跳转应用详情
  const turnAppDetail = (similarId: string) => {
    history.replace(`/main/application/detail/${similarId}`);
  };

  const handleCollection = debounce(() => {
    const params = {};
    params[BURIEDKEY.NAME] = detailData?.name;
    if (!!appFavId) {
      merchantApi
        .postApplicationFavouriteRemove({
          applicationFavouriteId: String(appFavId),
          applicationId: id,
        })
        .then(() => {
          setAppFavId(undefined);
        });
    } else {
      event(BuriedPoint.KC_APPCTR_APPDTL_SAVE_TAPPED, params);
      merchantApi
        .postApplicationFavourite({ applicationId: id })
        .then((res: IApiResponse<ApplicationFavouriteResponse>) => {
          const { applicationFavouriteId } = res.data;
          setAppFavId(applicationFavouriteId);
        });
    }
  }, 300);

  const getDetail = () => {
    showLoading();
    merchantApi
      .getApplicationDetail({ applicationId: id })
      .then((res: IApiResponse<ApplicationDetailResponse>) => {
        const {
          state,
          applicationState,
          applicationInstructionList = [],
          applicationFavouriteId,
          imageUrlList,
          similarApplicationList = [],
        } = res.data;
        if (state == APPSUBSTATE.SUBSCRIBED && applicationState == APPSTATE.ACTIVATE) {
          isOpenTrue();
        } else {
          isOpenFalse();
        }
        setDetailData(res.data);
        setImgList(imageUrlList);
        setAppFavId(applicationFavouriteId);
        setSimilarApp(similarApplicationList);
        setImgData(imageUrlList);
        const aboutHK: any = applicationInstructionList.find((item: any) => {
          return item.language == 'zh_HK';
        });
        const aboutEN: any = applicationInstructionList.find((item: any) => {
          return item.language == 'en_US';
        });

        setAboutContent(
          !!aboutHK?.instructionContent ? aboutHK?.instructionContent : aboutEN?.instructionContent,
        );
        hideLoading();
      })
      .catch(() => {
        history.push('/main/application/appMark');
        hideLoading();
      });
  };

  //* 查看圖片
  const checkImg = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const element = e.target as Element;
    if (element && element.matches('.price-record-img-box,.price-record-img-box *')) {
      // 點擊圖片才調接口
      const chatDom = document.querySelector('.widget-visible');
      if (!!chatDom) {
        chatDom.classList.add('widget-Chat');
        chatDom.classList.remove('widget-visible');
      }
      getDetail();
    }
  };

  const afterChange = (current: number) => {
    setCurrentSlide(current);
  };

  // const getCurrentWidth = () => {
  //   console.log('resize ref: ', carouselRef.current.offsetWidth);
  //   setMaskWidth(`${(carouselRef.current.offsetWidth - 768) / 2}px`);
  // }

  useEffect(() => {
    setSimilarApp([]);
    getDetail();
    event(BuriedPoint.KC_APPCTR_APPDTL_NOTAPPLY_VIEWED);
  }, [id]);

  useEffect(() => {
    history.block((location, action) => {
      // console.log('action: ', action, 'type: ', type);
      // * type = recommend 表示是从首页的推荐列表进入，则返回不需要滚动到应用列表，也不用保留页码和tab
      if (action === 'POP' && location.pathname.includes('/appMark') && !!!type) {
        setFlag(true);
      } else {
        setFlag(false);
      }
    });
    // console.log('ref: ', carouselRef.current.offsetWidth);
    // setMaskWidth(`${(carouselRef.current.offsetWidth - 768) / 2}px`);
    // window.addEventListener('resize', getCurrentWidth);
    return () => {
      history.block(() => {});
      // window.removeEventListener('resize', getCurrentWidth);
    };
  }, []);

  return (
    <div>
      <Breadcrumb className={Style.breadCrumb} separator=">">
        <Breadcrumb.Item onClick={goPrev} className={Style.originTitle}>
          {path === 'myApp'
            ? getMessage('application.appDetail.myapp', '我的應用')
            : getMessage('application.caseDetail.appstore', '應用商店')}
        </Breadcrumb.Item>
        <Breadcrumb.Item className={Style.nowTitle}>
          {getMessage('application.appDetail.appdetail', '應用詳情')}
        </Breadcrumb.Item>
      </Breadcrumb>
      <NormalLayout className={Style.wrapper}>
        <Spin spinning={loading}>
          <div className={Style.appDetail}>
            <div className={Style.topContainer}>
              <div className={Style.topLeftContainer}>
                <img src={detailData?.icon} className={Style.img} alt="" />
                <div className={Style.infoContainer}>
                  <Typography.Paragraph
                    className={Style.name}
                    ellipsis={{ rows: 1, tooltip: true }}
                  >
                    {detailData?.name}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    className={Style.description}
                    ellipsis={{ rows: 1, tooltip: true }}
                  >
                    {detailData?.description}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    className={Style.companyName}
                    ellipsis={{ rows: 1, tooltip: true }}
                  >
                    <a target={`_blank`} href={detailData?.applicationUri ?? ''}>
                      {detailData?.developerCompanyName}
                    </a>
                  </Typography.Paragraph>
                </div>
              </div>
              {!!isOpen ? (
                <div className={Style.enterApp}>
                  <Button
                    type="primary"
                    onClick={() => {
                      gotoDetail(id);
                      const params = {};
                      params[BURIEDKEY.NAME] = detailData?.name;
                      event(BuriedPoint.KC_APPCTR_APPDTL_APPLIED_LAUNCH_TAPPED, params);
                    }}
                    className={Style.enterAppbtn}
                  >
                    {getMessage('application.caseDetail.enterapp', '進入應用')}
                  </Button>
                </div>
              ) : (
                <div className={Style.topRightContainer}>
                  <div className={Style.priceStarContainer}>
                    <div className={Style.priceContainer}>
                      <Typography.Paragraph
                        className={Style.price}
                        ellipsis={{ rows: 1, tooltip: true }}
                      >
                        {detailData?.price}
                      </Typography.Paragraph>
                    </div>
                    <div className={Style.starContainer}>
                      <img
                        src={appFavId ? activeStar : Star}
                        className={Style.starImg}
                        onClick={handleCollection}
                      />
                    </div>
                  </div>

                  <div className={Style.btnContainer}>
                    <Button
                      type="default"
                      onClick={() => {
                        clickOpen(APPLY_TYPE.TRY);
                        const params = {};
                        params[BURIEDKEY.NAME] = detailData?.name;
                        event(BuriedPoint.KC_APPCTR_APPDTL_DEMO_TAPPED, params);
                      }}
                      className={Style.btn}
                    >
                      {getMessage('application.caseDetail.applyforprobation', '申請試用')}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        clickOpen(APPLY_TYPE.OPEN);
                        const params = {};
                        params[BURIEDKEY.NAME] = detailData?.name;
                        event(BuriedPoint.KC_APPCTR_APPDTL_NOTAPPLY_APPLY_TAPPED, params);
                      }}
                      className={Style.btn}
                    >
                      {getMessage('application.caseDetail.applyforopening', '申請開通')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className={Style.screenShot}>
              <p className={Style.title}>
                {getMessage('application.appDetail.programscreenshot', '程序截圖')}
              </p>
              <div>
                {imgList && imgList?.length > 0 ? (
                  <Carousel
                    className={cx(
                      Style.swipper,
                      imgList && imgList?.length === 1 ? Style.oneImg : '',
                    )}
                    dots={{ className: Style.dots }}
                    arrows={true}
                    // autoplay
                    autoplaySpeed={5000}
                    prevArrow={<img src={prevArrow} />}
                    nextArrow={<img src={nextArrow} />}
                    // variableWidth
                    centerMode
                    afterChange={afterChange}
                  >
                    {imgList &&
                      imgList?.length > 0 &&
                      imgList.map((item) => {
                        return (
                          <div
                            className={`${Style.imgBox} price-record-img-box`}
                            onClick={(e) => checkImg(e)}
                            key={item.imageUrl}
                          >
                            <KPayImageGroup
                              cover={item.imageUrl || ''}
                              id="appDetailImgId"
                              keyWord="imageUrl"
                              imgData={imgData ?? []}
                              reset={setImgData}
                              defaultIcon={coverloadBg}
                              height={432}
                              width="auto"
                              current={currentSlide}
                              placeholder={
                                <Spin spinning={true}>
                                  <img src={coverloadBg} />
                                </Spin>
                              }
                            />
                          </div>
                        );
                      })}
                  </Carousel>
                ) : (
                  <div className={Style.noscreenshot}>
                    <img src={placeholderBg} className={Style.emptyImg} />
                  </div>
                )}
              </div>
            </div>

            <div className={Style.about}>
              <p className={Style.title}>{getMessage('application.appDetail.about', '關於')}</p>
              <div
                className={Style.content}
                dangerouslySetInnerHTML={{ __html: `${aboutContent}` }}
              />
            </div>
          </div>
          <div className={Style.similarApp}>
            <p className={Style.title}>
              {getMessage(
                'application.appDetail.youmayalsobeinsterestedintheseapp',
                '你可能也對這些應用有興趣',
              )}
            </p>
            <div className={Style.appContainer}>
              {(similarApp && similarApp.length > 0) ? (
                similarApp.map((item) => {
                  return (
                    <Similar
                      onClick={() => {
                        turnAppDetail(String(item.applicationId || ''));
                        const params = {};
                        params[BURIEDKEY.NAME] = item.name;
                        const appState =
                          item?.subscriptionState === APPSUBSTATE.SUBSCRIBED &&
                          item?.state === APPSTATE.ACTIVATE;
                        params[BURIEDKEY.APPSTATE] = appState;
                        event(BuriedPoint.KC_APPCTR_APPDTL_SIMILARAPPS_NAME_TAPPED, params);
                      }}
                      key={item.applicationId || ''}
                      data={item}
                    />
                  );
                })
              ) : (
                <img src={emptyIcon} className={Style.noSimlarImg} alt="" />
              )}
              {}
            </div>
            <div
              onClick={() => {
                showFBVisible();
                const params = {};
                params[BURIEDKEY.NAME] = detailData?.name;
                params[BURIEDKEY.APPSTATE] = isOpen;
                event(BuriedPoint.KC_APPCTR_APPDTL_FDBKFORM_TAPPED, params);
              }}
              className={Style.help}
            >
              {getMessage(
                'application.appDetail.youmayalsobeinsterestedintheseapp',
                '如有意見，請聯絡我們',
              )}
            </div>
          </div>
        </Spin>
      </NormalLayout>

      <Apply visible={visible} id={id} onCancel={hideModal} modalType={modalType} />

      <Feedback onCancel={hideFBVisible} open={FBVisible} />
    </div>
  );
};

export default AppDetail;
