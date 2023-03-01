import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd/lib/input';
import { omit } from 'lodash';
import TrimCompent from '../tool-components/TrimCompent';
import useLocale from '@/hooks/useLocale';

export interface TrimInputProps extends InputProps {
  renderType?: string;
  specific?: string;
  trimSpace?: boolean;
}

const TrimInput: React.FC<TrimInputProps> = (props) => {
  const { getMessage } = useLocale();

  const $_props = omit(props, 'renderType', 'trimSpace');

  let $_placeholder = $_props.placeholder;
  if (!$_placeholder) {
    switch (props.renderType) {
      case 'search':
        $_placeholder = getMessage('common.place.input.keyword', '請輸入關鍵字查詢');
        break;
      default:
        $_placeholder = getMessage('common.placeholder', '請輸入') + (props.specific || '');
        break;
    }
  }

  if (!$_props.autoComplete) {
    $_props.autoComplete = 'off';
  }

  return (
    <TrimCompent {...$_props}>
      {(onBlurHandler: React.FocusEventHandler<HTMLInputElement>) => (
        <Input {...$_props} placeholder={$_placeholder} onBlur={onBlurHandler} />
      )}
    </TrimCompent>
  );
};

export default TrimInput;
