import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { Button, Form, Input, Select, Space, Spin } from 'antd';
import styles from '../index.less';
import { useEffect, useState } from 'react';
import settings from '@/utils/settings';
import { merchantApi } from '@/services';
import { notify } from '@/utils/antdUtils';
import { find, keyBy, map } from 'lodash';
import { CloseOutlined } from '@ant-design/icons';

export type EditSkuDrawerProps = {
  skuPropertyNameId: string;
} & KPayDrawerProps;

type TOptionsObjValue = {
  propertyValue: string;
  sort: number;
};

type TOptionsObj = {
  propertyName: string;
  propertyValueList?: TOptionsObjValue[];
};

// 錯誤記錄
type TErrorObj = { errorStatus: 'error' | undefined; errorMsg?: string };

const EditSkuDrawer: React.FC<EditSkuDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);
  // 提交loading
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  // 搜索文本
  const [searchValue, setSearchValue] = useState<string>('');

  // 選項列表
  const [optionsObj, setOptionsObj] = useState<TOptionsObj>({
    propertyName: '',
  });

  // 選項值對象
  const [optionsValByKey, setOptionsValByKey] = useState<Record<string, TOptionsObjValue>>();

  // 選項列表錯誤合集
  const [optionsErrorObj, setOptionsErrorObj] = useState<TErrorObj>({} as any);

  // 提交編輯選項
  const submitSkuModify = () => {
    if (!props?.skuPropertyNameId || !optionsObj?.propertyName) {
      optionsErrorObj.errorStatus = 'error';
      optionsErrorObj.errorMsg = getMessage(
        'commodity.common.optionn.name.placeholder',
        '請輸入選項名稱',
      );
      setOptionsErrorObj({ ...optionsErrorObj });
      return;
    }

    setSubmitLoading(true);
    merchantApi
      .postProductSkuPropertyModify({
        companyProductSkuPropertyNameId: props?.skuPropertyNameId,
        ...optionsObj,
      })
      .then((res) => {
        setSubmitLoading(false);
        if (res.success) {
          notify.modifySuccess();
          props?.closeCb?.(true);
        }
      })
      .catch(() => {
        setSubmitLoading(false);
      });
  };

  useEffect(() => {
    if (props.open && props.skuPropertyNameId) {
      setInitLoading(true);
      merchantApi
        .getProductSkuPropertyInfo({
          companyProductSkuPropertyNameId: props.skuPropertyNameId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            setOptionsValByKey(keyBy(res.data?.propertyValueList, 'propertyValue'));

            setOptionsObj({
              propertyName: res.data?.propertyName,
              propertyValueList: res.data?.propertyValueList,
            });
          }
        })
        .catch(() => {
          setInitLoading(false);
        });
    }
  }, [props.open]);

  return (
    <KPayDrawer
      width={782}
      maskClosable={false}
      destroyOnClose
      key={props.skuPropertyNameId}
      className={styles.skuDetailDrawer}
      open={props?.open}
      onClose={props.closeCb}
      title={getMessage('common.editor', '編輯')}
    >
      <Spin spinning={initLoading}>
        <div className={styles.optionWapper}>
          <Form.Item
            required={true}
            validateStatus={optionsErrorObj?.errorStatus}
            help={optionsErrorObj?.errorMsg}
            label={
              <>
                <span className={styles.optionItem}>
                  {getMessage('commodity.common.optionn.name', '選項名稱')}
                </span>
                <span className={styles.optionTips}>
                  {getMessage('commodity.sku.optionn.name.tips', '（尺寸、顏色）')}
                </span>
              </>
            }
          >
            <Input
              className={styles.selectInput}
              placeholder={getMessage(
                'commodity.common.optionn.name.placeholder',
                '請輸入選項名稱',
              )}
              maxLength={settings.skuOptionNameMaxLength}
              value={optionsObj.propertyName}
              onBlur={(e) => {
                const $value = e.target.value;
                if ($value) {
                  setOptionsErrorObj({
                    errorStatus: undefined,
                  });
                }
              }}
              onChange={(e) => {
                setOptionsObj({
                  ...optionsObj,
                  ['propertyName']: e.target.value,
                });
              }}
            />
          </Form.Item>
          <div className={styles.detailSetSepWapper}>
            <span className={styles.detailSetSep} />
          </div>
          <Form.Item
            label={
              <>
                <span className={styles.optionItem}>
                  {getMessage('commodity.common.optionn.val', '選項值')}
                </span>
                <span className={styles.optionTips}>
                  {getMessage('commodity.sku.optionn.val.tips', '（L、S、黃色、紅色）')}
                </span>
              </>
            }
          >
            <Select
              className={styles.selectInput}
              placeholder={getMessage('commodity.common.optionn.val.placeholder', '請輸入選項值')}
              mode="tags"
              open={false}
              maxTagCount={settings.skuValueMaxCount}
              maxTagTextLength={settings.skuOptionValMaxLength}
              searchValue={searchValue}
              value={map(optionsObj.propertyValueList, 'propertyValue')}
              onSearch={(value) => {
                if ((optionsObj?.propertyValueList?.length ?? 0) >= settings.skuValueMaxCount) {
                  return setSearchValue('');
                }
                if (value.length <= settings.skuOptionValMaxLength) {
                  return setSearchValue(value);
                }
              }}
              onSelect={() => {
                if (find(optionsObj?.propertyValueList, ['propertyValue', searchValue])) {
                  setSearchValue('');
                }
              }}
              onChange={(e) => {
                setSearchValue('');
                if (e.length > settings.skuValueMaxCount) {
                  return;
                }

                const valueList: TOptionsObj['propertyValueList'] = [] as any;
                e.forEach((val: string, key: number) => {
                  if (optionsValByKey?.[val]) {
                    valueList?.push(optionsValByKey?.[val]);
                  } else {
                    valueList?.push({
                      propertyValue: val,
                      sort: key,
                    });
                  }
                });
                setOptionsObj({
                  ...optionsObj,
                  ['propertyValueList']: valueList,
                });
              }}
              tagRender={({ value, onClose }) => {
                if (value.length > settings.skuOptionValMaxLength) {
                  return <></>;
                }
                return (
                  <div className={styles.optionTagWapper}>
                    <span className={styles.optionTagItem}>{value}</span>
                    <div className={styles.optionTagIcon} onClick={onClose}>
                      <CloseOutlined className={styles.close} />
                    </div>
                  </div>
                );
              }}
            />
          </Form.Item>
        </div>
        <Space className="fr">
          <Button
            className={styles.drawerBtnNormal}
            onClick={() => {
              props.closeCb?.();
            }}
          >
            {getMessage('common.cancel', '取消')}
          </Button>
          <Button
            type="primary"
            className={styles.drawerBtnPrimary}
            loading={submitLoading}
            onClick={() => {
              submitSkuModify();
            }}
          >
            {getMessage('common.confirm', '確認')}
          </Button>
        </Space>
      </Spin>
    </KPayDrawer>
  );
};

export default EditSkuDrawer;
