import trend from '@/assets/images/common/trend.png';
import emptyIcon from '@/assets/svgs/noDataBg.svg';
import type { DashboardMerchantTransactionStatisticsResponse } from '@/services/api';
import { genDataTodayTag } from '@/utils/antdUtils';
import settings from '@/utils/settings';
import { fixedDigit, formatUnixTimestamp, kToString, thousands } from '@/utils/utils';
import type { ColumnConfig } from '@ant-design/plots';
import { Column, G2 } from '@ant-design/plots';
import type { Shape } from '@antv/g2/lib/interface';
import { Spin } from 'antd';
import cx from 'classnames';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import { titleNode } from '../../index';
import css from './overview.less';
import useLocale from '@/hooks/useLocale';

type TStatsColumns = {
  totalAmount: any;
  loading: boolean;
  startTime: number;
  displayIncreaseAmount?: string;
  growthRate?: number;
  revenueComparisonList: DashboardMerchantTransactionStatisticsResponse['revenueComparisonList'];
};

// value = target / 625 * 32.5

// 柱狀圖圓角角度
const radiusArray = [6, 6, 0, 0];

// 重新處理數據
const executeData = (data: any[], startTime: number) => {
  return data.map((item) => {
    item.revenue = parseFloat(item.revenue);
    item.date = item.dayOfMonth + '/' + item.monthOfYear + '/' + item.year;
    item.startTimeBase = startTime;
    item.startTimeBaseFormat = formatUnixTimestamp(startTime, settings.systemDateFormat);
    return item;
  });
};

// 根據不同的數值設置柱狀圖格式
const getRectAttr = (items: any) => {
  if (items.revenue > 0) {
    if (
      moment(items.date, settings.systemDateFormat).valueOf() ===
      moment(items.startTimeBaseFormat, settings.systemDateFormat).valueOf()
    ) {
      return {
        fill: '#FBA21F',
        radius: radiusArray,
      };
    } else {
      return {
        fill: '#FFECC9',
        radius: radiusArray,
      };
    }
  } else if (items.revenue === 0) {
    return {
      fill: '#E8E8E8',
      radius: radiusArray,
    };
  } else if (items.revenue < 0) {
    return {
      fill: '#FC2C2C',
      radius: radiusArray,
    };
  }
  return {
    fill: '#FFECC9',
    radius: radiusArray,
  };
};

const getY0 = (y: number, items: any) => {
  if (items.revenue > 0) {
    return y;
  }
  return y + 0.03;
};

