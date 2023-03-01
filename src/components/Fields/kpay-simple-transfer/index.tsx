import React from 'react';
import { Transfer } from 'antd';
import type { TransferProps } from 'antd';
import { omit } from 'lodash';
// import cx from 'classnames';
import styles from './index.less';

type RecordType = {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
};

type TKPaySimpleTransfer = {
  // data: any
  setTargetKeys: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedKeys?: React.Dispatch<React.SetStateAction<string[]>>;
  setDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
} & TransferProps<RecordType>;

const KPaySimpleTransfer: React.FC<TKPaySimpleTransfer> = (props) => {
  const newTransferProps = omit(props, 'oneWay');

  const handleChange = (newTargetKeys: string[]) => {
    props.setTargetKeys(newTargetKeys);
  };

  const handleSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    if (props.setSelectedKeys) {
      props.setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    }
  };

  return (
    <div className={styles.baseTransfer}>
      <Transfer
        {...newTransferProps}
        onChange={handleChange}
        targetKeys={props.targetKeys}
        selectedKeys={props.selectedKeys || []}
        onSelectChange={handleSelectChange}
        render={(item) => item.title}
        oneWay
      />
    </div>
  );
};

export default KPaySimpleTransfer;
