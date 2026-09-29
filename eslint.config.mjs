import shaunburdick from 'eslint-config-shaunburdick';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default [
    ...shaunburdick.config.js,
    ...shaunburdick.config.ts,
    ...shaunburdick.config.react,
    {
        // Filename conventions.
        //
        // `unicorn/filename-case` accepts exactly one case (kebab or camel),
        // but this repo documents a mixed scheme in AGENTS.md that it cannot
        // express. Exempted here, with reason:
        //   - src/components/** and src/containers/** are PascalCase because
        //     they are React components, and AGENTS.md mandates the
        //     Container/View naming `YourFeature/YourFeatureView.tsx`.
        //   - e2e/pages/** are PascalCase Page Object classes.
        //   - src/{App,Command,Users}.tsx are named as AGENTS.md "Key Files
        //     for New Features"; renaming them would silently invalidate
        //     that document.
        // Not exempted: src/hooks/**, src/setup-tests.ts, scripts/** — all
        // converted to kebab-case in this branch.
        files: [
            'src/components/**',
            'src/containers/**',
            'src/App.tsx',
            'src/App.test.tsx',
            'src/Command.tsx',
            'src/Command.test.tsx',
            'src/Users.tsx',
            'src/Users.test.tsx',
            'e2e/pages/**'
        ],
        rules: {
            'unicorn/filename-case': 'off'
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
