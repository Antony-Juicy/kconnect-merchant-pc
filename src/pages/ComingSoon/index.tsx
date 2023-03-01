import emptyIcon from '@/assets/svgs/noDataBg.svg';
import NormalLayout from '@/components/Layout/NormalLayout';
import useLocale from '@/hooks/useLocale';
import React from 'react';
import Style from './index.less';

const Comming: React.FC = () => {
  const { getMessage } = useLocale();
  return (
    <>
      <NormalLayout>
        <div className={Style.wrapper}>
          <div>
            <img src={emptyIcon} className={Style.emptyImg} />
          </div>
          <p className={Style.tip}>
            <p>{getMessage('commingsoon.thefeatureiscomingsoon', '此功能即將推出')}</p>
            <p>
              {getMessage(
                'commingsoon.ifyouareinsterestedpleasecontactusthroughtheinstantmessagebuttonontheright',
                '如有興趣可通過右側「即時訊息」按鈕和我們聯絡',
              )}
            </p>
          </p>
        </div>
      </NormalLayout>
    </>
  );
};

export default Comming;
