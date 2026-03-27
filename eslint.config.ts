import js from '@eslint/js'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: '@/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': {
        // cn(), clsx() 등 조건부 클래스 유틸 자동 인식
        entryPoint: 'src/app/index.css',
        classAttributes: ['className'],
        callees: ['cn', 'clsx', 'cva', 'twMerge'],
      },
    },
    rules: {
      // 정확성: 충돌·중복 클래스 감지
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'warn',
      // 스타일: CSS 변수 문법 통일 (border-[var(--x)] → border-(--x))
      'better-tailwindcss/enforce-consistent-variable-syntax': ['warn', { syntax: 'shorthand' }],
      // 스타일: 축약 클래스 (w-full h-full → size-full 등)
      'better-tailwindcss/enforce-shorthand-classes': 'warn',
      // 스타일: canonical 클래스명 강제 (suggestCanonicalClasses 경고 대응)
      'better-tailwindcss/enforce-canonical-classes': 'warn',
    },
  },
  { ignores: ['dist/', 'src/routeTree.gen.ts', 'node_modules/'] }
)
