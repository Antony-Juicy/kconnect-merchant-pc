import { Ellipsis, Input, KPayTable } from '@/components/Fields';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { CompanyProductCategoryPageResponse } from '@/services/api';
import { CATEGORY_LEVEL_STATE } from '@/utils/constants';
import { formatUnixTimestamp } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Select } from 'antd';
import { map } from 'lodash';
import { useRef, useState } from 'react';
import CreateClassDrawer from './components/CreateClassDrawer';
import EditClassDrawer from './components/EditClassDrawer';
import ViewClassDrawer from './components/ViewClassDrawer';
import styles from './index.less';

const CommodityClassification = () => {
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
  const createClassification = () => {
    setShowCreateDrawer(true);
  };

  // 分類等級
  const levelEnum = () => {
    const valueEnum = {};
    map(CATEGORY_LEVEL_STATE, (item: any, index: number) => {
      valueEnum[index] = getMessage(item?.id, item?.defaultMessage);
    });
    return valueEnum;
  };

  // 优化显示分类
  const splitCategoryName = (value: string) => {
    const categoryName = value.split(',')?.filter((item: string) => item);
    return (
      <div className={styles.parentLevelListWapper}>
        {categoryName.length ? (
          categoryName.map((val) => {
            return (
              <div key={val} className={styles.parentLevelItem}>
                {val}
              </div>
            );
          })
        ) : (
          <></>
        )}
      </div>
    );
  };

  // 搜索
  const searchColumns: ProColumns<CompanyProductCategoryPageResponse['data'][0]>[] = [
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'categoryName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input allowClear placeholder={getMessage('common.name.placeholder', '請輸入名稱')} />
        );
      },
    },
    {
      title: getMessage('commodity.classification.category.level', '分類等級'),
      dataIndex: 'categoryLevel',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Select
            allowClear
            placeholder={getMessage(
              'commodity.classification.category.level.placeholder',
              '請選擇分類等級',
            )}
          >
            {map(levelEnum(), (item, index) => {
              return (
                <Select.Option value={index} key={index}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: getMessage('commodity.classification.parent.category.name', '上級分類'),
      dataIndex: 'parentCategoryName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage(
              'commodity.classification.parent.category.name.placeholder',
              '請輸入上級分類',
            )}
          />
        );
      },
    },
    {
      title: getMessage('commodity.classification.child.category.name', '下級分類'),
      dataIndex: 'childCategoryName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage(
              'commodity.classification.child.category.name.placeholder',
              '請輸入下級分類',
            )}
          />
        );
      },
    },
  ];

  // 表格
  const tableColumns: any = [
    {
      title: getMessage('commodity.common.name', '中文名稱'),
      dataIndex: 'categoryName',
      search: false,
      align: 'left',
      width: 200,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('commodity.common.en.name', '英文名稱'),
      dataIndex: 'categoryEnName',
      search: false,
      align: 'left',
      width: 200,
      render: (value: any) => {
        return <Ellipsis>{value}</Ellipsis>;
      },
    },
    {
      title: getMessage('commodity.classification.category.level', '分類等級'),
      dataIndex: 'categoryLevel',
      search: false,
      align: 'left',
      width: 120,
      valueEnum: levelEnum(),
    },
    {
      title: getMessage('commodity.classification.parent.category.name', '上級分類'),
      dataIndex: 'parentCategoryName',
      search: false,
      align: 'left',
      width: 180,
      render: (value: any) => {
        return <>{value ? splitCategoryName(value) : '/'}</>;
      },
    },
    {
      title: getMessage('commodity.classification.child.category.name', '下級分類'),
      dataIndex: 'childCategoryName',
      search: false,
      align: 'left',
      width: 180,
      render: (value: any) => {
        return <>{value ? splitCategoryName(value) : '/'}</>;
      },
    },
    {
      title: getMessage('common.modify.time', '更新時間'),
      dataIndex: 'modifyTime',
      search: false,
      align: 'left',
      width: 200,
      render: (value: any) => {
        return <>{formatUnixTimestamp(value)}</>;
      },
    },
    {
      title: getMessage('common.modify.account.name', '操作賬戶'),
      dataIndex: 'modifyAccountName',
      search: false,
      align: 'right',
      width: 160,
    },
  ];

  const columns = [...searchColumns, ...tableColumns];

  return (
    <NormalLayout>
      <KPayTable
        scroll={{ x: '1366px' }}
        actionRef={ref}
        columns={columns}
        request={async (params: any) => {
          const data = { ...params };

          const res = await merchantApi.getCompanyProductCategoryPage(data);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              setPrimaryId(record.companyProductCategoryId);
              setShowViewInfoDrawer(true);
            },
          };
        }}
        headerTitle={
          <>
            <span className={styles.tableTitle}>
              {getMessage('commodity.classification.page', '分類列表')}
            </span>
          </>
        }
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={createClassification}>
            <PlusOutlined />
            {getMessage('common.create', '新增')}
          </Button>,
        ]}
        rowKey="companyProductCategoryId"
        dateFormatter="string"
      />

      <CreateClassDrawer
        open={showCreateDrawer}
        closeCb={(reload?: boolean) => {
          if (reload === true) {
            ref.current?.reload();
          }
          setShowCreateDrawer(false);
        }}
      />

      <EditClassDrawer
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

      <ViewClassDrawer
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
export default CommodityClassification;
