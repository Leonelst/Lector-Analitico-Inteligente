/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, FileText, Check, AlertTriangle, FileCheck, ClipboardPaste, Printer, X, ExternalLink, FileSpreadsheet } from "lucide-react";
import { parseCSV, parsePDFText, parseExcel, ParsedResult } from "../lib/dataParser";

interface ImportExportProps {
  onImportData: (result: ParsedResult, append: boolean) => void;
  filteredRows: any[];
  fullRows: any[];
  headers: string[];
  originalHeaders: string[];
}

export default function ImportExport({
  onImportData,
  filteredRows,
  fullRows,
  headers,
  originalHeaders,
}: ImportExportProps) {
  const [pasteText, setPasteText] = useState("");
  const [importMode, setImportMode] = useState<"csv" | "excel" | "pdfText">("csv");
  const [appendMode, setAppendMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Safely detect if running in an iframe
    try {
      setIsEmbedded(window.self !== window.top);
    } catch (e) {
      setIsEmbedded(true);
    }
  }, []);

  const processImport = (text: string) => {
    setError("");
    setSuccess("");

    if (!text.trim()) {
      setError("El campo de texto está vacío.");
      return;
    }

    try {
      let result: ParsedResult;
      if (importMode === "csv") {
        result = parseCSV(text);
      } else {
        result = parsePDFText(text);
      }

      onImportData(result, appendMode);
      setSuccess(`¡Se importaron ${result.rows.length} registros con éxito en formato ${result.type === "sales" ? "Ventas" : "General"}!`);
      setPasteText("");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar el archivo.");
    }
  };

  // Handle local file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        try {
          const result = parseExcel(arrayBuffer);
          onImportData(result, appendMode);
          setSuccess(`¡Archivo Excel "${file.name}" importado: ${result.rows.length} registros cargados como ${result.type === "sales" ? "Ventas" : "General"}!`);
        } catch (err: any) {
          setError(`Error en el archivo "${file.name}": ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        try {
          let result: ParsedResult;
          if (file.name.endsWith(".csv")) {
            result = parseCSV(text);
          } else if (file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
            result = parsePDFText(text);
          } else {
            // Default to CSV
            result = parseCSV(text);
          }

          onImportData(result, appendMode);
          setSuccess(`¡Archivo "${file.name}" importado: ${result.rows.length} registros cargados como ${result.type === "sales" ? "Ventas" : "General"}!`);
        } catch (err: any) {
          setError(`Error en el archivo "${file.name}": ${err.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Export current filtered rows dynamically to CSV matching headers
  const handleExportCSV = () => {
    if (headers.length === 0 || filteredRows.length === 0) {
      setError("No hay datos filtrados o cargados para exportar.");
      return;
    }

    const csvRows = filteredRows.map((row) =>
      headers.map((key) => {
        const val = row[key];
        const str = val !== undefined && val !== null ? String(val) : "";
        return `"${str.replace(/"/g, '""')}"`;
      })
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [originalHeaders.join(","), ...csvRows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reporte_datos_filtrado_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger high-fidelity PDF print layout in real-time
  const handlePrintPDF = () => {
    if (isEmbedded) {
      setShowPrintModal(true);
    } else {
      window.print();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="import-export-section">
      {/* Import Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="import-card">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Upload className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-800">Importar Informes (cualquier formato CSV / Excel / PDF)</h3>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            Puedes cargar archivos <strong>Excel (.xlsx, .xls)</strong>, <strong>.csv</strong> de forma directa o copiar y pegar texto de tu informe en <strong>PDF</strong>. El sistema analizará, detectará las variables, creará los gráficos dinámicos y presentará la síntesis de datos de forma automática.
          </div>

          {/* Selector de modo */}
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-md">
            <button
              type="button"
              onClick={() => setImportMode("excel")}
              className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all cursor-pointer ${
                importMode === "excel"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Archivo Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => setImportMode("csv")}
              className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all cursor-pointer ${
                importMode === "csv"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Archivo CSV o Pegar CSV
            </button>
            <button
              type="button"
              onClick={() => setImportMode("pdfText")}
              className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all cursor-pointer ${
                importMode === "pdfText"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Texto de PDF Copiado
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-700 flex items-start space-x-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Drag & Drop or Paste Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modo de Ingesta:</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1 cursor-pointer text-xs font-medium text-slate-600">
                  <input
                    type="radio"
                    checked={appendMode}
                    onChange={() => setAppendMode(true)}
                    className="accent-indigo-600 w-3.5 h-3.5"
                  />
                  <span>Anexar Datos</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer text-xs font-medium text-slate-600">
                  <input
                    type="radio"
                    checked={!appendMode}
                    onChange={() => setAppendMode(false)}
                    className="accent-indigo-600 w-3.5 h-3.5"
                  />
                  <span>Sobrescribir</span>
                </label>
              </div>
            </div>

            {importMode === "excel" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">Cargar Archivo Excel (.xlsx, .xls)</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                  Haz clic para examinar o arrastra tu archivo Excel aquí. Se procesará la primera pestaña con datos válidos de forma automática.
                </p>
                <button
                  type="button"
                  className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  Seleccionar archivo Excel
                </button>
              </div>
            ) : (
              <textarea
                rows={4}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={
                  importMode === "csv"
                    ? "Campaña,Presupuesto,Impresiones,Clics,Conversiones\nBúsqueda Google,500,12500,620,45\nSocial Media Ads,850,22400,1480,95"
                    : "Pegue aquí el texto copiado de su PDF.\nEjemplo:\nBúsqueda Google   500   12500   620   45\nSocial Media Ads   850   22400   1480   95"
                }
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-mono resize-none placeholder:text-slate-400"
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100">
          {importMode !== "excel" && (
            <button
              type="button"
              onClick={() => processImport(pasteText)}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Procesar Texto Pegado</span>
            </button>
          )}

          <input
            type="file"
            accept={
              importMode === "excel"
                ? ".xlsx,.xls"
                : importMode === "csv"
                  ? ".csv"
                  : ".pdf,.txt"
            }
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${
              importMode === "excel" ? "w-full bg-emerald-600 hover:bg-emerald-700 text-white" : "border border-slate-300 hover:bg-slate-50 text-slate-600"
            } px-4 py-2 rounded-md text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2`}
            title={
              importMode === "excel"
                ? "Subir archivo Excel (.xlsx, .xls)"
                : "Subir archivo local (.csv, .pdf, .txt)"
            }
          >
            {importMode === "excel" ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>{importMode === "excel" ? "Subir Archivo Excel" : "Subir Archivo"}</span>
          </button>
        </div>
      </div>

      {/* Export Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" id="export-card">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Download className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-800">Exportar Informes Ejecutivos</h3>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            Puedes descargar un archivo <strong>CSV</strong> estructurado con los filtros aplicados actualmente o generar un **informe visual de alta definición en PDF** en tiempo real. 
            El reporte en PDF está optimizado para impresión ejecutiva, excluyendo botones e interfaces de control innecesarias.
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900 text-[11px] leading-relaxed flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
            <div>
              <strong className="font-bold">💡 Recomendación importante de Impresión:</strong>
              <p className="mt-0.5">
                Para que todos los gráficos y tablas se visualicen de forma óptima sin recortarse, asegúrese de guardar el PDF o imprimir seleccionando la orientación <strong className="text-indigo-800">"Horizontal" (Landscape)</strong> en la configuración del diálogo de su navegador.
              </p>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registros para Exportación</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Filtrados / Actuales:</span>
                <span className="text-lg font-bold text-indigo-700">{filteredRows.length}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Base Datos:</span>
                <span className="text-lg font-bold text-slate-700">{fullRows.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-100" id="export-actions">
          {/* Print PDF */}
          <button
            type="button"
            onClick={handlePrintPDF}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            id="btn-export-pdf"
          >
            <Printer className="w-4 h-4" />
            <span>Guardar / Imprimir PDF Visual</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            id="btn-export-csv"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV de Datos</span>
          </button>
        </div>
      </div>
    </div>

    {showPrintModal && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn" id="print-warning-modal">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Printer className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-800">Guardar / Imprimir PDF Visual</h3>
            </div>
            <button 
              onClick={() => setShowPrintModal(false)}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="p-4 sm:p-5 space-y-3.5 text-xs text-slate-600 leading-relaxed overflow-y-auto flex-1">
            <div className="p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-start space-x-2.5">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong className="font-bold text-[11px] sm:text-xs">Restricción de Vista Previa (Iframe):</strong>
                <p className="mt-0.5 text-[10.5px] sm:text-xs">
                  El navegador bloquea la apertura de ventanas de impresión desde dentro de un visor embebido por razones de seguridad de marcos externos.
                </p>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 flex items-start space-x-2.5">
              <FileSpreadsheet className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong className="font-bold text-[11px] sm:text-xs">¡Recomendación Crítica para Gráficos!</strong>
                <p className="mt-0.5 text-[10.5px] sm:text-xs">
                  Para que los gráficos, leyendas y métricas se muestren de forma perfecta y completa en el PDF exportado, <strong>debe configurar el formato/orientación de impresión en "Horizontal" (Landscape)</strong>.
                </p>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs">
              Para generar un <strong>reporte ejecutivo en PDF de alta fidelidad</strong> con el formato optimizado para impresión (que oculta automáticamente controles, botones e interfaces), siga estos pasos:
            </p>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5 font-medium text-slate-700">
              <div className="flex items-start space-x-2 text-[11px] sm:text-xs">
                <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[9px] sm:text-[10px]">1</span>
                <span>
                  Abra la aplicación en una pestaña independiente haciendo clic en el botón azul de abajo o en el botón **"Abrir en pestaña nueva"** (esquina superior derecha del visor).
                </span>
              </div>
              <div className="flex items-start space-x-2 text-[11px] sm:text-xs">
                <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[9px] sm:text-[10px]">2</span>
                <span>
                  Una vez abierta allí, haga clic de nuevo en <strong className="text-slate-800">"Guardar / Imprimir PDF Visual"</strong>.
                </span>
              </div>
              <div className="flex items-start space-x-2 text-[11px] sm:text-xs">
                <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-[9px] sm:text-[10px]">3</span>
                <span>
                  En el diálogo de impresión de su sistema, seleccione <strong className="text-slate-800">"Guardar como PDF"</strong> en la opción de destino y complete la descarga.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => {
                setShowPrintModal(false);
                window.print();
              }}
              className="text-[9.5px] sm:text-[10px] text-slate-400 hover:text-slate-600 transition-colors underline font-mono cursor-pointer"
            >
              Intentar imprimir aquí de todos modos
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-md font-semibold transition-colors cursor-pointer text-center text-xs"
              >
                Cerrar
              </button>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer text-center text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Pestaña Nueva</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}
