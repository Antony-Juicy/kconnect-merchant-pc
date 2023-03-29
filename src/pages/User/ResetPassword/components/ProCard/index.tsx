import icontubiao from '@/assets/images/common/icontubiao.png';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { CommonPasswordResetCodeResponse } from '@/services/api';
import { gotoLogin, notify } from '@/utils/antdUtils';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { pattern } from '@/utils/pattern';
import { EMAIL } from '@/utils/reg';
import type { IApiResponse } from '@/utils/request';
import { encryptWithCFB } from '@/utils/utils';
import ProCard from '@ant-design/pro-card';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormText, StepsForm } from '@ant-design/pro-form';
import { useBoolean } from 'ahooks';
import { Button, Form, Input, message, Space } from 'antd';
import cx from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'umi';
import styles from './index.less';

let timeChange: NodeJS.Timeout;

const ProCards: React.FC = () => {
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState('');
  const [code, setCode] = useState<any>(null);
  const [sec, setSec] = useState<number>(2);

  const [hintHlank, setHlank] = useState('');

  const [incorrect, setNcorrect] = useState('');
  const [Token, setToken] = useState<any>({});

  const [loginsa, setlogin] = useState('下一步');
  const inputRef = useRef(null);
  const [check, setCheck] = useState<number>(0);
  const [arr, setArr] = useState(['', '', '', '', '', '']);

  const [Defocus, setDefocus] = useState(true);

  const formRef = useRef<ProFormInstance>();

  const [notins, setService] = useState(false);

  const [loingLoading, { setTrue: showLoingoading, setFalse: hideLloingoading }] =
    useBoolean(false);

  const [newsLoad, { setTrue: showNewsLoad, setFalse: hideNewsLoad }] = useBoolean(false);

  const [verification, { setTrue: showVerification, setFalse: hideVerification }] =
    useBoolean(false);

  const [formInstance] = Form.useForm();

  const [validateStatus, setValidateStatus] = useState<
    '' | 'success' | 'warning' | 'error' | 'validating' | undefined
  >(undefined);

  const intl = useLocale();

  // 验证邮件  第一步diaol
  const accountinformation = async (value: any) => {
    showNewsLoad();
    setVisible(value.email);
    // return true
    const information: any = await merchantApi
      .postCommonPasswordResetCode({ account: value.email }, { noThrow: true })
      .catch((err) => {
        setHlank(err.message);
        setService(true);
        setValidateStatus('error');
        hideNewsLoad();
        return false;
      });

    if (`${information?.code}` === '10000') {
      hideNewsLoad();
      return true;
    }
    return false;
  };

  // 身份驗證 第二步 重新获取验证码
  const Authentication = async (arr: any) => {
    // return false
    const code = Object.values(arr).join('');

    setCode(code);

    if (code?.length != 6) {
      // message.error('請填寫驗證碼');
      setDefocus(false);
      setNcorrect('請輸入驗證碼');
      setService(true);
      return false;
    }

    try {
      showVerification();
      setlogin('驗證中');
      const tication: any = await merchantApi
        .postCommonVerifyCode({ email: visible, code: code }, { noThrow: true })
        .catch((err) => {
          hideVerification();
          setNcorrect(err.message);
          setService(true);
          setDefocus(false);
          setlogin('下一步');
          return false;
        });
      if (`${tication.code}` === '10000') {
        setToken(tication?.data);
        hideVerification();
        return true;
      }
    } catch {
      hideVerification();
      setlogin('下一步');
      return false;
    }
  };

  // 新獲取驗證碼
  const etverification = async () => {
    setArr(['', '', '', '', '', '']);
    setDefocus(true);
    formInstance.resetFields();
    const upperlimit = await merchantApi
      .postCommonPasswordResetCode({ account: visible })
      .then((res: IApiResponse<CommonPasswordResetCodeResponse>) => {
        if (`${res.code}` === '10000' && res.success) {
          message.success('已重新發送驗證碼');
        }
      })
      .catch((err) => {
        notify.error(err.message);
      });
  };

  // 提交
  const handleSubmit = async (value: any) => {
    const { password } = value;
    try {
      showLoingoading();
      const isLogin = Token;
      const encryption = await merchantApi.getCommonDataSecret();

      if (
        encryption.success &&
        encryption.data &&
        encryption.data.dataSecret &&
        encryption.data.dataSecretParameter
      ) {
        const data = encryptWithCFB(
          password,
          encryption.data.dataSecret,
          encryption.data.dataSecretParameter,
        );

        const param = {
          email: visible.toString(),
          password: data,
          token: isLogin,
        };
        try {
          showLoingoading();
          const resetPassword: any = await merchantApi
            .postCommonResetPassword(param)
            .catch((err) => {
              notify.error(err.message);
              hideLloingoading();
              return false;
            });
          if (`${resetPassword.code}` === '10000') {
            countDown();
            return true;
          }
        } catch {
          hideLloingoading();
          return false;
        }
      }
    } catch {
      hideLloingoading();
      return false;
    }
  };
  // 定时器 页面跳转
  const countDown = () => {
    timeChange = setInterval(() => setSec((t) => --t), 1000);
  };

  useEffect(() => {
    if (sec <= 0) {
      clearInterval(timeChange); // 清除定时器
      gotoLogin();
    }
  }, [sec]);

  // 生成 input 值
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setDefocus(true);
    const { value } = e.target;
    const len = arr.filter((item) => item !== '').length;

    const reg = /^-?\d*(\.\d*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      setTimeout(() => {
        const list = [...arr];
        list[index] = value[0];
        setArr(list);
        if (len !== index) {
          setCheck(len > 5 ? 5 : len);
        } else {
          setCheck(index < 5 ? index + 1 : index);
        }

        if (index <= arr.length - 1) {
          // @ts-ignore
          inputRef.current && inputRef.current!.focus();
        }
        const lists = list.every((v) => v != '');

        if (lists) {
          formRef.current?.submit();
        }
      }, 0);
    }
  };

  // 删除验证码
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    setDefocus(true);
    const { key, keyCode } = e;
    if (keyCode === 8 && key === 'Backspace') {
      // @ts-ignore
      if (index === 0 && !e.target.value) return;
      setTimeout(() => {
        setCheck(index - 1);
        // @ts-ignore
        inputRef.current && inputRef.current!.focus();
      }, 0);
      setArr((prev) => {
        const list = [...prev];
        list[index] = '';
        return list;
      });
    }
  };

  // 前往登入頁
  const Gotologinpage = () => {
    gotoLogin();
  };

  // 粘贴
  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    setDefocus(true);
    let val = e.clipboardData.getData('text');
    if (val && val.length > 6) {
      val = val.substr(0, 6);
    }
    setArr((prev) => {
      const newVal = [...prev];
      for (let i = 0; i < val.length; i++) {
        newVal[i] = val[i];
      }
      return newVal;
    });
    // 调接口
    const becide = val.split('').every((v) => v != '');

    if (becide) {
      formRef.current?.submit();
    }
  };

  useEffect(() => {
    // 清除定时器
    return () => {
      clearTimeout(timeChange);
    };
  }, []);

  // 控制提示
  useEffect(() => {
    if (notins) {
      clearTimeout(timeChange);
      timeChange = setTimeout(() => {
        setService(false);
      }, 2000);
    }
  }, [notins]);

  const inputLimit = () => {
    setValidateStatus(undefined);
  };

  return (
    <div className={styles.global_mi}>
      <Form form={formInstance}>
        <ProCard>
          <StepsForm<{
            name: string;
          }>
            submitter={{
              render: (props) => {
                if (props.step === 0) {
                  return [
                    <div key="step0" className={styles.buts}>
                      <Button
                        type="primary"
                        key="goToTree"
                        onClick={() => props.onSubmit?.()}
                        className={styles.but}
                        loading={newsLoad}
                      >
                        {intl.getMessage('next.step', '下一步')}
                      </Button>
                    </div>,
                  ];
                }

                if (props.step === 1) {
                  return [
                    <div key="step1">
                      <Button
                        type="primary"
                        key="goToTree"
                        loading={verification}
                        onClick={() => {
                          props.onSubmit?.();
                          event(BuriedPoint.KCLOGIN_FORGOTPW2_NEXTSTEP_TAPPED);
                        }}
                      >
                        {/* {intl.getMessage('next.step', '下一步 ')} */}
                        {loginsa}
                      </Button>
                      <div className={styles.from_diz}>
                        {intl.getMessage('Incorrect registration email', '沒有收到驗證碼郵件？')}{' '}
                        <span className={styles.KPay_l} onClick={() => props.onPre?.()}>
                          {intl.getMessage('enter.email.address', '重新輸入電郵地址')}{' '}
                        </span>
                      </div>
                    </div>,
                  ];
                }
                if (props.step === 2) {
                  return [
                    <div key="step2" className={styles.from_rs}>
                      <Button
                        loading={loingLoading}
                        type="primary"
                        key="goToTree"
                        onClick={() => {
                          props.onSubmit?.();
                          event(BuriedPoint.KCLOGIN_FORGOTPW3_RENEWPW_CONFIRM_TAPPED);
                        }}
                      >
                        {intl.getMessage('login.Confirm', '確認')}
                      </Button>
                    </div>,
                  ];
                }
                if (props.step === 3) {
                  return [
                    <div key="step3" className={styles.Butt}>
                      <Button
                        type="primary"
                        key="goToTree"
                        className={styles.Butn}
                        onClick={Gotologinpage}
                      >
                        {intl.getMessage('go.to.login.page', '前往登入頁')}
                      </Button>
                    </div>,
                  ];
                }
                return '';
              },
            }}
          >
            <StepsForm.StepForm<{
              name: string;
            }>
              name="email"
              title="賬戶電郵"
              onFinish={accountinformation}
            >
              <ProFormText
                name="email"
                validateStatus={validateStatus}
                label="請輸入你的註冊電郵以重設你的登入密碼"
                width="md"
                // tooltip="最长为 24 位，用于标定的唯一 id"
                placeholder="商戶註冊電郵"
                validateTrigger={['onBlur']}
                fieldProps={{
                  maxLength: 64,
                  onChange: () => inputLimit(),
                }}
                rules={[
                  { required: true, message: '請輸入註冊電郵' },
                  {
                    pattern: new RegExp(EMAIL, 'g'),
                    message: '電郵格式錯誤，請重新輸入',
                  },
                ]}
              />
              {notins && (
                <div className={styles.rcenter}>
                  <div className={styles.rcenter_r}>{hintHlank}</div>
                </div>
              )}
            </StepsForm.StepForm>

            <StepsForm.StepForm<{
              checkbox: string;
            }>
              name="code"
              title="賬戶驗證"
              onFinish={Authentication.bind(null, arr)}
              formRef={formRef}
            >
              <div className={styles.ftion}>
                <span>
                  {intl.getMessage('registered.to', '我們已向你所註冊的電郵地址')}
                  &nbsp;&nbsp;{visible}&nbsp;&nbsp;
                  {intl.getMessage('registered.tog', '發送')}
                  <br />
                  <span className={styles.ion}>
                    &ensp;&ensp;一次性驗證碼郵件，請在10分鐘內輸入以重新設定密碼。
                  </span>
                </span>
              </div>
              <div className={styles.fication}>
                <Space>
                  <div className={styles.tion}>
                    {arr.map((item, index) => {
                      // console.log(index,check)
                      return (
                        <Form key={item}>
                          <Form.Item
                            rules={[
                              {
                                required: true,
                                pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                                message: '请输入数字',
                              },
                            ]}
                          >
                            <Input
                              className={cx(
                                styles.from_item,
                                Defocus ? ' ' : styles.reportBtnActive,
                              )}
                              value={arr[index]}
                              {...(index === check ? { ref: inputRef } : {})}
                              max={1}
                              onChange={(e) => handleChange(e, index)}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              onPaste={handlePaste}
                            />
                          </Form.Item>
                        </Form>
                      );
                    })}
                  </div>
                </Space>
              </div>
              {notins && (
                <div className={styles.fication}>
                  <div className={styles.fication_r}>{incorrect}</div>
                </div>
              )}
              <div className={styles.from_itm}>
                <div className={styles.from_it} onClick={etverification}>
                  {intl.getMessage('retrieve.verification.code', '重新發送驗證碼')}
                </div>
              </div>
            </StepsForm.StepForm>

            <StepsForm.StepForm name="originalPassword" title="重設密碼" onFinish={handleSubmit}>
              {/* <ProFormText.Password label="InputPassword" name="input-password" /> */}
              <ProFormText.Password
                validateTrigger={['onBlur']}
                fieldProps={{
                  allowClear: true,
                  placeholder: '新密碼',
                  autoComplete: 'new-password',
                }}
                name="password"
                label="新密碼必須由至少8個字符（包括數字及字母）組成"
                width="md"
                // tooltip="最长为 24 位，用于标定的唯一 id"
                placeholder="新密碼"
                rules={[
                  { required: true, message: '請輸入由至少8個字符（包括數字及字母）組成的新密碼' },
                  pattern('pwd'),
                ]}
              />
              <ProFormText.Password
                validateTrigger={['onBlur']}
                fieldProps={{
                  allowClear: true,
                  placeholder: '確認新密碼',
                }}
                name="passwords"
                // label="請輸入你的註冊電郵密碼至少需要 8 個字符 ，且由數字及字母組成以重設你的登入密碼"
                width="md"
                // tooltip="最长为 24 位，用于标定的唯一 id"
                placeholder="確認新密碼"
                rules={[
                  {
                    required: true,
                    message: '請再次輸入由至少8個字符（包括數字及字母）組成的新密碼',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('密碼不一致，請重新輸入'));
                    },
                  }),
                ]}
              />
            </StepsForm.StepForm>

            <StepsForm.StepForm name="timeJJ" title="完成">
              <div className={styles.illustration}>
                <img src={icontubiao} alt="login illustrations" />
              </div>
              <div className={styles.tration}>成功重設密碼</div>
              <div className={styles.from_diz}>
                <span style={{ color: '#FBA21F' }}>{sec}s</span>
                <span className={styles.KPay_t}>
                  {intl.getMessage('login.page.after', '後自動跳轉登入頁')}
                </span>
              </div>
            </StepsForm.StepForm>
          </StepsForm>
        </ProCard>
      </Form>
    </div>
  );
};
export default ProCards;
