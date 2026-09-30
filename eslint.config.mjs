import shaunburdick from 'eslint-config-shaunburdick';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default [
    ...shaunburdick.config.js,
    ...shaunburdick.config.ts,
    ...shaunburdick.config.react,
    {
        // Filename case.
        //
        // The config's default is kebab-only, which is right for hooks,
        // scripts, specs and fixtures. PascalCase is allowed only where
        // components and page objects live — scoping the relaxation instead
        // of relaxing everything means every other path keeps the default
        // with no list of scopes to re-tighten afterwards.
        //
        // unicorn/filename-case checks every path segment including the
        // directories, so both cases must be permitted for a Pascal file
        // under kebab directories such as `src/components`.
        files: [
            'src/*.tsx',
            'src/containers/**',
            'src/components/**',
            'e2e/pages/**'
        ],
        rules: {
            'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }]
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
