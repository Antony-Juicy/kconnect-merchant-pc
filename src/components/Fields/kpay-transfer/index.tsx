import { merchantApi } from '@/services';
import type { CompanyAccountListDepartmentResponse, CompanyAccountNameResponse, CompanyAccountPageDepartmentResponse, CompanyAccountPageDepartmentResponseDetail, CompanyDepartmentInfoResponse, CompanyDepartmentListResponse, CompanyDepartmentRootResponse } from '@/services/api';
import type { IApiResponse } from '@/utils/request';
import type { RadioChangeEvent} from 'antd';
import { Breadcrumb, Button, Checkbox, Radio, Space, Spin } from 'antd';
import type { FormEvent} from 'react';
import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Input } from '../index';
import Style from './index.less';
import { CloseOutlined } from '@ant-design/icons';
import avatar from '@/assets/svgs/avatar.svg';
import { debounce, difference, keyBy, map, uniq } from 'lodash';
import { useModel } from 'umi';
import { isEmptyUtils } from '@/utils/utils';
import { useBoolean } from 'ahooks';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';

type TKpayTransfer = {
  transferInitData: boolean,
  parentId?: string,
  selectType?: 'onlyDepartment' | 'onlyPerson' | 'underPerson' | 'both',
  transferLoading?: boolean,
  transferReferch?: () => void,
  transferChildren?: (id?: string) => void,
  transferSearch?: (search?: string) => void,
  rowKey?: string,
  isRadio?: boolean,
  // checkedList: string[]
}

// 重新處理會員數據
const executePerson = (data: (any & {companyAccountId?: string, accountId?: string, formatAccountId?: string})[]) => {
  return data.map(item => {
    item.name = (item.companyAccountName || item.name)
    item.accountId = (item.companyAccountId || item.accountId)
    item.formatAccountId = 'person_' + item.accountId;
    return item
  })
}


