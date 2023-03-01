import NormalLayout from '@/components/Layout/NormalLayout/index';
import useLocale from '@/hooks/useLocale';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';
import type { DocumentationHelpCenterInfoResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Card } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const CenterDetail: React.FC = (props) => {
  const { id } = usePageStatus(props);
  const [title, setTitle] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [detailLoading, { setTrue: showDetailLoading, setFalse: hideDetailLoading }] =
    useBoolean(false);

  const intl = useLocale();

  useEffect(() => {
    showDetailLoading();
    merchantApi
      .getDocumentationHelpCenterInfo({ documentationId: id })
      .then((res: IApiResponse<DocumentationHelpCenterInfoResponse>) => {
        if (res && res.success && res.data) {
          setTitle(res.data.title || '');
          if (res.data.zhContent && '<p></p>' !== res.data.zhContent) {
            setDetail(res.data.zhContent);
          } else {
            setDetail(res.data.enContent || '');
          }
          hideDetailLoading();
        }
      })
      .catch(() => {
        hideDetailLoading();
      });
  }, []);

  return (
    <NormalLayout
      title={`${intl.getMessage('menu.others.centerDetail', '詳情頁')}`}
      visible
      className={styles.mainContent}
    >
      <Card
        bordered={false}
        loading={detailLoading}
        title={title ? <div className={styles.titleBox}>{title}</div> : ''}
        className={styles.cardBox}
      >
        <div dangerouslySetInnerHTML={{ __html: `${detail || ''}` }} />
      </Card>
    </NormalLayout>
  );
};

export default CenterDetail;
