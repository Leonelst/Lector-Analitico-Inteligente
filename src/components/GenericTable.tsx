/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Check, X, Trash2, HelpCircle } from "lucide-react";
import { GenericRow } from "../types";

interface GenericTableProps {
  rows: GenericRow[];
  headers: string[];
  originalHeaders: string[];
  onUpdateRow: (updatedRow: GenericRow) => void;
  onDeleteRow: (id: string) => void;
}

export default function GenericTable({
  rows,
  headers,
  originalHeaders,
  onUpdateRow,
  onDeleteRow,
}: GenericTableProps) {
  // Sorting & pagination & inline-edit states
  const [sortCol, setSortCol] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const itemsPerPage = 10;

  // 1. Reset pagination on search query change or column length change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, headers.length]);

  // 2. Sort columns handler
  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colKey);
      setSortAsc(true);
    }
  };

  // 3. Inline editing triggers
  const startEditing = (rowId: string, colKey: string, val: any) => {
    setEditingCell({ rowId, colKey });
    setEditValue(val !== undefined && val !== null ? String(val) : "");
  };

  const saveEditing = (row: GenericRow) => {
    if (!editingCell) return;
    const { colKey } = editingCell;

    // Cast editValue back to number if original was number
    let finalVal: any = editValue;
    const origVal = row[colKey];
    if (typeof origVal === "number") {
      const num = parseFloat(editValue);
      if (!isNaN(num)) {
        finalVal = num;
      }
    }

    onUpdateRow({
      ...row,
      [colKey]: finalVal,
    });
    setEditingCell(null);
  };

  const cancelEditing = () => {
    setEditingCell(null);
  };

  // 4. Filter & sort matching rows
  const processedRows = useMemo(() => {
    let filtered = [...rows];

    // Fuzzy search matching any column cell
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((row) => {
        return headers.some((key) => {
          const cellVal = row[key];
          return cellVal !== undefined && cellVal !== null && String(cellVal).toLowerCase().includes(q);
        });
      });
    }

    // Dynamic Column Sort
    if (sortCol) {
      filtered.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return filtered;
  }, [rows, headers, searchQuery, sortCol, sortAsc]);

  // 5. Pagination chunk
  const totalPages = Math.max(1, Math.ceil(processedRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedRows.slice(startIdx, startIdx + itemsPerPage);
  }, [processedRows, currentPage]);

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-mono text-xs shadow-sm flex flex-col items-center justify-center">
        <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
        No hay registros cargados. Sube un archivo CSV o pega el texto de un PDF para completar.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="generic-table-card">
      {/* Table search bar */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 bg-white">
        <div>
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <span>Visor General de Datos</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono font-semibold">
              {processedRows.length} filas filtradas
            </span>
          </h3>
          <p className="text-xs text-slate-500">Haz clic en las cabeceras para ordenar o doble clic en cualquier celda para editar</p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar en toda la tabla..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Responsive Custom Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-400 uppercase tracking-wider">
              {/* Row index column */}
              <th className="py-3 px-4 text-center w-12 font-mono">#</th>

              {/* Dynamic Headers */}
              {headers.map((key, idx) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none font-bold"
                >
                  <div className="flex items-center space-x-1">
                    <span>{originalHeaders[idx]}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                </th>
              ))}

              <th className="py-3 px-4 text-center w-16 print-hidden">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 2} className="text-center py-12 text-slate-400 font-mono text-xs">
                  Ningún dato coincide con su búsqueda
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => {
                const absoluteIdx = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400 bg-slate-50/20">
                      {absoluteIdx}
                    </td>

                    {/* Dynamic Row Cells */}
                    {headers.map((colKey) => {
                      const val = row[colKey];
                      const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === colKey;

                      return (
                        <td
                          key={colKey}
                          className="py-3 px-4 font-medium max-w-xs truncate cursor-pointer select-none"
                          onDoubleClick={() => startEditing(row.id, colKey, val)}
                          title="Doble clic para editar"
                        >
                          {isEditing ? (
                            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEditing(row);
                                  else if (e.key === "Escape") cancelEditing();
                                }}
                                className="px-1.5 py-0.5 w-full bg-white border border-slate-300 rounded text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEditing(row)}
                                className="p-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span>
                              {val !== undefined && val !== null ? (
                                typeof val === "number" ? (
                                  val % 1 === 0 ? val : val.toFixed(2)
                                ) : (
                                  String(val)
                                )
                              ) : (
                                <span className="text-slate-300 italic">n/a</span>
                              )}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-3 px-4 text-center print-hidden">
                      <button
                        onClick={() => onDeleteRow(row.id)}
                        className="p-1 rounded text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Eliminar Fila"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print-hidden bg-slate-50">
          <div>
            Mostrando <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
            <span className="font-bold text-slate-700">
              {Math.min(currentPage * itemsPerPage, processedRows.length)}
            </span>{" "}
            de <span className="font-bold text-slate-700">{processedRows.length}</span> registros
          </div>
          
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded border border-slate-300 transition-colors ${
                currentPage === 1 ? "opacity-40 cursor-not-allowed bg-slate-100" : "hover:bg-slate-50 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 hover:bg-slate-50 text-slate-600"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded border border-slate-300 transition-colors ${
                currentPage === totalPages ? "opacity-40 cursor-not-allowed bg-slate-100" : "hover:bg-slate-50 cursor-pointer"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
