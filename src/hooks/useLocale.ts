import { createIntl, createIntlCache, useIntl, getLocale } from 'umi';
import type { IntlShape } from 'react-intl';
import type { Options as IntlMessageFormatOptions } from 'intl-messageformat';
import zhHk from '../locales/zh-HK';
import enUS from '../locales/en-US';

const defaultLanguage = 'zh-HK';

const messageType = {
  'zh-HK': zhHk,
  'en-US': enUS,
};

const defineFormatMessage = (intl: IntlShape) => {
  const localeMessage = zhHk;

  type localeKey = keyof typeof localeMessage;

  // modify formatMessage
  const formatMessage = (
    id: localeKey | 'error.wait.debug',
    defaultMessage: string,
    other?: IntlMessageFormatOptions,
  ) => {
    return intl.formatMessage({ id, defaultMessage, ...other });
  };

  return formatMessage;
};

export const getIntl = (locale?: keyof typeof messageType) => {
  const cache = createIntlCache();
  const intl = createIntl(
    {
      locale: locale || getLocale(),
      defaultLocale: defaultLanguage,
      messages: messageType[locale || getLocale() || defaultLanguage],
    },
    cache,
  );

  return {
    getMessage: defineFormatMessage(intl),
    ...intl,
  };
};

/**
 * 引入导出react-intl的hook，方便后续批量修改
 */
const useLocale = () => {
  const intl = useIntl();

  return {
    getMessage: defineFormatMessage(intl),
    getLocalIntl: getIntl,
    ...intl,
  };
};

export default useLocale;
