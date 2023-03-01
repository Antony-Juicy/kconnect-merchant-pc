import activeStar from '@/assets/svgs/activeStar.svg';
import { merchantApi } from '@/services';
import type { FavAppProps } from '@/utils/constants';
import { randomRangeId } from '@/utils/utils';
import { Typography } from 'antd';
import cx from 'classnames';
import { debounce } from 'lodash';
import React from 'react';
import Style from './index.less';

type TRecommend = {
  data: FavAppProps;
  onClick: () => void;
  refresh: () => void;
};
const Recommend: React.FC<TRecommend> = (props) => {
  const { data, onClick, refresh } = props;
  const {
    applicationFavouriteId = '',
    applicationId = '',
    name = '',
    description = '',
    scene = '',
    icon = '',
    highLight = [],
  } = data;

  const handleCollection = debounce(async (e: any, appFavId: number | string) => {
    const element = e.target as Element;
    if (element && element.matches('.collectionStar')) {
      await merchantApi.postApplicationFavouriteRemove({
        applicationFavouriteId: appFavId,
        applicationId: applicationId,
      });
      refresh();
    }
  }, 300);

  const onClickFavApp = (e) => {
    const element = e.target as Element;
    if (element && element.matches('.favAppItem div')) {
      onClick();
    }
  };

  return (
    <>
      <div
        key={data.applicationId}
        onClick={onClickFavApp}
        className={cx(Style.appItem, 'favAppItem')}
      >
        <div>
          <div className={Style.topContainer}>
            <div className={Style.topLeftContainer}>
              <img src={icon} className={Style.appIcon} />
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
            <span
              className="collectionStar"
              onClick={(e) => handleCollection(e, applicationFavouriteId)}
            >
              <img src={activeStar} className={Style.star} />
            </span>
          </div>
          <Typography.Paragraph className={Style.appTip} ellipsis={{ rows: 1, tooltip: true }}>
            {scene}
          </Typography.Paragraph>
          <div className={Style.highLight}>
            {highLight.length > 0 &&
              highLight.map((item) => {
                return (
                  <p key={`key_${randomRangeId(8)}`} className={Style.subTip}>
                    {item ? item : <br />}
                  </p>
                );
              })}
          </div>
        </div>

        <div className={Style.bottomContainer}>
          <p className={Style.price}>{data.price}</p>
        </div>
      </div>
    </>
  );
};

export default Recommend;
