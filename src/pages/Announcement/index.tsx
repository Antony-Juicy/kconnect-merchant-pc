import NormalLayout from '@/components/Layout/NormalLayout/index';
import { merchantApi } from '@/services';
import type {
  DocumentationUpdateAnnouncementInfoResponse,
  DocumentationUpdateAnnouncementListPageResponse,
} from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import { Col, Row, Spin } from 'antd';
import { pick, omit } from '../../utils/utils';
import cx from 'classnames';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Style from './index.less';
import { useBoolean } from 'ahooks';
import Login from '../User/Login';

let currentId: string;

const Announcement: React.FC = () => {
  const [details, setDetails] = useState<any>(null);
  const [lists, setlist] = useState<any>([]);
  const [article, setArticle] = useState<any>('');
  const [listsLoading, { setTrue: showListsLoading, setFalse: hideListsLoading }] =
    useBoolean(false);
  const [detailsLoading, { setTrue: showDetailsLoading, setFalse: hideDetailsLoading }] =
    useBoolean(false);
  const emp: Employee = {
    id: 1,
    name: 'James',
    salary: 100,
  };

  console.log(emp, 'HaHa');
  const [titleavatar, setTitleavatar] = useState<any>(0);

  // 详情 点击
  const gestDeptInfo = (id: string, index: any) => {
    setTitleavatar(index);
    if (currentId !== id && !detailsLoading) {
      showDetailsLoading();
      merchantApi
        .getDocumentationUpdateAnnouncementInfo({ documentationId: id })
        .then((res: IApiResponse<DocumentationUpdateAnnouncementInfoResponse>) => {
          hideDetailsLoading();
          if (res.success && res.data) {
            if (res.data?.zhContent && '<p></p>' !== res.data?.zhContent) {
              setArticle(res?.data?.zhContent);
            } else {
              setArticle(res?.data?.enContent || '');
            }
            setDetails(res.data);
            currentId = id;
          }
        })
        .catch(() => {
          hideDetailsLoading();
        });
    }
  };

  // 公告分頁列表
  const Announcementlist = async () => {
    showListsLoading();
    const paginated = await merchantApi
      .getDocumentationUpdateAnnouncementListPage({ page: '1', rows: '100' })
      .then((res: IApiResponse<DocumentationUpdateAnnouncementListPageResponse>) => {
        hideListsLoading();
        if (`${res.code}` === '10000' && res.data && res.success) {
          setlist(res?.data?.data);
          if (res?.data?.data.length > 0 && res?.data?.data[0].documentationId) {
            showDetailsLoading();
            merchantApi
              .getDocumentationUpdateAnnouncementInfo({
                documentationId: res?.data?.data[0].documentationId.toString(),
              })
              .then((item: IApiResponse<DocumentationUpdateAnnouncementInfoResponse>) => {
                hideDetailsLoading();
                if (item.success && item.data) {
                  if (item.data?.zhContent && '<p></p>' !== item.data?.zhContent) {
                    setArticle(item?.data?.zhContent);
                  } else {
                    setArticle(item?.data?.enContent || '');
                  }
                  setDetails(item.data);
                  currentId = res.data.data[0].documentationId.toString();
                }
              })
              .catch(() => {
                hideDetailsLoading();
              });
          }
        }
      })
      .catch(() => {
        hideListsLoading();
      });
  };

  useEffect(() => {
    Announcementlist();
  }, []);

  return (
    <>
      <NormalLayout className={Style.mainContent} title="更新公告">
        <Row style={{ flexWrap: 'nowrap' }}>
          <Col flex="371px" className={Style.oraLeft}>
            <Spin spinning={listsLoading}>
              <div className={Style.oraLeft_t}>
                {lists &&
                  lists.map((item: any, index: any) => {
                    return (
                      <div
                        className={cx(Style.oraLeftTree, Style.niceScroll)}
                        onClick={gestDeptInfo.bind(null, item.documentationId, index)}
                        key={`key_${item.documentationId}`}
                      >
                        <div className={Style.oraLeftTitle}>
                          <div
                            className={cx(
                              Style.oraLeftTitleAvatar,
                              index == titleavatar ? Style.oraLeftTitleAvatars : '',
                            )}
                          >
                            <div className={Style.AvatarTar}>
                              <div className={Style.Avatar}>{item.title}</div>
                              <div className={Style.Tar}>
                                {moment(Number(item.modifyTime)).format('DD/MM/YYYY ')}{' '}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Spin>
          </Col>
          <Col flex="auto" className={Style.oraRight}>
            <Spin spinning={detailsLoading}>
              {details !== null && (
                <div className={Style.oraRightBtnGroup}>
                  <div className={Style.RightBtn}>{details !== null && details.title}</div>
                  <div className={Style.oraRightBtnGroup_r}>
                    <span>{moment(Number(details.modifyTime)).format('DD/MM/YYYY ')}</span>
                  </div>
                  <div className={Style.oraRightul}>
                    <ul>
                      <li>{details.description}</li>
                    </ul>
                  </div>
                  <div className={Style.description}>
                    <div dangerouslySetInnerHTML={{ __html: article }} />
                  </div>
                </div>
              )}
            </Spin>
          </Col>
        </Row>
      </NormalLayout>
    </>
  );
};

export default Announcement;
