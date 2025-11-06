
import React, { useState, useEffect } from "react";
import { saveProgressToSheets } from "../services/googleSheetsService";
import { ProjectConfig, TempProgressItem } from "../types";

interface ProgressFormProps {
    config: ProjectConfig;
    onSaved: () => void;
    onBack: () => void;
}

export default function ProgressForm({ config, onSaved, onBack }: ProgressFormProps) {
  const [usuario, setUsuario] = useState("");
  const [tower, setTower] = useState(config?.Torres?.[0] || "");
  const [piso, setPiso] = useState(1);
  const [actividad, setActividad] = useState(config?.Actividades?.[0] || "");
  const [avance, setAvance] = useState<string>("0");
  
  const [items, setItems] = useState<TempProgressItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Resetear el piso si la torre cambia y la torre existe en la config
    if (config?.PisosPorTorre?.[tower]) {
        setPiso(1);
    }
  }, [tower, config]);

  const addToList = () => {
    setError(null);
    const avanceNum = parseInt(avance, 10);
    if (!usuario.trim()) { setError("Por favor, ingrese un nombre de usuario."); return; }
    if (!tower || !actividad) { setError("Por favor, seleccione torre y actividad."); return; }
    if (isNaN(avanceNum) || avanceNum < 0 || avanceNum > 100) { setError("El valor de avance debe ser un número entre 0 y 100."); return; }
    
    setItems([...items, { Usuario: usuario.trim(), Torre: tower, Piso: Number(piso), Actividad: actividad, Avance: avanceNum }]);
    setAvance("0");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    if (items.length === 0) { setError("No hay elementos en la lista para guardar."); return; }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // FIX: The `saveProgressToSheets` service now accepts an array. No change needed here.
      await saveProgressToSheets(items);
      setSuccess("¡Avances guardados con éxito!");
      setItems([]);
      // Esperar un momento para que el usuario vea el mensaje de éxito antes de navegar
      setTimeout(() => {
        onSaved();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error desconocido al guardar.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const pisosEnTorre = config?.PisosPorTorre?.[tower] || 1;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Añadir Avance</h2>
      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}
      {success && <div className="p-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">{success}</div>}

      <div className="bg-orange-50 p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input value={usuario} onChange={e => setUsuario(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Su nombre" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Torre</label>
                <select value={tower} onChange={e => setTower(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                    {config?.Torres?.map((t: string) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                <select value={piso} onChange={e => setPiso(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md">
                    {Array.from({ length: pisosEnTorre }, (_, i) => <option key={i + 1} value={i + 1}>Piso {i + 1}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
                <select value={actividad} onChange={e => setActividad(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                    {config?.Actividades?.map((a: string) => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
        </div>
        <div className="flex items-end gap-4">
            <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Avance (%)</label>
                <input type="number" min={0} max={100} value={avance} onChange={e => setAvance(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <button onClick={addToList} className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-semibold">Agregar a Lista</button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-3 text-gray-700">Lista de Avances a Guardar ({items.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {items.length === 0 && <p className="text-gray-500">Aún no hay avances en la lista.</p>}
          {items.map((it, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border rounded-md bg-white shadow-sm">
              <span className="text-sm text-gray-800">{it.Usuario} | {it.Torre} - Piso {it.Piso} - {it.Actividad} &rarr; <strong>{it.Avance}%</strong></span>
              <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-8 pt-4 border-t">
        <button onClick={saveAll} disabled={saving || items.length === 0} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300">
          {saving ? "Guardando..." : "Guardar Avances"}
        </button>
        <button onClick={onBack} disabled={saving} className="px-6 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors">Volver</button>
      </div>
    </div>
  );
}