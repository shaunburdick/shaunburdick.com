import shaunburdick from 'eslint-config-shaunburdick';
// import here to solve issues with ESM import when referencing file directly
import webpackConfig from './webpack.development.js';

export default [
    ...shaunburdick.config.js,
    ...shaunburdick.config.ts,
    ...shaunburdick.config.react,
    {
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
            'build/**/*'
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
