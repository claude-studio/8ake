export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'design', 'refactor', 'chore', 'docs', 'test', 'revert'],
    ],
    'subject-max-length': [2, 'always', 72],
  },
}
