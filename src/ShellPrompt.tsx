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

  const [consoleLines, setConsoleLines] = useState<Array<ConsoleLine>[]>(welcomeMessage);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandPointer, setCommandPointer] = useState<number>(0);
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
    clear: {
      description: "Clears the screen",
      run: () => {
        setTimeout(() => setConsoleLines([]));
        return [];
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
      run: (...args) => {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        return [];
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
          const newLines: ConsoleLine[][] = [ ["$", ...input.slice()]];

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
        if (commandPointer < commandHistory.length) {
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
    if (commandPointer > 0 && commandPointer <= commandHistory.length && inputRef.current !== null) {
      inputRef.current.value = commandHistory[commandHistory.length - commandPointer];
    }
  }, [commandPointer, commandHistory])

  // set last login
  localStorage.setItem('lastLogin', (new Date()).toISOString());

  return (
    <div className="shell">
      <pre style={{maxHeight: "80vh", minHeight: "20vh", flexDirection: "column-reverse", display: "flex", whiteSpace: "pre-wrap"}}>
        {consoleLines.slice().reverse().map((line, index) => (
          <p key={index}>{line.reduce((result, item) => <>{result}{' '}{item}</>)}</p>
        ))}
      </pre>
      <form onSubmit={handleSubmit}>
        <div style={{display: 'flex', alignItems: 'stretch'}}>
          <span>$ </span>
          <input placeholder='Type `help` for assistance.' style={{width: "100%", marginLeft: "1em"}} ref={inputRef} onKeyDown={handleKeyDown} />
        </div>
      </form>
    </div>
  );
}

export default ShellPrompt;
