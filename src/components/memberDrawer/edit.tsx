/**
 * 点击右上角关闭需要弹出提示弹框
 * 这个提示弹框的显示状态 closeConfirm 是该组件内管理的，
 * 需要传入ref，使用useImperativeHandle，将 showConfirm 方法暴露给父组件调用
 * 单选框radio需要做到再次点击取消选择
 */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useBoolean } from 'ahooks';
import useLocale from '@/hooks/useLocale';
import moment from 'moment';
import { find, keys, omit } from 'lodash';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import { Button, Form, Input, Select, DatePicker, Spin, Radio } from 'antd';
import type { DrawerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import styles from './index.less';
import KPayModal from '@/components/Fields/kpay-modal';
// import KPaySimpleTransfer from '../Fields/kpay-simple-transfer';
import KpayRewriteTransfer from '../Fields/kpay-rewrite-transfer';
import closeIcon from '@/assets/svgs/close-no-bg.svg';
import { MEMBERGENDER, MEMBERUNIQUEFLAG, MOBILEAREACODE } from '@/utils/constants';
import { MEMBERTAGS } from '@/utils/reg';
import settings from '@/utils/settings';
import { pattern } from '@/utils/pattern';
import { merchantApi } from '@/services';
import type { IApiResponse } from '@/utils/request';
import type { MemberCategoryListSimpleResponse } from '@/services/api';
import confirmIcon from '@/assets/svgs/confirm.svg';

export type TDetailDrawer = {
  data: any;
  ref: any;
  closeDrawer: () => void;
  sumbitData: (data: any) => void;
  btnLoading?: boolean;
} & DrawerProps;

type TCategoryList = {
  memberCategoryId: string;
  memberCategoryName: string;
}[];

type TAllCategorys = {
  key: string;
  title: string;
}[];

const dateFormat = settings.systemDateFormat;
let addTagTimeout: NodeJS.Timeout;

const EditDrawer: React.FC<TDetailDrawer> = forwardRef((props, ref: any) => {
  const $_props = omit(props, 'ref', 'data', 'closeDrawer', 'sumbitData', 'btnLoading');
  // 彈框全局loading
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(true);
  // 全部會員類別數據，字段经过format以适用于穿梭框组件
  const [allCategorys, setAllCategorys] = useState<TAllCategorys>([]);
  //選擇類別的穿梭框數據
  const [transferData, setTransferData] = useState<any[]>([]);
  // 當前會員的類別，包含类别名称，用于回显当前类别
  const [categoryData, setCategoryData] = useState<TCategoryList>([]);
  // 標籤數據
  const [memberTagsData, setMemberTagsData] = useState<string[]>(props.data?.memberTagList || []);
  // 添加標籤輸入框的值
  const [tagData, setTagData] = useState<string>('');
  // 唯一標識
  const [uniqueFlag, setUniqueFlag] = useState<number>(NaN);
  // 添加類別文字按鈕loading狀態
  const [
    addCategoryLoading,
    { setTrue: showAddCategoryLoading, setFalse: hideAddCategoryLoading },
  ] = useBoolean(false);
  // 添加標籤文字按鈕loading狀態
  const [addTagLoading, { setTrue: showAddTagLoading, setFalse: hideAddTagLoading }] =
    useBoolean(false);
  // 添加標籤輸入框的錯誤提示語是否顯示
  const [errMsgStatus, { setTrue: showErrMsg, setFalse: hideErrMsg }] = useBoolean(false);
  // 添加標籤輸入框的錯誤提示語內容
  const [errMsg, setErrMsg] = useState<string>('');
  // 選擇類別彈框是否顯示
  const [categoryModal, { setTrue: showCategoryModal, setFalse: hideCategoryModal }] =
    useBoolean(false);

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  // 退出提示弹框
  const [closeConfirm, { setTrue: showConfirm, setFalse: hideConfirm }] = useBoolean(false);
  const [tempGender, setTempGender] = useState<number | null>(null);
  const [memberForm] = Form.useForm();
  const { getMessage } = useLocale();

  useEffect(() => {
    showLoading();
    return () => {
      clearTimeout(addTagTimeout);
      setTagData('');
    };
  }, []);

  useEffect(() => {
    // 关闭弹框时，初始化各種狀態
    if (!props.visible) {
      showLoading();
      setTagData('');
      setMemberTagsData([]);
      setCategoryData([]);
      memberForm.resetFields();
      hideErrMsg();
      setErrMsg('');
    }
  }, [props.visible]);

  useEffect(() => {
    if (Object.keys(props.data).length === 0) {
      return; // 如果为空,返回false
    }
    setUniqueFlag(props.data?.uniqueFlag);
    setTempGender(props.data.gender);
    // 區號如果沒有值，默認填852
    if (!props.data.phone.mobileAreaCode || !props.data.phone.mobile) {
      memberForm.setFieldsValue({
        ...props.data,
        phone: {
          mobileAreaCode: MOBILEAREACODE.HK,
          mobile: props.data.phone.mobile,
        },
      });
    } else {
      memberForm.setFieldsValue(props.data);
    }
    setCategoryData(props.data.categoryData);
    setMemberTagsData(props.data.memberTagList);
    hideLoading();
  }, [props.data]);

  const onFinish = (values: any) => {
    const formatValues = { ...values };
    formatValues.memberTagList = memberTagsData;
    formatValues.birthday = values.birthday ? values.birthday.valueOf() : null;
    formatValues.mobileAreaCode =
      '' === values.phone.mobileAreaCode ? null : values.phone.mobileAreaCode;
    formatValues.mobile = '' === values.phone.mobile ? null : values.phone.mobile;
    formatValues.email = '' === values.email ? null : values.email;
    delete formatValues.phone;
    if (props.sumbitData) {
      props.sumbitData(formatValues);
    }
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > moment().endOf('day');
  };

  const inputOnchange = (e: any) => {
    if (errMsgStatus) {
      hideErrMsg();
    }
    setTagData(e.target.value);
  };

  // 打開修改類別穿梭框
  const openTransfer = () => {
    showAddCategoryLoading();
    showCategoryModal();
    const formatCategorys: TAllCategorys = [];
    merchantApi
      .getMemberCategoryListSimple()
      .then((res: IApiResponse<MemberCategoryListSimpleResponse>) => {
        if (res.data) {
          res.data.map((item) => {
            formatCategorys.push({
              key: item.memberCategoryId.toString(),
              title: item.memberCategoryName,
            });
          });
          setTransferData(formatCategorys);
          setAllCategorys(formatCategorys);
          const copyCategoryData = [...categoryData];
          // 當前會員的會員類別（放在穿梭框右面）
          const categoryTargetKeys: string[] = [];
          copyCategoryData.map((item) => {
            categoryTargetKeys.push(item.memberCategoryId);
          });
          setTargetKeys(categoryTargetKeys);
          hideAddCategoryLoading();
        }
      })
      .catch(() => {
        hideAddCategoryLoading();
      });
  };

  // 修改會員類別（穿梭框提交按鈕）
  const editCategoryList = () => {
    const newCategoryData: TCategoryList = [];
    targetKeys.map((item) => {
      const newCategory = find(allCategorys, (o) => o.key === item);
      if (newCategory) {
        newCategoryData.push({
          memberCategoryId: newCategory.key,
          memberCategoryName: newCategory.title,
        });
      }
    });
    setCategoryData(newCategoryData);
    memberForm.setFieldsValue({ memberCategoryList: targetKeys });
    hideCategoryModal();
  };

  // 刪除類別
  const deleteCategory = (categoryId: string) => {
    const newCategoryData = [...categoryData];
    categoryData.map((item, index) => {
      if (item.memberCategoryId === categoryId) {
        newCategoryData.splice(index, 1);
      }
    });
    setCategoryData(newCategoryData);
    const idArray: string[] = [];
    newCategoryData.map((item: { memberCategoryId: string; memberCategoryName: string }) => {
      idArray.push(item.memberCategoryId);
    });
    memberForm.setFieldsValue({ memberCategoryList: idArray });
  };

  // 添加標籤
  const addTaps = () => {
    showAddTagLoading();
    if (!addTagLoading) {
      if (tagData) {
        if (memberTagsData.includes(tagData)) {
          setErrMsg(getMessage('memberCategory.err.tags.name', '重複標籤'));
          showErrMsg();
        } else if (!MEMBERTAGS.test(tagData)) {
          setErrMsg(
            getMessage(
              'memberCategory.errMsg',
              '限30字內的中文或英文標籤，不可包括符號及表情等元素',
            ),
          );
          showErrMsg();
        } else {
          const newTags = [tagData.toString(), ...memberTagsData];
          setMemberTagsData(newTags);
          memberForm.setFieldsValue({ memberTagList: newTags });
          setTagData('');
        }
      }
      clearTimeout(addTagTimeout);
      addTagTimeout = setTimeout(() => {
        hideAddTagLoading();
      }, 500);
    }
  };

  // 刪除標籤
  const deleteTaps = (tap: string) => {
    //以標籤本身作為唯一標識
    const newTags = [...memberTagsData];
    newTags.splice(newTags.indexOf(tap), 1);
    setMemberTagsData(newTags);
    memberForm.setFieldsValue({ memberTagList: newTags });
    if (!newTags.includes(tagData)) {
      setErrMsg('');
      hideErrMsg();
    }
  };

  // 出生日期值改变回调
  const dateOnChange = (time: any) => {
    if (time) {
      const diffAge = moment().get('year') - moment(time).get('year');
      memberForm.setFieldsValue({ age: 0 === diffAge ? 1 : diffAge });
    } else {
      memberForm.setFieldsValue({ age: '' });
    }
  };

  // 离开的提示弹框okBtn
  const onOkConfirm = () => {
    props.closeDrawer();
    hideConfirm();
  };

  // 把唤起关闭提示弹框的方法暴露给父组件调用
  useImperativeHandle(ref, () => ({
    parentComponentShowConfirm: () => {
      showConfirm();
    },
  }));

  const radioClick = (e: any) => {
    if (e.target.value === tempGender?.toString()) {
      memberForm.setFieldsValue({ gender: MEMBERGENDER.UNKNOW });
      setTempGender(MEMBERGENDER.UNKNOW);
    } else {
      memberForm.setFieldsValue({ gender: e.target.value });
      setTempGender(e.target.value);
    }
  };

  return (
    <>
      <KPayDrawer
        {...$_props}
        className={styles.editDrawer}
        mask={!categoryModal || !closeConfirm}
        keyboard={false}
      >
        <Spin spinning={loading}>
          <Form
            form={memberForm}
            onFinish={onFinish}
            labelAlign="left"
            colon={false}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 19, push: 1 }}
          >
            <Form.Item
              name="firstName"
              label={getMessage('member.firstName', '名字')}
              rules={[
                {
                  required: true,
                  message: getMessage('member.enter.firstName', '請填寫名字'),
                },
                pattern('specialValue'),
              ]}
            >
              <Input maxLength={30} />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={getMessage('member.lastName', '姓氏')}
              rules={[
                {
                  required: true,
                  message: getMessage('member.enter.lastName', '請填寫姓氏'),
                },
                pattern('specialValue'),
              ]}
            >
              <Input maxLength={30} />
            </Form.Item>

            <Form.Item
              name="phone"
              label={getMessage('member.Contact.number', '聯絡電話')}
              rules={[
                {
                  required: uniqueFlag === MEMBERUNIQUEFLAG.PHONE,
                },
              ]}
            >
              <Input.Group compact>
                <Form.Item
                  name={['phone', 'mobileAreaCode']}
                  className={styles.select}
                  style={{ marginBottom: 0, marginRight: '12px' }}
                >
                  <Select disabled={uniqueFlag === MEMBERUNIQUEFLAG.PHONE}>
                    {keys(MOBILEAREACODE).map((item: string) => (
                      <Select.Option key={item} value={MOBILEAREACODE[item]}>
                        +{MOBILEAREACODE[item]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  style={{ marginBottom: 0, width: 'calc(100% - 92px)' }}
                  name={['phone', 'mobile']}
                  rules={[
                    {
                      required: uniqueFlag === MEMBERUNIQUEFLAG.PHONE,
                      message: getMessage('Please.fill.inyour.contact.number', '请填写聯絡電話'),
                    },
                    pattern('mobile'),
                  ]}
                >
                  <Input disabled={uniqueFlag === MEMBERUNIQUEFLAG.PHONE} />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              name="email"
              label={getMessage('merchant.Email.address', '電郵')}
              rules={[
                {
                  required: uniqueFlag === MEMBERUNIQUEFLAG.MAIL,
                  message: getMessage('merchant.Pleasefill.in.email', '请填写電郵'),
                },
                pattern('errEmail'),
              ]}
            >
              <Input disabled={uniqueFlag === MEMBERUNIQUEFLAG.MAIL} />
            </Form.Item>

            <Form.Item name="gender" label={getMessage('member.gender', '性別')}>
              <Radio.Group>
                <Radio onClick={radioClick} value={MEMBERGENDER.MALE}>
                  {getMessage('member.Mr', '先生')}
                </Radio>
                <Radio onClick={radioClick} value={MEMBERGENDER.FEMALE}>
                  {getMessage('member.Ms', '女士')}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="birthday"
              label={getMessage('member.date.of.birth', '出生日期')}
              className={styles.birthday}
            >
              <DatePicker format={dateFormat} disabledDate={disabledDate} onChange={dateOnChange} />
            </Form.Item>

            <Form.Item name="age" label={getMessage('member.age', '年齡')}>
              <Input disabled />
            </Form.Item>

            <Form.Item name="memberCategoryList" label={getMessage('member.category', '會員類別')}>
              <div className={styles.categoryBox}>
                <div onClick={openTransfer} className={styles.textBtn}>
                  {getMessage('member.category.select', '選取類別')}
                </div>
                <div className={styles.txtArea}>
                  {categoryData &&
                    categoryData.map((item: any) => {
                      return (
                        <div key={`key_${item.memberCategoryId}`} className={styles.categoryItem}>
                          <div className={styles.text}>{item.memberCategoryName}</div>
                          <img
                            onClick={deleteCategory.bind(null, item.memberCategoryId)}
                            src={closeIcon}
                            className={styles.closeIcon}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </Form.Item>

            <Form.Item
              className={styles.memberTagList}
              name="memberTagList"
              label={getMessage('member.the.label', '標籤')}
              validateStatus={errMsgStatus ? 'error' : undefined}
              // help="test message"
            >
              <div className={styles.tapsBox}>
                <Input.Group compact>
                  <Input
                    allowClear
                    placeholder={getMessage('member.addTags.placeholder', '請輸入標籤')}
                    className={styles.tapsInput}
                    // maxLength={30}
                    value={tagData}
                    onChange={inputOnchange}
                  />
                  <div onClick={addTaps} className={styles.addTaps}>
                    {getMessage('member.addTags', '添加標籤')}
                  </div>
                </Input.Group>
                <div className={styles.message}>{errMsgStatus && errMsg}</div>
                <div className={styles.txtArea}>
                  {memberTagsData &&
                    memberTagsData.map((item: any) => {
                      return (
                        <div key={`key_${item}`} className={styles.categoryItem}>
                          <div className={styles.text}>{item}</div>
                          <img
                            src={closeIcon}
                            onClick={deleteTaps.bind(null, item)}
                            className={styles.closeIcon}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </Form.Item>

            <div className={styles.footerBox}>
              <Button onClick={showConfirm} className={styles.cancelBtn}>
                {getMessage('members.to.cancel', '取消')}
              </Button>
              <Button
                htmlType="submit"
                loading={props.btnLoading || false}
                className={styles.sumbitBtn}
              >
                {getMessage('members.to.save', '保存')}
              </Button>
            </div>
          </Form>
        </Spin>
      </KPayDrawer>

      <KPayModal
        type="modal"
        title={getMessage('member.category.select', '選取類別')}
        loading={addCategoryLoading}
        className={styles.transferModal}
        btnMiddle
        width={792}
        visible={categoryModal}
        onCancel={hideCategoryModal}
        onOk={editCategoryList}
        cancelButtonProps={{ className: styles.cancelBtn }}
        okButtonProps={{ className: styles.sumbitBtn }}
      >
        <KpayRewriteTransfer
          dataSource={transferData}
          targetKeys={targetKeys}
          setTargetKeys={setTargetKeys}
          targetEmptyText={'請選取類別'}
          selectEmptyText={'未有類別資訊'}
          searchEmptyText={'未能搜尋此類別'}
        />
      </KPayModal>

      <KPayModal
        className={styles.deleteConfirm}
        visible={closeConfirm}
        type="confirm"
        title={getMessage('common.confirm.title', '提示')}
        cancelText={getMessage('member.edit.exit.cancelText', '離開')}
        okText={getMessage('member.edit.exit.okText', '繼續編輯')}
        btnMiddle
        icon={<img src={confirmIcon} />}
        onOk={hideConfirm}
        onCancel={onOkConfirm}
        okButtonProps={{ className: styles.deleteBtn }}
        cancelButtonProps={{ className: `${styles.cancelBtn} ${styles.noMr}` }}
        zIndex={1001}
      >
        {getMessage('member.edit.exit.confirm', '內容尚未保存')}
      </KPayModal>
    </>
  );
});

export default EditDrawer;
