// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Code Style(team.md): camelCase 식별자 관례.
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'variableLike', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
    },
  },
);
