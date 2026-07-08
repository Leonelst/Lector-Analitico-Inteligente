# Lector Analítico Inteligente v2.0 

Una app interactiva de Business Intelligence (BI) y analítica empresarial impulsada por Gemini y diseñada en React 18+, TypeScript y Tailwind CSS para la ingesta, análisis, visualización y síntesis dinámica de conjuntos de datos provenientes de archivos Excel (.xlsx, .xls), CSV, o texto copiado de informes PDF. Esta aplicación se inicia en un estado limpio sin datos predefinidos inicialmente. Habilita un espacio de trabajo donde, al ingresar o arrastrar tu archivo de cualquier tipo de datos, el sistema detecta de forma heurística y automática el formato, reestructurando la interfaz para presentar métricas, indicadores clave (KPIs), tablas editables en tiempo real y gráficos interactivos de sus datos.

---

## Enlace del Proyecto

Nota: la versión de producción pública ha sido deshabilitada en este repositorio para proteger la cuota de tokens. Para usar la app, sigue las instrucciones de ejecución local.

---

## ¿Para qué sirve?

El Lector Analítico Inteligente sirve para transformar datos crudos y desestructurados en decisiones de negocio visuales e inmediatas:

1. Ingesta de múltiples formatos sin plantilla previa: sube cualquier archivo de datos. El motor analiza dinámicamente las cabeceras, identifica separadores óptimos, remueve símbolos monetarios o porcentuales y los convierte a números flotantes operables.
2. Detección inteligente de esquema:
   - Panel de Ventas (BI): si el archivo contiene campos financieros (como precios, productos o fechas), la app despliega un robusto tablero financiero con KPIs de ingresos acumulados, tickets promedio, producto estrella y gráficos analíticos de tendencias temporales y distribución.
   - Panel de Analista General: para archivos de stock, listados, servidores, etc., la app calcula automáticamente frecuencias y distribuciones dinámicas.
3. Visualización multivariable simultánea: genera automáticamente todos los gráficos necesarios de forma agrupada sin obligar al usuario a alternar vistas o pestañas.
4. Edición en caliente (inline editing): modifica cualquier celda de la tabla de datos integrada haciendo doble clic directamente sobre ella. Los cambios se propagan y recalculan inmediatamente en todos los gráficos y métricas superiores.
5. Generación de reportes ejecutivos limpios (PDF): el sistema cuenta con estilos @media print dedicados. Al presionar "Imprimir / Guardar PDF", se genera un reporte ejecutivo ordenado que descarta barras de herramientas y menús de control, resumiendo los datos en gráficos clave y una tabla sintetizada del Top 10 de registros de mayor volumen para evitar tablas infinitas cortadas e ilegibles.

---

## Herramientas y Tecnologías Utilizadas

La aplicación está construida sobre un ecosistema moderno y de alto rendimiento:

- React 18+ y TypeScript: arquitectura modular y fuertemente tipada para mayor robustez de componentes.
- Vite: herramienta de compilación ultrarrápida para desarrollo y empaquetamiento optimizado.
- Tailwind CSS: diseño visual responsivo, limpio y profesional con tipografía Inter, Space Grotesk y JetBrains Mono.
- XLSX (SheetJS): biblioteca integrada para analizar, extraer y convertir hojas de cálculo de Microsoft Excel (.xlsx, .xls) directamente desde el cliente.
- Recharts: gráficos interactivos SVG dinámicos (líneas, barras, áreas y pasteles) optimizados para impresión de reportes.
- Motion (Framer Motion): transiciones y animaciones de entrada suaves que mejoran la experiencia de usuario (UX).
- Lucide React: iconografía vectorial estilizada de alta definición.

---

## Pasos para Ejecutar Localmente

Sigue estas instrucciones para clonar, instalar y levantar el entorno local de forma segura:

### Requisitos Previos

Necesitas tener instalado Node.js (versión 18 o superior recomendada) y npm (administrador de paquetes de Node) en tu sistema operativo.

### Guía de Inicio Rápido

1. Descargar el proyecto: descarga y descomprime el archivo ZIP del proyecto, o clona el repositorio directamente.

2. Acceder al directorio: abre tu terminal (consola de comandos) y entra a la carpeta raíz del proyecto:
   ```bash
   cd lector-analitico-inteligente
   ```

3. Instalar dependencias: descarga todas las bibliotecas de software necesarias ejecutando:
   ```bash
   npm install
   ```

4. Configurar la API Key (importante): para que las funciones de inteligencia artificial operen correctamente, debes proveer tu propia llave de Google Gemini:
   - Crea un archivo llamado `.env` en la raíz del proyecto.
   - Consigue una API Key gratuita en Google AI Studio (https://aistudio.google.com/).
   - Abre el archivo `.env` y pega tu llave con la siguiente variable:
   ```env
   VITE_GEMINI_API_KEY=tu_api_key_aqui
   ```

5. Iniciar el servidor de desarrollo: inicia el servidor local de Vite. El entorno de desarrollo está preconfigurado para ejecutarse en el puerto estándar 3000:
   ```bash
   npm run dev
   ```

6. Abrir en el navegador: una vez iniciado, abre tu navegador favorito y entra a la dirección web:
   ```text
   http://localhost:3000
   ```

---

## Exportación de Reportes y Recomendación de Impresión


- Recomendación crítica de visualización: para evitar el truncado de nombres de leyendas, porcentajes y etiquetas a los lados de los gráficos circulares y de barras en el documento final, debes configurar la orientación en "Horizontal" (Landscape) en el diálogo de impresión de tu navegador al guardar el PDF. El sistema está diseñado a lo ancho para aprovechar todo el espectro horizontal de análisis.
