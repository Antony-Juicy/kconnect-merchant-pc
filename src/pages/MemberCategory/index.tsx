import React, { useState, useEffect } from 'react';
import { List, Divider, Form, Input, Button, Spin } from 'antd';
import { history } from 'umi';
import { useBoolean } from 'ahooks';
// import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './index.less';
import { merchantApi } from '@/services';
import useLocale from '@/hooks/useLocale';

// const mockItem = {
//   memberCategoryId: 0,
//   memberCategoryName: 'KPpay IT 全稱',
//   description: '會員類別的介紹，下面就让小編带大家一起了解吧',
//   memberCount: 1,
//   avatar:
//     'https://s3-test.kpay-group.com/png/20220409/1649500475418129.png?Expires=1655112365&Signature=s~AVqU2lhriToj2bALh~mRe9Ldv8Ucxz19U51RBVuxUcuMhWoF1mB3Wf3g8py1HY1ZBV~P9cnnmUQ-PoGnl1jxAXqw~lRTTsD5ZZDpTKxIjd0tMnXT--XE33~4i2ODH79N9ImoVZ6Ho4WJ38y9P7wrXjB~HHB2cHgCkehg9cB6buuEP3grMYDS7M9nnM-ohw7y8Pjldj1wtyIkW-oQbNwfkNPno6T8OmGUjbY4ivlT-D94VoU51Qlge3pcFbKmRCj8bJxqiOfIGn9rWMFY4bRCeE1FS~p33HPNCeriN0WT2cnjDUetZ71kiWJVDxQninKxP918qv62RxhBEUvxFTvA__&Key-Pair-Id=APKAIZZBJLO3AII75JSQ',
// };

// const mockData = Array.from({ length: 30 }).map((item, index) => {
//   const copy = mockItem;
//   return {
//     memberCategoryId: copy.memberCategoryId + index,
//     memberCategoryName: `KPpay IT 全稱 ${index}`,
//     description: `${index}_${copy.description}`,
//     memberCount: copy.memberCount * 100 * (index + 1),
//     avatar: index % 3 > 1 ? '' : copy.avatar,
//   };
// });

