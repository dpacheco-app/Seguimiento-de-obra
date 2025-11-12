import React, { useState, useEffect, useRef, useMemo } from "react";
import { useProgress } from "../hooks/useGoogleSheetsData";
import { ProjectConfig } from "../types";
import LoadingSpinner from "./LoadingSpinner";

declare const Chart: any; // Using Chart.js from CDN

// A color palette for the chart lines
const CHART_COLORS = [
    '#e67e22', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', 
    '#e74c3c', '#1abc9c', '#34495e', '#d35400', '#2980b9'
];

/**
 * Parsea una cadena de fecha, con soporte especial para el formato DD/MM/YYYY.
 * Si el formato no coincide, utiliza el constructor de `Date` por defecto.
 * @param dateStr La cadena de fecha a parsear.
 * @returns Un objeto Date.
 */
const parseDate = (dateStr: string): Date => {
    if (typeof dateStr === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
        const [day, month, year] = dateStr.split(' ')[0].split('/').map(Number);
        if (day && month && year && year > 1900) {
            // El mes en el constructor de Date de JS es 0-indexado (0=Enero, 11=Diciembre)
            return new Date(year, month - 1, day);
        }
    }
    // Fallback para formatos estándar como ISO 8601 que `new Date()` maneja bien.
    return new Date(dateStr);
};


