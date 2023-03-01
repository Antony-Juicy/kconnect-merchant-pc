import type { CommonAccountInfoResponse, MerchantInfoBaseResponse } from '@/services/api';

export const AccessTokenKey = 'kconnect_pc_access_token';
export const RefreshTokenKey = 'kconnect_pc_refresh_token';
export const ExpiresTokenKey = 'kconnect_pc_expires';
export const SessionIntentKey = 'kconnect_pc_intent';
export const CompanyIdKey = 'kconnect_pc_company_id';
export const CompanyNameKey = 'kconnect_pc_company_name';
export const CompanyInfoKey = 'kconnect_pc_company_info';
export const merchantBaseInfoKey = 'kconnect_pc_merchant_base_info';
export const AllowSkipAuthorizeKey = 'allow_skip_authorize';
export const checkedState = 'checked_state';

export type allowConfigTS = {
  account: string;
  appId: string[];
};

// ------------------------------------------------------------------------------------------------------------------------ Get
export function getAccessToken() {
  return window.localStorage.getItem(AccessTokenKey);
}

export function getRefreshToken() {
  return window.localStorage.getItem(RefreshTokenKey);
}

export function getExpires() {
  return window.localStorage.getItem(ExpiresTokenKey);
}

export function getCompanyId() {
  return window.localStorage.getItem(CompanyIdKey);
}

export function getAllowSkipAuthorize() {
  return window.localStorage.getItem(AllowSkipAuthorizeKey);
}

export function getCompanyInfo(): CommonAccountInfoResponse {
  return window.localStorage.getItem(CompanyInfoKey)
    ? JSON.parse(window.localStorage.getItem(CompanyInfoKey)!)
    : {};
}
export function getMerchantBaseInfo(): MerchantInfoBaseResponse {
  return window.localStorage.getItem(merchantBaseInfoKey)
    ? JSON.parse(window.localStorage.getItem(merchantBaseInfoKey)!)
    : {};
}

export function getCheckedKey() {
  return window.localStorage.getItem(checkedState);
}

// ------------------------------------------------------------------------------------------------------------------------ Set
export function setCheckedKey(state: boolean) {
  return window.localStorage.setItem(checkedState, `${state}`);
}

export function setExpires(expires: number) {
  return window.localStorage.setItem(ExpiresTokenKey, `${expires}`);
}

export function setAccessToken(token: string) {
  return window.localStorage.setItem(AccessTokenKey, token);
}

export function setRefreshToken(token: string) {
  return window.localStorage.setItem(RefreshTokenKey, token);
}

export function setCompanyId(id: string) {
  return window.localStorage.setItem(CompanyIdKey, id);
}

export function setCompanyInfo(info: any) {
  return window.localStorage.setItem(CompanyInfoKey, JSON.stringify(info));
}

export function setMerchantBaseInfo(info: any) {
  return window.localStorage.setItem(merchantBaseInfoKey, JSON.stringify(info));
}

export function setAllowSkipAuthorize(id: string, applicationId: string | string[]) {
  // 授权缓存为{"account":"","appId":[]}，其中 account 是 companyAccountId 拼上 companyId, appId 为点击过授权按钮的应用id数组
  // setAllowSkipAuthorize 第二个参数可能是字符串，也可能是字符串数组，分情况处理
  const allowConfig: allowConfigTS = JSON.parse(
    window.localStorage.getItem(AllowSkipAuthorizeKey) || '{"account":"","appId":[]}',
  );
  const newConfig = Object.assign(allowConfig, {
    account: id,
    appId: Array.isArray(applicationId) ? applicationId : [...allowConfig.appId, applicationId],
  });

  return window.localStorage.setItem(AllowSkipAuthorizeKey, JSON.stringify(newConfig));
}

// ------------------------------------------------------------------------------------------------------------------------ Remove

export function removeExpires() {
  return window.localStorage.removeItem(ExpiresTokenKey);
}

export function removeAccessToken() {
  return window.localStorage.removeItem(AccessTokenKey);
}

export function removeRefreshToken() {
  return window.localStorage.removeItem(RefreshTokenKey);
}

export function removeCompanyId() {
  return window.localStorage.removeItem(CompanyIdKey);
}

export function removeCompanyInfo() {
  return window.localStorage.removeItem(CompanyInfoKey);
}
export function removeMerchantBaseInfo() {
  return window.localStorage.removeItem(merchantBaseInfoKey);
}

export function removeAllowSkipAuthorize() {
  return window.localStorage.removeItem(AllowSkipAuthorizeKey);
}

// 清除登錄資訊
export function clearAuthInfo() {
  removeExpires();
  removeAccessToken();
  removeRefreshToken();
  removeCompanyId();
  removeCompanyInfo();
  removeMerchantBaseInfo();
}
