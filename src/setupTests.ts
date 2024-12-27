// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// Weird import resolver issue, just ignore it
// eslint-disable-next-line import/no-unresolved
import '@testing-library/jest-dom';

global.console = {
    ...console,
    // disable warnings due to Plausible library...
    warn: jest.fn()
};