export default function ProgressAnalysis({ config }: { config: ProjectConfig }) {
    const { progress, loading: progressLoading, error: progressError } = useProgress();
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    const [selectedTower, setSelectedTower] = useState<string>(config?.Torres?.[0] || "");
    const [selectedActivity, setSelectedActivity] = useState<string>(config?.Actividades?.[0] || "");
    const [showDebugData, setShowDebugData] = useState(false);

    const processedData = useMemo(() => {
        if (!config || !progress || !selectedTower || !selectedActivity) return null;

        const datasets: any[] = [];
        let minDate: Date | null = null;
        let maxDate: Date | null = null;
        
        const updateDateRange = (date: Date) => {
            if (isNaN(date.getTime())) return; // Ignorar fechas inválidas
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        };

        const pisosParaTorre = config.PisosPorTorre?.[selectedTower] || 1;
        const activity = selectedActivity;
        const color = CHART_COLORS[0];

        // --- Scheduled Progress Data ---
        const scheduledTimeline = config.ScheduledTimeline?.[selectedTower]?.[activity] || [];
        if (scheduledTimeline.length > 0) {
            // 1. Ordenar por fecha para asegurar que la línea de tiempo sea cronológica.
            const sortedTimeline = [...scheduledTimeline]
                .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
            
            const scheduledPoints = sortedTimeline.map(p => {
                const date = parseDate(p.date);
                updateDateRange(date);
                return { x: date.getTime(), y: p.progress };
            }).filter(p => !isNaN(p.x)); // Filtrar puntos con fechas inválidas

            // 2. Asegurar que la línea de progreso sea monotónicamente creciente.
            for (let i = 1; i < scheduledPoints.length; i++) {
                if (scheduledPoints[i].y < scheduledPoints[i - 1].y) {
                    scheduledPoints[i].y = scheduledPoints[i - 1].y;
                }
            }
            
            datasets.push({
                label: `${activity} (Programado)`,
                data: scheduledPoints,
                borderColor: '#a9a9a9',
                backgroundColor: '#a9a9a980', // For tooltip point color
                tension: 0.1,
                borderDash: [5, 5],
                pointRadius: 4,
                pointHoverRadius: 6,
            });
        }

        // --- Real Progress Data ---
        const relevantProgress = progress
            .filter(p => p.Torre === selectedTower && p.Actividad === activity)
            .sort((a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime());

        if (relevantProgress.length > 0) {
            const latestProgressByFloor = new Map<number, number>();
            const realPoints: {x: number, y: number}[] = [];
            
            // Pre-llenar mapa con 0 para todos los pisos para tener una base.
            for(let i = 1; i <= pisosParaTorre; i++) {
                latestProgressByFloor.set(i, 0);
            }

            relevantProgress.forEach(record => {
                const recordDate = new Date(record.Fecha);
                updateDateRange(recordDate);

                latestProgressByFloor.set(record.Piso, record.Avance);
                
                let totalAvance = 0;
                latestProgressByFloor.forEach(avance => totalAvance += avance);
                
                const averageProgress = pisosParaTorre > 0 ? totalAvance / pisosParaTorre : 0;
                
                realPoints.push({
                    x: recordDate.getTime(),
                    y: Math.round(averageProgress)
                });
            });
            
            // Para evitar que las líneas retrocedan, asegurar que cada punto sea al menos tan alto como el anterior.
            for (let i = 1; i < realPoints.length; i++) {
               if(realPoints[i].y < realPoints[i-1].y) {
                   realPoints[i].y = realPoints[i-1].y;
               }
            }

            datasets.push({
                label: `${activity} (Real)`,
                data: realPoints,
                borderColor: color,
                backgroundColor: `${color}80`,
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6,
            });
        }
        
        const finalMinDate = minDate ? new Date(minDate) : new Date();
        if (minDate) finalMinDate.setDate(minDate.getDate() - 7); // Añadir margen
        
        const finalMaxDate = maxDate ? new Date(maxDate) : new Date();
        if (maxDate) finalMaxDate.setDate(maxDate.getDate() + 7); // Añadir margen

        return { datasets, minDate: finalMinDate, maxDate: finalMaxDate };
    }, [config, progress, selectedTower, selectedActivity]);

    useEffect(() => {
        if (!chartRef.current || !processedData) {
             if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
            return;
        };
        
        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: processedData.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'week',
                            tooltipFormat: 'PPP', // date-fns format
                            displayFormats: {
                                week: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Fecha',
                            font: { size: 14 }
                        },
                        min: processedData.minDate.getTime(),
                        max: processedData.maxDate.getTime(),
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Avance (%)',
                            font: { size: 14 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            footer: (tooltipItems: any[]) => {
                                const scheduledDataset = processedData.datasets.find(ds => ds.label.includes('(Programado)'));
                                const realDataset = processedData.datasets.find(ds => ds.label.includes('(Real)'));
                        
                                if (!tooltipItems.length || !scheduledDataset) {
                                    return '';
                                }
                        
                                const currentTimestamp = tooltipItems[0].parsed.x;
                        
                                const scheduledTooltipItem = tooltipItems.find(item => item.dataset.label.includes('(Programado)'));
                                if (!scheduledTooltipItem) return '';
                                
                                const scheduledProgress = scheduledTooltipItem.raw.y;
                        
                                let lastRealProgress = 0;
                                if (realDataset && realDataset.data.length > 0) {
                                    const relevantRealPoints = realDataset.data.filter(p => p.x <= currentTimestamp);
                                    if (relevantRealPoints.length > 0) {
                                        lastRealProgress = relevantRealPoints[relevantRealPoints.length - 1].y;
                                    }
                                }
                        
                                const difference = lastRealProgress - scheduledProgress;
                        
                                return `Diferencia: ${difference.toFixed(1)}%`;
                            }
                        }
                    },
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [processedData]);

    if (progressLoading) return <LoadingSpinner />;
    if (progressError) return <div className="p-4 text-red-600 bg-red-100">Error cargando datos de avance: {progressError.message}</div>;

    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Análisis de Avance Programado vs. Real</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="tower-select-analysis" className="font-semibold text-gray-700 block mb-1">Seleccionar Torre:</label>
                    <select id="tower-select-analysis" value={selectedTower} onChange={(e) => setSelectedTower(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        {config?.Torres.map((t: string) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="activity-select-analysis" className="font-semibold text-gray-700 block mb-1">Seleccionar Actividad:</label>
                    <select 
                      id="activity-select-analysis" 
                      value={selectedActivity} 
                      onChange={(e) => setSelectedActivity(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {config?.Actividades?.map((a: string) => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => setShowDebugData(!showDebugData)}
                    className="text-sm text-orange-600 hover:underline px-2 py-1 rounded hover:bg-orange-100 transition-colors"
                >
                    {showDebugData ? 'Ocultar' : 'Mostrar'} Datos de Depuración
                </button>
            </div>

            {showDebugData && selectedTower && selectedActivity && (
                <div className="mt-2 p-4 border border-dashed border-orange-400 bg-orange-50 rounded-md">
                    <h3 className="font-semibold text-gray-700 text-sm mb-2">
                        Datos de Avance Programado para Depuración (Actividad: {selectedActivity})
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                        Estos son los datos exactos que la aplicación está leyendo de la hoja 'PROG' para la línea de avance programado. 
                        Por favor, verifique que coincidan con su hoja de cálculo.
                    </p>
                    {(() => {
                        const scheduledData = config.ScheduledTimeline?.[selectedTower]?.[selectedActivity];
                        if (scheduledData && scheduledData.length > 0) {
                            return (
                                <ul className="text-xs text-gray-800 list-disc list-inside max-h-24 overflow-y-auto">
                                    {scheduledData.map((point, index) => (
                                        <li key={index}>
                                            Fecha: <strong>{point.date}</strong>, Progreso: <strong>{point.progress}%</strong>
                                        </li>
                                    ))}
                                </ul>
                            );
                        } else {
                            return (
                                <p className="text-xs text-red-600 font-medium">
                                    No se encontraron datos de avance programado para esta combinación de torre y actividad.
                                </p>
                            );
                        }
                    })()}
                </div>
            )}
            
            <div className="relative h-96 md:h-[500px] mt-6">
                <canvas ref={chartRef}></canvas>
                {(!processedData || processedData.datasets.length === 0) && (
                     <div className="absolute inset-0 flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-md">
                        <p className="text-center">No hay datos para mostrar.<br/>Por favor, seleccione una torre y una actividad.</p>
                    </div>
                )}
            </div>
        </div>
    );
}