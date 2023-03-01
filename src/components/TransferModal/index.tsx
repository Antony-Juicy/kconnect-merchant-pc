import React, { useEffect, useState } from 'react';
import type { ModalProps} from 'antd';
import { Spin } from 'antd';
import { Modal } from 'antd';
import Style from './index.less';
import { KPayTransfer } from '../Fields';
import { useModel } from 'umi';
import { useBoolean } from 'ahooks';
import { merchantApi } from '@/services';
import type { CompanyDepartmentRootResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { keyBy } from 'lodash';

export type TTransferAysnc = {
  /**
   * 选中的Key List
   */
  list: string[],
  /**
   * 数据的Key数组
   */
  keyMap: Record<string, any>
}

export type TTransferModal = {
  /**
   * 关闭回调
   */
  closeMethod: () => void,
  /**
   * 同步穿梭框选择的数据
   */
  aysncData: (data: TTransferAysnc) => void,
  // Transfer
  transferProps: {
    zIndex?: number,
    rowKey?: string,
    selectType?: 'onlyDepartment' | 'onlyPerson' | 'underPerson' | 'both',
    // 是否單選模式
    isRadio?: boolean,
    parentId?: string,
    transferChildren?: (id?: string) => void,
    fetchSearch?: (searchContent?: string) => void,
    /**
     * 刷新数据
     */
    referch?: () => void
    // checkedList: string[]
  },
  /**
   * 刷新数据loading
   */
  referchLoading?: boolean
} & ModalProps

const TransferModal: React.FC<TTransferModal> = (props) => {
  const { transferList } = useModel('useTransferModel');

  const { changeCheckedList, changeOriginTransferList, originTransferList } = useModel('useTransferModel', (model: any) => (
    {
      originTransferList: model.originTransferList,
      changeCheckedList: model.changeCheckedList,
      changeOriginTransferList: model.changeOriginTransferList,
    }
  ));


  // 同步穿梭框数据
  const onOkHandle = () => {
    changeOriginTransferList({ ...transferList })

    if (props.aysncData) {
      props.aysncData(transferList)
    }

    props.closeMethod()
  }

  // 同步穿梭框数据
  const onClose = () => {
    changeCheckedList(originTransferList.list, originTransferList.keyMap)

    if (props.aysncData) {
      props.aysncData(originTransferList)
    }

    props.closeMethod()
  }

  return <Modal
    title={props.title}
    visible={props.visible}
    destroyOnClose
    width="828px"
    className={Style.raduisModal}
    onOk={onOkHandle}
    onCancel={onClose}
    zIndex={props?.transferProps?.zIndex || 1000}
  >
    <Spin spinning={props.referchLoading || false}>
      <KPayTransfer
        rowKey={(props.transferProps || {}).rowKey}
        isRadio={(props.transferProps || {}).isRadio}
        transferLoading={!!props.referchLoading}
        transferInitData={!!(props.visible)}
        selectType={(props.transferProps || {}).selectType}
        transferReferch={(props.transferProps || {}).referch}
        transferChildren={(props.transferProps || {}).transferChildren}
        transferSearch={(props.transferProps || {}).fetchSearch}
        // checkedList={(props.transferProps || {}).checkedList}
      />
    </Spin>
  </Modal>;
};

export default TransferModal;
