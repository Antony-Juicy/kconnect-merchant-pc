import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useIntl } from 'umi';
import { useBoolean } from 'ahooks';
// import {  history } from 'umi';
// import { notify } from '@/utils/antdUtils';
// import keyBy from 'lodash/keyBy';
import { Col, Row, Spin } from 'antd';
import logo from '@/assets/logo.svg';
import styles from './index.less';
import { useQuery } from '@/hooks/useQuery';
import { merchantApi } from '@/services';
import type { AgreementInfoLatestResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { gotoLogin } from '@/utils/antdUtils';

const Details: React.FC = () => {
  const query = useQuery();
  const [title, setTitle] = useState<string>('');
  const [article, setArticle] = useState<any>('');
  const [detailLoading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);

  // const { formatMessage } = useIntl();

  // const activeKey = 'zh_HK';

  // console.log('query: ', query)

  useEffect(() => {
    const copywritingId = query.get('id');
    // console.log()
    if (copywritingId) {
      showLoading();
      // setTitle(query.get('title') || '');
      merchantApi.getAgreementInfoLatest()
        .then((res: IApiResponse<AgreementInfoLatestResponse>) => {
          if(res.success && res.data) {
            setTitle(res.data.agreementName);
            hideLoading();
            if(res.data.zhContent && '<p></p>'!== res.data.zhContent) {
              setArticle(res.data.zhContent)
            } else {
              setArticle(res.data.enContent || '')
            }
          }
        })
        .catch(() => {
          hideLoading();
        });
    }
  }, [query.get('id'), query.get('title')]);

  const goLogin = () => {
    gotoLogin();
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>
      <div className={styles.headerBarWapper}>
        <Row>
          <Col flex={1}>
          <img src={logo} className={styles.headerBarImg}  onClick={goLogin}/>
          </Col>
        </Row>
      </div>
      <Spin spinning={detailLoading}>
        <div className={styles.container}>
          <div className={styles.contentContainer}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.details}>
              <div dangerouslySetInnerHTML={{ __html: article }} />
            </div>
          </div>
        </div>
      </Spin>
    </HelmetProvider>
  );
};

export default Details;
