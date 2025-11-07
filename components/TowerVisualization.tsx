import React, { useState, useMemo, useRef } from "react";
import { useProgress } from "../hooks/useGoogleSheetsData";
import ActivityFilter from "./ActivityFilter";
import LoadingSpinner from "./LoadingSpinner";
import { ProjectConfig, ProgressRecord } from "../types";

interface TooltipData {
    content: string;
    x: number;
    y: number;
}

const Tooltip = ({ data }: { data: TooltipData | null }) => {
    if (!data) return null;
    return (
        <div
            className="absolute z-10 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg pointer-events-none"
            style={{ top: data.y, left: data.x, transform: 'translate(10px, -100%)' }}
            dangerouslySetInnerHTML={{ __html: data.content }}
        />
    );
};

export default function TowerVisualization({ config, onAddProgress }: { config: ProjectConfig, onAddProgress: () => void }) {
  const { progress, loading, error } = useProgress();
  const [selectedTower, setSelectedTower] = useState<string>(config?.Torres?.[0] || "");
  const [selectedActivities, setSelectedActivities] = useState<string[]>(config?.Actividades || []);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const progressMap = useMemo(() => {
    const map = new Map<string, ProgressRecord>();
    if (progress) {
      // Ordena el progreso por timestamp para asegurar que el último registro sea el que prevalezca.
      const sortedProgress = [...progress].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
      sortedProgress.forEach(p => {
        const key = `${p.Torre}-${p.Piso}-${p.Actividad}`;
        map.set(key, p);
      });
    }
    return map;
  }, [progress]);

  const getCellRecord = (tower: string, piso: number, actividad: string): ProgressRecord | undefined => {
    return progressMap.get(`${tower}-${piso}-${actividad}`);
  };

  const colorFor = (value: number | undefined): string => {
    if (value === undefined) return "bg-gray-200"; // Sin datos
    if (value === 0) return "bg-red-500 text-white";
    if (value >= 1 && value <= 49) return "bg-orange-400 text-white";
    if (value === 50) return "bg-yellow-400 text-gray-800";
    if (value > 50 && value < 100) return "bg-lime-400 text-gray-800";
    if (value === 100) return "bg-green-600 text-white";
    return "bg-gray-200";
  };

  const handleMouseEnter = (e: React.MouseEvent, record: ProgressRecord | undefined, piso: number, actividad: string) => {
    if (record) {
      const formattedDate = new Date(record.Fecha).toLocaleDateString('es-ES');
      setTooltip({
        content: `<strong>Torre:</strong> ${record.Torre}<br/><strong>Piso:</strong> ${piso}<br/><strong>Actividad:</strong> ${actividad}<br/><strong>Avance:</strong> ${record.Avance}%<br/><strong>Fecha:</strong> ${formattedDate}<br/><strong>Usuario:</strong> ${record.Usuario}`,
        x: e.pageX,
        y: e.pageY,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const exportToPDF = async () => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    if (typeof (window as any).html2canvas !== 'function' || !(window as any).jspdf) {
        alert("Error: Las librerías para exportar a PDF no se pudieron cargar. Por favor, refresque la página e intente de nuevo.");
        console.error("html2canvas o jspdf no se encontraron en el objeto window.");
        return;
    }

    setIsExporting(true);

    try {
        const { jsPDF } = (window as any).jspdf;
        const canvas = await (window as any).html2canvas(gridElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const margin = 15;
        const pdf = new jsPDF('p', 'mm', 'letter');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        let currentY = margin;

        // --- Encabezado del PDF ---
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Informe de Avance de Obra', pdfWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pdfWidth - margin, currentY);
        currentY += 10;

        // --- Detalles del Proyecto ---
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Proyecto:', margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(config.Proyecto, margin + 40, currentY);
        currentY += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Torre Seleccionada:', margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedTower, margin + 40, currentY);
        currentY += 8;
        
        const reportDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        pdf.setFont('helvetica', 'bold');
        pdf.text('Fecha del Informe:', margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(reportDate, margin + 40, currentY);
        currentY += 15;

        // --- Imagen de la Tabla (con cálculo de aspecto corregido) ---
        const availableWidth = pdfWidth - margin * 2;
        const availableHeight = pdfHeight - currentY - margin;
        
        const imgProps = pdf.getImageProperties(imgData);
        const canvasAspectRatio = imgProps.width / imgProps.height;
        
        let finalWidth, finalHeight;

        if (availableWidth / availableHeight > canvasAspectRatio) {
            // El espacio disponible es más ancho que la imagen, la altura es el límite
            finalHeight = availableHeight;
            finalWidth = finalHeight * canvasAspectRatio;
        } else {
            // El espacio disponible es más alto que la imagen, el ancho es el límite
            finalWidth = availableWidth;
            finalHeight = finalWidth / canvasAspectRatio;
        }

        // Centrar la imagen horizontalmente
        const xOffset = margin + (availableWidth - finalWidth) / 2;
        
        pdf.addImage(imgData, 'PNG', xOffset, currentY, finalWidth, finalHeight);
        currentY += finalHeight + 10;

        // --- Pie de Página ---
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Informe generado para el proyecto "${config.Proyecto}".`, margin, pdfHeight - 10);
        pdf.text(`Página 1 de 1`, pdfWidth - margin, pdfHeight - 10, { align: 'right' });

        const safeDate = new Date().toISOString().split('T')[0];
        pdf.save(`Informe_Avance_${config.Proyecto}_${selectedTower}_${safeDate}.pdf`);

    } catch (err) {
        console.error("Error al generar el PDF:", err);
        alert("Ocurrió un error al generar el PDF. Por favor, revise la consola para más detalles.");
    } finally {
        setIsExporting(false);
    }
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-600">Error cargando el progreso: {error.message}</div>;

  const pisosParaTorre = config?.PisosPorTorre?.[selectedTower] || 1;
  const pisosArray = Array.from({ length: pisosParaTorre }, (_, i) => pisosParaTorre - i); // Descendente para visualización

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <Tooltip data={tooltip} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Visualización de Avance</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onAddProgress} className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">Añadir Avance</button>
          <button 
            onClick={exportToPDF} 
            disabled={isExporting} 
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
            title="Exportar la vista actual a un archivo PDF"
          >
            {isExporting ? "Exportando..." : "Exportar a PDF"}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="tower-select" className="font-semibold text-gray-700 mr-2">Seleccionar Torre:</label>
        <select id="tower-select" value={selectedTower} onChange={(e) => setSelectedTower(e.target.value)} className="p-2 border border-gray-300 rounded-md">
          {config?.Torres.map((t: string) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <ActivityFilter activities={config?.Actividades || []} selected={selectedActivities} onChange={setSelectedActivities} />

      <div className="overflow-x-auto mt-6">
        <div ref={gridRef} className="p-4 bg-orange-50 inline-block min-w-full">
            <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${selectedActivities.length}, minmax(140px, 1fr))`, gap: '4px' }}>
                {/* Cabecera vacía para la columna de pisos */}
                <div className="font-bold text-sm text-center sticky top-0 bg-orange-200 p-2 rounded-tl-md">Piso</div>
                {/* Cabeceras de Actividades */}
                {selectedActivities.map(a => (
                    <div key={a} className="font-bold text-sm text-center sticky top-0 bg-orange-200 p-2 truncate" title={a}>{a}</div>
                ))}
                
                {/* Filas de Pisos */}
                {pisosArray.map(piso => (
                    <React.Fragment key={piso}>
                        <div className="font-bold text-sm text-center bg-orange-200 p-2 flex items-center justify-center">
                            {piso}
                        </div>
                        {selectedActivities.map(actividad => {
                            const record = getCellRecord(selectedTower, piso, actividad);
                            const colorClass = colorFor(record?.Avance);
                            return (
                                <div
                                    key={`${piso}-${actividad}`}
                                    className={`h-12 rounded flex items-center justify-center text-sm font-medium transition-colors ${colorClass}`}
                                    onMouseEnter={(e) => handleMouseEnter(e, record, piso, actividad)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {record !== undefined ? `${record.Avance}%` : "-"}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}