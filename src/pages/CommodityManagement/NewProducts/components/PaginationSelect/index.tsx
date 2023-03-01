import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { useBoolean } from 'ahooks';
import { Select, Spin, Result } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import useLocale from '@/hooks/useLocale';
import { notify } from '@/utils/antdUtils';
import styles from './index.less';

interface optionValues {
  value?: number;
  label?: string;
}

interface configTypes {
  valueKey: string;
  labelKey: string | string[];
  searchKey?: string;
  rows?: number;
  placeholder?: string;
  defaultParams?: { [key: string]: any };
  activeOption?: { [key: string]: any };
  changeItem?: (item: any) => void;
  disabled?: boolean;
  afterOption?: { [key: string]: any };
}

type scrollSelectProps = {
  className: string;
  next: (params?: any, config?: any) => Promise<any>;
  config: configTypes;
  value?: any;
  onChange?: (value: any) => void;
};

const SearchSelector: React.FC<scrollSelectProps> = (props) => {
  const {
    valueKey,
    labelKey,
    searchKey,
    defaultParams,
    placeholder,
    rows = 10,
    activeOption,
    changeItem,
    disabled,
    afterOption,
  } = props.config;
  const { getMessage } = useLocale();
  const [scrolling, { setTrue: setScrollingTrue, setFalse: setScrollingFalse }] = useBoolean(false);
  const [searching, { setTrue: setSearchingTrue, setFalse: setSearchingFalse }] = useBoolean(false);
  const [nameParams, setNameParams] = useState<any>({ rows, page: 1 });
  const [totalCount, setTotalCount] = useState<any>();
  const [nameOptions, setNameOptions] = useState<any>([]);
  const [selectValue, setSelectValue] = useState<any>();

  useEffect(() => {
    if (activeOption?.value) {
      setNameOptions([activeOption]);
    }
  }, [activeOption]);

  const initData = () => {
    setNameParams({ rows, page: 1 });
    setTotalCount(0);
    setNameOptions([]);
    setSelectValue(null);
  };

  // 搜索下拉內容
  const nameSearch = debounce(async (e: string) => {
    setSearchingTrue();
    const params = {
      rows: rows,
      page: 1,
    };
    if (searchKey) {
      params[searchKey] = e;
    }
    if (defaultParams) {
      Object.assign(params, defaultParams);
    }
    await props.next(params).then((res) => {
      setNameParams({ ...params });
      const options: optionValues[] = [];
      if (!!res?.data) {
        const List = res.data?.data;
        setTotalCount(res.data.totalCount);
        List.map((item: any) => {
          let label = '';
          if (typeof labelKey == 'string') {
            label = item[labelKey];
          } else {
            if (labelKey instanceof Array) {
              label = labelKey.map((text) => item[text]).join(' - ');
            }
          }

          options.push({
            ...item,
            value: item[valueKey],
            label: label,
          });
        });
        if (afterOption) {
          options.push(afterOption);
        }
        setNameOptions([...options]);
      } else {
        notify.error(
          getMessage('common.unknownerroroccurpleasetryagainlater', '發生未知錯誤，請稍後重試'),
        );
      }
    });
    setSearchingFalse();
  }, 300);

  // 下拉加载更多
  const scrollSearchMore = async (e: any) => {
    e.persist();
    const target = e.target;
    if (target.scrollTop + target.offsetHeight + 3 >= target.scrollHeight) {
      setScrollingTrue();
      const params = nameParams;
      if (totalCount > params.page * params.rows) {
        params.page++;
        setNameParams(params);
        await props.next(params).then((res) => {
          const options = [...nameOptions];
          if (!!res?.data) {
            const List = res.data?.data;
            setTotalCount(res.data?.totalCount);
            if (afterOption) {
              options.pop();
            }
            List.map((item: any) => {
              let label = '';
              if (typeof labelKey == 'string') {
                label = item[labelKey];
              } else {
                if (labelKey instanceof Array) {
                  label = labelKey.map((text) => item[text]).join(' - ');
                }
              }

              options.push({
                ...item,
                value: item[valueKey],
                label: label,
              });
            });
            if (afterOption) {
              options.push(afterOption);
            }
            setNameOptions([...options]);
          } else {
            notify.error(
              getMessage('common.unknownerroroccurpleasetryagainlater', '發生未知錯誤，請稍後重試'),
            );
          }
        });
      }
      setScrollingFalse();
    }
  };

  const selectOnChange = (newValue: any) => {
    setSelectValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <Select
      className={props.className}
      showSearch={searchKey ? true : undefined}
      disabled={disabled}
      allowClear
      loading={scrolling}
      placeholder={placeholder ?? ''}
      notFoundContent={
        searching ? (
          <Spin size="small" className={styles.defaultContent} />
        ) : (
          <Result
            className={styles.notFoundContent}
            icon={<FileSearchOutlined className={styles.notFoundIcon} />}
            subTitle={
              <span className={styles.antResultSubtitle}>
                {getMessage('common.no.data.available', '暫無數據')}
              </span>
            }
          />
        )
      }
      value={props.value || selectValue}
      onChange={(value: any) => {
        selectOnChange(value);
        if (changeItem) {
          const OptionItem = nameOptions.find((item: any) => item.value == value);
          changeItem(OptionItem);
        }
      }}
      // onClear={() => nameSearch('')}
      onPopupScroll={(e) => {
        scrollSearchMore(e);
      }}
      onSearch={searchKey ? nameSearch : undefined}
      onBlur={() => initData()}
      onFocus={() => nameSearch('')}
      optionFilterProp="children"
    >
      {!!nameOptions &&
        nameOptions.map((item: any) => {
          if (!!item.value && !!item.label) {
            return (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            );
          }
          return null;
        })}
    </Select>
  );
};

export default SearchSelector;
