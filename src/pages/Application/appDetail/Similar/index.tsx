import { Typography } from 'antd';
import React from 'react';
import type { similarAppProps } from '../index';

import Style from './index.less';
type TSimilarAppProps = {
  data: similarAppProps;
  key: string | number;
  onClick?: () => void;
};
const AppCategory: React.FC<TSimilarAppProps> = (props) => {
  const { data, key, onClick } = props;

  return (
    <>
      <div key={key} onClick={onClick} className={Style.appItem}>
        <div className={Style.leftContainer}>
          <img className={Style.appIcon} src={data.icon} />
          <div className={Style.infoContainer}>
            <Typography.Paragraph className={Style.appName} ellipsis={{ rows: 1, tooltip: true }}>
              {data.name}
            </Typography.Paragraph>
            <Typography.Paragraph
              className={Style.description}
              ellipsis={{ rows: 1, tooltip: true }}
            >
              {data.description}
            </Typography.Paragraph>
          </div>
        </div>
        <div className={Style.priceContainer}>
          <Typography.Paragraph className={Style.price} ellipsis={{ rows: 1, tooltip: true }}>
            {data.price}
          </Typography.Paragraph>
        </div>
      </div>
    </>
  );
};

export default AppCategory;
