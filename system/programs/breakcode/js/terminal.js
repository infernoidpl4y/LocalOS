// Terminal implementation
class Terminal {
  constructor(container) {
    this.container = container;
    this.history = [];
    this.historyIndex = -1;
    this.commandHistory = [];
    this.commandHistoryIndex = -1;
    this.currentPath = '/';
    this.user = 'user';
    this.host = 'breakingos';
    this.commands = {};
    this.outputCallback = null;
    
    this.init();
  }
  
  init() {
    this.instance = document.createElement('div');
    this.instance.className = 'terminal-instance';
    
    this.output = document.createElement('div');
    this.output.className = 'terminal-output';
    
    this.inputLine = document.createElement('div');
    this.inputLine.className = 'terminal-input-line';
    
    this.prompt = document.createElement('span');
    this.prompt.className = 'terminal-prompt';
    this.updatePrompt();
    
    this.input = document.createElement('input');
    this.input.className = 'terminal-input';
    this.input.type = 'text';
    this.input.autocomplete = 'off';
    this.input.spellcheck = false;
    
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    this.inputLine.appendChild(this.prompt);
    this.inputLine.appendChild(this.input);
    
    this.instance.appendChild(this.output);
    this.instance.appendChild(this.inputLine);
    this.container.appendChild(this.instance);
    
    // Register default commands
    this.registerDefaultCommands();
    
    // Focus input on click
    this.instance.addEventListener('click', () => this.input.focus());
    
    // Welcome message
    this.printWelcome();
  }
  
  updatePrompt() {
    this.prompt.textContent = `${this.user}@${this.host}:${this.currentPath}$ `;
  }
  
  setUser(user) {
    this.user = user;
    this.updatePrompt();
  }
  
  setPath(path) {
    this.currentPath = path;
    this.updatePrompt();
  }
  
  registerCommand(name, callback, description = '') {
    this.commands[name] = { callback, description };
  }
  
  registerDefaultCommands() {
    // Help command
    this.registerCommand('help', () => {
      let output = '\x1b[36mAvailable commands:\x1b[0m\n\n';
      for (const [name, cmd] of Object.entries(this.commands)) {
        output += `  \x1b[33m${name}\x1b[0m`;
        if (cmd.description) {
          output += ` - ${cmd.description}`;
        }
        output += '\n';
      }
      return output;
    }, 'Show available commands');
    
    // Clear command
    this.registerCommand('clear', () => {
      this.output.innerHTML = '';
      return '';
    }, 'Clear terminal');
    
    // Echo command
    this.registerCommand('echo', (args) => {
      return args.join(' ');
    }, 'Print text');
    
    // Date command
    this.registerCommand('date', () => {
      return new Date().toString();
    }, 'Show current date and time');
    
    // Whoami command
    this.registerCommand('whoami', () => {
      return this.user;
    }, 'Show current user');
    
    // Pwd command
    this.registerCommand('pwd', () => {
      return this.currentPath;
    }, 'Print working directory');
    
    // History command
    this.registerCommand('history', () => {
      return this.commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
    }, 'Show command history');
  }
  
  handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = this.input.value.trim();
      if (command) {
        this.execute(command);
        this.commandHistory.push(command);
        this.commandHistoryIndex = this.commandHistory.length;
      }
      this.input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.commandHistoryIndex > 0) {
        this.commandHistoryIndex--;
        this.input.value = this.commandHistory[this.commandHistoryIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.commandHistoryIndex < this.commandHistory.length - 1) {
        this.commandHistoryIndex++;
        this.input.value = this.commandHistory[this.commandHistoryIndex] || '';
      } else {
        this.commandHistoryIndex = this.commandHistory.length;
        this.input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.handleAutocomplete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.output.innerHTML = '';
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this.write('\n^C\n');
      this.updatePrompt();
    } else if (e.key === 'u') {
      e.preventDefault();
      this.input.value = '';
    }
  }
  
  handleAutocomplete() {
    const input = this.input.value;
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];
    
    // Get available commands
    const availableCommands = Object.keys(this.commands);
    const matches = availableCommands.filter(cmd => cmd.startsWith(lastPart));
    
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      this.input.value = parts.join(' ');
    } else if (matches.length > 1) {
      this.write('\n' + matches.join('  ') + '\n');
      this.updatePrompt();
    }
  }
  
  async execute(command) {
    // Print command line
    this.write(`${this.prompt.textContent}${command}\n`);
    
    // Parse command
    const parts = command.trim().split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);
    
    // Check if command exists
    if (this.commands[cmdName]) {
      try {
        const result = await this.commands[cmdName].callback(args, this);
        if (result) {
          this.write(result);
        }
      } catch (error) {
        this.write(`\x1b[31mError: ${error.message}\x1b[0m\n`);
      }
    } else {
      // Try to execute as shell command via PHP API
      await this.executeShellCommand(command);
    }
    
    this.updatePrompt();
    this.scrollToBottom();
  }
  
  async executeShellCommand(command) {
    try {
      const formData = new FormData();
      formData.append('cmd', command);
      formData.append('cwd', this.currentPath);
      
      const response = await fetch('api/terminal.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.output) {
        this.write(this.parseAnsi(data.output));
      }
      
      if (data.error) {
        this.write(`\x1b[31m${data.error}\x1b[0m\n`);
      }
      
      if (data.cwd) {
        this.setPath(data.cwd);
      }
    } catch (error) {
      this.write(`\x1b[31mFailed to execute command: ${error.message}\x1b[0m\n`);
    }
  }
  
  parseAnsi(text) {
    // Simple ANSI to HTML parser
    // This handles basic ANSI codes
    const ansiMap = {
      '0': '</span>',
      '1': '<span class="ansi-bold">',
      '30': '<span class="ansi-0">',
      '31': '<span class="ansi-1">',
      '32': '<span class="ansi-2">',
      '33': '<span class="ansi-3">',
      '34': '<span class="ansi-4">',
      '35': '<span class="ansi-5">',
      '36': '<span class="ansi-6">',
      '37': '<span class="ansi-7">',
      '90': '<span class="ansi-8">',
      '91': '<span class="ansi-9">',
      '92': '<span class="ansi-10">',
      '93': '<span class="ansi-11">',
      '94': '<span class="ansi-12">',
      '95': '<span class="ansi-13">',
      '96': '<span class="ansi-14">',
      '97': '<span class="ansi-15">'
    };
    
    let result = text;
    let inSpan = false;
    
    // Replace ANSI escape sequences
    result = result.replace(/\x1b\[(\d+(?:;\d+)*)m/g, (match, codes) => {
      let html = '';
      const codeList = codes.split(';');
      
      for (const code of codeList) {
        if (ansiMap[code]) {
          html += ansiMap[code];
          inSpan = true;
        } else if (code === '0') {
          html += '</span>';
          inSpan = false;
        }
      }
      
      return html;
    });
    
    // Close any open spans
    if (inSpan) {
      result += '</span>';
    }
    
    return result;
  }
  
  write(text) {
    this.output.innerHTML += text;
    this.scrollToBottom();
  }
  
  writeln(text) {
    this.write(text + '\n');
  }
  
  printWelcome() {
    this.write(`
\x1b[32m╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   \x1b[36m██╗     ██╗   ██╗███╗   ███╗███╗   ███╗██╗███╗   ██╗██████╗ \x1b[32m  ║
║   \x1b[36m██║     ██║   ██║████╗ ████║████╗ ████║██║████╗  ██║██╔══██╗\x1b[32m  ║
║   \x1b[36m██║     ██║   ██║██╔████╔██║██╔████╔██║██║██╔██╗ ██║██║  ██║\x1b[32m  ║
║   \x1b[36m██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║██║╚██╗██║██║  ██║\x1b[32m  ║
║   \x1b[36m██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║██║ ╚████║██████╔╝\x1b[32m  ║
║   \x1b[36m╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ \x1b[32m  ║
║                                                                ║
║              \x1b[37mTerminal v1.0.0 - Type 'help' for commands\x1b[32m          ║
╚════════════════════════════════════════════════════════════════╝\x1b[0m

`);
  }
  
  clear() {
    this.output.innerHTML = '';
  }
  
  focus() {
    this.input.focus();
  }
  
  scrollToBottom() {
    this.instance.scrollTop = this.instance.scrollHeight;
  }
  
  setOutputCallback(callback) {
    this.outputCallback = callback;
  }
}

// Terminal Manager
class TerminalManager {
  constructor() {
    this.terminals = [];
    this.activeTerminal = 0;
  }
  
  createTerminal(container) {
    const terminal = new Terminal(container);
    this.terminals.push(terminal);
    return terminal;
  }
  
  getActiveTerminal() {
    return this.terminals[this.activeTerminal];
  }
  
  setActiveTerminal(index) {
    if (index >= 0 && index < this.terminals.length) {
      this.activeTerminal = index;
    }
  }
}

// Global terminal manager
window.terminalManager = new TerminalManager();