const KpayTransfer: React.FC<TKpayTransfer> = (props) => {
  const {
    transferList, deptList, keyMapDeptList, personList, keyMapPersonList,
    changeDeptList, changeKeyMapDeptList, changeCheckedList,
    changePersonList,
    changeKeyMapPersonList,
    changeOriginTransferList
  } = useModel('useTransferModel');

  const [ loading, { setTrue: showLoading, setFalse: hideLoading } ] = useBoolean(false);

  // 麵包屑
  const [breadcrumb, setBreadcrumb] = useState<CompanyDepartmentInfoResponse[]>([]);

  // 搜索值
  const [searchValue, setSearchValue] = useState<string>('');
  // 部门搜索结果
  const [searchDeptResult, setSearchDeptResult] = useState<any[]>([]);
  // 人员搜索结果
  const [searchPersonResult, setSearchPersonResult] = useState<any[]>([]);
  // 可以选择的结果
  const [canSelectList, setCanSelectList] = useState<any[]>([]);

  // 全選
  const [checkAll, setCheckAll] = useState(false);

  // 删除穿梭框
  const deleteTransferItem = (item: string, index: number) => {
    const transferTemp = [...transferList.list]
    transferTemp.splice(index, 1)
    changeCheckedList(transferTemp, keyMapDeptList)
  }

  // 设置可选择列表
  const changeCanSelectList = (dept: any, person: any) => {
    let selectList = [];
    switch (props.selectType) {
      case 'onlyDepartment':
        selectList = map(dept, 'companyDepartmentId')
        break;
      case 'onlyPerson':
        selectList = map(person, 'formatAccountId')
      case 'underPerson':
        selectList = map(person, 'formatAccountId')
        break;
      case 'both':
        selectList = map(dept, 'companyDepartmentId').concat(map(person, 'formatAccountId'))
        break;
      default:
        selectList = map(dept, 'companyDepartmentId')
    }
    setCanSelectList(selectList)
    return selectList;
  }

  // 多选框组改变时
  const changeDept = (e: CheckboxChangeEvent | RadioChangeEvent | React.MouseEvent ) => {
    let transferTemp = [...transferList.list]
    const index = (transferTemp || []).indexOf(((e as RadioChangeEvent).target).value)
    if (index !== -1) {
      transferTemp.splice(index, 1)
    } else {
      if (props.isRadio) {
        transferTemp = [((e as RadioChangeEvent).target.value)]
      } else {
        transferTemp.push((e as CheckboxChangeEvent).target.value)
      }
    }

    transferTemp = uniq(transferTemp)
    setCheckAll((canSelectList || []).length === (transferTemp || []).length);
    changeCheckedList(transferTemp, keyMapDeptList)
  }

  // 多选框组全選
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    let transferTemp = [...transferList.list, ...(e.target.checked ? canSelectList: [])];
    if (e.target.checked) {
      transferTemp = [...transferList.list, ...canSelectList]
    } else {
      transferTemp =difference(transferList.list, canSelectList)
    }

    transferTemp = uniq(transferTemp)
    setCheckAll(e.target.checked);
    changeCheckedList(transferTemp, keyMapDeptList)
  }

  const initData = async (id?: string, searchContent?: string) => {
    let cachePersonData: any = {}
    let cacheCompanyData: any = {}

    let cachePersonList: any[] = []
    let cacheCompanyList: any[] = []

    showLoading()
    if (props.selectType !== 'underPerson') {
      await merchantApi.getCompanyDepartmentList({ searchContent, parentId: id })
        .then((company: IApiResponse<CompanyDepartmentListResponse>) => {
          if (company.success && company.data) {
            hideLoading()

            if (searchContent) {
              setSearchDeptResult(company.data)
            } else {
              cacheCompanyList = company.data
              changeDeptList(company.data)
            }
            cacheCompanyData = keyBy(company.data, 'companyDepartmentId')

          } else {
            hideLoading()
          }
        }).catch(() => {
          hideLoading()
        })
    }

    if (id) {
      await merchantApi.getCompanyAccountListDepartment({ companyDepartmentId: `${id}`, name: searchContent })
        .then((person: IApiResponse<CompanyAccountListDepartmentResponse>) => {
          if (person.success && person.data) {
            hideLoading()
            const personData = executePerson(person.data)

            if (searchContent) {
              setSearchPersonResult(personData)
            } else {
              cachePersonList = personData
              changePersonList(personData)
            }
            cachePersonData = keyBy(personData, 'formatAccountId')
          } else {
            hideLoading()
          }
        }).catch(() => {
          hideLoading()
        })
    } else if (searchContent) {
      await merchantApi.getCompanyAccountName({ name: searchContent })
        .then((person: IApiResponse<CompanyAccountNameResponse>) => {
          if (person.success && person.data) {
            hideLoading()
            const personData = executePerson(person.data)

            if (searchContent) {
              setSearchPersonResult(personData)
            } else {
              cachePersonList = personData
              changePersonList(personData)
            }
            cachePersonData = keyBy(personData, 'formatAccountId')
          } else {
            hideLoading()
          }
        }).catch(() => {
          hideLoading()
        })
    }
    changeCanSelectList(cacheCompanyList, cachePersonList)
    changeKeyMapDeptList(Object.assign({...keyMapDeptList}, cacheCompanyData, cachePersonData))
  }

  // 改变面包屑
  const changeBreadcrumb = (data: CompanyDepartmentInfoResponse) => {
    let $_breadcrumb = [...breadcrumb]
    breadcrumb.forEach((item, index) => {
      if (item.companyDepartmentId === data.parentId) {
        $_breadcrumb[index + 1] = data
        $_breadcrumb = $_breadcrumb.splice(0, index + 1)
        return
      }
      return
    })
    $_breadcrumb.push(data)

    setBreadcrumb([...$_breadcrumb])
  }

  // 获取下级
  const getChild = (data: CompanyDepartmentInfoResponse) => {
    changeBreadcrumb(data)

    if (props.transferChildren) {
      props.transferChildren(`${data.companyDepartmentId}`)
    } else {
      initData(`${data.companyDepartmentId}`)
    }
  }

  // 點擊切換麵包屑
  const clickBreadcrumb = (data: CompanyDepartmentInfoResponse, index: number) => {
    getChild(data)
    setBreadcrumb([...breadcrumb.splice(0, (breadcrumb.length - (1 + index)))])
  }

  // 麵包屑縮略時的菜單
  const menu = () => {
    const removeList = [...breadcrumb];
    removeList.splice(-1);
    removeList.reverse();

    return <div className={Style.kpayTransferList}>
      {
        removeList.map((item, index) => {
          if (index < breadcrumb.length - 1) {
            return <div
              className={Style.kpayTransferListItem}
              onClick={() => { clickBreadcrumb(item, index) }}
            >
              {item.companyDepartmentName}
            </div>
          }
          return <></>
        })
      }
    </div>
  }

  // 搜索商戶資訊獲取商戶列表
  const search = debounce((e: FormEvent<HTMLInputElement>) => {
    setSearchValue((e.target as HTMLInputElement).value)

    if (props.transferSearch) {
      props.transferSearch((e.target as HTMLInputElement).value)
    } else {
      initData(undefined, (e.target as HTMLInputElement).value)
    }
  }, 300)


  // 單、多選模式
  const radioCheckboxMode = (list?: any[]) => {
    const $_deptList = list || deptList
    if ($_deptList) {
      return $_deptList.map((item: CompanyDepartmentInfoResponse) => {
        return <div key={item.companyDepartmentId} className={Style.kpayTransferCheckbox}>
          {
            props.isRadio ?
            <Radio
              value={item.companyDepartmentId}
              checked={(transferList.list || []).includes(`${item.companyDepartmentId}`)}
              onChange={(e: CheckboxChangeEvent) => { changeDept(e) }}
              onClick={(e: React.MouseEvent) => { changeDept(e) }}
            >
              <div className={Style.kpayTransferCheckboxLabel}>{item.companyDepartmentName}</div>
            </Radio>
            :
            <Checkbox
              disabled={!!(props.selectType === 'onlyPerson')}
              value={item.companyDepartmentId}
              checked={(transferList.list || []).includes(`${item.companyDepartmentId}`)}
              onChange={(e: CheckboxChangeEvent) => {changeDept(e)}}
            >
              <div className={Style.kpayTransferCheckboxLabel}>{item.companyDepartmentName}</div>
            </Checkbox>
          }

          <Button
            type="text"
            disabled={!!((transferList.list || []).includes(`${item.companyDepartmentId}`))}
            className={
              cx(
                Style.kpayTransferCheckboxBtn,
                ((transferList.list || []).includes(`${item.companyDepartmentId}`) ? Style.kpayTransferDisableBtn : '')
              )
            }
            onClick={() => { getChild(item) }}
          >
            <Space size={"small"}>
              下級
              <div className={Style.kpayTransferCheckboxRight} />
            </Space>
          </Button>
        </div>
      })
    }
    return <></>
  }

  // 成員列表生成
  const getPersonData = (list?: any[]) => {
    const $_personList = list || personList
    if ($_personList) {
      return $_personList.map((item: CompanyAccountPageDepartmentResponseDetail & {departmentName?: string} & {formatAccountId?: string}) => {
        return <div key={item.formatAccountId} className={cx(Style.kpayTransferCheckbox, Style.kpayTransferPerson)}>
          {
            <Checkbox
              value={item.formatAccountId}
              checked={(transferList.list || []).includes(`${item.formatAccountId}`)}
              onChange={(e: CheckboxChangeEvent) => {changeDept(e)}}
            >
              <div className={Style.kpayTransferCheckboxLabel}>
                <div className={Style.kpayTransferPersonAvatar}>
                  <img src={item.avatar || avatar} alt="" />
                </div>
                <div>
                  <span>{item.name}</span>
                  <span>{item.departmentName}</span>
                </div>
              </div>
            </Checkbox>
          }
        </div>
      })
    }
    return <></>
  }

  // 初始化數據
  const getInitData = async () => {
    let cachePersonData: any = {}
    let cacheCompanyData: any = {}

    let cachePersonList: any[] = []
    let cacheCompanyList: any[] = []
    if (props.selectType === 'underPerson' && props.parentId) {
      showLoading()
      await merchantApi.getCompanyAccountListDepartment({ companyDepartmentId: `${props.parentId}` })
        .then((person: IApiResponse<CompanyAccountListDepartmentResponse>) => {
          if (person.success && person.data) {
            hideLoading()
            const personData = executePerson(person.data)
            changePersonList(personData)
            cachePersonList = personData
            cachePersonData = keyBy(personData, 'formatAccountId')
          } else {
            hideLoading()
          }
        })
    } else {
      showLoading()
      const company: IApiResponse<CompanyDepartmentRootResponse> = await merchantApi.getCompanyDepartmentRoot()
      if (company.success && company.data) {
        hideLoading()
        const childDepartmentList = (company.data.childDepartmentList || [])
        const rootDepartment = {
          ...company.data,
          companyDepartmentId: company.data.rootDepartmentId,
          child: (childDepartmentList.length > 0) ? 1 : 0
        }
        childDepartmentList.push(rootDepartment)

        changeDeptList([rootDepartment])
        cacheCompanyList = [rootDepartment]
        cacheCompanyData = keyBy(childDepartmentList, 'companyDepartmentId')
      } else {
        hideLoading()
      }

      showLoading()
      const person: IApiResponse<CompanyAccountListDepartmentResponse> = await merchantApi.getCompanyAccountListDepartment({companyDepartmentId: `${company.data.rootDepartmentId}`})
      if (person.success && person.data) {
        hideLoading()
        const personData = executePerson(person.data)
        changePersonList(personData)
        cachePersonList = personData
        cachePersonData = keyBy(personData, 'formatAccountId')
      } else {
        hideLoading()
      }
    }

    changeCanSelectList(cacheCompanyList, cachePersonList)
    changeKeyMapDeptList(Object.assign({...keyMapDeptList}, cacheCompanyData, cachePersonData))
  }

  useEffect(() => {
    setCheckAll((canSelectList || []).length === (transferList.list || []).length);
  }, [canSelectList])

  useEffect(() => {
    setBreadcrumb([])
    setCheckAll(false)
    if (props.transferInitData) {
      changeOriginTransferList({ ...transferList })
      if (props.transferReferch) {
        props.transferReferch()
      } else {
        getInitData()
      }
    }
  }, [props.transferInitData])

  return <Spin spinning={(!!props.transferLoading) || loading}>
    <div className={Style.kpayTransferWapper}>
      <div>
        <p>選擇</p>
        <div className={Style.kpayTransferContent}>
          {
            props.selectType !== 'underPerson' &&
            <Input.TrimInput className={Style.kpayTransferSearch} onChange={(value) => { search(value) }} />
          }
          <div
            className={cx(Style.kpayTransferCheckboxWapper, Style.niceScroll)}
            style={ !searchValue ? { display: 'none'} : {}}
          >
            {radioCheckboxMode(searchDeptResult)}
            {
              props.selectType === 'onlyPerson' || props.selectType === 'underPerson' || props.selectType === 'both' ?
              getPersonData(searchPersonResult)
              :
              <></>
            }
          </div>

          <div style={searchValue ? { display: 'none' } : {}}>
            <div className={Style.kpayTransferBreadcrumb} >
              <Breadcrumb separator=">">
                <Breadcrumb.Item className={Style.kpayTransferBreadcrumbItem} key={'kpay-transfer-breadcrumb-root-item'}>
                  公司架構
                </Breadcrumb.Item>
                {
                  breadcrumb.map((item, index) => {
                    if (breadcrumb.length >= 2) {
                      if (index < breadcrumb.length - 2) {
                        return null
                      }

                      if (index == breadcrumb.length - 2) {
                        return <Breadcrumb.Item className={Style.kpayTransferBreadcrumbItem} key={item.companyDepartmentId} overlay={menu()}>
                          ...
                        </Breadcrumb.Item>
                      }
                    }
                    return <Breadcrumb.Item key={item.companyDepartmentId} onClick={() => { getChild(item) }}>
                      {item.companyDepartmentName}
                    </Breadcrumb.Item>
                  })
                }
              </Breadcrumb>
            </div>

            <div className={cx(Style.kpayTransferCheckboxWapper, Style.niceScroll)}>
              <div className={Style.kpayTransferCheckboxGrp}>
                {
                  !props.isRadio &&
                  <Checkbox
                    className={Style.kpayTransferCheckbox}
                    style={{ justifyContent: 'normal' }}
                    checked={checkAll}
                    onChange={onCheckAllChange}
                  >
                    全選
                  </Checkbox>
                }
                {
                  props.selectType !== 'underPerson' &&
                  radioCheckboxMode()
                }
                {
                  props.selectType === 'onlyPerson' || props.selectType === 'both' || props.selectType === 'underPerson' ?
                  getPersonData()
                  :
                  <></>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={Style.kpayTransferOperationWapper}>
        <div className={Style.kpayTransferOperation} />
      </div>

      <div>
        <p>已選</p>
        <div className={Style.kpayTransferRightContent}>
          <div className={cx(Style.kpayTransferRightWapper, Style.niceScroll)}>
            {
              transferList.list &&
              transferList.list.map((item: string, index: number) => {
              if (!isEmptyUtils(item)) {
                if (item && transferList.keyMap[item]) {
                  return <div className={Style.kpayTransferRightItem} key={item}>
                    {
                      transferList.keyMap[item].formatAccountId ?
                      <div className={Style.kpayTransferCheckbox}>
                        <div className={Style.kpayTransferCheckboxLabel}>
                          <div className={Style.kpayTransferPersonAvatar}>
                            <img src={transferList.keyMap[item].avatar || avatar} alt="" />
                          </div>
                          {transferList.keyMap[item].name}
                        </div>
                      </div>
                      :
                      <span>{transferList.keyMap[item].companyDepartmentName}</span>
                    }
                    <Button type="text" className={Style.kpayTransferRightBtn} onClick={() => { deleteTransferItem(item, index) }}>
                      <CloseOutlined style={{ position:'relative', top: '-7px', left: '-3px' }} />
                    </Button>
                  </div>
                }
                return <></>
              }
              return <></>
            })
          }
          </div>
        </div>
      </div>
    </div>
  </Spin>
}

export default KpayTransfer;
