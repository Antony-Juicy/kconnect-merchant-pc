import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { useBoolean } from 'ahooks';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from "@/services";
import type { IApiResponse } from '@/utils/request';
import type { DocumentationHotNewsInfoResponse } from '@/services/api';
import styles from './index.less';
import NormalLayout from '@/components/Layout/NormalLayout/index';

const CenterDetail: React.FC = (props) => {
  const { id } = usePageStatus(props)
  const [title, setTitle] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [detailLoading, { setTrue: showDetailLoading, setFalse: hideDetailLoading }] = useBoolean(false);

  useEffect(() => {
    showDetailLoading()
    merchantApi.getDocumentationHotNewsInfo({ documentationId: id })
    .then((res: IApiResponse<DocumentationHotNewsInfoResponse>) => {
      if(res && res.success && res.data) {
        setTitle(res.data.title || '');
        setSource(res.data.source || '');
        if(res.data.zhContent && '<p></p>' !== res.data.zhContent) {
          setDetail(res.data.zhContent)
        } else {
          setDetail(res.data.enContent || '')
        }
        hideDetailLoading()
      }
    })
    .catch(() => {
      hideDetailLoading()
    })
  }, [])

  return (
    <NormalLayout
      title='熱點新聞'
      visible
      className={styles.mainContent}>
        <Card
          bordered={false}
          loading={detailLoading}
          title={null}
          className={styles.cardBox}
        >
          <div className={styles.titleBox}>{title || ''}</div>
          <div className={styles.source}>{source ? `來源：${source}` : ''}</div>
          <div dangerouslySetInnerHTML={{__html: `${detail || ''}`}} />
        </Card>
    </NormalLayout>
  );
};

export default CenterDetail;

