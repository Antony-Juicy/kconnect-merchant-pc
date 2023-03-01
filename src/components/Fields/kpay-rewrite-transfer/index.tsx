import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
// import { useBoolean } from 'ahooks';
import { Button, Checkbox, message, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import cx from 'classnames';
import _ from 'lodash';
import { Input } from '../index';
import { isEmptyUtils } from '@/utils/utils';
// import Style from '../kpay-transfer/index.less';
import Style from './index.less';
import './index.less';
import type { ArgsProps } from 'antd/lib/message';
import useLocale from '@/hooks/useLocale';

export type TransferItem = {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
};

export type TKpayTransfer<T = TransferItem> = {
  dataSource: T[];
  targetKeys: string[];
  setTargetKeys: React.Dispatch<React.SetStateAction<string[]>>;
  /** 已选为空的提示语 */
  targetEmptyText: string;
  /** 选择为空的提示语 */
  selectEmptyText: string;
  /** 选择为空的提示语 */
  searchEmptyText: string;
  /** 回显数据 */
  setSelectedItem?: (data: T[]) => void;
  /** 最大可選擇數量 */
  maxSelectedCount?: number;
  /** 最大可選擇數量 */
  maxSelectedMsg?: React.ReactNode | ArgsProps;
  /** 字段映射 */
  keyMap?: {
    key: string;
    title: string;
    description?: string;
    disabled?: string;
  };
};
const KpayRewriteTransfer = <T,>(props: TKpayTransfer<T>) => {
  const { getMessage } = useLocale();

  // 所有類別的列表
  const [categoryData, setCategoryData] = useState<any[]>([]);
  // 可以選擇的keys的集合
  const [canSelectList, setCanSelectList] = useState<any[]>([]);
  // 搜索值
  const [searchValue, setSearchValue] = useState<string>('');
  // 類別搜索结果
  const [searchResult, setSearchResult] = useState<any[]>([]);
  // 全選
  const [checkAll, setCheckAll] = useState(false);
  // 搜索值全選
  const [searchCheckAll, setSearchCheckAll] = useState(false);
  // 已选的类别的id集合
  const [selectRowKeys, setSelectRowKeys] = useState<any[]>([]);
  // 已选的类别的数据，用于回显已选内容
  const [selectItems, setSelectItems] = useState<any[]>([]);

  // 處理傳入數組映射
  const mapKeyExecute = (name: string) => {
    return props.keyMap?.[name] ?? name;
  };

  // 与父组件同步数据
  const SyncMethod = (transferTemp: string[], seletTemp: T[]) => {
    props.setTargetKeys(transferTemp);
    props.setSelectedItem?.(seletTemp);
  };

  const search = _.debounce((e: FormEvent<HTMLInputElement>) => {
    setSearchValue((e.target as HTMLInputElement).value);
    if (
      (e.target as HTMLInputElement).value &&
      (e.target as HTMLInputElement).value !== searchValue
    ) {
      const filterResult = categoryData.filter((item: any) => {
        if (item[mapKeyExecute('title')]) {
          return (item[mapKeyExecute('title')] as string).includes(
            (e.target as HTMLInputElement).value,
          );
        }
        return false;
      });
      const filterSelectKeys: any[] = [];
      filterResult.map((i: any) => {
        filterSelectKeys.push(i[mapKeyExecute('key')]);
      });
      //通过搜索栏筛选结果的情况下，判断是否需要勾上全选的checkbox
      //filterSelectKeys 是筛选情况下左边内容的key数组，selectRowKeys 是已选择的key的集合，通过 _.difference 判断是否属于全选状态
      setSearchCheckAll(0 === _.difference(filterSelectKeys, selectRowKeys).length);
      setSearchResult(filterResult);
    }
  }, 300);

  // 單選
  const selectChange = (e: CheckboxChangeEvent) => {
    const selectList = searchValue ? _.map(searchResult, mapKeyExecute('key')) : canSelectList;

    // 左面的数据
    const transferTemp = [...selectRowKeys];
    // 右面的数据
    const seletTemp = [...selectItems];
    // console.log('before splice: ', seletTemp, transferTemp)
    if ((e as CheckboxChangeEvent).target.checked) {
      // 选中时，添加操作
      categoryData.map((o: any, i: number) => {
        if (o[mapKeyExecute('key')] === (e as CheckboxChangeEvent).target.value) {
          seletTemp.splice(i, 0, o);
          // transferTemp.splice(i, 0, o.key)
          transferTemp.unshift(o[mapKeyExecute('key')]);
        }
      });
    } else {
      // 取消选中时，删除操作
      selectItems.map((item: any, deleteIndex: number) => {
        if ((e as CheckboxChangeEvent).target.value === item[mapKeyExecute('key')]) {
          // transferTemp.splice(deleteIndex, 1)
          const indexOfKey = selectRowKeys.indexOf(item[mapKeyExecute('key')]);
          if (indexOfKey > -1) {
            transferTemp.splice(indexOfKey, 1);
          }
          seletTemp.splice(deleteIndex, 1);
        }
      });
    }
    // console.log('after splice: ', seletTemp, transferTemp)
    const uniqSelectTemp = _.uniq(seletTemp);
    const uniqTransferTemp = _.uniq(transferTemp);
    if (props?.maxSelectedCount) {
      // 處理最大選擇數量
      if (uniqTransferTemp.length > props?.maxSelectedCount) {
        message.error(props?.maxSelectedMsg ?? getMessage('common.execute.failure', '處理失敗'));
        return false;
      }
    }

    setSelectItems(_.uniq(uniqSelectTemp));
    setSelectRowKeys(_.uniq(uniqTransferTemp));
    SyncMethod(uniqTransferTemp, uniqSelectTemp);
    if (searchValue) {
      setSearchCheckAll(
        (selectList || []).length === (transferTemp || []).length &&
          (selectList || []).length !== 0,
      );
    } else {
      setCheckAll(
        (selectList || []).length === (transferTemp || []).length &&
          (selectList || []).length !== 0,
      );
    }
  };

  // 多选框组全選
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const selectList = searchValue
      ? _.map(searchResult, `${mapKeyExecute('key')}`)
      : _.map(categoryData, `${mapKeyExecute('key')}`);

    let transferTemp = [...selectRowKeys, ...(e.target.checked ? selectList : [])];
    if (e.target.checked) {
      transferTemp = [...selectRowKeys, ...selectList];
    } else {
      transferTemp = _.difference(selectRowKeys, selectList);
    }
    transferTemp = _.uniq(transferTemp);

    const allSelectData = searchValue ? searchResult : categoryData;
    let selectTemp = [...selectItems, ...(e.target.checked ? allSelectData : [])];
    if (e.target.checked) {
      selectTemp = [...selectItems, ...allSelectData];
    } else {
      selectTemp = _.difference(selectItems, allSelectData);
    }
    selectTemp = _.uniq(selectTemp);

    if (props?.maxSelectedCount) {
      // 處理最大選擇數量
      if (transferTemp.length > props?.maxSelectedCount) {
        message.error(props?.maxSelectedMsg ?? getMessage('common.execute.failure', '處理失敗'));
        return false;
      }
    }

    if (searchValue) {
      setSearchCheckAll(e.target.checked);
    } else {
      setCheckAll(e.target.checked);
      if (!e.target.checked) {
        setSearchCheckAll(e.target.checked);
      }
    }
    setSelectRowKeys(transferTemp);
    setSelectItems(selectTemp);
    SyncMethod(transferTemp, selectTemp);
  };

  // 類別列表生成
  const renderLeftList = (list?: any) => {
    const renderList = list || categoryData;
    if (renderList && renderList.length > 0) {
      return renderList.map((item: any) => {
        return (
          <div
            key={item[mapKeyExecute('key')]}
            className={cx(Style.kpayTransferCheckbox, Style.kpayTransferPerson)}
          >
            {
              <Checkbox
                value={item[mapKeyExecute('key')]}
                checked={(selectRowKeys || []).includes(`${item[mapKeyExecute('key')]}`)}
                onChange={(e: CheckboxChangeEvent) => {
                  selectChange(e);
                }}
              >
                <div className={Style.kpayTransferCheckboxLabel}>
                  <div className={Style.kpayTransferPersonName}>
                    <Tooltip placement="topLeft" overlay={item.name} zIndex={500001}>
                      <span>{item[mapKeyExecute('title')]}</span>
                    </Tooltip>
                  </div>
                </div>
              </Checkbox>
            }
          </div>
        );
      });
    }
    return <></>;
  };

  // 删除穿梭框
  const deleteTransferItem = (item: any, index: number) => {
    const transferTemp = [...selectRowKeys];
    const selectTemp = [...selectItems];
    transferTemp.splice(selectRowKeys.indexOf(item[mapKeyExecute('key')]), 1);
    selectTemp.splice(index, 1);

    const selectList = searchValue ? _.map(searchResult, mapKeyExecute('key')) : canSelectList;
    if (searchValue) {
      setSearchCheckAll(
        (selectList || []).length === (transferTemp || []).length &&
          (selectList || []).length !== 0,
      );
    } else {
      setCheckAll(
        (selectList || []).length === (transferTemp || []).length &&
          (selectList || []).length !== 0,
      );
    }

    setSelectRowKeys(transferTemp);
    setSelectItems(selectTemp);
    SyncMethod(transferTemp, selectTemp);
  };

  useEffect(() => {
    if (props.dataSource?.length === 0) {
      return;
    }
    setCategoryData(props.dataSource ?? []);
    setCanSelectList(_.map(props.dataSource, mapKeyExecute('key')));
    setSelectRowKeys(props.targetKeys);
    const initRightContent = props.dataSource?.filter((item: any) =>
      props.targetKeys.includes(item[mapKeyExecute('key')]),
    );
    setSelectItems(initRightContent);
    setCheckAll(
      (_.map(props.dataSource, mapKeyExecute('key')) || []).length ===
        (props.targetKeys || []).length &&
        (_.map(props.dataSource, mapKeyExecute('key')) || []).length !== 0,
    );
  }, [props.dataSource, props.targetKeys]);

  return (
    <div id="J_KpayTransfer" className={Style.kpayTransferWapper}>
      <div>
        <p className={Style.kpayTransferTitle}>選取</p>
        <div className={Style.kpayTransferContent}>
          <Input.TrimInput
            placeholder="搜尋"
            style={{ width: '272px', height: '38px' }}
            allowClear
            className={Style.kpayTransferSearch}
            onChange={(value) => {
              search(value);
            }}
          />
          <div
            className={cx(Style.kpayTransferCheckboxWapper, Style.niceScroll)}
            style={!searchValue ? { display: 'none' } : {}}
          >
            {0 === searchResult.length ? (
              <div className="k-transfer-text-center">
                <span style={{ color: '#AFADAB' }}>{props.searchEmptyText}</span>
              </div>
            ) : (
              <div className={Style.kpayTransferCheckboxGrp}>
                {
                  <Checkbox
                    className={Style.kpayTransferCheckbox}
                    style={{ justifyContent: 'normal' }}
                    checked={searchCheckAll}
                    onChange={onCheckAllChange}
                  >
                    全選
                  </Checkbox>
                }
                {renderLeftList(searchResult)}
              </div>
            )}
          </div>

          <div style={searchValue ? { display: 'none' } : {}}>
            <div className={cx(Style.kpayTransferCheckboxWapper, Style.niceScroll)}>
              {categoryData.length === 0 ? (
                <div className={Style.kpayTransferListEmpty}>
                  <span style={{ color: '#AFADAB' }}>{props.selectEmptyText}</span>
                </div>
              ) : (
                <div className={Style.kpayTransferCheckboxGrp}>
                  {
                    <Checkbox
                      className={Style.kpayTransferCheckbox}
                      style={{ justifyContent: 'normal' }}
                      checked={checkAll}
                      onChange={onCheckAllChange}
                    >
                      全選
                    </Checkbox>
                  }
                  {renderLeftList()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={Style.kpayTransferOperationWapper}>
        <div className={Style.kpayTransferOperation} />
      </div>

      <div>
        <p className={Style.kpayTransferTitle}>已選</p>
        <div className={Style.kpayTransferRightContent}>
          <div
            className={cx(Style.kpayTransferRightWapper, Style.niceScroll)}
            style={{ height: '300px' }}
          >
            {selectItems && selectItems.length > 0 ? (
              selectItems.map((item: any, index: number) => {
                if (!isEmptyUtils(item)) {
                  return (
                    <div className={Style.kpayTransferRightItem} key={item[mapKeyExecute('key')]}>
                      <div className={cx(Style.kpayTransferCheckbox, Style.kpayTransferPerson)}>
                        <div className={Style.kpayTransferCheckboxLabel}>
                          <div>
                            <Tooltip
                              className={Style.kpayTransferPersonName}
                              placement="topLeft"
                              overlay={item[mapKeyExecute('title')]}
                              zIndex={500001}
                            >
                              <span>{item[mapKeyExecute('title')]}</span>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        className={Style.kpayTransferRightBtn}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        onClick={() => {
                          deleteTransferItem(item, index);
                        }}
                      >
                        <CloseOutlined style={{ width: '14px', height: '14px' }} />
                      </Button>
                    </div>
                  );
                }
                return <></>;
              })
            ) : (
              <div className="k-transfer-text-center">
                <span>{props?.targetEmptyText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpayRewriteTransfer;
