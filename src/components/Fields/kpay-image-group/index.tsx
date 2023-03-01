import React, { useState } from 'react';
import type { ImageProps } from 'antd';
import { Image } from 'antd';
import { omit } from "lodash";
import failureIcon from '@/assets/svgs/product/err-list-img.svg';

type TImageGroup = {
  id: string;
  cover: string;
  imgData: any[];
  reset: React.Dispatch<React.SetStateAction<any | null>>;
  keyWord?: string;
  current?: number,
  defaultIcon?: any;
} & ImageProps;

const KPayImageGroup: React.FC<TImageGroup> = (props) => {
  const $_props = omit(props, 'id', 'cover', 'imgData', 'reset', 'keyWord', 'current');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coverLoading, setCoverLoading] = useState(true);
  const [imgIsError, setImgIsError] = useState(false);
  const onVisibleChange = (vis: boolean) => {
    const chatDom = document.querySelector('.widget-Chat');
    if (!!chatDom) {
      chatDom.classList.add('widget-visible');
    }
    setVisible(vis);
    props.reset(null);
  };

  return (
    <>
      {!!props.cover ? (
        <>
          <Image
            preview={{ visible: false }}
            width={48}
            height={48}
            src={coverLoading ? (props?.defaultIcon ?? failureIcon) : props.cover || (props?.defaultIcon ?? failureIcon)}
            onLoad={() => setCoverLoading(false)}
            onError={() => {
              setCoverLoading(false);
              setImgIsError(true);
            }}
            fallback={props?.defaultIcon ?? failureIcon}
            onClick={(e) => {
              setVisible(true);
              props.onClick?.(e);
            }}
            {...$_props}
          />
          {(!imgIsError || props.imgData?.length > 1) && (
            <div style={{ display: 'none' }}>
              <Image.PreviewGroup
                preview={
                  Object.assign(
                    { visible, onVisibleChange: onVisibleChange },
                    props?.current ? { current: props?.current } : {}
                  )
                }
              >
                {props.imgData?.map((item: any) => {
                  return (
                    <Image
                      key={item[props.id] || item[props.keyWord ?? 'fileUrl']}
                      src={loading ? (props?.defaultIcon ?? '') : item[props.keyWord ?? 'fileUrl'] || (props?.defaultIcon ?? failureIcon)}
                      fallback={props?.defaultIcon ?? failureIcon}
                      onLoad={() => setLoading(false)}
                      onError={() => setLoading(false)}
                    />
                  );
                })}
              </Image.PreviewGroup>
            </div>
          )}
        </>
      ) : (
        <img width={48} height={48} src={failureIcon} />
      )}
    </>
  );
};

export default KPayImageGroup;
