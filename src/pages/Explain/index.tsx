import NormalLayout from '@/components/Layout/NormalLayout/index';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';
import type { DocumentationUserExplainInfoResponse } from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { BURIEDKEY } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Card } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const ExplainDetail: React.FC = (props) => {
  const { id } = usePageStatus(props);
  const [title, setTitle] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [detailLoading, { setTrue: showDetailLoading, setFalse: hideDetailLoading }] =
    useBoolean(false);

  useEffect(() => {
    const startTime = new Date().getTime();
    showDetailLoading();
    merchantApi
      .getDocumentationUserExplainInfo({ documentationId: id })
      .then((res: IApiResponse<DocumentationUserExplainInfoResponse>) => {
        hideDetailLoading();
        if (res && res.success && res.data) {
          setTitle(res.data.title || '');
          if (res.data.zhContent && '<p></p>' !== res.data.zhContent) {
            setDetail(res.data.zhContent);
          } else {
            setDetail(res.data.enContent || '');
          }
        }
      })
      .catch(() => {
        hideDetailLoading();
      });
    return () => {
      const endTime = new Date().getTime();
      const TimeDiff = Math.trunc((endTime - startTime) / 1000);
      const params = {};
      params[BURIEDKEY.RETENTIONPERIOD] = `${TimeDiff}s`;
      event(BuriedPoint.KC_OA_INSTRUCTIONS_DTL_VIEWED, params);
    };
  }, []);

  return (
    <NormalLayout title="使用說明" visible className={styles.mainContent}>
      <Card bordered={false} loading={detailLoading} title={null} className={styles.cardBox}>
        <div className={styles.titleBox}>{title || ''}</div>
        <div className={styles.source}>{''}</div>
        <div dangerouslySetInnerHTML={{ __html: `${detail || ''}` }} />
      </Card>
    </NormalLayout>
  );
};

export default ExplainDetail;
