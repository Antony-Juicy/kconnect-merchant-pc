import cx from 'classnames';
import { useRef } from 'react';
import { BAR_PROPS_MAP, renderThumbStyle } from './constants';
import './index.less';
import { off, on } from './utils';

type TBar = {
  type: 'vertical' | 'horizontal';
  size: string;
  move: number;
  parentWrap: any;
};

const Bar: React.FC<TBar> = (props) => {
  const { size, move } = props;

  const barRef = useRef<any>(null);
  const thumbRef = useRef<any>(null);

  // 滚动条方向配置
  const barObj = BAR_PROPS_MAP[props.type];
  // 按方向设置移动距离
  const prev = {};

  let cursorDown: boolean = false;

  const mouseMoveDocumentHandler = (e: Event) => {
    if (cursorDown === false) return;
    const prevPage = prev[barObj.axis];

    if (!prevPage) return;

    const offset = e[barObj.client] - barRef.current?.getBoundingClientRect()[barObj.direction];
    const thumbClickPosition = thumbRef.current?.[barObj.offset] - prevPage;
    const thumbPositionPercentage =
      ((offset - thumbClickPosition) * 100) / barRef.current?.[barObj.offset];

    props.parentWrap[barObj.scroll] =
      (thumbPositionPercentage * props.parentWrap[barObj.scrollSize]) / 100;
  };

  const mouseUpDocumentHandler = () => {
    cursorDown = false;
    prev[barObj.axis] = 0;
    off(document, 'mousemove', mouseMoveDocumentHandler);
    document.onselectstart = null;
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.nativeEvent.stopImmediatePropagation();
    cursorDown = true;

    on(document, 'mousemove', mouseMoveDocumentHandler);
    on(document, 'mouseup', mouseUpDocumentHandler);
    document.onselectstart = () => false;
  };

  const clickTrackHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const offset = Math.abs(
      (e.target as HTMLDivElement).getBoundingClientRect()[barObj.direction] - e[barObj.client],
    );

    const thumbHalf = thumbRef.current?.[barObj.offset] / 2;
    const thumbPositionPercentage = ((offset - thumbHalf) * 100) / barRef.current?.[barObj.offset];

    props.parentWrap[barObj.scroll] =
      (thumbPositionPercentage * props.parentWrap[barObj.scrollSize]) / 100;
  };

  const clickThumbHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    startDrag(e);
    prev[barObj.axis] =
      e.currentTarget[barObj.offset] -
      (e[barObj.client] - e.currentTarget.getBoundingClientRect()[barObj.direction]);
  };

  return (
    <div
      ref={barRef}
      className={cx(
        'k-scrollbar-bar',
        `${
          barObj.key === 'horizontal' ? 'k-scrollbar-bar-horizontal' : 'k-scrollbar-bar-vertical'
        }`,
      )}
      onMouseDown={clickTrackHandler}
    >
      <div
        ref={thumbRef}
        className="k-scrollbar-thumb"
        onMouseDown={clickThumbHandler}
        style={renderThumbStyle({ size, move, bar: barObj })}
      />
    </div>
  );
};

export default Bar;
