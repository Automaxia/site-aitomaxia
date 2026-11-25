// @ts-check
// ESLint 10 (configuração "flat"). Mesmas regras do antigo .eslintrc.json.
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    ignores: ['www/**', 'dist/**', '.angular/**', 'node_modules/**', 'projects/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Page', 'Component'] }],
      // Prefixos reais do projeto: automaxia-* (e app-root/app-home); a diretiva histórica [brmasker].
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: ['app', 'automaxia'], style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['app', 'automaxia', 'br'], style: 'camelCase' }],
      // Todos os componentes são OnPush, menos a HomePage (exceção comentada no próprio arquivo).
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
