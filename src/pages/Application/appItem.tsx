import defaultIcon from '@/assets/images/common/default-app-icon.png';
import { Ellipsis } from '@/components/Fields';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { AuthorizationApplicationResponse } from '@/services/api';
import type { allowConfigTS } from '@/utils/auth';
import { getAllowSkipAuthorize } from '@/utils/auth';
import { APPSTATE, APPSTATUS } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { openNewTabs } from '@/utils/utils';
import { message, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';
interface appItemProps {
  type: number;
  data: any;
  setAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ItemProps {
  label: string;
  value: string;
}

// interface visibleRangeType {
//   accountIdList: string[],
//   departmentIdList: string[]
// }

const testOptions: ItemProps[] = [];

for (let i = 10; i < 36; i++) {
  const value = i.toString(36) + i;
  testOptions.push({
    label: `Label: ${value}`,
    value,
  });
}

const AppItem: React.FC<appItemProps> = (props) => {
  const { initialState } = useModel('@@initialState');

  const intl = useLocale();

  const gotoDetail = (data: any) => {
    // console.log('type: ', props.type)
    // return
    const { applicationId, applicationState, state, applicationSubscriptionId } = data;
    if (APPSTATUS.OPENED === props.type) {
      const AllowConfig: allowConfigTS = JSON.parse(
        getAllowSkipAuthorize() || '{"account":"","appId":[]}',
      );
      // console.log('AllowConfig: ', AllowConfig)
      if (applicationId && initialState?.currentUser) {
        if (APPSTATE.DEACTIVATE !== applicationState && APPSTATE.DEACTIVATE !== state) {
          const { companyAccountId, companyId } = initialState.currentUser;
          // 判断是否命中已授权缓存，是的话直接进入第三方应用。授权缓存为{"account":"","appId":[]}，其中 account 是 companyAccountId 拼上 companyId, appId 为点击过授权按钮的应用id数组
          if (
            `${companyAccountId}_${companyId}` === AllowConfig.account &&
            AllowConfig.appId.includes(`${applicationId}`)
          ) {
            // return
            props.setAppLoading(true);
            merchantApi
              .getAuthorizationApplication({ applicationId })
              .then((res: IApiResponse<AuthorizationApplicationResponse>) => {
                props.setAppLoading(false);
                if (
                  res.success &&
                  res.data &&
                  res.data.redirectUri &&
                  initialState?.currentUser?.companyId
                ) {
                  const href = history.createHref({
                    pathname: `${res.data.redirectUri}&companyId=${initialState.currentUser.companyId}`,
                  });
                  openNewTabs(href);
                }
              })
              .catch(() => {
                props.setAppLoading(false);
              });
          } else {
            // 已授權應用緩存裡不包含該應用的id，跳去授權頁
            const href = history.createHref({
              pathname: `/auth/authorize/auth/authorize/${applicationId}`,
            });
            openNewTabs(href);
          }
        } else {
          // 該應用狀態(state 为 cms 系统操作的状态，applicationState 为 boss 系统操作的状态) !== 已開通(APPSTATE.ACTIVATE)，則提示已禁用
          message.error(
            `${intl.getMessage(
              'application.detail.DEACTIVATE.message',
              '此應用已被管理員暫停使用',
            )}`,
          );
        }
      }
    } else if (APPSTATUS.NOTOPENED === props.type) {
      if (applicationId && APPSTATE.DEACTIVATE !== applicationState) {
        const sid = null === applicationSubscriptionId ? 'null' : applicationSubscriptionId;
        // const timestamp = null === serviceEndTime ? 'null' : serviceEndTime
        history.push(`/main/application/appMark/${applicationId}?sid=${sid}`);
      } else {
        message.error(
          `${intl.getMessage(
            'application.applicationState.DEACTIVATE.message2',
            '應用已被 KConnect 管理員暫停使用',
          )}`,
          5,
        );
      }
    }
  };

  return (
    <>
      <div className={styles.appItem} onClick={gotoDetail.bind(null, props.data)}>
        {
          // (APPSTATE.DEACTIVATE === props.data?.applicationState || APPSTATE.DEACTIVATE === props.data?.state) &&
          // <div className={styles.badge}>已停用</div>
        }
        <div className={styles.imgBox}>
          <img
            className={styles.appIcon}
            src={props.data?.icon || defaultIcon}
            onError={(e: any) => {
              e.target.src = defaultIcon;
              e.target.onerror = null;
            }}
          />
        </div>
        <div className={styles.iconInfo}>
          <Ellipsis className={styles.name} style={{ lineHeight: 1.3, wordBreak: 'break-word' }}>
            {props.data?.name || ''}
          </Ellipsis>
          <div className={styles.info}>
            {APPSTATUS.OPENED === props?.type ? (
              props.data?.serviceEndTime ? (
                `期限：${moment(Number(props.data?.serviceEndTime)).format('DD/MM/YYYY')}`
              ) : (
                '期限: 永久'
              )
            ) : (
              <Typography.Paragraph
                ellipsis={{ rows: 1, tooltip: true }}
                style={{ lineHeight: 1.3, color: '#85827D', marginBottom: 0 }}
              >
                {props.data?.description || ''}
              </Typography.Paragraph>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppItem;
