import placeholderBg from '@/assets/svgs/placeholderBg.svg';
import { Typography } from 'antd';
import cx from 'classnames';
import React from 'react';
import type { categoryAppProps } from '../index';
import Style from './index.less';

type TAppCategoryProps = {
  data: categoryAppProps;
  onClick?: () => void;
  guideState: number;
  index: number;
};
const AppCategory: React.FC<TAppCategoryProps> = (props) => {
  const { data, onClick, index, guideState = {} } = props;

  return (
    <>
      <div
        onClick={onClick}
        className={cx(Style.appItem, index == 0 && guideState == 3 ? Style.guideThird : '')}
      >
        <div
          style={{ backgroundImage: `url(${placeholderBg})` }}
          className={Style.appIconContainer}
        >
          <img
            src={data.icon}
            className={Style.appIcon}
            alt=""
            onError={(e: any) => {
              e.target.src = placeholderBg;
              e.target.onerror = null;
            }}
          />
        </div>
        <div className={Style.rightContainer}>
          <Typography.Paragraph className={Style.appName} ellipsis={{ rows: 1, tooltip: true }}>
            {data.name}
          </Typography.Paragraph>
          <Typography.Paragraph className={Style.appDescribe} ellipsis={{ rows: 1, tooltip: true }}>
            {data.description}
          </Typography.Paragraph>
        </div>
      </div>
    </>
  );
};

export default AppCategory;
