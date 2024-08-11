import shaunburdick from 'eslint-config-shaunburdick';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

export default [
    ...shaunburdick.config.js,
    ...shaunburdick.config.ts,
    {
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        ...reactPlugin.configs.flat.recommended,
        ...reactPlugin.configs.flat['jsx-runtime'],
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
                ...globals.browser,
            },
        },
    },
    {
        ignores: [
            'build/**/*'
        ]
    }
];
