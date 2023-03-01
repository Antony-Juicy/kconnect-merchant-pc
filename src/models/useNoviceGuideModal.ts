import { useState } from 'react';

export default function useEnterpriseModel() {
  const [appMenuGuide, setAppMenuGuide] = useState<boolean>(false);

  return {
    appMenuGuide,
    setAppMenuGuide,
  };
}
