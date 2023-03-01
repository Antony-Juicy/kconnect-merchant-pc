import React from 'react';
import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import closeIcon from '@/assets/svgs/close-no-bg.svg';
import cx from 'classnames';
import './index.less';

export type KPayDrawerProps<T = any> = {
  closeCb?: (data?: T) => void;
} & DrawerProps;

const KPayDrawer: React.FC<KPayDrawerProps> = (props) => {
  return (
    <Drawer
      onClose={() => {
        props?.closeCb?.();
      }}
      {...props}
      destroyOnClose
      className={cx('kapy-drawer', props.className ?? '')}
      closeIcon={<img src={closeIcon} alt="" className="kapy-drawer-close-Icon" />}
    >
      {props?.children}
    </Drawer>
  );
};

export default KPayDrawer;
