import { Ellipsis, Input, KPayTable } from '@/components/Fields';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { WarehousePageResponse, WarehousePageResponseDetail } from '@/services/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import CreateWarehouseDrawer from './components/CreateWarehouseDrawer';
import EditWarehouseDrawer from './components/EditWarehouseDrawer';
import ViewWarehouseDrawer from './components/ViewWarehouseDrawer';
import styles from './index.less';

const InventoryWarehouse = () => {
  const { getMessage } = useLocale();
  /** 編輯或詳情記錄ID */
  const [primaryId, setPrimaryId] = useState<string>('');
  /** 显示新增弹窗 */
  const [showCreateDrawer, setShowCreateDrawer] = useState<boolean>(false);
  /** 显示編輯弹窗 */
  const [showEditDrawer, setShowEditDrawer] = useState<boolean>(false);
  /** 显示詳情弹窗 */
  const [showViewInfoDrawer, setShowViewInfoDrawer] = useState<boolean>(false);

  const ref = useRef<ActionType>();

  // 新增
  const createWarehouse = () => {
    setShowCreateDrawer(true);
  };

  // 搜索
  const searchColumns: ProColumns<WarehousePageResponse['data'][0]>[] = [
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'warehouseName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input allowClear placeholder={getMessage('common.name.placeholder', '請輸入名稱')} />
        );
      },
    },
  ];

  // 表格
  const tableColumns: any = [
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'warehouseName',
      search: false,
      align: 'left',
      width: 120,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('inventory.warehouse.address', '地址'),
      dataIndex: 'address',
      search: false,
      align: 'left',
      width: 200,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('inventory.warehouse.contacts.name', '負責人'),
      dataIndex: 'contactsName',
      search: false,
      align: 'left',
      width: 120,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('inventory.warehouse.contacts.mobile', '聯絡電話'),
      dataIndex: 'contactsMobile',
      search: false,
      align: 'left',
      width: 120,
      render: (value: any, row: WarehousePageResponseDetail) => {
        return row?.contactsMobile ? (
          <>
            {row?.mobileAreaCode ? `+${row?.mobileAreaCode}  ` : ''}
            {row?.contactsMobile}
          </>
        ) : (
          <></>
        );
      },
    },
    {
      title: getMessage('common.remark', '備註'),
      dataIndex: 'remark',
      search: false,
      align: 'left',
      width: 200,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
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

          const res = await merchantApi.getWarehousePage(data);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        headerTitle={
          <>
            <span className={styles.tableTitle}>
              {getMessage('inventory.warehouse.page', '倉庫列表')}
            </span>
          </>
        }
        onRow={(record) => {
          return {
            onClick: () => {
              setPrimaryId(record.warehouseId);
              setShowViewInfoDrawer(true);
            },
          };
        }}
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={createWarehouse}>
            <PlusOutlined />
            {getMessage('common.create', '新增')}
          </Button>,
        ]}
        rowKey="warehouseId"
        dateFormatter="string"
      />

      <CreateWarehouseDrawer
        open={showCreateDrawer}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowCreateDrawer(false);
        }}
      />

      <EditWarehouseDrawer
        open={showEditDrawer}
        warehouseId={primaryId}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowEditDrawer(false);
          setPrimaryId('');
        }}
      />

      <ViewWarehouseDrawer
        open={showViewInfoDrawer}
        warehouseId={primaryId}
        closeCb={(type: string) => {
          if (type === 'editInfo') {
            setShowViewInfoDrawer(false);
            setShowEditDrawer(true);
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
export default InventoryWarehouse;
