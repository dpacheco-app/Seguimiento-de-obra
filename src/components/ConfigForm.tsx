
import React, { useState } from "react";
import { saveConfigToSheets } from "../services/googleSheetsService";
import { ProjectConfig, PisosPorTorre } from "../types";

interface ConfigFormProps {
    initialConfig: ProjectConfig | null;
    onSaved: () => void;
    onCancel: () => void;
}

const InputField = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input value={value} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500" />
    </div>
);

export default function ConfigForm({ initialConfig, onSaved, onCancel }: ConfigFormProps) {
    const [projectName, setProjectName] = useState(initialConfig?.Proyecto || "");
    const [towers, setTowers] = useState<string[]>(initialConfig?.Torres || []);
    const [currentTower, setCurrentTower] = useState("");
    const [pisos, setPisos] = useState<PisosPorTorre>(initialConfig?.PisosPorTorre || {});
    const [activities, setActivities] = useState<string[]>(initialConfig?.Actividades || []);
    const [currentActivity, setCurrentActivity] = useState("");
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addTower = () => {
        const newTower = currentTower.trim();
        if (!newTower || towers.includes(newTower)) {
            setError(towers.includes(newTower) ? "Esa torre ya existe." : "El nombre de la torre no puede estar vacío.");
            return;
        }
        setTowers([...towers, newTower]);
        setPisos({ ...pisos, [newTower]: 1 });
        setCurrentTower("");
        setError(null);
    };

    const removeTower = (towerToRemove: string) => {
        setTowers(towers.filter(t => t !== towerToRemove));
        const newPisos = { ...pisos };
        delete newPisos[towerToRemove];
        setPisos(newPisos);
    };

    const addActivity = () => {
        const newActivity = currentActivity.trim();
        if (!newActivity || activities.includes(newActivity)) {
             setError(activities.includes(newActivity) ? "Esa actividad ya existe." : "El nombre de la actividad no puede estar vacío.");
            return;
        }
        setActivities([...activities, newActivity]);
        setCurrentActivity("");
        setError(null);
    };

    const removeActivity = (activityToRemove: string) => {
        setActivities(activities.filter(a => a !== activityToRemove));
    };

    const handleSave = async () => {
        setError(null);
        if (!projectName.trim() || towers.length === 0 || activities.length === 0) {
            setError("Debe ingresar un nombre de proyecto, y al menos una torre y una actividad.");
            return;
        }
        setSaving(true);
        try {
            // BUG FIX: Construir el objeto ProjectConfig con la estructura correcta que espera el servicio.
            const configToSave: ProjectConfig = {
                Proyecto: projectName.trim(),
                Torres: towers,
                PisosPorTorre: pisos, // El estado 'pisos' ya tiene el formato correcto { torre: num_pisos }
                Actividades: activities,
            };
            
            await saveConfigToSheets(configToSave);
            onSaved();

        } catch (e) {
            setError(e instanceof Error ? e.message : "Ocurrió un error desconocido al guardar.");
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Configuración del Proyecto</h2>

            {error && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}
            
            <div className="space-y-6">
                <InputField label="Nombre del Proyecto" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ej: Residencial Central" />
                
                {/* Gestión de Torres */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Torres</label>
                    <div className="flex gap-2">
                        <input value={currentTower} onChange={e => setCurrentTower(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md" placeholder="Nombre de la nueva torre"/>
                        <button onClick={addTower} className="px-4 py-2 bg-orange-200 text-orange-800 rounded-md hover:bg-orange-300 font-semibold">Agregar</button>
                    </div>
                    <ul className="mt-3 space-y-2">
                        {towers.map(t => (
                            <li key={t} className="flex justify-between items-center p-3 border rounded-md bg-orange-50">
                                <span className="font-medium text-gray-800">{t}</span>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm">Pisos:
                                        <input type="number" min={1} value={pisos[t] || 1} onChange={e => setPisos({...pisos, [t]: Math.max(1, Number(e.target.value))})} className="w-20 ml-2 p-1 border rounded-md text-center"/>
                                    </label>
                                    <button onClick={() => removeTower(t)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Gestión de Actividades */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actividades</label>
                    <div className="flex gap-2">
                        <input value={currentActivity} onChange={e => setCurrentActivity(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md" placeholder="Nombre de la nueva actividad"/>
                        <button onClick={addActivity} className="px-4 py-2 bg-orange-200 text-orange-800 rounded-md hover:bg-orange-300 font-semibold">Agregar</button>
                    </div>
                    <ul className="mt-3 space-y-2">
                        {activities.map(a => (
                             <li key={a} className="flex justify-between items-center p-3 border rounded-md bg-orange-50">
                                <span className="text-gray-800">{a}</span>
                                <button onClick={() => removeActivity(a)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t">
                 <div className="flex gap-4">
                    <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-300">
                        {saving ? "Guardando..." : "Guardar Configuración"}
                    </button>
                    <button onClick={onCancel} disabled={saving} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                </div>
            </div>
        </div>
    );
}