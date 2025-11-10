# Seguimiento de Avance de Obra

Esta es una aplicación web diseñada para simplificar el seguimiento del progreso en proyectos de construcción. Permite a los usuarios configurar proyectos con múltiples torres, pisos y actividades, registrar avances diarios y visualizar el estado general de la obra de manera gráfica e intuitiva.

La aplicación utiliza Google Sheets como una base de datos backend, lo que facilita la configuración y el acceso a los datos sin necesidad de una infraestructura compleja.

## Características Principales

- **Configuración de Proyecto:** Defina el nombre del proyecto, las torres, el número de pisos por torre y las actividades a monitorear.
- **Registro de Avance:** Ingrese registros de avance de forma rápida, especificando usuario, torre, piso, actividad y porcentaje de completado.
- **Visualización Gráfica:** Vea una matriz de colores tipo torre que muestra el estado de cada actividad en cada piso, facilitando la identificación de cuellos de botella.
- **Filtros Dinámicos:** Filtre la visualización por torre y por actividades para enfocarse en la información que necesita.
- **Exportación a PDF:** Genere informes profesionales en formato PDF con un resumen del proyecto, la fecha y la visualización gráfica del avance.

## Funcionalidad Crítica: Reiniciar Proyecto

La aplicación incluye una función para reiniciar el proyecto, la cual **borra permanentemente todos los datos de configuración y avance registrados**. Esta acción no se puede deshacer.

Para prevenir la pérdida accidental de datos, esta función está protegida por un proceso de confirmación de dos pasos que incluye una contraseña.

**Contraseña de Reinicio:**
Para confirmar el reinicio del proyecto, se le solicitará una contraseña. La contraseña es:

```
belavi123
```
