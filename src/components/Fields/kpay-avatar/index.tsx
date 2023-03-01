import { getFirstSubStr } from '@/utils/utils';
import type { HTMLAttributes } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import { omit } from 'lodash';
import cx from 'classnames';
import styles from './index.less';

type TKPayAvatar = {
  avatar?: string;
  avatarClass?: string;
  showName?: string;
  inAvatar?: boolean;
  defaultImg?: string;
} & HTMLAttributes<any>;

const KPayAvatar: React.FC<TKPayAvatar> = (props) => {
  const { avatar, defaultImg, showName, inAvatar } = props;
  const $_props = omit(props, 'avatar', 'defaultImg', 'showName', 'inAvatar', 'avatarClass');
  const [kpayAvatar, setKpayAvatar] = useState<string | undefined>('');

  useEffect(() => {
    setKpayAvatar(avatar);
  }, [avatar]);

  if (kpayAvatar) {
    return (
      <img
        {...$_props}
        className={props.avatarClass ? props.avatarClass : styles.head_avatar}
        src={kpayAvatar}
        onError={() => {
          setKpayAvatar(undefined);
        }}
      />
    );
  }
  if (defaultImg) {
    return (
      <img
        {...$_props}
        className={props.avatarClass ? props.avatarClass : styles.head_avatar}
        src={defaultImg}
      />
    );
  }
  if (showName) {
    return (
      <div
        className={cx(styles.kpayAvaterCircle, inAvatar ? styles.kpayAvaterCircleInAvatar : '')}
        {...$_props}
      >
        {getFirstSubStr(showName)}
      </div>
    );
  }
  return <></>;
};

export default KPayAvatar;
