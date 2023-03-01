import React from 'react';
import { Upload, Button, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import type { RcFile } from 'antd/es/upload';
import { useBoolean } from 'ahooks';
import { merchantApi } from '@/services';
import type { CompanyInfoResponse } from '@/services/api';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
// import defaultIcon from '@/assets/images/common/default-app-icon.png';
import uploadIcon from '@/assets/images/common/uploadIcon.png';
import styles from './index.less';

interface uploadProps {
  info: CompanyInfoResponse | null,
  falseDisabled: () => void,
  showBtnLoading: () => void,
  hideBtnLoading: () => void,
  value?: any,
  onChange?: (value: any) => void,
  extra?: string,
}

const UploadComponent: React.FC<uploadProps> = (props) => {
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(true);
  const [imgLoad, { setTrue: imgLoaded, setFalse: imgUnLoad }] = useBoolean(false);

  const uploadOnChange = (e: any) => {
    // console.log('uploadOnChange', e)
    if (e.file && e.file.xhr && e.file.xhr.code === 10000) {
      props.onChange?.(e?.file.xhr.data)
    }
  }

  const beforeUpload = (file: RcFile) => {
    // const filereader = new FileReader();
    // filereader.onload = e => {
    //   const src = e.target?.result;
    //   const image = new Image();
    //   image.onload = function() {
    //     console.log('width: ', image.width, 'height: ',image.height)
    //   };
    //   if ('string' === typeof(src)) {
    //     image.src = src;
    //   }
    // };
    // filereader.readAsDataURL(file);
    showLoading()
    props.showBtnLoading()
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
    if (!isJpgOrPng) {
      hideLoading()
      props.hideBtnLoading()
      message.error('請上傳格式為 jpg、jpeg 或 png 的圖片');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      hideLoading()
      props.hideBtnLoading()
      message.error('圖片大小不超過1M');
    }
    // console.log(isJpgOrPng && isLt1M)
    return (isJpgOrPng && isLt1M) || Upload.LIST_IGNORE;
  }
  
  const uploadFile = async (data: any): Promise<any> => {
    return merchantApi.postFileUpload(data, {noThrow: true})
  }

  const customRequest: (info: UploadRequestOption<any>) => void = ({
    data,
    file,
    filename,
    onError,
    onSuccess
  }) => {
    const formData = new FormData();
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    formData.append('multipartFile', file);
    uploadFile(
      formData,
    ).then((response) => {
      if (onSuccess) {
        props.falseDisabled();
        onSuccess(response, response);
      }
    }).catch((err: any) => {
      hideLoading()
      props.hideBtnLoading()
      if (onError) {
        onError(err)
      }
    })
  }

  const imgOnLoad = (e: any) => {
    // console.log('onload')
    e.target.style.display = 'block'
    hideLoading()
    props.hideBtnLoading()
    imgLoaded()
  }

  const imgOnError = (e: any) => {
    // console.log('onError')
    e.target.style.display = 'none'
    hideLoading()
    props.hideBtnLoading()
    imgUnLoad()
  }

  return <div className={styles.uploadWrap}>
    <div className={styles.imgBox}>
      
      {
        null !== props.info ?
        <>
          {
            loading &&
            <div className={styles.imgMask}>
              <LoadingOutlined style={{ color: '#FFA400', fontSize: '24px' }} />
            </div>
          }
          <div className={styles.logo}>
            <img onLoad={imgOnLoad} onError={imgOnError} src={props.value || props.info.companyAvatar} className={styles.image} />
            {
              !loading &&
              !imgLoad &&
              <div className={`${styles.default}`}>{props.info.companyName ? props.info.companyName.trimStart().substring(0, 1) : ''}</div>
            }
          </div>
        </>
        :
        null
      }
    </div>
    <Upload
      onChange={uploadOnChange}
      customRequest={customRequest}
      beforeUpload={beforeUpload}
      maxCount={1}
    >
      <Button className={styles.upload} icon={<img src={uploadIcon} className={styles.icon} />} >上傳</Button>
    </Upload>
      {
        props.extra &&
        <div className={styles.txt}>{props.extra}</div>
      }
  </div>;
};

export default UploadComponent;
