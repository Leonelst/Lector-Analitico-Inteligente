/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Calculator, Rows, Columns, Hash, TrendingUp, Info } from "lucide-react";
import { GenericRow } from "../types";

interface GenericKPIStatsProps {
  rows: GenericRow[];
  headers: string[];
  originalHeaders: string[];
}

export default function GenericKPIStats({ rows, headers, originalHeaders }: GenericKPIStatsProps) {
  // Analyze which columns are numeric and which are categorical
  const analysis = useMemo(() => {
    if (rows.length === 0) return null;

    const numericCols: { key: string; label: string; sum: number; avg: number; min: number; max: number }[] = [];
    const categoricalCols: { key: string; label: string; uniqueCount: number; topValue: string; topCount: number }[] = [];

    headers.forEach((key, idx) => {
      const label = originalHeaders[idx];
      let isNumeric = true;
      let numericValues: number[] = [];
      const countsMap: Record<string, number> = {};

      rows.forEach((row) => {
        const val = row[key];
        
        // Track frequency for top values
        const stringVal = val !== undefined && val !== null ? String(val).trim() : "";
        if (stringVal) {
          countsMap[stringVal] = (countsMap[stringVal] || 0) + 1;
        }

        if (val !== undefined && val !== null && val !== "") {
          if (typeof val === "number") {
            numericValues.push(val);
          } else {
            // Check if it is numeric string
            const cleaned = String(val).replace(/[^0-9.-]/g, "");
            const num = parseFloat(cleaned);
            if (!isNaN(num) && /^-?\d+(?:\.\d+)?$/.test(String(val).replace(/[$€%,\s]/g, ""))) {
              numericValues.push(num);
            } else {
              isNumeric = false;
            }
          }
        }
      });

      // If at least 70% of non-empty values are numbers, treat column as numeric
      const filledCount = rows.filter(r => r[key] !== undefined && r[key] !== null && r[key] !== "").length;
      const isColNumeric = isNumeric && numericValues.length > 0 && numericValues.length >= filledCount * 0.7;

      if (isColNumeric && numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        numericCols.push({ key, label, sum, avg, min, max });
      } else {
        const uniqueValues = Object.keys(countsMap);
        let topValue = "N/A";
        let topCount = 0;
        Object.entries(countsMap).forEach(([val, count]) => {
          if (count > topCount) {
            topValue = val;
            topCount = count;
          }
        });
        categoricalCols.push({ key, label, uniqueCount: uniqueValues.length, topValue, topCount });
      }
    });

    return {
      numericCols,
      categoricalCols,
    };
  }, [rows, headers, originalHeaders]);

  if (rows.length === 0 || !analysis) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
        Ningún dato cargado para analizar KPIs
      </div>
    );
  }

  const { numericCols, categoricalCols } = analysis;

  return (
    <div className="space-y-4" id="generic-kpi-container">
      {/* Primary Row & Column Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rows */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filas Totales</p>
            <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">{rows.length}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded text-indigo-700">
            <Rows className="w-5 h-5" />
          </div>
        </div>

        {/* Total Columns */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Columnas Totales</p>
            <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">{headers.length}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded text-emerald-700">
            <Columns className="w-5 h-5" />
          </div>
        </div>

        {/* Numeric Columns detected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Variables Numéricas</p>
            <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">{numericCols.length}</p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded text-amber-700">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        {/* Categorical Columns detected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Variables Categóricas</p>
            <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">{categoricalCols.length}</p>
          </div>
          <div className="p-2.5 bg-slate-100 rounded text-slate-700">
            <Hash className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dynamic Key Numeric Summary Metrics */}
      {numericCols.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Variables Numéricas Clave</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {numericCols.slice(0, 3).map((col) => (
              <div key={col.key} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-700 truncate" title={col.label}>{col.label}</span>
                  <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-200">Métrica</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Suma Total</span>
                    <span className="font-bold text-slate-800 text-sm truncate block">
                      {col.sum % 1 === 0 ? col.sum : col.sum.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Promedio</span>
                    <span className="font-bold text-indigo-600 text-sm truncate block">
                      {col.avg.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mínimo</span>
                    <span className="font-semibold text-slate-700 block truncate">
                      {col.min % 1 === 0 ? col.min : col.min.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Máximo</span>
                    <span className="font-semibold text-slate-700 block truncate">
                      {col.max % 1 === 0 ? col.max : col.max.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Key Categorical Summary Metrics */}
      {categoricalCols.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Atributos Principales</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoricalCols.slice(0, 3).map((col) => (
              <div key={col.key} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-700 truncate" title={col.label}>{col.label}</span>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200">Categoría</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Valores Únicos</span>
                    <span className="font-bold text-slate-800 text-sm block">{col.uniqueCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Más Frecuente</span>
                    <span className="font-bold text-indigo-600 text-xs block truncate" title={col.topValue}>{col.topValue}</span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Frecuencia de la moda</span>
                      <span className="font-mono font-bold text-slate-700">{col.topCount} filas ({((col.topCount / rows.length) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded mt-1 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded" 
                        style={{ width: `${(col.topCount / rows.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
