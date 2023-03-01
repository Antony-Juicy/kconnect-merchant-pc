import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { Button, Form, Input, Space, Spin } from 'antd';
import styles from '../index.less';
import { useState } from 'react';
import { merchantApi } from '@/services';
import { notify } from '@/utils/antdUtils';
import { useEffect } from 'react';
import settings from '@/utils/settings';
import { CHINESE_REG } from '@/utils/reg';

export type CreateCategoryDrawerProps = {
  categoryId?: string;
} & KPayDrawerProps;

// TODO: 必填数据未输入时，確認按钮灰色不可点击，確認成功回到列表页面

const CreateCategoryDrawer: React.FC<CreateCategoryDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);
  // 提交loading
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // 提交添加選項
  const submitCategory = () => {
    formInstance.validateFields().then((data) => {
      setSubmitLoading(true);
      let method = undefined;
      if (props?.categoryId) {
        method = merchantApi.postCompanyProductTypeModify;
        data.companyProductTypeId = props.categoryId;
      } else {
        method = merchantApi.postCompanyProductTypeAdd;
      }
      method(data)
        .then((res) => {
          setSubmitLoading(false);
          if (res.success) {
            if (props?.categoryId) {
              notify.modifySuccess();
            } else {
              notify.createSuccess();
            }
            props?.closeCb?.(true);
          }
        })
        .catch(() => {
          setSubmitLoading(false);
        });
    });
  };

  useEffect(() => {
    if (props.open && props?.categoryId) {
      setInitLoading(true);
      merchantApi
        .getCompanyProductTypeInfo({
          companyProductTypeId: props.categoryId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            formInstance.setFieldsValue({
              typeName: res?.data?.typeName,
              typeEnName: res?.data?.typeEnName,
            });
          }
        })
        .catch(() => {
          setInitLoading(false);
        });
    }
    if (!props.open) {
      setSubmitLoading(false);
      formInstance.resetFields();
    }
  }, [props.open]);

  return (
    <KPayDrawer
      width={430}
      maskClosable={false}
      destroyOnClose
      className={styles.categoryDrawer}
      open={props?.open}
      onClose={props.closeCb}
      title={
        props?.categoryId
          ? getMessage('common.editor', '編輯')
          : getMessage('common.create', '新增')
      }
    >
      <Spin spinning={initLoading}>
        <Form form={formInstance} labelAlign="left" labelCol={{ style: { width: '85px' } }}>
          <Form.Item
            name="typeName"
            label={getMessage('commodity.common.name', '中文名稱')}
            rules={[
              {
                required: true,
                message: getMessage('commodity.common.name.placeholder', '請輸入中文名稱'),
              },
            ]}
            extra={
              props.categoryId
                ? ''
                : getMessage('commodity.category.name.tips', '（例如：服裝、飾品）')
            }
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage('commodity.common.name.placeholder', '請輸入中文名稱')}
            />
          </Form.Item>

          <Form.Item
            name="typeEnName"
            label={getMessage('commodity.common.en.name', '英文名稱')}
            getValueFromEvent={(event) => {
              return event?.target?.value?.replace(CHINESE_REG, '');
            }}
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage('commodity.common.en.name.placeholder', '請輸入英文名稱')}
            />
          </Form.Item>
        </Form>
        <Space className="fr">
          <Button
            className={styles.drawerBtnNormal}
            onClick={() => {
              props.closeCb?.();
            }}
          >
            {getMessage('common.cancel', '取消')}
          </Button>
          <Button
            type="primary"
            className={styles.drawerBtnPrimary}
            loading={submitLoading}
            onClick={() => {
              submitCategory();
            }}
          >
            {getMessage('common.confirm', '確認')}
          </Button>
        </Space>
      </Spin>
    </KPayDrawer>
  );
};

export default CreateCategoryDrawer;
