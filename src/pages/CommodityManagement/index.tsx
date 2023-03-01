import React, { useState, useEffect, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import _ from 'lodash';
import NormalLayout from '@/components/Layout/NormalLayout';
import { history } from 'umi';
import { useBoolean } from 'ahooks';
import { Button, Cascader, Select, Space, message, Typography } from 'antd';
import useLocale from '@/hooks/useLocale';
import { KPayTable, KPayImageGroup } from '@/components/Fields';
import { SALESSTATE } from '@/utils/constants';
import { merchantApi } from '@/services';
import type { IApiResponse } from '@/utils/request';
import type {
  ProductPageResponse,
  CompanyProductCategoryTreeListResponse,
  CompanyBrandListResponse,
  ProductFileListResponse,
  ProductExportResponse,
} from '@/services/api';
import { openNewTabs, fixedDigit, thousands } from '@/utils/utils';
import styles from './index.less';
import ExportIcon from '@/assets/svgs/product/export';
import ImportIcon from '@/assets/svgs/product/import';
import plusIcon from '@/assets/svgs/product/plus-outlined.svg';
import SalesStateIcon from '@/assets/svgs/product/salesState';

// import {
//   productPage as mockList,
//   cascaderOptions,
//   selectOptions,
// } from './mock';

const Commodity: React.FC<any> = () => {
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { getMessage } = useLocale();
  //* 當前分頁頁碼
  const [currentPage, setCurrentPage] = useState<number>(1);
  //* 分類查詢下拉選項內容
  const [category, setCategory] = useState<any[]>([]);
  //* 品牌查詢下拉選項內容
  const [options, setOptions] = useState<any[]>([]);
  //* 商品圖片列表內容
  const [imgData, setImgData] = useState<any[] | null>(null);
  //* 批量处理选中的商品
  //* 批量处理选中的会员数据
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  //* 當前全選數據不能單獨取消，即當點擊全選，當前頁面的checkbox點擊無效，需要取消全選才能恢復功能
  const [disableSelect, setDisableSelect] = useState<any[]>([]);

  const [rowOption, { setTrue: showRowOption, setFalse: hideRowOption }] = useBoolean(false);

  //* 底部操作欄
  const [actionBtn, { setTrue: showActionBtn, setFalse: hideActionBtn }] = useBoolean(false);
  //* 批量上架btn loading
  const [onSaleLoading, { setTrue: showOnSaleLoading, setFalse: hideOnSaleLoading }] =
    useBoolean(false);
  //* 批量下架btn loading
  const [offSaleLoading, { setTrue: showOffSaleLoading, setFalse: hideOffSaleLoading }] =
    useBoolean(false);
  //* 品牌select loading
  const [brandLoading, { setTrue: showBrandLoading, setFalse: hideBrandLoading }] =
    useBoolean(false);

  const renderParagraph = (text: any, rows: number = 2, style: Record<string, any> = {}) => {
    return (
      <Typography.Paragraph
        style={{ minWidth: '80px', ...style }}
        ellipsis={{ rows, tooltip: true }}
      >
        {text}
      </Typography.Paragraph>
    );
  };

  //* 勾選切換
  const onSelect = (record: any, selected: boolean) => {
    if (disableSelect.includes(record.productId)) {
      return;
    }
    const temp = [...selectedRowKeys];
    if (selected) {
      temp.push(record.productId);
    } else {
      const index = temp.indexOf(record.productId);
      if (index !== -1) {
        temp.splice(index, 1);
      }
    }
    setSelectedRowKeys([..._.uniq(temp)]);
  };

  //* 全選切換
  const onSelectAll = (selected: boolean, $_selectedRows: any, changeRows: any) => {
    let tempSelectedRowKeys: any = [];
    const ids = _.map(changeRows, 'productId');
    if (selected) {
      tempSelectedRowKeys = selectedRowKeys.concat(ids);
      setDisableSelect(tempSelectedRowKeys);
    } else {
      tempSelectedRowKeys = _.difference(selectedRowKeys, ids);
      setDisableSelect([]);
    }
    setSelectedRowKeys(tempSelectedRowKeys);
  };

  //* 重置選擇
  const resetSelected = () => {
    setSelectedRowKeys([]);
    setDisableSelect([]);
  };

  //* 批量上下架
  const changeSalesState = (state: number) => {
    const params = {
      salesState: state,
      productIdList: selectedRowKeys,
    };
    // return
    if (state === SALESSTATE.ONSALE) {
      showOnSaleLoading();
    } else {
      showOffSaleLoading();
    }
    //todo
    merchantApi
      .postProductModifySalesStateBatch(params)
      .then(() => {
        resetSelected();
        if (tableRef.current) {
          tableRef.current.reload();
        }
        if (state === SALESSTATE.ONSALE) {
          hideOnSaleLoading();
          message.success(getMessage('commodity.all.onSale.success', '批量上架成功'));
        } else {
          hideOffSaleLoading();
          message.success(getMessage('commodity.all.offSale.success', '批量下架成功'));
        }
        hideActionBtn();
        hideRowOption();
        tableRef?.current?.reload();
      })
      .catch(() => {
        hideActionBtn();
        hideRowOption();
        resetSelected();
        if (state === SALESSTATE.ONSALE) {
          hideOnSaleLoading();
        } else {
          hideOffSaleLoading();
        }
        tableRef?.current?.reload();
      });
  };

  const productAdd = () => {
    history.push('/main/commodity/newProduct');
  };

  const productExport = () => {
    const params = formRef?.current?.getFieldsValue();
    if (params.productCategoryName && Array.isArray(params.productCategoryName)) {
      params.productCategoryId = params.productCategoryName[params.productCategoryName.length - 1];
    }
    delete params.productCategoryName;
    merchantApi.postProductExport(params).then((res: IApiResponse<ProductExportResponse>) => {
      if (res && res.data) {
        openNewTabs(res.data.fileUrl);
      }
    });
  };

  const gotoImport = () => {
    history.push('/main/commodity/import');
  };

  const productDetail = (id: any) => {
    if (id) {
      history.push(`/main/commodity/productDetail/${id}`);
    }
  };

  const openRowSelect = () => {
    if (!rowOption) {
      showRowOption();
    } else if (rowOption && selectedRowKeys.length === 0) {
      hideRowOption();
    }
  };

  //* 分類下拉選項
  const getCategoryList = () => {
    merchantApi
      .getCompanyProductCategoryTreeList()
      .then((res: IApiResponse<CompanyProductCategoryTreeListResponse>) => {
        if (res && res.data) {
          setCategory(res.data);
        }
      })
      .catch(() => {
        message.error(getMessage('commodity.getCategoryList.fail', '獲取分類查詢列表失敗'));
      });
  };

  //* 品牌下拉選項
  const getBrandList = () => {
    merchantApi
      .getCompanyBrandList()
      .then((res: IApiResponse<CompanyBrandListResponse>) => {
        if (res && res.data) {
          setOptions(res.data);
        }
        hideBrandLoading();
      })
      .catch(() => {
        message.error(getMessage('commodity.getBrandList.fail', '獲取品牌查詢列表失敗'));
        hideBrandLoading();
      });
  };

  //* 查看圖片
  const checkImg = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string, url: any) => {
    const element = event.target as Element;
    if (element && element.matches('.price-record-img-box,.price-record-img-box *')) {
      // 點擊圖片才調接口
      if (!!!url) {
        return;
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
    }
  };

  const openCascader = (value: boolean) => {
    if (value) {
      getCategoryList();
    }
  };

  const openSelect = () => {
    showBrandLoading();
    getBrandList();
  };

  useEffect(() => {
    getCategoryList();
    getBrandList();
  }, []);

  //选中商品后底部显示操作按钮
  useEffect(() => {
    if (selectedRowKeys.length > 0 && !actionBtn) {
      const chatDom = document.querySelector('.widget-visible');
      if (!!chatDom) {
        chatDom.classList.add('widget-Chat');
        chatDom.classList.remove('widget-visible');
      }
      showActionBtn();
    }
    if (selectedRowKeys.length === 0 && actionBtn) {
      const chatDom = document.querySelector('.widget-Chat');
      if (!!chatDom) {
        chatDom.classList.add('widget-visible');
      }
      hideActionBtn();
    }
  }, [selectedRowKeys]);

  const columns: any[] = [
    {
      title: getMessage('commodity.productCode', '商品編號'),
      dataIndex: 'productCode',
      width: 160,
      search: false,
      fixed: 'left',
    },
    {
      title: getMessage('commodity.fileUrl', '圖片'),
      dataIndex: 'fileUrl',
      search: false,
      width: 80,
      //todo
      render: (text: any, record: any) => (
        <div className="price-record-img-box" onClick={(event) => checkImg(event, record.productId, text)}>
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
      search: false,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.price', '價格（HKD)'),
      dataIndex: 'price',
      width: 110,
      search: false,
      render: (text: number) =>
        renderParagraph(!text && 0 !== text ? '' : thousands(fixedDigit(text)), 1),
    },
    {
      title: getMessage('commodity.productCategoryName', '分類'),
      dataIndex: 'productCategoryName',
      width: 150,
      render: (text: any) => renderParagraph(text),
      renderFormItem: () => {
        return (
          <Cascader
            placeholder={getMessage('commodity.productCategory.placeholder', '請選擇分類')}
            options={category}
            fieldNames={{
              label: 'categoryName',
              value: 'categoryId',
              children: 'children',
            }}
            maxTagCount="responsive"
            showCheckedStrategy={Cascader.SHOW_CHILD}
            changeOnSelect
            onDropdownVisibleChange={openCascader}
            popupClassName={styles.cascader}
          />
        );
      },
    },
    {
      title: getMessage('commodity.companyBrandName', '品牌'),
      dataIndex: 'companyBrandName',
      width: 150,
      search: false,
      render: (text: any) => renderParagraph(text),
    },
    {
      title: getMessage('commodity.companyBrandName', '品牌'),
      dataIndex: 'companyBrandId',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <Select
            placeholder={getMessage('commodity.companyBrand.placeholder', '請選擇品牌')}
            options={options}
            fieldNames={{
              label: 'brandName',
              value: 'companyBrandId',
            }}
            allowClear
            onFocus={openSelect}
            loading={brandLoading}
          />
        );
      },
    },
    {
      title: getMessage('commodity.salesState', '狀態'),
      dataIndex: 'salesState',
      width: 100,
      align: 'center',
      render: (text: any) =>
        text === SALESSTATE.ONSALE ? (
          <div className={`${styles.stateWrap} ${styles.onSale}`}>
            {getMessage('commodity.onSale', '上架')}
          </div>
        ) : (
          <div className={`${styles.stateWrap} ${styles.offSale}`}>
            {getMessage('commodity.offSale', '下架')}
          </div>
        ),
      renderFormItem: () => {
        return (
          <Select
            placeholder={getMessage('commodity.companyBrand.salesState', '請選擇狀態')}
            options={[
              { value: SALESSTATE.ONSALE, label: getMessage('commodity.onSale', '上架') },
              { value: SALESSTATE.OFFSALE, label: getMessage('commodity.offSale', '下架') },
            ]}
            allowClear
          />
        );
      },
    },
  ];

  return (
    <NormalLayout
      visible={false}
      bottomDom={
        actionBtn ? (
          <div className={styles.bottomBox}>
            <div className={styles.text}>
              {getMessage('common.table.selected', '已選取')} &nbsp;
              <span style={{ color: '#FFA21A' }}>{selectedRowKeys.length} &nbsp;</span>
              {getMessage('common.quantifier.data', '條數據')}
            </div>
            <div className={styles.buttonBox}>
              <Button
                loading={offSaleLoading}
                onClick={changeSalesState.bind(null, SALESSTATE.OFFSALE)}
                className="primary-btn"
              >
                {getMessage('commodity.all.offSale', '批量下架')}
              </Button>
              <Button
                loading={onSaleLoading}
                onClick={changeSalesState.bind(null, SALESSTATE.ONSALE)}
                type="primary"
                className="primary-btn"
              >
                {getMessage('commodity.all.onSale', '批量上架')}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <KPayTable
        actionRef={tableRef}
        formRef={formRef}
        columns={columns}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: '',
        }}
        columnEmptyText=""
        request={async (params: any) => {
          const formValues = formRef.current?.getFieldsFormatValue?.();
          if (Object.keys(formValues).length > 0) {
            resetSelected();
          }
          const copyParams = { ...params };
          const { page } = copyParams;
          setCurrentPage(page);
          if (copyParams.productCategoryName && Array.isArray(copyParams.productCategoryName)) {
            copyParams.productCategoryId =
              copyParams.productCategoryName[copyParams.productCategoryName.length - 1];
          }
          delete copyParams.productCategoryName;
          const res: IApiResponse<ProductPageResponse> = await merchantApi.getProductPage({
            ...copyParams,
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
        rowKey="productId"
        search={{
          span: 8,
          // labelWidth: 70,
        }}
        toolbar={{
          actions: [
            <Space key="btnGroup" size="middle">
              <Button
                key="add"
                type="primary"
                className="primary-btn"
                onClick={productAdd}
                icon={<img src={plusIcon} />}
              >
                {getMessage('common.add', '新增')}
              </Button>
              <Button
                key="export"
                className="primary-btn"
                onClick={productExport}
                icon={<ExportIcon />}
              >
                {getMessage('common.export', '匯出')}
              </Button>
              <Button
                key="import"
                className="primary-btn"
                onClick={gotoImport}
                icon={<ImportIcon />}
              >
                {getMessage('common.import', '匯入')}
              </Button>
              <Button
                key="saleState"
                className="primary-btn"
                onClick={openRowSelect}
                disabled={selectedRowKeys.length > 0}
                icon={<SalesStateIcon />}
              >
                {!rowOption
                  ? getMessage('commodity.all.saleState', '批量上下架')
                  : getMessage('common.out', '退出')}
              </Button>
            </Space>,
          ],
        }}
        rowSelection={
          rowOption && {
            selectedRowKeys,
            onSelect,
            onSelectAll,
          }
        }
        tableAlertRender={({ selectedRowKeys: selectedKeys }: any) => (
          <div>
            {getMessage('common.table.selected', '已選取')} &nbsp;
            {selectedKeys.length} &nbsp;
            {getMessage('common.pieces.commodity', '個商品')}
          </div>
        )}
        tableAlertOptionRender={() => (
          <Button
            type="link"
            onClick={() => {
              resetSelected();
            }}
          >
            {getMessage('common.cancel.selected', '取消選取')}
          </Button>
        )}
        simplePaginationChange={{
          showTotal: (total) => `共 ${total} 個`,
          current: currentPage,
        }}
        onRow={(record) => {
          return {
            onClick: (event) => {
              // event.nativeEvent.stopImmediatePropagation();
              //判斷點擊的target是否匹配td，排除觸發其子元素的onlick事件
              const element = event.target as Element;
              if (
                element &&
                !element.matches(
                  '.price-record-img-box,.price-record-img-box *,.ant-image-preview-body,.ant-image-preview-body *',
                )
              ) {
                if (rowOption) {
                  if (disableSelect.includes(record.productId)) {
                    return;
                  }
                  const temp = [...selectedRowKeys];
                  const index = temp.indexOf(record.productId);
                  if (index !== -1) {
                    temp.splice(index, 1);
                  } else {
                    temp.push(record.productId);
                  }
                  setSelectedRowKeys([..._.uniq(temp)]);
                } else {
                  productDetail(record?.productId);
                }
              }
            },
          };
        }}
        headerTitle={getMessage('commodity.productList', '商品列表')}
        className={styles.productList}
      />
    </NormalLayout>
  );
};

export default Commodity;
