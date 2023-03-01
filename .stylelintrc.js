const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.stylelint,
  extends: [
    ...fabric.stylelint.extends,
    'stylelint-config-recommended-less',
    'stylelint-config-rational-order',
  ],
  plugins: [...fabric.stylelint.plugins, 'stylelint-less', 'stylelint-order'],
  customSyntax: 'postcss-less',
  rules: {
    ...fabric.stylelint.rules,
    'selector-class-pattern': [
      // 命名规范 -
      '^(([a-z][a-z0-9]*)((-[a-z0-9]+)|([A-Z]{1,}[a-z0-9]+))*)$',
      {
        message: (selectorValue) =>
          'Expected class selector "' + selectorValue + '" to be kebab-case or camel',
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'color-function-notation': 'legacy',
    'color-hex-case': 'lower',
    'number-leading-zero': 'never',
  },
};
