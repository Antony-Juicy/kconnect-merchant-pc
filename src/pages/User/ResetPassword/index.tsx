import React, { useEffect } from 'react';

import Head from '@/components/Head';
import ProCards from './components/ProCard';
import styles from './index.less';

import { event } from '@/utils/buriedPoint/ga4';
import BuriedPoint from '@/utils/buriedPoint/ga4events';

const ResetPassword: React.FC = () => {
  useEffect(() => {
    event(BuriedPoint.KCLOGIN_FORGOTPW1_VIEWED);
  }, []);
  return (
    <div className={styles.miw}>
      <Head />
      <ProCards />
    </div>
  );
};

export default ResetPassword;
