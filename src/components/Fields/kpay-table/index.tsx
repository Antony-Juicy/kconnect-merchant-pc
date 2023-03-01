import React, { useState } from 'react';
import type { ProTableProps } from '@ant-design/pro-table';
import ProTable, { createIntl } from '@ant-design/pro-table';
import isUndefined from 'lodash/isUndefined';
import { Space } from 'antd';
import { ConfigProvider } from '@ant-design/pro-provider';
import type { TablePaginationConfig } from 'antd';
import { Button } from 'antd';
import useLocale from '@/hooks/useLocale';
import styles from './index.less';

import zhHK from '@/locales/zh-HK/proComponents';

interface IKPayTableProps extends ProTableProps<any, any>, Record<string, any> {
  columns: any[];
  simplePaginationChange?: TablePaginationConfig;
}

/**
 * KpayTable( antd Table拓展, Base on ProTable)
 * @param props
 */
const KPayTable: React.FC<IKPayTableProps> = (props) => {
  const { getMessage } = useLocale();
  const [showSizeChanger, setShowSizeChanger] = useState<boolean>(false);
  const [showQuickJumper, setShowQuickJumper] = useState<boolean>(false);

  let $props = props;

  const zhHKIntl = createIntl('zh-HK', zhHK);

  const defaultSearchSettings: IKPayTableProps['search'] = {
    defaultCollapsed: false,
    span: 8,
    labelWidth: 120,

    className: styles.kTableSearchForm,
    searchText: getMessage('common.search', '搜尋'),
    resetText: getMessage('common.resetFields', '重設'),
    optionRender: (searchConfig, formProps) => {
      return [
        <Space key="option" size="middle">
          <Button
            key="reset"
            className="primary-btn"
            onClick={() => {
              formProps?.form?.resetFields();
              formProps?.form?.submit();
            }}
          >
            {searchConfig.resetText}
          </Button>
          <Button
            key="search"
            type="primary"
            className="primary-btn"
            onClick={() => {
              formProps?.form?.submit();
            }}
          >
            {searchConfig.searchText}
          </Button>
        </Space>,
      ];
    },
  };

  if ($props && !isUndefined($props.search)) {
    if ($props.search) {
      $props = {
        ...$props,
        search: {
          ...defaultSearchSettings,
          ...$props.search,
        },
      };
    }
  } else if ($props) {
    $props = {
      ...$props,
      search: {
        ...defaultSearchSettings,
      },
    };
  }

  return (
    <ConfigProvider
      value={{
        intl: zhHKIntl,
        valueTypeMap: {},
      }}
    >
      <ProTable
        pagination={{
          size: 'default',
          pageSizeOptions: ['10', '20', '50'],
          defaultPageSize: 10,
          showQuickJumper,
          showSizeChanger,
          showTotal: (total) => `共 ${total} 個`,
          position: ['bottomCenter'],
          ...props.simplePaginationChange,
        }}
        columnEmptyText={false}
        options={{ fullScreen: false, reload: false, setting: false, density: false }}
        form={{ colon: false }}
        {...$props}
        request={async (params: any, sort: any, filter: any) => {
          const $_params = Object.assign(params, {
            page: params.current,
            rows: params.pageSize,
            current: undefined,
            pageSize: undefined,
          });
          if ($props.request) {
            const request = await $props.request($_params, sort, filter);
            if (request.total && request.total >= 10) {
              setShowQuickJumper(true);
              setShowSizeChanger(true);
            } else {
              setShowQuickJumper(false);
              setShowSizeChanger(false);
            }
            return request;
          }
          if ($props.data && Array.isArray($props.data)) {
            return {
              data: $props.data,
              success: true,
              total: $props.data.length,
            };
          }

          return {
            data: [],
            success: true,
            total: 0,
          };
        }}
      />
    </ConfigProvider>
  );
};

export default KPayTable;
