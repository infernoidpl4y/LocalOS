// Syntax highlighting definitions
const SyntaxHighlighter = {
  languages: {},
  
  // Define a language
  define(lang, patterns) {
    this.languages[lang] = patterns;
  },
  
  // Get patterns for a language
  get(lang) {
    return this.languages[lang] || this.languages['plaintext'];
  },
  
  // Detect language from file extension
  detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      'php': 'php',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'css',
      'sass': 'css',
      'less': 'css',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'py': 'python',
      'rb': 'ruby',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'yml': 'yaml',
      'yaml': 'yaml',
      'txt': 'plaintext'
    };
    return map[ext] || 'plaintext';
  },
  
  // Apply highlighting to code
  highlight(code, language) {
    const patterns = this.get(language);
    if (!patterns || language === 'plaintext') {
      return this.escapeHtml(code);
    }
    
    let result = this.escapeHtml(code);
    
    // Apply patterns in order
    for (const pattern of patterns) {
      if (pattern.type === 'keyword') {
        const regex = new RegExp(`\\b(${pattern.values.join('|')})\\b`, 'g');
        result = result.replace(regex, `<span class="syntax-${pattern.class}">$1</span>`);
      } else if (pattern.type === 'string') {
        const regex = new RegExp(`(${pattern.start}.*?${pattern.end})`, pattern.flags || 'g');
        result = result.replace(regex, `<span class="syntax-${pattern.class}">$1</span>`);
      } else if (pattern.type === 'regex') {
        const regex = new RegExp(`(${pattern.pattern})`, pattern.flags || 'g');
        result = result.replace(regex, `<span class="syntax-${pattern.class}">$1</span>`);
      } else if (pattern.type === 'comment') {
        const regex = new RegExp(`(${pattern.pattern})`, pattern.flags || 'g');
        result = result.replace(regex, `<span class="syntax-${pattern.class}">$1</span>`);
      } else if (pattern.type === 'number') {
        const regex = new RegExp(`\\b(${pattern.pattern})\\b`, 'g');
        result = result.replace(regex, `<span class="syntax-${pattern.class}">$1</span>`);
      } else if (pattern.type === 'function') {
        const regex = new RegExp(`\\b(${pattern.pattern})\\s*\\(`, 'g');
        result = result.replace(regex, `<span class="syntax-${pattern.class}">$1</span>(`);
      }
    }
    
    return result;
  },
  
  // Escape HTML entities
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
};

// Define PHP language
SyntaxHighlighter.define('php', [
  {
    type: 'keyword',
    class: 'keyword',
    values: ['echo', 'print', 'if', 'else', 'elseif', 'switch', 'case', 'break', 'default', 'for', 'foreach', 'while', 'do', 'return', 'function', 'class', 'extends', 'implements', 'interface', 'trait', 'use', 'namespace', 'require', 'require_once', 'include', 'include_once', 'new', 'this', 'self', 'parent', 'static', 'public', 'private', 'protected', 'final', 'abstract', 'const', 'var', 'try', 'catch', 'throw', 'finally', 'yield', 'async', 'await', 'true', 'false', 'null', 'and', 'or', 'xor', 'instanceof', 'insteadof', 'as', 'global', 'empty', 'isset', 'unset', 'die', 'exit']
  },
  {
    type: 'string',
    class: 'string',
    start: '"',
    end: '"',
    flags: 'g'
  },
  {
    type: 'string',
    class: 'string',
    start: "'",
    end: "'",
    flags: 'g'
  },
  {
    type: 'comment',
    class: 'comment',
    pattern: '//.*$|/\\*[\\s\\S]*?\\*/',
    flags: 'gm'
  },
  {
    type: 'number',
    class: 'number',
    pattern: '\\b\\d+\\.?\\d*\\b'
  },
  {
    type: 'function',
    class: 'function',
    pattern: '[a-zA-Z_]\\w*'
  }
]);

