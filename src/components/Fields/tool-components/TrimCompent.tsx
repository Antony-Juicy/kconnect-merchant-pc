import type React from 'react';
import { trim } from 'lodash';

export type ITrimCompentProps<U = any> = {
  trimSpace?: boolean;
  children?: any;
} & U;

// 去除空格高阶组件
const TrimCompent: React.FC<ITrimCompentProps> = (props) => {
  const onBlurHandler = (event: React.FocusEvent<any>) => {
    if (event && event.target && event.target.value && props.trimSpace !== false) {
      // eslint-disable-next-line no-param-reassign
      event.target.value = trim(event.target.value);

      if (props.onChange) {
        props.onChange(event);
      }
    }
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  return props.children(onBlurHandler);
};

export default TrimCompent;
