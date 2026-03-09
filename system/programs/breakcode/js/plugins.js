// Plugin System
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = {};
  }
  
  // Register a plugin
  register(plugin) {
    if (!plugin.name) {
      console.error('Plugin must have a name');
      return false;
    }
    
    // Initialize plugin
    if (plugin.init && typeof plugin.init === 'function') {
      plugin.init();
    }
    
    this.plugins.set(plugin.name, plugin);
    
    // Register hooks
    if (plugin.hooks) {
      for (const [hook, callback] of Object.entries(plugin.hooks)) {
        this.registerHook(hook, callback);
      }
    }
    
    console.log(`Plugin loaded: ${plugin.name}`);
    return true;
  }
  
  // Unregister a plugin
  unregister(name) {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      return false;
    }
    
    // Cleanup plugin
    if (plugin.destroy && typeof plugin.destroy === 'function') {
      plugin.destroy();
    }
    
    // Remove hooks
    if (plugin.hooks) {
      for (const hook of Object.keys(plugin.hooks)) {
        this.unregisterHook(hook, name);
      }
    }
    
    this.plugins.delete(name);
    console.log(`Plugin unloaded: ${name}`);
    return true;
  }
  
  // Register a hook callback
  registerHook(hook, callback) {
    if (!this.hooks[hook]) {
      this.hooks[hook] = [];
    }
    this.hooks[hook].push(callback);
  }
  
  // Unregister a hook
  unregisterHook(hook, pluginName) {
    if (!this.hooks[hook]) {
      return;
    }
    
    this.hooks[hook] = this.hooks[hook].filter(cb => cb.pluginName !== pluginName);
  }
  
  // Execute all callbacks for a hook
  executeHook(hook, ...args) {
    if (!this.hooks[hook]) {
      return [];
    }
    
    const results = [];
    for (const callback of this.hooks[hook]) {
      try {
        const result = callback(...args);
        results.push(result);
      } catch (error) {
        console.error(`Error in hook ${hook}:`, error);
      }
    }
    
    return results;
  }
  
  // Get all loaded plugins
  getPlugins() {
    return Array.from(this.plugins.values());
  }
  
  // Get a specific plugin
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  // Load plugins from directory
  async loadPlugins() {
    try {
      const response = await fetch('api/plugins.php');
      const data = await response.json();
      
      for (const pluginInfo of data.plugins || []) {
        await this.loadPluginFile(pluginInfo);
      }
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }
  
  // Load a single plugin file
  async loadPluginFile(pluginInfo) {
    try {
      // Load JavaScript
      if (pluginInfo.js) {
        await this.loadScript(pluginInfo.js);
      }
      
      // Load CSS
      if (pluginInfo.css) {
        await this.loadStyle(pluginInfo.css);
      }
    } catch (error) {
      console.error(`Error loading plugin ${pluginInfo.name}:`, error);
    }
  }
  
  // Dynamically load a script
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Dynamically load a stylesheet
  loadStyle(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  
  // Render plugins panel
  renderPluginsPanel() {
    const container = document.getElementById('plugins-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const plugins = this.getPlugins();
    
    if (plugins.length === 0) {
      container.innerHTML = '<p style="padding:10px;color:var(--fg-secondary)">No plugins installed</p>';
      return;
    }
    
    for (const plugin of plugins) {
      const item = document.createElement('div');
      item.className = 'plugin-item';
      item.innerHTML = `
        <div class="plugin-name">${plugin.name}</div>
        <div class="plugin-version">v${plugin.version || '1.0.0'}</div>
        ${plugin.description ? `<div class="plugin-desc">${plugin.description}</div>` : ''}
      `;
      container.appendChild(item);
    }
  }
}

// Plugin API for creating plugins
const PluginAPI = {
  // Create a new plugin definition
  create(name, options = {}) {
    return {
      name,
      version: options.version || '1.0.0',
      description: options.description || '',
      author: options.author || '',
      hooks: options.hooks || {},
      init: options.init,
      destroy: options.destroy
    };
  },
  
  // Register commands for terminal
  registerTerminalCommand(name, callback, description = '') {
    const terminal = window.terminalManager?.getActiveTerminal();
    if (terminal) {
      terminal.registerCommand(name, callback, description);
    }
  },
  
  // Add sidebar button
  addSidebarButton(icon, title, onClick) {
    const sidebar = document.querySelector('.sidebar-icons');
    if (!sidebar) return;
    
    const btn = document.createElement('button');
    btn.className = 'sidebar-btn';
    btn.title = title;
    btn.innerHTML = icon;
    btn.addEventListener('click', onClick);
    sidebar.appendChild(btn);
  },
  
  // Add menu item
  addMenuItem(menu, label, onClick) {
    // Implementation depends on menu structure
  },
  
  // Add editor command
  addEditorCommand(key, callback) {
    // Could be used for keyboard shortcuts
  }
};

// Global plugin manager
window.pluginManager = new PluginManager();
window.PluginAPI = PluginAPI;