import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';
import type { CommonLoginCodeResponse } from '@/services/api';
import {
  removeCompanyId,
  setAccessToken,
  setCompanyId,
  setExpires,
  setRefreshToken,
} from '@/utils/auth';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Spin } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { history, useModel } from 'umi';
import css from './index.less';

const CodeLogin: React.FC = (props) => {
  const { code, companyId, applicationId } = usePageStatus(props);
  const { refresh } = useModel('@@initialState');
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);

  useEffect(() => {
    if (code && companyId) {
      showLoading();
      removeCompanyId();
      setCompanyId(companyId);
      merchantApi
        .postCommonLoginCode({ code, companyId })
        .then((res: IApiResponse<CommonLoginCodeResponse>) => {
          if (res.success) {
            setAccessToken(res.data.accessToken);
            setRefreshToken(res.data.refreshToken);
            setExpires(moment().add(res.data.expired, 'seconds').valueOf());
            history.push(`/auth/authorize/${applicationId}`);
            refresh();
          }
          hideLoading();
        })
        .catch(() => {
          hideLoading();
        });
    }
  }, []);

  return (
    <div>
      <Spin spinning={loading} size="large">
        <div className={css.wrapper} />
      </Spin>
    </div>
  );
};

export default CodeLogin;