const Overview: React.FC<TStatsColumns> = (props) => {
  const wrapRef = useRef<any>();
  const { getMessage } = useLocale();

  const { initialState } = useModel('@@initialState');
  const { loading, revenueComparisonList, displayIncreaseAmount, growthRate, startTime } = props;

  const [data, setData] = useState<any[]>([]);

  const getDate = () => {
    return formatUnixTimestamp(startTime, settings.systemOnlyDateFormat);
  };

  // title格式化
  const formatTitle = (v: any) => {
    return (
      moment(v, settings.systemOnlyDateFormat).format(settings.systemOnlyDateFormat) +
      genDataTodayTag(
        initialState?.currentBaseInfo?.dataSource,
        moment(v, settings.systemOnlyDateFormat).valueOf(),
      )
    );
  };

  const customContent = (title: string, items: any[]): any => {
    return (
      <>
        <div className={css.tooltipWapper}>
          <div className={css.tooltipTitle}>{items[0] && formatTitle(items[0].title)}</div>
          <div className={css.tooltipContent}>
            <div
              style={{
                position: 'relative',
              }}
            >
              <div className={css.tooltipFlag} />
              <div className={css.tooltipContentText}>
                HKD {items[0] && thousands(fixedDigit(items[0].value))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // 获取涨跌幅
  const getAmountType = () => {
    if (displayIncreaseAmount) {
      if (displayIncreaseAmount[0] !== '-') {
        return (
          <>
            <div className={cx(css.triangleWapper, css.triangleWapperUp)}>
              <span className={css.invertedTriangleUp} />
            </div>
            <span className={css.statisticColumnsUp}>
              {growthRate ? growthRate.toFixed(2) + '%' : ''}
            </span>
            <span style={{ color: '#E8E8E8' }}> | </span>
            <span className={css.statisticColumnsUp}>HKD {displayIncreaseAmount}</span>
          </>
        );
      } else {
        return (
          <>
            <div className={cx(css.triangleWapper)}>
              <span className={css.invertedTriangleDown} />
            </div>
            <span className={css.statisticColumnsDown}>
              {growthRate ? growthRate.toFixed(2) + '%' : ''}
            </span>
            <span style={{ color: '#E8E8E8' }}> | </span>
            <span className={css.statisticColumnsDown}>HKD {displayIncreaseAmount}</span>
          </>
        );
      }
    }
    return <></>;
  };

  // 上一个日期
  const getSubtractDate = () => {
    if (startTime) {
      return moment(parseInt(kToString(startTime), 10))
        .subtract(1, 'days')
        .format(settings.systemOnlyDateFormat);
    }
    return '';
  };

  // 获取收入标题
  const getLineTitle = () => {
    return (
      <>
        <span style={{ color: '#fba21f' }}>
          {getDate() + genDataTodayTag(initialState?.currentBaseInfo?.dataSource, startTime)}
        </span>
        &nbsp; 相比&nbsp;
        <span style={{ color: '#fba21f' }}> {getSubtractDate()} </span>
        {getAmountType()}
      </>
    );
  };

  const config: ColumnConfig = {
    // height: 275,
    data,
    xField: 'date',
    yField: 'revenue',
    seriesField: 'revenue',
    tooltip: {
      showMarkers: false,
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
    },
    maxColumnWidth: 34,
    minColumnWidth: 34,
    shape: 'custom-rect',
    legend: false,
    xAxis: {
      tickLine: null,
      label: {
        style: {
          fill: '#3C3A35',
          opacity: 0.6,
        },
        formatter: (v: string) => {
          return formatTitle(v);
        },
      },
    },
    yAxis: {
      tickCount: 6,
      minLimit: 0,
      label: {
        style: {
          fill: '#3C3A35',
          opacity: 0.6,
        },
        formatter: (v: any) => {
          const amount = parseFloat(v).toFixed(2);
          if (Math.abs(parseFloat(amount)) >= 1000) {
            return parseFloat(amount) / 1000 + 'K';
          }
          return amount;
        },
      },
      grid: {
        line: {
          style: {
            opacity: 0.1,
            stroke: '#3C3A35',
            lineDash: [10, 5],
          },
        },
      },
    },
  };

  useEffect(() => {
    if (wrapRef.current?.offsetWidth && wrapRef.current.offsetWidth > 0) {
      G2.registerShape('interval', 'custom-rect', {
        getPoints(cfg) {
          const x = cfg.x as number;
          const y = cfg.y as number;
          const y0 = cfg.y0 as number;
          const width = cfg.size as number;
          return [
            { x: x - width / 2, y: y0 },
            { x: x - width / 2, y: y },
            { x: x + width / 2, y: y },
            { x: x + width / 2, y: y0 },
          ];
        },
        draw(cfg, container) {
          const point: {
            x: number;
            y: number;
          } = {
            x: Array.isArray(cfg.x) && cfg.x[0] ? (cfg.x[0] as number) : (cfg.x as number),
            y: Array.isArray(cfg.y) && cfg.y[0] ? (cfg.y[0] as number) : (cfg.y as number),
          };

          const group = container.addGroup();
          const cfgpoints: any = cfg.points;
          if (cfgpoints) {
            cfgpoints[0].y = getY0(cfgpoints[0].y, cfg.data);
            cfgpoints[3].y = getY0(cfgpoints[3].y, cfg.data);
          }

          const points = (this as Shape).parsePoints(cfgpoints);
          container.addShape('path', {
            attrs: {
              path: [
                ['M', points[0].x, points[0].y],
                ['L', points[1].x, points[1].y],
                ['L', points[2].x, points[2].y],
                ['L', points[3].x, points[3].y],
              ],
              ...cfg.defaultStyle,
              fillOpacity: 0,
            },
          });
          if (cfg.data) {
            if ((cfg.data as any).revenue <= 0) {
              group.addShape('rect', {
                name: 'outer-point',
                attrs: {
                  x: points[0].x,
                  y: wrapRef.current?.offsetWidth * 0.33 - 30,
                  width: 34,
                  height: 11,
                  ...getRectAttr(cfg.data),
                },
              });
            }

            if ((cfg.data as any).revenue > 0) {
              group.addShape('rect', {
                name: 'outer-point',
                attrs: {
                  x: points[0].x,
                  y:
                    point.y > wrapRef.current?.offsetWidth * 0.33 - 30
                      ? wrapRef.current?.offsetWidth * 0.33 - 30
                      : point.y,
                  width: 34,
                  height:
                    wrapRef.current?.offsetWidth * 0.33 - point.y < 11
                      ? 11
                      : wrapRef.current?.offsetWidth * 0.33 - point.y,
                  ...getRectAttr(cfg.data),
                },
              });
            }
          }
          return group;
        },
      });
    }
  }, [wrapRef.current?.offsetWidth]);

  useEffect(() => {
    setData(executeData(revenueComparisonList || [], startTime));
  }, [revenueComparisonList, startTime]);

  return (
    <div className={css.overview} ref={wrapRef}>
      <div className={css.header}>
        <div className={css.title}>
          交易總額{genDataTodayTag(initialState?.currentBaseInfo?.dataSource, startTime)}
        </div>
        {titleNode(formatUnixTimestamp(startTime, settings.systemDateFormat))}
      </div>
      <div className={css.turnover}>
        <div className={css.value}>HKD {props?.totalAmount && props.totalAmount}</div>
        <img src={trend} className={css.tendImg} />
      </div>
      <div
        className={cx(css.dashboardCard, css.statisticColumns, css.table, css.cardBodyPaddingNone)}
      >
        <Spin spinning={false}>
          {data.length > 0 && <p className={css.dashboardCardTitle}>收入對比</p>}
          {!loading ? (
            data.length > 0 ? (
              <>
                <div>
                  <p className={css.dashboardTableTips}>{getLineTitle()}</p>
                </div>
                {wrapRef.current?.offsetWidth && (
                  <Column {...config} height={wrapRef.current.offsetWidth * 0.33} />
                )}
              </>
            ) : (
              wrapRef.current?.offsetWidth && (
                <div className={css.emptyBox} style={{ height: wrapRef.current.offsetWidth * 0.5 }}>
                  <img src={emptyIcon} className={css.emptyImg} />
                  <p className={css.tip}>
                    <p>{getMessage('common.no.data.available', '暫無數據')}</p>
                    <p>
                      {getMessage('dashboard.nodata.makeyourfirstdeal', '快進行第一筆交易吧！')}
                    </p>
                  </p>
                </div>
              )
            )
          ) : (
            <div style={{ height: '320px' }} />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default Overview;
