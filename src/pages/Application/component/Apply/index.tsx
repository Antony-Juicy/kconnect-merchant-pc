import SuccessIcon from '@/assets/svgs/successModal.svg';
import KPayModal from '@/components/Fields/kpay-modal';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { CommonAccountInfoResponse } from '@/services/api';
import { getCompanyId } from '@/utils/auth';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';
import { APPLY_TYPE } from '@/utils/constants';
import { describe } from '@/utils/reg';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Form, Input, Radio } from 'antd';
import cx from 'classnames';
import React, { useEffect } from 'react';
import Style from './index.less';

type ApplyProps = {
  id: string | number;
  visible: boolean;
  modalType: number;
  onCancel: () => void;
};

const Apply: React.FC<ApplyProps> = (props) => {
  const { visible, modalType, onCancel, id } = props;
  const { getMessage } = useLocale();
  const [form] = Form.useForm();
  const [modalOKLoading, { setTrue: showmodalOKLoading, setFalse: hidemodalOKLoading }] =
    useBoolean(false);

  const [
    successModalVisible,
    { setTrue: showSuccessModalVisible, setFalse: hideSuccessModalVisible },
  ] = useBoolean(false);
  const [modalLoading, { setTrue: showModalLoading, setFalse: hideModalLoading }] =
    useBoolean(false);
  const getAccountInfo = () => {
    showModalLoading();
    merchantApi.getCommonAccountInfo().then((res: IApiResponse<CommonAccountInfoResponse>) => {
      const { name, mobile } = res.data;
      form.setFieldsValue({
        applicantName: name,
        applicantContactMobile: mobile,
        // contactDate: moment(moment.now()),
      });
    });
    hideModalLoading();
  };

  // const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  //   return current && current < moment().add(-1, 'days');
  // };

  const onSubmit = (type: number) => {
    form.validateFields().then(async (values) => {
      // values.contactDate = formatMomentObj(values.contactDate);
      // const data = formatUnixTimestamp(values.contactDate, 'DD/MM/YYYY');
      showmodalOKLoading();
      merchantApi
        .postApplicationApply({
          applicationId: id,
          companyId: (getCompanyId() || '').toString(),
          type: type,
          ...values,
          // contactDate: data,
        })
        .then(() => {
          onCancel();
          showSuccessModalVisible();
        });
      hidemodalOKLoading();
      form.setFieldValue('contactTime', undefined);
    });
  };

  const renderTitle = () => {
    return (
      <div className={Style.titleWrap}>
        <img className={Style.modalIcon} src={SuccessIcon} />
        <span className={Style.title}>
          {getMessage('application.apply.applysuccess', '已收到你的申請')}
        </span>
      </div>
    );
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields(['contactTime']);
    } else {
      getAccountInfo();
    }
  }, [visible]);
  return (
    <>
      <KPayModal
        loading={modalLoading}
        className={Style.modal}
        onCancel={() => {
          onCancel();
          event(
            modalType == APPLY_TYPE.OPEN
              ? BuriedPoint.KC_APPCTR_APPDTL_APPLY_CANCEL_TAPPED
              : BuriedPoint.KC_APPCTR_APPDTL_DEMO_CANCLE_TAPPED,
          );
        }}
        title={
          modalType == APPLY_TYPE.OPEN
            ? getMessage('application.detail.appforappopening', '應用開通申請')
            : getMessage('application.detail.freetrialapp', '免費試用申請')
        }
        open={visible}
        width={524}
        onOk={() => {
          onSubmit(modalType);
          event(
            modalType == APPLY_TYPE.OPEN
              ? BuriedPoint.KC_APPCTR_APPDTL_APPLY_CONFIRM_TAPPED
              : BuriedPoint.KC_APPCTR_APPDTL_DEMO_CONFIRM_TAPPED,
          );
        }}
        type="confirm"
        okButtonProps={{
          className: cx('primary-btn', Style.btn),
          type: 'primary',
          loading: modalOKLoading,
        }}
        cancelButtonProps={{ className: cx('primary-btn', Style.btn) }}
      >
        <div className={Style.subTitleContainer}>
          <p className={Style.subTitle}>
            {getMessage(
              'application.detail.pleaseleaveyourcontactinfowewillcontactyouassoonaspossibleinworkingdaysaccordingtothetimeyouchoose',
              '請留下你的聯絡資料，我們會在工作天按照你選擇的時間儘快與你聯絡。',
            )}
          </p>
        </div>

        <Form
          requiredMark={false}
          layout="vertical"
          form={form}
          className={Style.form}
          validateTrigger="onBlur"
          labelAlign="left"
        >
          <Form.Item
            name="applicantName"
            label={getMessage('application.detail.contactname', '聯絡人姓名')}
            rules={[
              {
                required: true,
                message: getMessage(
                  'application.detail.pleaseenterthecontactname',
                  '請輸入聯絡人姓名',
                ),
              },
              {
                pattern: new RegExp(describe, 'g'),
                message: getMessage(
                  'application.detail.incorrectformatofname',
                  '聯絡人姓名輸入格式不正確',
                ),
              },
              { whitespace: true },
            ]}
          >
            <Input
              className={Style.input}
              maxLength={60}
              placeholder={getMessage('common.placeholder', '請輸入')}
            />
          </Form.Item>
          <Form.Item
            name="applicantContactMobile"
            label={getMessage('application.detail.contactnumber', '聯絡電話')}
            rules={[
              {
                required: true,
                message: getMessage(
                  'application.detail.pleaseenterthecontactnumber',
                  '請輸入聯絡電話',
                ),
              },
              {
                pattern: new RegExp(describe, 'g'),
                message: getMessage(
                  'application.detail.incorrectformatofcontactmethod',
                  '聯絡電話輸入格式不正確',
                ),
              },
              { whitespace: true },
            ]}
          >
            <Input
              className={Style.input}
              maxLength={60}
              placeholder={getMessage('common.placeholder', '請輸入')}
            />
          </Form.Item>
          {/*  需求调整 注释 勿删 */}
          {/* <Form.Item
            name="contactDate"
            label={getMessage('application.detail.date', '日期')}
            rules={[
              {
                required: true,
                message: getMessage('application.detail.pleaseselectdate', '請選擇日期'),
              },
            ]}
          >
            <DatePicker
              disabledDate={disabledDate}
              className={Style.dataPicker}
              format={settings.systemDateFormat}
              placeholder={getMessage('application.detail.pleaseselectdate', '請選擇日期')}
            />
          </Form.Item> */}
          <Form.Item
            name="contactTime"
            label={getMessage('application.detail.contactperiod', '聯絡時段')}
            rules={[
              {
                required: true,
                message: getMessage(
                  'application.detail.pleaseselectthecontacttime',
                  '請選擇聯絡時段',
                ),
              },
            ]}
          >
            <Radio.Group>
              <Radio value=" 10:00 - 12:00">
                {getMessage('application.apply.10a.m.to12a.m', '10:00 - 12:00 ')}
              </Radio>
              <Radio value=" 14:00 - 18:00">
                {getMessage('application.apply.2p.m.to6p.m', '14:00 - 18:00')}
              </Radio>
            </Radio.Group>
          </Form.Item>
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
            {getMessage(
              'application.apply.relevantcolleagueswillcontactyouassoonaspossible',
              '我們將盡快與你聯絡',
            )}
          </p>
        </div>
      </KPayModal>
    </>
  );
};

export default Apply;
