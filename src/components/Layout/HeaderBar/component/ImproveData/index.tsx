import KPayModal from '@/components/Fields/kpay-modal';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { NATURALNUMBER } from '@/utils/reg';
import { NUMERICAL_VALUE } from '@/utils/constants';
import { Button, Checkbox, Col, Form, Input, Row, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import css from './index.less';

type ImproveDataProps = {
  // 打开弹窗
  showModal: boolean;
  // 关闭完善资料弹窗
  hideConsummateModalModal: () => void;

  // 隐藏 完善资料按钮
  hidePerfectdata: () => void;
};

const ImproveData: React.FC<ImproveDataProps> = (props) => {
  const { TextArea } = Input;
  const [consummateForm] = Form.useForm();
  const { getMessage } = useLocale();
  const other = Form.useWatch('other', consummateForm) || [];
  const { hideConsummateModalModal, hidePerfectdata } = props;
  // 支付系统
  const [Option, setOption] = useState<any>([]);
  //公司管理
  const [OptionComopany, setOptionComopany] = useState<any>([]);
  //商品管理
  const [OptionGoods, setOptionGoods] = useState<any>([]);
  //支付/賬面管理
  const [OptionPayment, setOptionPayment] = useState<any>([]);
  //市場推廣
  const [OptionMarket, setOptionMarket] = useState<any>([]);
  const [checkType, setCheckType] = useState<any>([]);
  // 職位
  const [staffOption, setStaffOption] = useState<any>([]);

  useEffect(() => {
    consummateForm.resetFields();
  }, [hideConsummateModalModal]);

  //  稍后填写
  const skip = () => {
    setCheckType([]);
    hideConsummateModalModal();
    consummateForm.resetFields();
    event(BuriedPoint.KC_OA_MERINFO2_SKIPTIP_VIEWED);
  };

  useEffect(() => {
    try {
      merchantApi
        .getCompanyDictionaryList({
          dictionaryTypeList: [
            'payment_system',
            'comopany_management',
            'goods_management',
            'payment_management',
            'market_management',
            'position',
          ],
        })
        .then((res: any) => {
          if (Array.isArray(res?.data)) {
            const data = res?.data.find((item: any) => item.companyDictionaryType == 'position');
            const positionData: any[] = [];
            data?.companyDictionaryList.map((item: any) => {
              positionData.push({
                value: item?.companyDictionaryId,
                label: item?.companyDictionaryValue,
              });
            });
            setStaffOption(positionData);

            const options: any[] = [];
            const paymentSystem: any = res?.data.find(
              (item: any) => item.companyDictionaryType == 'payment_system',
            );
            paymentSystem?.companyDictionaryList.map((item: any) => {
              options.push({
                value: item?.companyDictionaryId,
                label: item?.companyDictionaryValue,
              });
            });

            setOption(options);

            //公司管理
            const comopanyManagement = res?.data.find(
              (item: any) => item.companyDictionaryType == 'comopany_management',
            );
            const comopany: any[] = [];
            comopanyManagement?.companyDictionaryList.map((item: any) => {
              comopany.push({
                value: item?.companyDictionaryId,
                label: item?.companyDictionaryValue,
              });
            });
            setOptionComopany(comopany);

            //商品管理
            const goodsManagements = res?.data.find(
              (item: any) => item.companyDictionaryType == 'goods_management',
            );
            const goods: any[] = [];

            goodsManagements?.companyDictionaryList.map((item: any) => {
              goods.push({
                value: item?.companyDictionaryId,
                label: item?.companyDictionaryValue,
              });
            });
            setOptionGoods(goods);

            //支付/賬面管理
            const paymentManagements = res?.data.find(
              (item: any) => item.companyDictionaryType == 'payment_management',
            );
            const pay: any[] = [];

            paymentManagements?.companyDictionaryList.map((item: any) => {
              pay.push({
                value: item?.companyDictionaryId,
                label: item?.companyDictionaryValue,
              });
            });
            setOptionPayment(pay);
            //市場推廣
            const marketManagements = res?.data.find(
              (item: any) => item.companyDictionaryType == 'market_management',
            );
            const market: any[] = [];

            marketManagements?.companyDictionaryList.map((item: any) => {
              market.push({
                value: item?.companyDictionaryId,
                label: item?.companyDictionaryValue,
              });
            });
            setOptionMarket(market);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSubmit = () => {
    event(BuriedPoint.KC_OA_MERINFO2_CONFIRM_TAPPED);
    consummateForm.validateFields().then((values: any) => {
      const formatValues = {
        ...values,
        paymentSystem: values?.paymentSystem && values?.paymentSystem.toString(),
        companyManagement: values?.companyManagement && values?.companyManagement?.toString(),
        goodsManagement: values?.goodsManagement && values?.goodsManagement?.toString(),
        paymentManagement: values?.paymentManagement && values?.paymentManagement?.toString(),
        marketManagement: values?.marketManagement && values?.marketManagement?.toString(),
      };

      delete formatValues.other;
      merchantApi
        .postCompanyManagementInformationAdd(formatValues)
        .then(() => {
          hidePerfectdata(); //隐藏完善资料按钮
          hideConsummateModalModal();
          setCheckType([]);
          consummateForm.resetFields();
        })
        .catch(() => {
          hideConsummateModalModal();
        });
    });
  };

  // 勾选类型
  const onChangeReqType = (e: any) => {
    setCheckType(e);
  };

  // 取消勾选其它 移除数据
  useEffect(() => {
    if (!!checkType.includes('other')) {
      consummateForm.setFieldValue('otherSystemFunction', '');
    }
  }, [checkType]);

  return (
    <>
      <KPayModal
        type="modal"
        title={getMessage('dashboard.dataimprovement', '完善賬戶資料')}
        btnMiddle
        width={782}
        open={props?.showModal}
        onCancel={hideConsummateModalModal}
        footer={null}
        className={css.consummateModal}
      >
        <Form
          layout="vertical"
          labelAlign="left"
          form={consummateForm}
          className={css.meansContent}
        >
          <Form.Item>
            <p className={css.state}>
              {getMessage(
                'dashboard.let.us.know.your.business.and.recommend.more.suitable.applications.and.services.for.you',
                '讓我們了解你的業務，為你推薦更合適的應用及服務',
              )}
            </p>
            <div className={css.inputContent}>
              <Row className={css.infoRow} gutter={24}>
                <Col>
                  <Form.Item
                    name="managerCount"
                    label={
                      <>
                        <span>
                          {getMessage('dashboard.number.of.management.personnel', ' 管理人員數量')}
                        </span>
                        <span className={css.textInput}>
                          {getMessage('dashboard.must', '(必須)')}
                        </span>
                      </>
                    }
                    rules={[
                      {
                        required: true,
                        message: getMessage(
                          'Please.enter.the.number.of.administrators',
                          '請輸入管理人員數量',
                        ),
                      },
                      {
                        pattern: new RegExp(NATURALNUMBER, 'g'),
                        message: getMessage(
                          'dashboard.please≥enter.a.natural.number',
                          '請輸入自然數',
                        ),
                      },
                    ]}
                  >
                    <Input
                      allowClear
                      maxLength={9}
                      className={css.inputAltitude}
                      placeholder={getMessage(
                        'dashboard.please≥enter.a.natural.number',
                        '請輸入自然數',
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col style={{ paddingLeft: '50px' }}>
                  <Form.Item
                    name="employeeCount"
                    label={
                      <>
                        <span>{getMessage('dashboard.please.number.of.staff', '員工數量')}</span>
                        <span className={css.textInput}>
                          {getMessage('dashboard.must', '(必須)')}
                        </span>
                      </>
                    }
                    rules={[
                      {
                        required: true,
                        message: getMessage(
                          'Please.enter.the.number.of.employees',
                          '請輸入員工數量',
                        ),
                      },
                      {
                        pattern: new RegExp(NATURALNUMBER, 'g'),
                        message: getMessage(
                          'dashboard.please≥enter.a.natural.number',
                          '請輸入自然數',
                        ),
                      },
                    ]}
                  >
                    <Input
                      allowClear
                      maxLength={9}
                      className={css.inputAltitude}
                      placeholder={getMessage(
                        'dashboard.please≥enter.a.natural.number',
                        '請輸入自然數',
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className={css.selectContent}>
              <Row className={css.infoRow}>
                <Col>
                  <Form.Item
                    name="position"
                    label={getMessage('dashboard.your.position.of.responsibility', '你負責的職位')}
                    rules={[
                      {
                        required: false,
                        message: getMessage('Please.select', '請選擇'),
                      },
                    ]}
                  >
                    <Select
                      className={css.maxWidth}
                      allowClear
                      placeholder={getMessage('Please.select', '請選擇')}
                      options={staffOption}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form.Item>

          <Form.Item
            className={css.fromContent}
            name="paymentSystem"
            valuePropName="checked"
            label={
              <>
                <span>
                  {getMessage(
                    'other.payment.systems.in.use.except.KPay',
                    '除KPay 以外，其他使用中的支付系統',
                  )}
                </span>
                <span className={css.multipleSelection}>
                  {getMessage('dashboard.multiple.choice', '（多選)')}
                </span>
              </>
            }
            rules={[
              {
                required: false,
                message: getMessage('Please.select', '請選擇'),
              },
            ]}
          >
            <Checkbox.Group className={css.rowContent} options={Option} />
          </Form.Item>

          <Form.Item className={css.otherContent} name="other">
            <Checkbox.Group>
              <Checkbox value={NUMERICAL_VALUE}>{getMessage('dashboard.other', '其他')}</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          {other.includes(NUMERICAL_VALUE) && (
            <div className={css.TextAreaContent}>
              <Form.Item
                name="otherPaymentSystem"
                label={getMessage('Please.enter.another.payment.system', '請輸入其他支付系統')}
                rules={[
                  { required: true, message: getMessage('dashboard.please.enter', '請輸入') },
                ]}
              >
                <TextArea
                  placeholder={getMessage('dashboard.please.enter', '請輸入')}
                  allowClear
                  maxLength={150}
                  className={css.maxTextArea}
                  autoSize={{ minRows: 3, maxRows: 5 }}
                />
              </Form.Item>
            </div>
          )}
          <div className={css.systemTextArea}>
            <Form.Item
              name="applicationSystem"
              label={getMessage(
                'the.application.system.currently.in.use',
                '當前正在使用的應用系統',
              )}
              rules={[{ required: false, message: '請輸入當前正在使用的應用系統' }]}
            >
              <TextArea
                placeholder={getMessage('dashboard.please.enter', '請輸入')}
                allowClear
                maxLength={150}
                className={css.maxTextArea}
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>
          </div>
          <div className={css.systemRequirements}>
            {getMessage('system.requirement', '系統需求')}
          </div>
          <div className={css.requirementType}>
            {getMessage('please.select.a.requirement.type', '請選擇需求類型')}
            <span className={css.multipleContent}>
              {' '}
              {getMessage('dashboard.multiple.choice', '（多選)')}
            </span>
            <Form.Item
              name="remember"
              valuePropName="checked"
              className={css.checkboxContent}
              rules={[{ required: false, message: getMessage('Please.select', '請選擇') }]}
            >
              <Checkbox.Group onChange={onChangeReqType} className={css.checkboxContent}>
                <Checkbox value="corporateGovernance">
                  {getMessage('dashboard.corporateGovernance', '公司管理')}
                </Checkbox>

                <Checkbox value="merchandiseControl">
                  {getMessage('dashboard.merchandiseControl', '商品管理')}
                </Checkbox>

                <Checkbox value="AccountBookManagement">
                  {getMessage('dashboard.accountBookManagement', '支付/賬面管理')}
                </Checkbox>

                <Checkbox value="marketing">
                  {getMessage('dashboard.marketing', '市場推廣')}
                </Checkbox>

                <Checkbox value="other">{getMessage('dashboard.other', '其他')}</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </div>
          {checkType.length > 0 ? <div className={css.borderContent} /> : null}
          {checkType.includes('corporateGovernance') && (
            <div className={css.ManagementContent}>
              <span className={css.multipleChoice}>
                {' '}
                {getMessage('dashboard.multiple.choice', '（多選)')}
              </span>
              <Form.Item
                className={css.fromContent}
                name="companyManagement"
                label={getMessage('dashboard.corporateGovernance', '公司管理')}
                rules={[
                  {
                    required: true,
                    message: getMessage('Please.select', '請選擇'),
                  },
                ]}
              >
                <Checkbox.Group className={css.companyManagement}>
                  {OptionComopany.map((item: any) => {
                    return (
                      <Col key={item.value} span={8}>
                        <Checkbox value={item.value}>{item.label}</Checkbox>
                      </Col>
                    );
                  })}
                </Checkbox.Group>
              </Form.Item>
            </div>
          )}

          {checkType.includes('merchandiseControl') && (
            <>
              <div className={css.goodsContent}>
                <span className={css.multipleChoice}>
                  {' '}
                  {getMessage('dashboard.multiple.choice', '（多選)')}
                </span>

                <Form.Item
                  className={css.fromContent}
                  name="goodsManagement"
                  label={getMessage('dashboard.merchandiseControl', '商品管理')}
                  rules={[
                    {
                      required: true,
                      message: getMessage('Please.select', '請選擇'),
                    },
                  ]}
                >
                  <Checkbox.Group className={css.goodsContent}>
                    {OptionGoods.map((item: any) => {
                      return (
                        <Col key={item.value}>
                          <Checkbox value={item.value}>{item.label}</Checkbox>
                        </Col>
                      );
                    })}
                  </Checkbox.Group>
                </Form.Item>
              </div>
            </>
          )}
          {checkType.includes('AccountBookManagement') && (
            <>
              <div className={css.paymentContent}>
                <span className={css.payManagemenContent}>
                  {' '}
                  {getMessage('dashboard.multiple.choice', '（多選)')}
                </span>

                <Form.Item
                  name="paymentManagement"
                  label={getMessage('dashboard.accountBookManagement', '支付/賬面管理')}
                  className={css.fromContent}
                  rules={[
                    {
                      required: true,
                      message: getMessage('Please.select', '請選擇'),
                    },
                  ]}
                >
                  <Checkbox.Group className={css.payContent}>
                    {OptionPayment.map((item: any) => {
                      return (
                        <Col key={item.value}>
                          <Checkbox value={item.value}>{item.label}</Checkbox>
                        </Col>
                      );
                    })}
                  </Checkbox.Group>
                </Form.Item>
              </div>
            </>
          )}
          {checkType.includes('marketing') && (
            <>
              <div className={css.marketContent}>
                <Form.Item
                  name="marketManagement"
                  className={css.fromContent}
                  label={getMessage('dashboard.marketManagement', '市場推廣')}
                  rules={[
                    {
                      required: true,
                      message: getMessage('Please.select', '請選擇'),
                    },
                  ]}
                >
                  <Checkbox.Group className={css.marketManagementContent}>
                    {OptionMarket.map((item: any) => {
                      return (
                        <Col key={item.value}>
                          <Checkbox value={item.value}>{item.label}</Checkbox>
                        </Col>
                      );
                    })}
                  </Checkbox.Group>
                </Form.Item>
              </div>
            </>
          )}
          {checkType.includes('other') && (
            <div className={css.TextAreaContent}>
              <Form.Item
                name="otherSystemFunction"
                label={getMessage('dashboard.other', '其他')}
                rules={[
                  { required: true, message: getMessage('dashboard.please.enter', '請輸入') },
                ]}
              >
                <TextArea
                  placeholder={getMessage('dashboard.please.enter', '請輸入')}
                  allowClear
                  className={css.maxTextArea}
                  maxLength={150}
                  autoSize={{ minRows: 3, maxRows: 5 }}
                />
              </Form.Item>
            </div>
          )}
          <Space className={css.footerBox} size="middle">
            <Button type="default" onClick={skip} className="primary-btn">
              {getMessage('dashboard.fill.in.later', '稍後填寫')}
            </Button>
            <Button htmlType="submit" type="primary" onClick={handleSubmit} className="primary-btn">
              {getMessage('dashboard.confirm.submission', '確認提交')}
            </Button>
          </Space>
        </Form>
      </KPayModal>
    </>
  );
};
export default ImproveData;
