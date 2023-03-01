export const on = (() => {
  if (!!document.addEventListener) {
    return function (
      element: Document,
      event: string,
      handler: (this: Element, ev: ElementEventMap[keyof ElementEventMap]) => any,
    ) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function (element: any, event: string, handler: any) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();

export const off = (() => {
  if (!!document.removeEventListener) {
    return function (
      element: Document,
      event: string,
      handler: (this: Element, ev: ElementEventMap[keyof ElementEventMap]) => any,
    ) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element: any, event: string, handler: any) {
      if (element && event && handler) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
})();

let scrollBarWidth: number;

export const getScrollBarWidth = () => {
  if (scrollBarWidth !== undefined) {
    return scrollBarWidth;
  }

  const outer = document.createElement('div');
  outer.className = 'k-scrollbar-wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  scrollBarWidth = widthNoScroll - widthWithScroll;
  outer.parentNode?.removeChild(outer);

  return scrollBarWidth;
};
