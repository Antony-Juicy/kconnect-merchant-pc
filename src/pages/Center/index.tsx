import NormalLayout from '@/components/Layout/NormalLayout';
import { merchantApi } from '@/services';
import type { DocumentationHelpCenterListPageResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Card, List } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

const Center: React.FC = () => {
  const [questionData, setQuestionData] = useState<any>(null);
  const [listLoading, { setTrue: showListLoading, setFalse: hideListLoading }] = useBoolean(false);

  const init = (pageNumber: number, rows: number) => {
    showListLoading();
    merchantApi
      .getDocumentationHelpCenterListPage({
        page: pageNumber.toString(),
        rows: (rows || 10).toString(),
      })
      .then((res: IApiResponse<DocumentationHelpCenterListPageResponse>) => {
        // console.log(res)
        if (res && res.success && res.data) {
          setQuestionData(res.data);
          hideListLoading();
        }
      })
      .catch(() => {
        hideListLoading();
      });
  };

  const onChange = (page: number, rows: number) => {
    // console.log(page, rows);
    init(page, rows);
  };

  // const onShowSizeChange = (current: number, size: number) => {
  //   console.log('current: ', current, 'size: ', size)
  //   init(current, size)
  // }

  useEffect(() => {
    init(1, 10);
  }, []);

  const gotoDetail = (item: any) => {
    const linkUrl = item.zhLinkUrl || item.enLinkUrl;
    if (item && linkUrl) {
      window.open(linkUrl);
    } else if (item && item.documentationId && !linkUrl) {
      history.push(`/others/center/detail/${item.documentationId}`);
    }
  };

  return (
    <NormalLayout className={styles.mainContent}>
      <Card bordered={false} title="幫助中心" className={styles.cardBox}>
        <List
          itemLayout="vertical"
          loading={listLoading}
          pagination={{
            onChange: (page, rows) => onChange(page, rows),
            showQuickJumper: questionData?.totalCount >= 10,
            showSizeChanger: questionData?.totalCount >= 10,
            total: questionData?.totalCount || 0,
            // showTotal: (total) => `共 ${total} 個`,
          }}
          dataSource={questionData?.data || []}
          renderItem={(item: any) => (
            <List.Item className={styles.listItem} onClick={gotoDetail.bind(null, item)}>
              <div className={styles.txtBox}>{item?.title || ''}</div>
            </List.Item>
          )}
        />
      </Card>
    </NormalLayout>
  );
};

export default Center;
