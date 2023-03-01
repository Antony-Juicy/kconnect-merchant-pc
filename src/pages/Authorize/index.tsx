import defaultIcon from '@/assets/images/common/default-app-icon.png';
import kconnect from '@/assets/images/common/kconnect.png';
import linkIcon from '@/assets/images/common/linkIcon.png';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';
import type {
  ApplicationDetailResponse,
  AuthorizationApplicationResponse,
  CommonAccountInfoResponse,
} from '@/services/api';
import type { allowConfigTS } from '@/utils/auth';

import {
  getAllowSkipAuthorize,
  removeAllowSkipAuthorize,
  setAllowSkipAuthorize,
} from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { BURIEDKEY, PAGE_SOURCE } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { LoadingOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Card, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './index.less';

const Authorize: React.FC = (props) => {
  const { id } = usePageStatus(props);
  const { initialState } = useModel('@@initialState');
  const [app, setApp] = useState<any>(null);
  const { path = '' } = usePageStatus(props);

  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(true);
  const [imgLoad, { setTrue: showImgLoad, setFalse: hideImgLoad }] = useBoolean(false);
  const [btnLoad, { setTrue: showBtnLoad, setFalse: hideBtnLoad }] = useBoolean(false);

  const init = () => {
    showImgLoad();
    merchantApi
      .getApplicationDetail({ applicationId: id })
      .then((res: IApiResponse<ApplicationDetailResponse>) => {
        if (res.success && res.data) {
          setApp(res.data);
        }
        hideLoading();
      })
      .catch(() => {
        hideLoading();
      });
  };

  const imgOnLoad = () => {
    hideImgLoad();
  };

  const handleCancel = () => {
    // window.location.href = "about:blank";
    // window.close();
    window.opener = null;
    window.open(' ', '_self')?.close();
    event(BuriedPoint.KC_INFO_AUTH_REFUSE_TAPPED);
  };

  useEffect(() => {
    const startTime = new Date().getTime();
    return () => {
      const endTime = new Date().getTime();
      const TimeDiff = Math.trunc((endTime - startTime) / 1000);
      const params = {};
      params[BURIEDKEY.RETENTIONPERIOD] = `${TimeDiff}s`;
      if (!!path) {
        params[BURIEDKEY.NAME] = PAGE_SOURCE[path];
      } else {
        params[BURIEDKEY.NAME] = '';
      }
      event(BuriedPoint.KC_INFO_AUTH_VIEWED, params);
    };
  }, []);

  const handleOk = () => {
    event(BuriedPoint.KC_INFO_AUTH_ACCEPT_TAPPED);
    if (id) {
      showBtnLoad();
      merchantApi
        .getAuthorizationApplication({ applicationId: id })
        .then((res: IApiResponse<AuthorizationApplicationResponse>) => {
          hideBtnLoad();
          if (res.success && res.data && res.data.redirectUri && initialState?.currentUser) {
            const { companyAccountId, companyId } = initialState.currentUser;
            setAllowSkipAuthorize(`${companyAccountId}_${companyId}`, id);
            if (!!path) {
              if (path === '/main/transaction/settlement') {
                event(BuriedPoint.KC_TX_MGMT_SETTLEMENT_DETAILS_VIEWED);
              } else if (path === '/main/transaction/record') {
                event(BuriedPoint.KC_TX_MGMT_TXS_VIEWED);
              } else if (path === '/main/transaction/overview') {
                event(BuriedPoint.KC_TX_MGMT_OA_VIEWED);
              }
              window.location.href = `${res.data.redirectUri}&companyId=${
                initialState.currentUser.companyId
              }&path=${path}&originPath=${encodeURIComponent(
                window.location.origin,
              )}&project=kconenctpc`;
            } else {
              window.location.href = `${res.data.redirectUri}&companyId=${
                initialState.currentUser.companyId
              }&originPath=${encodeURIComponent(window.location.origin)}&project=kconenctpc`;
            }
          }
        })
        .catch(() => {
          hideBtnLoad();
        });
    }
  };

  const checkAllowSkipConfig = (currentUser: CommonAccountInfoResponse) => {
    const allowConfig: allowConfigTS = JSON.parse(
      getAllowSkipAuthorize() || '{"account":"","appId":[]}',
    );
    // console.log('allowConfig: ', allowConfig)
    const { companyAccountId, companyId } = currentUser;
    // 判断是否命中已授权缓存，是的话跳过授权页直接进入第三方应用。授权缓存为{"account":"","appId":[]}，其中 account 是 companyAccountId 拼上 companyId, appId 为点击过授权按钮的应用id数组
    if (
      id &&
      `${companyAccountId}_${companyId}` === allowConfig.account &&
      allowConfig.appId.includes(`${id}`)
    ) {
      // console.log('命中缓存')
      // return
      merchantApi
        .getAuthorizationApplication({ applicationId: id })
        .then((res: IApiResponse<AuthorizationApplicationResponse>) => {
          hideLoading();
          if (res.success && res.data && res.data.redirectUri) {
            window.location.href = `${res.data.redirectUri}&companyId=${companyId}`;
          }
        })
        .catch(() => {
          hideLoading();
        });
    } else {
      if (`${companyAccountId}_${companyId}` !== allowConfig.account) {
        // console.log('删除缓存')
        removeAllowSkipAuthorize();
      }
      // console.log('渲染授权页')
      init();
    }
  };

  useEffect(() => {
    showLoading();
    // console.log('showLoading')
    if (initialState?.currentUser?.companyId && initialState?.currentUser?.companyAccountId) {
      checkAllowSkipConfig(initialState.currentUser);
    }
  }, [initialState?.currentUser]);

  return (
    <div className={styles.wrapper}>
      <Spin size="large" spinning={loading}>
        {null === app ? (
          <div style={{ height: '100vh' }} />
        ) : (
          <>
            <div className={styles.header}>
              <img src={kconnect} className={styles.KConnectIcon} />
            </div>
            <Card className={styles.cardBox}>
              <div className={styles.cardBody}>
                <div className={styles.iconWrapper}>
                  <div className={styles.iconBox}>
                    <img src={kconnect} className={styles.KConnectIcon} />
                  </div>
                  <img src={linkIcon} className={styles.linkIcon} />
                  <div className={styles.iconBox}>
                    {imgLoad && (
                      <div className={styles.imgMask}>
                        <LoadingOutlined style={{ color: '#FFA400', fontSize: '24px' }} />
                      </div>
                    )}
                    {null !== app && (
                      <img
                        onLoad={imgOnLoad}
                        onError={imgOnLoad}
                        src={app?.icon || defaultIcon}
                        className={styles.targetImg}
                      />
                    )}
                  </div>
                </div>
                <div className={styles.txtBox}>
                  <div className={styles.text}>{app?.name || ''} 要求獲取你以下信息</div>
                  <div>* 賬戶名稱</div>
                </div>
                <div className={styles.btnBox}>
                  <div onClick={handleCancel} className={styles.cancel}>
                    拒絕
                  </div>
                  <Button onClick={handleOk} loading={btnLoad} className={styles.ok}>
                    允許
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default Authorize;
