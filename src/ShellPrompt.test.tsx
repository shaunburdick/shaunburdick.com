import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShellPrompt from './ShellPrompt';

describe('ShellPrompt', () => {
    test('Shows the console', () => {
        act(() => render(<ShellPrompt />));
        expect(document.body.querySelector('.shell')).toBeInTheDocument();
    });

    describe('Commands', () => {
        describe('clear', () => {
            test('should clear the screen', async () => {
                userEvent.setup();
                act(() => render(<ShellPrompt />));

                await userEvent.keyboard('clear{Enter}');

                const consoleCommands = document.body.querySelectorAll('pre > div');
                expect(consoleCommands.length).toBe(1);
                expect(consoleCommands[0]).toBeEmptyDOMElement();
            });
        });
    });

    describe('Hints', () => {
        test('Clicking hint should update input with value', () => {
            act(() => render(<ShellPrompt />));

            const button = screen.getByText('Show Hints');
            fireEvent.click(button);

            const link = screen.getByText('whois shaun');
            fireEvent.click(link);

            const input = document.body.querySelector('#console-input') as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input?.value).toEqual('whois shaun');
        });
    });
});
