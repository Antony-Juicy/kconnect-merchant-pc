import { merchantApi } from '@/services';
import type { AgreementInfoLatestResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { openNewTabs } from '@/utils/utils';
import { Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import Styles from './index.less';

const Footer: React.FC = () => {
  const [list, setList] = useState<any[]>([]);

  const getCopywrite = () => {
    merchantApi.getAgreementInfoLatest().then((res: IApiResponse<AgreementInfoLatestResponse>) => {
      if (res.success && res.data) {
        // 舊版本顯示多個協議，用數組保存，新版本只顯示最新一份協議，還是保留使用數組的方式
        setList([{ agreementId: res.data.agreementId, agreementName: res.data.agreementName }]);
      }
    });
  };
  useEffect(() => {
    getCopywrite();
  }, []);

  const gotoPage = (id: string, title: string) => {
    const href = history.createHref({
      pathname: `/agreement?id=${id}&title=${encodeURI(title)}`,
    });
    openNewTabs(href);
  };

  return (
    <>
      <div className={Styles.container}>
        <Space size={48}>
          {0 < list.length &&
            list.map((item) => {
              return (
                <Button
                  className={Styles.protocolBth}
                  key={`button_key_${item?.agreementId}`}
                  onClick={gotoPage.bind(null, item?.agreementId, item?.agreementName)}
                  type="text"
                >
                  {item?.agreementName || ''}
                </Button>
              );
            })}
        </Space>
        <div className={Styles.character}>©️ KPay Merchant Service Limited</div>
      </div>
    </>
  );
};

export default Footer;
