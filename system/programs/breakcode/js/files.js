// File Explorer implementation
class FileExplorer {
  constructor(rootElement) {
    this.root = rootElement;
    this.currentPath = '.';
    this.files = [];
    this.selectedFile = null;
    this.onFileSelect = null;
    this.onFileOpen = null;
  }
  
  async loadDirectory(path = '.') {
    try {
      const formData = new FormData();
      formData.append('path', path);
      
      const response = await fetch('api/files.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Error loading directory:', data.error);
        return;
      }
      
      this.currentPath = path;
      this.files = data.files || [];
      this.render();
    } catch (error) {
      console.error('Error loading directory:', error);
    }
  }
  
  render() {
    this.root.innerHTML = '';
    
    // Root folder item
    const rootFolder = document.createElement('div');
    rootFolder.className = 'folder-item expanded';
    rootFolder.innerHTML = `
      <span class="folder-icon"></span>
      <span class="folder-name">${this.getBasename(this.currentPath) || 'root'}</span>
    `;
    rootFolder.addEventListener('click', () => this.toggleFolder(rootFolder));
    this.root.appendChild(rootFolder);
    
    // Folder contents
    const contents = document.createElement('div');
    contents.className = 'folder-contents show';
    
    // Sort: folders first, then files
    const sortedFiles = [...this.files].sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
    
    for (const file of sortedFiles) {
      const item = this.createFileItem(file);
      contents.appendChild(item);
    }
    
    this.root.appendChild(contents);
  }
  
  createFileItem(file) {
    const item = document.createElement('div');
    
    if (file.isDir) {
      item.className = 'folder-item';
      item.innerHTML = `
        <span class="folder-icon"></span>
        <span class="folder-name">${file.name}</span>
      `;
      item.addEventListener('click', () => this.loadDirectory(file.path));
    } else {
      item.className = 'file-item';
      item.dataset.path = file.path;
      item.innerHTML = `
        <span class="file-icon">${this.getFileIcon(file.name)}</span>
        <span class="file-name">${file.name}</span>
      `;
      item.addEventListener('click', () => this.selectFile(file));
      item.addEventListener('dblclick', () => this.openFile(file));
    }
    
    return item;
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
      'txt': '📄',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'pdf': '📕',
      'zip': '📦',
      'tar': '📦',
      'gz': '📦'
    };
    return icons[ext] || '📄';
  }
  
  getBasename(path) {
    return path.split('/').pop() || path;
  }
  
  toggleFolder(element) {
    element.classList.toggle('expanded');
    const nextSibling = element.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('folder-contents')) {
      nextSibling.classList.toggle('show');
    }
  }
  
  selectFile(file) {
    // Remove previous selection
    const selected = this.root.querySelector('.file-item.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    
    // Add selection to current
    const item = this.root.querySelector(`[data-path="${file.path}"]`);
    if (item) {
      item.classList.add('selected');
    }
    
    this.selectedFile = file;
    
    if (this.onFileSelect) {
      this.onFileSelect(file);
    }
  }
  
  async openFile(file) {
    if (file.isDir) {
      await this.loadDirectory(file.path);
      return;
    }
    
    if (this.onFileOpen) {
      this.onFileOpen(file);
    }
  }
  
  async navigateUp() {
    const parts = this.currentPath.split('/');
    parts.pop();
    const parentPath = parts.join('/') || '.';
    await this.loadDirectory(parentPath);
  }
  
  async navigateTo(path) {
    await this.loadDirectory(path);
  }
}

// File API backend
class FileAPI {
  static async listDirectory(path = '.') {
    const formData = new FormData();
    formData.append('path', path);
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  static async readFile(path) {
    const formData = new FormData();
    formData.append('action', 'read');
    formData.append('path', path);
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  static async writeFile(path, content) {
    const formData = new FormData();
    formData.append('action', 'write');
    formData.append('path', path);
    formData.append('content', content);
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  static async createFile(path) {
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('path', path);
    formData.append('type', 'file');
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  static async createDirectory(path) {
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('path', path);
    formData.append('type', 'dir');
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  static async deleteFile(path) {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('path', path);
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  static async renameFile(oldPath, newPath) {
    const formData = new FormData();
    formData.append('action', 'rename');
    formData.append('oldPath', oldPath);
    formData.append('newPath', newPath);
    
    const response = await fetch('api/files.php', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
}

// Export
window.FileExplorer = FileExplorer;
window.FileAPI = FileAPI;