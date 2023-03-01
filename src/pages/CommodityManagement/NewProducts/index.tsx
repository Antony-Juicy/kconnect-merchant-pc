import React, { useEffect, useState, useRef, useMemo } from 'react';
import NormalLayout from '@/components/Layout/NormalLayout';
import { Card, Form, Radio, Button, Affix, Spin } from 'antd';
import type { RadioChangeEvent } from 'antd';
import styles from './index.less';
import classNames from 'classnames';
import saveForm from '@/assets/images/products/saveForm.png';
import { notify } from '@/utils/antdUtils';
import { merchantApi } from '@/services';
import type { ProductInfoResponse, TemplateInfoResponse } from '@/services/api';
import './reset.less';
import CustomForm from './components/CustomForm';
import {
  MULTI_SELECT,
  DATE_SELECT,
  WEBVIEW_INPUT,
  PRICE_INPUT,
} from './components/CustomForm/constants';
import moment from 'moment';
import useLocale from '@/hooks/useLocale';
import CommodityInfo from './components/CommodityInfo';
import StyleOptions from './components/StyleOptions';
import TitleTabs from './components/TitleTabs';
import KPayModal from '@/components/Fields/kpay-modal';
import { history } from 'umi';
import { mapHashAnchor } from './components/TitleTabs';
import BraftEditor from 'braft-editor';
import type { EditorState } from 'braft-editor';
import 'braft-editor/dist/index.css';
import { TEMP_UPDATE_ERROR_CODE, UPLOADMODULE } from '@/utils/constants';

export interface PictureProps {
  fileName: string;
  fileUrl: string;
}

const MAP_KEY = ['parentId', 'categoryId', 'childId'];

