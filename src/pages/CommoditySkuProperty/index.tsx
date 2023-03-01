import { Input, KPayTable } from '@/components/Fields';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { ProductSkuPropertyPageResponseDetail } from '@/services/api';
import { formatUnixTimestamp } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import CreateSkuDrawer from './components/CreateSkuDrawer';
import EditSkuDrawer from './components/EditSkuDrawer';
import ViewInfoDrawer from './components/ViewInfoDrawer';
import styles from './index.less';

const CommoditySkuProperty = () => {
  const { getMessage } = useLocale();
  /** 显示新增弹窗 */
  const [showCreateDrawer, setShowCreateDrawer] = useState<boolean>(false);
  /** 显示編輯弹窗 */
  const [showEditSkuDrawer, setShowEditSkuDrawer] = useState<boolean>(false);
  /** 显示詳情弹窗 */
  const [showViewInfoDrawer, setShowViewInfoDrawer] = useState<boolean>(false);
  /** 編輯或詳情記錄ID */
  const [primaryId, setPrimaryId] = useState<string>('');

  const ref = useRef<ActionType>();

  // 新增
  const createSkuProperty = () => {
    setShowCreateDrawer(true);
  };

  // 搜索
  const searchColumns: ProColumns<ProductSkuPropertyPageResponseDetail>[] = [
    {
      title: getMessage('commodity.sku.property.name', '選項名稱'),
      dataIndex: 'propertyName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage('commodity.sku.property.name.placeholder', '請輸入選項名稱')}
          />
        );
      },
    },
  ];

  // 表格
  const tableColumns: any = [
    {
      title: getMessage('commodity.sku.property.name', '選項名稱'),
      dataIndex: 'propertyName',
      search: false,
      width: 160,
      align: 'left',
    },
    {
      title: getMessage('commodity.sku.property.value', '選項值'),
      dataIndex: 'propertyValue',
      search: false,
      align: 'left',
      width: 180,
    },
    {
      title: getMessage('common.modify.time', '更新時間'),
      dataIndex: 'modifyTime',
      search: false,
      align: 'left',
      width: 120,
      render: (value: any) => {
        return <>{formatUnixTimestamp(value)}</>;
      },
    },
    {
      title: getMessage('common.modify.account.name', '操作賬戶'),
      dataIndex: 'modifyAccountName',
      search: false,
      width: 120,
      align: 'right',
    },
  ];

  const columns = [...searchColumns, ...tableColumns];

  return (
    <NormalLayout>
      <KPayTable
        actionRef={ref}
        columns={columns}
        request={async (params: any) => {
          const data = { ...params };

          const res = await merchantApi.getProductSkuPropertyPage(data);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        headerTitle={
          <>
            <span className={styles.tableTitle}>
              {getMessage('commodity.sku.property', '款式選項列表')}
            </span>
          </>
        }
        onRow={(record) => {
          return {
            onClick: () => {
              setPrimaryId(record.companyProductSkuPropertyNameId);
              setShowViewInfoDrawer(true);
            },
          };
        }}
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={createSkuProperty}>
            <PlusOutlined />
            {getMessage('common.create', '新增')}
          </Button>,
        ]}
        rowKey="companyProductSkuPropertyNameId"
        dateFormatter="string"
      />

      <CreateSkuDrawer
        open={showCreateDrawer}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowCreateDrawer(false);
        }}
      />
      <EditSkuDrawer
        open={showEditSkuDrawer}
        skuPropertyNameId={primaryId}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowEditSkuDrawer(false);
          setPrimaryId('');
        }}
      />
      <ViewInfoDrawer
        open={showViewInfoDrawer}
        skuPropertyNameId={primaryId}
        closeCb={(type: string) => {
          if (type === 'editInfo') {
            setShowViewInfoDrawer(false);
            setShowEditSkuDrawer(true);
            return;
          }

          if (type === 'rmInfo') {
            ref.current?.reload();
          }

          setShowViewInfoDrawer(false);
          setPrimaryId('');
        }}
      />
    </NormalLayout>
  );
};
export default CommoditySkuProperty;
