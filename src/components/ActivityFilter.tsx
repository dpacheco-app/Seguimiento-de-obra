
import React from "react";

interface ActivityFilterProps {
  activities: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ActivityFilter({ activities, selected, onChange }: ActivityFilterProps) {
  const toggle = (activity: string) => {
    if (selected.includes(activity)) {
      onChange(selected.filter(x => x !== activity));
    } else {
      onChange([...selected, activity]);
    }
  };

  const handleSelectAll = () => {
    onChange(activities.slice());
  };

  const handleClear = () => {
    onChange([]);
  };

  const isAllSelected = selected.length === activities.length;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border mb-4">
      <label className="font-semibold text-gray-700 block mb-3">Filtrar Actividades</label>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="space-x-4">
          <button onClick={handleSelectAll} disabled={isAllSelected} className="text-sm text-orange-600 hover:underline disabled:text-gray-400 disabled:no-underline">Seleccionar Todo</button>
          <button onClick={handleClear} disabled={selected.length === 0} className="text-sm text-red-600 hover:underline disabled:text-gray-400 disabled:no-underline">Limpiar</button>
        </div>
        <div className="h-4 border-l border-gray-300 hidden sm:block"></div>
        {activities.map(a => (
          <label key={a} className="inline-flex items-center space-x-2 cursor-pointer">
            <input 
                type="checkbox" 
                className="rounded text-orange-600 focus:ring-orange-500"
                checked={selected.includes(a)} 
                onChange={() => toggle(a)} 
            />
            <span className="text-sm text-gray-600">{a}</span>
          </label>
        ))}
      </div>
    </div>
  );
}