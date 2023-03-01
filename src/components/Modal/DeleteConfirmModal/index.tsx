import warnning from '@/assets/svgs/warnning.svg';
import useLocale from '@/hooks/useLocale';
import type { ModalProps } from 'antd';
import { Button, Modal, Space } from 'antd';
import cx from 'classnames';
import React from 'react';
import Style from './index.less';

export type TDeleteConfirmModal = {
  /**
   * 关闭回调
   */
  closeMethod: () => void;
  confirmMethod: () => void;
  deleteLoading?: boolean;
  referchLoading?: boolean;
  confirmMode?: 'confirm' | 'alert';
  content?: string;
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
      visible={props.open}
      destroyOnClose
      centered
      footer={null}
      closable={false}
      maskClosable={false}
      onOk={onOkHandle}
      onCancel={onClose}
    >
      <div className={Style.confirmDelMember}>
        <img src={warnning} alt="" />
      </div>

      <p className={Style.confirmDelMemberTips}>{props.content}</p>

      {props.confirmMode === 'confirm' ? (
        <Space size={24}>
          <Button
            className={cx(Style.modalBtn, Style.modalCancelBtn)}
            onClick={() => {
              props.closeMethod();
            }}
          >
            {props.cancelText || intl.getMessage('common.cancel', '取消')}
          </Button>
          <Button
            className={cx(Style.modalBtn, Style.modalDangerBtn)}
            loading={props.deleteLoading || false}
            type="primary"
            onClick={() => {
              onOkHandle();
            }}
          >
            {props.okText || intl.getMessage('common.remove', '删除')}
          </Button>
        </Space>
      ) : (
        <Button
          className={cx(Style.modalBtn, Style.modalConfirmBtn)}
          onClick={() => {
            props.closeMethod();
          }}
        >
          {props.okText || intl.getMessage('common.other.determine', '確定')}
        </Button>
      )}
    </Modal>
  );
};

export default DeleteConfirmModal;
