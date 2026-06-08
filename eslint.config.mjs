import shaunburdick from 'eslint-config-shaunburdick';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default [
    ...shaunburdick.config.js,
    ...shaunburdick.config.ts,
    ...shaunburdick.config.react,
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
