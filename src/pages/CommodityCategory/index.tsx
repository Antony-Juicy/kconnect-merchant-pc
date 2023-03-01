import { Input, KPayTable } from '@/components/Fields';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { CompanyProductTypePageResponse } from '@/services/api';
import { formatUnixTimestamp } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import CreateCategoryDrawer from './components/CreateCategoryDrawer';
import EditCategoryDrawer from './components/EditCategoryDrawer';
import ViewCategoryDrawer from './components/ViewCategoryDrawer';
import styles from './index.less';

const CommodityCategory = () => {
  const { getMessage } = useLocale();
  /** 显示新增弹窗 */
  const [showCreateDrawer, setShowCreateDrawer] = useState<boolean>(false);
  /** 显示編輯弹窗 */
  const [showEditDrawer, setShowEditDrawer] = useState<boolean>(false);
  /** 显示詳情弹窗 */
  const [showViewInfoDrawer, setShowViewInfoDrawer] = useState<boolean>(false);
  /** 編輯或詳情記錄ID */
  const [primaryId, setPrimaryId] = useState<string>('');

  const ref = useRef<ActionType>();

  // 新增
  const createCategory = () => {
    setShowCreateDrawer(true);
  };

  // 搜索
  const searchColumns: ProColumns<CompanyProductTypePageResponse['data'][0]>[] = [
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'typeName',
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
      title: getMessage('commodity.common.name', '中文名稱'),
      dataIndex: 'typeName',
      search: false,
      align: 'left',
      width: 200,
    },
    {
      title: getMessage('commodity.common.en.name', '英文名稱'),
      dataIndex: 'typeEnName',
      search: false,
      align: 'left',
      width: 200,
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
      align: 'right',
      width: 120,
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

          const res = await merchantApi.getCompanyProductTypePage(data);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        headerTitle={
          <>
            <span className={styles.tableTitle}>
              {getMessage('commodity.category.page', '類別列表')}
            </span>
          </>
        }
        onRow={(record) => {
          return {
            onClick: () => {
              setPrimaryId(record.companyProductTypeId);
              setShowViewInfoDrawer(true);
            },
          };
        }}
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={createCategory}>
            <PlusOutlined />
            {getMessage('common.create', '新增')}
          </Button>,
        ]}
        rowKey="companyProductTypeId"
        dateFormatter="string"
      />

      <CreateCategoryDrawer
        open={showCreateDrawer}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowCreateDrawer(false);
        }}
      />
      <EditCategoryDrawer
        open={showEditDrawer}
        categoryId={primaryId}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowEditDrawer(false);
          setPrimaryId('');
        }}
      />
      <ViewCategoryDrawer
        open={showViewInfoDrawer}
        categoryId={primaryId}
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
export default CommodityCategory;
