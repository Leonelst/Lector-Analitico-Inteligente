/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Filter, X, Search, RotateCcw } from "lucide-react";
import { Filters, Sale } from "../types";
import { TRANSLATIONS } from "../data";

interface FiltersPanelProps {
  sales: Sale[];
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

export default function FiltersPanel({ sales, filters, onFiltersChange }: FiltersPanelProps) {
  // Automatically extract unique products and payment methods from the current loaded sales dataset
  const uniqueProducts = useMemo(() => {
    const productsSet = new Set<string>();
    sales.forEach((s) => {
      if (s.product) productsSet.add(s.product);
    });
    return Array.from(productsSet).sort();
  }, [sales]);

  const uniquePaymentMethods = useMemo(() => {
    const methodsSet = new Set<string>();
    sales.forEach((s) => {
      if (s.paymentMethod) methodsSet.add(s.paymentMethod);
    });
    return Array.from(methodsSet).sort();
  }, [sales]);

  // Handle individual filter updates
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Reset all filters to default empty states
  const handleReset = () => {
    onFiltersChange({
      product: "",
      paymentMethod: "",
      startDate: "",
      endDate: "",
      minPrice: "",
      maxPrice: "",
      searchQuery: "",
    });
  };

  const getSpanishTranslation = (text: string) => {
    return TRANSLATIONS[text] || text;
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== "");
  }, [filters]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4" id="filters-container">
      {/* Header and Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2 text-slate-700">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="font-bold text-sm text-slate-800">Filtros Avanzados</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded border border-red-200 transition-colors cursor-pointer"
            id="btn-reset-filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        )}
      </div>

      {/* Filter Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="flex flex-col space-y-1.5" id="filter-search-group">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Buscar por Orden / Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ej: TT-1001, Chinos, Jeans..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              id="input-search"
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleFilterChange("searchQuery", "")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Product Dropdown */}
        <div className="flex flex-col space-y-1.5" id="filter-product-group">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtrar por Producto</label>
          <div className="relative">
            <select
              value={filters.product}
              onChange={(e) => handleFilterChange("product", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 appearance-none pr-8 cursor-pointer"
              id="select-product"
            >
              <option value="">— Todos los Productos ({uniqueProducts.length}) —</option>
              {uniqueProducts.map((p) => (
                <option key={p} value={p}>
                  {getSpanishTranslation(p)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
            {filters.product && (
              <button
                onClick={() => handleFilterChange("product", "")}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Payment Method Dropdown */}
        <div className="flex flex-col space-y-1.5" id="filter-payment-group">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Método de Pago</label>
          <div className="relative">
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 appearance-none pr-8 cursor-pointer"
              id="select-payment"
            >
              <option value="">— Todos los Métodos ({uniquePaymentMethods.length}) —</option>
              {uniquePaymentMethods.map((m) => (
                <option key={m} value={m}>
                  {getSpanishTranslation(m)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
            {filters.paymentMethod && (
              <button
                onClick={() => handleFilterChange("paymentMethod", "")}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Price Ranges / Dates combined */}
        <div className="grid grid-cols-2 gap-2" id="filter-price-group">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precio Mín ($)</label>
            <input
              type="number"
              placeholder="Mín"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              id="input-min-price"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precio Máx ($)</label>
            <input
              type="number"
              placeholder="Máx"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              id="input-max-price"
            />
          </div>
        </div>
      </div>

      {/* Second Line: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <div className="flex flex-col space-y-1.5" id="filter-start-date-group">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Inicio</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
            id="input-start-date"
          />
        </div>
        <div className="flex flex-col space-y-1.5" id="filter-end-date-group">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Fin</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
            id="input-end-date"
          />
        </div>

        {/* Stats and Info about Current Filters in Pills */}
        <div className="col-span-1 md:col-span-2 flex items-end justify-start">
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 py-1 items-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Filtros:</span>
              {filters.searchQuery && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  <span>"{filters.searchQuery}"</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} />
                </span>
              )}
              {filters.product && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  <span>{getSpanishTranslation(filters.product)}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("product", "")} />
                </span>
              )}
              {filters.paymentMethod && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  <span>{getSpanishTranslation(filters.paymentMethod)}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("paymentMethod", "")} />
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <span>
                    Precio: {filters.minPrice || "0"}-{filters.maxPrice || "∞"} $
                  </span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      onFiltersChange({ ...filters, minPrice: "", maxPrice: "" });
                    }}
                  />
                </span>
              )}
              {(filters.startDate || filters.endDate) && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span>
                    F: {filters.startDate || "Inicio"} a {filters.endDate || "Fin"}
                  </span>
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      onFiltersChange({ ...filters, startDate: "", endDate: "" });
                    }}
                  />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
