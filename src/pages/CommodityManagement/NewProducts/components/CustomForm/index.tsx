import React from 'react';
import { Form, Input, Select, DatePicker as DatePick, InputNumber } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import BraftEditor from 'braft-editor';
import {
  SINGLE_LINE_INPUT,
  MULTI_LINE_INPUT,
  SINGLE_SELECT,
  MULTI_SELECT,
  DATE_SELECT,
  PRICE_INPUT,
  WEBVIEW_INPUT,
  REMARK,
} from './constants';
import useLocale from '@/hooks/useLocale';
import settings from '@/utils/settings';
import { merchantApi } from '@/services';
import { UPLOADMODULE } from '@/utils/constants';
import { verifyNumber } from '@/utils/utils';

const { TextArea } = Input;
const { Option } = Select;

interface CustomFormProps {
  templateList: any[];
  formInstance: any;
  pageChangeValue: () => void;
}

const DatePicker: any = DatePick;
const CustomForm: React.FC<CustomFormProps> = (props) => {
  const { templateList, formInstance, pageChangeValue } = props;

  const { getMessage } = useLocale();

  // 组件渲染模板
  const templateRender = (item: any) => {
    const { fieldType, templateFieldValueList } = item;
    if (fieldType === SINGLE_LINE_INPUT) {
      // 单行文本输入框
      return (
        <Input
          className={styles.inputWidth}
          placeholder={getMessage('common.placeholder', '請輸入')}
          maxLength={settings.textAreaMaxLength}
          onChange={pageChangeValue}
        />
      );
    } else if (fieldType === MULTI_LINE_INPUT) {
      // 多行文本输入框
      return (
        <TextArea
          className={styles.inputWidthBlock}
          autoSize={{ minRows: 3, maxRows: 5 }}
          placeholder={getMessage('common.placeholder', '請輸入')}
          maxLength={settings.multiLineInputMaxLength}
          onChange={pageChangeValue}
        />
      );
    } else if (fieldType === SINGLE_SELECT) {
      // 单选框
      return (
        <Select
          className={styles.inputWidth}
          allowClear
          placeholder={getMessage('common.please.select', '請選擇')}
          onChange={pageChangeValue}
        >
          {templateFieldValueList.map((option: any) => (
            <Option key={option.templateFieldValueId} value={option.templateFieldValueId}>
              {option.fieldValue}
            </Option>
          ))}
        </Select>
      );
    } else if (fieldType === MULTI_SELECT) {
      // 多选框
      return (
        <Select
          className={styles.inputWidth}
          mode="multiple"
          placeholder={getMessage('common.please.select', '請選擇')}
          onChange={pageChangeValue}
        >
          {templateFieldValueList.map((option: any) => (
            <Option key={option.templateFieldValueId} value={option.templateFieldValueId}>
              {option.fieldValue}
            </Option>
          ))}
        </Select>
      );
    } else if (fieldType === DATE_SELECT) {
      // 日期选择框
      return (
        <DatePicker
          className={styles.inputWidth}
          format="YYYY-MM-DD"
          placeholder={getMessage('common.please.select', '請選擇')}
          onChange={pageChangeValue}
        />
      );
    } else if (fieldType === PRICE_INPUT) {
      // 金额输入框
      return (
        <Input
          className={styles.inputWidth}
          placeholder={getMessage('common.placeholder', '請輸入')}
          onChange={pageChangeValue}
        />
      );
    } else if (fieldType === WEBVIEW_INPUT) {
      // 编辑框
      return (
        <BraftEditor
          onBlur={pageChangeValue}
          className={classNames([styles.braftEditor, styles.inputWidthBlock])}
          contentClassName={styles.braftEditorContent}
          placeholder={getMessage('common.placeholder', '請輸入')}
          media={{
            uploadFn: async (param: any) => {
              const formData: any = new FormData();
              formData.append('multipartFile', param.file);
              formData.append('module', UPLOADMODULE.PRODUCT);
              const res = await merchantApi.postFileUploadPublic(formData);
              if (res.success) {
                param.success({ url: res.data.fileUrl });
              } else {
                param.error({
                  msg: getMessage('common.uploadPlus.uploadFaild', '文件上傳失敗, 請稍後重試'),
                });
              }
            },
          }}
        />
      );
    } else if (fieldType === REMARK) {
      // 备注
      return (
        <Input
          className={styles.inputWidth}
          placeholder={getMessage('common.placeholder', '請輸入')}
          maxLength={settings.textAreaMaxLength}
          onChange={pageChangeValue}
        />
      );
    } else {
      return <></>;
    }
  };

  const customProps = (item: any) => {
    if (item.fieldType == PRICE_INPUT) {
      return {
        getValueFromEvent: (event: any) => {
          return verifyNumber(event.target.value, '', {
            price: settings.priceMaxAmount,
          });
        },
      };
    }
    if (item.fieldType == WEBVIEW_INPUT) {
      const rule = () => ({
        validator(_: any, value: any) {
          const webHtml = value?.toHTML();
          if (value && webHtml != '<p></p>') {
            return Promise.resolve();
          }
          return Promise.reject(getMessage('common.placeholder', '請輸入'));
        },
      });
      return {
        rules: item.required
          ? [{ required: true, message: getMessage('common.placeholder', '請輸入') }, rule]
          : undefined,
      };
    }
    return {};
  };

  return (
    <Form className={styles.customWrapper} form={formInstance} layout="vertical" autoComplete="off">
      <div className={styles.formRows}>
        {templateList.map((item) => {
          return (
            <Form.Item
              key={item.templateFieldId}
              name={`${item.templateFieldId}~${item.fieldType}`}
              label={
                <div className={classNames([styles.itemLabel, { [styles.ml10]: !item.required }])}>
                  {item.fieldName}
                </div>
              }
              validateFirst={true}
              rules={
                item.required
                  ? [{ required: true, message: getMessage('common.placeholder', '請輸入') }]
                  : undefined
              }
              {...customProps(item)}
            >
              {templateRender(item)}
            </Form.Item>
          );
        })}
      </div>
    </Form>
  );
};

export default CustomForm;
