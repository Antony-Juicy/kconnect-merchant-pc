import detailsavatar from '@/assets/images/detailsavatar.png';
import Mail from '@/assets/svgs/Mail.svg';
import telephone from '@/assets/svgs/telephone.svg';
import KPayTable from '@/components/Fields/kpay-table';
import NormalLayout from '@/components/Layout/NormalLayout/index';
import DetailDrawer from '@/components/memberDrawer/detail';
import EditDrawer from '@/components/memberDrawer/edit';
import useLocale from '@/hooks/useLocale';
import { merchantApi } from '@/services';
import type { MemberCategoryInfoResponse, MemberInfoResponse } from '@/services/api';
import { MEMBERAVATAR } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import { Card, Empty, message, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const MemberCategoryDetails: React.FC = (props: any) => {
  const { id } = props.match.params;
  const { getMessage } = useLocale();
  // const [tableData, setTableData] = useState<any>({});
  const [details, setDetails] = useState<any>({});
  const [memberCode, setMemberCode] = useState<any>('');
  const [memberEdit, setMemberEdit] = useState<any>({});
  const [menderDetail, setMenderDetail] = useState<any>(null);

  const [MenderDetail, { setTrue: showMemberDetailsr, setFalse: hideMemberDetails }] =
    useBoolean(false);
  // 详情弹窗
  const [detailsPopup, { setTrue: showDetailsPopup, setFalse: hideDetailsPopup }] =
    useBoolean(false);
  // 编辑弹窗
  const [editDrawer, { setTrue: showEditDrawer, setFalse: hideEditDrawer }] = useBoolean(false);

  const ref = useRef<any>();
  const editDrawerRef = useRef<any>();
  const intl = useLocale();

  // 详情
  const gotoDetail = (item: any) => {
    setMemberCode(item);
    merchantApi
      .getMemberInfo({ memberCode: item })
      .then((res: IApiResponse<MemberInfoResponse>) => {
        if (`${res.code}==='10000` && res.data && res.success) {
          setDetails(res.data);
          showDetailsPopup();
        }
      })
      .catch(() => {});
  };

  // 會員類別詳情
  useEffect(() => {
    if (id) {
      showMemberDetailsr();
      merchantApi
        .getMemberCategoryInfo({ memberCategoryId: id })
        .then((res: IApiResponse<MemberCategoryInfoResponse>) => {
          hideMemberDetails();
          if ('10000' === `${res.code}`) {
            setMenderDetail(res.data);
          }
        })
        .catch(() => {
          hideMemberDetails();
        });
    }
  }, []);

  // 关闭弹窗
  const closeDrawer = () => {
    hideDetailsPopup();
  };

  // 详情 、编辑弹窗的顺序关闭
  const gotoEdit = () => {
    hideDetailsPopup();
    merchantApi.getMemberInfo({ memberCode: memberCode }).then((res) => {
      if (`${res.code}==='10000` && res.data && res.success) {
        const idArray: string[] = []; //categoryData
        const categoryData: any[] = [];
        const copy = [...res.data.memberCategoryList];
        copy.map((item: any) => {
          idArray.push(item.memberCategoryId);
          categoryData.push({
            memberCategoryId: item.memberCategoryId,
            memberCategoryName: item.memberCategoryName,
          });
        });
        // 数据处理
        /**
         * 复制会员详情数据，即copyData
         * 為copyData添加 phone 字段，包含區號mobileAreaCode、手機號mobile兩個字段
         * 為copyData添加 memberCategoryList 字段，是類別id的字符串數組，用作表單提交的實質內容
         * 為copyData添加 categoryData 字段，為對象數組，每個內部元素包含 memberCategoryId ，memberCategoryName，用於組件內回顯類別內容
         */
        const copyData: any = { ...res.data };
        copyData.phone = {
          mobileAreaCode: res.data.mobileAreaCode,
          mobile: res.data.mobile,
        };
        copyData.memberCategoryList = idArray;
        copyData.birthday = moment(Number(res.data.birthday));
        copyData.categoryData = [...categoryData];
        setMemberEdit(copyData);
        showEditDrawer();
      }
    });
  };

  const showConfirm = () => {
    editDrawerRef.current.parentComponentShowConfirm();
  };

  // 编辑弹窗按 右上角关闭
  const onCloseEdit = () => {
    showConfirm();
  };

  // 编辑弹窗按 去掉
  const closeEdit = () => {
    hideEditDrawer();
    showConfirm();
  };

  // 提交 保存
  const fecthData = (data: any) => {
    const param: any = {
      memberCode: memberCode,
      ...data,
    };
    delete param.age;
    merchantApi
      .postMemberModify(param)
      .then(() => {
        hideEditDrawer();
        ref.current.reload();
        message.success(getMessage('common.save.success', '保存成功'));
      })
      .catch(() => {
        hideEditDrawer();
      });
  };

  //表头
  const headerTitle = () => (
    <span className={styles.tableTitle}>{getMessage('member.list', '會員列表')}</span>
  );

  // 区号 手机号
  const mobileAreaCode = (areaCode: any, mobile: any) => {
    if (areaCode && mobile) {
      return `+${areaCode} ${mobile}`;
    } else if (mobile && !areaCode) {
      return `${mobile}`;
    } else {
      return `-`;
    }
  };

  // 表格
  const tableColumns: any = [
    {
      title: getMessage('member.payment.method', '付款方式'),
      dataIndex: 'title',
      search: false,
      align: 'left',
      render: (text: string, data: any) => (
        <div className={styles.memberships} onClick={gotoDetail.bind(null, data.memberCode)}>
          <div className={styles.avatar}>
            <img src={MEMBERAVATAR[data.gender - 1]} className={styles.memberAvatar} />
          </div>
          <div className={styles.member_name}>
            <div className={styles.membersName}>
              <Tooltip placement="topLeft" title={`${data.firstName}  ${data.lastName}`}>
                {`${data.firstName}`}&emsp;
                {`${data.lastName}`}
              </Tooltip>
            </div>
            <div className={styles.memberName}>
              <span className={styles.memberMobile}>
                <img src={telephone} className={styles.phone} alt="" />{' '}
                {mobileAreaCode(data?.mobileAreaCode, data?.mobile)}
              </span>
              <div className={styles.mailLeft}>
                <img src={Mail} alt="" className={styles.mail} />
                <Tooltip placement="topLeft" title={data?.email ? data?.email : '-'}>
                  {data?.email ? data?.email : '-'}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      dataIndex: 'cionTypeId',
      search: false,
      align: 'left',
      render: (text: any, record: any) => (
        <div onClick={gotoDetail.bind(null, record.memberCode)}>
          <a className={styles.goDetail}>
            <img src={detailsavatar} className={styles.detailIcon} />
          </a>
        </div>
      ),
    },
  ];

  const columns = [...tableColumns];

  return (
    <>
      <NormalLayout
        className={styles.min}
        visible
        title={`${intl.getMessage('member.category.detail', '類別詳情')}`}
      >
        <Card className={styles.card} loading={MenderDetail}>
          <div className={styles.cardTitle}>
            {getMessage('member.category.details', '會員類別詳情')}
          </div>
          <div className={styles.cardAvatar}>
            <img src={menderDetail?.avatar} className={styles.iconAvatar} />
            <div className={styles.lastName}>{menderDetail?.memberCategoryName}</div>
          </div>
          <div className={styles.memberLabels}>
            <div className={styles.label}> {getMessage('member.groupName', '該類別標籤')} :</div>
            <div className={styles.memberLeft}>
              <div className={styles.lasTag}>
                {menderDetail?.memberCategoryTagList &&
                  menderDetail?.memberCategoryTagList.map((item: any) => {
                    return (
                      <div className={styles.memberList} key="item">
                        {item}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className={styles.category}>
            <div className={styles.tags}>
              {getMessage('member.Category.introduction', '類別簡介')} :
            </div>
            <div className={styles.introduction}>{menderDetail?.description}</div>
          </div>
        </Card>
        <KPayTable
          actionRef={ref}
          columns={columns}
          search={false}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<p>{getMessage('member.information', '未搜尋到會員資訊')}</p>}
                />
              </div>
            ),
          }}
          request={async (params: any) => {
            const res = await merchantApi.getMemberListPage({ ...params, memberCategoryId: id });
            // setTableData(res.data);
            return {
              data: res.data.data,
              success: true,
              total: res.data.totalCount,
            };
          }}
          options={false}
          headerTitle={headerTitle()}
          rowKey="merchantId"
          dateFormatter="string"
          simplePaginationChange={{
            showTotal: (a) =>
              `${getMessage('member.total.of', '共')} ${a} ${getMessage('member.a', '個')}`,
          }}
        />

        <DetailDrawer
          data={details}
          visible={detailsPopup}
          title={getMessage('member.Membership.information', '會員資訊')}
          onClose={closeDrawer}
          closeDrawer={gotoEdit}
          width={560}
        />

        <EditDrawer
          ref={editDrawerRef}
          data={memberEdit}
          visible={editDrawer}
          title={getMessage('member.edit.information', '編輯會員資訊')}
          onClose={onCloseEdit}
          closeDrawer={closeEdit}
          width={450}
          maskClosable={false}
          sumbitData={fecthData}
        />
      </NormalLayout>
    </>
  );
};

export default MemberCategoryDetails;
