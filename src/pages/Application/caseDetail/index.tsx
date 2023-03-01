import activeStar from '@/assets/svgs/activeStar.svg';
import Star from '@/assets/svgs/star.svg';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';

import type {
  ApplicationCaseInfoResponse,
  ApplicationFavouriteResponse,
  AuthorizationApplicationResponse,
} from '@/services/api';
import type { allowConfigTS } from '@/utils/auth';
import { getAllowSkipAuthorize } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { APPLY_TYPE, APPSUBSTATE, BURIEDKEY } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { formatUnixTimestamp, openNewTabs } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import { Breadcrumb, Button, Spin, Typography } from 'antd';
import cx from 'classnames';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import Apply from '../component/Apply';
import Style from './index.less';

const CaseDetail: React.FC = (props) => {
  const { getMessage } = useLocale();
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);
  const { id } = usePageStatus(props);
  const [modalType, setModalType] = useState<number>(APPLY_TYPE.OPEN);
  const [visible, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [detailData, setDetailData] = useState<ApplicationCaseInfoResponse>();
  const { initialState } = useModel('@@initialState');
  const [appFavId, setAppFavId] = useState<string | null | number>(null);

  const goAppMark = () => {
    history.push('/main/application/appMark');
  };

  const getCaseDetail = () => {
    showLoading();
    merchantApi
      .getApplicationCaseInfo({ applicationCaseId: id })
      .then((res: IApiResponse<ApplicationCaseInfoResponse>) => {
        setDetailData(res.data);
        const { applicationFavouriteId } = res.data;
        setAppFavId(applicationFavouriteId);
      });
    hideLoading();
  };

  // 跳转应用详情
  const turnAppDetail = (appId: string) => {
    history.push(`/main/application/detail/${appId}`);
  };

  const clickOpen = (e: any, type: number) => {
    const element = e.target as Element;
    if (element && element.matches('.primary-btn,span')) {
      setModalType(type);
      showModal();
    }
  };

  const goAppDetail = (e: any, appId: string) => {
    const element = e.target as Element;
    if (element && element.matches('.caseFooter,.caseFooter div')) {
      turnAppDetail(appId);
    }
  };

  const handleCollection = debounce(() => {
    const params = {};
    params[BURIEDKEY.NAME] = detailData?.name;
    if (!!appFavId) {
      merchantApi
        .postApplicationFavouriteRemove({
          applicationFavouriteId: String(appFavId),
          applicationId: detailData?.applicationId || '',
        })
        .then(() => {
          setAppFavId(null);
        });
    } else {
      event(BuriedPoint.KC_APPCTR_APPDTL_SAVE_TAPPED, params);
      merchantApi
        .postApplicationFavourite({ applicationId: detailData?.applicationId || '' })
        .then((res: IApiResponse<ApplicationFavouriteResponse>) => {
          const { applicationFavouriteId } = res.data;
          setAppFavId(applicationFavouriteId);
        });
    }
  }, 500);

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
                pathname: `${res.data.redirectUri}&companyId=${initialState.currentUser.companyId}`,
              });
              openNewTabs(href);
            }
          })
          .catch(() => {});
      } else {
        // 已授權應用緩存裡不包含該應用的id，跳去授權頁
        const href = history.createHref({
          pathname: `/auth/authorize/${appId}?path=caseDetail`,
        });
        openNewTabs(href);
      }
    }
  };

  useEffect(() => {
    getCaseDetail();
    event(BuriedPoint.KC_APPCTR_MKTPLACE_MERCASE_VIEWED);
  }, []);
  return (
    <>
      <Breadcrumb className={Style.breadCrumb} separator=">">
        <Breadcrumb.Item onClick={goAppMark} className={Style.originTitle}>
          {getMessage('application.caseDetail.appstore', '應用商店')}
        </Breadcrumb.Item>
        <Breadcrumb.Item className={Style.nowTitle}>
          {getMessage('application.caseDetail.casedetail', '個案詳情')}
        </Breadcrumb.Item>
      </Breadcrumb>
      <div
        className={cx(Style.caseFooter, 'caseFooter')}
        onClick={(e) => goAppDetail(e, detailData?.applicationId)}
      >
        <div className={Style.leftContainer}>
          <img className={Style.icon} src={detailData?.icon} />
          <div className={Style.infoContainer}>
            <Typography.Paragraph className={Style.name} ellipsis={{ rows: 1, tooltip: true }}>
              {detailData?.name}
            </Typography.Paragraph>
            <Typography.Paragraph
              className={Style.description}
              ellipsis={{ rows: 1, tooltip: true }}
            >
              {detailData?.description}
            </Typography.Paragraph>
          </div>
        </div>
        {detailData?.subscriptionState === APPSUBSTATE.SUBSCRIBED ? (
          <div className={Style.goAppBtnContainer}>
            <Button
              className={cx(Style.openBtn, 'primary-btn')}
              type="primary"
              onClick={() => gotoDetail(detailData.applicationId)}
            >
              {getMessage('application.caseDetail.enterapp', '進入應用')}
            </Button>
          </div>
        ) : (
          <div className={Style.rightContainer}>
            <div className={Style.priceStarContainer}>
              <Typography.Paragraph className={Style.price} ellipsis={{ rows: 1, tooltip: true }}>
                {detailData?.price}
              </Typography.Paragraph>
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
                className="primary-btn"
                onClick={(e) => {
                  clickOpen(e, APPLY_TYPE.TRY);
                  const params = {};
                  params[BURIEDKEY.NAME] = detailData?.name;
                  event(BuriedPoint.KC_APPCTR_MKTPLACE_MERCASE_DEMO_TAPPED, params);
                }}
              >
                {getMessage('application.caseDetail.applyforprobation', '申請試用')}
              </Button>
              <Button
                type="primary"
                onClick={(e) => {
                  clickOpen(e, APPLY_TYPE.OPEN);
                  const params = {};
                  params[BURIEDKEY.NAME] = detailData?.name;
                  event(BuriedPoint.KC_APPCTR_MKTPLACE_MERCASE_APPLY_TAPPED, params);
                }}
                className="primary-btn"
              >
                {getMessage('application.caseDetail.applyforopening', '申請開通')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <NormalLayout className={Style.wrapper}>
        <Spin spinning={loading}>
          <div className={Style.caseDetail}>
            <div className={Style.TitleContainer}>
              <Typography.Paragraph className={Style.title} ellipsis={{ rows: 1, tooltip: true }}>
                {!!detailData?.title ? detailData?.title : detailData?.titleEn || ''}
              </Typography.Paragraph>
            </div>
            <div className={Style.infoContainer}>
              <div className={Style.rightContainer}>
                <img className={Style.icon} src={detailData?.icon} />
                <Typography.Paragraph
                  className={Style.appName}
                  ellipsis={{ rows: 1, tooltip: true }}
                >
                  {detailData?.name || ''}
                </Typography.Paragraph>
                <div>
                  <span className={Style.releaseDate}>
                    {formatUnixTimestamp(String(detailData?.releaseDate), 'DD/MM/YYYY')}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={Style.content}
              dangerouslySetInnerHTML={{
                __html: `${
                  !!detailData?.content ? detailData?.content : detailData?.titleEn || ''
                }`,
              }}
            />
          </div>
        </Spin>
      </NormalLayout>
      <Apply
        visible={visible}
        id={String(detailData?.applicationId)}
        onCancel={hideModal}
        modalType={modalType}
      />
    </>
  );
};

export default CaseDetail;
