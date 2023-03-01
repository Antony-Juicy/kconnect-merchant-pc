import React, { useState, useRef, forwardRef, useEffect, useImperativeHandle } from 'react';
import styles from './index.less';
import { Card, Form, Input, Select, Table, Switch, Tooltip, Spin } from 'antd';
import type { FormInstance } from 'antd';
import classNames from 'classnames';
import KSelect from '../KSelect';
import type { ProductSkuPropertyListResponse, ProductInfoResponse } from '@/services/api';
import { notify } from '@/utils/antdUtils';
import type { ColumnsType } from 'antd/es/table';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import settings from '@/utils/settings';
import { mapHashAnchor } from '../TitleTabs';
import saveIcon from '@/assets/images/products/saveIcon.png';
import removeIcon from '@/assets/images/products/removeIcon.png';
import addOption from '@/assets/images/products/addOption.png';
import arrayOption from '@/assets/images/products/arrayOption.png';
import { verifyNumber } from '@/utils/utils';

const initRecord = {
  originalPrice: '',
  specialPrice: '',
  costPrice: '',
  skuCode: '',
  barCode: '',
  salesState: 1,
};

interface SelectOptionProps {
  companyProductSkuPropertyNameId: number;
  propertyName: string;
}

interface StyleOptionsProps {
  // 是否为编辑
  isEdit: boolean;
  // 款式選項表单实例
  refForm: FormInstance<any>;
  // 商品资料表单实例
  productInfoForm: FormInstance<any>;
  // 组件实例
  ref: any;
  // 是否改变值状态
  pageChangeValue: () => void;
  // 商品上否上下架
  salesState: number;
}

// 用于组装uuid的标识 黑-_-123 白-_-345
const symbol = '-_-';

// sku编码 和 skucode，限制规则
const SKU_CODE_REG_MATCH = /[\u4e00-\u9fa5a-zA-Z0-9-_]/g;

