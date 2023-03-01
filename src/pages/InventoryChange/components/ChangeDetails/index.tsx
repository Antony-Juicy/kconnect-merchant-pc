import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { ProductStockRecordInfoResponse } from '@/services/api';
import { Spin, Form, Input, Image, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { formatUnixTimestamp } from '@/utils/utils';
import { KPayTable } from '@/components/Fields';
import { useBoolean } from 'ahooks';
import { ALL_INVENTORY_CHANGE_TYPE, enumCategory } from '@/utils/constants';
import type { ProColumns } from '@ant-design/pro-table';
import failureIcon from '@/assets/svgs/product/err-list-img.svg';

export type ChangeDetailsProps = {
  productStockId: number;
} & KPayDrawerProps;

const ChangeDetails: React.FC<ChangeDetailsProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, { setTrue: showInitLoading, setFalse: hideInitLoading }] = useBoolean(false);
  // 详情数据
  const [productStockInfo, setProductStockInfo] = useState<ProductStockRecordInfoResponse>();
  // 表头选项
  const [columns, setColumns] = useState<ProColumns[]>([]);
  // 变更选项列表，表格
  const [dataSource, setDataSource] = useState<
    ProductStockRecordInfoResponse['productSkuStockRecordList']
  >([]);

  // 初始化表头选项
  const initColumns: ProColumns[] = [
    {
      title: getMessage('commodity.add.change.option.type', '商品款式選項'),
      dataIndex: 'specs',
      align: 'left',
    },
    {
      title: getMessage('commodity.add.change.number', '變更數量'),
      dataIndex: 'modifyCount',
      align: 'left',
    },
  ];

  // 自定义说明
  const customDescription = () => {
    if (
      productStockInfo?.recordType == enumCategory.return ||
      productStockInfo?.recordType == enumCategory.issue
    ) {
      const label =
        productStockInfo?.recordType == enumCategory.return
          ? getMessage('commodity.add.change.return.instructions', '退貨説明')
          : getMessage('commodity.add.change.delivery.description', '出庫説明');
      return (
        <Form.Item name="description" label={label}>
          <Input.TextArea autoSize bordered={false} readOnly />
        </Form.Item>
      );
    }
    return null;
  };

  // 自定义表格显示数据
  const customColumnsHeader = (info: ProductStockRecordInfoResponse) => {
    const { recordType } = info;

    let customColumns: ProColumns[] = [];
    if (recordType == enumCategory.transfer) {
      customColumns = [
        {
          title: getMessage('commodity.add.change.warehousing', '入庫倉庫'),
          dataIndex: 'inWarehouseName',
          align: 'left',
        },
        {
          title: getMessage('commodity.add.change.outWarehouse', '出庫倉庫'),
          dataIndex: 'outWarehouseName',
          align: 'left',
        },
      ];
    } else if (recordType == enumCategory.procurement || recordType == enumCategory.return) {
      customColumns = [
        {
          title: getMessage('commodity.add.change.warehousing', '入庫倉庫'),
          dataIndex: 'inWarehouseName',
          align: 'left',
        },
      ];
    } else if (
      recordType == enumCategory.sales ||
      recordType == enumCategory.issue ||
      recordType == enumCategory.empty
    ) {
      customColumns = [
        {
          title: getMessage('commodity.add.change.outWarehouse', '出庫倉庫'),
          dataIndex: 'outWarehouseName',
          align: 'left',
        },
      ];
    }

    setColumns([...initColumns, ...customColumns]);
  };

  useEffect(() => {
    if (props.open && props.productStockId) {
      showInitLoading();
      merchantApi
        .getProductStockRecordInfo({
          productStockRecordId: `${props.productStockId}`,
        })
        .then((res) => {
          hideInitLoading();
          if (res.success) {
            setProductStockInfo(res.data);
            setDataSource(res.data.productSkuStockRecordList);
            customColumnsHeader(res.data);

            formInstance.setFieldsValue({
              recordCode: res.data.recordCode,
              productCode: res.data.productCode,
              productName: res.data.productName,
              recordType: getMessage(
                ALL_INVENTORY_CHANGE_TYPE[res.data.recordType]?.id,
                ALL_INVENTORY_CHANGE_TYPE[res.data.recordType]?.text,
              ),
              description: res.data.description,
              remark: res.data.remark,
              createAccountName: res.data.createAccountName,
              createTime: formatUnixTimestamp(res.data.createTime),
            });
          }
        })
        .catch(() => {
          hideInitLoading();
        });
    }
  }, [props.open]);

  return (
    <>
      <KPayDrawer
        width={676}
        key={props.productStockId}
        className={styles.globalViewDetailWapper}
        open={props?.open}
        onClose={props.closeCb}
        title={getMessage('common.view', '詳情')}
      >
        <Spin spinning={initLoading}>
          <Form form={formInstance} colon={false}>
            <div className={styles.detailForm}>
              <Form.Item
                name="recordCode"
                label={getMessage('commodity.inventory.change.No', '變更編號')}
              >
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
              <Form.Item
                name="productCode"
                label={getMessage('commodity.inventory.change.article.No', '商品編號')}
              >
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
              <Form.Item label={getMessage('commodity.add.change.product.picture', '商品圖片')}>
                <div className={styles.pictureList}>
                  {productStockInfo?.productFileList.length ? (
                    <Image.PreviewGroup>
                      <Space>
                        {productStockInfo?.productFileList?.map((item) => (
                          <Image
                            key={item.fileUrl}
                            className={styles.pictureItem}
                            src={item.fileUrl}
                            onError={(e: any) => {
                              e.target.src = failureIcon;
                              e.target.onerror = null;
                            }}
                            width={40}
                            height={40}
                            placeholder={<img src={failureIcon} width={40} height={40} />}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  ) : (
                    <img className={styles.pictureItem} src={failureIcon} />
                  )}
                </div>
              </Form.Item>
              <Form.Item
                name="productName"
                label={getMessage('commodity.price.productName', '商品名稱')}
              >
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
              <Form.Item
                name="recordType"
                label={getMessage('commodity.inventory.change.category', '變更類別')}
              >
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
            </div>

            <KPayTable
              className={styles.warehouseTable}
              columns={columns}
              dataSource={dataSource}
              search={false}
              pagination={false}
              key="productStockRecordId"
            />

            <div className={styles.detailForm}>
              {customDescription()}
              <Form.Item name="remark" label={getMessage('common.remark', '備註')}>
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
              <Form.Item
                name="createAccountName"
                label={getMessage('common.create.account', '創建賬戶')}
              >
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
              <Form.Item name="createTime" label={getMessage('common.create.time', '創建時間')}>
                <Input.TextArea autoSize bordered={false} readOnly />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </KPayDrawer>
    </>
  );
};

export default ChangeDetails;
