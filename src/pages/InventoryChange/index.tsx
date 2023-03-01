import React, { useRef, useState } from 'react';
import NormalLayout from '@/components/Layout/NormalLayout';
import KPayTable from '@/components/Fields/kpay-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { merchantApi } from '@/services';
import type { ProductStockRecordPageResponseDetail } from '@/services/api';
import useLocale from '@/hooks/useLocale';
import { Input, Button, message } from 'antd';
import styles from './index.less';
import { map } from 'lodash';
import { ALL_INVENTORY_CHANGE_TYPE } from '@/utils/constants';
import { formatUnixTimestamp } from '@/utils/utils';
import { history } from 'umi';
import ChangeDetails from './components/ChangeDetails';
import { useBoolean } from 'ahooks';
import plusIcon from '@/assets/svgs/product/plus-outlined.svg';
import { KPayImageGroup } from '@/components/Fields';

const InventoryChange: React.FC = () => {
  const { getMessage } = useLocale();
  const tableRef = useRef<ActionType>();
  // 商品库存id
  const [productStockId, setProductStockId] = useState(0);
  // 是否开启库存变更详情
  const [open, { setTrue: showOpen, setFalse: hideOpen }] = useBoolean(false);
  //* 商品圖片列表內容
  const [imgData, setImgData] = useState<any[] | null>(null);

  // 國際化選項枚舉
  const mapValueEnum = (value: any) => {
    const valueEnum = {};
    map(value, (item: any, index: number) => {
      valueEnum[index] = { text: getMessage(item.id, item.defaultMessage) };
    });
    return valueEnum;
  };

  // 新增變更
  const addChanges = () => {
    history.push({
      pathname: '/main/inventory/add',
    });
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
      .then((res) => {
        if (res && res.data) {
          setImgData(res.data);
        }
      })
      .catch(() => {
        message.error(getMessage('commodity.getFileList.fail', '獲取圖片列表失敗'));
      });
  };

  const searchColumns: ProColumns<ProductStockRecordPageResponseDetail>[] = [
    {
      title: getMessage('commodity.inventory.change.article.No', '商品編號'),
      dataIndex: 'productCode',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage(
              'commodity.inventory.change.article.No.placeholder',
              '請輸入商品編號',
            )}
          />
        );
      },
    },
    {
      title: getMessage('commodity.inventory.change.name', '名稱'),
      dataIndex: 'productName',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Input allowClear placeholder={getMessage('common.name.placeholder', '請輸入名稱')} />
        );
      },
    },
    {
      title: getMessage('commodity.inventory.change.category', '變更類別'),
      dataIndex: 'recordType',
      hideInTable: true,
      valueEnum: mapValueEnum(ALL_INVENTORY_CHANGE_TYPE),
    },
  ];

  const tableColumns: ProColumns<ProductStockRecordPageResponseDetail>[] = [
    {
      title: getMessage('commodity.inventory.change.No', '變更編號'),
      dataIndex: 'recordCode',
      hideInSearch: true,
      align: 'left',
      width: 100,
    },
    {
      title: getMessage('commodity.inventory.change.article.No', '商品編號'),
      dataIndex: 'productCode',
      hideInSearch: true,
      align: 'left',
      width: 100,
    },
    {
      title: getMessage('common.picture', '圖片'),
      dataIndex: 'fileUrl',
      hideInSearch: true,
      align: 'left',
      render: (text: any, record: any) => (
        <div
          className="price-record-img-box"
          onClick={(e) => {
            e.nativeEvent.stopPropagation();
            e.stopPropagation();
            checkImg(record.productId, text);
          }}
        >
          <KPayImageGroup
            cover={text}
            id="productFileId"
            imgData={imgData ?? []}
            reset={setImgData}
          />
        </div>
      ),
      width: 80,
    },
    {
      title: getMessage('commodity.inventory.change.name', '名稱'),
      dataIndex: 'productName',
      hideInSearch: true,
      align: 'left',
      width: 250,
    },
    {
      title: getMessage('commodity.inventory.change.category', '變更類別'),
      dataIndex: 'recordType',
      hideInSearch: true,
      align: 'left',
      valueEnum: mapValueEnum(ALL_INVENTORY_CHANGE_TYPE),
      width: 80,
    },
    {
      title: getMessage('commodity.inventory.change.quantity', '變更數量'),
      dataIndex: 'modifyCount',
      hideInSearch: true,
      align: 'left',
      width: 80,
    },
    {
      title: getMessage('commodity.inventory.change.warehousing.warehouse', '入庫倉庫'),
      dataIndex: 'inWarehouseName',
      hideInSearch: true,
      align: 'left',
      width: 120,
    },
    {
      title: getMessage('commodity.inventory.change.outbound.warehouse', '出庫倉庫'),
      dataIndex: 'outWarehouseName',
      hideInSearch: true,
      align: 'left',
      width: 120,
    },
    {
      title: getMessage('common.create.time', '創建時間'),
      dataIndex: 'createTime',
      hideInSearch: true,
      align: 'left',
      render: (text: any) => <>{formatUnixTimestamp(text)}</>,
      width: 120,
    },
    {
      title: getMessage('common.create.account', '創建賬戶'),
      dataIndex: 'createAccountName',
      hideInSearch: true,
      align: 'left',
      width: 120,
    },
  ];

  const columns = [...searchColumns, ...tableColumns];

  return (
    <NormalLayout>
      <KPayTable
        actionRef={tableRef}
        columns={columns}
        request={async (params: any) => {
          const res = await merchantApi.getProductStockRecordPage(params);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        onRow={(record: ProductStockRecordPageResponseDetail) => {
          return {
            onClick: () => {
              setProductStockId(record.productStockRecordId);
              showOpen();
            },
          };
        }}
        headerTitle={
          <>
            <span className={styles.tableTitle}>
              {getMessage('commodity.inventory.change.title', '變更列表')}
            </span>
          </>
        }
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            className="primary-btn"
            onClick={addChanges}
            icon={<img src={plusIcon} />}
          >
            {getMessage('commodity.inventory.change.add', '新增變更')}
          </Button>,
        ]}
        rowKey="productStockRecordId"
        dateFormatter="string"
        scroll={{ x: 1600 }}
      />

      {/* 详情 */}
      <ChangeDetails
        open={open}
        productStockId={productStockId}
        closeCb={() => {
          hideOpen();
          setProductStockId(0);
        }}
      />
    </NormalLayout>
  );
};
export default InventoryChange;
