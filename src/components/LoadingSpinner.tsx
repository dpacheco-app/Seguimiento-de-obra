
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-96 w-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
        <p className="mt-4 text-lg text-gray-700 font-semibold">Cargando...</p>
      </div>
    </div>
  );
}