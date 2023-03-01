import ClearIcon from '@/assets/svgs/clear-icon.svg';
import DownArrowIcon from '@/assets/svgs/down-arrow-icon.svg';
import SuccessIcon from '@/assets/svgs/successModal.svg';
import KPayModal from '@/components/Fields/kpay-modal';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type {
  ApplicationDictionaryListResponse,
  ApplicationFeedbackConsultAddResponse,
  ApplicationFeedbackQuestionAddResponse,
  ApplicationFeedbackSuggestAddResponse,
  ApplicationListFeedbackableResponse,
} from '@/services/api';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { APPUSEFLAG, BURIEDKEY, FEEDBACK, FEEDBACKDIC, FEEDBACK_TEXT } from '@/utils/constants';
import { describe, EMAIL, NUMBER_ONLY } from '@/utils/reg';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Checkbox, Col, Form, Input, Radio, Row, Select } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import cx from 'classnames';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import Style from './index.less';
export type FeedbackProps = {
  open: boolean;
  onCancel: () => void;
};

interface ItemProps {
  label: string;
  value: string;
}

const Feedback: React.FC<FeedbackProps> = (props) => {
  const { open, onCancel } = props;
  const { Option } = Select;
  const [timeList, setTimeList] = useState<ItemProps[]>([]);
  const [markList, setMarkList] = useState<ItemProps[]>([]);
  const [queList, setQueList] = useState<ItemProps[]>([]);
  const [modalOKLoading, { setTrue: showmodalOKLoading, setFalse: hidemodalOKLoading }] =
    useBoolean(false);
  const [FBType, setFBType] = useState<number>(FEEDBACK.More);
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [otherQueVisible, { setTrue: showOtherQueVisible, setFalse: hideOtherQueVisible }] =
    useBoolean(false);
  const [appLoading, { setTrue: showAppLoading, setFalse: hideAppLoading }] = useBoolean(false);
  const [
    successModalVisible,
    { setTrue: showSuccessModalVisible, setFalse: hideSuccessModalVisible },
  ] = useBoolean(false);
  const [appNameOptions, setAppNameOptions] = useState<ItemProps[]>([]);
  const [mobileRequire, setMobileRequire] = useState<boolean>(false);
  const [contactMethodError, setContactMethodError] = useState<string | undefined>(undefined);
  const [whatAppRequire, setWhatAppRequire] = useState<boolean>(false);
  const [emailRequired, setEmailRequired] = useState<boolean>(false);
  const [otherContactRequired, setOtherContactRequired] = useState<boolean>(false);
  const [moreFormValue, setMoreFormValue] = useState<any>({});
  const [queFormValue, setQueFormValue] = useState<any>({});
  const [suggestFormValue, setSuggestFormValue] = useState<any>({});

  const { getMessage } = useLocale();
  const other = {
    label: getMessage('application.feedback.other', '其他'),
    value: 'otherQuestion',
  };

  // 其他问题选项
  const onQueChange = (checkedValues: CheckboxValueType[]) => {
    if (checkedValues.indexOf('otherQuestion') > -1) {
      showOtherQueVisible();
    } else {
      hideOtherQueVisible();
    }
  };

  // 获取我的应用数据
  const getApp = () => {
    showAppLoading();
    merchantApi
      .getApplicationListFeedbackable()
      .then((res: IApiResponse<ApplicationListFeedbackableResponse>) => {
        const list: ItemProps[] = [];
        res.data.map((item) => {
          const app: ItemProps = { value: '', label: '' };
          app.value = String(item.applicationId);
          app.label = item.applicationName;
          list.push(app);
        });
        setAppNameOptions(list);
      });
    hideAppLoading();
  };

  // 校验联络方式
  const validateContactMethod = (res: any) => {
    if (
      (res.mobile || '').trim().length === 0 &&
      (res.whatsApp || '').trim().length === 0 &&
      (res.email || '').trim().length === 0 &&
      (res.otherContact || '').trim().length === 0
    ) {
      form
        .validateFields(['whatsApp', 'email', 'otherContact', 'mobile'])
        .then(() => {
          setContactMethodError(
            getMessage('application.detail.pleasentercontactmethod', '請輸入聯絡方式'),
          );
        })
        .catch(() => {
          setContactMethodError(undefined);
        });

      return false;
    } else {
      setContactMethodError(undefined);
      return true;
    }
  };

  // 提交表单
  const handleSumbit = debounce(() => {
    const params = {};
    let appNames = '';
    form
      .validateFields()
      .then((res) => {
        if (!!res) {
          showmodalOKLoading();
          // 当意见类型为需要更多资讯时
          if (FBType == FEEDBACK.More) {
            if (validateContactMethod(res)) {
              params[BURIEDKEY.NAME] = FEEDBACK_TEXT[FBType][1];
              setContactMethodError(undefined);
              merchantApi
                .postApplicationFeedbackConsultAdd({
                  ...res,
                  contactTime: res?.contactTime?.toString(),
                })
                .then((result: IApiResponse<ApplicationFeedbackConsultAddResponse>) => {
                  if (result.code == '10000') {
                    event(BuriedPoint.KC_APPCTR_FDBK_CONFIRM_TAPPED, params);
                    onCancel();
                    showSuccessModalVisible();
                  }
                });
            } else {
              return;
            }
          }
          // 对正在使用应用有疑问时候
          else if (FBType == FEEDBACK.QUE) {
            if (validateContactMethod(res)) {
              const appList = form.getFieldValue('applicationIdList');
              if (!!appList && appList.length > 0) {
                // 数据处理,传应用名称给数据埋点
                const AppName = appNameOptions.filter((item: ItemProps) => {
                  if (appList.includes(item.value)) {
                    return true;
                  }
                });
                const appNameArr: string[] = [];
                AppName.map((item) => {
                  appNameArr.push(item.label);
                });
                appNames = appNameArr.join('、');
                params[BURIEDKEY.NAME] = `${FEEDBACK_TEXT[FBType][1]}_${appNames}`;
              } else {
                params[BURIEDKEY.NAME] = FEEDBACK_TEXT[FBType][1];
              }
              const que =
                res?.question.filter((item: string) => !(item === 'otherQuestion')).toString() ||
                undefined;
              merchantApi
                .postApplicationFeedbackQuestionAdd({
                  ...res,
                  contactTime: res.contactTime.toString(),
                  question: que,
                })
                .then((result: IApiResponse<ApplicationFeedbackQuestionAddResponse>) => {
                  if (result.code == '10000') {
                    event(BuriedPoint.KC_APPCTR_FDBK_CONFIRM_TAPPED, params);
                    onCancel();
                    event(BuriedPoint.KC_APPCTR_FDBK_CONFIRM_TAPPED);
                    showSuccessModalVisible();
                  }
                });
            } else {
              return;
            }
          }
          // 当意见反馈类型为有建议时
          else if (FBType == FEEDBACK.SUGGEST) {
            params[BURIEDKEY.NAME] = FEEDBACK_TEXT[FBType][1];
            merchantApi
              .postApplicationFeedbackSuggestAdd({
                ...res,
                rating: res?.rating?.toString(),
              })
              .then((result: IApiResponse<ApplicationFeedbackSuggestAddResponse>) => {
                if (result.code == '10000') {
                  event(BuriedPoint.KC_APPCTR_FDBK_CONFIRM_TAPPED, params);
                  onCancel();
                  showSuccessModalVisible();
                }
              });
          }
          hidemodalOKLoading();
        }
      })
      .catch((err) => {
        const { values } = err;
        validateContactMethod(values);
      });
    if (FBType === FEEDBACK.QUE) {
      const appList = form.getFieldValue('applicationIdList');
      // 埋点处理
      if (!!appList && appList.length > 0) {
        const AppName = appNameOptions.filter((item) => {
          if (appList.includes(item.value)) {
            return true;
          }
        });
        const appNameArr: string[] = [];
        AppName.map((item) => {
          appNameArr.push(item.label);
        });
        appNames = appNameArr.join('、');
      }
      params[BURIEDKEY.NAME] = `${FEEDBACK_TEXT[FBType][1]}_${appNames}`;
    } else {
      params[BURIEDKEY.NAME] = FEEDBACK_TEXT[FBType][1];
    }
    event(BuriedPoint.KC_APPCTR_FDBK_CANCEL_TAPPED, params);
  }, 300);

  // 联系方式失焦时 校验联系方式表单
  const contactMethodBlur = () => {
    const res = form.getFieldsValue();
    validateContactMethod(res);
  };

  const renderTitle = () => {
    return (
      <div className={Style.titleWrap}>
        <img className={Style.modalIcon} src={SuccessIcon} />

        <span className={Style.title}>
          {FBType === FEEDBACK.SUGGEST
            ? getMessage('application.feedback.yoursughasbeenreceived', '已收到你的意見')
            : getMessage('application.feedback.yourrequesthasbeenreceived', '已收到你的需求')}
        </span>
      </div>
    );
  };

  // 意见类型发送切换的时候
  const handleFeedbackChange = (value: number) => {
    // 移除联系方式报错提示
    setContactMethodError(undefined);
    const values = form.getFieldsValue();
    let contactMethodAndTime = {};
    if (FBType == FEEDBACK.More) {
      // 将更多资讯的表单值存下来
      setMoreFormValue(values);
      const formValues = { ...values };
      delete formValues.consultContent;
      contactMethodAndTime = formValues;
    } else if (FBType == FEEDBACK.QUE) {
      setQueFormValue(values);
      const formValues = { ...values };
      delete formValues.applicationIdList;
      delete formValues.question;
      delete formValues?.otherQuestion;
      contactMethodAndTime = formValues;
    } else if (FBType == FEEDBACK.SUGGEST) {
      setSuggestFormValue(values);
    }
    setFBType(value);
    form.resetFields();
    // 根据类型回显数据
    if (value == FEEDBACK.More) {
      form.setFieldsValue({ ...moreFormValue, ...contactMethodAndTime });
    } else if (value == FEEDBACK.QUE) {
      form.setFieldsValue({ ...queFormValue, ...contactMethodAndTime });
    } else if (value == FEEDBACK.SUGGEST) {
      form.setFieldsValue({ ...suggestFormValue });
    }
  };

  // 处理字典
  const orderData = (data: any) => {
    const list: ItemProps[] = [];
    data.map((item: any) => {
      const dic: any = {};
      dic.value = item.applicationDictionaryId;
      dic.label = item.applicationDictionaryValue;
      list.push(dic);
    });
    return list;
  };
  // 用户反馈弹窗隐藏 清空数据
  useEffect(() => {
    if (open) {
      setFBType(FEEDBACK.More);
      setMoreFormValue({});
      setQueFormValue({});
      setSuggestFormValue({});
      form.resetFields();
      setContactMethodError(undefined);
      merchantApi
        .getApplicationDictionaryList({
          dictionaryTypeList: [FEEDBACKDIC.TIME, FEEDBACKDIC.QUE, FEEDBACKDIC.MARK],
        })
        .then((res: IApiResponse<ApplicationDictionaryListResponse>) => {
          const data = res.data;
          // const data = dicData;
          data.map((item: any) => {
            if (item.applicationDictionaryType == FEEDBACKDIC.TIME) {
              setTimeList(orderData(item.applicationDictionaryList));
            } else if (item.applicationDictionaryType == FEEDBACKDIC.QUE) {
              const list = orderData(item.applicationDictionaryList);
              list.push(other);
              setQueList(list);
            } else if (item.applicationDictionaryType == FEEDBACKDIC.MARK) {
              setMarkList(orderData(item.applicationDictionaryList));
            }
          });
        });
      getApp();
      event(BuriedPoint.KC_APPCTR_FDBK_VIEWED);
    }
  }, [open]);

  const onCancelFeedback = () => {
    onCancel();
    setMobileRequire(false);
    setEmailRequired(false);
    setWhatAppRequire(false);
    setOtherContactRequired(false);
    setContactMethodError(undefined);
    const params = {};
    let appNames: string = '';
    // 埋点
    if (FBType === FEEDBACK.QUE) {
      const appList = form.getFieldValue('applicationIdList');
      if (!!appList && appList.length > 0) {
        const AppName = appNameOptions.filter((item) => {
          if (appList.includes(item.value)) {
            return true;
          }
        });
        const appNameArr: string[] = [];
        AppName.map((item) => {
          appNameArr.push(item.label);
        });
        appNames = appNameArr.join('、');
      }
      params[BURIEDKEY.NAME] = `${FEEDBACK_TEXT[FBType][1]}_${appNames}`;
    } else {
      params[BURIEDKEY.NAME] = FEEDBACK_TEXT[FBType][1];
    }
    event(BuriedPoint.KC_APPCTR_FDBK_CANCEL_TAPPED, params);
  };

  return (
    <>
      <KPayModal
        className={Style.feedbackWrap}
        type="confirm"
        title={getMessage('application.feedback.opinions', '意見反映')}
        onCancel={onCancelFeedback}
        open={open}
        width={680}
        okButtonProps={{
          className: cx('primary-btn', Style.btn),
          type: 'primary',
          loading: modalOKLoading,
        }}
        cancelButtonProps={{ className: cx('primary-btn', Style.btn) }}
        onOk={() => handleSumbit()}
      >
        <div className={Style.subTitle}>
          <p>
            {getMessage(
              'application.feedback.wantmoreappinfororvaluablesuggestionstellustohelpusprovidebetterservices',
              '想得到更多應用資訊或提供寶貴意見? 告訴我們，協助我們提供更完善的服務。',
            )}
          </p>
          <p>
            {getMessage(
              'application.feedback.wewillcontactyouassoonaspossibleonworkingdaysatthetimeyouchoose',
              '我們會在工作天按照你選擇的時間盡快與你聯絡。',
            )}
          </p>
        </div>
        <div className={Style.feedbackTypeWrap}>
          <p className={Style.feedbackType}>
            {getMessage('application.feedback.opinioncategory', '意見類別')}
          </p>
          <Select
            value={FBType}
            clearIcon={
              <div className={Style.selectCloseIcon}>
                <img src={ClearIcon} />
              </div>
            }
            suffixIcon={
              <div className={Style.selectArrowIcon}>
                <img src={DownArrowIcon} />
              </div>
            }
            onChange={handleFeedbackChange}
            defaultValue={FEEDBACK.More}
          >
            <Option value={FEEDBACK.More}>
              {getMessage(FEEDBACK_TEXT[FEEDBACK.More][0], FEEDBACK_TEXT[FEEDBACK.More][1])}
            </Option>
            <Option value={FEEDBACK.QUE}>
              {getMessage(FEEDBACK_TEXT[FEEDBACK.QUE][0], FEEDBACK_TEXT[FEEDBACK.QUE][1])}
            </Option>
            <Option value={FEEDBACK.SUGGEST}>
              {getMessage(FEEDBACK_TEXT[FEEDBACK.SUGGEST][0], FEEDBACK_TEXT[FEEDBACK.SUGGEST][1])}
            </Option>
          </Select>
        </div>

        <Form
          requiredMark={false}
          layout="vertical"
          form={form}
          className={Style.form}
          validateTrigger="onBlur"
          labelAlign="left"
        >
          {FBType == FEEDBACK.More && (
            <Form.Item
              name="consultContent"
              label={getMessage(
                'application.feedback.thetypeofappyouarelookingfor',
                '想尋找的應用類型',
              )}
              rules={[
                {
                  required: true,
                  message: getMessage(
                    'application.feedback.pleaseenterthetypeofappyouarelookingfor',
                    '請輸入想尋找的應用類型',
                  ),
                },
                {
                  pattern: new RegExp(describe, 'g'),
                  message: getMessage(
                    'application.feedback.incorrectinputformat',
                    '輸入格式不正確',
                  ),
                },
              ]}
            >
              <TextArea
                placeholder={getMessage('common.placeholder', '請輸入')}
                className={Style.consultArea}
                allowClear
                maxLength={150}
              />
            </Form.Item>
          )}

          {FBType == FEEDBACK.SUGGEST && (
            <div>
              <Form.Item
                className={Style.useServer}
                name="applicationUseFlag"
                label={getMessage(
                  'application.feedback.doyouuseappprovidedbyKConnectplat',
                  '你是否有使用/試用KConnect平台提供的應用（除KPay外）？',
                )}
                rules={[
                  {
                    required: true,
                    message: getMessage(
                      'application.feedback.pleaseselectwhileyouhaveapporserviceprovidedbykconnnectplat',
                      '請選擇你是否有使用/試用KConnect平台提供的應用（除KPay外）？',
                    ),
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={APPUSEFLAG.USED} className={Style.used}>
                    {getMessage('application.feedback.yes', '是')}
                  </Radio>
                  <Radio value={APPUSEFLAG.NOUSED}>
                    {getMessage('application.feedback.no', '否')}{' '}
                  </Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                className={Style.rating}
                name="rating"
                label={getMessage(
                  'application.feedback.yourratingofkconnectplatformis',
                  '你對 KConnect 平台的評分是',
                )}
                rules={[
                  {
                    required: true,
                    message: getMessage(
                      'application.feedback.pleaseselectyourratingofkconnectplatform',
                      '請選擇你對 KConnect 平台的評分',
                    ),
                  },
                ]}
              >
                <Radio.Group options={markList} />
              </Form.Item>
              <Form.Item
                name="suggest"
                label={getMessage(
                  'application.feedback.yoursuggestionsforKConnectare',
                  '你對 KConnect 的建議是',
                )}
                rules={[
                  {
                    required: true,
                    message: getMessage(
                      'application.feedback.pleaseenteryoursuggestionsforKConnect',
                      '請輸入你對 KConnect 的建議',
                    ),
                  },
                  {
                    pattern: new RegExp(describe, 'g'),
                    message: getMessage(
                      'application.feedback.incorrectinputformatkconnectsuggest',
                      '你對 KConnect 的建議輸入格式不正確',
                    ),
                  },
                ]}
              >
                <TextArea
                  placeholder={getMessage('common.placeholder', '請輸入')}
                  className={Style.consultArea}
                  allowClear
                  maxLength={150}
                />
              </Form.Item>
            </div>
          )}

          {FBType == FEEDBACK.QUE && (
            <div>
              <div className={Style.selectAppCol}>
                <Form.Item
                  name="applicationIdList"
                  label={getMessage('application.feedback.appName', '應用名稱')}
                  rules={[
                    {
                      required: true,
                      message: getMessage('application.feedback.pleaseselectapp', '請選擇應用名稱'),
                    },
                  ]}
                >
                  <Select
                    className={Style.appSelect}
                    showArrow={true}
                    clearIcon={
                      <div className={Style.selectCloseIcon}>
                        <img src={ClearIcon} />
                      </div>
                    }
                    suffixIcon={
                      <div className={Style.selectArrowIcon}>
                        <img src={DownArrowIcon} />
                      </div>
                    }
                    mode="multiple"
                    allowClear
                    loading={appLoading}
                    maxTagTextLength={10}
                    placeholder={getMessage(
                      'application.feedback.pleaseselectapp',
                      '請選擇應用名稱',
                    )}
                    optionFilterProp="children"
                  >
                    {appNameOptions.length > 0 &&
                      appNameOptions.map((item: ItemProps) => {
                        if (!!item.value && !!item.label) {
                          return (
                            <Option key={item.value} value={item.value}>
                              {item.label}
                            </Option>
                          );
                        }
                      })}
                  </Select>
                </Form.Item>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="question"
                    label={getMessage('application.feedback.yourproblemis', '遇到的問題')}
                    rules={[
                      {
                        required: true,
                        message: getMessage(
                          'application.feedback.pleaseselectyourproblemis',
                          '請選擇遇到的問題',
                        ),
                      },
                    ]}
                  >
                    <Checkbox.Group onChange={onQueChange}>
                      <Row>
                        {queList.map((item) => {
                          return (
                            <Col className={Style.queItem} key={item.value}>
                              <Checkbox value={item.value}>{item.label}</Checkbox>
                            </Col>
                          );
                        })}
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
              </Row>

              {otherQueVisible && (
                <Form.Item
                  name="otherQuestion"
                  rules={[
                    {
                      required: true,
                      message: getMessage(
                        'application.feedback.pleaseenterotherproblemsyouhaveencountered',
                        '請輸入你遇到的其他問題',
                      ),
                    },
                  ]}
                >
                  <TextArea
                    placeholder={getMessage('common.placeholder', '請輸入')}
                    className={Style.consultArea}
                    allowClear
                    maxLength={60}
                  />
                </Form.Item>
              )}
            </div>
          )}
          {(FBType == FEEDBACK.More || FBType == FEEDBACK.QUE) && (
            <div className={Style.contactMethod} tabIndex={-1} onBlur={contactMethodBlur}>
              <p className={Style.contactMethodTitle}>
                {getMessage('application.feedback.contactmethod', '聯絡方式')}
              </p>
              <Row gutter={16}>
                <Col span={4}>
                  <Form.Item name="mobileCheck">
                    <Checkbox
                      checked={form.getFieldValue('mobileCheck')}
                      onChange={(e) => {
                        setMobileRequire(e.target.checked);
                        form.setFieldValue('mobileCheck', e.target.checked);
                      }}
                    >
                      {getMessage('application.feedback.phone', '電話')}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    name="mobile"
                    validateTrigger="onBlur"
                    rules={[
                      {
                        required: mobileRequire,
                        message: getMessage('application.feedback.pleaseenterphone', '請輸入電話'),
                      },
                      {
                        pattern: new RegExp(NUMBER_ONLY, 'g'),
                        message: getMessage(
                          'application.feedback.incorrectphoneinputformat',
                          '電話輸入格式不正確',
                        ),
                      },
                    ]}
                  >
                    <Input
                      maxLength={60}
                      placeholder={getMessage('common.placeholder', '請輸入')}
                      className={Style.contactMethodInput}
                    />
                  </Form.Item>
                </Col>
                <Col span={1} />
                <Col span={5}>
                  <Form.Item name="whatAppCheck">
                    <Checkbox
                      checked={form.getFieldValue('whatAppCheck')}
                      onChange={(e) => {
                        setWhatAppRequire(e.target.checked);
                        form.setFieldValue('whatAppCheck', e.target.checked);
                      }}
                    >
                      {getMessage('application.feedback.WhatsAPP', 'WhatsAPP')}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    validateTrigger="onBlur"
                    name="whatsApp"
                    rules={[
                      {
                        required: whatAppRequire,
                        message: getMessage(
                          'application.feedback.pleaseenterWhatsAPP',
                          '請輸入WhatsAPP',
                        ),
                      },
                      {
                        pattern: new RegExp(describe, 'g'),
                        message: getMessage(
                          'application.feedback.incorrectinputformatWhatsAPP',
                          'WhatsAPP輸入格式不正確',
                        ),
                      },
                    ]}
                  >
                    <Input
                      maxLength={60}
                      placeholder={getMessage('common.placeholder', '請輸入')}
                      className={Style.contactMethodInput}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={4}>
                  <Form.Item name="emailCheck">
                    <Checkbox
                      checked={form.getFieldValue('emailCheck')}
                      onChange={(e) => {
                        setEmailRequired(e.target.checked);
                        form.setFieldValue('emailCheck', e.target.checked);
                      }}
                    >
                      {getMessage('application.feedback.Email', 'Email')}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    name="email"
                    validateTrigger="onBlur"
                    rules={[
                      {
                        required: emailRequired,
                        message: getMessage('application.feedback.pleaseenterEmail', '請輸入Email'),
                      },
                      {
                        pattern: new RegExp(EMAIL, 'g'),
                        message: getMessage(
                          'application.feedback.incorrectinputformatpleaseenterEmail',
                          'Email輸入格式不正確',
                        ),
                      },
                    ]}
                  >
                    <Input
                      maxLength={60}
                      placeholder={getMessage('common.placeholder', '請輸入')}
                      className={Style.contactMethodInput}
                    />
                  </Form.Item>
                </Col>
                <Col span={1} />
                <Col className={Style.otherContact} span={5}>
                  <Form.Item name="otherContactCheck">
                    <Checkbox
                      checked={form.getFieldValue('otherContactCheck')}
                      onChange={(e) => {
                        setOtherContactRequired(e.target.checked);
                        form.setFieldValue('otherContactCheck', e.target.checked);
                      }}
                    >
                      {getMessage('application.feedback.othercontactinfomation', '其他聯絡方式')}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item
                    validateTrigger="onBlur"
                    name="otherContact"
                    rules={[
                      {
                        required: otherContactRequired,
                        message: getMessage(
                          'application.feedback.pleaseenterothercontact',
                          '請輸入其他聯絡方式',
                        ),
                      },

                      {
                        pattern: new RegExp(describe, 'g'),
                        message: getMessage(
                          'application.feedback.incorrectinputformatothercontact',
                          '其他聯絡方式輸入格式不正確',
                        ),
                      },
                    ]}
                  >
                    <Input
                      maxLength={60}
                      placeholder={getMessage('common.placeholder', '請輸入')}
                      className={Style.contactMethodInput}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {!!contactMethodError && (
                <div className={Style.contactMethodError}>{contactMethodError}</div>
              )}

              <Form.Item
                name="contactTime"
                label={getMessage('application.feedback.contacttimeyouwant', '聯絡時段')}
                rules={[
                  {
                    required: true,
                    message: getMessage(
                      'application.feedback.pleaseselectcontacttimeyouwant',
                      '請選擇聯絡時段',
                    ),
                  },
                ]}
              >
                <Radio.Group options={timeList} />
              </Form.Item>
            </div>
          )}
        </Form>
      </KPayModal>
      <KPayModal
        onOk={hideSuccessModalVisible}
        onCancel={hideSuccessModalVisible}
        cancelButtonProps={{ className: Style.none }}
        okButtonProps={{
          className: 'primary-btn',
          type: 'primary',
        }}
        className={Style.successModal}
        open={successModalVisible}
        type="modal"
        title={renderTitle()}
      >
        <div>
          <p className={Style.successContent}>
            {FBType === FEEDBACK.SUGGEST
              ? getMessage(
                  'application.feedback.thankyouforyourvaluablecommentswhichwillhelpusimprovecontinuously',
                  '感謝你的寶貴意見，你的意見將有助我們不斷改進',
                )
              : getMessage(
                  'application.feedback.wewillcontactyouwithinthreetofiveworkingdays',
                  '我們將會在3-5工作天內與你聯絡',
                )}
          </p>
        </div>
      </KPayModal>
    </>
  );
};

export default Feedback;
