import React from 'react';
import { Typography } from 'antd';
import type Paragraph from 'antd/lib/skeleton/Paragraph';
import type { SkeletonParagraphProps } from 'antd/lib/skeleton/Paragraph';

type IKPayEllipsis = {
  value?: string;
  paragraphProps?: typeof Paragraph;
  style?: React.CSSProperties;
} & SkeletonParagraphProps;

/** 使用KPayEllipsis替代 pro-table ellipsis */
const KPayEllipsis: React.FC<IKPayEllipsis> = (props) => {
  return (
    <Typography.Paragraph
      ellipsis={{ rows: 2, tooltip: true }}
      {...props.paragraphProps}
      {...props}
      style={{ marginBottom: 0, wordBreak: 'break-all', lineHeight: 1.3, ...props.style }}
    >
      {props.value || props.children}
    </Typography.Paragraph>
  );
};

export default KPayEllipsis;
