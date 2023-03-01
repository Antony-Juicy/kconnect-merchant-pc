import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import { usePageStatus } from '@/hooks/usePageStatus';
import { merchantApi } from '@/services';
import type { ApplicationApplyResponse, ApplicationOpenedResponse } from '@/services/api';
import { getCompanyId } from '@/utils/auth';
import { APPSTATE } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { openNewTabs } from '@/utils/utils';
import { ModalForm } from '@ant-design/pro-form';
import { useBoolean } from 'ahooks';
import { Card, Form, Input, message, Modal, Spin, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
// import pattern from '@/utils/pattern';
import defaultIcon from '@/assets/images/common/default-app-icon.png';
import successIcon from '@/assets/images/common/success.png';
import styles from './index.less';

let timeChange: NodeJS.Timeout;

const ApplicationDetail: React.FC = (props) => {
  const { id, sid } = usePageStatus(props);
  const [sec, setSec] = useState<number>(2);
  const [visiable, setVisiable] = useState<boolean>(false);
  const [appOpen, setAppOpen] = useState<boolean | null>(null);
  const [appDetail, setAppDetail] = useState<any>(null);
  const [appEndTime, setAppEndTime] = useState<string | undefined>(undefined);

  const [modalVisiable, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [submitLoading, { setTrue: showSubmitLoading, setFalse: hideSubmitLoading }] =
    useBoolean(false);
  const [detailLoading, { setTrue: showDetailLoading, setFalse: hideDetailLoading }] =
    useBoolean(false);

  // 企業資訊
  const { initialState } = useModel('@@initialState');

  const intl = useLocale();

  const init = () => {
    showDetailLoading();
    merchantApi
      .getApplicationDetail({ applicationId: id })
      .then((res) => {
        if (res.success && '10000' === `${res.code}` && res.data) {
          setAppDetail(res.data);
        }
        hideDetailLoading();
      })
      .catch(() => {
        hideDetailLoading();
      });
  };

  const checkAppOpened = () => {
    merchantApi
      .getApplicationOpened({ companyId: (getCompanyId() || '').toString() }, { noThrow: true })
      .then((res: IApiResponse<ApplicationOpenedResponse>) => {
        if (res.success && res.data) {
          const {
            state = undefined,
            applicationState = undefined,
            serviceEndTime = undefined,
          } = res.data.filter((item) => id === item.applicationId.toString())[0] || [];
          setAppEndTime(
            serviceEndTime
              ? serviceEndTime.toString()
              : null === serviceEndTime
              ? 'null'
              : undefined,
          );
          setAppOpen(APPSTATE.ACTIVATE === state && APPSTATE.ACTIVATE === applicationState);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    init();
    checkAppOpened();
  }, []);

  const handleClick = () => {
    if ('null' === sid) {
      setVisiable(true);
    } else {
      merchantApi
        .getApplicationOpened({ companyId: (getCompanyId() || '').toString() }, { noThrow: true })
        .then((res: IApiResponse<ApplicationOpenedResponse>) => {
          if (res.success && res.data) {
            const appState = res.data.filter((item) => id === item.applicationId.toString())[0]
              ?.state;
            const applicationState = res.data.filter(
              (item) => id === item.applicationId.toString(),
            )[0]?.applicationState;
            setAppOpen(APPSTATE.ACTIVATE === appState && APPSTATE.ACTIVATE === applicationState);
            if (APPSTATE.ACTIVATE === appState) {
              const href = history.createHref({
                pathname: `/auth/authorize/${id}`,
              });
              openNewTabs(href);
            } else {
              message.error(
                `${intl.getMessage(
                  'application.detail.DEACTIVATE.message',
                  '此應用已被管理員暫停使用',
                )}`,
              );
            }
          }
        })
        .catch(() => {});
    }
  };

  const handleCancel = () => {
    setVisiable(false);
  };

  const closeModal = () => {
    clearInterval(timeChange);
    hideModal();
    setSec(2);
    history.push(`/main/application/appMark`);
  };

  useEffect(() => {
    if (sec < 0) {
      clearInterval(timeChange);
      hideModal();
      history.push(`/main/application/appMark`);
    }
  }, [sec]);

  const countDown = () => {
    // eslint-disable-next-line no-param-reassign
    timeChange = setInterval(() => setSec((t) => --t), 1000);
  };

  const handleFinish = async (value: any) => {
    setSec(2);
    if (!submitLoading) {
      showSubmitLoading();
      merchantApi
        .postApplicationApply(value)
        .then((res: IApiResponse<ApplicationApplyResponse>) => {
          if (res.success) {
            // hideModal();
            // message.success('開通申請已提交')
            countDown();
          }
        });
      hideSubmitLoading();
      setVisiable(false);
      showModal();
    }
  };

  const extraBtn = () => {
    if ('null' === sid) {
      return (
        <div onClick={handleClick.bind(null, sid)} className={styles.extraBtn}>
          立即申請
        </div>
      );
    } else if ('null' !== sid && null !== appOpen) {
      return (
        <div onClick={handleClick.bind(null, sid)} className={styles.extraBtn}>
          {appOpen ? '開啟' : '已停用'}
        </div>
      );
    }
    return null;
  };

  const renderInfo = () => {
    if ('null' === sid) {
      return '未開通';
    } else if ('null' === appEndTime && appOpen) {
      return '期限: 永久';
    } else if (!appOpen && null !== appOpen) {
      return '已停用';
    }
    return `期限: ${moment(Number(appEndTime)).format('DD/MM/YYYY')}`;
  };

  const titleNode = (detail: any) => {
    if (detail) {
      return (
        <div className={styles.titleNode}>
          <img
            className={styles.appIcon}
            src={detail?.icon || defaultIcon}
            onError={(e: any) => {
              e.target.src = defaultIcon;
              e.target.onerror = null;
            }}
          />
          <div className={styles.iconInfo}>
            <Tooltip placement="topLeft" title={detail?.name || ''}>
              <div className={styles.name}>{detail?.name || ''}</div>
            </Tooltip>
            {/* <div className={styles.name}>{detail?.name || ''}</div> */}
            <div className={styles.info}>{renderInfo()}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <NormalLayout visible title="應用程式詳情">
      <Card title={titleNode(appDetail)} extra={extraBtn()} className={styles.card}>
        {appDetail?.subscriptionInstructions && (
          <>
            <div className={styles.cardTitle}>
              {intl.getMessage('application.detail.subscriptionInstructions.title', '申請開通程序')}
            </div>
            <div>{appDetail?.subscriptionInstructions}</div>
          </>
        )}
      </Card>

      <Card loading={detailLoading} className={styles.card}>
        <div className={styles.cardTitle}>
          {intl.getMessage('application.detail.description.title', '功能介紹')}
        </div>
        {/* <div dangerouslySetInnerHTML={{__html: `${appDetail?.description || ''}`}} /> */}
        <div
          dangerouslySetInnerHTML={{
            __html: `${appDetail?.applicationInstructionList[0]?.instructionContent || ''}`,
          }}
        />
        {appDetail?.applicationInstructionList[0]?.instructionUrl && (
          <img
            src={appDetail.applicationInstructionList[0].instructionUrl}
            className={styles.insUrl}
          />
        )}
      </Card>

      <ModalForm
        width={460}
        className={styles.modalWrap}
        title="聯絡資訊"
        visible={visiable}
        autoFocusFirstInput
        modalProps={{
          centered: true,
          onCancel: () => handleCancel(),
          wrapClassName: `${styles.modalWrap}`,
          destroyOnClose: true,
        }}
        submitter={{
          searchConfig: {
            submitText: '確定',
            resetText: '取消',
          },
          resetButtonProps: {
            className: `${styles.resetBtn}`,
          },
          submitButtonProps: {
            className: `${styles.submitBtn}`,
          },
        }}
        onFinish={handleFinish}
      >
        <Spin spinning={submitLoading}>
          <Form.Item name="companyId" hidden initialValue={(getCompanyId() || '').toString()}>
            <Input />
          </Form.Item>
          <Form.Item name="applicationId" hidden initialValue={id}>
            <Input />
          </Form.Item>
          <Form.Item
            name="applicantName"
            initialValue={
              initialState && initialState.currentUser ? initialState.currentUser.name : ''
            }
            rules={[{ required: true, message: '請輸入姓名' }]}
          >
            <Input maxLength={32} allowClear className={styles.input} placeholder="請輸入姓名" />
          </Form.Item>
          <Form.Item
            name="applicantContactMobile"
            initialValue={
              initialState && initialState.currentUser ? initialState.currentUser.mobile : ''
            }
            rules={[
              {
                required: true,
                message: '請輸入聯絡電話',
              },
            ]}
          >
            <Input
              maxLength={32}
              allowClear
              className={styles.input}
              placeholder="請輸入聯絡電話"
            />
          </Form.Item>
        </Spin>
      </ModalForm>

      <Modal
        centered
        wrapClassName={styles.confirm}
        closeIcon={null}
        title={null}
        footer={null}
        visible={modalVisiable}
        // visible={true}
        onOk={hideModal}
        onCancel={hideModal}
      >
        <img src={successIcon} alt="" className={styles.success} />
        <p className={styles.bigTxt}>成功遞交</p>
        <p className={styles.smallTxt}>將有專人與閣下聯絡跟進</p>
        <div key="ok" onClick={closeModal} className={styles.modalClose}>
          確認{0 > sec ? '' : `(${sec}s)`}
        </div>
      </Modal>
    </NormalLayout>
  );
};

export default ApplicationDetail;
