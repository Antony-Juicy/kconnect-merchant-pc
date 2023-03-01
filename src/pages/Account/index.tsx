import React, { useEffect, useState } from 'react';
// import ProCard from '@ant-design/pro-card';
import { ModalForm } from '@ant-design/pro-form';
import { Form, Input, Spin } from 'antd';
// import { useModel } from 'umi';
import NormalLayout from '@/components/Layout/NormalLayout';
// import moment from 'moment';
import styles from './index.less';
// import avatar from '@/assets/images/common/avatar.png';
import { pattern } from '@/utils/pattern';
// import { merchantApi } from '@/services';
import { useBoolean } from 'ahooks';
// import { encryptWithCFB } from '@/utils/utils';

const Account: React.FC = () => {
  // const { initialState } = useModel('@@initialState');
  const [visiable, setVisiable] = useState<boolean>(false);
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);
  const [submitLoading, { setTrue: showSubmitLoading, setFalse: hideSubmitLoading }] =
    useBoolean(false);

  const init = () => {
    showLoading();
  };

  useEffect(() => {
    init();
    hideLoading();
  }, []);

  const handleCancel = () => {
    setVisiable(false);
  };

  const editPsw = () => {
    setVisiable(true);
  };

  const handleFinish = async () => {
    if (!submitLoading) {
      showSubmitLoading();
      try {
        // const getKeyRes = await merchantApi.getUserDataKeySecret();
        // console.log('getKeyRes: ', getKeyRes);
        // if ('10000' === getKeyRes.code.toString() && getKeyRes.data) {
        //   const secretKey: string = getKeyRes.data.dataKey;
        //   const dataKeyParameter: string = getKeyRes.data.dataKeyParameter;
        //   const originalPassword = encryptWithCFB(
        //     value.originalPassword,
        //     secretKey,
        //     dataKeyParameter,
        //   );
        //   const newPassword = encryptWithCFB(value.newPassword, secretKey, dataKeyParameter);
        //   const confirmNewPassword = encryptWithCFB(
        //     value.confirmNewPassword,
        //     secretKey,
        //     dataKeyParameter,
        //   );
        //   const sumbitData = Object.assign(
        //     {},
        //     { originalPassword, newPassword, confirmNewPassword },
        //   );
        //   console.log('加密后： ', sumbitData);

        //   const modifyRes = await merchantApi.postUserPasswordModify(sumbitData);
        //   if ('10000' == modifyRes.code.toString()) {
        //     hideSubmitLoading();
        //     setVisiable(false);
        //     message.success('成功重設密碼', 5);
        //   }
        // }
        hideSubmitLoading();
      } catch (err) {
        hideSubmitLoading();
      }
    }
  };

  return (
    <div className={styles.mainContent}>
      <NormalLayout>
        <Spin spinning={loading}>
          <a className={styles.edit} onClick={editPsw}>
            修改
          </a>
        </Spin>
      </NormalLayout>

      <ModalForm
        width={460}
        title="重設密碼"
        visible={visiable}
        autoFocusFirstInput
        modalProps={{
          onCancel: () => handleCancel(),
          wrapClassName: `${styles.modalWrap}`,
          destroyOnClose: true,
        }}
        submitter={{
          render: (props) => {
            return [
              <div
                key="ok"
                className={styles.submitBtn}
                onClick={() => {
                  props.submit();
                }}
              >
                確認修改
              </div>,
            ];
          },
        }}
        onFinish={handleFinish}
      >
        <Spin spinning={submitLoading}>
          <div className={styles.subTitle}>密碼必須由至少8個字符（包括數字及字母）組成</div>
          <Form.Item
            name="originalPassword"
            rules={[{ required: true, message: '請輸入舊密碼' }]}
            // 密碼不正確，請重新輸入
          >
            <Input.Password allowClear className={styles.input} placeholder="舊密碼" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            // validateStatus={}
            rules={[
              {
                required: true,
                message: '請輸入新密碼',
              },
              pattern('pwd'),
            ]}
          >
            <Input.Password allowClear className={styles.input} placeholder="新密碼" />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            rules={[
              {
                required: true,
                message: '請再次輸入新密碼',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('密碼不一致，請重新輸入'));
                },
              }),
            ]}
          >
            <Input.Password allowClear className={styles.input} placeholder="確認新密碼" />
          </Form.Item>
        </Spin>
      </ModalForm>
    </div>
  );
};

export default Account;
