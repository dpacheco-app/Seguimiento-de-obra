
import React from "react";
import { ProjectConfig } from "../types";

interface HeaderProps {
    onBack: () => void;
    showBack: boolean;
    config: ProjectConfig | null;
}

export default function Header({ onBack, showBack, config }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b-2 border-orange-200">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Seguimiento de Obra</h1>
        {config?.Proyecto && <p className="text-md text-orange-600 font-semibold">{config.Proyecto}</p>}
      </div>
      {showBack && (
         <button 
            onClick={onBack} 
            className="mt-2 sm:mt-0 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors duration-200 flex items-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
         </button>
      )}
    </header>
  );
}