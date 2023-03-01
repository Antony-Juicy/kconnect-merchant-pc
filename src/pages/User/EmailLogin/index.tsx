import React,{ useEffect, useCallback, useState } from 'react';
import { gotoLogin } from '../../../utils/antdUtils';
import { merchantApi } from '@/services';
import type { IApiResponse } from '@/utils/request';
import type { CommonAccountInfoSecretResponse, CommonDataSecretResponse, CommonLoginResponse } from '@/services/api';
import { Spin } from 'antd';
import { encryptWithCFB } from '@/utils/utils';
import moment from 'moment';
import './index.less';
import { removeAllowSkipAuthorize, setAccessToken, setExpires, setRefreshToken} from '@/utils/auth';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
const key: string = 'secret=';
const isHaveKeyOfSecret: boolean = window.location.href.indexOf(key)>-1; //判断是url上是否有名为secret的key
const secretValue: string = window.location.href.split(key)[1]; //获取key为secret的值
const EmailLogin: React.FC = () => {
    const [loading, setIoading] = useState<boolean>(true);

    const init = useCallback(async ()=>{
        
        // 获取终端id --- terminalSerialNumber
        const fp = await FingerprintJS.load();
        const { visitorId } = await fp.get();

        //判断是url上是否有名为secret的key
        if(isHaveKeyOfSecret){

            // 请求接口
            const { data : { account, flag, secret} }: IApiResponse<CommonAccountInfoSecretResponse> = await merchantApi.getCommonAccountInfoSecret({ secret : secretValue });
            
            // flag为1时，证明该账号已经修改过默认密码
            if(flag){   
                
                sessionStorage.setItem('accountFromEmail', account);
                gotoLogin();

            } else { 
            // 否则，证明该账号还未修改过默认密码
            // 需要为期调用登录接口，并跳转到登录后的首页

                // 获取密钥
                const { data : { dataSecret, dataSecretParameter } }: IApiResponse<CommonDataSecretResponse> = await merchantApi.getCommonDataSecret();

                // 根据密钥加密密码
                const secretCode: string = encryptWithCFB(secret, dataSecret, dataSecretParameter).trim();

                // 用加密后的密码和账号调用登录接口
                const { data : { accessToken, refreshToken, expired } }: IApiResponse<CommonLoginResponse> = await merchantApi.postCommonLogin({ account, secretCode, terminalSerialNumber: visitorId }, { noThrow: true });

                // 设置各种状态 如登录过期时间，调用接口需要的用户token
                removeAllowSkipAuthorize();
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                setExpires(moment().add(expired, 'seconds').valueOf());
                
            }

            setIoading(false);

        } else {

            // 如果没有的话，自动跳去登录页
            gotoLogin();

        }

    }, []);

    useEffect(()=>{ init(); }, []);

    return <div className='spinLoadingStyle'><Spin size="large" spinning={loading} /></div>;
}

export default EmailLogin;