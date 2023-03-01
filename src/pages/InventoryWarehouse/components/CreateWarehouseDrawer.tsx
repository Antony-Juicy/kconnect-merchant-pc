import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { Button, Form, Input, Select, Space, Spin } from 'antd';
import styles from '../index.less';
import { useState } from 'react';
import { merchantApi } from '@/services';
import { notify } from '@/utils/antdUtils';
import { useEffect } from 'react';
import settings from '@/utils/settings';
import { verifyNumber } from '@/utils/utils';
import { CNPHONE_NUMBER_REG, HKPHONE_NUMBER_REG, OTHERPHONE_NUMBER_REG } from '@/utils/reg';

export type CreateWarehouseDrawerProps = {
  warehouseId?: string;
} & KPayDrawerProps;

// 區號
const areaCodeList = [
  { id: '852', code: '+852' },
  { id: '86', code: '+86' },
];

const CreateWarehouseDrawer: React.FC<CreateWarehouseDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);
  // 提交loading
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [areaCode, setAreaCode] = useState<string>('+852');
  const [phoneLength, setPhoneLength] = useState<number>(8);
  const [phoneReg, setPhoneReg] = useState<RegExp>(HKPHONE_NUMBER_REG);

  // 提交添加選項
  const submitWarehouse = () => {
    formInstance.validateFields().then((data) => {
      setSubmitLoading(true);
      let method = undefined;
      if (props?.warehouseId) {
        method = merchantApi.postWarehouseModify;
        data.warehouseId = props.warehouseId;
      } else {
        method = merchantApi.postWarehouseAdd;
      }

      data.mobileAreaCode = Math.abs(areaCode as unknown as number);
      method(data)
        .then((res) => {
          setSubmitLoading(false);
          if (res.success) {
            if (props?.warehouseId) {
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
    switch (Math.abs(areaCode as unknown as number)) {
      case 852:
        setPhoneLength(8);
        setPhoneReg(HKPHONE_NUMBER_REG);
        break;
      case 86:
        setPhoneLength(11);
        setPhoneReg(CNPHONE_NUMBER_REG);
        break;
      default:
        setPhoneLength(20);
        setPhoneReg(OTHERPHONE_NUMBER_REG);
        break;
    }
    formInstance?.validateFields(['contactsMobile']);
  }, [areaCode]);

  useEffect(() => {
    if (props.open && props?.warehouseId) {
      setInitLoading(true);
      merchantApi
        .getWarehouseInfo({
          warehouseId: props.warehouseId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            setAreaCode('+' + res?.data?.mobileAreaCode);
            formInstance.setFieldsValue({
              warehouseName: res?.data?.warehouseName,
              address: res?.data?.address,
              contactsName: res?.data?.contactsName,
              contactsMobile: res?.data?.contactsMobile,
              remark: res?.data?.remark,
            });
          }
        })
        .catch(() => {
          setInitLoading(false);
        });
    } else if (props.open) {
      setAreaCode('+852');
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
      className={styles.warehouseDrawer}
      open={props?.open}
      onClose={props.closeCb}
      title={
        props?.warehouseId
          ? getMessage('common.editor', '編輯')
          : getMessage('common.create', '新增')
      }
    >
      <Spin spinning={initLoading}>
        <Form
          form={formInstance}
          className={styles.warehouseForm}
          labelAlign="left"
          colon={false}
          labelCol={{ style: { width: '85px' } }}
        >
          <Form.Item
            name="warehouseName"
            label={getMessage('common.name', '名稱')}
            rules={[
              {
                required: true,
                message: getMessage('common.name.placeholder', '請輸入名稱'),
              },
            ]}
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage('common.name.placeholder', '請輸入名稱')}
            />
          </Form.Item>

          <Form.Item name="address" label={getMessage('inventory.warehouse.address', '地址')}>
            <Input.TextArea
              autoSize
              maxLength={settings.textAreaMaxLength}
              placeholder={getMessage('inventory.warehouse.address.placeholder', '請輸入地址')}
            />
          </Form.Item>

          <Form.Item
            name="contactsName"
            label={getMessage('inventory.warehouse.contacts.name', '負責人')}
          >
            <Input
              maxLength={settings.textAreaMaxLength}
              placeholder={getMessage(
                'inventory.warehouse.contacts.name.placeholder',
                '請輸入負責人',
              )}
            />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: '0' }}
            label={getMessage('inventory.warehouse.contacts.mobile', '聯絡電話')}
          >
            <div className={styles.warehouseMobileWapper}>
              <Form.Item>
                <Select
                  className={styles.warehouseAreaCode}
                  value={areaCode}
                  dropdownMatchSelectWidth={false}
                  optionLabelProp="value"
                  onChange={(value) => {
                    setAreaCode('+' + value);
                  }}
                >
                  {areaCodeList.map((item) => {
                    return <Select.Option key={item.id}>{item.code}</Select.Option>;
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name="contactsMobile"
                getValueFromEvent={(event) => verifyNumber(event.target.value, 'integer')}
                rules={[
                  {
                    pattern: new RegExp(phoneReg, 'ig'),
                    message: getMessage(
                      'inventory.warehouse.contacts.mobile.warnning',
                      '聯絡電話格式錯誤',
                    ),
                  },
                ]}
              >
                <Input
                  maxLength={phoneLength}
                  placeholder={getMessage(
                    'inventory.warehouse.contacts.mobile.placeholder',
                    '請輸入聯絡電話',
                  )}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item name="remark" label={getMessage('common.remark', '備註')}>
            <Input.TextArea
              autoSize
              showCount
              maxLength={settings.oneHundredAndFiftyLength}
              placeholder={getMessage('common.remark.placeholder', '請輸入備註')}
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
              submitWarehouse();
            }}
          >
            {getMessage('common.confirm', '確認')}
          </Button>
        </Space>
      </Spin>
    </KPayDrawer>
  );
};

export default CreateWarehouseDrawer;
