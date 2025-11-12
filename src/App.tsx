
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import ConfigForm from "./components/ConfigForm";
import ProjectSummary from "./components/ProjectSummary";
import ProgressForm from "./components/ProgressForm";
import TowerVisualization from "./components/TowerVisualization";
import ProgressAnalysis from "./components/ProgressAnalysis";
import LoadingSpinner from "./components/LoadingSpinner";
import { useConfig } from "./hooks/useGoogleSheetsData";
import { ProjectConfig } from "./types";

type View = "home" | "configEdit" | "projectSummary" | "addProgress" | "visualize" | "progressAnalysis";

export default function App() {
  const [view, setView] = useState<View>("home");
  const { config, loading, error, reloadConfig } = useConfig();

  useEffect(() => {
    // Si la carga inicial termina y no hay configuración, redirigir a la pantalla de resumen/configuración.
    if (!loading && (!config || !config.Proyecto)) {
      setView("projectSummary");
    }
  }, [config, loading]);

  const handleConfigSaved = () => {
    reloadConfig().then(() => {
      setView("home");
    });
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) return <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded">Error: {error.message}. Asegúrese que la URL del Apps Script es correcta y el script está desplegado.</div>

  const showBackButton = view !== "home";

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-orange-50 min-h-screen">
      <Header onBack={() => setView("home")} showBack={showBackButton} config={config} />
      <main className="mt-6">
        {view === "home" && (
          <Home
            onConfig={() => setView("projectSummary")}
            onAddProgress={() => setView("addProgress")}
            onVisualize={() => setView("visualize")}
            onAnalyze={() => setView("progressAnalysis")}
          />
        )}

        {view === "projectSummary" && (
          <ProjectSummary
            config={config}
            onEdit={() => setView("configEdit")}
            onBack={() => setView("home")}
            onReset={handleConfigSaved}
          />
        )}

        {view === "configEdit" && (
          <ConfigForm
            initialConfig={config}
            onSaved={handleConfigSaved}
            onCancel={() => config && config.Proyecto ? setView("projectSummary") : setView("home")}
          />
        )}

        {view === "addProgress" && (
          <ProgressForm
            config={config as ProjectConfig}
            onSaved={() => setView("visualize")}
            onBack={() => setView("home")}
          />
        )}

        {view === "visualize" && (
          <TowerVisualization
            config={config as ProjectConfig}
            onAddProgress={() => setView("addProgress")}
          />
        )}

        {view === "progressAnalysis" && (
            <ProgressAnalysis config={config as ProjectConfig} />
        )}
      </main>
    </div>
  );
}