export const BAR_PROPS_MAP = {
  vertical: {
    offset: 'offsetHeight',
    scroll: 'scrollTop',
    scrollSize: 'scrollHeight',
    size: 'height',
    key: 'vertical',
    axis: 'Y',
    client: 'clientY',
    direction: 'top',
  },
  horizontal: {
    offset: 'offsetWidth',
    scroll: 'scrollLeft',
    scrollSize: 'scrollWidth',
    size: 'width',
    key: 'horizontal',
    axis: 'X',
    client: 'clientX',
    direction: 'left',
  },
};

type TRenderThumbStyle = {
  move: number;
  size: string;
  bar: typeof BAR_PROPS_MAP['vertical'];
};

export function renderThumbStyle({ move, size, bar }: TRenderThumbStyle) {
  const style: React.CSSProperties = {};
  const translate = `translate${bar.axis}(${move}%)`;

  style[bar.size] = size;
  style.transform = translate;
  style.msTransform = translate;
  style.WebkitTransform = translate;
  style.display = size === '' || size === '0' ? 'none' : 'block';

  return style;
}
