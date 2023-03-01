import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import { Spin, Image, Form, Input, Badge, Button, Space, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from '../index.less';
import { bigDecimalAdd, isEmptyUtils, kToString } from '@/utils/utils';
import type { ProductStockInfoResponse } from '@/services/api';
import type { Dictionary } from 'lodash';
import { sumBy } from 'lodash';
import { keyBy, map } from 'lodash';
import { PRODUCT_STOCK_STATUS_ACTION } from '@/utils/constants';
import cx from 'classnames';
import { Ellipsis, KPayBeautifyScrollbar, KPayTable } from '@/components/Fields';
import type { ProColumns } from '@ant-design/pro-table';
import { useUpdateEffect } from 'ahooks';
import { EyeOutlined } from '@ant-design/icons';
import failureIcon from '@/assets/svgs/product/err-list-img.svg';

export type ViewProductDrawerProps = {
  productId: string;
} & KPayDrawerProps;

// 倉庫列表格式
type TStockSkuListProps = ProductStockInfoResponse['productStockSkuListResponse'][0] & {
  skuPropertyObj: Dictionary<
    ProductStockInfoResponse['productStockSkuListResponse'][0]['skuPropertyList'][0]
  >;
};

const ViewProductDrawer: React.FC<ViewProductDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);
  // 倉庫數組
  const [stockInfo, setStockInfo] = useState<ProductStockInfoResponse>(
    {} as ProductStockInfoResponse,
  );
  // 倉庫ID
  const [warehouseId, setWarehouseId] = useState<string>('');
  // 倉庫sku列表
  const [stockSkuList, setStockSkuList] = useState<TStockSkuListProps[]>([]);
  // 倉庫列表統計
  const [warehouseCount, setWarehouseCount] = useState<string>('');
  // 控制当前PreviewGroup是否可见
  const [visible, setVisible] = useState(false);
  // 当前PreviewGroup的current
  const [current, setCurrent] = useState(0);

  const onVisibleChange = (vis: boolean) => {
    const chatDom = document.querySelector('.widget-Chat');
    if (!!chatDom) {
      chatDom.classList.add('widget-visible');
    }
    setVisible(vis);
  };

  // 顯示狀態
  const stateEnum = () => {
    const valueEnum = {};
    map(PRODUCT_STOCK_STATUS_ACTION, (item: any, index: number) => {
      valueEnum[index] = { text: getMessage(item[0], item[1]) };
    });
    return valueEnum;
  };

  // 初始化商品倉庫詳情
  const initWarehouse = (updateWarehouseOnly: boolean = false) => {
    setInitLoading(true);
    merchantApi
      .getProductStockInfo({
        productId: props.productId,
        warehouseId,
      })
      .then((res) => {
        setInitLoading(false);
        if (res.success) {
          const tempStockSkuList: TStockSkuListProps[] = [];
          let count = 0;
          res?.data?.productStockSkuListResponse?.forEach((item) => {
            tempStockSkuList.push({
              ...item,
              skuPropertyObj: keyBy(item?.skuPropertyList, 'propertyName'),
            });
            count = bigDecimalAdd(count, item.stock, 0);
          });

          setWarehouseCount(`${count}`);
          setStockSkuList(tempStockSkuList);

          if (!updateWarehouseOnly) {
            setStockInfo({
              ...res?.data,
              productFileList: res?.data.productFileList.splice(0, 10),
            });

            formInstance.setFieldsValue({
              productCode: res?.data?.productCode,
              skuCode: res?.data?.skuCode,
              productName: res?.data?.productName,
            });
          }
        }
      })
      .catch(() => {
        setInitLoading(false);
      });
  };

  // 生成字段表頭
  const generateColumns = useMemo(() => {
    const columns: ProColumns<any>[] = [
      {
        title: getMessage('inventory.product.sku.code', 'SKU編號'),
        dataIndex: 'skuCode',
        search: false,
        align: 'left',
        width: 156,
      },
    ];

    stockInfo?.productSkuPropertyList?.forEach((item) => {
      columns.push({
        title: (
          <Tooltip placement="topLeft" title={item?.propertyName}>
            <div className={styles.warehouseTableTh}>{item?.propertyName}</div>
          </Tooltip>
        ),
        dataIndex: item?.productSkuPropertyNameId,
        search: false,
        align: 'left',
        render: (value: any, row: any) => {
          return <Ellipsis>{row?.skuPropertyObj?.[item?.propertyName]?.propertyValue}</Ellipsis>;
        },
      });
    });

    return columns.concat([
      {
        title: getMessage('inventory.product.stock', '可用庫存'),
        dataIndex: 'stock',
        search: false,
        align: 'left',
        width: 100,
      },
      {
        title: getMessage('common.status', '狀態'),
        dataIndex: 'salesState',
        search: false,
        align: 'right',
        width: 70,
        valueEnum: stateEnum(),
        render: (value: any, row: any) => {
          return (
            <Space size={4} style={{ justifyContent: 'flex-end' }}>
              <Badge status={row.salesState === 0 ? 'default' : 'success'} />
              {value}
            </Space>
          );
        },
      },
    ]);
  }, [stockInfo]);

  useEffect(() => {
    if (props.open && props.productId) {
      initWarehouse();
    }
    if (!props.open) {
      setWarehouseId('');
    }
  }, [props.open, props.productId]);

  useUpdateEffect(() => {
    if (props.productId) {
      initWarehouse(true);
    }
  }, [warehouseId]);

  return (
    <KPayDrawer
      width={676}
      key={props.productId}
      className={styles.viewWarehouseDetailWapper}
      open={props?.open}
      onClose={props.closeCb}
      destroyOnClose
      title={getMessage('common.view', '詳情')}
    >
      <div style={{ display: 'none' }}>
        {stockInfo?.productFileList?.length && (
          <Image.PreviewGroup preview={{ current, visible, onVisibleChange: onVisibleChange }}>
            {stockInfo?.productFileList?.map((item) => (
              <Image
                key={item?.productFileId}
                src={item?.fileUrl}
                alt={item?.fileName}
                preview={{
                  mask: <EyeOutlined />,
                }}
                fallback={failureIcon}
                placeholder={<img src={failureIcon} width={40} height={40} />}
              />
            ))}
          </Image.PreviewGroup>
        )}
      </div>

      <Spin spinning={initLoading}>
        <p className={styles.viewWarehouseDetailTitle}>
          {getMessage('inventory.product.info', '商品資料')}
        </p>

        <div className={styles.globalViewDetailWapper}>
          <Form
            form={formInstance}
            className={styles.detailForm}
            colon={false}
            labelAlign="left"
            labelCol={{ style: { width: '85px' } }}
          >
            <Form.Item name="productCode" label={getMessage('commodity.common.code', '商品編號')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>

            <Form.Item name="skuCode" label={getMessage('inventory.product.sku.code', 'SKU編號')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>

            <Form.Item label={getMessage('common.image', '圖片')}>
              <div
                className={cx(styles.warehouseImg, styles.viewDetailContainer, styles.pictureList)}
              >
                {stockInfo?.productFileList?.length ? (
                  <>
                    {stockInfo?.productFileList?.map((item, index) => (
                      <Image
                        key={item?.productFileId}
                        src={item?.fileUrl}
                        alt={item?.fileName}
                        preview={{ visible: false }}
                        height={40}
                        className={styles.pictureItem}
                        fallback={failureIcon}
                        onClick={() => {
                          setVisible(true);
                          setCurrent(index);
                        }}
                        placeholder={<img src={failureIcon} width={40} height={40} />}
                      />
                    ))}
                  </>
                ) : (
                  <img height={40} src={failureIcon} />
                )}
              </div>
            </Form.Item>

            <Form.Item name="productName" label={getMessage('common.name', '名稱')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>

            <Form.Item label={getMessage('common.status', '狀態')}>
              {!isEmptyUtils(stockInfo?.salesState) && (
                <div className={styles.viewDetailContainer}>
                  <Space size={4}>
                    <Badge status={stockInfo?.salesState === 0 ? 'default' : 'success'} />
                    {PRODUCT_STOCK_STATUS_ACTION[stockInfo?.salesState]?.[0] &&
                      getMessage(
                        PRODUCT_STOCK_STATUS_ACTION[stockInfo?.salesState]?.[0],
                        PRODUCT_STOCK_STATUS_ACTION[stockInfo?.salesState]?.[1],
                      )}
                  </Space>
                </div>
              )}
            </Form.Item>
          </Form>
        </div>

        <p className={styles.viewWarehouseDetailTitle}>
          {getMessage('inventory.product.stock.info', '庫存資料')}
        </p>

        <KPayBeautifyScrollbar>
          <div className={styles.warehouseBtnWapper}>
            <Button
              key="all"
              className={cx(styles.warehouseBtn, !warehouseId ? styles.warehouseBtnActive : '')}
              onClick={() => {
                setWarehouseId('');
              }}
            >
              {getMessage('common.all', '全部')}
            </Button>
            {stockInfo?.warehouseList?.map((item: ProductStockInfoResponse['warehouseList'][0]) => {
              return (
                <Button
                  key={item?.warehouseId}
                  className={cx(
                    styles.warehouseBtn,
                    warehouseId === kToString(item.warehouseId) ? styles.warehouseBtnActive : '',
                  )}
                  onClick={() => {
                    setWarehouseId(`${item?.warehouseId ?? ''}`);
                  }}
                >
                  {item?.warehouseName}
                </Button>
              );
            })}
          </div>
        </KPayBeautifyScrollbar>

        <KPayTable
          scroll={{ x: sumBy(generateColumns, 'width') + 'px' }}
          className={styles.warehouseTable}
          columns={generateColumns}
          dataSource={stockSkuList}
          search={false}
          pagination={false}
          toolBarRender={false}
          footer={() => <>{`${getMessage('common.count', '合計')}： ${warehouseCount}`}</>}
          rowKey="productSkuId"
        />
      </Spin>
    </KPayDrawer>
  );
};

export default ViewProductDrawer;
