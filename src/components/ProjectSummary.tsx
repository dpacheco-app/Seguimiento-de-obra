
import React, { useState } from "react";
import { resetProject } from "../services/googleSheetsService";
import { ProjectConfig } from "../types";

interface ProjectSummaryProps {
  config: ProjectConfig | null;
  onEdit: () => void;
  onBack: () => void;
  onReset: () => void;
}

export default function ProjectSummary({ config, onEdit, onReset }: ProjectSummaryProps) {
  const torres = config?.Torres || [];
  const pisos = config?.PisosPorTorre || {};
  const actividades = config?.Actividades || [];

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const hasConfig = config && config.Proyecto;
  
  const handleProceedToPassword = () => {
    setShowResetConfirm(false);
    setShowPasswordPrompt(true);
    setError(null);
  };

  const handleResetProject = async () => {
    if (passwordInput !== "belavi123") {
      setError("Contraseña incorrecta.");
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
        await resetProject();
        setShowPasswordPrompt(false);
        setPasswordInput('');
        onReset();
    } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error desconocido al reiniciar.");
        setShowPasswordPrompt(false);
        setPasswordInput('');
    } finally {
        setSaving(false);
    }
  };
  
  const closeModals = () => {
    setShowResetConfirm(false);
    setShowPasswordPrompt(false);
    setPasswordInput('');
    setError(null);
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Resumen del Proyecto</h2>
      
      {error && !showPasswordPrompt && <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}

      {!hasConfig ? (
        <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No se ha configurado ningún proyecto todavía.</p>
            <p className="text-gray-500 text-sm mb-6">Haga clic en el botón de abajo para empezar.</p>
        </div>
      ) : (
        <div className="space-y-6">
            <div>
                <strong className="text-gray-700 block mb-1">Nombre del Proyecto:</strong>
                <p className="text-orange-700 font-semibold text-lg">{config.Proyecto}</p>
            </div>
            <div>
                <strong className="text-gray-700 block mb-2">Torres y Pisos:</strong>
                <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
                    {torres.length > 0 ? torres.map((t: string) => (
                        <li key={t}>{t} — <span className="font-medium">{pisos[t] || 1} pisos</span></li>
                    )) : <li>No hay torres definidas.</li>}
                </ul>
            </div>
            <div>
                <strong className="text-gray-700 block mb-2">Actividades:</strong>
                <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
                    {actividades.length > 0 ? actividades.map((a: string) => (
                        <li key={a}>{a}</li>
                    )) : <li>No hay actividades definidas.</li>}
                </ul>
            </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t flex justify-between items-center">
        <button 
          onClick={onEdit} 
          className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm"
        >
          {hasConfig ? 'Editar Proyecto' : 'Configurar Proyecto'}
        </button>
        {hasConfig && (
            <button
              onClick={() => { setError(null); setShowResetConfirm(true); }}
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
              title="Borra todos los datos del proyecto"
            >
                Reiniciar Proyecto
            </button>
        )}
      </div>

       {showResetConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full m-4 transform transition-all duration-300 scale-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">¿Estás Seguro?</h3>
                    <p className="text-gray-600 mb-6">Si le das a Reiniciar se borrarán <strong>todos</strong> los datos y avances registrados de forma permanente.</p>
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={closeModals} 
                            className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleProceedToPassword} 
                            className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                            disabled={saving}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        )}

       {showPasswordPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full m-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Requiere Contraseña</h3>
                    <p className="text-gray-600 mb-4">Esta es una acción destructiva. Ingrese la contraseña para confirmar el reinicio del proyecto.</p>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className={`w-full p-2 border rounded-md shadow-sm mb-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Contraseña de reinicio"
                        onKeyPress={(e) => { if (e.key === 'Enter' && !saving) handleResetProject(); }}
                    />
                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={closeModals}
                            className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleResetProject}
                            className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 flex items-center"
                            disabled={saving}
                        >
                            {saving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {saving ? "Reiniciando..." : "Confirmar Reinicio"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}