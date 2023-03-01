/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  devA: {
    '/api': {
      target: 'http://10.0.15.23:30200',
      changeOrigin: true,
    },
  },
  devB: {
    '/api': {
      target: 'http://10.0.15.23:30207',
      changeOrigin: true,
    },
  },
  devC: {
    '/api': {
      target: 'http://10.0.15.23:30202',
      changeOrigin: true,
    },
  },

  testA: {
    '/api/': {
      target: 'https://pc.test.a.kconnect.cloud',
      changeOrigin: true,
    },
  },
  testB: {
    '/api/': {
      target: 'https://pc.test.b.kconnect.cloud',
      changeOrigin: true,
    },
  },
  testC: {
    '/api/': {
      target: 'https://pc.test.c.kconnect.cloud',
      changeOrigin: true,
    },
  },

  pre: {
    '/api/': {
      target: 'https://pc-uat.kconnect.cloud',
      changeOrigin: true,
      // pathRewrite: { '^': '' },
    },
  },
};
