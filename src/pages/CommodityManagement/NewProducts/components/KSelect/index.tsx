import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import dropIcon from '@/assets/images/products/dropIcon.png';
import activeDropIcon from '@/assets/images/products/activeDropIcon.png';
import classNames from 'classnames';
import useLocale from '@/hooks/useLocale';

type OptionProps = { companyProductSkuPropertyNameId: number; propertyName: string };

interface KSelectProps {
  list: OptionProps[];
  value: string;
  option: string;
  onChange: (option: string, value: string, data: OptionProps) => void;
}

const KSelect: React.FC<KSelectProps> = ({ list, option, value, onChange }) => {
  const { getMessage } = useLocale();
  const domRef = useRef(null);
  const openDomRef = useRef(null);
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    const onClickHandle = (e: any) => {
      if (openDomRef.current == e.target) {
        return;
      }
      if (domRef.current) {
        const inside = (domRef.current as HTMLElement)?.contains(e.target);
        setIsInside(inside);
      } else {
        setIsInside(false);
      }
    };
    document.addEventListener('click', onClickHandle, false);

    return () => {
      document.removeEventListener('click', onClickHandle, false);
    };
  }, []);

  const clickItem = (data: OptionProps) => {
    onChange(option, value, data);
    setIsInside(false);
  };

  return (
    <div
      className={classNames({
        [styles.selectWrapper]: true,
        [styles.activeSelect]: isInside,
      })}
    >
      <img
        className={styles.dropIcon}
        src={isInside ? activeDropIcon : dropIcon}
        ref={openDomRef}
        onClick={() => setIsInside(true)}
      />
      {isInside ? (
        <div className={classNames({
          [styles.selectList]: true,
          [styles.hideScrollBar]: list.length<=3,
        })} ref={domRef}>
          {list.length ? (
            list.map((item) => (
              <div
                key={item.companyProductSkuPropertyNameId}
                className={styles.selectItem}
                onClick={() => clickItem(item)}
              >
                {item.propertyName}
              </div>
            ))
          ) : (
            <div className={styles.emptyPage}>
              <div className={styles.emptyItem}>
                {getMessage('commodity.addProduct.option.empty.title', '暫無數據可供選擇')}
              </div>
              <div className={styles.emptyItem}>
                {getMessage(
                  'commodity.addProduct.option.empty.desc',
                  '在上方編輯內容後點擊右側保存按鈕進行添加',
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default KSelect;
