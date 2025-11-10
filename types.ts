
export interface PisosPorTorre {
  [key: string]: number;
}

export interface ProjectConfig {
  Proyecto: string;
  Torres: string[];
  PisosPorTorre: PisosPorTorre;
  Actividades: string[];
  ScheduledProgress: { [activity: string]: number };
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