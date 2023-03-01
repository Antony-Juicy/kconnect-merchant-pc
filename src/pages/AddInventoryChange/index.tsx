import React, { useState, useEffect, useRef } from 'react';
import NormalLayout from '@/components/Layout/NormalLayout';
import { merchantApi } from '@/services';
import type { ProductSimplePageResponseDetail, ProductFileListResponse } from '@/services/api';
import { KPayImageGroup } from '@/components/Fields';
import type { IApiResponse } from '@/utils/request';
import useLocale from '@/hooks/useLocale';
import { Card, Form, Input, Row, Select, Spin, Button, message, Space } from 'antd';
import styles from './index.less';
import { INVENTORY_CHANGE_TYPE, enumCategory } from '@/utils/constants';
import { map } from 'lodash';
import removeIcon from '@/assets/images/products/removeIcon.png';
import settings from '@/utils/settings';
import classNames from 'classnames';
import lodash from 'lodash';
import { notify } from '@/utils/antdUtils';
import { history } from 'umi';
import { verifyNumber } from '@/utils/utils';
import failureIcon from '@/assets/svgs/product/err-list-img.svg';
import PlusIcon from '@/assets/svgs/product/plusOutlined';
import PaginationSelect from '../CommodityManagement/NewProducts/components/PaginationSelect';
import KPayModal from '@/components/Fields/kpay-modal';

const { Option } = Select;
const { TextArea } = Input;

interface CommodityProps {
  index: number;
}

