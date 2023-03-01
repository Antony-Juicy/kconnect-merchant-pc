import { defineConfig } from 'umi';
import config from './routes';

let $baseUrl = '';

export default defineConfig(
  Object.assign({}, config, {
    define: {
      'process.env.baseUrl': $baseUrl,
      'process.env.buriedPoint': 'G-5EX731VCF4',
      'process.env.kpayAppid': '186043011917025280',
      'process.env.chatUrl': 'https://embed.tawk.to/63414e5a37898912e96d848d/1gerhk4v3',
      'process.env.sentryDSN': 'https://6ae10f28f300473ea9394f6211bdce57@sentry.kpay-group.com/4',
      keywords: '',
      description: '',
    },
  }),
);
