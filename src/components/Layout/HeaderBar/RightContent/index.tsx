import updateNotificationIcon from '@/assets/svgs/updateNotification.svg';
import perfectdataIcon from '@/assets/svgs/perfectdata-icon.svg';
import { merchantApi } from '@/services';
import type {
  AccountOperateGuideRecordListResponse,
  DocumentationReadUpdateAnnouncementInfoLatestResponse,
} from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { Badge, Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { useBoolean } from 'ahooks';
import Avatar from './AvatarDropdown';
import ImproveData from '../component/ImproveData';
import styles from './index.less';
export type SiderTheme = 'light' | 'dark';
const GlobalHeaderRight: React.FC = () => {
  const className = styles.right;
  const [dot, setDot] = useState<boolean>(false);
  const { setOperationRefresh } = useModel('useOperationGuidanceModel');

  // 隐藏 完善资料
  const [perfectdata, { setTrue: showPerfectdata, setFalse: hidePerfectdata }] = useBoolean(false);
  const [
    consummateModal,
    { setTrue: showConsummateModalModal, setFalse: hideConsummateModalModal },
  ] = useBoolean(false);
  const { enterprise } = useModel('useEnterpriseModel');

  const gotoUpdateAnnouncement = () => {
    if (dot) {
      merchantApi.postDocumentationReadUpdateAnnouncementLatest().then(() => {
        setDot(!dot);
      });
    }
    history.push(`/main/dashboard/announcement`);
  };

  // 获取最新更新公告
  const getAnnouncement = () => {
    merchantApi
      .getDocumentationReadUpdateAnnouncementInfoLatest()
      .then((res: IApiResponse<DocumentationReadUpdateAnnouncementInfoLatestResponse>) => {
        if (res.success && res.data) {
          const { read = true } = res.data;
          setDot(!read);
        }
      });
  };

  //获取账号操作引导记录
  const getMaterial = () => {
    merchantApi
      .getAccountOperateGuideRecordList()
      .then((res: IApiResponse<AccountOperateGuideRecordListResponse>) => {
        if (res.success && res.data) {
          setOperationRefresh(res.data);
          const { needCompanyInfoFlag } = res.data;
          if (needCompanyInfoFlag) {
            showPerfectdata();
          } else {
            hidePerfectdata();
          }
        }
      });
  };

  // 刷新选择企业列表是否需要完善资料
  useEffect(() => {
    if (enterprise.companyId) {
      getMaterial();
      getAnnouncement();
    }
  }, [enterprise.companyId]);

  return (
    <>
      <Space className={className}>
        {perfectdata ? (
          <Button
            className={styles.perfectdataBtn}
            icon={<img className={styles.perfectdataImg} src={perfectdataIcon} alt="" />}
            type="primary"
            onClick={showConsummateModalModal}
          >
            {'完善資料'}
          </Button>
        ) : null}

        <div onClick={gotoUpdateAnnouncement} className={styles.updateNotification}>
          <Badge dot={dot}>
            <img src={updateNotificationIcon} className={styles.noticeIcon} />
          </Badge>
        </div>
        <Avatar />
      </Space>
      <ImproveData
        showModal={consummateModal}
        hidePerfectdata={hidePerfectdata}
        hideConsummateModalModal={hideConsummateModalModal}
      />
    </>
  );
};
export default GlobalHeaderRight;
