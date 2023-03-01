import emptyIcon from '@/assets/svgs/noDataBg.svg';
import AnnounceDrawer from '@/components/AnnounceDrawer';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { ApplicationNotificationListSimpleResponse } from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import type { IApiResponse } from '@/utils/request';
import { formatUnixTimestamp } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import { Badge, Skeleton, Typography } from 'antd';
import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import css from './update.less';

// value = target / 244 * 12.7

const Update: React.FC = () => {
  const [simpleNoticeDate, setSimpleNoticeData] = useState<any[]>([]);
  const [applicationId, setApplicationId] = useState('');
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);
  const { listRefresh } = useModel('useNotificationModel');
  const [visible, { setTrue: showVisible, setFalse: hideVisible }] = useBoolean(false);
  const { getMessage } = useLocale();

  const getNoticeSimpleData = async () => {
    showLoading();
    await merchantApi
      .getApplicationNotificationListSimple()
      .then((res: IApiResponse<ApplicationNotificationListSimpleResponse>) => {
        if (!!res?.data?.length) {
          setSimpleNoticeData(res?.data);
        } else {
          setSimpleNoticeData([]);
        }
      })
      .catch(() => {
        setSimpleNoticeData([]);
        hideLoading();
      });
    hideLoading();
  };

  const clickNoticeItem = async (item: any, index: number) => {
    if (!item?.readFlag) {
      simpleNoticeDate[index].readFlag = 1;
    }
    setApplicationId(item.applicationId);
    setSimpleNoticeData(simpleNoticeDate);
    showVisible();
    event(BuriedPoint.KC_OA_NOTIF_PREVIEW_TAPPED);
  };

  const clickViewMore = () => {
    if (simpleNoticeDate?.length > 0) {
      setApplicationId(simpleNoticeDate[0]?.applicationId);
      showVisible();
    } else {
      setApplicationId('');
    }
    event(BuriedPoint.KC_OA_NOTIF_MOREDTL_TAPPED);
  };

  useEffect(() => {
    getNoticeSimpleData();
  }, []);

  useEffect(() => {
    if (!!listRefresh) {
      getNoticeSimpleData();
    }
  }, [listRefresh]);

  return (
    <div className={css.update}>
      <>
        <Skeleton loading={loading}>
          <div className={css.header} onClick={clickViewMore}>
            <div className={css.title}>
              {getMessage('notice.noticedrawer.applicationnotification', '應用通知')}
            </div>
            <div className={cx(css.more, simpleNoticeDate.length > 0 ? '' : css.none)}>
              {getMessage('notice.noticedrawer.seemore', '更多')}
            </div>
          </div>

          {simpleNoticeDate.length > 0 ? (
            <div className={css.announceList}>
              {!!simpleNoticeDate &&
                simpleNoticeDate.map((item: any, index: number) => {
                  return (
                    <div
                      key={item?.applicationId}
                      onClick={() => clickNoticeItem(item, index)}
                      className={css.announceItem}
                    >
                      <div className={css.iconContainer}>
                        <Badge dot={!item?.readFlag ? true : false}>
                          <img className={css.announceicon} src={item?.icon} alt="" />
                        </Badge>
                      </div>
                      <div className={css.announceContent}>
                        <Typography.Paragraph
                          className={css.title}
                          ellipsis={{ rows: 1, tooltip: true }}
                        >
                          <span className={css.noticeContentContainer}>
                            {item?.applicationName}
                          </span>
                        </Typography.Paragraph>
                        <Typography.Paragraph
                          className={css.description}
                          ellipsis={{ rows: 1, tooltip: true }}
                        >
                          <span className={css.noticeContentContainer}>{item?.content}</span>
                        </Typography.Paragraph>
                      </div>
                      <div className={css.announceTime}>
                        <p>{formatUnixTimestamp(item?.notificationTime, 'DD/MM HH:mm')}</p>
                        <br />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className={css.emptyBox}>
              <img src={emptyIcon} className={css.emptyImg} />
              <p className={css.tip}>
                <p> {getMessage('menuRender.nodata', '暫無數據')}</p>
                <p>
                  {getMessage(
                    'menuRender.openanapptointegrateandmanageallmessagehere',
                    '開通應用，在此整合管理所有消息',
                  )}
                </p>
              </p>
            </div>
          )}
        </Skeleton>
      </>

      <AnnounceDrawer visible={visible} applicationId={applicationId} onClose={hideVisible} />
    </div>
  );
};

export default Update;