const MemberCategory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<string>('1');
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState<string>('');
  const [searchLoading, { setTrue: showSearchLoading, setFalse: hideSearchLoading }] =
    useBoolean(false);
  const [listsloading, { setTrue: showListsLoading, setFalse: hideListsLoading }] =
    useBoolean(true);
  const [operation, setOperation] = useState<'reset' | 'search' | null>(null);
  const [searchForm] = Form.useForm();
  const { getMessage } = useLocale();

  const searchData = (memberCategoryName?: string, memberCategoryDescription?: string) => {
    // console.log('searchData')
    if (searchLoading) {
      return;
    }
    setLoading(true);
    showSearchLoading();
    showListsLoading();
    merchantApi
      .getMemberCategoryPage({
        page: '1',
        memberCategoryName: memberCategoryName ?? '',
        memberCategoryDescription: memberCategoryDescription ?? '',
        rows: '30',
      })
      .then((res) => {
        if (res.success) {
          hideListsLoading();
          const getData = [...res.data.data];
          // const getData = [...data, ...mockData];
          const more: boolean = getData.length < res.data.totalCount;
          setData(getData);
          setHasMore(more);
          setPage('2');
          setCategoryName(memberCategoryName || '');
          setCategoryDescription(memberCategoryDescription || '');
          setLoading(false);
          hideSearchLoading();
        }
      })
      .catch(() => {
        setLoading(false);
        hideSearchLoading();
        hideListsLoading();
      });
  };

  const loadMoreData = () => {
    // console.log('loadMoreData')
    if (loading) {
      return;
    }
    setLoading(true);
    if (Number(page) === 1) {
      showListsLoading();
    }
    merchantApi
      .getMemberCategoryPage({
        page: page,
        memberCategoryName: categoryName,
        memberCategoryDescription: categoryDescription,
        rows: '30',
      })
      .then((res) => {
        hideListsLoading();
        if (res.success) {
          const getData = [...data, ...res.data.data];
          // const getData = [...data, ...mockData];
          const more: boolean = getData.length < res.data.totalCount;
          setData(getData);
          setHasMore(more);
          setPage(() => (Number(page) + 1).toString());
          setLoading(false);
          hideSearchLoading();
        }
      })
      .catch(() => {
        setLoading(false);
        hideSearchLoading();
        hideListsLoading();
      });
  };

  const onSearchFinish = () => {
    if (!searchLoading) {
      setOperation('search');
      setData([]);
    }
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  useEffect(() => {
    if(0 === data.length) {
      if ('search' === operation) {
        // console.log('search');
        setOperation(null);
        searchData(categoryName, categoryDescription);
      } else if ('reset' === operation) {
        // console.log('reset');
        setOperation(null);
        searchData('', '');
      }
    }
  }, [operation, data])

  const gotoDetail = (id: string) => {
    history.push(`/main/member/category/${id}`);
  };

  const categoryNameOnChange = (e: any) => {
    setCategoryName(e.target.value);
  }

  const descriptionOnChange = (e: any) => {
    setCategoryDescription(e.target.value);
  }

  const renderCard = (item: any) => {
    return (
      <div className={styles.itemCard} onClick={gotoDetail.bind(null, item.memberCategoryId)}>
        <div className={styles.name}>
          <div className={styles.avatar}>
            {item.avatar ? (
              <img src={item.avatar} className={styles.avatarImg} />
            ) : item.memberCategoryName ? (
              <div className={styles.avatarBg}>{item.memberCategoryName.slice(0, 1)}</div>
            ) : (
              ''
            )}
          </div>
          <div className={styles.title}>{item.memberCategoryName}</div>
          {/* <Ellipsis>{item.merchantName}</Ellipsis> */}
        </div>
        <div className={styles.line} />
        <div className={styles.infoItem} style={{ marginBottom: '12px' }}>
          <div className={styles.label}>{getMessage('memberCategory.description', '類別簡介')}</div>
          <div className={styles.value}>{item?.description || ''}</div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.label}>{getMessage('memberCategory.memberCount', '會員總數')}</div>
          <div className={styles.value}>{item?.memberCount || 0}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.categoryListWrap}>
      <div className={styles.searchForm}>
        <Form
          form={searchForm}
          colon={false}
          labelAlign="left"
          className={styles.search}
          onFinish={onSearchFinish}
        >
          <div className={styles.searchWrap}>
            <Form.Item
              label={getMessage('memberCategory.memberCategoryName', '類別名稱')}
              name="memberCategoryName"
            >
              <Input
                value={categoryName}
                onChange={categoryNameOnChange}
                placeholder={getMessage(
                  'memberCategory.memberCategoryName.placeholder',
                  '請輸入類別名稱',
                )}
              />
            </Form.Item>

            <Form.Item
              label={getMessage('memberCategory.description', '類別簡介')}
              name="description"
            >
              <Input
                value={categoryDescription}
                onChange={descriptionOnChange}
                placeholder={getMessage('memberCategory.description.placeholder', '請輸入類別簡介')}
              />
            </Form.Item>

            <div className={styles.searchBtnGroup}>
              <Button
                className={styles.cancelBtn}
                // loading={loading}
                onClick={() => {
                  searchForm.resetFields();
                  setOperation('reset');
                  setData([]);
                }}
              >
                {getMessage('common.resetFields', '重置')}
              </Button>
              <Button className={styles.sumbitBtn} type="primary" htmlType="submit">
                {searchLoading ? <LoadingOutlined /> : getMessage('common.search', '搜尋')}
              </Button>
            </div>
          </div>
        </Form>
      </div>
      <Spin spinning={listsloading}>
        <div id="scrollableDiv" className={styles.scrollableDiv}>
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreData}
            hasMore={hasMore}
            loader={
              <Divider plain>
                <LoadingOutlined />{' '}
                <span className={styles.tips}>
                  {getMessage('member.In.the.loading', '加載中……')}
                </span>
              </Divider>
            }
            endMessage={
              10 < data?.length ? (
                <Divider plain>
                  <span className={styles.tips}>
                    {getMessage('member.to.the.bottom', '已經到底啦~')}
                  </span>
                </Divider>
              ) : null
            }
            scrollableTarget="scrollableDiv"
          >
            <List
              locale={{ emptyText: getMessage('member.current.member', '未搜尋到类别資訊') }}
              dataSource={data}
              renderItem={(item) => <List.Item>{renderCard(item)}</List.Item>}
            />
          </InfiniteScroll>
        </div>
      </Spin>
    </div>
  );
};

export default MemberCategory;
