import React, { useState, useRef, useEffect, useContext } from 'react';
import { TrackerContext } from './Tracker';

function ShellPrompt() {

  const tracker = useContext(TrackerContext);

  const LS_KEY_LAST_LOGIN = 'lastLogin';
  const LS_KEY_COMMAND_HISTORY = 'commandHistory';

  const LAST_LOGIN = localStorage.getItem(LS_KEY_LAST_LOGIN) || 'never';

  const WELCOME_MESSAGE = [
    ["****************************************"],
    ["Welcome to Shaun Burdick's Console!"],
    ["****************************************"],
    ["Your last login was:", <span aria-label='Last Login Timestamp'>{LAST_LOGIN}</span>],
    ["Type `help` for assistance."],
    [""],
  ];

  type ConsoleLine = string | React.JSX.Element;

  const DEFAULT_ENVIRONMENT = {
    SHELL: '/bin/blah',
    USER: 'you'
  };

  const DEFAULT_COMMAND_POINTER = 0;
  let defaultCommandHistory = [];
  try {
    const storedCommandHistory = localStorage.getItem(LS_KEY_COMMAND_HISTORY);
    defaultCommandHistory = storedCommandHistory !== null ? JSON.parse(storedCommandHistory) : [];
  } catch (e) {
    localStorage.setItem(LS_KEY_COMMAND_HISTORY, '[]');
  }

  const [consoleLines, setConsoleLines] = useState<Array<ConsoleLine>[]>(WELCOME_MESSAGE);
  const [commandHistory, setCommandHistory] = useState<string[]>(defaultCommandHistory);
  const [commandPointer, setCommandPointer] = useState<number>(DEFAULT_COMMAND_POINTER);
  const [environment, setEnvironment] = useState<Record<string,string>>(DEFAULT_ENVIRONMENT);
  const [workingDir/*, setWorkingDir*/] = useState<string>('/');
  const inputRef = useRef<HTMLInputElement | null>(null);

  type User = {
    name: string;
    image?: string;
    occupation?: string[],
    location?: string,
    expertise?: string[],
    links?: Array<{
      url: string;
      text: string;
    }>
  }

  const USERS: Record<string, User> = {
    shaun: {
      name: 'Shaun Burdick',
      image: 'shaun.png',
      occupation: [ 'Father', 'Husband', 'Leader', 'Engineer' ],
      location: 'Syracuse, NY',
      expertise: [
        'Engineering Leader',
        'Web Architecture and Design',
        'Large scale data collection',
        'API Design and Implementation',
        'Agile/Scrum team management',
        'Project Management'
      ],
      links: [
        { url: "https://www.linkedin.com/in/shaunburdick/", text: "LinkedIn" },
        { url: "https://github.com/shaunburdick/", text: "GitHub" },
        { url: `mailto://${atob('c2l0ZS1jb250YWN0QHNoYXVuYnVyZGljay5jb20=')}`, text: "Email" }
      ]
    }
  };

  type Command = {
    description: string;
    secret?: boolean;
    run: (...args: string[]) => Array<ConsoleLine[]>;
  };

  const COMMANDS: Record<string, Command> = {
    clear: {
      description: "Clears the screen",
      run: () => {
        // use setTimeout to clear screen after this loop is finished
        setTimeout(() => setConsoleLines([]));
        return [];
      }
    },
    env: {
      description: 'Print Environment',
      run: () => {
        const response: ConsoleLine[][] = [];

        for (const key in environment) {
          response.push([`${key}=${environment[key]}`]);
        }

        return response;
      }
    },
    export: {
      description: 'Set an environment variable',
      run: (key, value) => {
        setEnvironment({ ...environment, [key]: value});
        return [[`${key}=${value}`]];
      }
    },
    help: {
      description: "Provides a list of commands. Usage: `help [command]`",
      run: (command?: string) => {
        if (command) {
          if (COMMANDS[command]?.secret) {
            return [["I'm not helping you. It's a secret!"]];
          } else {
            return [[COMMANDS[command]?.description || `Unknown command: ${command}`]];
          }
        } else {
          return [
            ['List of Commands:'],
            ...Object.keys(COMMANDS)
              .filter(commandName => !COMMANDS[commandName].secret)
              .map(commandName => [`${commandName}:`, COMMANDS[commandName].description])
          ];
        }
      }
    },
    history: {
      description: "Show previous commands",
      run: () => commandHistory.map((command, index) => [`${index + 1}: ${command}`])
    },
    open: {
      description: "Open a file or URL",
      run: (target) => {
        try {
          const url = new URL(target);
          if (['http:', 'https:'].includes(url.protocol)) {
            window.open(target);
            return [[`Opening ${target}...`]];
          } else {
            return [[`Unknown protocol: ${url.protocol}`]];
          }
        } catch (e) {
          return [[`Cannot open: ${target}`]];
        }
      }
    },
    pwd: {
      description: 'Return the working directory',
      run: () => [[workingDir]]
    },
    rm: {
      description: "Remove directory entries",
      run: () => {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        return [["rm never gonna give you up!"]];
      }
    },
    secret: {
      description: "A secret command",
      secret: true,
      run: () => [["You found it!"]]
    },
    users: {
      description: "List users",
      run: () => Object.keys(USERS).map(userName => [userName])
    },
    "view-source": {
      description: "View the source of this app",
      run: () => {
        window.open("https://github.com/shaunburdick/shaunburdick.com");
        return [["Opening GH Page..."]];
      }
    },
    whoami: {
      description: "Tell you a little about yourself",
      run: () => [
        ["You're you, silly"]
      ]
    },
    whois: {
      description: "Tell you a little about a user. Usage: `whois <username>`",
      run: (username: string) => {
        if (username in USERS) {
          const user = USERS[username];
          const response: ConsoleLine[][] = [];

          if (user.image) response.push([<img src={user.image} alt={user.name} width={"50%"}/>]);
          response.push(["Name: ", user.name]);
          if (user.occupation) response.push(["Occupation: ", JSON.stringify(user.occupation)]);
          if (user.location) response.push(["Location: ", user.location]);
          if (user.expertise) response.push(["Expertise: ", JSON.stringify(user.expertise, null, 2)]);
          if (user.links) response.push(["Links: ", ...user.links.map(link => <a href={link.url}>{link.text}</a>)]);

          return response;
        } else if(/miki|mikey|faktrl/.test(username)) {
          window.open('https://www.youtube.com/watch?v=YjyUIwKPAxA');
          return [[`Hello, ${username}`]];
        } else if (username === "gamefront") {
          return [[<a href='https://gamefront.com'>Gamefront</a>, "is just FilesNetwork with a better skin"]];
        } else {
          return [[`Unknown user: ${username || ''}`]];
        }
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        if (inputRef.current) {
          const input = inputRef.current.value.trimEnd().split(' ');
          const newLines: ConsoleLine[][] = [['\n'], ["$", ...input.slice()]];

          // add to history
          setCommandHistory([...commandHistory, inputRef.current.value]);

          // execute command
          const command = input.shift();
          const args = input.filter(i => typeof i === 'string');
          const response = typeof command === 'string' && command.length > 0 ?
            execCommand(command, ...args as string[]) : [['']];
          newLines.push(...response);

          // clear input
          inputRef.current.value = '';
          //write lines
          setConsoleLines([...consoleLines, ...newLines]);
          // reset command pointer
          setCommandPointer(0);
        }
        break;
      case "Tab":
        event.preventDefault();
        // add tab completion?
        break;
      case "ArrowUp":
        event.preventDefault();
        tracker.trackEvent('historyUpArrow');
        if (commandPointer < commandHistory.length) {
          setCommandPointer(commandPointer + 1);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (commandPointer > DEFAULT_COMMAND_POINTER) {
          setCommandPointer(commandPointer - 1);
        } else {
          if (inputRef.current !== null) {
            inputRef.current.value = '';
          }
        }
        break;
      case "Escape":
        event.preventDefault()
        setCommandPointer(DEFAULT_COMMAND_POINTER);
        if (inputRef.current !== null) {
          inputRef.current.value = '';
        }
        break
      default:
        // do nothing
    }
  }

  const execCommand = (commandName: string, ...args: string[]): Array<ConsoleLine[]> => {
    // record command
    tracker.trackEvent('execCommand', { props: { commandName, args: args.join(' ') }});
    if (commandName.toLowerCase() in COMMANDS) {
      const command = COMMANDS[commandName.toLowerCase()];
      return command.run(...args);
    } else {
      return [
        ["Unknown Command: ", commandName],
        ["Type `help` for assistance"]
      ];
    }
  }

  // focus on input on load
  useEffect(() => {
    inputRef.current?.focus();
  })

  // update input on history toggle
  useEffect(() => {
    if (
      commandPointer > DEFAULT_COMMAND_POINTER
      && commandPointer <= commandHistory.length
      && inputRef.current !== null
    ) {
      inputRef.current.value = commandHistory[commandHistory.length - commandPointer];
    }

    // update history with max last 20 commands
    localStorage.setItem(LS_KEY_COMMAND_HISTORY, JSON.stringify(commandHistory.slice(-20)));
  }, [commandPointer, commandHistory])

  // set last login
  localStorage.setItem(LS_KEY_LAST_LOGIN, (new Date()).toISOString());

  return (
    <div className="shell">
      <pre style={{maxHeight: "80vh", minHeight: "20vh", flexDirection: "column-reverse", display: "flex"}}
        aria-label='A text-based console.'
        // eslint-disable-next-line jsx-a11y/aria-props
        aria-description='This area is meant to depict an older styled computer console where commands can be typed and responses will be shown.'
        aria-live='polite'>
        {consoleLines.slice().reverse().map((line, index) => (
            <span key={index}>{line.reduce((result, item) => <>{result}{' '}{item}</>)}</span>
        ))}
      </pre>
      <form onSubmit={handleSubmit}>
        <div style={{display: 'flex', alignItems: 'stretch'}}>
          <span aria-hidden>$ </span>
          <input
            id='console-input'
            placeholder='Type `help` for assistance.'
            style={{width: "100%", marginLeft: "1em"}}
            ref={inputRef}
            onKeyDown={handleKeyDown}
            autoCorrect='off'
            autoCapitalize='none'
            aria-label='An input to enter commands.'
            // eslint-disable-next-line jsx-a11y/aria-props
            aria-description='When a command is entered, it will be run by the console interpreter and the above output will be updated with the result'
          />
        </div>
      </form>
    </div>
  );
}

export default ShellPrompt;
