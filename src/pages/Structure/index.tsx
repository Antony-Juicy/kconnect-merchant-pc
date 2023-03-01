import React, { useEffect, useRef, useState } from 'react';
import { Popover, Skeleton, Tooltip } from 'antd';
import { Breadcrumb, Col, Divider, List, Row, Spin } from 'antd';
import Style from './index.less';
import { Ellipsis } from '@/components/Fields';
import cx from 'classnames';
import { merchantApi } from '@/services';
import othersStructure from '@/assets/svgs/others-structure.svg';
// import avatar from '@/assets/svgs/avatar.svg';
import othersStructureSelected from '@/assets/svgs/others-structure-selected.svg';
import { RightOutlined } from '@ant-design/icons';
import type {
  CompanyAccountPageDepartmentResponseDetail,
  CompanyDepartmentInfoResponse,
  CompanyDepartmentListResponse,
  CompanyDepartmentPageResponse,
  CompanyDepartmentListCurrentAccountResponse,
  CompanyAccountPageDepartmentResponse,
} from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import AddMemberDrawer from './components/AddMemberDrawer';
import { useBoolean } from 'ahooks';
import { filter, toNumber } from 'lodash';
// import useLocale from '@/hooks/useLocale';
import { kToString, awaitWrap } from '@/utils/utils';
import NormalLayout from '@/components/Layout/NormalLayout';
import { useModel } from 'umi';
import KPayAvatar from '@/components/Fields/kpay-avatar';

const $pageSize = '10';

