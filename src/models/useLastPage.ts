import { useState } from 'react';

export default function useEnterpriseModel() {
  const [flag, setFlag] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<number>(1);
  const [lastTabId, setLastTabId] = useState<string>('');

  return {
    flag,
    setFlag,
    lastPage,
    setLastPage,
    lastTabId,
    setLastTabId,
  };
}
