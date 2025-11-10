
export interface PisosPorTorre {
  [key: string]: number;
}

export interface ProjectConfig {
  Proyecto: string;
  Torres: string[];
  PisosPorTorre: PisosPorTorre;
  Actividades: string[];
  // FIX: La estructura ahora es anidada por torre: { [torre]: { [actividad]: { [piso]: porcentaje } } }
  ScheduledProgress: { [tower: string]: { [activity: string]: { [floor: number]: number } } };
}

export interface ProgressRecord {
  Timestamp: string;
  Usuario: string;
  Torre: string;
  Piso: number;
  Actividad: string;
  Avance: number;
  Fecha: string;
}

export interface TempProgressItem {
  Usuario: string;
  Torre: string;
  Piso: number;
  Actividad: string;
  Avance: number;
}