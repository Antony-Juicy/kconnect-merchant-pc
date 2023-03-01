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

export type ViewCategoryDrawerProps = {
  categoryId: string;
} & KPayDrawerProps;

const ViewCategoryDrawer: React.FC<ViewCategoryDrawerProps> = (props) => {
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
      .postCompanyProductTypeRemove({
        companyProductTypeId: props.categoryId,
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
    if (props.open && props.categoryId) {
      setInitLoading(true);
      merchantApi
        .getCompanyProductTypeInfo({
          companyProductTypeId: props.categoryId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            formInstance.setFieldsValue({
              typeName: res.data?.typeName,
              typeEnName: res.data?.typeEnName,
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
        key={props.categoryId}
        className={styles.globalViewDetailWapper}
        open={props?.open}
        onClose={props.closeCb}
        title={getMessage('commodity.category.view', '類別詳情')}
      >
        <Spin spinning={initLoading}>
          <Form form={formInstance} className={styles.detailForm} colon={false}>
            <Form.Item name="typeName" label={getMessage('commodity.common.name', '中文名稱')}>
              <Input.TextArea autoSize bordered={false} readOnly />
            </Form.Item>
            <Form.Item name="typeEnName" label={getMessage('commodity.common.en.name', '英文名稱')}>
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
                setContent(getMessage('commodity.category.remove.tips', '確定刪除該類別嗎？'));
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

export default ViewCategoryDrawer;
