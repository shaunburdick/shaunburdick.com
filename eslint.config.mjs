import shaunburdick from 'eslint-config-shaunburdick';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import reactX from 'eslint-plugin-react-x';

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
        // Register eslint-plugin-react-x under the react/ prefix to provide
        // legacy rule definitions that some configs still reference.
        // Disable the conflicting rules in favor of @eslint-react equivalents.
        plugins: {
            react: reactX,
        },
        rules: {
            'react/no-array-index-key': 'off',
        },
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
