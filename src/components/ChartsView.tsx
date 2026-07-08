/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Sale } from "../types";
import { TRANSLATIONS } from "../data";
import { TrendingUp, BarChart3, PieChart as PieIcon } from "lucide-react";

interface ChartsViewProps {
  sales: Sale[];
}

export default function ChartsView({ sales }: ChartsViewProps) {
  const [pieDimension, setPieDimension] = useState<"payment" | "product">("payment");

  const getSpanishTranslation = (text: string) => {
    return TRANSLATIONS[text] || text;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 1. Line Chart Data: Daily Sales trend
  const lineChartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    sales.forEach((s) => {
      if (s.date) {
        dailyMap[s.date] = (dailyMap[s.date] || 0) + s.price;
      }
    });

    return Object.entries(dailyMap)
      .map(([date, salesAmount]) => ({
        date,
        formattedDate: new Date(date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          timeZone: "UTC"
        }),
        "Ventas ($)": Number(salesAmount.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  // 2. Bar Chart Data: Revenue per Product
  const productChartData = useMemo(() => {
    const productMap: Record<string, { revenue: number; quantity: number }> = {};
    sales.forEach((s) => {
      if (s.product) {
        if (!productMap[s.product]) {
          productMap[s.product] = { revenue: 0, quantity: 0 };
        }
        productMap[s.product].revenue += s.price;
        productMap[s.product].quantity += 1;
      }
    });

    return Object.entries(productMap)
      .map(([name, stats]) => ({
        rawName: name,
        name: getSpanishTranslation(name),
        "Ingresos ($)": Number(stats.revenue.toFixed(2)),
        "Cantidad (Unidades)": stats.quantity,
      }))
      .sort((a, b) => b["Ingresos ($)"] - a["Ingresos ($)"])
      .slice(0, 8); // Top 8 products to keep it beautifully spaced
  }, [sales]);

  // 3. Pie Chart Data: Payment Method or Product distribution
  const pieChartData = useMemo(() => {
    if (pieDimension === "payment") {
      const map: Record<string, number> = {};
      sales.forEach((s) => {
        if (s.paymentMethod) {
          map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.price;
        }
      });

      return Object.entries(map).map(([name, value]) => ({
        name: getSpanishTranslation(name),
        value: Number(value.toFixed(2)),
      }));
    } else {
      // Product distribution
      const map: Record<string, number> = {};
      sales.forEach((s) => {
        if (s.product) {
          map[s.product] = (map[s.product] || 0) + s.price;
        }
      });

      return Object.entries(map)
        .map(([name, value]) => ({
          name: getSpanishTranslation(name),
          value: Number(value.toFixed(2)),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5 and group others if wanted
    }
  }, [sales, pieDimension]);

  // Colors list for visual appeal
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#f97316", "#14b8a6"];

  // Custom tooltips to maintain premium branding
  const CustomTooltipCurrency = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-lg space-y-1 font-sans">
          <p className="font-semibold text-slate-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || "#a5b4fc" }}>
              {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = sales.reduce((acc, curr) => acc + curr.price, 0);
      const val = payload[0].value;
      const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-xs shadow-lg space-y-1 font-sans">
          <p className="font-semibold text-slate-300">{payload[0].name}</p>
          <p className="text-indigo-300">
            Total: <span className="font-bold">{formatCurrency(val)}</span>
          </p>
          <p className="text-emerald-400">
            Porcentaje: <span className="font-bold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-dashboard-grid">
      {/* 1. Line Chart: Trend over time */}
      <div 
        id="chart-line-card"
        className="lg:col-span-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-800">Evolución Temporal de Ventas</h3>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded uppercase tracking-wider font-semibold">
            Gráfico de Líneas
          </span>
        </div>

        {lineChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
            Sin datos suficientes para graficar la tendencia
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltipCurrency />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="Ventas ($)"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Bar Chart: Revenue by Product */}
      <div 
        id="chart-bar-card"
        className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <BarChart3 className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-800">Ingresos por Producto (Top 8)</h3>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded uppercase tracking-wider font-semibold">
            Gráfico de Barras
          </span>
        </div>

        {productChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
            Sin datos de productos para graficar
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltipCurrency />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Ingresos ($)" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {productChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Pie Chart: Payment Method or Product Breakdown */}
      <div 
        id="chart-pie-card"
        className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <PieIcon className="w-4 h-4" />
            <h3 className="font-bold text-sm text-slate-800">Distribución de Ingresos</h3>
          </div>
          <div className="flex space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setPieDimension("payment")}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm transition-all cursor-pointer ${
                pieDimension === "payment"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pago
            </button>
            <button
              onClick={() => setPieDimension("product")}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm transition-all cursor-pointer ${
                pieDimension === "product"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Productos
            </button>
          </div>
        </div>

        {pieChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
            Sin datos para calcular la distribución
          </div>
        ) : (
          <div className="h-72 w-full flex flex-col justify-between">
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Pie Legend */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 px-2 max-h-16 overflow-y-auto">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1.5 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="truncate" title={entry.name}>{entry.name}:</span>
                  <span className="font-semibold text-slate-800 shrink-0">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
