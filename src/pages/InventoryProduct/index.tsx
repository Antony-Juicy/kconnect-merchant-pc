import { Ellipsis, Input, KPayImageGroup, KPayTable } from '@/components/Fields';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { ProductStockPageResponse, ProductStockPageResponseDetail } from '@/services/api';
import { PRODUCT_STOCK_STATUS_ACTION } from '@/utils/constants';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Badge, Space, Spin } from 'antd';
import { map } from 'lodash';
import { useRef, useState } from 'react';
import ViewProductDrawer from './components/ViewProductDrawer';
import styles from './index.less';
import { notify } from '@/utils/antdUtils';

const InventoryProduct = () => {
  const { getMessage } = useLocale();
  /** 編輯或詳情記錄ID */
  const [primaryId, setPrimaryId] = useState<string>('');
  /** 显示詳情弹窗 */
  const [showViewInfoDrawer, setShowViewInfoDrawer] = useState<boolean>(false);
  //* 商品圖片列表內容
  const [imgData, setImgData] = useState<any[] | null>(null);

  const ref = useRef<ActionType>();

  // 顯示狀態
  const stateEnum = () => {
    const valueEnum = new Map();
    valueEnum.set(null, { text: getMessage('common.all', '全部') });
    map(PRODUCT_STOCK_STATUS_ACTION, (item: any, index: number) => {
      valueEnum.set(index, { text: getMessage(item[0], item[1]) });
    });
    return valueEnum;
  };

  // 搜索
  const searchColumns: ProColumns<ProductStockPageResponse['data'][0]>[] = [
    {
      title: getMessage('commodity.common.code', '商品編號'),
      dataIndex: 'productCode',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage('commodity.common.code.placeholder', '請輸入商品編號')}
          />
        );
      },
    },
    {
      title: getMessage('inventory.product.sku.code', 'SKU編號'),
      dataIndex: 'skuCode',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage('inventory.product.sku.code.placeholder', '請輸入SKU編號')}
          />
        );
      },
    },
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'productName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input allowClear placeholder={getMessage('common.name.placeholder', '請輸入名稱')} />
        );
      },
    },
    {
      title: getMessage('common.status', '狀態'),
      dataIndex: 'salesState',
      hideInTable: true,
      valueEnum: stateEnum(),
    },
  ];

  // 表格
  const tableColumns: any = [
    {
      title: getMessage('commodity.common.code', '商品編號'),
      dataIndex: 'productCode',
      search: false,
      align: 'left',
      width: 200,
    },
    {
      title: getMessage('inventory.product.sku.code', 'SKU編號'),
      dataIndex: 'skuCode',
      search: false,
      align: 'left',
      width: 120,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('common.image', '圖片'),
      dataIndex: 'fileUrl',
      search: false,
      align: 'left',
      width: 180,
      render: (value: any, record: ProductStockPageResponseDetail) => (
        <KPayImageGroup
          cover={value}
          id="productFileId"
          imgData={imgData ?? []}
          reset={setImgData}
          placeholder={<Spin />}
          onClick={(e) => {
            e.nativeEvent.stopPropagation();
            e.stopPropagation();
            merchantApi
              .getProductFileList({ productId: record?.productId }, { noThrow: true })
              .then((res) => {
                if (res && res.data) {
                  setImgData(res.data);
                }
              })
              .catch(() => {
                notify.error(getMessage('commodity.getFileList.fail', '獲取圖片列表失敗'));
              });
          }}
        />
      ),
    },
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'productName',
      search: false,
      align: 'left',
      width: 120,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('inventory.product.stock', '可用庫存'),
      dataIndex: 'stock',
      search: false,
      align: 'left',
      width: 120,
    },
    {
      title: getMessage('common.status', '狀態'),
      dataIndex: 'salesState',
      search: false,
      align: 'right',
      width: 90,
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
  ];

  const columns = [...searchColumns, ...tableColumns];

  return (
    <NormalLayout>
      <KPayTable
        scroll={{ x: '1600px' }}
        actionRef={ref}
        columns={columns}
        request={async (params: any) => {
          const data = { ...params };

          const res = await merchantApi.getProductStockPage(data);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        headerTitle={
          <>
            <span className={styles.tableTitle}>
              {getMessage('inventory.product.page', '庫存列表')}
            </span>
          </>
        }
        onRow={(record) => {
          return {
            onClick: () => {
              setPrimaryId(record.productId);
              setShowViewInfoDrawer(true);
            },
          };
        }}
        toolBarRender={() => []}
        rowKey="productId"
        dateFormatter="string"
      />
      <ViewProductDrawer
        open={showViewInfoDrawer}
        productId={primaryId}
        closeCb={() => {
          setShowViewInfoDrawer(false);
          setPrimaryId('');
        }}
      />
    </NormalLayout>
  );
};
export default InventoryProduct;
