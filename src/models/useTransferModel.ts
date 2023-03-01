import type { TTransferAysnc } from '@/components/TransferModal'
import { useState, useCallback } from 'react'


export default function useTransferModel() {
  // 部門列表
  const [deptList, setDeptList] = useState<any[]>([])
  const [keyMapDeptList, setKeyMapDeptList] = useState<Record<string, any>>({})
  // 人員列表
  const [personList, setPersonList] = useState<any[]>([])
  const [keyMapPersonList, setKeyMapPersonList] = useState<Record<string, any>>({})
  const [transferList, setTransferList] = useState<TTransferAysnc>({list:  [], keyMap: {}})
  const [originTransferList, setOriginTransferList] = useState<TTransferAysnc>({list:  [], keyMap: {}})

  const changeDeptList = useCallback((list: any[]) => {
    setDeptList(list)
  }, [])

  const changeKeyMapDeptList = useCallback((list: any) => {
    setKeyMapDeptList(list)
  }, [])

  const changePersonList = useCallback((list: any[]) => {
    setPersonList(list)
  }, [])

  const changeKeyMapPersonList = useCallback((list: any) => {
    setKeyMapPersonList(list)
  }, [])

  const changeCheckedList = useCallback((list: string[], keyMap: any) => {
    setTransferList({list, keyMap})
  }, [])

  const changeOriginTransferList = useCallback((data: TTransferAysnc) => {
    setOriginTransferList(data)
  }, [])

  // 删除
  const removeTransferList = useCallback(() => {
    setTransferList({list: [], keyMap: {}})
  }, [])


  return {
    deptList,
    transferList,
    keyMapDeptList,
    personList,
    keyMapPersonList,
    originTransferList,

    removeTransferList,
    changeDeptList,
    changeOriginTransferList,
    changePersonList,
    changeKeyMapPersonList,
    changeKeyMapDeptList,
    changeCheckedList,
  }
}
