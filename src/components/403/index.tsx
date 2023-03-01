import useLocale from '@/hooks/useLocale';
import { Card } from 'antd';
import React from 'react';
import { history } from 'umi';
import styles from './index.less';

const UnAccessible: React.FC = () => {
  const { getMessage } = useLocale();

  return (
    <div className={styles.mainContent}>
      <Card bordered={false} title={null} className={styles.cardBox}>
        <div className={styles.text}>
          {getMessage('common.error.sorryyoucantaccessthispage', '抱歉，你無法訪問該頁面')}
        </div>
        <div className={styles.goback} onClick={() => history.push('/')}>
          {getMessage('common.error.returntohomepage', '返回首頁')}
        </div>
      </Card>
    </div>
  );
};

export default UnAccessible;
