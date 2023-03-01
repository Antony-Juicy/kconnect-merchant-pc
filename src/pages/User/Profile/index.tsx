import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { stringify } from 'querystring';
import NormalLayout from '@/components/Layout/NormalLayout';
import profileBackground from '@/assets/images/profile-bg.png';
// import avatar from '@/assets/svgs/avatar.svg';
import editIcon from '@/assets/svgs/profile-edit.svg';
import failureIcon from '@/assets/svgs/failure.svg';
import successIcon from '@/assets/svgs/success.svg';
import style from './index.less';
import { Button, Col, Divider, Form, Input, Row, Spin, Upload, Image } from 'antd';
import { Ellipsis } from '@/components/Fields';
import { merchantApi } from '@/services';
import type { RcFile } from 'antd/lib/upload';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { notify } from '@/utils/antdUtils';
import { checkTypes, encryptWithCFB, transSize } from '@/utils/utils';
import { LoadingOutlined } from '@ant-design/icons';
import cx from 'classnames';
import { pattern } from '@/utils/pattern';
import { ModalForm } from '@ant-design/pro-form';
import { gotoLogin } from '@/utils/antdUtils';

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

type TCheckObjProps = {
  maxSize?: number; // 最大上传大小
  mineType?: string[]; // 类型限制数组
  resolution?: [number, number]; // 分辨率數組
};

const checkObj: TCheckObjProps = {
  maxSize: 1,
  mineType: ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/x-ms-bmp'],
};

// 获取限制文件大小
const checkMaxSize = (size: number, maxSize: number) => {
  return size / 1024 / 1024 < (maxSize || 2);
};

// 文件尺寸
const checkResolution = (file: RcFile, resolution: [number, number]) => {
  return new Promise((resolve, reject) => {
    const width = resolution[0];
    const height = resolution[1];
    const $_URL = window.URL || window.webkitURL;
    const img = new Image();
    img.onload = () => {
      const valid = img.width === width && img.height === height;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      valid ? resolve(true) : reject(new Error(''));
    };
    img.src = $_URL.createObjectURL(file);
  }).then(() => {
    Promise.resolve(true);
  });
};

const asyncBeforeUpload = async (file: RcFile) => {
  let mathType = true;
  let ltSize = true;
  if (checkObj.mineType) {
    mathType = checkTypes(file, checkObj.mineType);
    if (!mathType) {
      notify.error('文件類型不符合, 請檢查後重試');
    }
  }
  if (checkObj.maxSize) {
    ltSize = checkMaxSize(file.size, checkObj.maxSize);
    if (!ltSize) {
      notify.error('文件大小必須小於' + transSize(checkObj.maxSize || 2, 'mb'));
    }
  }

  let resolution = true;
  if (
    checkObj.resolution &&
    Array.isArray(checkObj.resolution) &&
    checkObj.resolution.length === 2
  ) {
    await checkResolution(file, checkObj.resolution).catch(() => {
      resolution = false;
      notify.error('文件尺寸不符合, 請檢查後重試');
    });
  }

  return !!(ltSize && mathType && resolution);
};

const antIcon = <LoadingOutlined className={style.profileLoadingOutlined} spin />;

