# Centinela Frontend (Mapa de Emergencias) 🚨🗺️

Centinela es una plataforma web moderna e interactiva diseñada para monitorear y visualizar emergencias en tiempo real. Este repositorio contiene el frontend de la aplicación, desarrollado con tecnologías de última generación para garantizar un rendimiento óptimo, accesibilidad y una excelente experiencia de usuario.

## 🚀 Características Principales

- **Mapa Interactivo:** Visualización en tiempo real de incidentes y terremotos utilizando `react-map-gl` y `maplibre-gl`.
- **Filtros Dinámicos:** Filtrado de emergencias por tipo (incendios, accidentes, alertas, sismos, etc.), con persistencia en `localStorage`.
- **Soporte Multi-idioma (i18n):** Traducción dinámica entre Español e Inglés mediante `react-i18next`.
- **Menú de Accesibilidad:** Opciones para mejorar la lectura y visualización (alto contraste, tamaño de texto, modo daltónico).
- **Gestión de Estado Eficiente:** Manejo del estado global con `Zustand` y caché de datos asíncronos con `@tanstack/react-query`.
- **Diseño Responsivo y Moderno:** Interfaz estilizada completamente con `Tailwind CSS`, optimizada para dispositivos móviles y de escritorio.
- **Reporte de Emergencias:** Interfaz para que los usuarios puedan reportar incidentes directamente desde la aplicación.

## 🛠️ Stack Tecnológico

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Mapas:** [MapLibre GL JS](https://maplibre.org/) + [React Map GL](https://visgl.github.io/react-map-gl/)
- **Gestión de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Internacionalización:** [i18next](https://www.i18next.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)

## 📦 Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/peteraraya/centinela-frontend.git
cd centinela-frontend
```

### 2. Instalar dependencias

Puedes usar `npm`, `yarn` o `pnpm` (recomendado):

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Variables de Entorno

Si el proyecto requiere variables de entorno (por ejemplo, URLs de APIs, tokens de Mapas), crea un archivo `.env` en la raíz del proyecto basándote en un posible archivo `.env.example`.

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`.

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

- `npm run dev`: Inicia el servidor de desarrollo con Hot-Module-Replacement (HMR).
- `npm run build`: Compila TypeScript y construye la aplicación para producción en la carpeta `dist`.
- `npm run lint`: Ejecuta ESLint para analizar y encontrar problemas en el código fuente.
- `npm run preview`: Levanta un servidor estático local para previsualizar el build de producción generado.

## 📂 Estructura del Proyecto

```text
src/
├── api/          # Funciones y configuración para peticiones HTTP (Axios/Fetch)
├── assets/       # Imágenes, iconos y recursos estáticos
├── components/   # Componentes reutilizables de React (layout, mapa, modales)
├── hooks/        # Custom hooks (e.g., useIncidents, useEarthquakes)
├── i18n/         # Configuración y archivos de traducción (es.json, en.json)
├── store/        # Stores de Zustand (filtros, accesibilidad)
├── types/        # Definiciones de tipos e interfaces de TypeScript
├── utils/        # Funciones utilitarias y formateadores
├── App.tsx       # Componente principal
└── main.tsx      # Punto de entrada de la aplicación
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar esta plataforma:

1. Haz un **Fork** del repositorio.
2. Crea una rama para tu nueva característica (`git checkout -b feature/nueva-caracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`).
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`).
5. Abre un **Pull Request**.

## 📄 Licencia

Este proyecto se distribuye bajo la licencia especificada en el archivo `LICENSE`.
