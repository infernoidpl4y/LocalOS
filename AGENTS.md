# AGENTS.md - LocalOS Development Guidelines

## Project Overview

LocalOS is a PHP-based web operating system that runs in the browser. It uses vanilla PHP with embedded HTML, CSS, and JavaScript. No build system, no Composer dependencies (unless absolutely necessary), no formal testing framework.

**Objective**: Create a web-based OS capable of managing the base system from the browser, with multi-user support for controlled interactivity.

## Build / Lint / Test Commands

### Running the Application
```bash
# PHP built-in server (recommended)
php -S localhost:8000
# Access at http://localhost:8000/

# Syntax check single file
php -l filename.php

# Syntax check all PHP files recursively
find . -name "*.php" -exec php -l {} \;
```

### Code Quality Tools (if needed)
```bash
# PHP-CS-Fixer for code style
composer require --dev friendsofphp/php-cs-fixer
./vendor/bin/php-cs-fixer fix --dry-run --diff
./vendor/bin/php-cs-fixer fix --rules=@PSR12

# Psalm for static analysis
composer require --dev vimeo/psalm
./vendor/bin/psalm
./vendor/bin/psalm --no-progress

# PHPStan for simpler analysis
composer require --dev phpstan/phpstan
./vendor/bin/phpstan analyse
```

### Testing (if added)
```bash
# PHPUnit
composer require --dev phpunit/phpunit
./vendor/bin/phpunit --testdox

# Run single test
./vendor/bin/phpunit --filter TestName tests/

# Run tests with coverage
./vendor/bin/phpunit --coverage-html coverage/
```

## Code Style Guidelines

### General Principles
- Follow PSR-12 where possible
- Keep code readable and maintainable
- Use meaningful variable and function names
- Don't overcomplicate - this is a simple project
- Prefer vanilla PHP/JS solutions over framework additions

### PHP Tags
- Use `<?php` for PHP code blocks
- Avoid short tags `<?`
- Short echo tags `<?= ?>` are acceptable in templates

### Naming Conventions
- **Classes**: PascalCase (`UserAuth`, `SessionManager`)
- **Functions/methods**: camelCase (`getUserData()`, `calculateTotal()`)
- **Variables**: camelCase (`$userName`, `$sessionToken`)
- **Constants**: UPPER_CASE (`OS_SYSTEM_DIR`, `DEFAULT_THEME`)
- **Files**: lowercase with underscores (`login_styles.php`, `user_service.php`)
- **Boolean variables**: prefix with `is`, `has`, `can`, `should` (`$isLoggedIn`, `$hasPermission`)

### Types and Type Hints
- Declare return types when possible
- Use type hints for parameters
- Use nullable types (`?string`, `?int`)
- Enable strict types: `declare(strict_types=1);`

```php
declare(strict_types=1);

function getUserById(int $id): ?array {
    // ...
}

function processData(array $data, ?string $name = null): bool {
    // ...
}
```

### Strings
- Double quotes for strings with variables: `"Hello $name"`
- Single quotes for static strings: `'hello world'`
- Use heredoc/nowdoc for multi-line strings when appropriate
- Use `sprintf()` for complex string formatting

### Arrays
- Short array syntax: `$array = ['a', 'b', 'c'];`
- Trailing comma in multi-line arrays
- Use `array_filter()`, `array_map()`, `array_reduce()` for transformations

```php
$items = [
    'first' => $value1,
    'second' => $value2,
];
```

### Classes and Objects
- One class per file
- File name should match class name
- Define properties with visibility keywords (`private`, `protected`, `public`)
- Use constructor injection for dependencies
- Keep classes focused (Single Responsibility Principle)

```php
class UserService {
    private UserRepository $repository;
    
    public function __construct(UserRepository $repository) {
        $this->repository = $repository;
    }
    
    public function getUserById(int $id): ?User {
        return $this->repository->find($id);
    }
}
```

### Functions
- Keep functions small and focused (ideally < 30 lines)
- Single responsibility per function
- Use early returns to avoid nested conditionals
- Document complex logic with PHPDoc

```php
function processUserInput(?string $input): string {
    if ($input === null) {
        return '';
    }
    
    return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
}
```

### Error Handling
- Use exceptions for error handling
- Never expose sensitive information in error messages
- Log errors appropriately (use error_log() or custom logger)
- Return appropriate HTTP status codes in APIs
- Gracefully degrade - don't crash the app