// Define JavaScript language
SyntaxHighlighter.define('javascript', [
  {
    type: 'keyword',
    class: 'keyword',
    values: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'switch', 'case', 'break', 'default', 'for', 'while', 'do', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends', 'super', 'this', 'import', 'export', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'null', 'undefined', 'true', 'false', 'NaN', 'Infinity']
  },
  {
    type: 'string',
    class: 'string',
    start: '"',
    end: '"',
    flags: 'g'
  },
  {
    type: 'string',
    class: 'string',
    start: "'",
    end: "'",
    flags: 'g'
  },
  {
    type: 'string',
    class: 'string',
    start: '`',
    end: '`',
    flags: 'g'
  },
  {
    type: 'comment',
    class: 'comment',
    pattern: '//.*$|/\\*[\\s\\S]*?\\*/',
    flags: 'gm'
  },
  {
    type: 'number',
    class: 'number',
    pattern: '\\b\\d+\\.?\\d*\\b'
  },
  {
    type: 'function',
    class: 'function',
    pattern: '[a-zA-Z_]\\w*(?=\\s*\\()'
  }
]);

// Define HTML language
SyntaxHighlighter.define('html', [
  {
    type: 'keyword',
    class: 'tag',
    values: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'link', 'script', 'style', 'meta', 'title', 'header', 'footer', 'nav', 'section', 'article', 'aside', 'main', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'iframe', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  },
  {
    type: 'string',
    class: 'attr-value',
    start: '"',
    end: '"',
    flags: 'g'
  },
  {
    type: 'string',
    class: 'attr-value',
    start: "'",
    end: "'",
    flags: 'g'
  },
  {
    type: 'comment',
    class: 'comment',
    pattern: '<!--[\\s\\S]*?-->',
    flags: 'g'
  }
]);

// Define CSS language
SyntaxHighlighter.define('css', [
  {
    type: 'keyword',
    class: 'selector',
    pattern: '[.#]?[a-zA-Z_][a-zA-Z0-9_-]*(?=\\s*\\{)'
  },
  {
    type: 'keyword',
    class: 'property',
    pattern: '[a-z-]+(?=\\s*:)'
  },
  {
    type: 'string',
    class: 'value',
    start: '"',
    end: '"',
    flags: 'g'
  },
  {
    type: 'string',
    class: 'value',
    start: "'",
    end: "'",
    flags: 'g'
  },
  {
    type: 'comment',
    class: 'comment',
    pattern: '/\\*[\\s\\S]*?\\*/',
    flags: 'g'
  },
  {
    type: 'number',
    class: 'number',
    pattern: '-?\\d+\\.?\\d*(px|em|rem|%|vh|vw|pt|cm|mm|in)?'
  }
]);

// Define JSON language
SyntaxHighlighter.define('json', [
  {
    type: 'string',
    class: 'key',
    start: '"',
    end: '"(?=\\s*:)',
    flags: 'g'
  },
  {
    type: 'keyword',
    class: 'literal',
    values: ['true', 'false', 'null']
  },
  {
    type: 'number',
    class: 'number',
    pattern: '-?\\d+\\.?\\d*([eE][+-]?\\d+)?'
  }
]);

// Define Bash language
SyntaxHighlighter.define('bash', [
  {
    type: 'keyword',
    class: 'keyword',
    values: ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'do', 'done', 'in', 'function', 'return', 'local', 'export', 'source', 'alias', 'unalias', 'set', 'unset', 'shift', 'exit', 'break', 'continue', 'true', 'false']
  },
  {
    type: 'string',
    class: 'string',
    start: '"',
    end: '"',
    flags: 'g'
  },
  {
    type: 'string',
    class: 'string',
    start: "'",
    end: "'",
    flags: 'g'
  },
  {
    type: 'comment',
    class: 'comment',
    pattern: '#.*$',
    flags: 'gm'
  },
  {
    type: 'function',
    class: 'function',
    pattern: '\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*\\()'
  }
]);

// Define YAML language
SyntaxHighlighter.define('yaml', [
  {
    type: 'keyword',
    class: 'key',
    pattern: '^[a-zA-Z_][a-zA-Z0-9_-]*(?=\\s*:)'
  },
  {
    type: 'string',
    class: 'string',
    start: '"',
    end: '"',
    flags: 'g'
  },
  {
    type: 'string',
    class: 'string',
    start: "'",
    end: "'",
    flags: 'g'
  },
  {
    type: 'keyword',
    class: 'literal',
    values: ['true', 'false', 'null', 'yes', 'no', 'on', 'off']
  },
  {
    type: 'number',
    class: 'number',
    pattern: '-?\\d+\\.?\\d*'
  },
  {
    type: 'comment',
    class: 'comment',
    pattern: '#.*$',
    flags: 'gm'
  }
]);

// Plaintext (default)
SyntaxHighlighter.define('plaintext', []);

// Export for use
window.SyntaxHighlighter = SyntaxHighlighter;