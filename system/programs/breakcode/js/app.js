// Main Application
class CodeEditorApp {
  constructor() {
    this.editor = null;
    this.fileExplorer = null;
    this.terminal = null;
    this.openTabs = new Map();
    this.activeTab = null;
    this.unsavedFiles = new Set();
  }
  
  async init() {
    // Initialize editor
    const editorElement = document.getElementById('code-editor');
    const lineNumbersElement = document.getElementById('line-numbers');
    this.editor = new CodeEditor(editorElement, lineNumbersElement);
    
    // Initialize file explorer
    const fileTreeElement = document.getElementById('root-contents');
    this.fileExplorer = new FileExplorer(fileTreeElement);
    this.fileExplorer.onFileOpen = (file) => this.openFile(file.path);
    await this.fileExplorer.loadDirectory('.');
    
    // Initialize terminal
    const terminalContainer = document.getElementById('terminal-content');
    this.terminal = window.terminalManager.createTerminal(terminalContainer);
    
    // Setup sidebar buttons
    this.setupSidebar();
    
    // Setup settings
    this.setupSettings();
    
    // Load plugins
    await window.pluginManager.loadPlugins();
    
    // Render plugins panel
    window.pluginManager.renderPluginsPanel();
    
    console.log('CodeEditor initialized');
  }
  
  setupSidebar() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const panels = document.querySelectorAll('.sidebar-panel');
    
    sidebarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        // Update active button
        sidebarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding panel
        panels.forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`${view}-panel`);
        if (panel) {
          panel.classList.add('active');
        }
      });
    });
  }
  
  setupSettings() {
    // Theme selector
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    }
    
    // Font size
    const fontSizeInput = document.getElementById('font-size');
    if (fontSizeInput) {
      fontSizeInput.addEventListener('change', (e) => {
        this.setFontSize(parseInt(e.target.value));
      });
    }
    
    // Terminal font
    const terminalFontSelect = document.getElementById('terminal-font');
    if (terminalFontSelect) {
      terminalFontSelect.addEventListener('change', (e) => {
        this.setTerminalFont(e.target.value);
      });
    }
  }
  
  setTheme(themeName) {
    // Load theme CSS
    if (themeName !== 'custom') {
      document.documentElement.style.setProperty('--bg-primary', themeName === 'dark' ? '#1e1e1e' : '#ffffff');
      document.documentElement.style.setProperty('--bg-secondary', themeName === 'dark' ? '#252526' : '#f3f3f3');
      document.documentElement.style.setProperty('--fg-primary', themeName === 'dark' ? '#cccccc' : '#333333');
    }
  }
  
  setFontSize(size) {
    const editor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('line-numbers');
    if (editor) editor.style.fontSize = size + 'px';
    if (lineNumbers) lineNumbers.style.fontSize = size + 'px';
  }
  
  setTerminalFont(font) {
    document.documentElement.style.setProperty('--term-font', font);
  }
  
  async openFile(path) {
    // Check if already open
    if (this.openTabs.has(path)) {
      this.switchToTab(path);
      return;
    }
    
    try {
      const data = await FileAPI.readFile(path);
      
      if (data.error) {
        console.error('Error opening file:', data.error);
        return;
      }
      
      // Create tab
      this.createTab(path, data.content);
      
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }
  
  createTab(path, content) {
    const tabsContainer = document.getElementById('tabs');
    const filename = path.split('/').pop();
    
    // Create tab element
    const tab = document.createElement('div');
    tab.className = 'tab active';
    tab.dataset.file = path;
    tab.innerHTML = `
      <span class="tab-icon">${this.getFileIcon(filename)}</span>
      <span class="tab-title">${filename}</span>
      <button class="tab-close" title="Close">×</button>
    `;
    
    // Tab click to switch
    tab.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        this.switchToTab(path);
      }
    });
    
    // Close button
    tab.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(path);
    });
    
    tabsContainer.appendChild(tab);
    
    // Store file content
    this.openTabs.set(path, content);
    
    // Switch to new tab
    this.switchToTab(path);
    
    // Load file in editor
    const language = SyntaxHighlighter.detectLanguage(path);
    this.editor.openFile(path, content, language);
  }
  
  switchToTab(path) {
    // Update tab UI
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.tab[data-file="${path}"]`);
    if (tab) {
      tab.classList.add('active');
    }
    
    // Load content in editor
    const content = this.openTabs.get(path);
    if (content !== undefined) {
      const language = SyntaxHighlighter.detectLanguage(path);
      this.editor.openFile(path, content, language);
    }
    
    this.activeTab = path;
  }
  
  closeTab(path) {
    // Check for unsaved changes
    if (this.unsavedFiles.has(path)) {
      if (!confirm('You have unsaved changes. Close anyway?')) {
        return;
      }
    }
    
    // Remove from open tabs
    this.openTabs.delete(path);
    this.unsavedFiles.delete(path);
    
    // Remove tab element
    const tab = document.querySelector(`.tab[data-file="${path}"]`);
    if (tab) {
      tab.remove();
    }
    
    // Switch to another tab or clear editor
    if (this.openTabs.size > 0) {
      const nextPath = this.openTabs.keys().next().value;
      this.switchToTab(nextPath);
    } else {
      this.editor.clear();
    }
  }
  
  async saveFile(path) {
    const content = this.editor.getContent();
    
    try {
      const result = await FileAPI.writeFile(path, content);
      
      if (result.error) {
        console.error('Error saving file:', result.error);
        return;
      }
      
      // Update stored content
      this.openTabs.set(path, content);
      this.unsavedFiles.delete(path);
      
      // Update tab title
      const tab = document.querySelector(`.tab[data-file="${path}"]`);
      if (tab) {
        const titleEl = tab.querySelector('.tab-title');
        if (titleEl) {
          titleEl.textContent = path.split('/').pop();
        }
      }
      
      console.log('File saved:', path);
      
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }
  
  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'php': '🐘',
      'js': '📜',
      'ts': '📘',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'txt': '📄'
    };
    return icons[ext] || '📄';
  }
  
  markUnsaved(path) {
    this.unsavedFiles.add(path);
    const tab = document.querySelector(`.tab[data-file="${path}"]`);
    if (tab) {
      const titleEl = tab.querySelector('.tab-title');
      if (titleEl) {
        const name = path.split('/').pop();
        titleEl.textContent = `${name} •`;
      }
    }
  }
}

// Terminal functions (global for HTML onclick)
function addTerminal() {
  const container = document.getElementById('terminal-content');
  const terminal = window.terminalManager.createTerminal(container);
}

function toggleTerminal() {
  const panel = document.getElementById('terminal-panel');
  panel.classList.toggle('minimized');
}

function toggleTerminalSize() {
  const panel = document.getElementById('terminal-panel');
  panel.classList.toggle('maximized');
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.codeEditorApp = new CodeEditorApp();
  window.codeEditorApp.init();
});