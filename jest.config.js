export default {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/build/'
    ],
    collectCoverageFrom: [
        '**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/vendor/**',
        '!**/index.tsx',
        '!**/e2e/**',
        '!playwright.config.ts'
    ],
    transform: {
        '^.+\\.css$': '<rootDir>/scripts/jest/cssTransform.js'
    },
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
};
