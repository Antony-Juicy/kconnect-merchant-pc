import type { AccountOperateGuideRecordListResponse } from '@/services/api';
import { useState } from 'react';

export default function useOperationModel() {
  const [operationRefresh, setOperationRefresh] = useState<AccountOperateGuideRecordListResponse>(
    {} as AccountOperateGuideRecordListResponse,
  );
  return {
    operationRefresh,
    setOperationRefresh,
  };
}
