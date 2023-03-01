import type { KPayDrawerProps } from '@/components/Fields/kpay-drawer';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import useLocale from '@/hooks/useLocale';
import { Button, Form, Input, Radio, Space, Spin } from 'antd';
import styles from '../index.less';
import { useState } from 'react';
import { merchantApi } from '@/services';
import { notify } from '@/utils/antdUtils';
import { useEffect } from 'react';
import settings from '@/utils/settings';
import KpayRewriteTransfer from '@/components/Fields/kpay-rewrite-transfer';
import KpayModal from '@/components/Fields/kpay-modal';
import type { CompanyProductCategoryListResponse } from '@/services/api';
import { useBoolean } from 'ahooks';
import cx from 'classnames';
import { map } from 'lodash';
import { CHINESE_REG } from '@/utils/reg';

export type CreateClassDrawerProps = {
  categoryId?: string;
} & KPayDrawerProps;

// TODO: 必填数据未输入时，確認按钮灰色不可点击，確認成功回到列表页面

const CreateClassDrawer: React.FC<CreateClassDrawerProps> = (props) => {
  const { getMessage } = useLocale();
  const [formInstance] = Form.useForm();
  // 初始化loading
  const [initLoading, setInitLoading] = useState<boolean>(false);
  // 提交loading
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  // 上級分類數據
  const [categories, setCategories] = useState<CompanyProductCategoryListResponse>([]);
  // 顯示隱藏上級分類選擇彈窗
  const [classModalVisible, { setTrue: showClassModal, setFalse: hideClassModal }] =
    useBoolean(false);
  // 上級分類選擇彈窗讀取數據
  const [classLoading, { setTrue: showClassLoading, setFalse: hideClassLoading }] =
    useBoolean(false);
  // 上级列表
  const [parentCategoryName, setParentCategoryName] = useState<string[]>([]);
  // 上級分類選擇彈窗讀取數據
  const [companyProductCategoryIdList, setCompanyProductCategoryIdList] = useState<string[]>([]);
  // 上级列表
  const [parentCategoryNameCache, setParentCategoryNameCache] = useState<string[]>([]);
  // 上級分類選擇彈窗讀取數據
  const [companyProductCategoryIdListCache, setCompanyProductCategoryIdListCache] = useState<
    string[]
  >([]);
  // 是否展示错误提示
  const [parentValidateStatus, setParentValidateStatus] = useState<'error' | 'success'>('success');
  // 分类等级
  const [categoryLevel, setCategoryLevel] = useState<string>('1');

  // 提交添加選項
  const submitCategory = () => {
    if (formInstance.getFieldValue('categoryLevel') > 1 && parentCategoryName.length <= 0) {
      setParentValidateStatus('error');
    } else {
      setParentValidateStatus('success');
    }
    formInstance.validateFields().then((data) => {
      let method = undefined;
      if (props?.categoryId) {
        method = merchantApi.postCompanyProductCategoryModify;
        data.companyProductCategoryId = props.categoryId;
      } else {
        method = merchantApi.postCompanyProductCategoryAdd;
      }

      if (data.categoryLevel > 1 && parentCategoryName.length <= 0) {
        return false;
      }

      if (parentCategoryName.length > 0) {
        data.companyProductCategoryIdList = companyProductCategoryIdList;
      }

      setSubmitLoading(true);
      method(data)
        .then((res) => {
          setSubmitLoading(false);
          if (res.success) {
            if (props?.categoryId) {
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

  // 重置上級分類选择状态
  const resetParentClassStatus = () => {
    setParentValidateStatus('success');
    setParentCategoryName([]);
    setCompanyProductCategoryIdList([]);
    setParentCategoryNameCache([]);
    setCompanyProductCategoryIdListCache([]);
  };

  // 更新上級分類
  const updateParentClass = () => {
    setParentCategoryNameCache(parentCategoryName);
    setCompanyProductCategoryIdListCache(companyProductCategoryIdList);
    hideClassModal();
  };

  // 重置上級分類选择
  const resetParentClass = () => {
    setParentCategoryName(parentCategoryNameCache);
    setCompanyProductCategoryIdList(companyProductCategoryIdListCache);
    hideClassModal();
  };

  // 打開上級分類彈窗
  const onParentModal = () => {
    setParentValidateStatus('success');
    showClassLoading();
    merchantApi
      .getCompanyProductCategoryList({
        categoryLevel: `${
          parseFloat(categoryLevel) > 1 ? parseFloat(categoryLevel) - 1 : undefined
        }`,
      })
      .then((res) => {
        if (res.success) {
          hideClassLoading();
          setCategories(res.data);
          showClassModal();
        }
      })
      .catch(() => {
        hideClassLoading();
      });
  };

  useEffect(() => {
    if (props.open && props?.categoryId) {
      setInitLoading(true);
      merchantApi
        .getCompanyProductCategoryInfo({
          companyProductCategoryId: props.categoryId,
        })
        .then((res) => {
          setInitLoading(false);
          if (res.success) {
            setParentCategoryName(res?.data?.parentCategoryName?.split(','));
            setCompanyProductCategoryIdList(res?.data?.parentCategoryIdList as unknown as string[]);
            setCategoryLevel(`${res?.data?.categoryLevel}`);
            formInstance.setFieldsValue({
              categoryName: res?.data?.categoryName,
              categoryEnName: res?.data?.categoryEnName,
              categoryLevel: `${res?.data?.categoryLevel ?? ''}`,
            });
          }
        })
        .catch(() => {
          setInitLoading(false);
        });
    }
    if (!props?.categoryId) {
      formInstance.setFieldsValue({
        categoryLevel: '1',
      });
      setCategoryLevel('1');
    }
    if (!props.open) {
      setSubmitLoading(false);
      setParentCategoryName([]);
      setCompanyProductCategoryIdList([]);
      setParentCategoryNameCache([]);
      setCompanyProductCategoryIdListCache([]);
      setCategoryLevel('1');
      formInstance.resetFields();
    }
  }, [props.open]);

  return (
    <KPayDrawer
      width={430}
      maskClosable={false}
      destroyOnClose
      className={styles.classDrawer}
      open={props?.open}
      onClose={props.closeCb}
      title={
        props?.categoryId
          ? getMessage('common.editor', '編輯')
          : getMessage('commodity.classification.create', '新增')
      }
    >
      <Spin spinning={initLoading}>
        <Form form={formInstance} labelAlign="left" labelCol={{ style: { width: '85px' } }}>
          <Form.Item
            name="categoryName"
            label={getMessage('commodity.common.name', '中文名稱')}
            rules={[
              {
                required: true,
                message: getMessage('commodity.common.name.placeholder', '請輸入中文名稱'),
              },
            ]}
            extra={
              props.categoryId
                ? ''
                : getMessage(
                    'commodity.classification.name.tips',
                    '（例如：一級-褲裝，二級-牛仔褲，三級-牛仔長褲）',
                  )
            }
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage('commodity.common.name.placeholder', '請輸入中文名稱')}
            />
          </Form.Item>

          <Form.Item
            name="categoryEnName"
            label={getMessage('commodity.common.en.name', '英文名稱')}
            getValueFromEvent={(event) => {
              return event?.target?.value?.replace(CHINESE_REG, '');
            }}
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage('commodity.common.en.name.placeholder', '請輸入英文名稱')}
            />
          </Form.Item>

          <Form.Item
            name="categoryLevel"
            label={getMessage('commodity.classification.category.level', '分類等級')}
            rules={[
              {
                required: true,
                message: getMessage(
                  'commodity.classification.category.level.placeholder',
                  '請選擇分類等級',
                ),
              },
            ]}
          >
            <Radio.Group
              disabled={!!props?.categoryId}
              onChange={(e) => {
                resetParentClassStatus();
                setCategoryLevel(e.target.value);
              }}
            >
              <Radio value="1">{getMessage('commodity.class.level.first', '一級')}</Radio>
              <Radio value="2">{getMessage('commodity.class.level.second', '二級')}</Radio>
              <Radio value="3">{getMessage('commodity.class.level.third', '三級')}</Radio>
            </Radio.Group>
          </Form.Item>

          {categoryLevel > '1' && !props?.categoryId ? (
            <Form.Item
              required={true}
              label={getMessage('commodity.classification.parent.category.name', '上級分類')}
              validateStatus={parentValidateStatus}
              help={
                parentValidateStatus === 'error'
                  ? getMessage('commodity.classification.parent.class.warnning', '請選擇上級分類')
                  : ''
              }
            >
              <>
                <Button
                  type="link"
                  loading={classLoading}
                  className={styles.paddingNone}
                  onClick={onParentModal}
                >
                  {getMessage('commodity.classification.category.select', '選擇分類')}
                </Button>
                <div
                  className={cx(
                    styles.parentLevelWapper,
                    parentValidateStatus === 'error' ? styles.errorBorder : styles.normalBorder,
                  )}
                >
                  {!classModalVisible && parentCategoryName.length ? (
                    parentCategoryName.map((val) => {
                      return (
                        <div key={val} className={styles.parentLevelItem}>
                          {val}
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
              </>
            </Form.Item>
          ) : (
            <></>
          )}
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
              submitCategory();
            }}
          >
            {getMessage('common.confirm', '確認')}
          </Button>
        </Space>
      </Spin>

      <KpayModal
        open={classModalVisible}
        title={getMessage('commodity.classification.parent.category.name', '上級分類')}
        loading={classLoading}
        className={styles.transferModal}
        btnMiddle
        width={792}
        destroyOnClose
        onCancel={resetParentClass}
        onOk={updateParentClass}
        cancelButtonProps={{ className: styles.cancelBtn }}
        okButtonProps={{ className: styles.sumbitBtn }}
      >
        <KpayRewriteTransfer<CompanyProductCategoryListResponse[0]>
          dataSource={categories}
          targetKeys={companyProductCategoryIdList}
          setTargetKeys={setCompanyProductCategoryIdList}
          setSelectedItem={(values) => {
            setParentCategoryName(map(values, 'categoryName'));
          }}
          maxSelectedCount={settings.classParentMaxCount}
          maxSelectedMsg={getMessage(
            'commodity.classification.parent.category.limit',
            '上級分類超過20個',
          )}
          keyMap={{
            key: 'companyProductCategoryId',
            title: 'categoryName',
          }}
          targetEmptyText={getMessage('commodity.classification.target.empty', '請選取分類')}
          selectEmptyText={getMessage('commodity.classification.select.empty', '未有分類資訊')}
          searchEmptyText={getMessage('commodity.classification.search.empty', '無此資料')}
        />
      </KpayModal>
    </KPayDrawer>
  );
};

export default CreateClassDrawer;
