
import React from "react";

interface HomeProps {
  onConfig: () => void;
  onAddProgress: () => void;
  onVisualize: () => void;
}

// FIX: Changed icon type from JSX.Element to React.ReactNode to resolve namespace issue.
const Card = ({ title, description, onClick, icon }: { title: string, description: string, onClick: () => void, icon: React.ReactNode }) => (
    <button 
        onClick={onClick} 
        className="p-6 bg-white shadow-lg rounded-lg text-left transition-transform transform hover:-translate-y-1 hover:shadow-orange-200 hover:shadow-xl w-full flex flex-col justify-between"
    >
        <div>
            <div className="text-orange-600 mb-3">{icon}</div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>
    </button>
);


export default function Home({ onConfig, onAddProgress, onVisualize }: HomeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card
        onClick={onConfig}
        title="Configurar Proyecto"
        description="Ver y editar nombre del proyecto, torres, pisos y actividades."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
      />
      <Card
        onClick={onAddProgress}
        title="Añadir Avance"
        description="Ingresar y guardar múltiples registros de avance de forma rápida."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <Card
        onClick={onVisualize}
        title="Visualizar Avance"
        description="Ver la matriz de avance tipo torre con filtros y exportación a PDF."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
      />
    </div>
  );
}