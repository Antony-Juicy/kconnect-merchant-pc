import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import { Spin, Space, Button, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import styles from '../index.less';
import { formatUnixTimestamp } from '@/utils/utils';
import { map } from 'lodash';
import DeleteConfirmModal from '@/components/Modal/DeleteConfirmModal';
import { useBoolean } from 'ahooks';
import { notify } from '@/utils/antdUtils';

export type ViewInfoDrawerProps = {
  skuPropertyNameId: string;
} & KPayDrawerProps;

const ViewInfoDrawer: React.FC<ViewInfoDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);

  // 按鈕顯示模式
  const [confirmMode] = useState<'confirm' | 'alert' | undefined>('confirm');
  // 彈窗顯示内容
  const [content, setContent] = useState<string>('');
  // 顯示刪除彈窗
  const [delConfirm, { setTrue: showDelConfirm, setFalse: hideDelConfirm }] = useBoolean(false);
  // 刪除 loading
  const [deleteLoading, { setTrue: showDeleteLoading, setFalse: hideDeleteLoading }] =
    useBoolean(false);

  const confirmMethod = () => {
    showDeleteLoading();
    merchantApi
      .postProductSkuPropertyRemove({
        companyProductSkuPropertyNameId: props.skuPropertyNameId,
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
    if (props.open && props.skuPropertyNameId) {
      setInitLoading(true);
      merchantApi
        .getProductSkuPropertyInfo({
          companyProductSkuPropertyNameId: props.skuPropertyNameId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            formInstance.setFieldsValue({
              propertyName: res.data?.propertyName,
              propertyValue: map(res.data?.propertyValueList, 'propertyValue')?.join('、'),
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
        key={props.skuPropertyNameId}
        className={styles.globalViewDetailWapper}
        open={props?.open}
        onClose={props.closeCb}
        title={getMessage('commodity.sku.view', '款式選項詳情')}
      >
        <Spin spinning={initLoading}>
          <Form form={formInstance} className={styles.detailForm} colon={false}>
            <Form.Item
              name="propertyName"
              label={getMessage('commodity.common.optionn.name', '選項名稱')}
            >
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
            <Form.Item
              name="propertyValue"
              label={getMessage('commodity.common.optionn.val', '選項值')}
            >
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
                setContent(getMessage('commodity.sku.remove.tips', '確定刪除該選項嗎？'));
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
            confirmMethod();
          }}
          closeMethod={hideDelConfirm}
        />
      </KPayDrawer>
    </>
  );
};

export default ViewInfoDrawer;
