// 企业資訊 Model
import type { IEnterpriseProps } from '@/interfaces';
import type { CommonAccountInfoResponse } from '@/services/api';
import { setCompanyId } from '@/utils/auth';
import { kToString } from '@/utils/utils';
import { useState, useCallback } from 'react';

export type TypeEnterprise = CommonAccountInfoResponse & IEnterpriseProps;

export default function useEnterpriseModel() {
  const [enterprise, setEnterprise] = useState<TypeEnterprise>({} as TypeEnterprise);

  const updateEnterprise = useCallback((info: TypeEnterprise) => {
    setEnterprise(info);
    setCompanyId(kToString(info.companyId) || '');
  }, []);

  return {
    enterprise,
    updateEnterprise,
  };
}
