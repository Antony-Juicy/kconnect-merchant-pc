import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spin, Image, Space, Button } from 'antd';
import { usePageStatus } from '@/hooks/usePageStatus';
import styles from './index.less';
import NormalLayout from '@/components/Layout/NormalLayout';
import type { ColumnsType } from 'antd/es/table';
import './reset.less';
import classNames from 'classnames';
import { merchantApi } from '@/services';
import type { ProductInfoResponse } from '@/services/api';
import useLocale from '@/hooks/useLocale';
import { EyeOutlined, FormOutlined } from '@ant-design/icons';
import { formatUnixTimestamp, fixedDigit } from '@/utils/utils';
import {
  SINGLE_SELECT,
  MULTI_SELECT,
  DATE_SELECT,
  WEBVIEW_INPUT,
  PRICE_INPUT,
} from '../NewProducts/components/CustomForm/constants';
import TitleTabs, { mapHashAnchor } from '../NewProducts/components/TitleTabs';
import { useBoolean } from 'ahooks';
import { notify } from '@/utils/antdUtils';
import { history } from 'umi';
import settings from '@/utils/settings';
import failureIcon from '@/assets/svgs/product/err-list-img.svg';

const ProductDetail: React.FC<any> = (props) => {
  const { getMessage } = useLocale();
  const { id } = usePageStatus(props);

  const [pageLoading, setPageLoading] = useState(false); // 頁面loading

  // 默认固定的表头栏目
  const initColumns = [
    {
      title: getMessage('commodity.productDetail.originalPrice', '原價(HKD)'),
      dataIndex: 'originalPrice',
      width: 112,
    },
    {
      title: getMessage('commodity.productDetail.specialPrice', '特價(HKD)'),
      dataIndex: 'specialPrice',
      width: 112,
    },
    {
      title: getMessage('commodity.productDetail.costPrice', '成本(HKD)'),
      dataIndex: 'costPrice',
      width: 112,
    },
    {
      title: getMessage('commodity.productDetail.skuCode', 'SKU編號'),
      dataIndex: 'skuCode',
      width: 155,
    },
    {
      title: getMessage('commodity.productDetail.barCode', '條碼編號(Barcode)'),
      dataIndex: 'barCode',
      width: 180,
    },
    {
      title: getMessage('common.state', '狀態'),
      dataIndex: 'salesState',
      width: 80,
      render: (text: number) => {
        return (
          <div>
            {text == 1 ? (
              <Badge status="success" text={getMessage('common.upper', '上架')} />
            ) : (
              <Badge status="default" text={getMessage('common.lower', '下架')} />
            )}
          </div>
        );
      },
    },
  ];
  const [columns, setColumns] = useState<ColumnsType<any>>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  // 商品詳情
  const [productInfo, setProductInfo] = useState<ProductInfoResponse | null>(null);
  // 上部自定义模板
  const [CENTERTempList, setCENTERTempList] = useState<any[]>([]);
  // 下部自定义模板
  const [BOTTOMTempList, setBOTTOMTempList] = useState<any[]>([]);
  // 按钮loading
  const [btnLoading, { setTrue: showbtnLoading, setFalse: hidebtnLoading }] = useBoolean(false);

  // 自定义显示模板，根据不同的类型文本类型显示格式
  const customTempList = (item: any) => {
    const { fieldType, fieldValue, fieldValueDisplay } = item;
    if (fieldType == WEBVIEW_INPUT) {
      // 富文本输入，单独处理
      return (
        <div
          className={styles.webViewContent}
          dangerouslySetInnerHTML={{ __html: fieldValue || '' }}
        />
      );
    } else if (fieldType == DATE_SELECT) {
      // 时间选择器
      return formatUnixTimestamp(fieldValue, settings.systemDateFormat);
    } else if (fieldType == MULTI_SELECT || fieldType == SINGLE_SELECT) {
      // 多选框
      return fieldValueDisplay;
    } else if (fieldType == PRICE_INPUT) {
      return fieldValue ? fixedDigit(fieldValue) : '';
    } else {
      return fieldValue;
    }
  };

  // 跳转编辑页面
  const toEditPage = () => {
    if (productInfo?.useState == 1) {
      history.push({
        pathname: '/main/commodity/editProduct',
        query: {
          id,
        },
      });
    } else {
      notify.error(
        getMessage(
          'commodity.productDetail.disable.editing',
          '此商品已被管理員暫停使用，請聯絡平台工作人員修改狀態',
        ),
      );
    }
  };

  // 获取商品详情
  const fetchProductInfo = async () => {
    setPageLoading(true);
    const result = await merchantApi.getProductInfo({ productId: id });
    setPageLoading(false);
    setProductInfo(result.data);

    // 排序
    result.data.productFieldList.sort((a, b) => a.sort - b.sort);
    // 组装自定义模板数据
    const CENTERTemp: any[] = [];
    const BOTTOMTemp: any[] = [];
    result.data.productFieldList.forEach((item) => {
      if (item.templateFieldGroup.includes('CENTER')) {
        CENTERTemp.push(item);
      } else if (item.templateFieldGroup.includes('BOTTOM')) {
        BOTTOMTemp.push(item);
      }
    });
    setCENTERTempList(CENTERTemp);
    setBOTTOMTempList(BOTTOMTemp);

    const mapColumns: any[] = [];
    let mapDataSource: any[] = [];
    // 組裝table表頭
    result.data.productSkuList[0]?.skuPropertyList.forEach((item, index) => {
      mapColumns.push({ dataIndex: `value${index + 1}`, title: item.propertyName });
    });
    // 組裝table數據
    mapDataSource = JSON.parse(JSON.stringify(result.data.productSkuList));
    mapDataSource.forEach((item) => {
      if (item.originalPrice !== null) {
        item.originalPrice = fixedDigit(item.originalPrice);
      }
      if (item.costPrice !== null) {
        item.costPrice = fixedDigit(item.costPrice);
      }
      if (item.specialPrice !== null) {
        item.specialPrice = fixedDigit(item.specialPrice);
      }

      item.skuPropertyList.forEach((child: any, i: number) => {
        item[`value${i + 1}`] = child.propertyValue;
      });
    });

    setColumns([...mapColumns, ...initColumns]);
    setDataSource(mapDataSource);
  };

  // 商品上下架
  const salesStateBatch = (salesState: number) => {
    const productId: any = id;
    showbtnLoading();
    merchantApi
      .postProductModifySalesStateBatch({
        productIdList: [productId],
        salesState,
      })
      .then(() => {
        hidebtnLoading();
        notify.success(getMessage('common.modify.success', '修改成功'));
        fetchProductInfo();
      })
      .catch(() => {
        hidebtnLoading();
      });
  };

  // 自定义返回事件
  const customBack = () => {
    history.replace('/main/commodity/list');
  };

  useEffect(() => {
    fetchProductInfo();
  }, []);

  return (
    <NormalLayout
      visible
      title={getMessage('commodity.productDetail.title', '商品詳情')}
      toolBarRender={
        <div className={styles.toolBarRender}>
          <TitleTabs />
          <Space size={16}>
            <Button className="primary-btn" loading={btnLoading} onClick={() => salesStateBatch(1)}>
              {getMessage('commodity.onSale', '上架')}
            </Button>
            <Button className="primary-btn" loading={btnLoading} onClick={() => salesStateBatch(0)}>
              {getMessage('commodity.offSale', '下架')}
            </Button>
            <Button
              className="primary-btn"
              type="primary"
              icon={<FormOutlined />}
              onClick={toEditPage}
            >
              {getMessage('member.editor', '編輯')}
            </Button>
          </Space>
        </div>
      }
      customBack={customBack}
    >
      <Spin spinning={pageLoading}>
        <Card className={styles.infoContainer} id={mapHashAnchor.ANCHOR_COMMODITY_INFO}>
          <div className={styles.currencyTitle}>
            {getMessage('commodity.productDetail.information', '商品資料')}
          </div>
          <div className={styles.productInfo}>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.coding', '商品編號')}
              </div>
              <div className={styles.content}>{productInfo?.productCode}</div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>{getMessage('common.picture', '圖片')}</div>
              <div className={styles.content}>
                <div className={styles.pictureList}>
                  {productInfo?.productFileList.length ? (
                    <Image.PreviewGroup>
                      {productInfo?.productFileList.map((item) => (
                        <Image
                          key={item.fileUrl}
                          className={styles.pictureItem}
                          src={item.fileUrl}
                          height={40}
                          preview={{
                            mask: <EyeOutlined />,
                          }}
                          fallback={failureIcon}
                          placeholder={<img src={failureIcon} width={40} height={40} />}
                        />
                      ))}
                    </Image.PreviewGroup>
                  ) : (
                    <img className={styles.pictureItem} src={failureIcon} />
                  )}
                </div>
              </div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>{getMessage('common.name', '名稱')}</div>
              <div className={styles.content}>{productInfo?.productName}</div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.addProduct.category', '類别')}
              </div>
              <div className={styles.content}>{productInfo?.companyProductTypeName}</div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.classification', '分類')}
              </div>
              <div className={styles.content}>
                <div className={styles.categoryList}>
                  {productInfo?.productCategoryNameList.map((item) => (
                    <span key={item} className={styles.categoryItem}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.brand', '品牌')}
              </div>
              <div className={styles.content}>{productInfo?.companyBrandName}</div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.originalPrice', '原價(HKD)')}
              </div>
              <div className={styles.content}>
                {productInfo?.originalPrice !== null ? fixedDigit(productInfo?.originalPrice) : ''}
              </div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.specialPrice', '特價(HKD)')}
              </div>
              <div className={styles.content}>
                {productInfo?.specialPrice !== null ? fixedDigit(productInfo?.specialPrice) : ''}
              </div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.costPrice', '成本(HKD)')}
              </div>
              <div className={styles.content}>
                {productInfo?.costPrice !== null ? fixedDigit(productInfo?.costPrice) : ''}
              </div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.supplier', '供應商')}
              </div>
              <div className={styles.content}>{productInfo?.supplier}</div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.skuCode', 'SKU編號')}
              </div>
              <div className={styles.content}>{productInfo?.skuCode}</div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.barCode', '條碼編號(Barcode)')}
              </div>
              <div className={styles.content}>{productInfo?.barCode}</div>
            </div>
            {CENTERTempList.map((item) => (
              <div key={item.templateFieldId} className={styles.rows}>
                <div className={styles.label}>{item.fieldName}</div>
                <div className={styles.content}>{customTempList(item)}</div>
              </div>
            ))}
            <div className={styles.rows}>
              <div className={styles.label}>{getMessage('common.state', '狀態')}</div>
              <div className={styles.content}>
                {productInfo?.salesState == 1 ? (
                  <Badge status="success" text={getMessage('common.upper', '上架')} />
                ) : (
                  <Badge status="default" text={getMessage('common.lower', '下架')} />
                )}
              </div>
            </div>
            <div className={styles.rows}>
              <div className={styles.label}>
                {getMessage('commodity.productDetail.introduction', '商品詳細介紹')}
              </div>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: productInfo?.description || '' }}
              />
            </div>
          </div>
        </Card>
        <Card className={styles.optionsContainer} id={mapHashAnchor.ANCHOR_STYLES_OPTION}>
          <div className={styles.currencyTitle}>
            {getMessage('commodity.productDetail.style.options', '款式選項')}
          </div>
          <div className="customTable">
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey="productSkuId"
            />
          </div>
        </Card>
        <Card className={styles.inventoryContainer} id={mapHashAnchor.ANCHOR_INVENTORY_SETTING}>
          <div className={styles.currencyTitle}>
            {getMessage('commodity.productDetail.inventory.setting', '庫存設定')}
          </div>
          <div className={styles.rowsEnpty}>
            <div className={styles.name}>
              {getMessage('commodity.productDetail.track.inventory', '追蹤庫存')}
            </div>
            <div className={styles.box}>
              {productInfo?.stockTrace
                ? getMessage('common.open', '開啟')
                : getMessage('common.close', '關閉')}
            </div>
          </div>
        </Card>
        <Card className={styles.otherContainer} id={mapHashAnchor.ANCHOR_OTHER_INFORMATION}>
          <div className={styles.currencyTitle}>
            {getMessage('commodity.productDetail.other.information', '其他资料')}
          </div>
          <div className={styles.operationRecord}>
            {BOTTOMTempList.map((item) => (
              <div
                key={item.templateFieldId}
                className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}
              >
                <div className={styles.name}>{item.fieldName}</div>
                <div className={styles.box}>{customTempList(item)}</div>
              </div>
            ))}
          </div>

          <div className={styles.operationRecord}>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.productDetail.create.account', '創建賬戶')}
              </div>
              <div className={styles.box}>{productInfo?.createAccountName}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.productDetail.creation.time', '創建時間')}
              </div>
              <div className={styles.box}>{formatUnixTimestamp(productInfo?.createTime || '')}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.productDetail.action.account', '操作賬戶')}
              </div>
              <div className={styles.box}>{productInfo?.modifyAccountName}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.productDetail.update.time', '更新時間')}
              </div>
              <div className={styles.box}>{formatUnixTimestamp(productInfo?.modifyTime || '')}</div>
            </div>
          </div>
        </Card>
      </Spin>
    </NormalLayout>
  );
};

export default ProductDetail;
