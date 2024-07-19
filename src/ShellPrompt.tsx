import React, { useState, useRef, useEffect } from 'react';

function ShellPrompt() {
  const welcomeMessage = [
    ["****************************************"],
    ["Welcome to Shaun Burdick's Console!"],
    ["****************************************"],
    ["Your last login was: ", localStorage.getItem('lastLogin') || 'never'],
    ["Type `help` for assistance."],
    [""],
  ];

  type ConsoleLine = string | React.JSX.Element;

  const [history, setHistory] = useState<Array<ConsoleLine>[]>(welcomeMessage);
  const [sessionCommands, setSessionCommands] = useState<string[]>([]);
  const [commandPointer, setCommandPointer] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  type User = {
    name: string;
    image: string;
    occupation: string[],
    location: string,
    expertise: string[],
    links: Array<{
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
        { url: "mailto://site-contact@shaunburdick.com", text: "Email" }
      ]
    }
  };

  type Command = {
    description: string;
    secret?: boolean;
    run: (...args: string[]) => Array<ConsoleLine[]>;
  };

  const COMMANDS: Record<string, Command> = {
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
    secret: {
      description: "A secret command",
      secret: true,
      run: () => [["You found it!"]]
    },
    users: {
      description: "List users",
      run: () => Object.keys(USERS).map(userName => [userName])
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
          return [
            [<img src={user.image} alt={user.name} width={"50%"}/>],
            ["Name: ", user.name],
            ["Occupation: ", JSON.stringify(user.occupation)],
            ["Location: ", user.location],
            ["Expertise: ", JSON.stringify(user.expertise, null, 2)],
            ["Links: ", ...user.links.map(link => <a href={link.url}>{link.text}</a>)]
          ];
        } else {
          return [[`Unknown user: ${username || ''}`]];
        }
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = history[history.length - 1].filter(w => w !== '$');

    const command = input.shift();
    const args = input.filter(i => typeof i === 'string');
    const response = typeof command === 'string' ? execCommand(command, ...args as string[]) : [['']];
    setHistory([...history, ...response]);
    setCommandPointer(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        if (inputRef.current) {
          setHistory([...history, ["$", ...inputRef.current.value.split(' ')]]);
          // add to history
          setSessionCommands([...sessionCommands, inputRef.current.value]);
          inputRef.current.value = '';
        }
        break;
      case "Tab":
        event.preventDefault();
        // add tab completion?
        break;
      case "ArrowUp":
        event.preventDefault();
        if (commandPointer < sessionCommands.length) {
          setCommandPointer(commandPointer + 1);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (commandPointer > -1) {
          setCommandPointer(commandPointer - 1);
        }
        break;
      case "Escape":
        event.preventDefault()
        setCommandPointer(-1);
        if (inputRef.current !== null) {
          inputRef.current.value = '';
        }
        break
      default:
        // do nothing
    }
  }

  const execCommand = (commandName: string, ...args: string[]): Array<ConsoleLine[]> => {
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

  useEffect(() => {
    inputRef.current?.focus();
  })

  useEffect(() => {
    if (commandPointer > 0 && commandPointer <= sessionCommands.length && inputRef.current !== null) {
      inputRef.current.value = sessionCommands[sessionCommands.length - commandPointer];
    }
  }, [commandPointer, sessionCommands])

  // set last login
  localStorage.setItem('lastLogin', (new Date()).toISOString());

  return (
    <div className="shell">
      <pre style={{maxHeight: "80vh", minHeight: "20vh", flexDirection: "column-reverse", display: "flex", whiteSpace: "pre-wrap"}}>
        {history.slice().reverse().map((line, index) => (
          <p key={index}>{line.reduce((result, item) => <>{result}{' '}{item}</>)}</p>
        ))}
      </pre>
      <form onSubmit={handleSubmit}>
        <div style={{display: 'flex', alignItems: 'stretch'}}>
          <span>$ </span>
          <input style={{width: "100%", marginLeft: "1em"}} ref={inputRef} onKeyDown={handleKeyDown} />
        </div>
      </form>
    </div>
  );
}

export default ShellPrompt;
