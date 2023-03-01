import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { GENDER_TEXT, MEMBERAVATAR, MEMBERUNIQUEFLAG } from '@/utils/constants';
import settings from '@/utils/settings';
import { fixedDigit, thousands } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import type { DrawerProps } from 'antd';
import { Button, Spin, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import styles from './index.less';

export type TDetailDrawer = {
  data: any;
  closeDrawer: () => void;
  btnLoading?: boolean;
} & DrawerProps;

const DetailDrawer: React.FC<TDetailDrawer> = (props) => {
  const { getMessage } = useLocale();
  const {
    memberCode = '',
    firstName = '',
    lastName = '',
    mobileAreaCode = '',
    mobile = '',
    email = '',
    gender = '',
    birthday = undefined,
    age = '',
    memberCategoryList = [],
    memberTagList = [],
    totalAmount = '',
    consumeCount = '',
    averageAmount = '',
    registerTime = undefined,
    sourceApplicationName = '',
    modifyTime = undefined,
    modifyAccount = '',
    uniqueFlag = undefined,
  } = props.data;

  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(true);

  useEffect(() => {
    showLoading();
  }, []);

  useEffect(() => {
    // 关闭弹框时，添加loading状态
    if (!props.visible) {
      showLoading();
    }
  }, [props.visible]);

  useEffect(() => {
    if (Object.keys(props.data).length === 0) {
      return;
    }
    hideLoading();
  }, [props.data]);

  return (
    <>
      <KPayDrawer {...props} className={styles.detailDrawer}>
        <Spin spinning={loading}>
          <div className={styles.header}>
            {gender && <img src={MEMBERAVATAR[gender - 1]} className={styles.avatar} />}
            <p className={styles.name}>{`${firstName} ${lastName}`}</p>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.number', '會員編號')}</div>
              <div className={styles.value}>{memberCode}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.firstName', '名字')}</div>
              <div className={styles.value}>{firstName}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.lastName', '姓氏')}</div>
              <div className={styles.value}>{lastName}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.Contact.number', '聯絡電話')}</div>
              <div className={styles.value}>
                {mobileAreaCode ? `+${mobileAreaCode} ${mobile}` : mobile ? `${mobile}` : ''}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('merchant.Email.address', '電郵')}</div>
              <div className={styles.value}>{email}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('merchant.login.account', '登入賬戶')}</div>
              <div className={styles.value}>
                {uniqueFlag === MEMBERUNIQUEFLAG.PHONE
                  ? '+' + `${mobileAreaCode}  ${mobile}`
                  : email}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.gender', '性別')}</div>
              <div className={styles.value}>
                {gender && getMessage(GENDER_TEXT[gender][0], GENDER_TEXT[gender][1])}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.date.of.birth', '出生日期')}</div>
              <div className={styles.value}>
                {birthday !== null && birthday !== ''
                  ? moment(Number(birthday)).format(settings.systemDateFormat)
                  : ''}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.age', '年齡')}</div>
              <div className={styles.value}>{age}</div>
            </div>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.category', '會員類別')}</div>
              <div className={`${styles.value} ${styles.noPadding}`}>
                <div className={styles.categoryBox}>
                  {memberCategoryList &&
                    memberCategoryList.map((item: any) => {
                      return (
                        <Tooltip
                          title={item.memberCategoryName}
                          key={`key_${item.memberCategoryId}`}
                        >
                          <div key={`key_${item.memberCategoryId}`} className={styles.categoryItem}>
                            <div className={styles.text}>{item.memberCategoryName}</div>
                          </div>
                        </Tooltip>
                      );
                    })}
                </div>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.the.label', '標籤')}</div>
              <div className={`${styles.value} ${styles.noPadding}`}>
                <div className={styles.categoryBox}>
                  {memberTagList &&
                    memberTagList.map((item: any) => {
                      return (
                        <Tooltip title={item} key={`key_${item}`}>
                          <div key={`key_${item}`} className={styles.categoryItem}>
                            <div className={styles.text}>{item}</div>
                          </div>
                        </Tooltip>
                      );
                    })}
                </div>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>
                {' '}
                {getMessage('member.total.spending', '消費總額(HKD)')}
              </div>
              <div className={styles.value}>
                {totalAmount === 0
                  ? totalAmount
                  : totalAmount === null
                  ? ''
                  : thousands(fixedDigit(totalAmount))}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>
                {' '}
                {getMessage('member.consumptiontimes', '消費次數')}
              </div>
              <div className={styles.value}>{consumeCount}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>
                {' '}
                {getMessage('member.average.consumption(HKD)', '平均消費額(HKD)')}
              </div>
              <div className={styles.value}>
                {averageAmount === 0
                  ? averageAmount
                  : averageAmount === null
                  ? ''
                  : thousands(fixedDigit(averageAmount))}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>
                {' '}
                {getMessage('member.registration.time', '註冊時間')}
              </div>
              <div className={styles.value}>
                {registerTime &&
                  moment(Number(registerTime)).format(settings.systemDateTimeSecFormat)}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>
                {' '}
                {getMessage('member.registered.source', '註冊來源')}
              </div>
              <div className={styles.value}>{sourceApplicationName}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.Update.time', '更新時間')}</div>
              <div className={styles.value}>
                {modifyTime && moment(Number(modifyTime)).format(settings.systemDateTimeSecFormat)}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('member.Update.account', '更新賬戶')}</div>
              <div className={styles.value}>{modifyAccount}</div>
            </div>
          </div>
          <div className={styles.footerBox}>
            <Button
              onClick={props.closeDrawer}
              loading={props.btnLoading || false}
              className={styles.gotoEdit}
            >
              {getMessage('member.editor', '編輯')}
            </Button>
          </div>
        </Spin>
      </KPayDrawer>
    </>
  );
};

export default DetailDrawer;
