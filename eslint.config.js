import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';


export default [
  // 1. 排除无需检查的文件
  { ignores: ['dist/**/*', 'node_modules/**/*', 'cdk.out/**/*', 'lib/**/*'] },

  // 2. 针对 TS 文件的配置
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'], // 仅对 TS 文件生效
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json', // 必须关联 tsconfig
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint, // 注册插件
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'import/extensions': ['error', 'always'],

    }
  }
];