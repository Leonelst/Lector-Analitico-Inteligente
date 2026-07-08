/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Edit2, Trash2, Check, X, ArrowUpDown, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { Sale } from "../types";
import { TRANSLATIONS } from "../data";

interface SalesTableProps {
  sales: Sale[];
  onUpdateRecord: (updatedRecord: Sale) => void;
  onDeleteRecord: (id: string) => void;
  existingProducts: string[];
  existingPaymentMethods: string[];
}

type SortKey = "orderNumber" | "product" | "price" | "date" | "paymentMethod";
type SortOrder = "asc" | "desc";

export default function SalesTable({
  sales,
  onUpdateRecord,
  onDeleteRecord,
  existingProducts,
  existingPaymentMethods,
}: SalesTableProps) {
  // Sorting State
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Editing Row State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Sale | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getSpanishTranslation = (text: string) => {
    return TRANSLATIONS[text] || text;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page
  };

  // Sort Sales
  const sortedSales = useMemo(() => {
    const sorted = [...sales];
    sorted.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sales, sortKey, sortOrder]);

  // Paginate sorted sales
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedSales.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedSales, currentPage]);

  const totalPages = Math.ceil(sales.length / itemsPerPage);

  // Edit action triggers
  const startEditing = (record: Sale) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (editForm) {
      onUpdateRecord(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="sales-table-card">
      {/* Table Title and Summary */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 bg-white">
        <div>
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <span>Listado de Transacciones de Venta</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono font-semibold">
              {sales.length} filas
            </span>
          </h3>
          <p className="text-xs text-slate-500">Haz clic en las cabeceras para ordenar o haz doble clic para editar en tiempo real</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto w-full" id="sales-table-wrapper">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {/* Index Column */}
              <th className="py-3 px-4 text-center w-12">#</th>
              
              {/* Order Number Header */}
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none"
                onClick={() => handleSort("orderNumber")}
              >
                <div className="flex items-center space-x-1">
                  <span>Nº Orden</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Product Header */}
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none"
                onClick={() => handleSort("product")}
              >
                <div className="flex items-center space-x-1">
                  <span>Producto</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Price Header */}
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center space-x-1 justify-end">
                  <span>Precio</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Date Header */}
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Payment Method Header */}
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none"
                onClick={() => handleSort("paymentMethod")}
              >
                <div className="flex items-center space-x-1">
                  <span>Método Pago</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Actions Header (no print) */}
              <th className="py-3 px-4 text-center w-24 print-hidden">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600 bg-white">
            {paginatedSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 font-mono text-xs bg-white">
                  Ningún registro coincide con los filtros de búsqueda
                </td>
              </tr>
            ) : (
              paginatedSales.map((record, relativeIdx) => {
                const absoluteIdx = (currentPage - 1) * itemsPerPage + relativeIdx + 1;
                const isEditing = editingId === record.id;

                return (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isEditing ? "bg-indigo-50/30" : ""
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 bg-slate-50/30">
                      {absoluteIdx}
                    </td>

                    {/* Order Number */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm?.orderNumber || ""}
                          onChange={(e) => setEditForm({ ...editForm!, orderNumber: e.target.value })}
                          className="px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500 text-slate-800"
                        />
                      ) : (
                        record.orderNumber
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {isEditing ? (
                        <select
                          value={editForm?.product || ""}
                          onChange={(e) => setEditForm({ ...editForm!, product: e.target.value })}
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500 text-slate-800 cursor-pointer w-full max-w-xs"
                        >
                          <option value="">Selecciona...</option>
                          {existingProducts.map((p) => (
                            <option key={p} value={p}>
                              {getSpanishTranslation(p)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getSpanishTranslation(record.product)
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm?.price || 0}
                          onChange={(e) => setEditForm({ ...editForm!, price: parseFloat(e.target.value) || 0 })}
                          className="px-2 py-1 text-xs text-right font-mono bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500 text-slate-800 w-24"
                        />
                      ) : (
                        formatCurrency(record.price)
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm?.date || ""}
                          onChange={(e) => setEditForm({ ...editForm!, date: e.target.value })}
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500 text-slate-800 cursor-pointer"
                        />
                      ) : (
                        record.date
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={editForm?.paymentMethod || ""}
                          onChange={(e) => setEditForm({ ...editForm!, paymentMethod: e.target.value })}
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500 text-slate-800 cursor-pointer w-full max-w-xs"
                        >
                          <option value="">Selecciona...</option>
                          {existingPaymentMethods.map((m) => (
                            <option key={m} value={m}>
                              {getSpanishTranslation(m)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {getSpanishTranslation(record.paymentMethod)}
                        </span>
                      )}
                    </td>

                    {/* Actions Cell (hidden in print) */}
                    <td className="py-3 px-4 text-center print-hidden">
                      {isEditing ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={saveEditing}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Guardar Cambios"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 rounded bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Cancelar Edición"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(record)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Editar Fila"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Eliminar Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (hidden in print) */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print-hidden bg-slate-50">
          <div>
            Mostrando <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
            <span className="font-bold text-slate-700">
              {Math.min(currentPage * itemsPerPage, sales.length)}
            </span>{" "}
            de <span className="font-bold text-slate-700">{sales.length}</span> registros
          </div>
          <div className="flex items-center space-x-1.5" id="pagination-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded border border-slate-300 transition-colors ${
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed bg-slate-100"
                  : "hover:bg-slate-50 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                currentPage === totalPages
                  ? "opacity-40 cursor-not-allowed bg-slate-100"
                  : "hover:bg-slate-50 cursor-pointer"
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
