/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DollarSign, ShoppingBag, BarChart3, Package, Award } from "lucide-react";
import { KPIResult } from "../types";
import { TRANSLATIONS } from "../data";

interface KPIStatsProps {
  stats: KPIResult;
}

export default function KPIStats({ stats }: KPIStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getSpanishTranslation = (text: string) => {
    return TRANSLATIONS[text] || text;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-section">
      {/* Total Sales */}
      <div 
        id="kpi-sales"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventas Totales</p>
          <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
            {formatCurrency(stats.totalSales)}
          </p>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded text-emerald-700">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Total Orders */}
      <div 
        id="kpi-orders"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Órdenes Totales</p>
          <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
            {stats.totalOrders}
          </p>
        </div>
        <div className="p-2.5 bg-indigo-50 rounded text-indigo-700">
          <ShoppingBag className="w-5 h-5" />
        </div>
      </div>

      {/* Average Order Value */}
      <div 
        id="kpi-aov"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valor Promedio</p>
          <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
            {formatCurrency(stats.averageOrderValue)}
          </p>
        </div>
        <div className="p-2.5 bg-indigo-50 rounded text-indigo-700">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Unique Products */}
      <div 
        id="kpi-products"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Productos Únicos</p>
          <p className="text-2xl font-bold font-sans text-slate-800 tracking-tight">
            {stats.uniqueProductsCount}
          </p>
        </div>
        <div className="p-2.5 bg-slate-100 rounded text-slate-700">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* Top Product */}
      <div 
        id="kpi-top-product"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1"
      >
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Más Vendido</p>
          <p className="text-sm font-bold font-sans text-slate-800 truncate" title={getSpanishTranslation(stats.topProduct)}>
            {getSpanishTranslation(stats.topProduct) || "N/A"}
          </p>
          <p className="text-[10px] font-mono text-indigo-600 font-medium">
            {stats.topProductRevenue > 0 ? formatCurrency(stats.topProductRevenue) : "—"}
          </p>
        </div>
        <div className="p-2.5 bg-indigo-50 rounded text-indigo-700 shrink-0 ml-2">
          <Award className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
