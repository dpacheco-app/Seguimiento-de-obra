// src/utils/waitForLibraries.ts

/**
 * Espera a que las librerías especificadas estén disponibles en el objeto window.
 * @param libs - Un array de nombres de librerías a esperar (ej: ['jspdf', 'html2canvas']).
 * @returns Una Promesa que se resuelve cuando todas las librerías están cargadas.
 */
export function waitForLibraries(libs: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const checkInterval = 100; // Revisar cada 100ms
    const timeout = 5000; // Rendirse después de 5 segundos
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      const allLoaded = libs.every(lib => typeof (window as any)[lib] !== 'undefined');
      
      if (allLoaded) {
        clearInterval(intervalId);
        resolve();
      } else {
        elapsedTime += checkInterval;
        if (elapsedTime >= timeout) {
          clearInterval(intervalId);
          const missing = libs.filter(lib => typeof (window as any)[lib] === 'undefined').join(', ');
          reject(new Error(`Timeout: No se pudieron cargar las siguientes librerías a tiempo: ${missing}`));
        }
      }
    }, checkInterval);
  });
}