```php
try {
    $result = $service->process($data);
} catch (ValidationException $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
```

### Security
- **NEVER** trust user input - always sanitize/validate
- Escape output with `htmlspecialchars()` before displaying user data
- Use `ENT_QUOTES | ENT_HTML5` for full HTML entity encoding
- Store passwords hashed with `password_hash()` and verify with `password_verify()`
- CSRF protection for forms
- Sanitize file paths to prevent directory traversal

```php
// Good - escaping output
echo htmlspecialchars($username, ENT_QUOTES | ENT_HTML5, 'UTF-8');

// Bad - SQL injection vulnerable
$query = "SELECT * FROM users WHERE username = '$username'";

// Good - parameterized query (if using database)
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
```

### Imports and Includes
- Use `require_once` for files that must be loaded (classes, configs)
- Use `include` for optional template files
- Define constants before including files that use them
- Avoid relative paths in includes - use absolute paths with `__DIR__`

```php
require_once __DIR__ . '/../system/config.php';
require_once OS_TEMPLATES_DIR . 'header.php';
```

### JavaScript Guidelines
- Use strict mode: `'use strict';`
- Prefer `const` over `let`, avoid `var`
- Use ES6+ features (arrow functions, destructuring, template literals)
- Keep scripts in separate files when possible
- Use meaningful variable names
- Use async/await instead of raw promises when possible

```javascript
// Good
const fetchUserData = async (userId) => {
    try {
        const response = await fetch(`/api/users/${userId}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
};

// Good - template literals
const greeting = `Hello, ${userName}!`;
```

### CSS Guidelines
- Use consistent class naming (BEM or similar)
- Use meaningful class names that describe purpose, not appearance
- Use CSS custom properties for values used repeatedly
- Keep styles modular and organized

```css
:root {
    --primary-color: #e94560;
    --secondary-color: #0f3460;
    --text-color: #eee;
}

.button {
    background: var(--primary-color);
    color: var(--text-color);
}
```

## File Structure

```
LocalOS/
├── index.php                  # Main entry point
├── system/
│   ├── templates/             # PHP templates (desktop.php, login.php)
│   ├── styles/               # CSS styles (desktop_styles.php)
│   ├── imgs/                 # Images
│   └── programs/             # Application programs
│       ├── terminal/          # Terminal emulator
│       ├── filemanager/       # File manager with FTP
│       ├── appstore/          # App store
│       ├── breakcode/         # Code editor with plugins
│       ├── calculator/        # Calculator
│       ├── notepad/           # Notepad
│       ├── media/             # Audio/video player
│       ├── chat/              # Internal chat
│       ├── globalchat/        # Global chat
│       ├── settings/          # System settings
│       ├── packman/           # Package manager
│       ├── los/               # LOS programming language
│       └── dws/               # DWS application
└── users/                     # User data directories
    └── [username]/
        ├── desktop.json       # Desktop configuration
        ├── userfile.json      # User data
        ├── apps.desk          # Desktop apps list
        └── chat/              # Chat messages
```

## System Constants

Defined in `index.php`:
- `OS_SYSTEM_DIR` - System directory
- `OS_USERS_DIR` - Users directory  
- `OS_TEMPLATES_DIR` - Templates directory
- `OS_STYLES_DIR` - Styles directory
- `OS_IMAGES_DIR` - Images directory
- `OS_PROGRAMS_DIR` - Programs directory

## Common Tasks

### Creating a New Program
1. Create directory: `system/programs/[appname]/`
2. Create `info.json` with metadata
3. Create `index.html` or `index.php` as entry point
4. Add API endpoints in `api/` subdirectory if needed
5. Add to user's `apps.desk` file with `[extr][appname]`

### Adding a New User
1. Create directory: `users/[username]/`
2. Create `userfile.json` with name and (hashed) password
3. Create `desktop.json` with configuration
4. Create `apps.desk` with list of applications

## Notes for AI Agents

1. **This is a simple project** - don't overcomplicate solutions with unnecessary abstractions
2. **No dependencies** - avoid adding Composer packages unless absolutely necessary
3. **Security matters** - handles user authentication, follow security best practices strictly
4. **Keep it simple** - prefer vanilla PHP/JS solutions over framework additions
5. **Test changes** - manually verify functionality after modifications
6. **Check existing code** - follow the patterns established in the codebase
7. **PHP session handling** - use `session_start()` at the beginning of files that need it
8. **API responses** - use JSON with proper Content-Type headers
