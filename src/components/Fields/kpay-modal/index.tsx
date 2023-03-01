import React from 'react';
import { Modal, Spin } from 'antd';
import type { ModalProps } from 'antd';
import { omit } from 'lodash';
import closeIcon from '@/assets/svgs/close-no-bg.svg';
import cx from 'classnames';
import styles from './index.less';

type IKPayModal = {
  type?: 'modal' | 'confirm';
  icon?: React.ReactNode;
  btnMiddle?: boolean;
  titleLeft?: boolean;
  loading?: boolean;
} & ModalProps;

const KPayModal: React.FC<IKPayModal> = (props) => {
  const modalProps = omit(props, 'closeIcon', 'title', 'icon');
  const confirmProps = omit(props, 'closeIcon', 'title', 'icon');

  const confirmTitle = () => {
    return (
      <div className={styles.titleNode}>
        {props?.icon && (
          <div className={`${styles.iconBox} ${props?.icon ? styles.mr8 : ''}`}>{props.icon}</div>
        )}
        {props.title ?? null}
      </div>
    );
  };

  // 默认返回
  const defaultReturn = (
    <Modal
      width={520}
      centered
      title={props?.title ?? <div />}
      okText="確認"
      cancelText="取消"
      {...modalProps}
      className={cx(
        styles.baseModal,
        props.btnMiddle ? styles.btnMiddle : '',
        props.titleLeft ? styles.titleLeft : '',
        props.className ?? '',
      )}
      closeIcon={<img src={closeIcon} alt="" className={styles.closeIcon} />}
    >
      {props.loading !== undefined ? (
        <Spin spinning={props.loading}>{props.children}</Spin>
      ) : (
        props.children
      )}
    </Modal>
  );

  switch (props.type) {
    case 'modal':
      return defaultReturn;
    case 'confirm':
      return (
        <Modal
          width={520}
          centered
          okText="確認"
          cancelText="取消"
          title={confirmTitle()}
          {...confirmProps}
          className={cx(
            styles.baseConfirm,
            !props.children ? styles.noChildren : '',
            props.btnMiddle ? styles.btnMiddle : '',
            props.className ?? '',
          )}
          closeIcon={<></>}
          keyboard={false}
          maskClosable={false}
        >
          {props.loading !== undefined ? (
            <Spin spinning={props.loading}>{props.children}</Spin>
          ) : (
            props.children
          )}
        </Modal>
      );
    default:
      return defaultReturn;
  }
};

export default KPayModal;
