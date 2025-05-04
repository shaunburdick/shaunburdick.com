import { CommandContext, commandsWithContext } from './Command';
import { AchievementId, AchievementUnlocked, coreAchievements } from './components/Achievements/Achievements';
import { displayUser, User } from './Users';

describe('Command', () => {
    function buildContext(): CommandContext {
        const achievements: AchievementUnlocked[] = [];
        return {
            commandHistory: [],
            environment: new Map(),
            setConsoleLines: jest.fn(),
            setLastCommand: jest.fn(),
            users: new Map([['test', { name: 'test' }]]),
            workingDir: '',
            notifications: {
                add: jest.fn(),
                remove: jest.fn(),
                clear: jest.fn(),
                notifications: []
            },
            achievements: {
                unlockAchievement: jest.fn().mockImplementation((id: AchievementId) => achievements.push({
                    id,
                    title: coreAchievements[id].title,
                    description: coreAchievements[id].description,
                    unlockedAt: new Date().toISOString()
                })),
                hasAchievement: jest.fn().mockImplementation((id: AchievementId) =>
                    achievements.some(achievement => achievement.id === id)),
                resetAchievements: jest.fn().mockImplementation(() => achievements.splice(0)),
                achievements
            }
        };
    }

    let oldOpen: typeof window.open;

    beforeEach(() => {
        // Stash the window.open fn and set a mock fn
        // jsDom doesn't implement the function and throws an error
        oldOpen = window.open;
        window.open = jest.fn();
    });

    afterEach(() => {
        // return the window.open fn
        window.open = oldOpen;
    });

    test('Get a command map', () => {
        expect(commandsWithContext(buildContext())).toBeDefined();
    });

    test('clear', (done) => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const response = commands.get('clear')?.run();

        expect(response).toEqual([]);

        setTimeout(() => {
            expect(ctx.setConsoleLines).toHaveBeenCalledTimes(1);
            expect(ctx.setLastCommand).toHaveBeenCalledTimes(1);
            expect(ctx.setLastCommand).toHaveBeenCalledWith(undefined);

            done();
        });
    });

    test('env', () => {
        const ctx = buildContext();
        ctx.environment.set('foo', 'bar');
        ctx.environment.set('fizz', 'buzz');
        const commands = commandsWithContext(ctx);

        const response = commands.get('env')?.run();

        expect(response).toEqual([
            ['foo=bar'],
            ['fizz=buzz']
        ]);
    });

    test('export', () => {
        const ctx = buildContext();
        ctx.environment.set('foo', 'bar');
        ctx.environment.set('fizz', 'buzz');
        const commands = commandsWithContext(ctx);

        const exp = commands.get('export');

        expect(exp?.run('key', 'value')).toEqual([
            ['key=value']
        ]);
        expect([...ctx.environment]).toEqual([
            ['foo', 'bar'],
            ['fizz', 'buzz'],
            ['key', 'value']
        ]);

        // test with equals sign
        expect(exp?.run('has=equals')).toEqual([
            ['has=equals']
        ]);

        expect(exp?.run('has=multiple=equals')).toEqual([
            ['has=multiple=equals']
        ]);

        // clearing
        expect(ctx.environment.has('key')).toEqual(true);
        expect(exp?.run('key')).toEqual([
            ['key=']
        ]);
        expect(ctx.environment.has('key')).toEqual(false);
    });

    test('help (no args)', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const response = commands.get('help')?.run();

        expect(Array.isArray(response)).toBe(true);

        // make sure no secret commands are listed
        expect(response?.filter(line => (line[0] as string).startsWith('secret'))).toEqual([]);
    });

    test('help (with args)', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const help = commands.get('help');

        expect(help?.run('clear')).toEqual([[commands.get('clear')?.description]]);
        expect(help?.run('secret')).toEqual([['I\'m not helping you. It\'s a secret!']]);
        expect(help?.run('doesnotexist')).toEqual([['Unknown command: doesnotexist']]);
    });

    test('history', () => {
        const ctx = buildContext();
        ctx.commandHistory.push('foo', 'bar');
        const commands = commandsWithContext(ctx);

        const response = commands.get('history')?.run();

        expect(response).toEqual([
            ['1: foo'],
            ['2: bar']
        ]);
    });

    test('open', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const open = commands.get('open');

        expect(open?.run('http://foo.com')).toEqual([
            ['Opening http://foo.com...']
        ]);
        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith('http://foo.com');

        expect(open?.run('ftp://foo.com')).toEqual([
            ['Unknown protocol: ftp:']
        ]);

        expect(open?.run('floopity/ss/s/s/s')).toEqual([
            ['Cannot open: floopity/ss/s/s/s']
        ]);
    });

    test('pwd', () => {
        const ctx = buildContext();
        ctx.workingDir = 'test';
        const commands = commandsWithContext(ctx);

        const response = commands.get('pwd')?.run();

        expect(response).toEqual([
            ['test']
        ]);
    });

    test('rm', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const response = commands.get('rm')?.run();

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

        expect(response).toEqual([
            ['rm never gonna give you up!']
        ]);
    });

    test('secret', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const response = commands.get('secret')?.run();

        expect(response).toEqual([
            ['You found it!']
        ]);
    });

    test('users', () => {
        const ctx = buildContext();
        // add users not in alphabetical order
        ctx.users.set('test', { name: 'test' });
        ctx.users.set('spot', { name: 'spot' });
        ctx.users.set('alfred', { name: 'alfred' });
        ctx.users.set('fred', { name: 'fred' });
        const commands = commandsWithContext(ctx);

        const response = commands.get('users')?.run();

        // expect them to be in alphabetical order
        expect(response).toEqual([
            ['alfred'],
            ['fred'],
            ['spot'],
            ['test']
        ]);
    });

    test('view-source', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const response = commands.get('view-source')?.run();

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith('https://github.com/shaunburdick/shaunburdick.com');

        expect(response).toEqual([
            ['Opening GH Page...']
        ]);
    });

    test('whoami', () => {
        const ctx = buildContext();
        const commands = commandsWithContext(ctx);

        const response = commands.get('whoami')?.run();

        expect(response).toEqual([
            ['You\'re you, silly'],
            ['Achievements:'],
            ['- Who Am I?: Use the whoami command.']
        ]);
    });

    test('whois', () => {
        const ctx = buildContext();
        ctx.users.set('test', { name: 'test' });
        const commands = commandsWithContext(ctx);

        const whois = commands.get('whois');

        expect(whois?.run('test')).toEqual(
            displayUser(ctx.users.get('test') as User)
        );

        expect(whois?.run('miki')).toEqual([
            ['Hello, miki']
        ]);
        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith('https://www.youtube.com/watch?v=YjyUIwKPAxA');

        const gfResponse = whois?.run('gamefront');
        expect(Array.isArray(gfResponse)).toBe(true);

        expect(whois?.run('unknown_user')).toEqual([
            ['Unknown user: unknown_user']
        ]);

        expect(whois?.run()).toEqual([
            ['Unknown user: ']
        ]);

        // Test for mario achievement
        ctx.users.set('mario', { name: 'mario' });
        whois?.run('mario');
        expect(ctx.achievements.unlockAchievement).toHaveBeenCalledWith('old_spice_mario');
    });
});
