import React, { useEffect } from 'react';
// import { history } from 'umi';
import { useBoolean } from 'ahooks';
import { Card, Button } from 'antd';
import styles from './index.less';
import DetailDrawer from '@/components/memberDrawer/detail';
import EditDrawer from '@/components/memberDrawer/edit';
// import { merchantApi } from '@/services';

const testData = {
  memberCode: '123456',
  lastName: '劉',
  firstName: '備備',
  mobile: '13660888333',
  email: 'liuBB@163.com',
  gender: 1,
  birthday: 1011497710000,
  age: 20,
  memberCategoryList: [
    {
      memberCategoryId: 11,
      memberCategoryName: '白金會員',
    },
    {
      memberCategoryId: 12,
      memberCategoryName: '時尚達人',
    },
    {
      memberCategoryId: 13,
      memberCategoryName: '長期顧客',
    },
    {
      memberCategoryId: 14,
      memberCategoryName: '回頭又回頭（即沒有回頭）客',
    },
  ],
  memberTagList: ['大氣層成功人士', '王思聰的好朋友', '每天四頓飯以及兩頓下午茶', '消費降級'],
  totalAmount: 1650,
  consumeCount: 5,
  averageAmount: 130,
  registerTime: 1654459441064,
  sourceApplicationName: '村口聽回來的',
  modifyTime: 1654529441064,
  modifyAccount: 'LBB',
};

const Test: React.FC = () => {
  // const [questionData, setQuestionData] = useState<any>(null);
  const [detailsDrawer, { setTrue: showDetailsDrawer, setFalse: hideDetailsDrawer }] =
    useBoolean(false);
  const [editDrawer, { setTrue: showEditDrawer, setFalse: hideEditDrawer }] = useBoolean(false);

  useEffect(() => {
    // init(1, 10)
  }, []);

  const openDetails = () => {
    showDetailsDrawer();
  };

  const closeDrawer = () => {
    hideDetailsDrawer();
  };

  const openEdit = () => {
    showEditDrawer();
  };

  const closeEdit = () => {
    hideEditDrawer();
  };

  const gotoEdit = () => {
    hideDetailsDrawer();
    showEditDrawer();
  };

  const fecthData = (data: any) => {
    console.log('觸發父組件方法，提交表單的數據： ', data);
  };

  return (
    <div className={styles.mainContent}>
      <Card bordered={false} title="幫助中心" className={styles.cardBox}>
        <Button onClick={openDetails}>详情</Button>
        <Button onClick={openEdit}>编辑</Button>
      </Card>

      <DetailDrawer
        data={testData}
        visible={detailsDrawer}
        title="會員資訊"
        onClose={closeDrawer}
        closeDrawer={gotoEdit}
        width={560}
      />

      <EditDrawer
        data={testData}
        visible={editDrawer}
        title="編輯會員資訊"
        onClose={closeEdit}
        closeDrawer={closeEdit}
        width={450}
        maskClosable={false}
        sumbitData={fecthData}
      />
    </div>
  );
};

export default Test;
