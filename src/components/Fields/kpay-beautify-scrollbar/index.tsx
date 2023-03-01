import { useUpdateEffect } from 'ahooks';
import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import cx from 'classnames';
import { addResizeListener, removeResizeListener } from './resize-event';
import { getScrollBarWidth } from './utils';
import Bar from './Bar';
import './index.less';
import { omit } from 'lodash';

type TKpayBeautifyScrollbar = {
  native?: boolean;
  wrapStyle?: React.CSSProperties;
  wrapClass?: string;
  viewClass?: string;
  viewStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  className?: string;
  noresize?: boolean;
  viewComponent?: string;
  children?: React.ReactNode;
  [key: string]: any;
};

const KpayBeautifyScrollbar: React.FC<TKpayBeautifyScrollbar> = (props) => {
  const [sizeWidth, setSizeWidth] = useState('0');
  const [sizeHeight, setSizeHeight] = useState('0');
  const [moveX, setMoveX] = useState('0');
  const [moveY, setMoveY] = useState('0');

  const wrapperRef = useRef<any>(null);
  const resizeRef = useRef<any>(null);

  const cleanRAF = useRef<any>(null);
  const cleanResize = useRef<any>(null);

  // 移除部分属性
  const $_props = omit(
    props,
    'native',
    'wrapStyle',
    'wrapClass',
    'viewClass',
    'viewStyle',
    'style',
    'className',
    'noresize',
    'viewComponent',
    'children',
  );

  const handleScroll = () => {
    setMoveY(
      `${((wrapperRef.current?.scrollTop ?? 0) * 100) / (wrapperRef.current?.clientHeight ?? 0)}`,
    );
    setMoveX(
      `${((wrapperRef.current?.scrollLeft ?? 0) * 100) / (wrapperRef.current?.clientWidth ?? 0)}`,
    );
  };

  const updateDom = () => {
    if (!wrapperRef.current) {
      return;
    }

    const heightPercentage =
      ((wrapperRef.current?.clientHeight ?? 0) * 100) / (wrapperRef.current?.scrollHeight ?? 0);
    const widthPercentage =
      ((wrapperRef.current?.clientWidth ?? 0) * 100) / (wrapperRef.current?.scrollWidth ?? 0);

    const _sizeHeight = heightPercentage < 100 ? heightPercentage + '%' : '';
    const _sizeWidth = widthPercentage < 100 ? widthPercentage + '%' : '';

    if (sizeHeight !== _sizeHeight || sizeWidth !== _sizeWidth) {
      setSizeHeight(_sizeHeight);
      setSizeWidth(_sizeWidth);
    }
  };

  useEffect(() => {
    if (props.native) {
      return;
    }
    const rafId = requestAnimationFrame(updateDom);
    cleanRAF.current = () => {
      cancelAnimationFrame(rafId);
    };
    return () => {
      cleanRAF.current();
      if (cleanResize.current) {
        cleanResize.current();
      }
    };
  }, []);

  useUpdateEffect(() => {
    if (!props.noresize && resizeRef.current) {
      if (cleanResize.current) {
        cleanResize.current();
      }
      addResizeListener(resizeRef.current, updateDom);
      cleanResize.current = () => {
        removeResizeListener(resizeRef.current, updateDom);
      };
    }
  });

  let style = props.wrapStyle;
  const gutter = getScrollBarWidth();
  if (gutter) {
    const gutterWith = `-${gutter}px`;
    style = { ...props.wrapStyle, marginRight: gutterWith, marginBottom: gutterWith };
  }

  const view = React.createElement(
    props.viewComponent ?? 'div',
    {
      className: cx('k-scrollbar-view', props.viewClass),
      style: props.viewStyle,
      ref: resizeRef,
    },
    props.children,
  );

  let nodes;
  if (!props.native) {
    const wrap = (
      <div
        {...$_props}
        key={0}
        ref={wrapperRef}
        style={style}
        onScroll={handleScroll}
        className={cx(
          props.wrapClass,
          'k-scrollbar-wrap',
          gutter ? '' : 'k-scrollbar-wrap-hidden-default',
        )}
      >
        {view}
      </div>
    );
    nodes = [
      wrap,
      <Bar
        type="horizontal"
        key={1}
        move={Number(moveX)}
        size={sizeWidth}
        parentWrap={wrapperRef.current}
      />,
      <Bar
        key={2}
        move={Number(moveY)}
        size={sizeHeight}
        parentWrap={wrapperRef.current}
        type="vertical"
      />,
    ];
  } else {
    nodes = [
      <div
        {...$_props}
        key={0}
        ref={wrapperRef}
        className={cx(props.wrapClass, 'k-scrollbar-wrap')}
        style={style}
      >
        {view}
      </div>,
    ];
  }

  return React.createElement(
    'div',
    { className: cx('k-scrollbar', props.className), style: props.style },
    nodes,
  );
};

export default KpayBeautifyScrollbar;
