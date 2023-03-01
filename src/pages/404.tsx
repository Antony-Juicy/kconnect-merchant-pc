import { Card } from 'antd';
import React from 'react';
import { history } from 'umi';
import styles from '@/components/403/index.less';

const NoFoundPage: React.FC = () => {

  return (
    <div className={styles.mainContent}>
      <Card
        bordered={false}
        title={null}
        className={styles.cardBox}
      >
        <div className={styles.text}>抱歉，你訪問的頁面不存在</div>
        <div className={styles.goback} onClick={() => history.push('/')}>
          返回首頁
        </div>
      </Card>
    </div>
  );
};

export default NoFoundPage;
