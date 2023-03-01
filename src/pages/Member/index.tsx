import { merchantApi } from '@/services';
import type { ProColumns } from '@ant-design/pro-table';
import { Input, message, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
// import { useForm } from 'antd/lib/form/Form';
import DetaiLsaVatar from '@/assets/images/detailsavatar.png';
import Mail from '@/assets/svgs/Mail.svg';
import telephone from '@/assets/svgs/telephone.svg';
import KPayTable from '@/components/Fields/kpay-table';
import NormalLayout from '@/components/Layout/NormalLayout/index';
import DetailDrawer from '@/components/memberDrawer/detail';
import EditDrawer from '@/components/memberDrawer/edit';
import useLocale from '@/hooks/useLocale';
import type { MemberInfoResponse } from '@/services/api';
import { MEMBERAVATAR } from '@/utils/constants';
import type { IApiResponse } from '@/utils/request';
import { useBoolean } from 'ahooks';
import styles from './index.less';

import moment from 'moment';

type IAuditProps = {
  key: number;
  name: string;
  createdAt: number;
};
const Member: React.FC = () => {
  const { getMessage } = useLocale();
  // const [tableData, setTableData] = useState<any>({});
  const [details, setDetails] = useState<any>({});
  const [memberCode, setMemberCode] = useState<string>('');
  const [memberEdit, setMemberEdit] = useState<any>({});
  // 详情弹窗
  const [detailsPopup, { setTrue: showDetailsPopup, setFalse: hideDetailsPopup }] =
    useBoolean(false);
  // 编辑弹窗
  const [editDrawer, { setTrue: showEditDrawer, setFalse: hideEditDrawer }] = useBoolean(false);

  const [searchResults, setSearchResults] = useState<any>(true);
  // 弹窗按钮loading
  const [drawerBtnLoading, { setTrue: showDrawerBtnLoading, setFalse: hideDrawerBtnLoading }] =
    useBoolean(false);
  const ref = useRef<any>();
  const editDrawerRef = useRef<any>();
  // const [formInstance] = useForm();

  // 搜索
  const searchColumns: ProColumns<IAuditProps>[] = [
    {
      title: getMessage('merchant.audit.classification.name', '姓名'),
      dataIndex: 'memberName',
      hideInTable: true,
      formItemProps: { colon: false },
      renderFormItem: () => {
        return (
          <Input
            allowClear
            placeholder={getMessage('member.Please.enter.your.name', '請輸入姓名')}
          />
        );
      },
    },

    {
      title: getMessage('member.Contact.number', '聯絡電話'),
      dataIndex: 'mobile',
      hideInTable: true,
      formItemProps: { colon: false },
      renderFormItem: () => {
        return (
          <Input allowClear placeholder={getMessage('member.contact.mobile', '請輸入聯絡電話')} />
        );
      },
    },
    {
      title: getMessage('member.merchant.Email.address', '電郵'),
      dataIndex: 'email',
      hideInTable: true,
      formItemProps: { colon: false },
      renderFormItem: () => {
        return <Input allowClear placeholder={getMessage('member.email', '請輸入電郵')} />;
      },
    },
  ];

  // 详情
  const gotoDetail = (item: any) => {
    setMemberCode(item);
    showDetailsPopup();
    merchantApi
      .getMemberInfo({ memberCode: item })
      .then((res: IApiResponse<MemberInfoResponse>) => {
        if (`${res.code}==='10000` && res.data && res.success) {
          setDetails(res.data);
        }
      })
      .catch(() => {
        hideDetailsPopup();
      });
  };

  // 关闭弹窗
  const closeDrawer = () => {
    hideDetailsPopup();
  };

  // 详情 、编辑弹窗的顺序关闭
  const gotoEdit = () => {
    hideDetailsPopup();
    showEditDrawer();
    merchantApi
      .getMemberInfo({ memberCode: memberCode })
      .then((res) => {
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
          copyData.birthday = res.data.birthday ? moment(Number(res.data.birthday)) : null;
          copyData.categoryData = [...categoryData];
          setMemberEdit(copyData);
        }
      })
      .catch(() => {
        hideEditDrawer();
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
    showDrawerBtnLoading();
    const param: any = {
      memberCode: memberCode,
      ...data,
    };
    delete param.age;
    merchantApi
      .postMemberModify(param)
      .then(() => {
        hideDrawerBtnLoading();
        hideEditDrawer();
        ref.current.reload();
        message.success(getMessage('common.save.success', '保存成功'));
      })
      .catch(() => {
        hideDrawerBtnLoading();
        hideEditDrawer();
      });
  };

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
        <div className={styles.memberShipList} onClick={gotoDetail.bind(null, data.memberCode)}>
          <div className={styles.avatar}>
            <img src={MEMBERAVATAR[data?.gender - 1]} className={styles.memberAvatar} />
          </div>
          <div className={styles.member_name}>
            <div className={styles.memberLastName}>
              <Tooltip placement="topLeft" title={`${data.firstName}  ${data.lastName}`}>
                {`${data.firstName} ${data.lastName}`}
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
        <div onClick={gotoDetail.bind(null, record.memberCode)} className={styles.cionTypeId}>
          <a className={styles.goDetail}>
            <img src={DetaiLsaVatar} className={styles.detailIcon} />
          </a>
        </div>
      ),
    },
  ];

  //表头
  const headerTitle = () => {
    return (
      <>
        {searchResults ? (
          <>
            <span className={styles.tableTitle}>{getMessage('member.list', '會員列表')}</span>
          </>
        ) : (
          <>
            <span className={styles.tableTitle}>
              {' '}
              {getMessage('member.search.results', '搜尋結果')}
            </span>
          </>
        )}
      </>
    );
  };

  const columns = [...searchColumns, ...tableColumns];

  return (
    <NormalLayout className={styles.min}>
      <KPayTable
        actionRef={ref}
        columns={columns}
        search={{
          labelWidth: 70,
          searchText: getMessage('common.search', '搜尋'),
        }}
        locale={{
          emptyText: (
            <div className={styles.emptyText}>
              {getMessage('member.information', '未搜尋到會員資訊')}
            </div>
          ),
        }}
        request={async (params: any) => {
          const copy = { ...params };
          if (copy.memberName) {
            copy.memberName = copy.memberName.replaceAll(' ', '');
          }
          if (copy.mobile) {
            copy.mobile = copy.mobile.replaceAll(' ', '');
          }
          const res = await merchantApi.getMemberListPage(copy);
          return {
            data: res?.data?.data,
            success: true,
            total: res?.data?.totalCount,
          };
        }}
        options={false}
        headerTitle={headerTitle()}
        rowKey="merchantId"
        dateFormatter="string"
        onSubmit={() => {
          setSearchResults(false);
        }}
        onReset={() => {
          setSearchResults(true);
          ref.current.reload();
        }}
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
        btnLoading={drawerBtnLoading}
      />
    </NormalLayout>
  );
};

export default Member;
