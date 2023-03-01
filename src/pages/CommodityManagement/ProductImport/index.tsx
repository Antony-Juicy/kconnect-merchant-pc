import React, { useState, useEffect } from 'react';
import NormalLayout from '@/components/Layout/NormalLayout';
import { Card, Button, Upload, Space, message, Progress, Typography } from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import { history } from 'umi';
import { useBoolean, useRequest } from 'ahooks';
import { KPayTable, KPayImageGroup } from '@/components/Fields';
import { thousands, fixedDigit } from '@/utils/utils';
import { notify } from '@/utils/antdUtils';
import useLocale from '@/hooks/useLocale';
import styles from './index.less';
import { merchantApi } from '@/services';
import type { IApiResponse } from '@/utils/request';
import type {
  ProductImportResponse,
  TemplateDownloadResponse,
  ProductImportTaskInfoResponse,
  ProductImportSuccessListResponse,
  ProductImportErrorListResponse,
  ProductImportErrorExportResponse,
  ProductFileListResponse,
} from '@/services/api';
import { IMPORTTASKSTATE, SALESSTATE } from '@/utils/constants';

const openNewTabs = (url: string, id: string = 'newWindows') => {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('id', id);
  if (!document.getElementById(id)) {
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

const ProductImport: React.FC = () => {
  const { getMessage } = useLocale();
  const [fileList, setFileList] = useState<any[]>([]);
  const [fileUrl, setFileUrl] = useState<string>('');
  //* 上傳按鈕loading
  const [uploading, setUploading] = useState(false);
  //* 表單操作欄按鈕loading
  const [btnLoading, { setTrue: showBtnLoading, setFalse: hideBtnLoading }] = useBoolean(false);
  const [taskId, setTaskId] = useState<any>('');
  const [taskInfo, setTaskInfo] = useState<ProductImportTaskInfoResponse | Record<string, any>>({});
  //* 是否顯示匯入結果表單
  const [successList, { setTrue: showSuccessList, setFalse: hideSuccessList }] = useBoolean(false);
  const [totalSuccess, setTotalSuccess] = useState<number>(0);
  //* 是否顯示錯誤信息列表
  const [errorList, { setTrue: showErrorList, setFalse: hideErrorList }] = useBoolean(false);
  const [totalError, setTotalError] = useState<number>(0);
  //* 商品圖片列表內容
  const [imgData, setImgData] = useState<any[] | null>(null);
  //* 當前分頁頁碼
  const [currentPage, setCurrentPage] = useState<number>(1);

  const renderParagraph = (text: any, rows: number = 2, style: Record<string, any> = {} ) => {
    return (<Typography.Paragraph style={{ minWidth: '80px', ...style }} ellipsis={{ rows, tooltip: true }}>
      {text}
    </Typography.Paragraph>)
  }

  const upLoadProps: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      setFileList([file]);

      return false;
    },
    fileList,
  };

  const uploadFile = async (data: any): Promise<any> => {
    return merchantApi.postProductImport(data);
  };

  const {
    data: resData,
    run,
    cancel,
  } = useRequest(merchantApi.getProductImportTaskInfo, {
    manual: true,
    pollingInterval: 2000,
    onSuccess: () => {
      if (resData && resData.data) {
        setTaskInfo(resData.data);
        switch (resData.data.taskState) {
          case IMPORTTASKSTATE.ERROR:
            notify.error(
              resData.data.responseMessage || getMessage('commodity.import.error', '匯入文件失敗'),
            );
            cancel();
            break;
          case IMPORTTASKSTATE.FAIL:
            setTimeout(() => {
              showErrorList();
            }, 1000);
            cancel();
            break;
          case IMPORTTASKSTATE.SUCCESS:
            setTimeout(() => {
              showSuccessList();
            }, 1000);
            cancel();
            break;
        }
      }
    },
    onError: () => {
      cancel();
    },
  });

  const downLoadTemplateUrl = () => {
    merchantApi
      .postTemplateDownload({})
      .then((res: IApiResponse<TemplateDownloadResponse>) => {
        if (res && res.data) {
          openNewTabs(res.data.fileUrl);
        }
      })
      .catch(() => {
        message.error(getMessage('commodity.getTemplate.fail', '獲取商品模板失敗'));
      });
  };

  const onOk = (type: any) => {
    showBtnLoading();
    if (type === IMPORTTASKSTATE.FAIL) {
      merchantApi
        .getProductImportErrorExport({ importHistoryId: taskId })
        .then((res: IApiResponse<ProductImportErrorExportResponse>) => {
          if (res.data.fileUrl) {
            openNewTabs(res.data.fileUrl);
          }
          hideBtnLoading();
        })
        .catch(() => hideBtnLoading());
    } else {
      merchantApi
        .postProductImportCommit({ importHistoryId: taskId })
        .then(() => {
          hideBtnLoading();
          message.success(getMessage('commodity.import.success', '商品匯入成功'));
          history.push('/main/commodity/list');
        })
        .catch(() => hideBtnLoading());
    }
  };

  const onCancel = () => {
    hideErrorList();
    hideSuccessList();
    setCurrentPage(1);
    setTaskInfo({});
  };

  const handleUpload = () => {
    onCancel();
    const formData = new FormData();
    formData.append('file', fileList[0]);
    setUploading(true);
    uploadFile(formData)
      .then((res: IApiResponse<ProductImportResponse>) => {
        setTaskId(res.data.importHistoryId);
        run();
        setUploading(false);
        setFileList([]);
      })
      .catch((err: any) => {
        console.log('err: ', err);
        setUploading(false);
        setFileList([]);
      });
  };

  //* 查看圖片
  const checkImg = (id: string, url: any) => {
    if (!!!url) {
      return
    }
    const chatDom = document.querySelector('.widget-visible');
    if (!!chatDom) {
      chatDom.classList.add('widget-Chat');
      chatDom.classList.remove('widget-visible');
    }
    merchantApi
      .getProductFileList({ productId: id })
      .then((res: IApiResponse<ProductFileListResponse>) => {
        if (res && res.data) {
          setImgData(res.data);
        }
      })
      .catch(() => {
        message.error(getMessage('commodity.getFileList.fail', '獲取圖片列表失敗'));
      });
  };

  const successColumns = [
    {
      title: getMessage('commodity.fileUrl', '圖片'),
      dataIndex: 'fileUrl',
      width: 80,
      render: (text: any, record: any) => (
        <div className="price-record-img-box" onClick={checkImg.bind(null, record.productId, text)}>
          <KPayImageGroup
            cover={text}
            id="productFileId"
            imgData={imgData ?? []}
            reset={setImgData}
          />
        </div>
      ),
    },
    {
      title: getMessage('commodity.productName', '名稱'),
      dataIndex: 'productName',
      width: 200,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.companyProductTypeName', '類別'),
      dataIndex: 'companyProductTypeName',
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.price', '價格（HKD)'),
      dataIndex: 'price',
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('commodity.productCategoryName', '分類'),
      dataIndex: 'productCategoryName',
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.companyBrandName', '品牌'),
      dataIndex: 'companyBrandName',
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.salesState', '狀態'),
      dataIndex: 'salesState',
      width: 100,
      align: 'center',
      render: (text: any) =>
        text === SALESSTATE.OFFSALE ? (
          <div className={`${styles.stateWrap} ${styles.offSale}`}>
            {getMessage('commodity.offSale', '下架')}
          </div>
        ) : (
          <div className={`${styles.stateWrap} ${styles.onSale}`}>
          {getMessage('commodity.onSale', '上架')}
        </div>
        ),
    },
  ];

  const errColumns = [
    {
      title: getMessage('commodity.import.sheetName', '表名'),
      dataIndex: 'sheetName',
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.import.rowNumber', '行數'),
      dataIndex: 'rowNumber',
      width: 140,
    },
    {
      title: getMessage('commodity.import.errorMessage', '錯誤描述'),
      dataIndex: 'errorMessage',
      render: (text: any) => renderParagraph(text, 2, {color: '#F53F3F'}),
    },
  ];

  return (
    <NormalLayout
      title={getMessage('commodity.import.title', '商品匯入')}
      className={styles.import}
      visible
    >
      <Card className={`${styles.cardItem}`}>
        <div className={styles.optionLabel}>
          {getMessage('commodity.import.file.title', '匯入文件')}
        </div>
        <div className={styles.uploadForm}>
          <Upload {...upLoadProps}>
            <div className={styles.uploadBtnBox}>
              <div
                className={`${styles.uploadFileName} ${
                  fileList[0]?.name ? '' : styles.beforeUpload
                }`}
              >
                {fileList[0]?.name || getMessage('commodity.import.placeholder', '選擇匯入文件')}
              </div>
              <Button className="primary-btn">
                {getMessage('commodity.import.select.file', '選擇文件')}
              </Button>
            </div>
          </Upload>
          <Button
            type="primary"
            className="primary-btn"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 24 }}
          >
            {uploading
              ? getMessage('commodity.import.uploading', '正在處理')
              : getMessage('commodity.import.start.upload', '開始匯入')}
          </Button>
        </div>
        <div className={styles.tips}>
          <Space direction="vertical">
            <p>
              {getMessage('commodity.import.tips.download', '1、點擊下載')}{' '}
              <a onClick={downLoadTemplateUrl}>
                {getMessage('commodity.import.tips.download.fileName', '商品模板.xlsx')}
              </a>
            </p>
            <p>{getMessage('commodity.import.tips.two', '2、在模板中填入商品資料並上傳匯入。')}</p>
          </Space>
        </div>
      </Card>

      <Card
        className={`${styles.cardItem} ${
          [IMPORTTASKSTATE.FAIL, IMPORTTASKSTATE.SUCCESS].includes(taskInfo.taskState) &&
          successList &&
          !errorList
            ? ''
            : styles.progressBox
        }`}
      >
        <div className={styles.optionLabel}>
          <div className={styles.infoBox}>
            <div className={styles.title}>
              {getMessage('commodity.import.result.titile', '匯入結果')}
            </div>
            {IMPORTTASKSTATE.SUCCESS === taskInfo.taskState && successList && (
              <div className={styles.total}>
                {`${getMessage(
                  'commodity.import.total.before',
                  '共匯入',
                )} ${totalSuccess} ${getMessage('commodity.import.total.after', '件商品')}`}
              </div>
            )}
            {IMPORTTASKSTATE.FAIL === taskInfo.taskState && errorList && (
              <div className={styles.total}>
                {`${getMessage(
                  'commodity.import.total.before',
                  '共匯入',
                )} ${totalError} ${getMessage('commodity.import.total.after', '件商品')}`}
              </div>
            )}
          </div>
          {IMPORTTASKSTATE.SUCCESS === taskInfo.taskState && successList && (
            <div className={styles.btnBox}>
              <Space size="middle">
                <Button
                  className="primary-btn"
                  type="primary"
                  onClick={onOk.bind(null, IMPORTTASKSTATE.SUCCESS)}
                  loading={btnLoading}
                >
                  {getMessage('common.confirm', '確認')}
                </Button>
                <Button className="primary-btn" onClick={onCancel}>
                  {getMessage('common.cancel', '取消')}
                </Button>
              </Space>
            </div>
          )}
          {IMPORTTASKSTATE.FAIL === taskInfo.taskState && errorList && (
            <div className={styles.btnBox}>
              <Space size="middle">
                <Button
                  className="primary-btn"
                  type="primary"
                  onClick={onOk.bind(null, IMPORTTASKSTATE.FAIL)}
                  loading={btnLoading}
                >
                  {getMessage('commodity.import.failmessage.export', '匯出')}
                </Button>
                <Button className="primary-btn" onClick={onCancel}>
                  {getMessage('common.cancel', '取消')}
                </Button>
              </Space>
            </div>
          )}
        </div>
        <div className={styles.content}>
          {[IMPORTTASKSTATE.PROCESSING, IMPORTTASKSTATE.SUCCESS, IMPORTTASKSTATE.FAIL].includes(
            taskInfo.taskState,
          ) &&
            !successList &&
            !errorList && (
              <div className={styles.processing}>
                <div className={styles.title}>
                  {getMessage('commodity.import.result.processing', '匯入進度')}
                </div>
                <Progress percent={taskInfo.taskProcess || 0} status="normal" />
              </div>
            )}
          {IMPORTTASKSTATE.SUCCESS === taskInfo.taskState && successList && (
            <KPayTable
              columns={successColumns}
              locale={{
                emptyText: '',
              }}
              scroll={{ x: 'max-content' }}
              columnEmptyText=""
              request={async (params: any) => {
                const { page } = params;
                setCurrentPage(page);
                const res: IApiResponse<ProductImportSuccessListResponse> =
                  await merchantApi.getProductImportSuccessList({
                    importHistoryId: taskId,
                    ...params,
                  });
                if (res.success && res.data) {
                  setTotalSuccess(res.data.totalCount);
                  return {
                    success: true,
                    total: res.data.totalCount,
                    data: res.data.data,
                  };
                }
                return {
                  success: true,
                  data: [],
                };
              }}
              simplePaginationChange={{
                showTotal: (total) => `共 ${total} 件`,
                current: currentPage,
              }}
              search={false}
              toolbar={undefined}
              className={styles.successList}
            />
          )}
          {IMPORTTASKSTATE.FAIL === taskInfo.taskState && errorList && (
            <KPayTable
              columns={errColumns}
              locale={{
                emptyText: '',
              }}
              columnEmptyText=""
              request={async (params: any) => {
                const { page } = params;
                setCurrentPage(page);
                const res: IApiResponse<ProductImportErrorListResponse> =
                  await merchantApi.getProductImportErrorList({
                    importHistoryId: taskId,
                    ...params,
                  });
                if (res.success && res.data) {
                  setTotalError(res.data.productCount);
                  return {
                    success: true,
                    total: res.data.totalCount,
                    data: res.data.data,
                  };
                }
                return {
                  success: true,
                  data: [],
                };
              }}
              simplePaginationChange={{
                showTotal: (total) => `共 ${total} 件`,
                current: currentPage,
              }}
              search={false}
              toolbar={undefined}
              className={styles.errorList}
            />
          )}
        </div>
      </Card>
    </NormalLayout>
  );
};

export default ProductImport;
