# LocalOS

Web-based operating system built with PHP, HTML, CSS, and JavaScript.

## Objetivo

- Crear un sistema operativo web capaz de manejar el sistema base desde el navegador
- Sistema operativo multiusuario con interactividad controlada con el dispositivo

## Características

- Interfaz de escritorio funcional
- Sistema de autenticación de usuarios
- Múltiples aplicaciones integradas (editor de código, calculadora, bloc de notas)
- Sistema de archivos por usuario
- Diseño modular y extensible

## Requisitos

- PHP 7.4+ con extensiones estándar
- Navegador web moderno

## Instalación

```bash
# Clonar el repositorio
git clone <repositorio> LocalOS
cd LocalOS

# Iniciar el servidor PHP
php -S localhost:8000
```

## Uso

1. Accede a `http://localhost:8000`
2. Inicia sesión con un usuario existente o crea uno nuevo
3. Explora las aplicaciones disponibles en el menú inicio

## Estructura del Proyecto

```
LocalOS/
├── index.php                  # Punto de entrada principal
├── system/
│   ├── templates/             # Plantillas PHP (desktop.php, login.php)
│   ├── styles/                # Estilos CSS
│   ├── imgs/                  # Imágenes del sistema
│   └── programs/              # Aplicaciones
│       ├── breakcode/         # Editor de código
│       ├── calculator/        # Calculadora
│       ├── notepad/           # Bloc de notas
│       └── dws/               # Aplicación DWS
└── users/                     # Datos de usuarios
    └── [usuario]/
        ├── desktop.json       # Configuración del escritorio
        ├── userfile.json      # Datos del usuario
        └── apps.desk          # Aplicaciones del escritorio
```

## Usuarios

Los usuarios se crean manualmente en el directorio `users/`. Cada usuario necesita:
- Directorio con el nombre del usuario
- Archivo `userfile.json` con datos del usuario
- Archivo `desktop.json` con configuración del escritorio

## Licencia

MIT
