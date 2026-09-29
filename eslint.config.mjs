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
        // Object literal keys and type properties are data contracts far more
        // often than they are internal names, so they are exempted from the
        // default camelCase format. In this repo they are, in order of how
        // badly renaming would hurt:
        //   - `first_command`, `rick_rolled`, ... are achievement IDs persisted
        //     to localStorage and used as `coreAchievements[id]` lookup keys.
        //     Renaming them orphans every existing user's unlocked set.
        //   - `TRACKER_EVENTS.*` members are namespaced constant keys, and the
        //     jest.mock factory in App.test.tsx must mirror the real module
        //     key-for-key.
        //   - `COMMANDS` mirrors an external context shape.
        // No format at all is the honest answer for keys that leave the
        // process; camelCase still governs every identifier that stays in it.
        //
        // NOTE: a config block *replaces* a rule's options rather than merging
        // into them, so the selector list below mirrors
        // `eslint-config-shaunburdick/typescript/index.js` in full and must be
        // kept in sync with it. Omitting any entry here would silently stop
        // enforcing that naming family.
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'import',
                    format: ['camelCase', 'PascalCase'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                {
                    selector: 'enumMember',
                    format: ['PascalCase'],
                },
                {
                    // Data keys — see above.
                    selector: ['objectLiteralProperty', 'typeProperty'],
                    format: null,
                },
            ],
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
