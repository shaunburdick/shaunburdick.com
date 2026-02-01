import shaunburdick from 'eslint-config-shaunburdick';
// import here to solve issues with ESM import when referencing file directly
import webpackConfig from './webpack.development.js';

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
        ignores: [
            'build/**/*',
            'coverage/**/*'
        ]
    },
    {
        settings: {
            'import/resolver': {
                webpack: {
                    config: webpackConfig
                }
            }
        }
    }
];
