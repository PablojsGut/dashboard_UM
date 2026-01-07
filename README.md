# Dashboard de Gestión de Iniciativas - VcM 📊

Esta aplicación web es una herramienta diseñada para la visualización y optimización de datos provenientes de formularios de iniciativas de **Vinculación con el Medio (VcM)**. Permite transformar archivos Excel en información estratégica mediante un dashboard interactivo y una herramienta de unificación de registros.

> [!NOTE]
> Actualmente, el proyecto se encuentra en fase de **prototipo**. Las funcionalidades presentadas sirven como registro de avance y están sujetas a futuras mejoras y finalización.

## 🚀 Características Principales

El proyecto consta de dos módulos fundamentales:

1. **Dashboard de Visualización:**
    * Gráficos dinámicos de **torta** y **barras**.
    * Cálculo automático de **totales, promedios y tasas de avance**.
    * **Sistema de filtros triple** para segmentación precisa de la data.
2. **Herramienta de Unificación (Unificador):**
    * Módulo diseñado para optimizar el trabajo manual.
    * Permite unir registros separados de un mismo formulario dentro de un archivo Excel, consolidando la información de manera eficiente.

## 📺 Video Demostrativo
Puedes ver una explicación del funcionamiento y el estado actual del prototipo en el siguiente video:
👉 [Ver video explicativo del funcionamiento](https://www.youtube.com/watch?v=-mJDIh7N6xs)

## 🌐 Demo en Vivo
Si no deseas descargar el repositorio, puedes probar la aplicación directamente desde el navegador en el siguiente enlace:
🔗 [Acceder al Prototipo Online](https://pablojsgut.cl/dashboard_VcM/)

---

## 🛠️ Tecnologías Utilizadas

Para garantizar la portabilidad y cumplir con el requerimiento de ser un "ejecutable" simple, el proyecto utiliza:

* **Frontend:** HTML5, CSS3 y JavaScript (ES6+).
* **Diseño y Estructura:** [Bootstrap 5](https://getbootstrap.com/) (vía CDN).
* **Lógicas de Negocio:** Librerías de procesamiento de datos (vía CDN).
* **Sin servidor:** La aplicación es puramente *client-side*, funcionando directamente en el navegador.

## 📂 Estructura del Proyecto

```text
dashboard_UM/
├── index.html              # Pantalla principal (Dashboard)
├── unificador.html         # Pantalla de herramienta de consolidación
├── js/                     # Lógica de la aplicación
├── style/                  # Estilos CSS modulares
└── ...
