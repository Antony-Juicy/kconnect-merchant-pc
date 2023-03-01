import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { Button, Form, Input, Select, Space } from 'antd';
import styles from '../index.less';
import delSku from '@/assets/svgs/del-sku.svg';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { randomRangeId } from '@/utils/utils';
import settings from '@/utils/settings';
import { merchantApi } from '@/services';
import { filter, find, isEmpty } from 'lodash';
import { notify } from '@/utils/antdUtils';
import { useEffect } from 'react';
import cx from 'classnames';

export type CreateSkuDrawerProps = {} & KPayDrawerProps;

type TOptionsList = {
  optionsId: string;
  propertyName: string;
  propertyValueList?: [
    {
      propertyValue: string;
      sort: number;
    },
  ];
};
// 搜索文本列表
type TSearchValueObj = Record<string, string>;

// 錯誤記錄列表
type TErrorList = Record<string, { errorStatus: 'error' | undefined; errorMsg?: string }>;

const CreateSkuDrawer: React.FC<CreateSkuDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  // 提交loading
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  // 搜索文本
  const [searchValueObj, setSearchValueObj] = useState<TSearchValueObj>({} as any);

  // 選項列表
  const [optionsList, setOptionsList] = useState<TOptionsList[]>([
    {
      optionsId: randomRangeId(8),
      propertyName: '',
    },
  ]);

  // 選項列表錯誤合集
  const [optionsErrorList, setOptionsErrorList] = useState<TErrorList>({} as any);

  // 提交添加選項
  const submitSkuAdd = () => {
    const errorList: TErrorList = {} as any;
    optionsList.forEach((item) => {
      if (!item.propertyName) {
        errorList[item.optionsId] = {
          errorStatus: 'error',
          errorMsg: getMessage('commodity.common.optionn.name.placeholder', '請輸入選項名稱'),
        };
      }
    });

    setOptionsErrorList(errorList);
    if (!isEmpty(errorList)) {
      return;
    }

    setSubmitLoading(true);
    merchantApi
      .postProductSkuPropertyAdd(optionsList)
      .then((res) => {
        setSubmitLoading(false);
        if (res.success) {
          notify.createSuccess();
          props?.closeCb?.(true);
        }
      })
      .catch(() => {
        setSubmitLoading(false);
      });
  };

  // 新增選項
  const addSkuPropItem = () => {
    setOptionsList([
      ...optionsList,
      {
        optionsId: randomRangeId(8),
        propertyName: '',
      },
    ]);
  };

  // 刪除options
  const delSkuInfo = (index: number) => {
    optionsList.splice(index, 1);

    if (optionsList.length <= 0) {
      setOptionsList([
        {
          optionsId: randomRangeId(8),
          propertyName: '',
        },
      ]);
    } else {
      setOptionsList([...optionsList]);
    }
  };

  useEffect(() => {
    if (props.open) {
      setSubmitLoading(false);
      setSearchValueObj({} as any);
      setOptionsList([
        {
          optionsId: randomRangeId(8),
          propertyName: '',
        },
      ]);
      setOptionsErrorList({} as any);
    }
  }, [props.open]);

  return (
    <KPayDrawer
      width={782}
      maskClosable={false}
      destroyOnClose
      className={styles.skuDetailDrawer}
      open={props?.open}
      onClose={props.closeCb}
      title={getMessage('common.create', '新增')}
    >
      {optionsList &&
        optionsList.map((item, index) => {
          return (
            <div key={item.optionsId} className={styles.optionWapper}>
              <Form.Item
                required={true}
                validateStatus={optionsErrorList[item.optionsId]?.errorStatus}
                help={optionsErrorList[item.optionsId]?.errorMsg}
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
                  className={cx(styles.selectInput, styles.optionNameInput)}
                  placeholder={getMessage(
                    'commodity.common.optionn.name.placeholder',
                    '請輸入選項名稱',
                  )}
                  maxLength={settings.skuOptionNameMaxLength}
                  onBlur={(e) => {
                    const $value = e.target.value;
                    if ($value && filter(optionsList, ['propertyName', $value]).length > 1) {
                      setOptionsErrorList({
                        ...optionsErrorList,
                        [item.optionsId]: {
                          errorStatus: 'error',
                          errorMsg: getMessage(
                            'commodity.common.optionn.name.repeat.placeholder',
                            '選項名稱重複',
                          ),
                        },
                      });
                    } else if ($value) {
                      setOptionsErrorList({
                        ...optionsErrorList,
                        [item.optionsId]: {
                          errorStatus: undefined,
                        },
                      });
                    }
                  }}
                  onChange={(e) => {
                    optionsList[index] = {
                      ...optionsList[index],
                      ['propertyName']: e.target.value,
                    };
                    setOptionsList([...optionsList]);
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
                  placeholder={getMessage(
                    'commodity.common.optionn.val.placeholder',
                    '請輸入選項值',
                  )}
                  mode="tags"
                  open={false}
                  maxTagCount={settings.skuValueMaxCount}
                  maxTagTextLength={settings.skuOptionValMaxLength}
                  searchValue={searchValueObj[item.optionsId]}
                  onSearch={(value) => {
                    if (
                      (optionsList?.[index]?.propertyValueList?.length ?? 0) >=
                      settings.skuValueMaxCount
                    ) {
                      return setSearchValueObj({ ...searchValueObj, [item.optionsId]: '' });
                    }
                    if (value.length <= settings.skuOptionValMaxLength) {
                      return setSearchValueObj({ ...searchValueObj, [item.optionsId]: value });
                    }
                  }}
                  onSelect={() => {
                    if (
                      find(optionsList?.[index]?.propertyValueList, [
                        'propertyValue',
                        searchValueObj[item.optionsId],
                      ])
                    ) {
                      setSearchValueObj({ ...searchValueObj, [item.optionsId]: '' });
                    }
                  }}
                  onChange={(e) => {
                    setSearchValueObj({ ...searchValueObj, [item.optionsId]: '' });
                    if (e.length > settings.skuValueMaxCount) {
                      return;
                    }

                    const valueList: TOptionsList['propertyValueList'] = [] as any;
                    e.forEach((val: string, key: number) => {
                      valueList?.push({
                        propertyValue: val,
                        sort: key,
                      });
                    });
                    optionsList[index] = {
                      ...optionsList[index],
                      ['propertyValueList']: valueList,
                    };
                    setOptionsList([...optionsList]);
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
              <div className={styles.detailSetSepWapper}>
                <img
                  src={delSku}
                  className={styles.delSkuIcon}
                  onClick={() => {
                    delSkuInfo(index);
                  }}
                />
              </div>
            </div>
          );
        })}
      <div className={styles.mb24}>
        <Button onClick={addSkuPropItem}>
          <PlusOutlined />
          {getMessage('commodity.sku.property.create', '新增選項')}
        </Button>
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
            submitSkuAdd();
          }}
        >
          {getMessage('common.confirm', '確認')}
        </Button>
      </Space>
    </KPayDrawer>
  );
};

export default CreateSkuDrawer;
