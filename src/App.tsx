import React from 'react';
import { useEffect, useState } from 'react';
import './App.css';

interface Command {
  description: string;
  output: string;
  alias?: string[];
}

type CommandMap = Record<string, Command>;

function App() {
  const username = "guest";
  const hostname = "vaibhav.dev";
  const [history, setHistory] = useState<{ command: string, output: string}[]>([]);
  const [input, setInput] = useState('');
  const [commands, setCommands] = useState<CommandMap>({});

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const res = await fetch('/commands.json');
        const data = await res.json();
        setCommands(data);
      } catch (e) {
        console.log("Failed to load commands:", e);
      }
    };
    loadCommands();
  }, []);

  // Function to convert URLs in the output to clickable links
  const convertToLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
      }
      return part;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const trimmed = input.trim();
      const cmdKey = Object.keys(commands).find(k =>
        k === trimmed || (commands[k].alias?.includes(trimmed))
      );

      if (trimmed === 'clear') {
        setHistory([]);
        setInput('');
        return;
      }

      let output: string | JSX.Element;
      if (!cmdKey) {
        output = `Command not found: ${trimmed}`;
      } else if (cmdKey === "help") {
        output = Object.entries(commands)
          .map(([cmd, val]) => `- ${cmd}: ${val.description}`)
          .join('\n');
      } else {
        // If the command is one of the special ones, convert output to clickable links
        if (["projects", "codingprofiles", "github", "contact"].includes(cmdKey)) {
          output = <>{convertToLinks(commands[cmdKey].output)}</>;
        } else {
          output = commands[cmdKey].output;
        }
      }

      setHistory(prev => [...prev, { command: trimmed, output }]);
      setInput('');
    }
  };

  return (
    <div className="container">
      <div className="banner">
        <pre>{`
 ***********************************************************      
  _    __      _ __    __                   ____        __
 | |  / /___ _(_) /_  / /_  ____ __   __   / __ \\____ _/ /
 | | / / __ \`/ / __ \\/ __ \\/ __ \`/ | / /  / /_/ / __ \`/ / 
 | |/ / /_/ / / /_/ / / / / /_/ /| |/ /  / ____/ /_/ / /  
 |___/\\__,_/_/_.___/_/ /_/\\__,_/ |___/  /_/    \\__,_/_/  
 
 ***********************************************************
  Welcome to the terminal portfolio!
  Type 'help' to see available commands.  
  Type 'clear' to clear the terminal.                                                 
        `}</pre>
      </div>

      <div className="terminal">
        {history.map((entry, i) => (
          <div key={i}>
            <span className="prompt">{username}@{hostname}:~$</span>
            <span className="command"> {entry.command}</span>
            <pre className="output">
              {typeof entry.output === 'string'
                ? entry.output
                : entry.output}
            </pre>
          </div>
        ))}

        <div className="input-line">
          <span className="prompt">{username}@{hostname}:~$</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

export default App;
