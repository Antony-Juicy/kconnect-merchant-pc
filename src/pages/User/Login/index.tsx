import closeIcon from '@/assets/svgs/close-no-bg.svg';
import confirmIcon from '@/assets/svgs/confirm.svg';
import refreshsvg from '@/assets/svgs/refresh.svg';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type {
  AgreementInfoLatestResponse,
  AgreementReadInfoLatestResponse,
  CommonDataSecretResponse,
  CommonLoginQrGenerationResponse,
  CommonLoginResponse,
} from '@/services/api';
import { notify } from '@/utils/antdUtils';
import {
  getCheckedKey,
  removeAllowSkipAuthorize,
  removeCompanyId,
  setAccessToken,
  setCheckedKey,
  setExpires,
  setRefreshToken,
  clearAuthInfo,
} from '@/utils/auth';
import {
  AGREEMENTREAD,
  BURIEDKEY,
  QR_CODE_STATE,
  RESET_PASSWORD_FIRST_LOGIN,
  SUSOENDED_ACCOUNT,
} from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import settings from '@/utils/settings';
import { encryptWithCFB, getErrorMsg, openNewTabs } from '@/utils/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { useBoolean, useRequest, useUpdateEffect } from 'ahooks';
import { Button, Card, Checkbox, Col, Form, Input, Modal, Spin, Tabs } from 'antd';
import cx from 'classnames';
import moment from 'moment';
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from 'react';
// import UA from 'ua-device';
import bgIcon from '@/assets/images/login/loginBg.png';
import normalIcon from '@/assets/normal.svg';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { formatUnixTimestamp } from '@/utils/utils';
import { history, useModel } from 'umi';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import styles from './index.less';

const QRCodeComponent: any = QRCode 

const { TabPane } = Tabs;

let timeChange: NodeJS.Timeout; //定时器

// let termsCountdown: NodeJS.Timeout; // 條款及細則同意按鈕倒數

const antIcon = <LoadingOutlined className={styles.profileLoadingOutlined} spin />;

// const supportAnimate: boolean = undefined !== document.getElementById('root')?.animate;