const StructureMange: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const companyId = kToString(initialState?.currentUser?.companyId) || '';

  // 企業ID
  const [companySelectId, setCompanySelectId] = useState<string>('');
  // 企業ID
  const [companySelectName, setCompanySelectName] = useState<string>('');

  const [rootDepartmentInfo, setRootDepartmentInfo] = useState<
    CompanyDepartmentListCurrentAccountResponse[0]['rootDepartment']
  >({} as CompanyDepartmentListCurrentAccountResponse[0]['rootDepartment']);

  const [companyList, setCompanyList] = useState<CompanyDepartmentListCurrentAccountResponse>(
    [] as CompanyDepartmentListCurrentAccountResponse,
  );
  const [departmentInfo, setDepartmentInfo] = useState<CompanyDepartmentInfoResponse>(
    {} as CompanyDepartmentInfoResponse,
  );

  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false);
  const [treeLeftLoading, { setTrue: showTreeLeftLoading, setFalse: hideTreeLeftLoading }] =
    useBoolean(false);
  const [contentLoading, { setTrue: showContentLoading, setFalse: hideContentLoading }] =
    useBoolean(false);
  // 部門Loading
  const [listLoading, { setTrue: showListLoading, setFalse: hideListLoading }] = useBoolean(false);
  // 人員loading
  const [personLoading, { setTrue: showPersonLoading, setFalse: hidePersonLoading }] =
    useBoolean(false);

  // 添加子部门的状态
  const [addMemberVisible, { setTrue: showAddMemberDrawer, setFalse: hideAddMemberDrawer }] =
    useBoolean(false);

  // 分页列表
  const [departmentPageList, setDepartmentPageList] = useState<CompanyDepartmentListResponse>([]);
  // 分页列表總數
  const [departmentPageCount, setDepartmentPageCount] = useState<number>(0);
  // 部门列表当前页
  const [departmentPage, setDepartmentPage] = useState<number>(1);

  // 人員分页列表
  const [personPageList, setPersonPageList] = useState<
    CompanyAccountPageDepartmentResponseDetail[]
  >([]);
  // 人員分页列表總數
  const [personPageCount, setPersonPageCount] = useState<number>(0);
  // 人員列表当前页
  const [personPage, setPersonPage] = useState<number>(1);

  // 麵包屑
  const [breadcrumb, setBreadcrumb] = useState<CompanyDepartmentInfoResponse[]>([]);

  // 根部门ID
  const [companyDepartmentId, setCompanyDepartmentId] = useState<string>('');

  // 部门ID
  const [companyDataType, setCompanyDataType] = useState<'dept' | 'person'>('dept');

  // 人員ID
  const [memberId, setMemberId] = useState<string>('');

  // const intl = useLocale();
  const scorllRef = useRef<any>();

  // 改变面包屑
  const changeBreadcrumb = (
    data: CompanyDepartmentInfoResponse,
    resetBreadcrumb: boolean = false,
  ) => {
    let $_breadcrumb = [...breadcrumb];
    if (resetBreadcrumb) {
      $_breadcrumb = [];
    }

    [...breadcrumb].forEach((item, index) => {
      if (item.companyDepartmentId === data.parentId) {
        $_breadcrumb[index + 1] = data;
        $_breadcrumb = $_breadcrumb.splice(0, index + 1);
        return;
      }
      return;
    });

    if (
      (!toNumber(data.parentId) ||
        data.companyDepartmentId === rootDepartmentInfo.companyDepartmentId) &&
      $_breadcrumb.length > 1
    ) {
      $_breadcrumb = $_breadcrumb.splice(0, 1);
    } else {
      $_breadcrumb.push(data);
    }

    setBreadcrumb(filter([...$_breadcrumb]));

    const scrollWidth = scorllRef.current?.scrollWidth;
    const width = scorllRef.current?.clientWidth;
    const maxScrollLeft = scrollWidth - width;
    scorllRef.current?.scrollTo(maxScrollLeft > 0 ? maxScrollLeft : 0, 0);

    return $_breadcrumb;
  };

  //
  const getInfoAndPerson = async (id: string, resetBreadcrumb: boolean = false) => {
    showContentLoading();
    setCompanyDepartmentId(id);

    // 获取部门详情
    await merchantApi
      .getCompanyDepartmentInfo({ companyDepartmentId: kToString(id) })
      .then((company: IApiResponse<CompanyDepartmentInfoResponse>) => {
        if (company.success && company.data) {
          setDepartmentInfo(company.data);
          changeBreadcrumb(company.data, resetBreadcrumb);
        } else {
          hideLoading();
          hideContentLoading();
        }
      })
      .catch(() => {
        hideLoading();
        hideContentLoading();
      });

    // 获取部門人員
    await merchantApi
      .getCompanyAccountPageDepartment({
        companyDepartmentId: kToString(id),
        page: '1',
        rows: $pageSize,
      })
      .then((childList: IApiResponse<CompanyAccountPageDepartmentResponse>) => {
        if (childList.success && childList.data) {
          hideLoading();
          hideContentLoading();
          setPersonPage(1);
          setPersonPageCount(childList.data.totalCount);
          setPersonPageList(childList.data.data);
        } else {
          hideLoading();
          hideContentLoading();
        }
      })
      .catch(() => {
        hideLoading();
        hideContentLoading();
      });
  };

  // 获取下级部门數據
  const getDeptInfo = async (
    id: string,
    selectId: string = '',
    resetBreadcrumb: boolean = false,
  ) => {
    showContentLoading();
    setCompanyDataType('dept');
    setCompanySelectId(selectId ? selectId : companySelectId);

    // 获取下级部门
    await merchantApi
      .getCompanyDepartmentPage({
        companyId: selectId ? selectId : companySelectId,
        parentId: kToString(id),
        page: '1',
        rows: $pageSize,
      })
      .then((childList: IApiResponse<CompanyDepartmentPageResponse>) => {
        if (childList.success && childList.data) {
          setDepartmentPage(1);
          setDepartmentPageCount(childList.data.totalCount);
          setDepartmentPageList(childList.data.data);
        } else {
          hideLoading();
          hideContentLoading();
        }
      })
      .catch(() => {
        hideLoading();
        hideContentLoading();
      });

    getInfoAndPerson(id, resetBreadcrumb);
  };

  // 获取部門下人員數據
  const getPersonInfo = async (id: string) => {
    showContentLoading();
    setCompanyDataType('person');
    getInfoAndPerson(id);
  };

  // 初始化
  const initDepartmentList = async () => {
    showLoading();
    const [error, res] = await awaitWrap<IApiResponse<CompanyDepartmentListCurrentAccountResponse>>(
      merchantApi.getCompanyDepartmentListCurrentAccount(),
    );
    if (error) {
      hideLoading();
    }

    if (res && res.success && res.data) {
      setCompanyList(res.data);
      res.data.forEach((item) => {
        if (kToString(item.companyId) === companyId) {
          setRootDepartmentInfo(item.rootDepartment);
          setCompanySelectName(item.companyName);

          getDeptInfo(
            kToString(item.rootDepartment ? item.rootDepartment.companyDepartmentId : ''),
            companyId,
          );
        }
      });
    }
  };

  //
  const openMemberInfo = (id: string) => {
    if (id) {
      setMemberId(id);
      showAddMemberDrawer();
    }
  };

  // 部門切換
  const onDepartmentChange = (page: number) => {
    showListLoading();
    merchantApi
      .getCompanyDepartmentPage({
        companyId: companySelectId,
        parentId: kToString(companyDepartmentId),
        page: `${page}`,
        rows: $pageSize,
      })
      .then((res: IApiResponse<CompanyDepartmentPageResponse>) => {
        hideListLoading();
        if (res.success && res.data) {
          setDepartmentPage(page);
          setDepartmentPageCount(res.data.totalCount);
          setDepartmentPageList(res.data.data);
        }
      })
      .catch(() => {
        hideListLoading();
      });
  };

  // 人員切換
  const onPersonChange = (page: number) => {
    showPersonLoading();
    merchantApi
      .getCompanyAccountPageDepartment({
        companyDepartmentId: kToString(companyDepartmentId),
        page: `${page}`,
        rows: $pageSize,
      })
      .then((res: IApiResponse<CompanyAccountPageDepartmentResponse>) => {
        hidePersonLoading();
        if (res.success && res.data) {
          setPersonPage(page);
          setPersonPageCount(res.data.totalCount);
          setPersonPageList(res.data.data);
        }
      })
      .catch(() => {
        hidePersonLoading();
      });
  };

  useEffect(() => {
    initDepartmentList();
  }, []);

  return (
    <NormalLayout>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Col flex="371px" className={Style.oraLeft}>
          <Skeleton loading={loading} active className={Style.oraSkeleton}>
            <div className={cx(Style.oraLeftTree, Style.niceScroll)}>
              <Spin spinning={treeLeftLoading}>
                <div>
                  {companyList.map((item) => {
                    return (
                      <React.Fragment key={item.companyId}>
                        <div className={Style.oraLeftTitle}>
                          <KPayAvatar
                            className={Style.oraLeftTitleAvatar}
                            avatarClass={Style.oraLeftTitleItemAvatar}
                            inAvatar
                            avatar={item.companyAvatar || ''}
                            showName={item.companyName}
                          />
                          <Ellipsis className={cx(Style.textNameStyle, Style.textBold)}>
                            {item.companyName}
                          </Ellipsis>
                        </div>
                        <div
                          className={Style.oraLeftContent}
                          onClick={() => {
                            setCompanySelectName(item.companyName);
                            setRootDepartmentInfo(item.rootDepartment);
                            getDeptInfo(
                              kToString(item.rootDepartment.companyDepartmentId),
                              kToString(item.companyId),
                              true,
                            );
                          }}
                        >
                          <div
                            className={cx(
                              Style.oraLeftContentItem,
                              companyDataType === 'dept' &&
                                kToString(item.rootDepartment.companyDepartmentId) ===
                                  kToString(rootDepartmentInfo.companyDepartmentId)
                                ? Style.oraLeftContentActive
                                : '',
                            )}
                          >
                            <img
                              className={Style.oraOthersIcon}
                              src={
                                companyDataType === 'dept' &&
                                kToString(item.rootDepartment.companyDepartmentId) ===
                                  companyDepartmentId
                                  ? othersStructureSelected
                                  : othersStructure
                              }
                            />
                            <div className={Style.textNameStyle}>公司架構</div>
                          </div>
                        </div>
                        <div className={Style.oraLeftContent}>
                          {item.departmentList.map((val) => {
                            return (
                              <>
                                <div
                                  className={cx(
                                    Style.oraLeftContentItem,
                                    companyDataType === 'person' &&
                                      kToString(val.companyDepartmentId) === companyDepartmentId
                                      ? Style.oraLeftContentActive
                                      : '',
                                  )}
                                  onClick={() => {
                                    setCompanySelectName(item.companyName);
                                    setCompanySelectId(kToString(item.companyId));
                                    getPersonInfo(kToString(val.companyDepartmentId));
                                  }}
                                >
                                  <img
                                    className={Style.oraOthersIcon}
                                    src={
                                      companyDataType === 'person' &&
                                      kToString(val.companyDepartmentId) === companyDepartmentId
                                        ? othersStructureSelected
                                        : othersStructure
                                    }
                                  />
                                  <Ellipsis className={Style.textNameStyle}>
                                    {val.departmentName}
                                  </Ellipsis>
                                </div>
                              </>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </Spin>
            </div>
          </Skeleton>
        </Col>

        <Col flex="auto" className={Style.oraRight}>
          <Skeleton loading={loading} active className={Style.oraSkeleton}>
            <Spin spinning={contentLoading} wrapperClassName="ora-right-spin">
              <div id="J_BreadcrumbList" className={Style.oraRightBtnGroup}>
                <div className={Style.oraLeftTitle}>
                  <KPayAvatar
                    className={Style.oraLeftTitleAvatar}
                    avatarClass={Style.oraLeftTitleItemAvatar}
                    inAvatar
                    avatar={departmentInfo.companyAvatar || ''}
                    showName={companySelectName}
                  />
                  <Ellipsis className={cx(Style.textNameStyle, Style.textBold)}>
                    {companySelectName}
                  </Ellipsis>
                </div>

                {companyDataType === 'dept' && (
                  <div className={Style.oraRightBreadcrumbWapper}>
                    <div className={Style.oraRightBreadcrumb} ref={scorllRef}>
                      <Breadcrumb separator=">">
                        {breadcrumb.map((item) => {
                          // console.log(item);
                          return (
                            <Breadcrumb.Item
                              key={item.companyDepartmentId}
                              onClick={() => {
                                if (
                                  item.companyDepartmentId !== departmentInfo.companyDepartmentId
                                ) {
                                  getDeptInfo(kToString(item.companyDepartmentId));
                                }
                              }}
                            >
                              <Tooltip placement="topLeft" overlay={item.companyDepartmentName}>
                                <span
                                  className={
                                    item.companyDepartmentId !== departmentInfo.companyDepartmentId
                                      ? Style.oraRightBreadcrumbActive
                                      : Style.oraRightBreadcrumbNormal
                                  }
                                >
                                  {item.companyDepartmentName}
                                </span>
                              </Tooltip>
                            </Breadcrumb.Item>
                          );
                        })}
                      </Breadcrumb>
                    </div>
                  </div>
                )}
              </div>

              <div className={cx(Style.oraRightSubContent, Style.niceScroll)}>
                {companyDataType === 'dept' ? (
                  <>
                    {departmentPageList.length > 0 && (
                      <>
                        <List
                          className={Style.oraRightDeptList}
                          itemLayout="horizontal"
                          dataSource={departmentPageList}
                          loading={listLoading}
                          split={false}
                          pagination={{
                            hideOnSinglePage: true,
                            onChange: (page) => onDepartmentChange(page),
                            total: departmentPageCount,
                            current: departmentPage,
                            pageSize: parseInt($pageSize, 10),
                            showSizeChanger: false,
                            defaultPageSize: 10,
                            showQuickJumper: true,
                            showTotal: () => null,
                            position: 'bottom',
                          }}
                          locale={{
                            emptyText: '未有部門資訊',
                          }}
                          renderItem={(item) => (
                            <List.Item
                              className={Style.oraRightListItem}
                              onClick={() => {
                                getDeptInfo(`${item.companyDepartmentId}`);
                              }}
                            >
                              <div className={Style.oraRightListItemContent}>
                                <p className={Style.oraRightListItemName}>
                                  <img className={Style.oraOthersIcon} src={othersStructure} />
                                  <Ellipsis>{item.companyDepartmentName}</Ellipsis>（
                                  {item.accountCount}）
                                </p>
                                <RightOutlined />
                              </div>
                            </List.Item>
                          )}
                        />
                        {personPageList.length > 0 && <Divider className={Style.oraRightDivider} />}
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
                <List
                  id="J_Popover"
                  className={Style.oraRightPersonList}
                  itemLayout="horizontal"
                  dataSource={personPageList}
                  split={false}
                  loading={personLoading}
                  pagination={{
                    hideOnSinglePage: true,
                    onChange: (page) => onPersonChange(page),
                    total: personPageCount,
                    current: personPage,
                    pageSize: parseInt($pageSize, 10),
                    showSizeChanger: false,
                    defaultPageSize: 10,
                    showQuickJumper: true,
                    showTotal: () => null,
                    position: 'bottom',
                  }}
                  locale={{
                    emptyText: '此部門未有員工',
                  }}
                  renderItem={(item) => (
                    <List.Item
                      className={Style.oraRightPersonItem}
                      onClick={() => {
                        openMemberInfo(kToString(item.accountId));
                      }}
                    >
                      <div className={Style.oraRightPersonItemContent}>
                        {item.avatar ? (
                          <Popover
                            placement="rightTop"
                            getPopupContainer={() =>
                              document.getElementById('J_Popover') || document.body
                            }
                            overlayClassName={Style.oraRightPopoverWapper}
                            content={
                              <KPayAvatar
                                className={Style.oraRightPersonCircleAvatar}
                                avatarClass={Style.oraRightPopoverItemAvatar}
                                style={{ marginRight: 0 }}
                                inAvatar
                                avatar={item.avatar || ''}
                                showName={item.name}
                              />
                            }
                          >
                            <KPayAvatar
                              className={Style.oraRightPersonCircleAvatar}
                              avatarClass={Style.oraRightPersonItemAvatar}
                              inAvatar
                              avatar={item.avatar || ''}
                              showName={item.name}
                            />
                          </Popover>
                        ) : (
                          <KPayAvatar
                            className={Style.oraRightPersonCircleAvatar}
                            avatarClass={Style.oraRightPersonItemAvatar}
                            inAvatar
                            avatar={item.avatar || ''}
                            showName={item.name}
                          />
                        )}
                        <div>
                          <div className={Style.oraRightPersonNameContent}>
                            <Ellipsis className={Style.oraRightPersonItemName}>
                              {item.name}
                            </Ellipsis>
                            {item.manager ? (
                              <p className={Style.oraRightPersonItemTag}>主管</p>
                            ) : (
                              ''
                            )}
                          </div>
                          <p className={Style.oraRightPersonItemPosition}>{item.position}</p>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Spin>
          </Skeleton>
        </Col>
      </Row>

      <AddMemberDrawer
        visible={addMemberVisible}
        memberId={memberId}
        companyId={companySelectId}
        closeMethod={(reload?: boolean) => {
          if (reload) {
            getDeptInfo(companyDepartmentId);
          }
          hideAddMemberDrawer();
        }}
      />
    </NormalLayout>
  );
};

export default StructureMange;