const NewProduct: React.FC<any> = (props) => {
  const { getMessage } = useLocale();
  // 商品id
  const productId = props.location.query.id;
  // 商品资料
  const [productInfoForm] = Form.useForm();
  const productInfoRef = useRef<any>();
  // 款式选项
  const [combinationForm] = Form.useForm();
  const combinationRef = useRef<any>();
  // -----
  const [CENTERFormInstance] = Form.useForm();
  const [BOTTOMFormInstance] = Form.useForm();
  // 是否跟踪库存
  const [stockTrace, setStockTrace] = useState<string>('0');
  // 模板数据
  const [templateData, setTemplateData] = useState<TemplateInfoResponse | null>(null);
  // 上部自定义组件模板
  const [TTemplateList, setTTemplateList] = useState<any[]>([]);
  // 下部自定义组件模板
  const [BTemplateList, setBTemplateList] = useState<any[]>([]);
  // 是否为编辑
  const isEdit = useRef(productId ? true : false);
  // 商品详情
  const [productInfo, setProductInfo] = useState<ProductInfoResponse | null>(null);
  // 退出彈框提示
  const [backVisible, setBackVisible] = useState(false);
  // 页面loading
  const [loading, setLoading] = useState(false);
  // 按钮loading
  const [btnLoading, setBtnLoading] = useState(false);
  // 判断是点击回退还是提交
  const [modalType, setModalType] = useState<'back' | 'submit'>('back');
  // 商品上下架状态
  const [salesState, setSalesState] = useState(1);
  // 富文本内容
  const [editorState, setEditorState] = useState<EditorState>('');
  // 是否有值的的变更，用于页面退出业务提示
  const [isValueChange, setIsValueChange] = useState(false);
  // 是否显示重新加载提示模态框
  const [reloadVisible, setReloadVisible] = useState(false);
  // 获取模板信息loading
  const [tempLoading, setTempLoading] = useState(false);
  // 图片列表，用于传递接口
  const fileList = useRef<PictureProps[]>([]);
  // 模板更新提示语
  const [errorTempTips, setErrorTempTips] = useState('');

  // 商品上下架状态，选项列表
  const radioSalesState = useMemo(
    () => [
      { value: 1, text: getMessage('common.upper', '上架') },
      { value: 0, text: getMessage('common.lower', '下架') },
    ],
    [],
  );

  // 商品库存追踪状态，选项列表
  const radioStockTrace = useMemo(
    () => [
      { value: '0', text: getMessage('common.close', '關閉') },
      { value: '1', text: getMessage('common.open', '開啟') },
    ],
    [],
  );

  // 回退路徑
  const backHandel = () => {
    if (isEdit.current) {
      history.replace(`/main/commodity/productDetail/${productId}`);
    } else {
      history.replace('/main/commodity/list');
    }
  };

  // 自定义返回事件
  const customBack = () => {
    if (isValueChange) {
      setModalType('back');
      setBackVisible(true);
    } else {
      backHandel();
    }
  };

  // 判断页面是否有值的变更
  const pageChangeValue = () => {
    setIsValueChange(true);
  };

  // 商品上下架changge
  const salesStateChange = (e: RadioChangeEvent) => {
    pageChangeValue();
    setSalesState(e.target.value);
  };

  // 富文本change
  const handleEditorChange = (editor: EditorState) => {
    setEditorState(editor);
  };

  const handleEditorBlur = (editor: EditorState) => {
    pageChangeValue();
    setEditorState(editor);
  };

  // 是否跟踪库存change
  const stockTraceChange = (e: RadioChangeEvent) => {
    pageChangeValue();
    setStockTrace(e.target.value);
  };

  // 校验选项
  const verifyOptions = () => {
    const { option1, value1 } = combinationForm.getFieldsValue();
    if (option1 && !value1?.length) {
      notify.error(getMessage('commodity.addProduct.option.value.placeholder', '請輸入選項值'));
      return false;
    }
    if (!option1 && value1?.length) {
      notify.error(getMessage('commodity.addProduct.option.name.placeholder', '請輸入選項名'));
      return false;
    }
    return true;
  };

  // 组装多选款的数据格式
  const assemblyFormat = (value: any[] = []) => {
    const productCategoryList = value.map((item) => {
      const combination = {};
      item.forEach((child: string, i: number) => {
        combination[MAP_KEY[i]] = child;
      });
      return combination;
    });
    return productCategoryList;
  };
  // 解析下拉多选数据格式
  const analysisFormat = (value: any[]) => {
    const productCategoryList = value.map((item) => {
      const combination: any[] = [];
      Object.keys(item).forEach((child, index) => {
        if (item[MAP_KEY[index]]) {
          combination.push(item[MAP_KEY[index]]);
        }
      });
      return combination;
    });
    return productCategoryList;
  };

  // 新增商品提交
  const finalFormSubmit = async () => {
    try {
      // 商品信息数据
      const {
        companyProductTypeId,
        companyBrandId,
        productName,
        skuCode,
        barCode,
        originalPrice,
        specialPrice,
        costPrice,
        supplier,
        productCategoryList,
      } = productInfoForm.getFieldsValue();

      // 修改图片数据格式
      const productFileList = fileList.current?.map((item: PictureProps, index: number) => ({
        ...item,
        sort: index,
      }));

      // 自定义模板数据
      const CENTERFormData = CENTERFormInstance.getFieldsValue();
      const BOTTOMFormData = BOTTOMFormInstance.getFieldsValue();
      // 组合数据
      const customFormData = Object.assign({}, CENTERFormData, BOTTOMFormData);

      const productFieldList = Object.keys(customFormData).map((item) => {
        const [templateFieldId, fieldType] = item.split('~');
        let value = customFormData[item] || '';
        if (fieldType == MULTI_SELECT) {
          value = value ? value.join(',') : '';
        } else if (fieldType == DATE_SELECT) {
          value = value ? +new Date(value.format()) : '';
        } else if (fieldType === WEBVIEW_INPUT) {
          value = value ? value?.toHTML() : null;
        } else if (fieldType == PRICE_INPUT) {
          value = customFormData[item];
        }
        const productFieldRelationId = productInfo?.productFieldList?.find(
          (files: any) => files.templateFieldId == templateFieldId,
        )?.productFieldRelationId;
        return {
          productFieldRelationId: isEdit.current ? productFieldRelationId : '',
          templateId: templateData?.templateId || 0,
          templateFieldId: templateFieldId,
          templateFieldValueIds: value,
          inputValue: value,
        };
      });

      // 商品款式选项数据
      // 校验款式选项，是否选择
      if (!verifyOptions()) return;
      const {
        SKUCombination,
        dataSource = [],
        SUKMapData = {},
        ...combinationInfo
      } = combinationForm.getFieldsValue();

      const productOptionList = SKUCombination.map((item: any) => ({
        key: combinationInfo[item.key],
        value: combinationInfo[item.value],
        productSkuPropertyNameId: item.productSkuPropertyNameId,
        productSkuPropertyValueList: item.productSkuPropertyValueList || [],
      }));
      let productSkuPropertyList: any[] = [];
      productOptionList.forEach((item: any, index: number) => {
        productSkuPropertyList.push({
          propertyName: item.key,
          sort: index,
          productSkuPropertyNameId: item.productSkuPropertyNameId,
          productSkuPropertyValueList: [],
        });
        item.value?.forEach((child: string, i: number) => {
          productSkuPropertyList[index].productSkuPropertyValueList.push({
            propertyValue: child,
            sort: i,
            productSkuPropertyValueId: item.productSkuPropertyValueList.find(
              (property: any) => property.propertyValue == child,
            )?.productSkuPropertyValueId,
          });
        });
      });

      // 无数据时，接口做空数组处理
      if (
        !productSkuPropertyList[0].propertyName ||
        !productSkuPropertyList[0].productSkuPropertyValueList.length
      ) {
        productSkuPropertyList = [];
      }

      // 商品SKU列表 -- 注意：应该通过mapTbodySource，过滤多余的数据
      const productSkuList = dataSource
        .map((item: any) => SUKMapData[item.uuid])
        .sort((a: any, b: any) => a.sort - b.sort);

      const params: any = {
        templateId: templateData?.templateId || 0, // 编辑需要
        productId, // 编辑需要

        companyProductTypeId,
        companyBrandId,
        productName,
        skuCode,
        barCode,
        originalPrice,
        specialPrice,
        costPrice,
        supplier,
        salesState,
        stockTrace,
        description: editorState ? editorState.toHTML() : '',
        productCategoryList: assemblyFormat(productCategoryList),
        productSkuPropertyList,
        productSkuList,
        productFieldList,
        productFileList,
      };
      setBtnLoading(true);
      const interfaceName = productId ? merchantApi.postProductModify : merchantApi.postProductAdd;
      await interfaceName(params);
      setBtnLoading(false);
      const tips = productId
        ? getMessage('common.editing.success', '編輯成功')
        : getMessage('common.new.add.success', '新增成功');
      notify.success(tips);
      backHandel();
    } catch (error: any) {
      console.log('错误了', error);
      setBtnLoading(false);
      // 该状态，需要更新模板，弹窗提示
      if (error.code == TEMP_UPDATE_ERROR_CODE) {
        setReloadVisible(true);
        setErrorTempTips(error.message);
      }
    }
  };

  // 同步校验表单
  const synchronizationCheckForm = () => {
    Promise.all([
      productInfoForm.validateFields(),
      CENTERFormInstance.validateFields(),
      BOTTOMFormInstance.validateFields(),
      combinationForm.validateFields(),
    ])
      .then(() => {
        finalFormSubmit();
      })
      .catch(() => {});
  };

  // 确认提交数据，逻辑拦截库存变更校验
  const beforeFinalFormSubmit = () => {
    setModalType('submit');
    if (isEdit && productInfo?.stockTrace == 1) {
      // 判断是是否有库存变更，如果有则弹窗，没有进行接口提交
      const originskuIdList = productInfo?.productSkuList?.length
        ? productInfo?.productSkuList?.map((item) => item.productSkuId)
        : [];
      const { dataSource = [], SUKMapData = {} } = combinationForm.getFieldsValue();
      const newSkuList = dataSource.map((item: any) => SUKMapData[item.uuid]?.productSkuId);

      if (
        originskuIdList.length != newSkuList.length ||
        originskuIdList?.join('') != newSkuList?.join('')
      ) {
        // 库存变更
        setBackVisible(true);
        return;
      }
      synchronizationCheckForm();
    } else {
      synchronizationCheckForm();
    }
  };

  // 筛选自定义模板数据 （调用自定义模板接口）
  const fetchTemplateInfo = async () => {
    try {
      setTempLoading(true);
      const reslut = await merchantApi.getTemplateInfo();
      setTempLoading(false);
      setTemplateData(reslut.data); // 设置模板数据
      // 排序
      reslut.data.templateFieldList.sort((a, b) => a.sort - b.sort);
      // 分别塞入不同的自定义组件区域
      const CENTERList: any[] = [];
      const BOTTOMList: any[] = [];
      reslut.data.templateFieldList.forEach((item) => {
        if (item.templateFieldGroup.includes('CENTER')) {
          CENTERList.push(item);
        } else if (item.templateFieldGroup.includes('BOTTOM')) {
          BOTTOMList.push(item);
        }
      });
      setTTemplateList(CENTERList);
      setBTemplateList(BOTTOMList);
    } catch (error) {
      setTempLoading(false);
    }
  };

  // 富文本图片上传
  const uploadFn = async (param: any) => {
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
  };

  useEffect(() => {
    fetchTemplateInfo();
  }, []);

  // 数据回填 -- 编辑（调用商品详情接口）
  useEffect(() => {
    if (isEdit.current) {
      setLoading(true);
      merchantApi
        .getProductInfo({ productId })
        .then((result) => {
          setLoading(false);
          setProductInfo(result.data);
          const {
            productFileList,
            productName,
            originalPrice,
            specialPrice,
            costPrice,
            supplier,
            skuCode,
            barCode,
            salesState: state,
            description,
            companyBrandId,
            companyBrandName,
            companyProductTypeId,
            companyProductTypeName,
            stockTrace: stock,
            productSkuPropertyList,
            productFieldList,
            productCategoryList,
            productSkuList,
          } = result.data;
          // 商品资料
          productInfoForm.setFieldsValue({
            productName,
            originalPrice,
            specialPrice,
            costPrice,
            supplier,
            skuCode,
            barCode,
            companyProductTypeId,
            companyBrandId,
            productCategoryList: analysisFormat(productCategoryList),
          });
          // 商品资料的图片，类别下拉，品牌下拉
          productInfoRef.current?.setInitData({
            imgs: productFileList,
            typeActionOption: { label: companyProductTypeName, value: companyProductTypeId },
            brandActionOption: { label: companyBrandName, value: companyBrandId },
          });
          // 商品上下架状态
          setSalesState(state);
          // 富文本
          setEditorState(BraftEditor.createEditorState(description));
          // 款式选项
          combinationRef.current?.setInitData({ productSkuPropertyList, productSkuList });
          // 自定义数据模板
          productFieldList.sort((a, b) => Number(a.sort) - Number(b.sort));
          // 分别塞入不同的自定义组件区域
          productFieldList.forEach((item) => {
            const { templateFieldId, fieldType, templateFieldGroup, fieldValue } = item;
            const keyName = `${templateFieldId}~${fieldType}`;
            let formInstance = null;
            if (templateFieldGroup.includes('CENTER')) {
              formInstance = CENTERFormInstance;
            } else if (templateFieldGroup.includes('BOTTOM')) {
              formInstance = BOTTOMFormInstance;
            }
            if (item.fieldType == WEBVIEW_INPUT) {
              // 富文本输入，单独处理
              formInstance?.setFieldValue(keyName, BraftEditor.createEditorState(fieldValue));
            } else if (item.fieldType == DATE_SELECT) {
              // 时间选择器
              if (fieldValue) {
                formInstance?.setFieldValue(keyName, moment(Number(fieldValue)));
              }
            } else if (item.fieldType == MULTI_SELECT) {
              // 多选框
              if (fieldValue) {
                formInstance?.setFieldValue(keyName, fieldValue.split(','));
              }
            } else {
              formInstance?.setFieldValue(keyName, fieldValue);
            }
          });
          // 追蹤庫存
          setStockTrace(`${stock}`);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isEdit, productInfoForm, BOTTOMFormInstance, CENTERFormInstance, productId, setSalesState]);

  return (
    <NormalLayout
      visible
      title={
        productId
          ? getMessage('commodity.editProduct.title', '編輯商品')
          : getMessage('commodity.addProduct.title', '新增商品')
      }
      customBack={customBack}
      toolBarRender={<TitleTabs />}
    >
      <Spin spinning={loading || tempLoading}>
        <div className={styles.wrapper}>
          <CommodityInfo
            refForm={productInfoForm}
            ref={productInfoRef}
            pageChangeValue={pageChangeValue}
            fileList={fileList}
          />
          <div className={styles.customFormWrapper}>
            <CustomForm
              templateList={TTemplateList}
              formInstance={CENTERFormInstance}
              pageChangeValue={pageChangeValue}
            />
          </div>
          <div className={styles.statusContent}>
            <div className={classNames([styles.itemLabel, styles.productStatus])}>
              {getMessage('common.state', '狀態')}
            </div>
            <Radio.Group onChange={salesStateChange} value={salesState}>
              {radioSalesState.map((item) => (
                <Radio key={item.value} value={item.value}>
                  <span className={styles.statusItem}>{item.text}</span>
                </Radio>
              ))}
            </Radio.Group>
          </div>
          <div className={styles.braftEditorWrapper}>
            <div className={styles.editorLabel}>
              {getMessage('commodity.addProduct.product.details', '商品詳細介紹')}
            </div>
            <BraftEditor
              placeholder={getMessage('common.placeholder', '請輸入')}
              className={styles.braftEditor}
              contentClassName={styles.braftEditorContent}
              value={editorState}
              onChange={handleEditorChange}
              onBlur={handleEditorBlur}
              media={{
                uploadFn,
              }}
            />
          </div>

          <StyleOptions
            isEdit={isEdit.current}
            productInfoForm={productInfoForm}
            refForm={combinationForm}
            ref={combinationRef}
            pageChangeValue={pageChangeValue}
            salesState={salesState}
          />

          <Card className={styles.inventoryContainer} id={mapHashAnchor.ANCHOR_INVENTORY_SETTING}>
            <div className={classNames([styles.optionLabel])}>
              {getMessage('commodity.addProduct.setting', '庫存設定')}
            </div>
            {isEdit.current ? (
              <div className={styles.rowsEnpty}>
                <div className={styles.name}>
                  {getMessage('commodity.productDetail.track.inventory', '追蹤庫存')}
                </div>
                <div className={styles.box}>
                  {stockTrace == '1'
                    ? getMessage('common.open', '開啟')
                    : getMessage('common.close', '關閉')}
                </div>
              </div>
            ) : (
              <>
                <div className={classNames([styles.itemLabel, styles.mt24])}>追蹤庫存</div>
                <div className={styles.inventorySetting}>
                  <Radio.Group onChange={stockTraceChange} value={stockTrace}>
                    {radioStockTrace.map((item) => (
                      <Radio key={item.value} value={item.value}>
                        <span className={styles.inventoryItem}>{item.text}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
              </>
            )}

            <div className={styles.inventoryTips}>
              <div>{getMessage('common.tips', '提示')}：</div>
              <div>
                {getMessage(
                  'commodity.addProduct.inventory.tips.one',
                  '1、開啟後在庫存模塊追蹤產品庫存信息，一經開啟後不能修改。',
                )}
              </div>
              <div>
                {getMessage(
                  'commodity.addProduct.inventory.tips.two',
                  '2、產品庫存資料請在左側【庫存管理-庫存變更】進行操作。',
                )}
              </div>
            </div>
          </Card>

          <Card className={styles.otherInformation} id={mapHashAnchor.ANCHOR_OTHER_INFORMATION}>
            <div className={classNames([styles.optionLabel, styles.mb24])}>
              {getMessage('commodity.addProduct.other.information', '其他資料')}
            </div>
            <CustomForm
              templateList={BTemplateList}
              formInstance={BOTTOMFormInstance}
              pageChangeValue={pageChangeValue}
            />
          </Card>

          <Affix offsetBottom={0}>
            <div className={styles.formSubmit}>
              <Button className="primary-btn" onClick={customBack}>
                {getMessage('members.to.cancel', '取消')}
              </Button>
              <Button
                type="primary"
                loading={btnLoading}
                className={classNames(styles.confirm, 'primary-btn')}
                onClick={beforeFinalFormSubmit}
              >
                <img className={styles.saveForm} src={saveForm} />
                <span>{getMessage('common.confirm', '確認')}</span>
              </Button>
            </div>
          </Affix>
        </div>
        <KPayModal
          type="modal"
          maskClosable={false}
          closable={false}
          title={getMessage('common.confirm.title', '提示')}
          className={styles.transferModal}
          visible={backVisible}
          okText={
            modalType == 'submit'
              ? getMessage('members.to.cancel', '取消')
              : getMessage('member.edit.exit.okText', '繼續編輯')
          }
          cancelText={
            modalType == 'submit'
              ? getMessage('commodity.addProduct.confirm.change', '確認變更')
              : getMessage('commodity.addProduct.back.cancel', '確認取消')
          }
          onCancel={() => {
            if (modalType == 'submit') {
              synchronizationCheckForm();
            } else {
              backHandel();
            }
          }}
          onOk={() => {
            if (modalType == 'submit') {
              setBackVisible(false);
            } else {
              setBackVisible(false);
            }
          }}
        >
          <div className={styles.KPayModalText}>
            {modalType == 'submit'
              ? getMessage(
                  'commodity.addProduct.change.prompt',
                  '變更商品類別將導致現有商品庫存清空，請謹慎操作',
                )
              : getMessage('commodity.addProduct.back.tips', '取消後所有更改將不獲儲存')}
          </div>
        </KPayModal>

        <KPayModal
          type="modal"
          maskClosable={false}
          closable={false}
          title={getMessage('common.confirm.title', '提示')}
          className={styles.transferModal}
          visible={reloadVisible}
          footer={
            <div>
              <Button
                type="primary"
                onClick={() => {
                  setReloadVisible(false);
                  fetchTemplateInfo();
                }}
              >
                {getMessage('common.confirm', '確認')}
              </Button>
            </div>
          }
        >
          <div className={styles.KPayModalText}>{errorTempTips}</div>
        </KPayModal>
      </Spin>
    </NormalLayout>
  );
};

export default NewProduct;
