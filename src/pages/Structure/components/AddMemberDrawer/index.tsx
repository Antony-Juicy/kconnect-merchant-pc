import type { DrawerProps } from 'antd';
import { Popover } from 'antd';
import { Divider } from 'antd';
import { Spin, Form, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Ellipsis, Input } from '@/components/Fields';
import Style from '../index.less';
import { merchantApi } from '@/services';
import type { CompanyAccountInfoDepartmentResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import avatar from '@/assets/svgs/avatar.svg';
import close from '@/assets/svgs/close.svg';
import useLocale from '@/hooks/useLocale';
import { useBoolean } from 'ahooks';
import { map } from 'lodash';
import KPayAvatar from '@/components/Fields/kpay-avatar';

type TAddMemberDrawer = {
  /**
   * 关闭回调
   */
  closeMethod: (reload?: boolean) => void;
  /**
   * 商戶ID
   */
  memberId: string;
  /**
   * 企業ID
   */
  companyId: string;
} & DrawerProps;

const AddMemberDrawer: React.FC<TAddMemberDrawer> = (props) => {
  const [globalLoading, { setTrue: showGlobalLoading, setFalse: hideGlobalLoading }] =
    useBoolean(false);

  // 缓存会员資訊
  const [memberInfo, setMemberInfo] = useState<CompanyAccountInfoDepartmentResponse>(
    {} as CompanyAccountInfoDepartmentResponse,
  );

  const intl = useLocale();
  const [formInstance] = Form.useForm();

  useEffect(() => {
    if (!props.visible) {
      setMemberInfo({} as CompanyAccountInfoDepartmentResponse);
      formInstance.resetFields();
    }

    if (props.visible && props.memberId) {
      showGlobalLoading();
      merchantApi
        .getCompanyAccountInfoDepartment({
          companyId: props.companyId,
          accountId: props.memberId,
        })
        .then((res: IApiResponse<CompanyAccountInfoDepartmentResponse>) => {
          hideGlobalLoading();
          if (res.success && res.data) {
            setMemberInfo(res.data);
            formInstance.setFieldsValue({
              name: res.data.name,
              email: res.data.email,
              companyDepartmentName: res.data.departmentList
                ? map(res.data.departmentList, 'companyDepartmentName').join('、')
                : '',
              jobNumber: res.data.jobNumber,
              mobile: res.data.mobile,
              position: res.data.position,
            });
          }
        })
        .catch(() => {
          hideGlobalLoading();
        });
    }
  }, [props.visible]);

  return (
    <Drawer
      className={cx(Style.addMemberDrawer, Style.baseDrawer, Style.normalableDrawer)}
      visible={props.visible}
      destroyOnClose
      onClose={() => {
        props.closeMethod();
      }}
      footer={null}
      closable={false}
    >
      <Spin spinning={globalLoading}>
        <div className={Style.textCenter} style={{ position: 'relative' }}>
          <img
            className={cx(Style.baseDrawerCloseIcon, Style.closeButton)}
            src={close}
            onClick={() => {
              props.closeMethod();
            }}
          />
          {memberInfo.avatar ? (
            <Popover
              overlayClassName={Style.memberPopoverWapper}
              content={
                <KPayAvatar
                  className={Style.memberPersonCircleAvatar}
                  avatarClass={Style.memberPopoverItemAvatar}
                  inAvatar
                  avatar={memberInfo.avatar || ''}
                  showName={memberInfo.name}
                />
              }
            >
              <KPayAvatar
                className={Style.memberPersonCircleAvatar}
                avatarClass={Style.memberAvatar}
                inAvatar
                avatar={memberInfo.avatar || ''}
                showName={memberInfo.name}
              />
            </Popover>
          ) : (
            <KPayAvatar
              className={Style.memberPersonCircleAvatar}
              avatarClass={Style.memberAvatar}
              inAvatar
              avatar={memberInfo.avatar || ''}
              showName={memberInfo.name}
            />
          )}
          <Ellipsis className={Style.memberName}>{memberInfo.name}</Ellipsis>
          <p className={Style.memberPosition}>{memberInfo.position}</p>
        </div>
        <Divider className={Style.memberDivider} dashed />
        <Form form={formInstance} labelCol={{ style: { width: '0' } }} labelAlign="left">
          <p className={Style.memberDrawerFormLabel}>電話</p>
          <Form.Item name="mobile" className={Style.drawerFormItem} colon={false}>
            <Input.TextArea bordered={false} autoSize readOnly />
          </Form.Item>

          <p className={Style.memberDrawerFormLabel}>電郵</p>
          <Form.Item name="email" className={Style.drawerFormItem} colon={false}>
            <Input.TextArea bordered={false} autoSize readOnly />
          </Form.Item>

          <p className={Style.memberDrawerFormLabel}>部門</p>
          <Form.Item name="companyDepartmentName" className={Style.drawerFormItem} colon={false}>
            <Input.TextArea bordered={false} autoSize readOnly />
          </Form.Item>

          <p className={Style.memberDrawerFormLabel}>員工編號</p>
          <Form.Item name="jobNumber" className={Style.drawerFormItem} colon={false}>
            <Input.TextArea bordered={false} autoSize readOnly />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default AddMemberDrawer;
