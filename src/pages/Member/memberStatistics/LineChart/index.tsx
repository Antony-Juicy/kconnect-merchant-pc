import noDataBG from '@/assets/images/member/noDataBG.png';
import useLocale from '@/hooks/useLocale';
import type { TLineDataProps } from '@/utils/constants';
import { Line } from '@ant-design/plots';
import React, { memo, useEffect, useState } from 'react';
import Styles from './index.less';
const isEqual = (prevProps: any, nextProps: any) => {
  return prevProps.data === nextProps.data;
};

type TLineProps = {
  data?: TLineDataProps[];
};

const LineChart: React.FC<TLineProps> = (props) => {
  const { getMessage } = useLocale();
  const [data, setData] = useState<TLineDataProps[]>([]);

  const customContent = (title: string, items: any[]): any => {
    const month = parseInt(title?.substring(3, 5));
    const day = parseInt(title?.substring(0, 2));
    return (
      <>
        <div className={Styles.tooltipWapper}>
          <div className={Styles.tooltipTitle}>
            {month}
            {getMessage('membermanage.memberstatistic.month', '月')}
            {day}
            {getMessage('membermanage.memberstatistic.day', '日')}
          </div>
          <div className={Styles.tooltipContent}>
            <div
              style={{
                position: 'relative',
              }}
            >
              <div className={Styles.tooltipFlag} />
              <div className={Styles.tooltipContentText}>{items[0]?.value}</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // 折线图参数
  const userCountconfig = {
    data: data,
    autoFit: true,
    color: '#FFA21A',
    xField: 'statisticalDate',
    yField: 'statisticalCount',
    xAxis: {
      label: {
        offset: 8,
        offsetX: 16,
        style: {
          textAlign: 'right',
          fill: '#3C3A35',
          opacity: 0.6,
        },
      },
    },
    point: {
      size: 5,
      style: {
        lineWidth: 2,
      },
    },

    tooltip: {
      domStyles: {
        'g2-tooltip': {
          boxShadow: 'none',
          border: 'none',
          padding: 0,
          borderRadius: '12px',
          brackground: 'transparent',
        },
      },
      customContent: (title: string, items: any[]) => {
        return customContent(title, items);
      },
      showNil: false,
    },
    connectNulls: false,

    yAxis: {
      label: {
        formatter: (v: string) => parseInt(v),
      },
      nice: true,
      // tickCount: 5,
      minInterval: 1,
      grid: {
        line: {
          type: 'line',
        },
      },
    },
  };

  useEffect(() => {
    setData([...(props.data ?? [])]);
  }, [props]);

  return (
    <div className={Styles.centerCountContainer}>
      <div className={Styles.lineTipContainer}>
        <span className={Styles.lineTitle}>
          {getMessage('membermanage.memberstatistic.perdayregistercount', '每日註冊人數')}
        </span>
      </div>
      {data.length > 0 ? (
        <Line className={Styles.linkEchart} {...userCountconfig} />
      ) : (
        <div className={Styles.noDataLine} style={{ backgroundImage: `url(${noDataBG})` }} />
      )}
    </div>
  );
};
export default memo(LineChart, isEqual);
