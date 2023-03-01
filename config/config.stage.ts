import config from './routes';
import { defineConfig } from 'umi';

let $baseUrl = '';

export default defineConfig(
  Object.assign({}, config, {
    define: {
      'process.env.baseUrl': $baseUrl,
      'process.env.buriedPoint': 'G-5WH7XHYXJG',
      'process.env.kpayAppid': '186043011917025280',
      'process.env.chatUrl': 'https://embed.tawk.to/634cc0e8b0d6371309c9db72/1gfht33lb',
      'process.env.sentryDSN': 'https://23ee29bee51c42e6a169485a13c32a4d@sentry.kpay-group.com/5',
      keywords: '',
      description: '',
    },
  }),
);