const Login: React.FC = () => {
  const { refresh, setInitialState } = useModel('@@initialState');
  const [formInstance] = Form.useForm();
  const [isName, setIsName] = useState(false);
  const [isBlank, setIsBlank] = useState(false);
  const [nameBlur, setNameBlur] = useState(false);
  const [lankBlur, setBlank] = useState(false);
  const [qrCodeLink, setQrCodeLink] = useState<string>('');
  const [hintHlank, setHlank] = useState('');
  const [notins, setService] = useState(false);
  const [isInvaild, setIsInvaild] = useState<boolean>(false);
  const intl = useLocale();
  const [btnLoading, { setTrue: showBtnLoading, setFalse: hideBtnLoading }] = useBoolean(false);
  const [qrLoading, { setTrue: showQrLoading, setFalse: hideQrLoading }] = useBoolean(false);
  const [qrRefresh, setQrRefresh] = useState(false);

  const [key, setKeyBlank] = useState('2');
  const [list, setList] = useState<any[]>([]);

  //是否选中
  const [checked, setChecked] = useState(false);

  //readOnly
  const [readOnly, setReadOnly] = useState(true);

  // 背景图片加载完后再添加背景色
  // const [bgOnload, { setTrue: bgOnloadTrue }] = useBoolean(false);
  // 條款細則彈框
  const [termsVisiable, { setTrue: showTerms, setFalse: hideTerms }] = useBoolean(false);
  // 條款細則彈框倒數
  // const [sec, setSec] = useState<number>(NaN);
  // 關閉條款細則確認框
  const [closeConfirm, { setTrue: showConfirm, setFalse: hideConfirm }] = useBoolean(false);
  // 查询是否已同意协议的开关
  const [checkSwitch, { setTrue: checkAble, setFalse: checkDisable }] = useBoolean(false);
  // 協議內容
  const [agreement, setAgreement] = useState<AgreementInfoLatestResponse | null>(null);
  // 是否支持 Web Animations
  // const [supportAnimations, { setFalse: supportAnimationsFalse }] = useBoolean(true);
  // 设备指纹
  const [fpHash, setFpHash] = React.useState('');

  const getCopywrite = () => {
    merchantApi.getAgreementInfoLatest().then((res: IApiResponse<AgreementInfoLatestResponse>) => {
      if (res.success && res.data) {
        setList([{ agreementId: res.data.agreementId, agreementName: res.data.agreementName }]);
      }
    });
  };

  const gotoPage = (id: string, title: string) => {
    const href = history.createHref({
      pathname: `/agreement?id=${id}&title=${encodeURI(title)}`,
    });
    openNewTabs(href);
  };

  const {
    data: resData,
    run,
    cancel,
  } = useRequest(merchantApi.getCommonLoginQrState, {
    manual: true,
    pollingInterval: 600,
    onSuccess: () => {
      setIsInvaild(false);
      if (resData?.success && resData.data) {
        removeCompanyId();
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        if (resData.data.state === QR_CODE_STATE.CONFIRMED) {
          cancel();
          setAccessToken(resData.data.accessToken);
          setRefreshToken(resData.data.refreshToken);
          setExpires(moment().add(resData.data.expired, 'seconds').valueOf());
          checkAble();
          refresh();
        } else if (
          resData.data.state === QR_CODE_STATE.EXPIRED ||
          resData.data.state === QR_CODE_STATE.REFUSED
        ) {
          cancel();
          setQrRefresh(!qrRefresh);
        }
      }
    },
    onError: () => {
      cancel();
      setIsInvaild(true);
    },
  });

  // 忘记密码
  const goEdit = () => {
    event(BuriedPoint.KCLOGIN_ACCT_LOGIN_FORGOTPW_TAPPED);
    history.push('/user/ResetPassword');
  };

  const qrCodeGeneration = () => {
    setIsInvaild(false);
    cancel();
    showQrLoading();
    merchantApi
      .postCommonLoginQrGeneration()
      .then((res: IApiResponse<CommonLoginQrGenerationResponse>) => {
        hideQrLoading();
        if (res.success && res.data) {
          if (res.data.qrCodeLink) {
            const link = res.data.qrCodeLink.split('=');
            run({ temporaryToken: link[1] }, { noThrow: true });
            setQrCodeLink(res.data.qrCodeLink);
          }
        }
      })
      .catch(() => {
        hideQrLoading();
      });
  };

  const onChange = (e: any) => {
    setChecked(e.target.checked);
  };

  useEffect(() => {
    const condition = getCheckedKey();
    if (condition === 'false' || condition === null) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
      setChecked(true);
    }
    const setFp = async () => {
      const fp = await FingerprintJS.load();

      const { visitorId } = await fp.get();

      setFpHash(visitorId);
    };

    setFp();
  }, []);

  const Demos = () => {
    // 提交登錄
    const handleSubmit = () => {
      removeCompanyId();
      const time = formatUnixTimestamp(new Date().getTime(), ' HH:mm:ss DD/MM/YYYY');
      const params = {};
      params[BURIEDKEY.ACCESSTIME] = time;
      event(BuriedPoint.KCLOGIN_ACCT_LOGIN_LOGIN_TAPPED, params);
      formInstance.validateFields().then((values) => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        const { account, password } = values;
        showBtnLoading();
        merchantApi
          .getCommonDataSecret()
          .then((res: IApiResponse<CommonDataSecretResponse>) => {
            if (res.success && res.data && res.data.dataSecret && res.data.dataSecretParameter) {
              const data = encryptWithCFB(
                password,
                res.data.dataSecret,
                res.data.dataSecretParameter,
              ).trim();
              merchantApi
                .postCommonLogin({ account: account.trim(), secretCode: data, terminalSerialNumber: fpHash }, { noThrow: true })
                .then((logindata: IApiResponse<CommonLoginResponse>) => {
                  if (
                    logindata?.success ||
                    logindata?.data?.errorCode === RESET_PASSWORD_FIRST_LOGIN
                  ) {
                    removeAllowSkipAuthorize();
                    setAccessToken(logindata.data.accessToken);
                    setRefreshToken(logindata.data.refreshToken);
                    setExpires(moment().add(logindata.data.expired, 'seconds').valueOf());
                    formInstance.resetFields();
                    setIsName(false);
                    setIsBlank(false);
                    checkAble();
                    setCheckedKey(checked);
                  } else {
                    setHlank(getErrorMsg(logindata.code, logindata, '賬戶或密碼錯誤'));
                  }
                })
                .catch((err) => {
                  if (`${err.code}` === SUSOENDED_ACCOUNT) {
                    notify.error(err.message);
                    hideBtnLoading();
                    return;
                  }
                  setHlank(err.message);
                  setService(true);
                  hideBtnLoading();
                });
            }
          })
          .catch(() => {
            hideBtnLoading();
          });
      });
    };

    //  账号 聚焦 重复
    const onAccountFocus = () => {
      setIsName(true);
      setNameBlur(false);
    };

    //  密码 聚焦 重复
    const onPasswordFocus = () => {
      setIsBlank(true);
      setBlank(false);
    };

    // 切换Tabs
    const changeTabs = (keys: React.SetStateAction<string>) => {
      setKeyBlank(keys);
      if (keys === '1') {
        setIsBlank(false);
        qrCodeGeneration();
      } else if (keys === '2') {
        setIsName(false);
        formInstance.resetFields();
        cancel();
      }
    };

    useUpdateEffect(() => {
      qrCodeGeneration();
    }, [qrRefresh]);

    useEffect(() => {
      event(BuriedPoint.KCLOGIN_VIEWED);
      // qrCodeGeneration();
      getCopywrite();
      // removeExpires();
      // if (!supportAnimate) {
      //   supportAnimationsFalse();
      // }

      // accountFromEmail只有在邮件登录页面跳转过来的情况下才有值，用于自动填充用户账号，login页面/整体页面销毁后顺带销毁
      window.onbeforeunload = () => {
        sessionStorage.removeItem('accountFromEmail');
      }
      return () => { sessionStorage.removeItem('accountFromEmail'); }

    }, []);

    // 控制提示
    useEffect(() => {
      if (notins) {
        clearTimeout(timeChange);
        timeChange = setTimeout(() => {
          setService(false);
        }, 3000);
      }
    }, [notins]);

    return (
      <Tabs activeKey={key} onChange={changeTabs} className={styles.deleteBorder}>
        <TabPane tab="賬户登入" key="2">
          <Card className={styles.loginCard}>
            <div className={styles.loginTitle}>
              <Form
                layout="vertical"
                form={formInstance}
                onFinish={handleSubmit}
                validateTrigger={settings.formValidateTrigger}
                initialValues={{ account: sessionStorage.getItem('accountFromEmail') }}  //accountFromEmail只有在邮件登录页面跳转过来的情况下才有值，用于自动填充用户账号
              >
                <div className={styles.Suspendedlayer}>
                  <Form.Item
                    name="account"
                    rules={[
                      {
                        required: true,
                        message: '請填寫商戶註冊電郵',
                      },
                    ]}
                  >
                    <Input
                      allowClear
                      // autoComplete="new-password"
                      className={styles.account}
                      onFocus={onAccountFocus}
                      onBlur={() => {
                        setNameBlur(true);
                        setReadOnly(false);
                        // setIsName(false);
                      }}
                      placeholder={!isName ? '商戶註冊電郵' : ''}
                    />
                  </Form.Item>
                  {
                    <div
                      className={cx(
                        styles.spended,
                        isName ? styles.SuspendedActive : styles.SuspendedBlur,
                        nameBlur ? styles.Active : '',
                      )}
                    >
                      商戶註冊電郵
                    </div>
                  }
                </div>
                <div className={styles.itemBottomBlank}>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: '請輸入密碼',
                      },
                    ]}
                  >
                    <Input.Password
                      readOnly={readOnly}
                      // autoComplete="new-password"
                      allowClear
                      onFocus={onPasswordFocus}
                      onBlur={() => {
                        setBlank(true);
                      }}
                      placeholder={!isBlank ? intl.getMessage('dashboard.login', '密碼') : ''}
                    />
                  </Form.Item>
                  {
                    <div
                      className={cx(
                        styles.Blank,
                        isBlank ? styles.BlankActive : styles.BlankActiveBlur,
                        lankBlur ? styles.activeank : '',
                      )}
                    >
                      密碼
                    </div>
                  }
                </div>

                <Checkbox
                  name="remember"
                  checked={checked}
                  onChange={onChange}
                  className={styles.checkedRemember}
                >
                  記住密碼
                </Checkbox>

                <div className={styles.hint_s}>
                  {notins && <div className={styles.hint}>{hintHlank}</div>}
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={btnLoading}
                  className={cx(styles.loginButton)}
                >
                  {intl.getMessage('dashboard.logins', '登入')}
                </Button>

                <div className={styles.mimi}>
                  <div className={styles.mimi_r} onClick={goEdit}>
                    忘記密碼
                  </div>
                </div>
              </Form>
            </div>
          </Card>
        </TabPane>
        <TabPane tab="QR Code 登入" key="1">
          <div className={styles.qrWapper}>
            {qrLoading ? (
              <Spin
                className={styles.erwema}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                spinning
                indicator={antIcon}
              />
            ) : (
              <QRCodeComponent value={qrCodeLink} className={styles.erwema} />
            )}
            {isInvaild && (
              <div className={cx(styles.erwema, styles.refresh)}>
                <img
                  src={refreshsvg}
                  alt=""
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    qrCodeGeneration();
                  }}
                />
                <p className={styles.qrcodeErr}>QR Code逾期失效，按此重新整理</p>
              </div>
            )}
          </div>
          <div className={styles.KPay}>
            {intl.getMessage('use.clivk', '使用')}{' '}
            <span className={styles.KPay_l}>{intl.getMessage('invalid.KPay APP', 'KPay APP')}</span>{' '}
            掃描 QR Code 登入
          </div>
        </TabPane>
      </Tabs>
    );
  };

  useEffect(() => {
    if (checkSwitch) {
      merchantApi
        .getAgreementReadInfoLatest()
        .then((res: IApiResponse<AgreementReadInfoLatestResponse>) => {
          if (res && res.success) {
            hideBtnLoading();
            if (res.data.read) {
              history.replace('/main/dashboard');
              refresh();
            } else {
              merchantApi
                .getAgreementInfoLatest()
                .then((response: IApiResponse<AgreementInfoLatestResponse>) => {
                  if (response.success && response.data) {
                    setAgreement(response.data);
                    setList([
                      {
                        agreementId: response.data.agreementId,
                        agreementName: response.data.agreementName,
                      },
                    ]);
                    showTerms();
                    // setSec(10);
                  }
                });
            }
          }
          checkDisable();
        })
        .catch(() => {
          hideBtnLoading();
        });
    }
  }, [checkSwitch]);

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

  const loginOut = async () => {
    clearAuthInfo();
    merchantApi.postCommonLogout(undefined, { noThrow: true });
  };

  // 協議同意按鈕
  const termsOnOk = () => {
    if (agreement?.agreementId) {
      merchantApi
        .postAgreementRead({ agreementId: agreement.agreementId, option: AGREEMENTREAD.OK })
        .then(() => {
          hideTerms();
          hideConfirm();
          history.replace('/main/dashboard');
          refresh();
        });
    }
  };

  // 協議拒絕按鈕
  const termsOnCancel = () => {
    if (agreement?.agreementId) {
      merchantApi
        .postAgreementRead({ agreementId: agreement.agreementId, option: AGREEMENTREAD.CANCEL })
        .then(() => {
          loginOut();
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

  return (
    <div style={{ backgroundImage: `url(${bgIcon})` }} className={styles.main}>
      <div className={styles.loginRow}>
        <Col className={styles.log}>
          {
            <div className={styles.login}>
              <div className={styles.longtast}>
                <img src={normalIcon} alt="" className={styles.normalIcon} />
                <div className={styles.textContent}>{'一站式商家運營管理中心'}</div>
                <div className={styles.Loginplease}>{Demos()}</div>
              </div>
            </div>
          }
          {
            <div className={styles.leas_r}>
              {0 < list.length &&
                list.map((item) => {
                  return (
                    <Button
                      className={styles.protocolBth}
                      key={`button_key_${item?.agreementId}`}
                      onClick={gotoPage.bind(null, item?.agreementId, item?.agreementName)}
                      type="link"
                    >
                      {item?.agreementName || ''}
                    </Button>
                  );
                })}
            </div>
          }
        </Col>
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

export default Login;
