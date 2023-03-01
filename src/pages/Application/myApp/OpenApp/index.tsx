import { Typography } from 'antd';
import React from 'react';
import Style from './index.less';
interface openAppProps {
  name: string;
  icon: string;
  description: string;
  applicationId: string | number;
  [key: string]: any;
}
type TAppCategoryProps = {
  data: openAppProps;
  onClick?: () => void;
};
const OpenApp: React.FC<TAppCategoryProps> = (props) => {
  const { data, onClick } = props;

  return (
    <>
      <div onClick={onClick} className={Style.appItem}>
        <img src={data.icon} className={Style.appIcon} alt="" />
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

export default OpenApp;
