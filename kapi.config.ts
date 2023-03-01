export default {
  serverUrl: 'https://yapi.kpay-group.com',
  typesOnly: false,
  reactHooks: {
    enabled: false,
  },
  outputFilePath: 'src/services/api/index.ts',
  projects: [
    {
      token: '0bd29b79c3f868e6b460ad7760d97217e5bfb165988a6f2d90ffb6dab03acb82',
      categories: [
        {
          id: 0,
        },
      ],
      // 排除的分类ID
      excludeCategories: [],
      // 排除的接口ID
      excludeInterface: [],
    },
  ],
};
