import React, { useState, useRef } from 'react';
import NormalLayout from '@/components/Layout/NormalLayout';
import { KPayTable } from '@/components/Fields';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import { Typography } from 'antd';
import { fixedDigit, thousands, verifyNumber } from '@/utils/utils';
import settings from '@/utils/settings';
import { useBoolean } from 'ahooks';
import {
  // Spin,
  Form,
  Input,
  Space,
  Button,
  message,
} from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import useLocale from '@/hooks/useLocale';
import { SALESSTATE } from '@/utils/constants';
import { merchantApi } from '@/services';
import type { IApiResponse } from '@/utils/request';
import type { ProductPricePageResponse, ProductPricePageResponseDetail } from '@/services/api';
import _ from 'lodash';
import styles from './index.less';

const PricePage: React.FC = () => {
  const { getMessage } = useLocale();
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tableRef = useRef<ActionType>();
  const [visible, { setTrue: showVisible, setFalse: hideVisible }] = useBoolean(false);
  const [btnLoading, { setTrue: showBtnLoading, setFalse: hideBtnLoading }] = useBoolean(false);
  const [drawerData, setDrawerData] = useState<ProductPricePageResponseDetail | null>(null);

  const renderParagraph = (text: any, rows: number = 2, style: Record<string, any> = {} ) => {
    return (<Typography.Paragraph style={{ minWidth: '80px', ...style }} ellipsis={{ rows, tooltip: true }}>
      {text}
    </Typography.Paragraph>)
  }

  const priceChange = (record: any) => {
    const chatDom = document.querySelector('.widget-visible');
    if (!!chatDom) {
      chatDom.classList.add('widget-Chat');
      chatDom.classList.remove('widget-visible');
    }
    showVisible();
    setDrawerData(record);
    form.setFieldsValue({
      productId: record?.productId,
      productSkuId: record?.productSkuId,
      originalPrice: record?.originalPrice ? Number(record?.originalPrice) : _.get(record, 'originalPrice', undefined),
      specialPrice: record?.originalPrice ? Number(record?.specialPrice) : _.get(record, 'specialPrice', undefined),
      costPrice: record?.originalPrice ? Number(record?.costPrice) : _.get(record, 'costPrice', undefined),
    });
  };

  const onClose = () => {
    hideVisible();
    form.setFieldsValue({
      productId: undefined,
      originalPrice: undefined,
      specialPrice: undefined,
      costPrice: undefined,
    });
    setDrawerData(null);
    const chatDom = document.querySelector('.widget-Chat');
    if (!!chatDom) {
      chatDom.classList.add('widget-visible');
    }
  };

  const submit = (value: any) => {
    showBtnLoading();
    // return
    merchantApi
      .postProductPriceModify(value)
      .then(() => {
        hideBtnLoading();
        hideVisible();
        message.success(getMessage('commodity.price.change.success', '改價成功'));
        if (tableRef.current) {
          tableRef.current.reload();
        }
      })
      .catch(() => {
        hideBtnLoading();
        hideVisible();
      });
  };

  const columns: any[] = [
    {
      title: getMessage('price.skuCode', 'SKU編號'),
      dataIndex: 'skuCode',
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('price.productName', '名稱'),
      dataIndex: 'productName',
      width: 200,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('price.specs', '款式選項'),
      dataIndex: 'specs',
      search: false,
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('price.originalPrice', '原價（HKD）'),
      dataIndex: 'originalPrice',
      search: false,
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('price.specialPrice', '特價（HKD）'),
      dataIndex: 'specialPrice',
      search: false,
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('price.costPrice', '成本（HKD）'),
      dataIndex: 'costPrice',
      search: false,
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('commodity.salesState', '狀態'),
      dataIndex: 'salesState',
      width: 100,
      render: (text: any) =>
        text === SALESSTATE.OFFSALE ? (
          <div className={`${styles.stateWrap} ${styles.offSale}`}>
            {getMessage('commodity.offSale', '下架')}
          </div>
        ) : (
          <div className={`${styles.stateWrap} ${styles.onSale}`}>
          {getMessage('commodity.onSale', '上架')}
        </div>
        ),
      search: false,
    },
    {
      title: getMessage('common.operate', '操作'),
      search: false,
      width: 80,
      fixed: 'right',
      render: (text: any, record: any) => (
        <div className={styles.operate}>
          <a onClick={priceChange.bind(null, record)}>{getMessage('price.change', '改價')}</a>
        </div>
      ),
    },
  ];

  return (
    <NormalLayout visible={false}>
      <KPayTable
        actionRef={tableRef}
        columns={columns}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: '',
        }}
        columnEmptyText=""
        request={async (params: any) => {
          const { page } = params;
          setCurrentPage(page);
          const res: IApiResponse<ProductPricePageResponse> = await merchantApi.getProductPricePage(
            {
              ...params,
            },
          );
          if (res.success && res.data) {
            return {
              success: true,
              //* mock
              total: res.data.totalCount,
              data: res.data.data,
              // total: mockList.data.totalCount,
              // data: mockList.data.data
            };
          }
          return {
            success: true,
            data: [],
            //* mock
            // total: mockList.data.totalCount,
            // data: mockList.data.data
          };
        }}
        search={{
          // collapsed,
          // onCollapse: setCollapsed,
          span: 8,
          labelWidth: 70,
        }}
        simplePaginationChange={{
          showTotal: (total) => `共 ${total} 個`,
          current: currentPage,
        }}
        headerTitle={
          <span className={styles.tableTitle}>
            {getMessage('commodity.price.page', '價格列表')}
          </span>
        }
      />

      <KPayDrawer
        width={475}
        className={styles.detailDrawer}
        open={visible}
        onClose={onClose}
        title={getMessage('commodity.price.change', '改價')}
      >
        <div className={styles.infoBox}>
          <div className={styles.item}>
            <div className={styles.label}>{getMessage('price.skuCode', 'SKU編號')}</div>
            <div className={styles.value}>{renderParagraph(drawerData?.skuCode || '', 1)}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>
              {getMessage('commodity.price.productName', '商品名稱')}
            </div>
            <div className={styles.value}>{renderParagraph(drawerData?.productName || '', 1)}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>{getMessage('price.specs', '款式選項')}</div>
            <div className={styles.value}>{renderParagraph(drawerData?.specs || '', 1)}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>{getMessage('commodity.salesState', '狀態')}</div>
            <div className={styles.value}>
              {undefined !== drawerData?.salesState ? (
                drawerData.salesState === SALESSTATE.ONSALE ? (
                  <div className={`${styles.stateWrap} ${styles.onSale}`}>
                    {getMessage('commodity.onSale', '上架')}
                  </div>
                ) : (
                  <div className={`${styles.stateWrap} ${styles.offSale}`}>
                    {getMessage('commodity.offSale', '下架')}
                  </div>
                )
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
        <Form form={form} onFinish={submit} colon={false} className={styles.changePriceForm}>
          <Form.Item name="productId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="productSkuId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label={getMessage('price.originalPrice', '原價（HKD）')}
            name="originalPrice"
            rules={[
              {
                required: true,
                message: getMessage('common.required', '請輸入數值'),
              },
            ]}
            getValueFromEvent={(event) =>
              verifyNumber(event.target.value, '', {
                price: settings.priceMaxAmount,
              })
            }
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={getMessage('price.specialPrice', '特價（HKD）')}
            name="specialPrice"
            rules={[
              {
                required: true,
                message: getMessage('common.required', '請輸入數值'),
              },
            ]}
            getValueFromEvent={(event) =>
              verifyNumber(event.target.value, '', {
                price: settings.priceMaxAmount,
              })
            }
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={getMessage('price.costPrice', '成本（HKD）')}
            name="costPrice"
            rules={[
              {
                required: true,
                message: getMessage('common.required', '請輸入數值'),
              },
            ]}
            getValueFromEvent={(event) =>
              verifyNumber(event.target.value, '', {
                price: settings.priceMaxAmount,
              })
            }
          >
            <Input />
          </Form.Item>
          <div className={styles.formFooter}>
            <Space size="middle">
              <Button className="primary-btn" onClick={onClose}>
                {getMessage('common.cancel', '取消')}
              </Button>
              <Button className="primary-btn" type="primary" htmlType="submit" loading={btnLoading}>
                {getMessage('common.other.confirm', '確認')}
              </Button>
            </Space>
          </div>
        </Form>
      </KPayDrawer>
    </NormalLayout>
  );
};

export default PricePage;
