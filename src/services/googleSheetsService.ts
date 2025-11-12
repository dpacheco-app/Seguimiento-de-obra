import { ProjectConfig, ProgressRecord, TempProgressItem, PisosPorTorre } from '../types';

// La URL del Web App de Google Apps Script.
const API_URL = "https://script.google.com/macros/s/AKfycbxl8ZxVfNQtLlSWShJsACnaslgXevytFrXxoerUSAJSdCDgF9q4E9WCmExWaqtkmxoC/exec";

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
    const pisosArray = Array.isArray(data.PisosPorTorre) ? data.PisosPorTorre : [];
    
    torresArray.forEach((torre: string, index: number) => {
        pisosPorTorreObjeto[torre] = pisosArray[index] || 1;
    });

    return {
        Proyecto: data.Proyecto || "",
        Torres: torresArray,
        PisosPorTorre: pisosPorTorreObjeto,
        Actividades: data.Actividades || [],
        ScheduledProgress: data.ScheduledProgress || {},
        ScheduledTimeline: data.ScheduledTimeline || {}
    };
}

/**
 * Guarda la configuración del proyecto.
 */
export async function saveConfigToSheets(config: { proyecto: string; torres: string; pisosPorTorre: string }) {
    const res = await fetch(`${API_URL}?action=saveConfig`, {
        method: "POST",
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(config),
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
    return Array.isArray(data) ? data.map(item => ({ 
        ...item, 
        Fecha: item.Timestamp,
        Piso: Number(item.Piso), 
        Avance: Number(item.Avance) 
    })) : [];
}

/**
 * Guarda una lista de nuevos avances en el backend.
 */
export async function saveProgressToSheets(rows: TempProgressItem[]) {
    const res = await fetch(`${API_URL}?action=saveAvance`, {
        method: "POST",
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(rows),
    });
    return await handleApiResponse(res);
}

/**
 * Envía una solicitud para borrar todos los datos del proyecto en la hoja de cálculo.
 */
export async function resetProject() {
    const res = await fetch(`${API_URL}?action=resetProject`, {
        method: "POST",
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: "{}",
    });
    return await handleApiResponse(res);
}