const StyleOptions: React.FC<StyleOptionsProps> = forwardRef((props, ref) => {
  const { getMessage } = useLocale();
  const { isEdit, refForm, productInfoForm, pageChangeValue, salesState } = props;
  // 款式选项名列表
  const [propertyList, setPropertyList] = useState<ProductSkuPropertyListResponse>([]);
  // 表格项，表头
  const [columns, setColumns] = useState<ColumnsType<any>>([]);
  // 表格列表数据（ 商品類別）
  const [dataSource, setDataSource] = useState<any[]>([]);
  // sku组合数据，提供接口参数
  const SUKMapData = useRef({});
  // 是否启用回填，
  const isBackfill = useRef(false);
  // sku列表数据，组合选项
  const productSkuListRef = useRef<ProductInfoResponse['productSkuList']>([]);
  // 索引标记，确认唯一标识
  const indexSign = useRef(1);
  // 選項組合項目列
  const [SKUCombination, setSKUCombination] = useState(() => {
    const SKUList = [
      {
        key: `option${indexSign.current}`,
        value: `value${indexSign.current}`,
        uid: indexSign.current,
        search: '',
        productSkuPropertyNameId: '',
        productSkuPropertyValueList: [],
      },
    ];
    refForm.setFieldValue('SKUCombination', SKUList);
    return SKUList;
  });
  // 页面loading
  const [optionLoading, setOptionLoading] = useState(false);
  // 是否开始实时更新
  const realTimeUpdate = useRef(false);
  // 选项名
  const [optionName, setOptionName] = useState('');
  // 选项值
  const [optionValue, setOptionValue] = useState([]);

  // 更新排列商品
  const updateLineItems = () => {
    if (realTimeUpdate.current) {
      setTimeout(() => {
        refForm.submit();
      }, 14);
    }
  };

  // 删除suk列表记录
  const removeRecord = (record: any, index: number) => {
    const { uuid } = record;
    // 把删除的标识变成数组，以便于排查
    const removeKeyList = uuid.split(symbol);
    // 上传传递给接口的参数
    delete SUKMapData.current[uuid];
    refForm.setFieldValue('SUKMapData', SUKMapData.current);
    // 更新商品类别数据
    setDataSource((oldData) => {
      // 新的商品类别数据
      const newDataSource = oldData.filter((_, i) => i != index);
      // 新数据的所有选项值
      const allValueList: string[] = [];
      newDataSource.forEach((item) => allValueList.push(...item.uuid.split(symbol)));
      // 筛选匹配移除的选项值
      removeKeyList.forEach((item: string, i: number) => {
        if (!allValueList.includes(item)) {
          const value = refForm.getFieldValue(SKUCombination[i]?.value);
          const newValue = value.filter((text: string) => item != text);
          refForm.setFieldValue(SKUCombination[i]?.value, newValue);
          if (!newValue.length) {
            refForm.setFieldValue(SKUCombination[i]?.key, null);
          }
        }
      });
      refForm.setFieldValue('dataSource', newDataSource);
      return newDataSource;
    });
    pageChangeValue();
  };

  // 收集suk数据
  const collectingDataSKU = (value: any, key: string, uuid: string) => {
    SUKMapData.current = {
      ...SUKMapData.current,
      [uuid]: {
        ...SUKMapData.current[uuid],
        [key]: value,
      },
    };
    refForm.setFieldValue('SUKMapData', SUKMapData.current);
    pageChangeValue();
  };

  // 更新商品类别表单值
  const updateTableSku = (key: string, id: string, value: any) => {
    setDataSource((oldData: any) => {
      const newData = JSON.parse(JSON.stringify(oldData));
      newData.forEach((item: any) => {
        if (item.uuid == id) {
          item[key] = value;
        }
      });
      return newData;
    });
  };

  // 价格限制规则
  const restrictionRules = (value: any) => {
    return verifyNumber(value, '', {
      price: settings.priceMaxAmount,
    });
  };

  // 更新数据商品排列表格数据、接口传参
  const updateProductArrangement = (value: any, key: string, uuid: string) => {
    updateTableSku(key, uuid, value);
    collectingDataSKU(value, key, uuid);
  };

  // 默认固定的表头栏目
  const initColumns: ColumnsType<any> = [
    {
      title: `${getMessage('commodity.addProduct.original.price', '原價')}(HKD)`,
      dataIndex: 'originalPrice',
      width: 112,
      render: (text: string, record: any) => {
        return (
          <Input
            value={text}
            onChange={(e) => {
              const value = restrictionRules(e.target.value);
              updateProductArrangement(value, 'originalPrice', record.uuid);
            }}
          />
        );
      },
    },
    {
      title: `${getMessage('commodity.addProduct.specials', '特價')}(HKD)`,
      dataIndex: 'specialPrice',
      width: 112,
      render: (text: string, record: any) => {
        return (
          <Input
            value={text}
            onChange={(e) => {
              const value = restrictionRules(e.target.value);
              updateProductArrangement(value, 'specialPrice', record.uuid);
            }}
          />
        );
      },
    },
    {
      title: `${getMessage('commodity.addProduct.cost', '成本')}(HKD)`,
      dataIndex: 'costPrice',
      width: 112,
      render: (text: string, record: any) => {
        return (
          <Input
            value={text}
            onChange={(e) => {
              const value = restrictionRules(e.target.value);
              updateProductArrangement(value, 'costPrice', record.uuid);
            }}
          />
        );
      },
    },
    {
      title: getMessage('commodity.addProduct.sku.no', 'SKU編號'),
      dataIndex: 'skuCode',
      width: 155,
      render: (text: string, record: any) => {
        return (
          <Input
            value={text}
            maxLength={settings.skuOptionNameMaxLength}
            onChange={(e) => {
              updateProductArrangement(e.target.value, 'skuCode', record.uuid);
            }}
            onBlur={(e) => {
              const value = (e.target.value.match(SKU_CODE_REG_MATCH) ?? []).join('');
              updateProductArrangement(value, 'skuCode', record.uuid);
            }}
          />
        );
      },
    },
    {
      title: `${getMessage('commodity.addProduct.barcode.no', '條碼編號')}(Barcode)`,
      dataIndex: 'barCode',
      width: 180,
      render: (text: string, record: any) => {
        return (
          <Input
            value={text}
            maxLength={settings.skuOptionNameMaxLength}
            onChange={(e) => {
              updateProductArrangement(e.target.value, 'barCode', record.uuid);
            }}
            onBlur={(e) => {
              const value = (e.target.value.match(SKU_CODE_REG_MATCH) ?? []).join('');
              updateProductArrangement(value, 'barCode', record.uuid);
            }}
          />
        );
      },
    },
    {
      title: getMessage('common.upper', '上架'),
      dataIndex: 'salesState',
      width: 60,
      render: (text: number, record: any) => {
        return (
          <Switch
            checked={!!text}
            onChange={(state) => {
              const stateEnum = state ? 1 : 0;
              updateProductArrangement(stateEnum, 'salesState', record.uuid);
            }}
          />
        );
      },
    },
    {
      align: 'right',
      width: 40,
      render: (_, record: any, index: number) => {
        return (
          <img
            className={styles.removeIcon}
            onClick={() => removeRecord(record, index)}
            src={removeIcon}
          />
        );
      },
    },
  ];

  // 排列商品
  const arrangeItems = (data: any) => {
    // 款式选项，下标
    const indexList: string[] = [];
    // 组合表头
    const mapTheadColumns = SKUCombination?.map((item) => {
      indexList.push(item.key.replace('option', '')); // 组合下标
      return { ellipsis: true, dataIndex: item.key, title: data[item.key] };
    });
    setColumns(() => [...mapTheadColumns, ...initColumns]);
    // 组合表格数据
    let mapTbodySource: any[] = [];
    // 用于生成唯一标识
    let uuidIndex = 0;

    let oneIndex: string, twoIndex: string, threeIndex: string;
    if (SKUCombination.length == 1) {
      oneIndex = indexList[0];
      mapTbodySource = data[`value${oneIndex}`]?.map((item: string) => {
        uuidIndex = uuidIndex + 1;
        return {
          ids: Math.random(),
          [`option${oneIndex}`]: item,
          uuid: `${item}`,
          sort: uuidIndex,
          ...initRecord,
          skuCode: productInfoForm.getFieldValue('skuCode')
            ? `${productInfoForm.getFieldValue('skuCode')}-${uuidIndex}`
            : '',
          skuPropertyList: [
            { propertyName: data[`option${oneIndex}`], propertyValue: item, sort: 1 },
          ],
        };
      });
    } else if (SKUCombination.length == 2) {
      oneIndex = indexList[0];
      twoIndex = indexList[1];
      data[`value${oneIndex}`]?.forEach((element: string) => {
        data[`value${twoIndex}`]?.forEach((item: string) => {
          uuidIndex = uuidIndex + 1;
          mapTbodySource.push({
            ids: Math.random(),
            [`option${oneIndex}`]: element,
            [`option${twoIndex}`]: item,
            uuid: `${element}${symbol}${item}`,
            sort: uuidIndex,
            ...initRecord,
            skuCode: productInfoForm.getFieldValue('skuCode')
              ? `${productInfoForm.getFieldValue('skuCode')}-${uuidIndex}`
              : '',
            skuPropertyList: [
              { propertyName: data[`option${oneIndex}`], propertyValue: element, sort: 1 },
              { propertyName: data[`option${twoIndex}`], propertyValue: item, sort: 2 },
            ],
          });
        });
      });
    } else if (SKUCombination.length == 3) {
      oneIndex = indexList[0];
      twoIndex = indexList[1];
      threeIndex = indexList[2];
      data[`value${oneIndex}`]?.forEach((element: string) => {
        data[`value${twoIndex}`]?.forEach((item: string) => {
          data[`value${threeIndex}`]?.forEach((child: string) => {
            uuidIndex = uuidIndex + 1;
            mapTbodySource.push({
              ids: Math.random(),
              [`option${oneIndex}`]: element,
              [`option${twoIndex}`]: item,
              [`option${threeIndex}`]: child,
              uuid: `${element}${symbol}${item}${symbol}${child}`,
              sort: uuidIndex,
              ...initRecord,
              skuCode: productInfoForm.getFieldValue('skuCode')
                ? `${productInfoForm.getFieldValue('skuCode')}-${uuidIndex}`
                : '',
              skuPropertyList: [
                { propertyName: data[`option${oneIndex}`], propertyValue: element, sort: 1 },
                { propertyName: data[`option${twoIndex}`], propertyValue: item, sort: 2 },
                { propertyName: data[`option${threeIndex}`], propertyValue: child, sort: 3 },
              ],
            });
          });
        });
      });
    }
    // 是否为编辑，回填操作
    const editBackfill = isEdit && isBackfill.current;
    // 组装商品suk填写数据，应为没有唯一标识，只能填写一遍

    // 如果是编辑，必须按照详情接口返回的数据进行商品类别组合，不能按照排列商品类别按钮的逻辑组合
    if (editBackfill) {
      mapTbodySource = mapTbodySource?.filter((item) => {
        const itemSkuProperty = item.skuPropertyList.map((sku: any) => sku.propertyValue).join('-');
        const existence = productSkuListRef.current.find((list) => {
          const apiSkuProperty = list.skuPropertyList
            .map((sku: any) => sku.propertyValue)
            .join('-');
          return apiSkuProperty == itemSkuProperty;
        });
        if (existence) {
          return true;
        }
        return false;
      });
    }

    const SKUmap = {};
    mapTbodySource = mapTbodySource?.map((item, index) => {
      if (editBackfill) {
        const result = productSkuListRef.current[index] || {};
        const eidtData = {
          originalPrice: result.originalPrice,
          specialPrice: result.specialPrice,
          costPrice: result.costPrice,
          skuCode: result.skuCode,
          barCode: result.barCode,
          salesState: result.salesState,
          productSkuId: result.productSkuId,
        };
        SKUmap[item.uuid] = {
          ...eidtData,
          sort: item.sort,
          uuid: item.uuid,
          skuPropertyList: item.skuPropertyList,
        };
        return {
          ...item,
          ...eidtData,
        };
      } else {
        // 新增商品，款式選項，只有第一次點擊排列的時候，獲取上面表單設置的值，非第一次點擊讀取上一次的取值
        const eidtData = {
          originalPrice: realTimeUpdate.current
            ? SUKMapData.current[item.uuid]?.originalPrice
            : productInfoForm.getFieldValue('originalPrice'),
          specialPrice: realTimeUpdate.current
            ? SUKMapData.current[item.uuid]?.specialPrice
            : productInfoForm.getFieldValue('specialPrice'),
          costPrice: realTimeUpdate.current
            ? SUKMapData.current[item.uuid]?.costPrice
            : productInfoForm.getFieldValue('costPrice'),
          skuCode: realTimeUpdate.current ? SUKMapData.current[item.uuid]?.skuCode : item.skuCode,
          barCode: realTimeUpdate.current
            ? SUKMapData.current[item.uuid]?.barCode
            : productInfoForm.getFieldValue('barCode'),
          salesState: realTimeUpdate.current
            ? SUKMapData.current[item.uuid]?.salesState === undefined
              ? 1
              : SUKMapData.current[item.uuid]?.salesState
            : salesState,
          productSkuId: SUKMapData.current[item.uuid]?.productSkuId || '',
        };
        SKUmap[item.uuid] = {
          ...eidtData,
          sort: item.sort,
          uuid: item.uuid,
          skuPropertyList: item.skuPropertyList,
        };
        return {
          ...item,
          ...eidtData,
        };
      }
    });
    isBackfill.current = false;

    // 组合旧数据，进行数据缓存
    const allSKUmap = { ...SUKMapData.current, ...SKUmap };

    // 数据筛选，排除多余的缓存数据
    const onlySKUmap = {};
    mapTbodySource?.forEach((item) => {
      onlySKUmap[item.uuid] = allSKUmap[item.uuid];
    });

    SUKMapData.current = onlySKUmap;
    // 设置表单数据，用于提供页面接口参数
    refForm.setFieldsValue({
      SUKMapData: SUKMapData.current,
      dataSource: mapTbodySource,
    });
    // 开启实时更新款式选项
    realTimeUpdate.current = true;
    setDataSource(mapTbodySource || []);
  };

  // 获取款式选项名列表
  const fetchProductSkuPropertyList = () => {
    merchantApi.getProductSkuPropertyList().then((result) => {
      setPropertyList(result.data);
    });
  };

  // 下拉选择款式选项
  const changeSelectOptionData = (option: string, value: string, data: SelectOptionProps) => {
    const { companyProductSkuPropertyNameId, propertyName } = data;
    // 回填选项值
    refForm.setFieldsValue({
      [option]: propertyName,
    });
    setOptionLoading(true);
    merchantApi
      .getProductSkuPropertyValueList({
        companyProductSkuPropertyNameId: `${companyProductSkuPropertyNameId}`,
      })
      .then((result) => {
        setOptionLoading(false);
        refForm.setFieldsValue({
          [value]: result.data.map((item) => item.propertyValue),
        });
        updateLineItems();
      })
      .catch(() => {
        setOptionLoading(false);
      });
  };

  // 添加款式选项
  const saveOptionProperty = (key: string, value: string) => {
    const combinationInfo = refForm.getFieldsValue();
    const params = {
      propertyName: combinationInfo[key],
      propertyValueList: combinationInfo[value]
        ? combinationInfo[value]?.map((item: string, index: number) => ({
            propertyValue: item,
            sort: index,
          }))
        : [],
    };
    if (!params.propertyName) {
      return notify.error(
        getMessage('commodity.common.optionn.name.placeholder', '請輸入選項名稱'),
      );
    }
    if (!params.propertyValueList.length) {
      return notify.error(getMessage('commodity.common.optionn.val.placeholder', '請輸入選項值'));
    }
    setOptionLoading(true);
    merchantApi
      .postProductSkuPropertyAdd([params])
      .then(() => {
        setOptionLoading(false);
        notify.success(getMessage('common.add.success', '添加成功'));
        fetchProductSkuPropertyList();
      })
      .catch(() => {
        setOptionLoading(false);
      });
  };

  // 移除款式选项
  const closeOptionHandle = (index: number) => {
    const newOptionList = SKUCombination.filter((_, i) => index != i);
    setTimeout(() => {
      refForm.setFieldValue('SKUCombination', newOptionList);
      setSKUCombination(newOptionList);
      updateLineItems();
    }, 0);
    pageChangeValue();
  };

  // 新增选项
  const addOptions = () => {
    indexSign.current = indexSign.current + 1;
    setSKUCombination((oldData) => {
      const data = [
        ...oldData,
        {
          key: `option${indexSign.current}`,
          value: `value${indexSign.current}`,
          uid: indexSign.current,
          search: '',
          productSkuPropertyNameId: '',
          productSkuPropertyValueList: [],
        },
      ];
      refForm.setFieldValue('SKUCombination', data);
      return data;
    });
    pageChangeValue();
  };

  // 校验款式选项，并组合商品规格
  const combinationSubmit = () => {
    refForm.submit();
  };

  // 编辑操作，设置初始化信息
  const setInitData = (data: any) => {
    const { productSkuPropertyList, productSkuList } = data;
    // 没有款式选项信息、商品排列数据, 禁止排列商品
    if (productSkuPropertyList.length) {
      // 写入选项列
      const SKUList = productSkuPropertyList.map((item: any, index: number) => {
        indexSign.current = index + 1;
        return {
          key: `option${indexSign.current}`,
          value: `value${indexSign.current}`,
          uid: indexSign.current,
          search: '',
          productSkuPropertyNameId: item.productSkuPropertyNameId,
          productSkuPropertyValueList: item.productSkuPropertyValueList || [],
        };
      });
      // 要进行同步更新，该方面需要进行优化
      setTimeout(() => {
        refForm.setFieldValue('SKUCombination', SKUList);
        setSKUCombination(SKUList);
        // 写入款式选项，数据回填
        SKUList.forEach((item: any, index: number) => {
          const propertyName = productSkuPropertyList[index].propertyName;
          const propertyValue = productSkuPropertyList[index].productSkuPropertyValueList.map(
            (child: any) => child.propertyValue,
          );
          if (index === 0) {
            setOptionName(propertyName);
            setOptionValue(propertyValue);
          }
          refForm.setFieldsValue({
            [item.key]: propertyName,
            [item.value]: propertyValue,
          });
        });
        // 填入数据，接口有排列数据才进行回填
        if (productSkuList.length) {
          // 开启商品类别组合列表
          isBackfill.current = true;
          // 保存sku列表
          productSkuListRef.current = productSkuList;
          // 排列商品类别
          refForm.submit();
        }
      }, 0);
    }
  };

  // 校验选项名重复
  const validatorFunc = (item: any, value: any, getFieldValue: any) => {
    for (let i = 0; i < SKUCombination.length; i++) {
      if (item.uid != SKUCombination[i].uid) {
        const oldData = getFieldValue(SKUCombination[i].key);
        if (oldData == value) {
          return false;
        }
      }
    }
    return true;
  };

  // 更新select搜索的值
  const updateSearchValue = (item: any, text: string) => {
    setSKUCombination((oldData) => {
      const copyData = JSON.parse(JSON.stringify(oldData));
      copyData.forEach((skuItem: any) => {
        if (skuItem.value == item.value) {
          skuItem.search = text;
        }
      });
      return copyData;
    });
  };

  // 排查选项值，相同的tag，清除搜索文本
  const deleteRepeatTag = (item: any) => {
    const tags = refForm.getFieldValue(item.value);
    tags?.forEach((tag: string) => {
      if (tag == item.search) {
        return updateSearchValue(item, '');
      }
    });
  };

  // 选项名校验规则
  const optionNameRrules = (item: typeof SKUCombination[0], index: number) => {
    return [
      ({ getFieldValue }) => ({
        validator(_: any, value: any) {
          if (index) {
            if (!value) {
              return Promise.reject(
                getMessage('commodity.sku.property.name.placeholder', '請輸入選項名稱'),
              );
            }
          } else {
            if (optionValue.length) {
              if (!value) {
                return Promise.reject(
                  getMessage('commodity.sku.property.name.placeholder', '請輸入選項名稱'),
                );
              }
            }
          }
          if (!validatorFunc(item, value, getFieldValue)) {
            return Promise.reject(
              getMessage('commodity.common.optionn.name.repeat.placeholder', '選項名稱重複'),
            );
          }
          return Promise.resolve();
        },
      }),
    ];
  };

  // 选项值校验规则
  const optionValueRrules = (item: typeof SKUCombination[0], index: number) => {
    return [
      ({ getFieldValue }) => ({
        validator(_: any, value: any) {
          if (index) {
            if (!value) {
              return Promise.reject(
                getMessage('commodity.addProduct.option.value.placeholder', '請輸入選項值'),
              );
            }
          } else {
            if (optionName) {
              if (!value?.length) {
                return Promise.reject(
                  getMessage('commodity.addProduct.option.value.placeholder', '請輸入選項值'),
                );
              }
            }
          }
          return Promise.resolve();
        },
      }),
    ];
  };

  // 刪除選項選項值接口字段
  const deselectProductSkuProperty = (value: string, index: number) => {
    setSKUCombination((oldData) => {
      const copyData = JSON.parse(JSON.stringify(oldData));
      copyData[index].productSkuPropertyValueList.forEach((item: any, i: number) => {
        if (value == item.propertyValue) {
          copyData[index].productSkuPropertyValueList.splice(i, 1);
        }
      });
      return copyData;
    });
  };

  // 暴露事件
  useImperativeHandle(ref, () => ({ setInitData }));

  useEffect(() => {
    fetchProductSkuPropertyList();
  }, []);

  useEffect(() => {
    if (refForm) {
      const name = refForm.getFieldValue('option1');
      const value = refForm.getFieldValue('value1');
      setOptionName(name || '');
      setOptionValue(value || []);
    }
  }, [dataSource, refForm]);

  return (
    <div className={styles.wrapper} id={mapHashAnchor.ANCHOR_STYLES_OPTION}>
      <Card className={styles.styleOptionsContainer}>
        <div className={styles.optionLabel}>
          {getMessage('commodity.addProduct.style.options', '款式選項')}
        </div>
        <Spin spinning={optionLoading}>
          <Form
            form={refForm}
            layout="vertical"
            onFinish={arrangeItems}
            autoComplete="off"
            onValuesChange={() => pageChangeValue()}
            validateTrigger={settings.formValidateTrigger}
          >
            {SKUCombination.map((item, index) => (
              <div className={styles.formRows} key={item.uid}>
                <div className={styles.formItem}>
                  <Form.Item
                    name={item.key}
                    label={
                      <div className={classNames([styles.itemLabel, styles.ml10])}>
                        {getMessage('commodity.addProduct.option.name', '選項名稱')}
                        <span className={styles.description}>
                          ({getMessage('commodity.addProduct.option.descript', '尺寸、顏色')})
                        </span>
                      </div>
                    }
                    required={false}
                    validateFirst={true}
                    rules={optionNameRrules(item, index)}
                  >
                    <Input
                      className={classNames([
                        styles.inputWidth,
                        styles.defaultInput,
                        'customSelect',
                      ])}
                      maxLength={settings.skuOptionNameMaxLength}
                      placeholder={getMessage(
                        'commodity.sku.property.name.placeholder',
                        '請輸入選項名稱',
                      )}
                      addonAfter={
                        <KSelect
                          option={item.key}
                          value={item.value}
                          list={propertyList}
                          onChange={changeSelectOptionData}
                        />
                      }
                      onBlur={updateLineItems}
                      onChange={(e) => {
                        setOptionName(e.target.value);
                      }}
                    />
                  </Form.Item>
                  <div className={styles.spacerLine} />
                </div>
                <div className={classNames([styles.formItem, styles.optionValueWidth])}>
                  <Form.Item
                    name={item.value}
                    label={
                      <div className={classNames([styles.itemLabel, styles.ml10])}>
                        {getMessage('commodity.addProduct.option.value', '選項值')}
                        <span className={styles.description}>
                          (
                          {getMessage(
                            'commodity.addProduct.option.value.descript',
                            'L、S、黃色、紅色',
                          )}
                          )
                        </span>
                      </div>
                    }
                    required={false}
                    validateFirst={true}
                    rules={optionValueRrules(item, index)}
                  >
                    <Select
                      placeholder={getMessage(
                        'commodity.addProduct.option.value.placeholder',
                        '請輸入選項值',
                      )}
                      mode="tags"
                      className={classNames([styles.inputWidth, styles.defaultInput])}
                      open={false}
                      maxTagCount={settings.skuValueMaxCount}
                      maxTagTextLength={settings.skuOptionValMaxLength}
                      searchValue={item.search}
                      onSearch={(value) => {
                        const tagsLen = refForm.getFieldValue(item.value)?.length;
                        if (tagsLen >= settings.skuValueMaxCount) {
                          return updateSearchValue(item, '');
                        }
                        if (value.length <= settings.skuOptionValMaxLength) {
                          return updateSearchValue(item, value);
                        }
                      }}
                      onChange={(value: any) => {
                        setOptionValue(value);
                        updateSearchValue(item, '');
                        updateLineItems();
                      }}
                      onSelect={() => {
                        deleteRepeatTag(item);
                      }}
                      onDeselect={(value: string) => {
                        deselectProductSkuProperty(value, index);
                      }}
                    />
                  </Form.Item>
                </div>
                <div className={styles.staging}>
                  <Tooltip
                    title={getMessage(
                      'commodity.addProduct.save.option',
                      '保存選項，下次可快捷選用',
                    )}
                    overlayInnerStyle={{ fontSize: '14px' }}
                    overlayStyle={{ maxWidth: 'none' }}
                  >
                    <div
                      className={styles.saveContent}
                      onClick={() => saveOptionProperty(item.key, item.value)}
                    >
                      <img className={styles.saveIcon} src={saveIcon} alt="" />
                    </div>
                  </Tooltip>
                  {index != 0 && (
                    <img
                      onClick={() => closeOptionHandle(index)}
                      className={styles.closeOption}
                      src={removeIcon}
                      alt=""
                    />
                  )}
                </div>
              </div>
            ))}
            <div className={styles.combination}>
              {SKUCombination.length != 3 && (
                <div className={styles.addOption} onClick={addOptions}>
                  <img className={styles.optionIcon} src={addOption} alt="" />
                  <span>{getMessage('commodity.addProduct.new.ptions', '新增選項')}</span>
                </div>
              )}
              <div className={styles.addOption} onClick={combinationSubmit}>
                <img className={styles.optionIcon} src={arrayOption} alt="" />
                <span className={styles.btnOptionText}>
                  {getMessage('commodity.addProduct.arrange.product.categories', '排列商品類別')}
                </span>
              </div>
            </div>
            {/* 商品類別 -- 表單組合 */}
            {dataSource.length ? (
              <div className="customTable">
                <div className={classNames([styles.category, styles.mt24])}>
                  {getMessage('commodity.addProduct.commodity.category', '商品類別')}
                </div>
                <Table dataSource={dataSource} columns={columns} pagination={false} rowKey="ids" />
              </div>
            ) : null}
            {/* 组合选项 */}
            <Form.Item name="SKUCombination" noStyle>
              <></>
            </Form.Item>
            {/* 表格资源 */}
            <Form.Item name="dataSource" noStyle>
              <></>
            </Form.Item>
            {/* sku列表接口数据 */}
            <Form.Item name="SUKMapData" noStyle>
              <></>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
});

export default StyleOptions;
