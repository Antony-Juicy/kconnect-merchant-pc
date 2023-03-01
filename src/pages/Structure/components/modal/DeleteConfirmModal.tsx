import React from 'react';
import type { ModalProps } from 'antd';
import { Space } from 'antd';
import { Button } from 'antd';
import cx from 'classnames';
import { Modal } from 'antd';
import Style from './index.less';
import useLocale from '@/hooks/useLocale';
import warnning from '@/assets/svgs/warnning.svg';

export type TDeleteConfirmModal = {
  /**
   * 关闭回调
   */
  closeMethod: () => void;
  confirmMethod: () => void;
  deleteLoading?: boolean;
  referchLoading?: boolean;
} & ModalProps;

const DeleteConfirmModal: React.FC<TDeleteConfirmModal> = (props) => {
  const intl = useLocale();

  // 同步穿梭框数据
  const onOkHandle = () => {
    props.confirmMethod();
  };

  const onClose = () => {
    props.closeMethod();
  };

  return (
    <Modal
      className={cx(Style.confirmModal, Style.raduisModal)}
      title={null}
      open={props.open}
      destroyOnClose
      footer={null}
      closable={false}
      maskClosable={false}
      onOk={onOkHandle}
      onCancel={onClose}
    >
      <div className={Style.confirmDelMember}>
        <img src={warnning} alt="" />
      </div>

      <p className={Style.confirmDelMemberTips}>確定刪除該成員嗎？</p>

      <Space size={24}>
        <Button
          className={cx(Style.modalBtn, Style.modalCancelBtn)}
          onClick={() => {
            props.closeMethod();
          }}
        >
          {intl.getMessage('common.cancel', '取消')}
        </Button>
        <Button
          className={cx(Style.modalBtn, Style.modalDangerBtn)}
          loading={props.deleteLoading || false}
          type="primary"
          onClick={() => {
            onOkHandle();
          }}
        >
          {intl.getMessage('common.remove', '删除')}
        </Button>
      </Space>
    </Modal>
  );
};

export default DeleteConfirmModal;
