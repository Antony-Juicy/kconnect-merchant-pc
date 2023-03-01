import coverloadBg from '@/assets/svgs/caseCover.svg';
import placeholderBg from '@/assets/svgs/caseIconLoading.svg';
import { formatUnixTimestamp } from '@/utils/utils';
import { Typography } from 'antd';
import React from 'react';
import type { caseProps } from '../index';
import Style from './index.less';
type TAppCategoryProps = {
  data: caseProps;
  onClick?: () => void;
};
const Case: React.FC<TAppCategoryProps> = (props) => {
  const { data, onClick } = props;

  return (
    <>
      <div key={data.applicationCaseId} onClick={onClick} className={Style.caseItem}>
        <div className={Style.topContainer}>
          <div style={{ backgroundImage: `url(${coverloadBg})` }} className={Style.imgContainer}>
            <img
              className={Style.caseImg}
              src={data.imageUrl}
              alt=""
              onError={(e: any) => {
                e.target.src = coverloadBg;
                e.target.onerror = null;
              }}
            />
          </div>

          <div className={Style.centerContainer}>
            <Typography.Paragraph className={Style.caseTitle} ellipsis={{ rows: 1, tooltip: true }}>
              {!!data.title ? data.title : data.titleEn || ''}
            </Typography.Paragraph>
            <Typography.Paragraph
              className={Style.caseIntroduction}
              ellipsis={{ rows: 1, tooltip: true }}
            >
              {!!data.introduction ? data.introduction : data.introductionEn || ''}
            </Typography.Paragraph>
          </div>
        </div>
        <div className={Style.bottomContainer}>
          <div className={Style.bottomLeftContainer}>
            <div
              style={{ backgroundImage: `url(${placeholderBg})` }}
              className={Style.caseIconContainer}
            >
              <img
                src={data.icon}
                className={Style.caseIcon}
                onError={(e: any) => {
                  e.target.src = placeholderBg;
                  e.target.onerror = null;
                }}
                alt=""
              />
            </div>
            <Typography.Paragraph className={Style.caseName} ellipsis={{ rows: 1, tooltip: true }}>
              {data.name || ''}
            </Typography.Paragraph>
          </div>
          <span className={Style.caseDate}>
            {formatUnixTimestamp(data?.releaseDate, 'DD/MM/YYYY')}
          </span>
        </div>
      </div>
    </>
  );
};

export default Case;
