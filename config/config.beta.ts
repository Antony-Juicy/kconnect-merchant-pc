import { defineConfig } from 'umi';
import config from './routes';

let $baseUrl = '';

export default defineConfig(
  Object.assign({}, config, {
    define: {
      'process.env.baseUrl': $baseUrl,
      'process.env.buriedPoint': 'G-5EX731VCF4',
      'process.env.kpayAppid': '172887632697757697',
      'process.env.chatUrl': 'https://embed.tawk.to/6349430237898912e96e9d64/1gfb2rgnd',
      'process.env.sentryDSN': 'https://6ae10f28f300473ea9394f6211bdce57@sentry.kpay-group.com/4',
      keywords: '',
      description: '',
    },
  }),
);
