import type { TCountDataProps } from '@/utils/constants';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import Styles from './index.less';

const isEqual = (prevProps: any, nextProps: any) => {
  return prevProps.data === nextProps.data;
};

type TCountModuleProps = {
  data?: TCountDataProps[];
};

const CountModule: React.FC<TCountModuleProps> = (props) => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    setData([...(props.data ?? [])]);
  }, [props]);

  return (
    <div className={Styles.countListContainer}>
      {data.map((item: any) => {
        return (
          <>
            <div key={item.url} className={Styles.item}>
              <div className={Styles.leftContainer}>
                <p className={Styles.labelContainer}>
                  <span className={Styles.label}>{item.label}</span>
                  <Tooltip
                    placement="top"
                    arrowPointAtCenter
                    color="#1D2129"
                    title={item.tip}
                    overlayInnerStyle={{
                      borderRadius: '4px',
                      border: '1px solid transparent',
                    }}
                  >
                    <QuestionCircleOutlined className={Styles.questionIcon} />
                  </Tooltip>
                </p>
                <p className={Styles.count}>{item.count}</p>
              </div>
              <img className={Styles.itemIcon} src={item.url} alt="" />
            </div>
          </>
        );
      })}
    </div>
  );
};
export default memo(CountModule, isEqual);
