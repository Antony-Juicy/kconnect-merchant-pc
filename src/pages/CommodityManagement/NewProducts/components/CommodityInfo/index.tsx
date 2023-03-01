import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Tooltip, Upload, Spin, Form, Input, Cascader, Image, InputNumber } from 'antd';
import type { FormInstance } from 'antd';
import styles from './index.less';
import questions from '@/assets/images/products/questions.png';
import productRemove from '@/assets/images/products/productRemove.png';
import addIcon from '@/assets/images/products/addIcon.png';
import { EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { checkTypes, transSize } from '@/utils/utils';
import type { RcFile } from 'antd/lib/upload';
import { notify } from '@/utils/antdUtils';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { merchantApi } from '@/services';
import type { CompanyProductCategoryTreeListResponse } from '@/services/api';
import classNames from 'classnames';
import useLocale from '@/hooks/useLocale';
import { verifyNumber } from '@/utils/utils';
import settings from '@/utils/settings';
import { mapHashAnchor } from '../TitleTabs';
import type { PictureProps } from '../../index';
import { SKU_CODE } from '@/utils/reg';
import PaginationSelect from '../PaginationSelect';
import { UPLOADMODULE } from '@/utils/constants';

const { SHOW_CHILD } = Cascader;

const antIcon = <LoadingOutlined spin />; // 加載圖片loading效果

interface TCheckObjProps {
  maxSize?: number; // 最大上传大小
  mineType?: string[]; // 类型限制数组
  resolution?: [number, number]; // 分辨率數組
}
const checkObj: TCheckObjProps = {
  maxSize: 2,
  mineType: ['image/jpeg', 'image/png'],
};
// 获取限制文件大小
const checkMaxSize = (size: number, maxSize: number) => {
  return size / 1024 / 1024 < (maxSize || 2);
};
// 圖片上傳之前做的校驗
const asyncBeforeUpload = async (file: RcFile) => {
  let mathType = true;
  let ltSize = true;
  if (checkObj.mineType) {
    mathType = checkTypes(file, checkObj.mineType);
    if (!mathType) {
      notify.error('文件類型不符合, 請檢查後重試');
    }
  }
  if (checkObj.maxSize) {
    ltSize = checkMaxSize(file.size, checkObj.maxSize);
    if (!ltSize) {
      notify.error('文件大小必須小於' + transSize(checkObj.maxSize || 2, 'mb'));
    }
  }
  return !!(ltSize && mathType);
};

interface CommodityInfoProps {
  refForm: FormInstance<any>;
  ref: any;
  pageChangeValue: () => void;
  fileList: React.MutableRefObject<PictureProps[]>;
}

// 最大图片上传，数量
const MAX_PICTURE_COUNT = 10;

const CommodityInfo: React.FC<CommodityInfoProps> = forwardRef((props, ref) => {
  const { getMessage } = useLocale();
  const { refForm, pageChangeValue, fileList } = props;
  // 圖片列表
  const [pictureList, setPictureList] = useState<PictureProps[]>([]);
  // 添加圖片loading
  const [loading, setLoading] = useState<boolean>(false);
  // 商品分类数据，下拉
  const [categoryList, setCategoryList] = useState<CompanyProductCategoryTreeListResponse>([]);
  // 分类 loading
  const [categoryLoading, setCategoryLoading] = useState(false);
  // 类别回显数据
  const [typeActionOption, setTypeActionOption] = useState([]);
  // 品牌回显数据
  const [brandActionOption, setBrandActionOption] = useState([]);

  // 圖片上傳參數
  const uploadProps = {
    name: 'multipartFile',
    showUploadList: false,
    beforeUpload: async (file: RcFile) => {
      const beforeUploadStatus = await asyncBeforeUpload(file);
      setLoading(beforeUploadStatus);
      return beforeUploadStatus;
    },
    customRequest: ({ data, file, filename }: UploadRequestOption) => {
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key] as string | Blob);
        });
      }
      formData.append(filename || 'file', file);
      formData.append('module', UPLOADMODULE.PRODUCT);

      merchantApi
        .postFileUploadPublic(formData as any)
        .then((response) => {
          setLoading(false);
          if (response.success && response.data) {
            setPictureList((prePictureList: PictureProps[]) => {
              const newPictureList = [...prePictureList, response.data];
              fileList.current = newPictureList;
              pageChangeValue();
              return newPictureList;
            });
          }
        })
        .catch(() => {
          setLoading(false);
        });
    },
  };

  // 刪除圖片
  const removePicture = (index: number) => {
    setPictureList((prePictureList: PictureProps[]) => {
      const newPictureList = prePictureList.filter((_, i: number) => index != i);
      fileList.current = newPictureList;
      return newPictureList;
    });
  };

  // 初始化数据回填 -- 编辑功能
  const setInitData = (data: any) => {
    const { imgs, typeActionOption: typeList, brandActionOption: brandList } = data;
    setPictureList(imgs);
    setTypeActionOption(typeList);
    setBrandActionOption(brandList);
    fileList.current = imgs;
  };

  useImperativeHandle(ref, () => ({
    setInitData,
  }));

  // 获取商品分类数据，下拉框
  const getCompanyProductCategoryTreeList = () => {
    setCategoryLoading(true);
    merchantApi
      .getCompanyProductCategoryTreeList({ state: '1' })
      .then((reslut) => {
        setCategoryLoading(false);
        setCategoryList(reslut.data);
      })
      .catch(() => {
        setCategoryLoading(false);
      });
  };

  useEffect(() => {
    getCompanyProductCategoryTreeList();
  }, []);

  return (
    <div className={styles.wrapper} id={mapHashAnchor.ANCHOR_COMMODITY_INFO}>
      <Card className={styles.productInformation} bordered={false} bodyStyle={{ paddingBottom: 0 }}>
        <div className={styles.columnTitle}>
          {getMessage('commodity.addProduct.commodity.information', '商品資料')}
        </div>
        <div className={styles.selectPictureContainer}>
          <div className={styles.selectPictureLabel}>
            <span>{getMessage('common.picture', '圖片')}</span>
            <Tooltip
              title={getMessage(
                'commodity.addProduct.picture.tips',
                '支持 JPG 、PNG ,最多10張，單張 2 M 內，推薦分辨率為 3:4 或 1:1',
              )}
              overlayInnerStyle={{ fontSize: '14px' }}
              overlayStyle={{ maxWidth: 'none' }}
            >
              <img className={styles.questions} src={questions} alt="" />
            </Tooltip>
          </div>
          <div className={styles.selectPictureContent}>
            <div className={styles.productList}>
              {pictureList?.map((item, index) => (
                <div key={item.fileUrl} className={styles.productItem}>
                  <Image
                    className={styles.productPicture}
                    src={item.fileUrl}
                    height={60}
                    preview={{
                      mask: <EyeOutlined />,
                    }}
                  />
                  <img
                    className={styles.productRemove}
                    src={productRemove}
                    alt=""
                    onClick={() => removePicture(index)}
                  />
                </div>
              ))}
            </div>
            {pictureList.length < MAX_PICTURE_COUNT && (
              <Upload {...uploadProps}>
                <div className={styles.addPicture}>
                  {loading ? (
                    <Spin spinning indicator={antIcon} />
                  ) : (
                    <img className={styles.addIcon} src={addIcon} alt="" />
                  )}
                  <div className={styles.addText}>{getMessage('common.new.add', '新增')}</div>
                </div>
              </Upload>
            )}
          </div>
        </div>
        <div className={styles.formProductWrapper}>
          <Form
            form={refForm}
            layout="vertical"
            autoComplete="off"
            onValuesChange={() => pageChangeValue()}
          >
            <div className={styles.formRows}>
              <div className={styles.formItem}>
                <Form.Item
                  name="productName"
                  label={
                    <div className={styles.itemLabel}>{getMessage('common.name', '名稱')}</div>
                  }
                  rules={[
                    {
                      required: true,
                      message: getMessage('common.placeholder', '請輸入'),
                    },
                  ]}
                >
                  <Input
                    maxLength={settings.skuOptionNameMaxLength}
                    className={styles.inputWidth}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
              <div className={styles.formItem}>
                <Form.Item
                  name="companyProductTypeId"
                  label={
                    <div className={styles.customLabel}>
                      {getMessage('commodity.addProduct.category', '類别')}
                      <span className={styles.description}>
                        ({getMessage('common.single.choice', '單選')})
                      </span>
                    </div>
                  }
                >
                  <PaginationSelect
                    className={styles.inputWidth}
                    next={merchantApi.getCompanyProductTypePage}
                    config={{
                      valueKey: 'companyProductTypeId',
                      labelKey: 'typeName',
                      searchKey: 'typeName',
                      placeholder: getMessage('common.please.select', '請選擇'),
                      defaultParams: { state: 1 },
                      activeOption: typeActionOption,
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={styles.formRows}>
              <div className={styles.formItem}>
                <Form.Item
                  name="productCategoryList"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.classification', '分類')}
                      <span className={styles.description}>
                        ({getMessage('common.multiple.choice', '多選')})
                      </span>
                    </div>
                  }
                >
                  <Cascader
                    placeholder={getMessage(
                      'commodity.addProduct.classification.placeholder',
                      '請選擇（多選）',
                    )}
                    multiple
                    className={styles.inputWidth}
                    options={categoryList}
                    fieldNames={{
                      label: 'categoryName',
                      value: 'categoryId',
                      children: 'children',
                    }}
                    maxTagCount="responsive"
                    showCheckedStrategy={SHOW_CHILD}
                    loading={categoryLoading}
                  />
                </Form.Item>
              </div>
              <div className={styles.formItem}>
                <Form.Item
                  name="companyBrandId"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.brand', '品牌')}
                      <span className={styles.description}>
                        ({getMessage('common.single.choice', '單選')})
                      </span>
                    </div>
                  }
                >
                  <PaginationSelect
                    className={classNames([styles.inputWidth, styles.defaultInput])}
                    next={merchantApi.getCompanyBrandPage}
                    config={{
                      valueKey: 'companyBrandId',
                      labelKey: 'brandName',
                      searchKey: 'brandName',
                      placeholder: getMessage(
                        'commodity.addProduct.brand.placeholder',
                        '請選擇（單選）',
                      ),
                      defaultParams: { state: 1 },
                      activeOption: brandActionOption,
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={styles.formRows}>
              <div className={styles.formItem}>
                <Form.Item
                  name="originalPrice"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.original.price', '原價')}
                      <span className={styles.description}>(HKD)</span>
                    </div>
                  }
                  getValueFromEvent={(event) =>
                    verifyNumber(event.target.value, '', {
                      price: settings.priceMaxAmount,
                    })
                  }
                >
                  <Input
                    className={styles.inputWidth}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
              <div className={styles.formItem}>
                <Form.Item
                  name="specialPrice"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.specials', '特價')}
                      <span className={styles.description}>(HKD)</span>
                    </div>
                  }
                  getValueFromEvent={(event) =>
                    verifyNumber(event.target.value, '', {
                      price: settings.priceMaxAmount,
                    })
                  }
                >
                  <Input
                    className={styles.inputWidth}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={styles.formRows}>
              <div className={styles.formItem}>
                <Form.Item
                  name="costPrice"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.cost', '成本')}
                      <span className={styles.description}>(HKD)</span>
                    </div>
                  }
                  getValueFromEvent={(event) =>
                    verifyNumber(event.target.value, '', {
                      price: settings.priceMaxAmount,
                    })
                  }
                >
                  <Input
                    className={styles.inputWidth}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
              <div className={styles.formItem}>
                <Form.Item
                  name="supplier"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.supplier', '供應商')}
                    </div>
                  }
                >
                  <Input
                    className={styles.inputWidth}
                    maxLength={settings.skuOptionNameMaxLength}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
            </div>
            <div className={styles.formRows}>
              <div className={styles.formItem}>
                <Form.Item
                  name="skuCode"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.sku.no', 'SKU編號')}
                    </div>
                  }
                  rules={[
                    {
                      pattern: SKU_CODE,
                      message: getMessage(
                        'application.feedback.incorrectinputformat',
                        '輸入格式不正確',
                      ),
                    },
                  ]}
                >
                  <Input
                    className={styles.inputWidth}
                    maxLength={settings.skuOptionNameMaxLength}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
              <div className={styles.formItem}>
                <Form.Item
                  name="barCode"
                  label={
                    <div className={classNames([styles.itemLabel, styles.ml10])}>
                      {getMessage('commodity.addProduct.barcode.no', '條碼編號')}
                      <span className={styles.description}>(Barcode)</span>
                    </div>
                  }
                  rules={[
                    {
                      pattern: SKU_CODE,
                      message: getMessage(
                        'application.feedback.incorrectinputformat',
                        '輸入格式不正確',
                      ),
                    },
                  ]}
                >
                  <Input
                    className={styles.inputWidth}
                    maxLength={settings.skuOptionNameMaxLength}
                    placeholder={getMessage('common.placeholder', '請輸入')}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
});

export default CommodityInfo;
