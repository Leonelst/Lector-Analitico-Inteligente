/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon, Settings, HelpCircle } from "lucide-react";
import { GenericRow } from "../types";

interface GenericChartsViewProps {
  rows: GenericRow[];
  headers: string[];
  originalHeaders: string[];
}

export default function GenericChartsView({ rows, headers, originalHeaders }: GenericChartsViewProps) {
  // 1. Identify which columns are numeric and which are categorical/date
  const columnTypes = useMemo(() => {
    const numericKeys: string[] = [];
    const categoricalKeys: string[] = [];

    headers.forEach((key) => {
      let isNumeric = true;
      let countFilled = 0;
      let countNum = 0;

      rows.forEach((row) => {
        const val = row[key];
        if (val !== undefined && val !== null && val !== "") {
          countFilled++;
          if (typeof val === "number") {
            countNum++;
          } else {
            const cleaned = String(val).replace(/[^0-9.-]/g, "");
            const num = parseFloat(cleaned);
            if (!isNaN(num) && /^-?\d+(?:\.\d+)?$/.test(String(val).replace(/[$€%,\s]/g, ""))) {
              countNum++;
            } else {
              isNumeric = false;
            }
          }
        }
      });

      // If >70% of filled values are numeric, classify as numeric
      if (isNumeric && countNum > 0 && countNum >= countFilled * 0.7) {
        numericKeys.push(key);
      } else {
        categoricalKeys.push(key);
      }
    });

    return { numericKeys, categoricalKeys };
  }, [rows, headers]);

  // 2. Selectable state
  const [xAxisKey, setXAxisKey] = useState<string>(() => {
    return columnTypes.categoricalKeys[0] || headers[0] || "";
  });
  const [yAxisKey, setYAxisKey] = useState<string>(() => {
    return columnTypes.numericKeys[0] || "row_count";
  });
  const [aggregateType, setAggregateType] = useState<"sum" | "avg" | "count">("sum");
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");

  // Fallback initializers if list changes
  React.useEffect(() => {
    if (columnTypes.categoricalKeys.length > 0 && !columnTypes.categoricalKeys.includes(xAxisKey)) {
      setXAxisKey(columnTypes.categoricalKeys[0]);
    }
    if (yAxisKey !== "row_count" && !columnTypes.numericKeys.includes(yAxisKey)) {
      setYAxisKey(columnTypes.numericKeys[0] || "row_count");
    }
  }, [columnTypes, xAxisKey, yAxisKey]);

  // 3. Aggregate data for the selected Dimension (X) and Metric (Y)
  const chartData = useMemo(() => {
    if (rows.length === 0 || !xAxisKey) return [];

    const groups: Record<string, { keyVal: string; sum: number; count: number; values: number[] }> = {};

    rows.forEach((row) => {
      // Get the value of the dimension
      const rawX = row[xAxisKey];
      const xStr = rawX !== undefined && rawX !== null ? String(rawX).trim() : "Vacío";
      const groupKey = xStr || "Vacío";

      if (!groups[groupKey]) {
        groups[groupKey] = {
          keyVal: groupKey,
          sum: 0,
          count: 0,
          values: [],
        };
      }

      const g = groups[groupKey];
      g.count += 1;

      if (yAxisKey !== "row_count") {
        const rawY = row[yAxisKey];
        let yNum = 0;
        if (typeof rawY === "number") {
          yNum = rawY;
        } else if (rawY !== undefined && rawY !== null) {
          const cleaned = String(rawY).replace(/[^0-9.-]/g, "");
          yNum = parseFloat(cleaned) || 0;
        }
        g.sum += yNum;
        g.values.push(yNum);
      }
    });

    // Map aggregated results
    return Object.values(groups).map((g) => {
      let finalVal = 0;
      if (yAxisKey === "row_count" || aggregateType === "count") {
        finalVal = g.count;
      } else if (aggregateType === "sum") {
        finalVal = Number(g.sum.toFixed(2));
      } else if (aggregateType === "avg") {
        const avg = g.values.length > 0 ? g.sum / g.values.length : 0;
        finalVal = Number(avg.toFixed(2));
      }

      return {
        name: g.keyVal.length > 20 ? g.keyVal.substring(0, 20) + "..." : g.keyVal,
        [yAxisKey === "row_count" ? "Cantidad" : yAxisKey]: finalVal,
      };
    }).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [rows, xAxisKey, yAxisKey, aggregateType]);

  const yAxisLabel = useMemo(() => {
    if (yAxisKey === "row_count") {
      return "Frecuencia (Filas)";
    }
    const origLabel = originalHeaders[headers.indexOf(yAxisKey)] || yAxisKey;
    const aggLabel = aggregateType === "sum" ? "Suma" : "Promedio";
    return `${origLabel} (${aggLabel})`;
  }, [yAxisKey, aggregateType, headers, originalHeaders]);

  const xAxisLabel = useMemo(() => {
    return originalHeaders[headers.indexOf(xAxisKey)] || xAxisKey;
  }, [xAxisKey, headers, originalHeaders]);

  if (rows.length === 0) {
    return null;
  }

  const metricValueKey = yAxisKey === "row_count" ? "Cantidad" : yAxisKey;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="generic-charts-card">
      {/* Configuration Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 print-hidden">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-800">Configuración de Gráfico Dinámico</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Eje X (Categoría) */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Dimensión (Eje X)</span>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-hidden"
            >
              {headers.map((h, idx) => (
                <option key={h} value={h}>
                  {originalHeaders[idx]}
                </option>
              ))}
            </select>
          </div>

          {/* Eje Y (Valor) */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Métrica (Eje Y)</span>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="row_count">Recuento de Filas</option>
              {columnTypes.numericKeys.map((h) => {
                const idx = headers.indexOf(h);
                return (
                  <option key={h} value={h}>
                    {originalHeaders[idx]}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Tipo de Agregación */}
          {yAxisKey !== "row_count" && (
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Agregación</span>
              <select
                value={aggregateType}
                onChange={(e) => setAggregateType(e.target.value as any)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="sum">Suma total</option>
                <option value="avg">Promedio</option>
              </select>
            </div>
          )}

          {/* Tipo de Gráfico */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tipo de Gráfico</span>
            <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden p-0.5">
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`p-1 flex-1 rounded-sm flex justify-center cursor-pointer transition-colors ${chartType === "bar" ? "bg-indigo-600 text-white" : "hover:bg-slate-50 text-slate-500"}`}
                title="Gráfico de Barras"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartType("line")}
                className={`p-1 flex-1 rounded-sm flex justify-center cursor-pointer transition-colors ${chartType === "line" ? "bg-indigo-600 text-white" : "hover:bg-slate-50 text-slate-500"}`}
                title="Gráfico de Líneas"
              >
                <LineIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartType("area")}
                className={`p-1 flex-1 rounded-sm flex justify-center cursor-pointer transition-colors ${chartType === "area" ? "bg-indigo-600 text-white" : "hover:bg-slate-50 text-slate-500"}`}
                title="Gráfico de Área"
              >
                <AreaIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
            <span>Visualización Analítica: {xAxisLabel} vs {yAxisLabel}</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Agrupado por categorías únicas para presentar métricas de síntesis detalladas.</p>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 font-mono text-xs">
            <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
            No hay datos agrupados para graficar
          </div>
        ) : (
          <div className="h-80 w-full" id="generic-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }}
                    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                  <Bar dataKey={metricValueKey} fill="#4f46e5" radius={[4, 4, 0, 0]} name={yAxisLabel} />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }}
                    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                  <Line type="monotone" dataKey={metricValueKey} stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 6 }} name={yAxisLabel} />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis 
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }}
                    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey={metricValueKey} stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name={yAxisLabel} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
