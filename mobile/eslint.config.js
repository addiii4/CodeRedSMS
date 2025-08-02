// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
    files: ['**/*.{js,ts,jsx,tsx}'],
    ignores: ['node_modules', 'android', 'ios'],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
        project: './tsconfig.json',
        },
    },
    rules: {
        'prettier/prettier': 'warn',
    },
    },
    prettier,
];
