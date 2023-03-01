import placeholderBg from '@/assets/svgs/recommendIconLoading.svg';
import thumbsUp from '@/assets/svgs/thumbsUp.svg';
import { randomRangeId } from '@/utils/utils';
import { Typography } from 'antd';
import React from 'react';
import type { appRecommendProps } from '../index';
import Style from './index.less';

type TRecommend = {
  data: appRecommendProps;
  onClick?: () => void;
};
const Recommend: React.FC<TRecommend> = (props) => {
  const { data, onClick } = props;
  const {
    applicationId = '',
    name = '',
    icon = '',
    description = '',
    scene = '',
    highLight = [],
  } = data;

  return (
    <>
      <div onClick={onClick} key={applicationId} className={Style.appItem}>
        <div>
          <div className={Style.topContainer}>
            <div className={Style.topLeftContainer}>
              <div
                style={{ backgroundImage: `url(${placeholderBg})` }}
                className={Style.appIconContainer}
              >
                <img
                  src={icon}
                  className={Style.appIcon}
                  onError={(e: any) => {
                    e.target.src = placeholderBg;
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className={Style.topCenterContainer}>
                <Typography.Paragraph
                  className={Style.appName}
                  ellipsis={{ rows: 1, tooltip: true }}
                >
                  {name}
                </Typography.Paragraph>
                <Typography.Paragraph
                  className={Style.appDescribe}
                  ellipsis={{ rows: 1, tooltip: true }}
                >
                  {description}
                </Typography.Paragraph>
              </div>
            </div>
            <div className={Style.topRightContainer}>
              <img src={thumbsUp} className={Style.thumbsUp} alt="" />
            </div>
          </div>
          <Typography.Paragraph className={Style.appTip} ellipsis={{ rows: 1, tooltip: true }}>
            {scene}
          </Typography.Paragraph>
          <div className={Style.highLight}>
            {highLight.map((item) => {
              return (
                <p key={`key_${randomRangeId(8)}`} className={Style.subTip}>
                  {item ? item : <br />}
                </p>
              );
            })}
          </div>
        </div>

        <div className={Style.bottomContainer}>
          <Typography.Paragraph className={Style.price} ellipsis={{ rows: 1, tooltip: true }}>
            {data.price}
          </Typography.Paragraph>
        </div>
      </div>
    </>
  );
};

export default Recommend;
