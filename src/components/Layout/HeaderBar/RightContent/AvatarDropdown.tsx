import HeaderDropdown from '@/components/HeaderDropdown';
import { merchantApi } from '@/services';
import type { AuthorizationCmsResponse } from '@/services/api';
import { GROUPMANAGER } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Avatar, Menu, Modal, Spin } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { history, useModel } from 'umi';
// import avatar from '@/assets/svgs/avatar.svg';
import LogoutIcon from '@/assets/images/common/logout.png';
import userInfoIcon from '@/assets/images/common/userInfo.png';
import helpCenter from '@/assets/svgs/menus/helpCenter.svg';
import Style from '../index.less';
import styles from './index.less';

// import platformIcon from '@/assets/images/common/platformIcon.png';
import warningIcon from '@/assets/images/common/warning.png';
import KPayAvatar from '@/components/Fields/kpay-avatar';
import useLocale from '@/hooks/useLocale';
import { gotoLogin } from '@/utils/antdUtils';
import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const { query = {}, search, pathname } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    gotoLogin('replace', {
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({}) => {
  const { getMessage } = useLocale();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [modalVisiable, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [authLoad, { setTrue: showAuthLoad, setFalse: hideAuthLoad }] = useBoolean(false);

  const onMenuClick = useCallback(
    (e: MenuInfo) => {
      const { key } = e;
      if (key === 'logout') {
        event(BuriedPoint.KC_MERFILE_LOGOUT_TAPPED);
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        loginOut();
        return;
      } else if (key === 'helpCenter') {
        event(BuriedPoint.KC_MERFILE_HELPCTR_TAPPED);
        history.push(`/others/center`);
      } else if (key === 'platform') {
        if (
          initialState?.currentUser?.companyId &&
          initialState?.currentUser?.groupManager &&
          GROUPMANAGER.NO_ADMIN !== initialState?.currentUser?.groupManager
        ) {
          showAuthLoad();
          merchantApi
            .getAuthorizationCms({
              companyId: initialState.currentUser.companyId.toString(),
            })
            .then((res: IApiResponse<AuthorizationCmsResponse>) => {
              hideAuthLoad();
              if (res.success && res.data && res.data.redirectUri) {
                window.open(
                  `${res.data.redirectUri}&companyId=${initialState?.currentUser?.companyId}`,
                );
              }
            })
            .catch(() => {
              hideAuthLoad();
            });
        } else {
          showModal();
        }
        return;
      } else {
        history.push(`/profile`);
      }
    },
    [setInitialState, showModal, showAuthLoad, hideAuthLoad, initialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item key="account">
        <img src={userInfoIcon} alt="" />
        {getMessage('header.myaccount', '我的賬户')}
      </Menu.Item>
      <Menu.Item key="helpCenter">
        <img src={helpCenter} alt="" />
        {getMessage('header.helpcenter', '幫助中心')}
      </Menu.Item>

      {/* <Menu.Item key="platform">
        <img src={platformIcon} alt="" />
        後台管理
      </Menu.Item> */}

      <Menu.Item key="logout">
        <img src={LogoutIcon} alt="" />
        {getMessage('header.logout', '登出')}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <HeaderDropdown placement="bottomRight" overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size="small"
            className={styles.avatar}
            icon={
              <KPayAvatar
                avatarClass="initial"
                className={styles.defaultAvatar}
                inAvatar
                avatar={currentUser?.avatar}
                showName={currentUser?.name}
              />
            }
            alt="avatar"
          />
          <span className={`${styles.name}`}>{currentUser.name}</span>
          <div className={Style.triangleWapper}>
            <span className={Style.invertedTriangle} />
          </div>
        </span>
      </HeaderDropdown>

      <Modal
        wrapClassName={styles.confirmModal}
        closeIcon={null}
        title={null}
        maskClosable={false}
        footer={null}
        open={modalVisiable}
        onOk={hideModal}
        onCancel={hideModal}
      >
        <img src={warningIcon} alt="" className={styles.success} />
        <div className={styles.bigTxt}>
          {getMessage('header.youcurrentlyhavenopermissiontologintobg', '你目前沒有權限登入後台')}
        </div>
        <div className={styles.subTxt}>
          {getMessage(
            'header.unabletologintobgpleasecontactbgadmin',
            '無法登入後台，請聯絡後台管理員',
          )}
        </div>
        <div onClick={hideModal} className={styles.confirm}>
          {getMessage('common.other.determine', '確定')}
        </div>
      </Modal>

      {authLoad && (
        <div className={styles.mask}>
          <span className={styles.spinBox}>
            <Spin size="large" />
          </span>
        </div>
      )}
    </>
  );
};

export default AvatarDropdown;
