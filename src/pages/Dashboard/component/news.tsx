import emptyIcon from '@/assets/images/common/empty.png';
import nextArrow from '@/assets/svgs/nextArrow.svg';
import prevArrow from '@/assets/svgs/prevArrow.svg';
import useLocale from '@/hooks/useLocale';
import { randomRangeId } from '@/utils/utils';
import { Carousel } from 'antd';
import React from 'react';
import { history } from 'umi';
import css from './news.less';

type TSprops = {
  data: any;
};

// const mock = {
//   documentationId: "172887632697757724",
//   coverUrl: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?Expires=1647240803&Signature=atmHQ7nLYLxESKSsq4FNBMd90GGViJG8ozrU4h7jDC0aOfSleiP4ZUY9uGA1jMSTfcWysOxHkAAqPS2X4AtYvvmwbX284jYQP7ydT71PDG8mqCUCnrJzSBB9YZplpgr~XdlSz7jeU5qW7JkmrRpm1ti8vt0giDoO8SqpdGgfbpI8fDFll7xB8UvxEKCX4~j93RpB3BVdHiWmLQFkIerWB3UW~gLZ00RX8PePatITy-jgQDVIDByUXmrhgxlN1cwmMj0P8Bmj~nt9QjwBMhOHaX7XjuSw4VnCZHo5lksxpAcxreUVbKfEhH3Ne-HxriwxFmXynsWKVuzT9iVcPRDL2Q__&Key-Pair-Id=APKAIZZBJLO3AII75JSQ",
//   title: "KConnect Merchant PC"
// }

// const mockData = Array.from({length: 3}).map(() => mock)

// value = target / 244 * 12.7

const News: React.FC<TSprops> = (props) => {
  const { getMessage } = useLocale();
  const gotoDetail = (itemData: any) => {
    // console.log('gotoDetail', itemData);
    const linkUrl = itemData.zhLinkUrl || itemData.enLinkUrl;
    if (itemData && linkUrl) {
      window.open(linkUrl);
    } else if (itemData && itemData.documentationId && !linkUrl) {
      history.push(`/main/dashboard/news?id=${itemData.documentationId}`);
    }
  };

  return (
    <div className={css.news}>
      {props.data && 0 < props.data.length ? (
        <div className={css.carouselWapper}>
          <Carousel
            dots={{ className: css.dots }}
            arrows={true}
            autoplay
            autoplaySpeed={5000}
            prevArrow={<img src={prevArrow} />}
            nextArrow={<img src={nextArrow} />}
          >
            {props.data.map((item: any) => {
              return (
                <div
                  onClick={gotoDetail.bind(null, item)}
                  key={`key_img_${randomRangeId(8)}`}
                  className={css.imgBox}
                >
                  <img src={item.coverUrl} />
                  <div className={css.blurBox}>
                    <span className={css.title}>{item.title}</span>
                    <span className={css.tip}>{getMessage('common.view', '詳情')}</span>
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      ) : (
        <div className={css.emptyBox}>
          <img src={emptyIcon} className={css.emptyImg} />
        </div>
      )}
    </div>
  );
};

export default News;
