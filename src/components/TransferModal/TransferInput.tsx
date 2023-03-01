import React, { useEffect, useState } from 'react';
import type { ModalProps } from 'antd';
import { Button } from 'antd';
import Style from './index.less';
import type { TTransferAysnc } from '.';
import TransferModal from '.';
import closeIcon from '@/assets/svgs/close.svg';
import { PlusOutlined } from '@ant-design/icons';
import { isEmpty, map } from 'lodash';
import { isEmptyUtils } from '../../utils/utils';
import { useModel } from 'umi';

export type TTransferInput = {
  zIndex?: number,
  parentId?: string,
  transferRowKey?: string,
  modelReferch?: () => void,
  transferChildren?: (id?: string) => void,
  transferFetchSearch?: (searchContent?: string) => void,
  modelReferchLoading?: boolean,
  /**
   * 同步穿梭框选择的数据
   */
  aysncTransferData?: TTransferAysnc,
  selectType?: 'onlyDepartment' | 'onlyPerson' | 'underPerson' | 'both',
  isRadio?: boolean,
  modalProps?: ModalProps
}

const TransferInput: React.FC<TTransferInput> = (props) => {
  const { transferList, changeCheckedList } = useModel('useTransferModel');

  const [showTransfer, setShowTransfer] = useState<boolean>(false)
  const [selectMapList, setSelectMapList] = useState<any>({})
  const [selectList, setSelectList] = useState<any[]>([])

  // 同步穿梭框数据
  const aysncData = (data: TTransferAysnc) => {
    setSelectList(data.list || []);
    setSelectMapList(data.keyMap || {});
  }

  // 同步穿梭框数据
  const cancelSelectList = (index: number, id: string) => {
    const listIndex = selectList.indexOf(id);
    if (listIndex !== -1) {
      selectList.splice(listIndex, 1);
      setSelectList([...selectList]);
    }

    changeCheckedList([...selectList], selectMapList);
  }

  useEffect(() => {
    if (transferList && isEmpty(transferList.list) && isEmpty(transferList.keyMap)) {
      setSelectList([]);
      setSelectMapList({});
    }
  }, [transferList])

  useEffect(() => {
    if (props.aysncTransferData) {
      aysncData(props.aysncTransferData)
    }
  }, [props.aysncTransferData])

  return <div className={Style.setSelect}>
    {
      map(selectList, (item, index) => {
        if (index < 2 && item && selectMapList && !isEmptyUtils(selectMapList[item])) {
          return <span className={Style.selectItem}>
            <div style={{ display: 'flex' }}>
              {
                selectMapList[item].formatAccountId ?
                <span className={Style.selectItemName}>{selectMapList[item].name}</span>
                :
                <span className={Style.selectItemName}>{selectMapList[item].companyDepartmentName}</span>
              }
              <img src={closeIcon} className={Style.selectItemIcon} onClick={() => {
                cancelSelectList(index, selectMapList[item].formatAccountId ? selectMapList[item].formatAccountId:selectMapList[item].companyDepartmentId)
              }} />
            </div>
          </span>
        }
        return <></>
      })
    }
    {
      selectList.length > 2 &&
      <span className={Style.selectMoreItem} onClick={() => { setShowTransfer(true) }}>
        ...
      </span>
    }
    <Button className={Style.setAdd} onClick={() => { setShowTransfer(true) }}>
      <PlusOutlined  className={Style.setAddIcon} />
    </Button>

    <TransferModal
      {...props.modalProps}
      visible={showTransfer}
      aysncData={aysncData}
      referchLoading={props.modelReferchLoading}
      closeMethod={() => { setShowTransfer(false) }}
      transferProps={{
        zIndex: props?.zIndex,
        parentId: props?.parentId,
        isRadio: props.isRadio,
        rowKey: props.transferRowKey,
        selectType: props.selectType,
        referch: props.modelReferch,
        transferChildren: props.transferChildren,
        fetchSearch: props.transferFetchSearch,
        // checkedList: selectList
      }}
    />
  </div>;
};

export default TransferInput;
