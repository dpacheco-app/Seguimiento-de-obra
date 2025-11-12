
export interface PisosPorTorre {
  [key: string]: number;
}

export interface ProjectConfig {
  Proyecto: string;
  Torres: string[];
  PisosPorTorre: PisosPorTorre;
  Actividades: string[];
  ScheduledProgress: { [tower: string]: { [activity: string]: { [floor: number]: number } } };
  ScheduledTimeline: { [tower: string]: { [activity: string]: { date: string; progress: number }[] } };
}

export interface ProgressRecord {
  Timestamp: string;
  Usuario: string;
  Torre: string;
  Piso: number;
  Actividad: string;
  Avance: number;
  Fecha: string;
  Notas?: string;
}

export interface TempProgressItem {
  Usuario: string;
  Torre: string;
  Piso: number;
  Actividad: string;
  Avance: number;
  Notas?: string;
}