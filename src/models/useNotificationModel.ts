// 企业資訊 Model
import { useState } from 'react';

// export type TypeEnterprise = CommonAccountInfoResponse & IEnterpriseProps;

export default function useEnterpriseModel() {
  const [listRefresh, setListRefresh] = useState<boolean>(false);

  return {
    listRefresh,
    setListRefresh,
  };
}
