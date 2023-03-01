import React, { useState, useRef, useMemo } from 'react';
import styles from './index.less';
import NormalLayout from '@/components/Layout/NormalLayout';
import KPayTable from '@/components/Fields/kpay-table';
import { Input, Button, Form, Upload, Spin, Space, Image } from 'antd';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { CompanyBrandInfoResponse } from '@/services/api';
import closeIcon from '@/assets/images/products/closeIcon.png';
import addIcon from '@/assets/images/products/addIcon.png';
import editIcon from '@/assets/images/products/editIcon.png';
import { checkTypes, transSize, formatUnixTimestamp } from '@/utils/utils';
import { LoadingOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/lib/upload';
import { notify } from '@/utils/antdUtils';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import classNames from 'classnames';
import type { ActionType } from '@ant-design/pro-table';
import settings from '@/utils/settings';
import { CHINESE_REG } from '@/utils/reg';
import plusIcon from '@/assets/svgs/product/plus-outlined.svg';
import failureIcon from '@/assets/svgs/product/err-list-img.svg';
import { UPLOADMODULE } from '@/utils/constants';
import DeleteConfirmModal from '@/components/Modal/DeleteConfirmModal';
import { useBoolean } from 'ahooks';
import { KPayImageGroup } from '@/components/Fields';

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const antIcon = <LoadingOutlined spin />; // 加載圖片loading效果

interface TCheckObjProps {
  maxSize?: number; // 最大上传大小
  mineType?: string[]; // 类型限制数组
  resolution?: [number, number]; // 分辨率數組
}
const checkObj: TCheckObjProps = {
  maxSize: 1,
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

interface PictureProps {
  fileName: string;
  fileUrl: string;
}

const BrandList: React.FC = () => {
  const { getMessage } = useLocale();
  const [form] = Form.useForm();
  const KPayTableRef = useRef<ActionType>();
  // 是否開啓添加蒙版
  const [open, setOpen] = useState(false);
  // 添加圖片loading
  const [loading, setLoading] = useState<boolean>(false);
  // 图片数据
  const [pictureMap, setPictureMap] = useState<PictureProps | null>(null);
  // 品牌详情
  const [brandInfo, setBrandInfo] = useState<CompanyBrandInfoResponse | null>(null);
  // 操作类型枚举
  const [categoryEnum, setCategoryEnum] = useState<'add' | 'edit' | 'detail' | null>(null);
  // 页面laoding
  const [pageLoading, setPageLoading] = useState(false);

  // 按鈕顯示模式
  const [confirmMode, setConfirmMode] = useState<'confirm' | 'alert' | undefined>('confirm');
  // 彈窗顯示内容
  const [content, setContent] = useState<string>('');
  // 顯示刪除彈窗
  const [delConfirm, { setTrue: showDelConfirm, setFalse: hideDelConfirm }] = useBoolean(false);
  // 刪除 loading
  const [deleteLoading, { setTrue: showDeleteLoading, setFalse: hideDeleteLoading }] =
    useBoolean(false);
  // 预览图片列表
  const [imgData, setImgData] = useState<any[] | null>(null);

  const searchColumns = [
    {
      title: getMessage('common.name', '名稱'),
      dataIndex: 'brandName',
      hideInTable: true,
      formItemProps: { colon: false },
      renderFormItem: () => {
        return (
          <Input
            className={styles.inputItem}
            allowClear
            placeholder={getMessage('common.name.placeholder', '請輸入名稱')}
          />
        );
      },
    },
  ];

  const tableColumns = [
    {
      title: getMessage('common.picture', '圖片'),
      dataIndex: 'fileUrl',
      hideInSearch: true,
      render: (text: string, record: any) => {
        return (
          <div
            className="price-record-img-box"
            onClick={(e) => {
              e.nativeEvent.stopPropagation();
              e.stopPropagation();
              setImgData([record]);
            }}
          >
            <KPayImageGroup
              cover={text}
              id="companyBrandId"
              key="fileUrl"
              imgData={imgData ?? []}
              reset={setImgData}
            />
          </div>
        );
      },
    },
    {
      title: getMessage('commodity.common.name', '中文名稱'),
      dataIndex: 'brandName',
      hideInSearch: true,
    },
    {
      title: getMessage('commodity.classification.categoryEnName', '英文名稱'),
      dataIndex: 'brandEnName',
      hideInSearch: true,
    },
    {
      title: getMessage('commodity.classification.modifyTime', '更新時間'),
      dataIndex: 'modifyTime',
      hideInSearch: true,
      render: (value: any) => {
        return <>{formatUnixTimestamp(value)}</>;
      },
    },
    {
      title: getMessage('commodity.brandlist.action.account', '操作賬戶'),
      dataIndex: 'modifyAccountName',
      hideInSearch: true,
    },
  ];

  const columns = [...searchColumns, ...tableColumns];

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
            setPictureMap(response.data);
            form.setFieldValue('fileUrl', response.data.fileUrl);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    },
  };

  const KPayDrawerTitle = useMemo(() => {
    if (categoryEnum == 'add') {
      return getMessage('common.add', '新增');
    } else if (categoryEnum == 'edit') {
      return getMessage('common.editor', '編輯');
    } else if (categoryEnum == 'detail') {
      return getMessage('commodity.brandlist.detail', '品牌詳情');
    }
    return '';
  }, [categoryEnum, getMessage]);

  // 编辑品牌
  const editBrand = () => setCategoryEnum('edit');

  // 关闭抽屉
  const onClose = () => {
    setOpen(false);
    setCategoryEnum(null);
    setBrandInfo(null);
    setPictureMap(null);
    form.resetFields();
  };

  // 点击开启添加品牌面板
  const addBrandDrawer = () => {
    setOpen(true);
    setCategoryEnum('add');
  };

  // 添加品牌 -- 编辑
  const addBrand = async (data: any) => {
    setPageLoading(true);
    const interfaceName =
      categoryEnum == 'add' ? merchantApi.postCompanyBrandAdd : merchantApi.postCompanyBrandModify;
    const params =
      categoryEnum == 'add' ? data : { companyBrandId: brandInfo?.companyBrandId, ...data };
    const tips =
      categoryEnum == 'add'
        ? getMessage('common.new.add.success', '新增成功')
        : getMessage('common.editing.success', '編輯成功');
    interfaceName(params)
      .then(() => {
        setPageLoading(false);
        notify.success(tips);
        onClose();
        KPayTableRef.current?.reload();
      })
      .catch(() => {
        setPageLoading(false);
      });
  };

  // 获取品牌数据 -- 点击详情
  const fetchCompanyBrandInfo = async (companyBrandId: string) => {
    setOpen(true);
    setCategoryEnum('detail');
    setPageLoading(true);
    const result = await merchantApi.getCompanyBrandInfo({ companyBrandId });
    setPageLoading(false);
    setBrandInfo(result.data);
    // 数据回填 -- 编辑表格
    setPictureMap({
      fileName: '',
      fileUrl: result.data.fileUrl,
    });
    form.setFieldsValue({
      brandName: result.data.brandName,
      brandEnName: result.data.brandEnName,
      fileUrl: result.data.fileUrl,
    });
  };

  // 渲染抽屉内容
  const drawerRender = () => {
    if (categoryEnum == 'add' || categoryEnum == 'edit') {
      return (
        <Form {...layout} form={form} onFinish={addBrand}>
          <Form.Item
            name="brandName"
            label={getMessage('commodity.common.name', '中文名稱')}
            rules={[
              {
                required: true,
                message: getMessage('commodity.common.name.placeholder', '請輸入中文名稱'),
              },
            ]}
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage('commodity.common.name.placeholder', '請輸入中文名稱')}
            />
          </Form.Item>
          <Form.Item
            name="brandEnName"
            label={getMessage('commodity.classification.categoryEnName', '英文名稱')}
            getValueFromEvent={(event) => {
              return event?.target?.value?.replace(CHINESE_REG, '');
            }}
          >
            <Input
              maxLength={settings.productNormalMaxLength}
              placeholder={getMessage(
                'commodity.classification.categoryEnName.placeholder',
                '請輸入英文名稱',
              )}
            />
          </Form.Item>
          <Form.Item
            name="fileUrl"
            label={getMessage('commodity.brandlist.upload.pictures', '上載圖片')}
          >
            <div className={styles.uploadContainer}>
              <Upload {...uploadProps}>
                {pictureMap?.fileUrl ? (
                  <div className={styles.updatePicture}>
                    {loading ? (
                      <div className={styles.spinLoading}>
                        <Spin spinning indicator={antIcon} />
                      </div>
                    ) : (
                      <div className={styles.editMask}>
                        <img className={styles.editIcon} src={editIcon} alt="" />
                        <div className={styles.editText}>{getMessage('member.editor', '編輯')}</div>
                      </div>
                    )}
                    <img className={styles.pictureItem} src={pictureMap?.fileUrl} alt="" />
                  </div>
                ) : (
                  <div className={styles.addPicture}>
                    {loading ? (
                      <Spin spinning indicator={antIcon} />
                    ) : (
                      <img className={styles.addIcon} src={addIcon} alt="" />
                    )}
                    <div className={styles.addText}>{getMessage('common.new.add', '新增')}</div>
                  </div>
                )}
              </Upload>
              <span className={styles.pictureTips}>
                {getMessage(
                  'commodity.brandlist.addPicture.descript',
                  '支持 png、jpeg，大小1M，4:3或者1:1',
                )}
              </span>
            </div>
          </Form.Item>
          <div className={styles.btns}>
            <Space size={16} className={styles.spaceBox}>
              <Button onClick={onClose}>{getMessage('members.to.cancel', '取消')}</Button>
              <Button type="primary" htmlType="submit">
                {getMessage('common.confirm', '確認')}
              </Button>
            </Space>
          </div>
        </Form>
      );
    }
    if (categoryEnum == 'detail') {
      return (
        <>
          <div className={styles.operationRecord}>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>{getMessage('commodity.common.name', '中文名稱')}</div>
              <div className={styles.box}>{brandInfo?.brandName}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.classification.categoryEnName', '英文名稱')}
              </div>
              <div className={styles.box}>{brandInfo?.brandEnName}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>{getMessage('common.picture', '圖片')}</div>
              <div className={styles.box}>
                <Image src={brandInfo?.fileUrl} fallback={failureIcon} className={styles.fileUrl} />
              </div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.brandlist.create.account', '創建賬戶')}
              </div>
              <div className={styles.box}>{brandInfo?.createAccountName}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.brandlist.create.time', '創建時間')}
              </div>
              <div className={styles.box}>{formatUnixTimestamp(brandInfo?.createTime || 0)}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.brandlist.action.account', '操作賬戶')}
              </div>
              <div className={styles.box}>{brandInfo?.modifyAccountName}</div>
            </div>
            <div className={classNames([styles.rowsEnpty, styles.resetBorderBottom])}>
              <div className={styles.name}>
                {getMessage('commodity.brandlist.update.account', '更新時間')}
              </div>
              <div className={styles.box}>{formatUnixTimestamp(brandInfo?.modifyTime || 0)}</div>
            </div>
          </div>
          <div className={styles.btnContainer}>
            <Space size={16}>
              <div
                className={classNames([styles.detailBtn, styles.removeBtn])}
                onClick={() => {
                  setContent(getMessage('commodity.brand.remove.tips', '確定刪除該品牌嗎？'));
                  setConfirmMode('confirm');
                  showDelConfirm();
                }}
              >
                {getMessage('common.remove', '刪除')}
              </div>
              <div className={classNames([styles.detailBtn])} onClick={editBrand}>
                {getMessage('member.editor', '編輯')}
              </div>
            </Space>
          </div>
        </>
      );
    }
    return null;
  };

  // 删除品牌
  const removeBrand = () => {
    showDeleteLoading();
    merchantApi
      .postCompanyBrandRemove({ companyBrandId: brandInfo?.companyBrandId || 0 })
      .then((res) => {
        hideDeleteLoading();
        if (res.success) {
          hideDelConfirm();
          notify.success(getMessage('common.remove.success', '删除成功'));
          onClose();
          KPayTableRef.current?.reload();
        }
      })
      .catch(() => {
        hideDeleteLoading();
        hideDelConfirm();
      });
  };

  return (
    <NormalLayout>
      <div className={styles.brandWrapper}>
        <KPayTable
          actionRef={KPayTableRef}
          columns={columns}
          request={async (params: any) => {
            const result = await merchantApi.getCompanyBrandPage(params);
            return {
              data: result.data.data,
              success: true,
              total: result.data.totalCount,
            };
          }}
          headerTitle={getMessage('commodity.brandlist.title', '品牌列表')}
          rowKey="companyBrandId"
          dateFormatter="string"
          toolbar={{
            actions: [
              <Button
                key="add"
                type="primary"
                className="primary-btn"
                onClick={addBrandDrawer}
                icon={<img src={plusIcon} />}
              >
                {getMessage('common.add', '新增')}
              </Button>,
            ],
          }}
          onRow={(record) => ({
            onClick: () => fetchCompanyBrandInfo(record.companyBrandId),
          })}
        />
        <KPayDrawer
          width="430px"
          title={
            <div className={styles.drawerHeader}>
              <span>{KPayDrawerTitle}</span>
              <img onClick={() => onClose()} className={styles.closeIcon} src={closeIcon} alt="" />
            </div>
          }
          placement="right"
          onClose={onClose}
          open={open}
          closable={false}
          destroyOnClose={true}
          maskClosable={categoryEnum == 'detail' ? true : false}
        >
          <Spin spinning={pageLoading}>{drawerRender()}</Spin>

          <DeleteConfirmModal
            open={delConfirm}
            confirmMode={confirmMode}
            content={content}
            deleteLoading={deleteLoading}
            confirmMethod={() => {
              removeBrand();
            }}
            closeMethod={hideDelConfirm}
          />
        </KPayDrawer>
      </div>
    </NormalLayout>
  );
};

export default BrandList;
