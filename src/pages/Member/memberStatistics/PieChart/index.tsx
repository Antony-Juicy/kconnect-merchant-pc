import noDataBG from '@/assets/images/member/noDataBG.png';
import PiePlus from '@/components/PiePlus';
import useLocale from '@/hooks/useLocale';
import { formatUnixTimestampIgnoreTime } from '@/utils/utils';
import moment from 'moment';
import React, { memo, useEffect, useState } from 'react';
import Styles from './index.less';

const isEqual = (prevProps: any, nextProps: any) => {
  return prevProps.data === nextProps.data;
};

type TPieDataProps = {
  title?: string;
  explain?: string;
  pieData?: any[];
};

type TPieMouduleProps = {
  data?: TPieDataProps[];
};

const PieChartGroup: React.FC<TPieMouduleProps> = (props) => {
  const [data, setData] = useState<any[]>([]);
  const { getMessage } = useLocale();

  const updatedDate = (index: number) => {
    const date = () => {
      if (index > 1) {
        return formatUnixTimestampIgnoreTime(moment().valueOf());
      } else {
        return formatUnixTimestampIgnoreTime(moment().subtract(1, 'days').valueOf());
      }
    };

    const realUpdateDate =
      date() + '\xa0' + getMessage('membermanage.memberstatistic.update', '更新');
    return realUpdateDate;
  };

  useEffect(() => {
    setData([...(props.data ?? [])]);
  }, [props]);

  return (
    <div className={Styles.bottomCountContainer}>
      {!!data &&
        data.map((item: any, index: number) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={Styles.pieItem}>
              <div className={Styles.pieTipContainer}>
                <span className={Styles.pieTitle}>{item.title}</span>
                <span className={Styles.pieUpdateTip}>{updatedDate(index)}</span>
              </div>
              <div className={Styles.pieChartContainer}>
                {item.pieData.length > 0 ? (
                  <PiePlus data={item.pieData} title={item.explain} />
                ) : (
                  <div
                    className={Styles.noDataPie}
                    style={{ backgroundImage: `url(${noDataBG})` }}
                  />
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default memo(PieChartGroup, isEqual);