const Profile: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [visiable, setVisiable] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [changePwdLoading, setChangePwdLoading] = useState<boolean>(false);

  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [editAvatar, setEditAvatar] = useState<string>();

  const defaultProps: {
    onChange?: any;
    headers?: any;
    beforeUpload: any;
    customRequest: (info: UploadRequestOption<any>) => void;
  } = {
    customRequest: ({ data, file, filename, onError, onSuccess }) => {
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key] as string | Blob);
        });
      }

      formData.append(filename || 'file', file);

      merchantApi
        .postFileUpload(formData as any)
        .then((response) => {
          setLoading(false);
          if (response.success && response.data) {
            setEditAvatar(response.data.fileUrl);
          }
          if (onSuccess) {
            onSuccess(response);
          }
        })
        .catch((err) => {
          setLoading(false);
          if (onError) {
            onError(err);
          }
        });
    },
    beforeUpload: async (file: RcFile) => {
      const beforeUploadStatus = await asyncBeforeUpload(file);
      setLoading(beforeUploadStatus);
      return beforeUploadStatus;
    },
  };

  const handleCancel = () => {
    setVisiable(false);
  };

  const editPsw = () => {
    setVisiable(true);
  };

  // 改變頭像
  const changeAvatar = () => {
    if (editAvatar) {
      setSubmitLoading(true);
      merchantApi
        .postCommonModify({
          companyAccountId: initialState?.currentUser?.companyAccountId || 0,
          avatar: editAvatar,
        })
        .then((res) => {
          setSubmitLoading(false);
          if (res.success && res.data) {
            setShowEdit(false);
            setInitialState((s) => ({
              ...s,
              currentUser: { ...(initialState?.currentUser as any), avatar: editAvatar },
            }));
          }
        })
        .catch(() => {
          setSubmitLoading(false);
        });
    } else {
      setShowEdit(false);
    }
  };

  const handleFinish = async (value: any) => {
    if (!changePwdLoading) {
      setChangePwdLoading(true);
      try {
        const getKeyRes = await merchantApi.getCommonDataSecret();
        if (getKeyRes.success && getKeyRes.data) {
          const secretKey: string = getKeyRes.data.dataSecret;
          const dataKeyParameter: string = getKeyRes.data.dataSecretParameter;
          const originalPassword = encryptWithCFB(
            value.originalPassword,
            secretKey,
            dataKeyParameter,
          );
          const newPassword = encryptWithCFB(value.newPassword, secretKey, dataKeyParameter);
          const sumbitData = Object.assign(
            {},
            { oldSecret: originalPassword, newSecret: newPassword },
          );
          const modifyRes = await merchantApi.postCommonModifySecret(sumbitData);
          if (modifyRes.success) {
            setVisiable(false);
            notify.success('密碼修改成功，請重新登入');
            setInitialState((s) => ({ ...s, currentUser: undefined }));
            loginOut();
            setChangePwdLoading(false);
            return;
          }
        }
        setChangePwdLoading(false);
      } catch (err) {
        setChangePwdLoading(false);
      }
    }
  };

  // 名字首字頭像
  const firstSubAvatar = (showName: string) => {
    if (!showName) {
      return <></>;
    }
    return <div className={style.avaterCircle}>{showName.trimStart().substring(0, 1)}</div>;
  };

  useEffect(() => {
    setEditAvatar(initialState?.currentUser?.avatar || '');
  }, [showEdit]);

  useEffect(() => {
    setEditAvatar(initialState?.currentUser?.avatar || '');
  }, []);

  return (
    <NormalLayout>
      <div style={{ backgroundImage: `url(${profileBackground})` }} className={style.profileWapper}>
        {/* <p className={style.profileTitle}>
          <img src={profileBackground} />
        </p> */}
        <div className={style.profileContent}>
          <div className={style.profileAvatar}>
            <div className={style.profileImg}>
              {loading ? (
                <Spin spinning indicator={antIcon} />
              ) : (showEdit ? editAvatar || '' : initialState?.currentUser?.avatar || '') ? (
                <Image
                  preview={false}
                  src={showEdit ? editAvatar || '' : initialState?.currentUser?.avatar || ''}
                  placeholder={true}
                  onError={() => {
                    setInitialState((s) => ({
                      ...s,
                      currentUser: { ...(initialState?.currentUser as any), avatar: '' },
                    }));
                  }}
                />
              ) : (
                <>{firstSubAvatar(initialState?.currentUser?.name || '')}</>
              )}
            </div>
            {showEdit ? (
              <div className={style.uploadWapper}>
                <Upload name="multipartFile" showUploadList={false} {...defaultProps}>
                  <div className={cx(style.profileAvatar, style.uploadComplete)}>
                    <div className={style.uploadMask}>編輯</div>
                  </div>
                </Upload>
                <Button
                  className={cx(style.uploadIcon, style.successIcon)}
                  onClick={() => {
                    changeAvatar();
                  }}
                >
                  {submitLoading ? antIcon : <img src={successIcon} />}
                </Button>
                <Button
                  className={cx(style.uploadIcon, style.failIcon)}
                  onClick={() => {
                    setShowEdit(false);
                  }}
                >
                  <img src={failureIcon} />
                </Button>
              </div>
            ) : (
              <Button
                className={style.editIcon}
                onClick={() => {
                  setShowEdit(true);
                }}
              >
                <img src={editIcon} />
              </Button>
            )}
          </div>
          <Ellipsis className={style.profileName}>{initialState?.currentUser?.name}</Ellipsis>
          <p className={style.profileJob}>{initialState?.currentUser?.position}</p>
          <Divider className={style.profileDivider} dashed />
          <Row gutter={[16, 16]}>
            <Col span={5}>
              <p className={style.profileInfoTitle}>電話</p>
              <Ellipsis className={style.profileInfoContent}>
                {initialState?.currentUser?.mobile}
              </Ellipsis>
            </Col>
            <Col span={5}>
              <p className={style.profileInfoTitle}>電郵</p>
              <Ellipsis className={style.profileInfoContent}>
                {initialState?.currentUser?.email}
              </Ellipsis>
            </Col>
            <Col span={5}>
              <p className={style.profileInfoTitle}>登入賬戶</p>
              <div className={style.profileInfoText}>
                <Ellipsis className={style.profileInfoContent}>
                  {initialState?.currentUser?.account}
                </Ellipsis>
                <Button type="text" className={style.editText} onClick={editPsw}>
                  重設密碼
                </Button>
              </div>
            </Col>
            <Col span={5}>
              <p className={style.profileInfoTitle}>部門</p>
              <Ellipsis className={style.profileInfoContent}>
                {(initialState?.currentUser?.departmentNameList || []).join('、')}
              </Ellipsis>
            </Col>
            <Col span={4}>
              <p className={style.profileInfoTitle}>員工編號</p>
              <Ellipsis className={style.profileInfoContent}>
                {initialState?.currentUser?.jobNumber}
              </Ellipsis>
            </Col>
          </Row>
        </div>
      </div>

      <ModalForm
        width={460}
        title="重設密碼"
        visible={visiable}
        autoFocusFirstInput
        modalProps={{
          centered: true,
          onCancel: () => handleCancel(),
          wrapClassName: `${style.modalWrap}`,
          destroyOnClose: true,
        }}
        submitter={{
          render: (props) => {
            return [
              <Button
                key="ok"
                loading={changePwdLoading}
                className={style.submitBtn}
                onClick={() => {
                  props.submit();
                }}
              >
                確認修改
              </Button>,
            ];
          },
        }}
        onFinish={handleFinish}
      >
        <Spin spinning={submitLoading}>
          <div className={style.subTitle}>新密碼必須由至少8個字符（包括數字及字母）組成</div>
          {/* <Input.Password name="substitute" className={style.none} /> */}
          <Form.Item
            name="originalPassword"
            rules={[{ required: true, message: '請輸入舊密碼' }]}
            // 密碼不正確，請重新輸入
          >
            <Input.Password
              allowClear
              maxLength={64}
              className={style.input}
              autoComplete="new-password"
              placeholder="舊密碼"
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            // validateStatus={}
            rules={[
              {
                required: true,
                message: '請輸入新密碼',
              },
              pattern('pwd'),
              ({ getFieldValue }) => ({
                validator(_, value) {
                  // console.log(value, getFieldValue('originalPassword'));
                  if (!value && !getFieldValue('originalPassword')) {
                    return Promise.resolve();
                  }
                  if (
                    value &&
                    getFieldValue('originalPassword') &&
                    getFieldValue('originalPassword') === value
                  ) {
                    return Promise.reject(new Error('新舊密碼不能相同，請重新輸入'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              maxLength={64}
              allowClear
              className={style.input}
              placeholder="新密碼"
            />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            rules={[
              {
                required: true,
                message: '請再次輸入新密碼',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('密碼不一致，請重新輸入'));
                },
              }),
            ]}
          >
            <Input.Password
              maxLength={64}
              allowClear
              className={style.input}
              placeholder="確認新密碼"
            />
          </Form.Item>
        </Spin>
      </ModalForm>
    </NormalLayout>
  );
};

export default Profile;
