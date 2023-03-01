import { defineConfig } from 'umi';
import config from './routes';

let $baseUrl = '';

export default defineConfig(
  Object.assign({}, config, {
    define: {
      'process.env.baseUrl': $baseUrl,
      'process.env.kpayAppid':'172887632697757697',
      keywords: '',
      description: '',
    },
  }),
);
