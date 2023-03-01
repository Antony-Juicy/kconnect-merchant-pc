import React, { useState, useEffect } from 'react';
import Head from '@/components/Head';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import { notify } from '@/utils/antdUtils';
import { pattern } from '@/utils/pattern';
import settings from '@/utils/settings';
import { encryptWithCFB } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import { Button, Form, Input, Modal } from 'antd';
import { history, useModel } from 'umi';
import type { IApiResponse } from '@/utils/request';
import type { AgreementInfoLatestResponse, AgreementReadInfoLatestResponse } from '@/services/api';
import { AGREEMENTREAD } from '@/utils/constants';
import closeIcon from '@/assets/svgs/close-no-bg.svg';
import confirmIcon from '@/assets/svgs/confirm.svg';
import styles from './index.less';

// let termsCountdown: NodeJS.Timeout; // 條款及細則同意按鈕倒數

const ChangePassword: React.FC = () => {
  const [formInstance] = Form.useForm();
  const { refresh } = useModel('@@initialState');

  const { getMessage } = useLocale();
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);
  const [btnDisabled, { setTrue: showBtnDisabled, setFalse: hideBtnDisabled }] = useBoolean(false);
  // 協議內容
  const [agreement, setAgreement] = useState<AgreementInfoLatestResponse | null>(null);
  // 條款細則彈框倒數
  // const [sec, setSec] = useState<number>(NaN);
  // 條款細則彈框
  const [termsVisiable, { setTrue: showTerms, setFalse: hideTerms }] = useBoolean(false);
  // 關閉條款細則確認框
  const [closeConfirm, { setTrue: showConfirm, setFalse: hideConfirm }] = useBoolean(false);

  useEffect(() => {
    merchantApi
      .getAgreementReadInfoLatest()
      .then((res: IApiResponse<AgreementReadInfoLatestResponse>) => {
        if (res && res.success) {
          showBtnDisabled();
          if (res.data.read) {
            hideBtnDisabled();
          } else {
            hideBtnDisabled();
            merchantApi
              .getAgreementInfoLatest()
              .then((response: IApiResponse<AgreementInfoLatestResponse>) => {
                if (response.success && response.data) {
                  setAgreement(response.data);
                  showTerms();
                  // setSec(10);
                }
              });
          }
        }
      })
      .catch(() => {
        hideBtnDisabled();
      });
  }, []);

  // const countDown = () => {
  //   clearInterval(termsCountdown);
  //   // eslint-disable-next-line no-param-reassign
  //   termsCountdown = setInterval(() => setSec((t) => --t), 1000);
  // };

  // useEffect(() => {
  //   if (sec < 0) {
  //     clearInterval(termsCountdown);
  //   } else if (sec === 10) {
  //     countDown();
  //   }
  // }, [sec]);

  const confirmTitle = () => {
    return (
      <div className={styles.titleNode}>
        <img src={confirmIcon} className={styles.confirmIcon} />
        <div className={styles.title}>提示</div>
      </div>
    );
  };

  // 協議同意按鈕
  const termsOnOk = () => {
    if (agreement?.agreementId) {
      merchantApi
        .postAgreementRead({ agreementId: agreement.agreementId, option: AGREEMENTREAD.OK })
        .then(() => {
          hideTerms();
          hideConfirm();
        });
    }
  };

  // 協議拒絕按鈕
  const termsOnCancel = () => {
    if (agreement?.agreementId) {
      merchantApi
        .postAgreementRead({ agreementId: agreement.agreementId, option: AGREEMENTREAD.CANCEL })
        .then(() => {
          // setInitialState((s) => ({ ...s, currentUser: undefined }));
          // loginOut();
          history.push('/user/login');
          hideTerms();
          hideConfirm();
        });
    }
  };

  const rejectTerms = () => {
    showConfirm();
    Modal.confirm({
      centered: true,
      className: styles.confirm,
      width: 520,
      title: confirmTitle(),
      icon: null,
      content: '如果你不同意此條款及細則，即無法使用KConnect的服務。',
      okText: '同意條款',
      cancelText: '仍然拒絕',
      cancelButtonProps: { className: styles.cancel },
      okButtonProps: { className: styles.agree },
      onOk() {
        termsOnOk();
      },
      onCancel() {
        termsOnCancel();
      },
    });
  };

  // 提交
  const handleSubmit = () => {
    formInstance.validateFields().then((values) => {
      const { newSecret } = values;
      showLoading();
      merchantApi
        .getCommonDataSecret()
        .then((res: any) => {
          if (res.success && res.data && res.data.dataSecret && res.data.dataSecretParameter) {
            const data = encryptWithCFB(
              newSecret,
              res.data.dataSecret,
              res.data.dataSecretParameter,
            ).trim();

            merchantApi
              .postCommonResetDefaultSecret({ newSecret: data })
              .then(() => {
                hideLoading();

                notify.success(
                  getMessage('the.password.was.successfully.reset.Procedure', '成功重設密碼'),
                );
                history.replace('/main/dashboard');
                refresh();
              })
              .catch((err: any) => {
                notify.error(err.message);
                hideLoading();
              });
          }
        })
        .catch(() => {
          hideLoading();
        });
    });
  };

  return (
    <div className={styles.BoxContent}>
      <Head />
      <div className={styles.content}>
        <Form
          validateTrigger={settings.formValidateTrigger}
          layout="vertical"
          form={formInstance}
          onFinish={handleSubmit}
        >
          <div className={styles.subTitle}>設定密碼</div>
          <div className={styles.subState}>為保證你的賬戶安全，請為賬戶設定全新的密碼</div>
          <div className={styles.absoluteContent}>
            <div className={styles.tip}>（由 字母 + 數字 組成至少 8 位字符長度）</div>
            <Form.Item
              name="newPassword"
              label="密碼"
              className={styles.newPassword}
              rules={[
                {
                  required: true,
                  message: getMessage(
                    'common.newpwdempty',
                    '請輸入由至少8個字符組成的新密碼（包括數字及字母）',
                  ),
                },
                pattern('pwd'),
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                allowClear
                className={styles.input}
                placeholder="請輸入"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="確認密碼"
            name="newSecret"
            className={styles.confirmNewPassword}
            rules={[
              {
                required: true,
                message: getMessage(
                  'common.confirmpwdempty',
                  '請再次輸入由至少8個字符組成的新密碼（包括數字及字母）',
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(getMessage('common.pwdconfirmperr', '密碼不一致，請重新輸入')),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              allowClear
              autoComplete="new-password"
              className={styles.input}
              placeholder="請輸入"
            />
          </Form.Item>

          <Form.Item className={styles.submit}>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.btn}
              loading={loading}
              disabled={btnDisabled}
            >
              完成
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Modal
        centered
        width={1200}
        wrapClassName={styles.terms}
        closeIcon={<img src={closeIcon} alt="" className={styles.closeIcon} />}
        title={agreement?.agreementName ?? <div />}
        footer={null}
        visible={termsVisiable}
        // visible={true}
        keyboard={false}
        maskClosable={false}
        mask={!closeConfirm}
        onCancel={rejectTerms}
      >
        <div className={styles.textContent}>
          <div
            dangerouslySetInnerHTML={{
              __html:
                agreement && agreement?.zhContent && '<p></p>' !== agreement.zhContent
                  ? agreement.zhContent
                  : agreement?.enContent || '',
            }}
          />
        </div>
        <div className={styles.btnBox}>
          <Button className={styles.cancel} onClick={rejectTerms}>
            拒絕
          </Button>
          <Button onClick={termsOnOk} className={styles.agree}>
            同意
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default ChangePassword;
