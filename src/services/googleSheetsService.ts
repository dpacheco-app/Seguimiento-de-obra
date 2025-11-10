import { ProjectConfig, ProgressRecord, TempProgressItem, PisosPorTorre } from '../types';

// La URL del Web App de Google Apps Script.
const API_URL = "https://script.google.com/macros/s/AKfycbx4KxPLS2hke_gMsH0JOSlXlmyzeYqcLeafZeQdNeQEGux9PWX9dyacYccE0lipHLVY/exec";

/**
 * Maneja la respuesta de la API, parsea el JSON y verifica el status.
 * Lanza un error si la respuesta no es OK o el status del backend es ERROR.
 */
async function handleApiResponse(res: Response) {
    if (!res.ok) {
        throw new Error(`Error de red: ${res.status} ${res.statusText}`);
    }
    try {
        const json = await res.json();
        if (json.status !== 'OK') {
            throw new Error(`Error del backend: ${json.message || JSON.stringify(json)}`);
        }
        return json.data;
    } catch (e) {
        console.error("La respuesta del backend no es un JSON válido.", e);
        throw new Error("La respuesta del backend no pudo ser procesada.");
    }
}

/**
 * Obtiene la configuración del proyecto desde el backend.
 * Transforma la estructura de datos del backend a la que usa el frontend.
 */
export async function fetchConfig(): Promise<ProjectConfig> {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'getConfig');
    url.searchParams.append('cache_bust', new Date().getTime().toString());
    const res = await fetch(url.toString());
    const data = await handleApiResponse(res);

    const torresArray = Array.isArray(data.Torres)
        ? data.Torres
        : String(data.Torres || "").split(',').map(t => t.trim()).filter(Boolean);

    const pisosPorTorreObjeto: PisosPorTorre = {};
    // FIX: El backend ahora envía un array numérico 'PisosPorTorre', lo que simplifica la lógica.
    const pisosArray = Array.isArray(data.PisosPorTorre) ? data.PisosPorTorre : [];
    
    torresArray.forEach((torre: string, index: number) => {
        // Se asigna el número de pisos del array directamente a la torre correspondiente.
        pisosPorTorreObjeto[torre] = pisosArray[index] || 1;
    });

    return {
        Proyecto: data.Proyecto || "",
        Torres: torresArray,
        PisosPorTorre: pisosPorTorreObjeto,
        Actividades: data.Actividades || [],
        ScheduledProgress: data.ScheduledProgress || {}
    };
}

/**
 * Guarda la configuración del proyecto.
 */
export async function saveConfigToSheets(config: { proyecto: string; torres: string; pisosPorTorre: string }) {
    const params = new URLSearchParams();
    params.append('action', 'saveConfig');
    params.append('proyecto', config.proyecto);
    params.append('torres', config.torres);
    params.append('pisosPorTorre', config.pisosPorTorre);

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    return await handleApiResponse(res);
}


/**
 * Obtiene todos los registros de avance.
 */
export async function fetchProgress(): Promise<ProgressRecord[]> {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'fetchProgress');
    url.searchParams.append('cache_bust', new Date().getTime().toString());
    const res = await fetch(url.toString());
    const data = await handleApiResponse(res);
    // Asegura que los tipos de dato sean correctos.
    return Array.isArray(data) ? data.map(item => ({ 
        ...item, 
        Fecha: item.Timestamp, // Añade Fecha para compatibilidad con el tipo
        Piso: Number(item.Piso), 
        Avance: Number(item.Avance) 
    })) : [];
}

/**
 * Guarda una lista de nuevos avances en el backend.
 */
export async function saveProgressToSheets(rows: TempProgressItem[]) {
    for (const row of rows) {
         const params = new URLSearchParams();
         params.append('action', 'saveAvance');
         params.append('usuario', row.Usuario);
         params.append('torre', row.Torre);
         params.append('piso', String(row.Piso));
         params.append('actividad', row.Actividad);
         params.append('avance', String(row.Avance));

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
        // Valida la respuesta de cada guardado individualmente.
        await handleApiResponse(res);
    }
}

/**
 * Envía una solicitud para borrar todos los datos del proyecto en la hoja de cálculo.
 */
export async function resetProject() {
    const params = new URLSearchParams();
    params.append('action', 'resetProject');
    
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    return await handleApiResponse(res);
}