const AddInventoryChange: React.FC = () => {
  const { getMessage } = useLocale();

  const [form] = Form.useForm();
  //* 商品圖片列表內容
  const [imgData, setImgData] = useState<any[] | null>(null);
  // 下拉選擇商品信息
  const [productView, setProductView] = useState<ProductSimplePageResponseDetail>();
  // 页面laoding
  const [loading, setLoading] = useState(false);
  // 商品sku是否为空
  const [emptySkuList, setEmptySkuList] = useState(false);
  // 变更类别
  const [changeCategory, setChangeCategory] = useState(1);
  // 新增变更列表的唯一标识
  const changeIndex = useRef(0);
  // 變更類別列表
  const [changeList] = useState(() => {
    const data: { recordType: number; text: string }[] = [];
    map(INVENTORY_CHANGE_TYPE, (item: any, index) => {
      data.push({ recordType: Number(index), text: getMessage(item.id, item.defaultMessage) });
    });
    return data;
  });
  // 变更商品仓库列表
  const [commodityChangeList, setCommodityChangeList] = useState(() => {
    changeIndex.current = changeIndex.current + 1;
    return [{ index: changeIndex.current }];
  });
  // 商品选项
  const [productOption, setProductOption] = useState<any>(null);
  // 退出彈框提示
  const [backVisible, setBackVisible] = useState(false);
  // 是否有值的的变更，用于页面退出业务提示
  const [isValueChange, setIsValueChange] = useState(false);

  // 自定义返回事件
  const customBack = () => {
    if (isValueChange) {
      setBackVisible(true);
    } else {
      history.goBack();
    }
  };

  // 表單提交事件
  const onFinish = (data: any) => {
    const productSkuStockRecordList: any[] = lodash.compact(data.productSkuStockRecordList);
    // 数据过滤，接口要求
    productSkuStockRecordList.forEach((item) => {
      /**
       * 1、如果没有sku的话，不需要传productSkuId
       * 2、额外需求，有sku规格，还有添加一个商品选项，为了修改商品的库存
       */
      if (emptySkuList || item.productSkuId == productView?.productId) {
        item.productSkuId = '';
      }
    });
    const params: any = {
      productId: productView?.productId,
      recordCode: data.recordCode,
      recordType: data.recordType,
      description: data.description,
      remark: data.remark,
      productSkuStockRecordList,
    };
    setLoading(true);
    merchantApi
      .postProductStockRecordAdd(params)
      .then(() => {
        notify.success(getMessage('common.new.add.success', '新增成功'));
        setLoading(false);
        history.goBack();
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 选择下拉变更类别
  const selectCategory = (data: number) => {
    setChangeCategory(data);
    form.setFieldValue('description', undefined);
  };

  //* 查看圖片
  const checkImg = (id: string, url: any) => {
    if (!!!url) {
      return;
    }
    const chatDom = document.querySelector('.widget-visible');
    if (!!chatDom) {
      chatDom.classList.add('widget-Chat');
      chatDom.classList.remove('widget-visible');
    }
    merchantApi
      .getProductFileList({ productId: id })
      .then((res: IApiResponse<ProductFileListResponse>) => {
        if (res && res.data) {
          setImgData(res.data);
        }
      })
      .catch(() => {
        message.error(getMessage('commodity.getFileList.fail', '獲取圖片列表失敗'));
      });
  };
  // 添加变更
  const addition = () => {
    changeIndex.current = changeIndex.current + 1;
    setCommodityChangeList((oldData) => {
      return [...oldData, { index: changeIndex.current }];
    });
    if (emptySkuList) {
      form.setFieldValue(
        ['productSkuStockRecordList', changeIndex.current, 'productSkuId'],
        productView?.productName,
      );
      form.setFieldValue(
        ['productSkuStockRecordList', changeIndex.current, 'specs'],
        productView?.productName,
      );
    }
  };

  const cancelChangeSubmit = () => {
    customBack();
  };

  // 删除变更
  const removeChange = (index: number) => {
    setCommodityChangeList((oldData) => oldData.filter((_, i) => i != index));
  };

  // 重置表单的商品款式選項
  const resetStyleOptions = (isEmpty: boolean) => {
    /**
     * 1、如果不为空，说明有值允许下拉选择，先置空上一个商品的选择sku
     * 2、如果没有值，不允许选择，默认为商品名称
     */
    commodityChangeList.forEach((item) => {
      if (isEmpty) {
        // 为空，没有skuid
        form.setFieldValue(
          ['productSkuStockRecordList', item.index, 'productSkuId'],
          productView?.productName,
        );
        form.setFieldValue(
          ['productSkuStockRecordList', item.index, 'specs'],
          productView?.productName,
        );
      } else {
        // 不为空，有skuid
        form.setFieldValue(['productSkuStockRecordList', item.index, 'productSkuId'], undefined);
      }
    });
  };

  // 设置商品规格名称，用于接口提交参数
  const setSkuParams = (record: any, commodity: CommodityProps, key: string) => {
    form.setFieldValue(['productSkuStockRecordList', commodity.index, key], record[key]);
  };

  // 自定义条件渲染变更选项表头
  const headerColumns = () => {
    if (changeCategory == enumCategory.transfer) {
      return (
        <>
          <div className={styles.headerItem}>
            {getMessage('commodity.add.change.warehousing', '入庫倉庫')}
          </div>
          <div className={styles.headerItem}>
            {getMessage('commodity.add.change.outWarehouse', '出庫倉庫')}
          </div>
        </>
      );
    } else if (
      changeCategory == enumCategory.procurement ||
      changeCategory == enumCategory.return
    ) {
      return (
        <div className={styles.headerItem}>
          {getMessage('commodity.add.change.warehousing', '入庫倉庫')}
        </div>
      );
    } else if (changeCategory == enumCategory.sales || changeCategory == enumCategory.issue) {
      return (
        <div className={styles.headerItem}>
          {getMessage('commodity.add.change.outWarehouse', '出庫倉庫')}
        </div>
      );
    }
    return null;
  };

  // 自定义条件渲染变更选项
  const writeOptionItem = (commodity: CommodityProps) => {
    if (changeCategory == enumCategory.transfer) {
      return (
        <>
          <Form.Item
            name={['productSkuStockRecordList', commodity.index, 'inWarehouseId']}
            validateFirst={true}
            rules={[
              {
                required: true,
                message: getMessage('common.please.select', '請選擇'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const outWarehouseId = getFieldValue('productSkuStockRecordList')[commodity.index]
                    .outWarehouseId;
                  if (value != outWarehouseId) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(getMessage('commodity.add.change.error.tips', '請選擇不同倉庫')),
                  );
                },
              }),
            ]}
          >
            <PaginationSelect
              className={styles.optionWidth}
              next={merchantApi.getWarehousePage}
              config={{
                valueKey: 'warehouseId',
                labelKey: 'warehouseName',
                placeholder: getMessage('common.please.select', '請選擇'),
                changeItem: (item) => {
                  if (item) {
                    item.inWarehouseName = item.warehouseName;
                    setSkuParams(item, commodity, 'inWarehouseName');
                  }
                },
              }}
            />
          </Form.Item>
          <Form.Item
            name={['productSkuStockRecordList', commodity.index, 'outWarehouseId']}
            validateFirst={true}
            rules={[
              {
                required: true,
                message: getMessage('common.please.select', '請選擇'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const inWarehouseId = getFieldValue('productSkuStockRecordList')[commodity.index]
                    .inWarehouseId;
                  if (value != inWarehouseId) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(getMessage('commodity.add.change.error.tips', '請選擇不同倉庫')),
                  );
                },
              }),
            ]}
          >
            <PaginationSelect
              className={styles.optionWidth}
              next={merchantApi.getWarehousePage}
              config={{
                valueKey: 'warehouseId',
                labelKey: 'warehouseName',
                placeholder: getMessage('common.please.select', '請選擇'),
                changeItem: (item) => {
                  if (item) {
                    item.outWarehouseName = item.warehouseName;
                    setSkuParams(item, commodity, 'outWarehouseName');
                  }
                },
              }}
            />
          </Form.Item>
        </>
      );
    } else if (
      changeCategory == enumCategory.procurement ||
      changeCategory == enumCategory.return
    ) {
      return (
        <Form.Item
          name={['productSkuStockRecordList', commodity.index, 'inWarehouseId']}
          rules={[
            {
              required: true,
              message: getMessage('common.please.select', '請選擇'),
            },
          ]}
        >
          <PaginationSelect
            className={styles.optionWidth}
            next={merchantApi.getWarehousePage}
            config={{
              valueKey: 'warehouseId',
              labelKey: 'warehouseName',
              placeholder: getMessage('common.please.select', '請選擇'),
              changeItem: (item) => {
                if (item) {
                  item.inWarehouseName = item.warehouseName;
                  setSkuParams(item, commodity, 'inWarehouseName');
                }
              },
            }}
          />
        </Form.Item>
      );
    } else if (changeCategory == enumCategory.sales || changeCategory == enumCategory.issue) {
      return (
        <Form.Item
          name={['productSkuStockRecordList', commodity.index, 'outWarehouseId']}
          rules={[
            {
              required: true,
              message: getMessage('common.please.select', '請選擇'),
            },
          ]}
        >
          <PaginationSelect
            className={styles.optionWidth}
            next={merchantApi.getWarehousePage}
            config={{
              valueKey: 'warehouseId',
              labelKey: 'warehouseName',
              placeholder: getMessage('common.please.select', '請選擇'),
              changeItem: (item) => {
                if (item) {
                  item.outWarehouseName = item.warehouseName;
                  setSkuParams(item, commodity, 'outWarehouseName');
                }
              },
            }}
          />
        </Form.Item>
      );
    }
    return null;
  };

  // 自定义备注说明
  const customRemarks = () => {
    if (changeCategory == enumCategory.return) {
      return (
        <Row>
          <Form.Item
            className={styles.remarkInline}
            label={
              <div className={styles.itemLabel}>
                {getMessage('commodity.add.change.return.instructions', '退貨説明')}
              </div>
            }
            name="description"
            rules={[
              {
                required: true,
                message: getMessage('common.placeholder', '請輸入'),
              },
            ]}
          >
            <TextArea
              placeholder={getMessage('common.placeholder', '請輸入')}
              showCount
              maxLength={settings.oneHundredAndFiftyLength}
              style={{ height: 126 }}
            />
          </Form.Item>
          <Form.Item
            className={classNames([styles.remarkInline, styles.ml24])}
            name="remark"
            label={<div className={styles.customLabel}>{getMessage('common.remark', '備註')}</div>}
          >
            <TextArea
              placeholder={getMessage('common.remark.placeholder', '請輸入備註')}
              showCount
              maxLength={settings.oneHundredAndFiftyLength}
              style={{ height: 126 }}
            />
          </Form.Item>
        </Row>
      );
    } else if (
      changeCategory == enumCategory.procurement ||
      changeCategory == enumCategory.transfer ||
      changeCategory == enumCategory.sales
    ) {
      return (
        <Form.Item
          className={styles.remarkBlock}
          name="remark"
          label={<div className={styles.customLabel}>{getMessage('common.remark', '備註')}</div>}
        >
          <TextArea
            placeholder={getMessage('common.remark.placeholder', '請輸入備註')}
            showCount
            maxLength={settings.oneHundredAndFiftyLength}
            style={{ height: 126 }}
          />
        </Form.Item>
      );
    } else if (changeCategory == enumCategory.issue) {
      return (
        <Row>
          <Form.Item
            className={styles.remarkInline}
            label={
              <div className={styles.itemLabel}>
                {getMessage('commodity.add.change.delivery.description', '出庫説明')}
              </div>
            }
            name="description"
            rules={[
              {
                required: true,
                message: getMessage('common.placeholder', '請輸入'),
              },
            ]}
          >
            <TextArea
              placeholder={getMessage('common.placeholder', '請輸入')}
              showCount
              maxLength={settings.oneHundredAndFiftyLength}
              style={{ height: 126 }}
            />
          </Form.Item>
          <Form.Item
            className={classNames([styles.remarkInline, styles.ml24])}
            name="remark"
            label={<div className={styles.customLabel}>{getMessage('common.remark', '備註')}</div>}
          >
            <TextArea
              placeholder={getMessage('common.remark.placeholder', '請輸入備註')}
              showCount
              maxLength={settings.oneHundredAndFiftyLength}
              style={{ height: 126 }}
            />
          </Form.Item>
        </Row>
      );
    }
    return null;
  };

  // 清除库存变更选项
  const clearOption = (allClear: boolean = false) => {
    commodityChangeList.forEach((item) => {
      if (!emptySkuList || allClear) {
        form.setFieldValue(['productSkuStockRecordList', item.index, 'specs'], null);
        form.setFieldValue(['productSkuStockRecordList', item.index, 'productSkuId'], null);
      }
      form.setFieldValue(['productSkuStockRecordList', item.index, 'modifyCount'], null);
      form.setFieldValue(['productSkuStockRecordList', item.index, 'inWarehouseId'], null);
      form.setFieldValue(['productSkuStockRecordList', item.index, 'outWarehouseId'], null);
      form.setFieldValue(['productSkuStockRecordList', item.index, 'inWarehouseName'], null);
      form.setFieldValue(['productSkuStockRecordList', item.index, 'outWarehouseName'], null);
    });
  };

  // 下拉選擇商品
  const selectProduct = (record: any) => {
    if (record) {
      setProductView({
        productId: record.productId,
        productName: record.productName,
        fileUrl: record.fileUrl,
      });
    } else {
      setEmptySkuList(false);
      setProductView(undefined);
      setProductOption(null);
      clearOption(true);
    }
  };

  useEffect(() => {
    // 设置初始化，变更类别
    form.setFieldValue('recordType', 1);
  }, []);

  // 根据商品id查询sku列表
  useEffect(() => {
    if (productView?.productId) {
      setLoading(true);
      merchantApi
        .getProductSkuList({ productId: `${productView?.productId}` })
        .then((result) => {
          setLoading(false);
          setProductOption({
            value: productView?.productId,
            label: productView?.productName,
            specs: productView?.productName,
          });
          setEmptySkuList(!result.data.length);
          resetStyleOptions(!result.data.length);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [productView]);

  // 请求 商品款式選項 前拦截
  const interceptBeforeGetProductSkuPage = (e: any) => {
    if (!productView?.productId) {
      message.warning(
        getMessage('commodity.add.change.product.emtlyProductIdErrorTips', '請先選擇商品'),
      );
      return Promise.resolve({ data: { data: [] } });
    }
    return merchantApi.getProductSkuPage({ ...e });
  };

  return (
    <NormalLayout
      visible
      title={getMessage('commodity.add.change.title', '新增變更')}
      customBack={customBack}
    >
      <Spin spinning={loading}>
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            onValuesChange={() => setIsValueChange(true)}
          >
            <Row>
              <Form.Item
                label={
                  <div className={styles.customLabel}>
                    {getMessage('commodity.inventory.change.No', '變更編號')}
                  </div>
                }
                name="recordCode"
                rules={[
                  {
                    pattern: /^[A-Za-z0-9]*$/,
                    message: getMessage(
                      'application.feedback.incorrectinputformat',
                      '輸入格式不正確',
                    ),
                  },
                ]}
              >
                <Input
                  className={styles.inputWidth}
                  maxLength={30}
                  placeholder={getMessage('common.placeholder', '請輸入')}
                />
              </Form.Item>
              <Form.Item
                className={styles.ml40}
                label={
                  <div className={styles.itemLabel}>
                    {getMessage('commodity.add.change.product', '商品')}
                  </div>
                }
                name="productId"
                rules={[
                  {
                    required: true,
                    message: getMessage('common.please.select', '請選擇'),
                  },
                ]}
              >
                <PaginationSelect
                  className={styles.inputWidth}
                  next={merchantApi.getProductSimplePage}
                  config={{
                    valueKey: 'productId',
                    labelKey: 'productName',
                    searchKey: 'productName',
                    defaultParams: { useState: 1 },
                    placeholder: getMessage('common.please.select', '請選擇'),
                    changeItem: (item) => selectProduct(item),
                  }}
                />
              </Form.Item>
              {productView?.productName ? (
                <div className={styles.productInfo}>
                  <div
                    onClick={checkImg.bind(
                      null,
                      productView?.productId,
                      productView?.fileUrl ? productView?.fileUrl : failureIcon,
                    )}
                  >
                    <KPayImageGroup
                      cover={productView?.fileUrl ? productView?.fileUrl : failureIcon}
                      id="productFileId"
                      imgData={imgData ?? []}
                      reset={setImgData}
                    />
                  </div>
                  <span className={styles.productName}>{productView?.productName}</span>
                </div>
              ) : null}
            </Row>
            <Form.Item
              label={
                <div className={styles.itemLabel}>
                  {getMessage('commodity.inventory.change.category', '變更類別')}
                </div>
              }
              name="recordType"
              rules={[
                {
                  required: true,
                  message: getMessage('common.please.select', '請選擇'),
                },
              ]}
            >
              <Select
                onChange={(data) => {
                  clearOption();
                  selectCategory(data);
                }}
                className={styles.inputWidth}
                placeholder={getMessage('common.please.select', '請選擇')}
              >
                {changeList?.map((item) => (
                  <Option key={item.recordType} value={item.recordType}>
                    {item.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* 商品款式區域 */}
            <div className={styles.headerColumns}>
              <div className={styles.headerItem}>
                {getMessage('commodity.add.change.option.type', '商品款式選項')}
              </div>
              <div className={styles.headerItem}>
                {getMessage('commodity.add.change.number', '變更數量')}
              </div>
              {/* 自定义条件渲染变更选项表头 */}
              {headerColumns()}
            </div>
            {/* 選項列表 */}
            <div className={styles.optionList}>
              {commodityChangeList.map((commodity, i) => (
                <div className={styles.optionItem} key={commodity.index}>
                  <Form.Item
                    name={['productSkuStockRecordList', commodity.index, 'productSkuId']}
                    rules={[
                      {
                        required: true,
                        message: getMessage('common.please.select', '請選擇'),
                      },
                    ]}
                  >
                    <PaginationSelect
                      className={styles.optionWidth}
                      next={interceptBeforeGetProductSkuPage}
                      config={{
                        valueKey: 'productSkuId',
                        labelKey: 'specs',
                        placeholder: getMessage('common.please.select', '請選擇'),
                        defaultParams: { productId: `${productView?.productId}` },
                        disabled: emptySkuList,
                        changeItem: (item) => {
                          if (item) {
                            setSkuParams(item, commodity, 'specs');
                          }
                        },
                        afterOption: productOption,
                      }}
                    />
                  </Form.Item>
                  <Form.Item name={['productSkuStockRecordList', commodity.index, 'specs']} hidden>
                    <></>
                  </Form.Item>
                  <Form.Item
                    name={['productSkuStockRecordList', commodity.index, 'inWarehouseName']}
                    hidden
                  >
                    <></>
                  </Form.Item>
                  <Form.Item
                    name={['productSkuStockRecordList', commodity.index, 'outWarehouseName']}
                    hidden
                  >
                    <></>
                  </Form.Item>
                  <Form.Item
                    name={['productSkuStockRecordList', commodity.index, 'modifyCount']}
                    rules={[
                      {
                        required: true,
                        message: getMessage('common.placeholder', '請輸入'),
                      },
                    ]}
                    getValueFromEvent={(event) =>
                      verifyNumber(event.target.value, 'integer', {
                        range: [1, settings.priceMaxAmount],
                      })
                    }
                  >
                    <Input
                      className={styles.optionWidth}
                      placeholder={getMessage('common.placeholder', '請輸入')}
                      maxLength={9}
                    />
                  </Form.Item>
                  {/* 自定义条件渲染变更选项 */}
                  {writeOptionItem(commodity)}
                  {/* 第一项的时候不显示删除按钮 */}
                  {i != 0 ? (
                    <img
                      className={styles.remove}
                      onClick={() => removeChange(i)}
                      src={removeIcon}
                      alt=""
                    />
                  ) : null}
                </div>
              ))}
            </div>
            {/* 添加变更按钮 */}
            <div className={styles.addition}>
              <Button className="primary-btn" onClick={addition} icon={<PlusIcon />}>
                {getMessage('commodity.add.change.addition', '添加變更')}
              </Button>
            </div>
            {/* 备注说明 */}
            {customRemarks()}
            <Space size={16} className={styles.groupBtn}>
              <Button className="primary-btn" onClick={cancelChangeSubmit}>
                {getMessage('common.cancel', '取消')}
              </Button>
              <Button className="primary-btn" htmlType="submit" type="primary">
                {getMessage('common.confirm', '確認')}
              </Button>
            </Space>
          </Form>
        </Card>
      </Spin>

      <KPayModal
        type="modal"
        maskClosable={false}
        closable={false}
        title={getMessage('common.confirm.title', '提示')}
        className={styles.transferModal}
        visible={backVisible}
        okText={getMessage('member.edit.exit.okText', '繼續編輯')}
        cancelText={getMessage('commodity.addProduct.back.cancel', '確認取消')}
        onCancel={() => {
          history.goBack();
        }}
        onOk={() => {
          setBackVisible(false);
        }}
      >
        <div className={styles.KPayModalText}>
          {getMessage('commodity.addProduct.back.tips', '取消後所有更改將不獲儲存')}
        </div>
      </KPayModal>
    </NormalLayout>
  );
};

export default AddInventoryChange;
