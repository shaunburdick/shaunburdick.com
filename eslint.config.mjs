import shaunburdick from 'eslint-config-shaunburdick';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default [
    ...shaunburdick.config.js,
    ...shaunburdick.config.ts,
    ...shaunburdick.config.react,
    {
        // Filename and directory case.
        //
        // unicorn/filename-case applies one case style to every path segment
        // of a matched file, including directories, so this repo's mixed
        // scheme needs two blocks rather than an exemption.
        //
        // 1. The whole tree allows exactly kebab-case or PascalCase. That
        //    still forbids snake_case, camelCase and unclassified names while
        //    accepting the two conventions AGENTS.md documents.
        rules: {
            'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }]
        }
    },
    {
        // 2. Scopes that are kebab-case end to end tighten to kebab-only, so
        //    a relapse such as `useLocalStorage.ts` is caught here rather than
        //    slipping through the two-case allowance above.
        //
        // The component tree cannot be Pascal-only: `src` and `components`
        // are kebab directories, and the rule checks them alongside the
        // PascalCase component files.
        files: [
            'src/hooks/**',
            'src/setup-tests.ts',
            'scripts/**',
            'tests/**',
            'e2e/fixtures/**',
            'e2e/specs/**'
        ],
        rules: {
            'unicorn/filename-case': ['error', { case: 'kebabCase' }]
        }
    },
    {
        // Enforce presentational component pattern
        // View components in src/components/ should not use useState
        // Containers in src/containers/ are allowed to use state
        files: ['src/components/**/*.tsx', 'src/components/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'CallExpression[callee.name="useState"]',
                    message: 'View components should not manage state. Use controlled props.',
                },
            ]
        }
    },
    {
        settings: {
            'import-x/resolver-next': [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true,
                }),
            ],
        },
    },
    {
        ignores: [
            'build/**/*',
            'coverage/**/*'
        ]
    }
];
