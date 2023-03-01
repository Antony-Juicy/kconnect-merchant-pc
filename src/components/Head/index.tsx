import { Row, Col, Card } from 'antd';
import React from 'react';
// import Kay from '@/assets/images/common/Kpay.png'
import { history, useIntl } from 'umi';

import styles from './index.less';
import logo from '@/assets/logo.svg';
import { gotoLogin } from '@/utils/antdUtils';
const Head: React.FC = () => {
  const gotoliong = () => {
    gotoLogin();
  };
  return (
    <div className={styles.head}>
      <Row>
        <Col flex={1}>
          <img className={styles.headimg} src={logo} alt="login" onClick={gotoliong} />
        </Col>
      </Row>
    </div>
  );
};

export default Head;
