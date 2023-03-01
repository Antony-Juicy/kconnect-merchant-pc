import React, { useState, useRef } from 'react';
import { useBoolean } from 'ahooks';
import moment from 'moment';
import NormalLayout from '@/components/Layout/NormalLayout';
import { KPayTable, KPayImageGroup } from '@/components/Fields';
// import StringEllipsis from '@/components/StringEllipsis';
import { fixedDigit, thousands } from '@/utils/utils';
import KPayDrawer from '@/components/Fields/kpay-drawer';
import { Spin, Image, Space, message, Typography } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { IApiResponse } from '@/utils/request';
import type {
  ProductPriceRecordPageResponse,
  ProductPriceRecordInfoResponse,
} from '@/services/api';
import styles from './index.less';
import failureIcon from '@/assets/svgs/product/err-list-img.svg';
import _ from 'lodash';
const PriceRecord: React.FC = () => {
  const { getMessage } = useLocale();
  const tableRef = useRef<ActionType>();
  const [visible, { setTrue: showVisible, setFalse: hideVisible }] = useBoolean(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [drawerLoading, { setTrue: showDrawerLoading, setFalse: hideDrawerLoading }] =
    useBoolean(false);
  const [drawerData, setDrawerData] = useState<ProductPriceRecordInfoResponse | null>(null);

  const renderParagraph = (
    text: any,
    rows: number = 2,
    style: Record<string, any> = {},
  ) => {
    return (
      <Typography.Paragraph
        style={{ minWidth: '80px', ...style }}
        ellipsis={{ rows, tooltip: true }}
      >
        {text}
      </Typography.Paragraph>
    );
  };

  const openDrawer = (record: any) => {
    const chatDom = document.querySelector('.widget-visible');
    if (!!chatDom) {
      chatDom.classList.add('widget-Chat');
      chatDom.classList.remove('widget-visible');
    }
    showDrawerLoading();
    showVisible();
    merchantApi
      .getProductPriceRecordInfo({ productPriceRecordId: record?.productPriceRecordId })
      .then((res: IApiResponse<ProductPriceRecordInfoResponse>) => {
        if (res && res.data) {
          setDrawerData(res.data);
          hideDrawerLoading();
        }
      })
      .catch(() => {
        hideDrawerLoading();
      });
  };

  const onClose = () => {
    setDrawerData(null);
    hideVisible();
    const chatDom = document.querySelector('.widget-Chat');
    if (!!chatDom) {
      chatDom.classList.add('widget-visible');
    }
  };

  const checkImg = (id: string, url: any) => {
    if (!!!url) {
      return;
    }
    const chatDom = document.querySelector('.widget-visible');
    if (!!chatDom) {
      chatDom.classList.add('widget-Chat');
      chatDom.classList.remove('widget-visible');
    }
    merchantApi
      .getProductPriceRecordInfo({ productPriceRecordId: id })
      .then((res: IApiResponse<ProductPriceRecordInfoResponse>) => {
        if (res && res.data) {
          setDrawerData(res.data);
        }
      })
      .catch(() => {
        message.error(getMessage('commodity.price.record.detail.error', '獲取詳情失敗'));
      });
  };

  const columns: any[] = [
    {
      title: getMessage('price.productCode', '商品編號'),
      dataIndex: 'productCode',
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('price.skuCode', 'SKU編號'),
      dataIndex: 'skuCode',
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.fileUrl', '圖片'),
      dataIndex: 'fileUrl',
      search: false,
      width: 80,
      //todo
      render: (text: any, record: any) => (
        <div
          className="price-record-img-box"
          onClick={checkImg.bind(null, record.productPriceRecordId, text)}
        >
          {/* <Image src={text} width={48} height={48} fallback={failureIcon} /> */}
          <KPayImageGroup
            cover={text}
            id="productPriceRecordFileId"
            imgData={drawerData ? drawerData.productPriceRecordFileList : []}
            reset={setDrawerData}
          />
        </div>
      ),
    },
    {
      title: getMessage('price.productName', '名稱'),
      dataIndex: 'productName',
      width: 200,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('price.specs', '款式選項'),
      dataIndex: 'specs',
      search: false,
      width: 150,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('price.originalPrice', '原價（HKD）'),
      dataIndex: 'originalPrice',
      search: false,
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('price.specialPrice', '特價（HKD）'),
      dataIndex: 'specialPrice',
      search: false,
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('price.costPrice', '成本（HKD）'),
      dataIndex: 'costPrice',
      search: false,
      width: 110,
      render: (text: number) => renderParagraph((!text && 0 !== text ) ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('price.createTime', '紀錄時間'),
      dataIndex: 'createTime',
      search: false,
      width: 160,
      render: (text: any) => (text ? moment(Number(text)).format('DD/MM/YYYY HH:mm') : ''),
    },
    {
      title: getMessage('price.createAccountName', '操作賬戶'),
      dataIndex: 'createAccountName',
      search: false,
      width: 180,
      render: (text: any) => renderParagraph(text),
    },
  ];

  return (
    <NormalLayout visible={false}>
      <KPayTable
        className={styles.priceRecordList}
        actionRef={tableRef}
        columns={columns}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: '',
        }}
        columnEmptyText=""
        request={async (params: any) => {
          const { page } = params;
          setCurrentPage(page);
          const res: IApiResponse<ProductPriceRecordPageResponse> =
            await merchantApi.getProductPriceRecordPage({
              ...params,
            });
          if (res.success && res.data) {
            return {
              success: true,
              //* mock
              total: res.data.totalCount,
              data: res.data.data,
              // total: mockList.data.totalCount,
              // data: mockList.data.data
            };
          }
          return {
            success: true,
            data: [],
            //* mock
            // total: mockList.data.totalCount,
            // data: mockList.data.data
          };
        }}
        search={{
          // collapsed,
          // onCollapse: setCollapsed,
          span: 8,
          labelWidth: 70,
        }}
        simplePaginationChange={{
          showTotal: (total) => `共 ${total} 個`,
          current: currentPage,
        }}
        headerTitle={
          <span className={styles.tableTitle}>
            {getMessage('commodity.price.record', '價格紀錄')}
          </span>
        }
        onRow={(record) => {
          return {
            onClick: (event) => {
              const element = event.target as Element;
              if (
                element &&
                !element.matches(
                  '.price-record-img-box,.price-record-img-box *,.ant-image-preview-body,.ant-image-preview-body *',
                )
              ) {
                openDrawer(record);
              }
            },
          };
        }}
      />

      <KPayDrawer
        width={676}
        className={styles.detailDrawer}
        open={visible}
        onClose={onClose}
        title={getMessage('common.view', '詳情')}
      >
        <Spin spinning={drawerLoading}>
          <div className={styles.infoBox}>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('price.productCode', '商品編號')}</div>
              <div className={styles.value}>{renderParagraph(drawerData?.productCode || '', 1)}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('price.skuCode', 'SKU編號')}</div>
              <div className={styles.value}>{renderParagraph(drawerData?.skuCode || '', 1)}</div>
            </div>
            <div className={`${styles.item} ${styles.imgItem}`}>
              <div className={styles.label}>{getMessage('commodity.fileUrl', '圖片')}</div>
              <div className={styles.value}>
                <div className={(drawerData && Array.isArray(drawerData?.productPriceRecordFileList) && drawerData?.productPriceRecordFileList.length > 0) && styles.imgWall}>
                  {drawerData?.productPriceRecordFileList?.length?<Image.PreviewGroup>
                    {Array.isArray(drawerData?.productPriceRecordFileList) &&
                      drawerData?.productPriceRecordFileList.map((item: any) => {
                        return (
                          <Image
                            key={item.fileName}
                            src={item.fileUrl}
                            width={40}
                            height={40}
                            fallback={failureIcon}
                            placeholder={<img src={failureIcon} width={40} height={40} />}
                          />
                        );
                      })}
                  </Image.PreviewGroup>:<img height={40} className={styles.fileUrl} src={failureIcon} width={40} height={40} />}
                </div>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>
                {getMessage('commodity.price.productName', '商品名稱')}
              </div>
              <div className={styles.value}>{renderParagraph(drawerData?.productName || '', 1)}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('price.specs', '款式選項')}</div>
              <div className={styles.value}>{renderParagraph(drawerData?.specs || '', 1)}</div>
            </div>
          </div>

          <div className={styles.tableBox}>
            <table>
              <tr className={styles.tHeader}>
                <th>{getMessage('price.originalPrice', '原價（HKD）')}</th>
                <th>{getMessage('price.specialPrice', '特價（HKD）')}</th>
                <th>{getMessage('price.costPrice', '成本（HKD）')}</th>
              </tr>
              <tr className={styles.tBody}>
                <td>{_.get(drawerData, 'originalPrice', '')}</td>
                <td>{_.get(drawerData, 'specialPrice', '')}</td>
                <td>{_.get(drawerData, 'costPrice', '')}</td>
              </tr>
            </table>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.item}>
              <div className={styles.label}>
                {getMessage('price.createAccountName', '操作賬戶')}
              </div>
              <div className={styles.value}>{renderParagraph(drawerData?.createAccountName || '', 1)}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>{getMessage('price.createTime', '紀錄時間')}</div>
              <div className={styles.value}>
                {drawerData?.createTime
                  ? moment(Number(drawerData.createTime)).format('DD/MM/YYYY HH:mm')
                  : ''}
              </div>
            </div>
          </div>
        </Spin>
      </KPayDrawer>
    </NormalLayout>
  );
};

export default PriceRecord;
