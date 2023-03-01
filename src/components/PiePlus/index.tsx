import { measureTextWidth, Pie } from '@ant-design/plots';
import React, { useEffect, useState } from 'react';
import Styles from './index.less';

const pieLegendColor = ['#F8A838', '#FFC629', '#FFE200', '#BDBDBD', '#98989A', '#6E655A'];

const dataTest = [
  {
    section: '0',
    sectionValue: 0,
  },
];

const PiePlus: React.FC<any> = (props) => {
  const ref = React.useRef();
  const [data, setData] = useState(dataTest);
  const [title, setTitle] = useState(dataTest);
  const renderStatistic = (containerWidth: any, text: any, style: any) => {
    const { width: textWidth, height: textHeight } = measureTextWidth(text, style);
    const R = containerWidth / 2;
    let scale = 1;
    if (containerWidth < textWidth) {
      scale = Math.min(
        Math.sqrt(
          Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2))),
        ),
        1,
      );
    }
    const textStyleStr = `width:${containerWidth}px;`;
    return `<div style="${textStyleStr};font-size:${scale}em;line-height:${
      scale < 1 ? 1 : 1.2
    };">${text}</div>`;
  };

  useEffect(() => {
    setTitle(props.title);
    setData(props.data);
  }, [props]);

  const pieConfig = {
    data,
    padding: [35, -0, 15, 0],
    margin: 0,
    angleField: 'sectionValue',
    colorField: 'section',
    radius: 1,
    innerRadius: 0.69,
    meta: {
      value: {
        formatter: (v: string) => `${v} ¥`,
      },
    },
    animation: false,
    state: {
      // 设置 active 激活状态的样式
      active: {
        animate: { duration: 600, easing: 'ease' },
        style: (element: any) => {
          const shape = element.shape;
          return {
            lineWidth: 9,
            shadowBlur: 8,
            offsetX: 6,
            offsetY: 10,
            shadowColor: shape.attr('fill'),
            stroke: shape.attr('fill'),
            fillOpacity: shape.attr('strokeOpacity'),
            lineOpacity: shape.attr('strokeOpacity'),
          };
        },
      },
    },
    label: false,
    color: ['#F8A838', '#FFC629', '#FFE200', '#BDBDBD', '#98989A', '#6E655A'],
    statistic: {
      title: {
        offsetY: 2,
        offsetX: -3,
        style: {
          fontSize: '24px',
          fontWeight: 500,
          color: '#262626',
        },
        // eslint-disable-next-line @typescript-eslint/no-shadow
        customHtml: (container: any, view: any, datum: any, data: any) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const total = data.reduce((r: number, d: any) => r + d.sectionValue, 0);
          let percentage = '';
          if (!!datum) {
            percentage = !!datum?.sectionValue
              ? ((datum?.sectionValue / total) * 100).toFixed(0) == '100'
                ? '\xa0' + '100%'
                : ((datum?.sectionValue / total) * 100).toFixed(0).length > 1
                ? ((datum?.sectionValue / total) * 100).toFixed(2) + '%'
                : '\xa0' + ((datum?.sectionValue / total) * 100).toFixed(2) + '%'
              : '0%';
          }
          const text = datum ? percentage : '';
          return renderStatistic(d, text, { fontSize: 24 });
        },
      },
      content: {
        offsetY: 9,
        style: {
          fontSize: '12.5px',
          color: '#8C8C8C',
          fontWeight: '100',
          lineHeight: '30px',
          letterSpacing: '0.8px',
        },
        customHtml: (container: any, view: any, datum: any) => {
          const { width } = container.getBoundingClientRect();
          const text = datum ? `${title}  ${datum.section}` : '';
          return renderStatistic(width, text, { fontSize: 12 });
        },
      },
    },
    legend: false,
    tooltip: false,
    // 添加 中心统计文本 交互
    interactions: [
      { type: 'element-active' },
      { type: 'pie-statistic-active' },
      { type: 'pie-statistic-active' },
    ],
  };

  // config 配置里面包含了function，内部比对被认为是更新，执行了 update 操作，
  // 可以考虑把 Pie 放到 useMemo 中，类似 pureComponent。
  const handleLegendEnter = (item: any) => {
    if (ref.current && item) {
      const pieChart = ref.current?.getChart();
      const chart = pieChart.chart;
      const innerView = chart.createView();
      pieChart.setState(
        'active',
        (a: any) => {
          if (a.section === item.section) {
            return false;
          } else {
            return true;
          }
        },
        false,
      );
      pieChart.setState(
        'active',
        (a: any) => {
          if (a.section === item.section) {
            return true;
          } else {
            return false;
          }
        },
        true,
      );
      // 绘制 annotation
      innerView.annotation().clear(true);
      const total = data?.reduce((r, d) => r + d.sectionValue, 0);
      const text = !!item?.sectionValue
        ? ((item?.sectionValue / total) * 100).toFixed(0) == '100'
          ? '100%'
          : Number(((item?.sectionValue / total) * 100).toFixed(0)) > 10
          ? ((item?.sectionValue / total) * 100).toFixed(2) + '%'
          : '\xa0' + ((item?.sectionValue / total) * 100).toFixed(2) + '%'
        : '0%';
      innerView
        .annotation()
        .text({
          position: ['51%', '49%'],
          content: text,
          style: {
            fontSize: 24,
            fill: '#262626',
            textAlign: 'center',
            fontWeight: '500',
          },
          offsetY: -20,
        })
        .text({
          position: ['50%', '41%'],
          content: `${title} ` + (item.section ? `${item.section}` : ``),
          style: {
            fontSize: 12,
            fill: '#8C8B8B',
            textAlign: 'center',
            fontWeight: '400',
            letterSpacing: '1px',
          },
          offsetY: 20,
        });
      innerView.render(true);

      chart.on('element:statechange', (ev: any) => {
        const { stateStatus } = ev.gEvent.originalEvent;
        if (!stateStatus) {
          innerView.annotation().clear(true);
          innerView.render(true);
        }
      });
    }
  };

  const handleLegendLeave = (item: any) => {
    if (ref.current && item) {
      const pieChart = ref.current.getChart();
      const chart = pieChart.chart;
      const innerView = chart.createView();
      innerView.annotation().clear(true);
      innerView.render(true);
      pieChart.setState(
        'active',
        () => {
          return true;
        },
        false,
      );
    }
  };

  return (
    <div className={Styles.pieChartContainer}>
      {!!props ? <Pie className={Styles.pieChart} {...pieConfig} ref={ref} /> : ''}
      <div className={Styles.pieLegendContainer}>
        <div className={Styles.pieLegendULContainer}>
          {data?.map((item, i: number) => (
            <div
              key={item.section}
              className={Styles.legenditem}
              onMouseEnter={() => handleLegendEnter(item)}
              onMouseLeave={() => handleLegendLeave(item)}
            >
              <span
                className={Styles.legendIcon}
                style={{
                  background: pieLegendColor[i],
                }}
              />
              <span>{item.section}</span>
              <span className={Styles.legendValue}>{item.sectionValue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PiePlus;
