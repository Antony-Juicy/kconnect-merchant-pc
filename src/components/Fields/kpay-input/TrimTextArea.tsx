import React from 'react';
import type { TextAreaProps } from "antd/lib/input";
import { Input } from "antd";
import { omit } from "lodash";
import TrimCompent from '../tool-components/TrimCompent';
import { TextAreaRef } from 'antd/lib/input/TextArea';

export interface TrimTextAreaProps extends TextAreaProps {
  renderType?: string
  trimSpace?: boolean
}
const TrimTextArea = React.forwardRef<TextAreaRef, TrimTextAreaProps>((props, ref) => {
  const $_props = omit(props, 'renderType', 'trimSpace');

  return (
    <TrimCompent {...$_props}>
      {
        (onBlurHandler: React.FocusEventHandler<HTMLTextAreaElement>) => (
          <Input.TextArea {...$_props} ref={ref} onBlur={onBlurHandler} />
        )
      }

    </TrimCompent>
  );
});

export default TrimTextArea
