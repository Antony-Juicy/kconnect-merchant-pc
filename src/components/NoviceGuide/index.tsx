import useLocale from '@/hooks/useLocale';
import { Button } from 'antd';
import cx from 'classnames';
import React from 'react';
import styles from './index.less';
export type NoviceGuideProps = {
  title: string;
  subTitle: string;
  progress: string; //进度文案
  nextText: string; // 下一步按钮文案
  skip?: boolean; // 是否需要显示跳过按钮
  onNext: (e: React.MouseEvent<HTMLElement>) => void; // 点击下一步按钮所触发的事件
  onSkip?: () => void; //  点击跳过按钮所触发的事件
};
const NoviceGuide: React.FC<NoviceGuideProps> = (props) => {
  const { getMessage } = useLocale();
  const {
    title = '',
    subTitle = '',
    nextText = '',
    progress = '',
    skip = false,
    onNext,
    onSkip = undefined,
  } = props;

  const onClickSkip = (e: any) => {
    e.stopPropagation();
    if (!!onSkip) {
      onSkip();
    }
  };

  return (
    <div className={styles.guideContainer} onClick={onNext}>
      <p className={styles.guideFirstTitle}> {title}</p>
      <p className={styles.guideFirstSubTitle}> {subTitle}</p>
      <div className={styles.BottomContainer}>
        <div className={styles.guideFirstState}>
          <div> {progress}</div>
        </div>
        <div>
          {skip && (
            <Button type="default" className={cx(styles.skipBtn, 'skipBtn')} onClick={onClickSkip}>
              {getMessage('dashboard.skip', '跳過')}
            </Button>
          )}
          <Button type="primary" className={styles.guideFirstNextBtn}>
            {nextText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoviceGuide;
