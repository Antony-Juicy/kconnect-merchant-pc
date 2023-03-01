import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import { Spin, Space, Button, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import styles from '../index.less';
import { formatUnixTimestamp } from '@/utils/utils';
import { notify } from '@/utils/antdUtils';
import DeleteConfirmModal from '@/components/Modal/DeleteConfirmModal';
import { useBoolean } from 'ahooks';

export type ViewWarehouseDrawerProps = {
  warehouseId: string;
} & KPayDrawerProps;

const ViewWarehouseDrawer: React.FC<ViewWarehouseDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);

  // 按鈕顯示模式
  const [confirmMode, setConfirmMode] = useState<'confirm' | 'alert' | undefined>('confirm');
  // 彈窗顯示内容
  const [content, setContent] = useState<string>('');
  // 顯示刪除彈窗
  const [delConfirm, { setTrue: showDelConfirm, setFalse: hideDelConfirm }] = useBoolean(false);
  // 刪除 loading
  const [deleteLoading, { setTrue: showDeleteLoading, setFalse: hideDeleteLoading }] =
    useBoolean(false);

  // 刪除函數
  const removeMethod = () => {
    showDeleteLoading();
    merchantApi
      .postWarehouseRemove({
        warehouseId: props.warehouseId,
      })
      .then((res) => {
        hideDeleteLoading();
        hideDelConfirm();
        if (res.success) {
          notify.removeSuccess();
          props?.closeCb?.('rmInfo');
        }
      })
      .catch(() => {
        hideDelConfirm();
        hideDeleteLoading();
      });
  };

  useEffect(() => {
    if (props.open && props.warehouseId) {
      setInitLoading(true);
      merchantApi
        .getWarehouseInfo({
          warehouseId: props.warehouseId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            formInstance.setFieldsValue({
              warehouseName: res?.data?.warehouseName,
              address: res?.data?.address,
              contactsName: res?.data?.contactsName,
              contactsMobile: `${
                res?.data?.mobileAreaCode ? `+${res?.data?.mobileAreaCode}` : '+852'
              } ${res?.data?.contactsMobile}`,
              remark: res?.data?.remark,
              createTime: formatUnixTimestamp(res.data?.createTime),
              createAccountName: res.data?.createAccountName,
              modifyTime: formatUnixTimestamp(res.data?.modifyTime),
              modifyAccountName: res.data?.modifyAccountName,
            });
          }
        })
        .catch(() => {
          setInitLoading(false);
        });
    }
  }, [props.open]);

  return (
    <>
      <KPayDrawer
        width={430}
        key={props.warehouseId}
        className={styles.globalViewDetailWapper}
        open={props?.open}
        onClose={props.closeCb}
        title={getMessage('common.view', '詳情')}
      >
        <Spin spinning={initLoading}>
          <Form form={formInstance} className={styles.detailForm} colon={false}>
            <Form.Item name="warehouseName" label={getMessage('common.name', '名稱')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
            <Form.Item name="address" label={getMessage('inventory.warehouse.address', '地址')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
            <Form.Item
              name="contactsName"
              label={getMessage('inventory.warehouse.contacts.name', '負責人')}
            >
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
            <Form.Item
              name="contactsMobile"
              label={getMessage('inventory.warehouse.contacts.mobile', '聯絡電話')}
            >
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
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
            <Form.Item
              name="modifyAccountName"
              label={getMessage('common.handler.account', '操作賬戶')}
            >
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
            <Form.Item name="modifyTime" label={getMessage('common.update.time', '更新時間')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
          </Form>
          <Space className="fr">
            <Button
              className={styles.drawerBtnDanger}
              onClick={() => {
                setContent(getMessage('inventory.warehouse.remove.tips', '確定刪除該倉庫嗎？'));
                setConfirmMode('confirm');
                showDelConfirm();
              }}
            >
              {getMessage('common.remove', '刪除')}
            </Button>
            <Button
              className={styles.drawerBtnNormal}
              onClick={() => {
                props.closeCb?.('editInfo');
              }}
            >
              {getMessage('common.editor', '編輯')}
            </Button>
          </Space>
        </Spin>

        <DeleteConfirmModal
          open={delConfirm}
          confirmMode={confirmMode}
          content={content}
          deleteLoading={deleteLoading}
          confirmMethod={() => {
            removeMethod();
          }}
          closeMethod={hideDelConfirm}
        />
      </KPayDrawer>
    </>
  );
};

export default ViewWarehouseDrawer;
