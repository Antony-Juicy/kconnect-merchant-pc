import emptyIcon from '@/assets/svgs/noDataBg.svg';
import useLocale from '@/hooks/useLocale';

import type { DashboardMerchantTransactionStatisticsResponse } from '@/services/api';
import { genDataTodayTag } from '@/utils/antdUtils';
import { paymentMethods, PAYMENT_CHANNEL } from '@/utils/paymentMethod';
import settings from '@/utils/settings';
import {
  bigDecimalAdd,
  bigDecimalDivide,
  bigDecimalMultiply,
  fixedDigit,
  formatUnixTimestamp,
  thousands,
} from '@/utils/utils';
import { Col, Progress, Row, Spin, Tooltip } from 'antd';
import cx from 'classnames';
import { orderBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { titleNode } from '../../index';
import css from './pay.less';

type TStatsTable = {
  loading: boolean;
  startTime: number;
  mostPayMethod?: string;
  paymentMethodList: DashboardMerchantTransactionStatisticsResponse['paymentMethodList'];
};

// value = target / 670 * 34.9

const Pay: React.FC<TStatsTable> = (props) => {
  const { loading, mostPayMethod, paymentMethodList, startTime } = props;
  const { initialState } = useModel('@@initialState');
  const { getMessage } = useLocale();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [paymentList, setPaymentList] = useState<
    DashboardMerchantTransactionStatisticsResponse['paymentMethodList']
  >([]);

  // 获取百分比
  const getPre = (value: number) => {
    if (totalAmount) {
      return bigDecimalMultiply(bigDecimalDivide(value, totalAmount, 4), 100);
    }
    return 0;
  };

  useEffect(() => {
    if (paymentMethodList) {
      let total = 0;
      paymentMethodList.forEach((item) => {
        total = bigDecimalAdd(total, item.propValue ?? 0, 2);
      });
      setTotalAmount(total);

      setPaymentList(orderBy(paymentMethodList, ['propValue', 'priority'], ['desc', 'desc']));
    }
  }, [paymentMethodList]);

  return (
    <div className={css.pay}>
      <Spin spinning={loading}>
        <div className={css.header}>
          <div className={css.content}>
            <div className={css.title}>付款方式</div>
            {paymentList && paymentList.length > 0 ? (
              <div className={css.info}>
                <span className={css.value} style={{ color: '#fba21f' }}>
                  {formatUnixTimestamp(startTime, settings.systemOnlyDateFormat) +
                    genDataTodayTag(initialState?.currentBaseInfo?.dataSource, startTime)}
                </span>
                &nbsp;
                <span>付款方式最大佔比 </span>&nbsp;
                <span className={css.value} style={{ color: '#ffa400' }}>
                  {mostPayMethod ? PAYMENT_CHANNEL[mostPayMethod] : ''}
                </span>
              </div>
            ) : (
              <></>
            )}
          </div>
          {titleNode(formatUnixTimestamp(startTime, settings.systemDateFormat))}
        </div>
        <div className={cx(css.list, css.statisticTable)}>
          {paymentList && paymentList.length > 0 ? (
            <Row>
              <Col span="8" className={css.statisticTableListTh}>
                付款方式
              </Col>
              <Col span="8" className={css.statisticTableListTh}>
                佔比
              </Col>
              <Col
                span="8"
                className={css.statisticTableListTh}
                style={{ textAlign: 'right', paddingRight: '8px' }}
              >
                金額(HKD)
                <span className={css.statisticTableListThTips}>不包含退款</span>
              </Col>
            </Row>
          ) : (
            <></>
          )}
          <div className={css.statisticTableBody}>
            {paymentList && paymentList.length > 0 ? (
              paymentList.map((item) => {
                return (
                  <>
                    <Row className={css.statisticTableListTd}>
                      <Col span="8" className={css.statisticTableType}>
                        <img
                          src={item.propName ? paymentMethods[item.propName] : ''}
                          className={css.statisticTableIcon}
                        />
                        <span>{item.propName ? PAYMENT_CHANNEL[item.propName] : ''}</span>
                      </Col>
                      <Col span="8" style={{ paddingRight: '8px' }}>
                        <Progress
                          className={css.statisticProgress}
                          percent={getPre(item.propValue ?? 0)}
                          format={(percent) => percent + '%'}
                          status="normal"
                          strokeColor={'#FFA400'}
                          strokeWidth={8}
                        />
                      </Col>
                      <Col span="8" className={css.statisticTableMoney}>
                        <Tooltip placement="topLeft" title={thousands(fixedDigit(item.propValue))}>
                          {thousands(fixedDigit(item.propValue))}
                        </Tooltip>
                      </Col>
                    </Row>
                  </>
                );
              })
            ) : (
              <div className={css.emptyBox}>
                <img src={emptyIcon} className={css.emptyImg} />
                <p className={css.tip}>
                  <p>{getMessage('common.no.data.available', '暫無數據')}</p>
                  <p>{getMessage('dashboard.nodata.makeyourfirstdeal', '快進行第一筆交易吧！')}</p>
                </p>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Pay;
