import config from './routes';
import { defineConfig } from 'umi';

let $baseUrl = 'https://pc.kconnect.cloud';

export default defineConfig(
  Object.assign({}, config, {
    define: {
      'process.env.baseUrl': $baseUrl,
      'process.env.buriedPoint': 'G-B8GE3VCTNW',
      'process.env.kpayAppid': '186072028015628288',
      'process.env.chatUrl': 'https://embed.tawk.to/633169a254f06e12d896d989/1gdsg99bt',
      'process.env.sentryDSN': 'https://a4a6c6789ed34b348021238bf956a6cb@sentry.kpay-group.com/3',
      keywords: '',
      description: '',
    },
  }),
);
