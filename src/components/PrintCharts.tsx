/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Sale, GenericRow } from "../types";
import { TRANSLATIONS } from "../data";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#f97316", "#14b8a6"];

const getSpanishTranslation = (text: string) => {
  return TRANSLATIONS[text] || text;
};

// 1. Line Chart specifically optimized for printing
export function ChartsViewPrintLine({ sales }: { sales: Sale[] }) {
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
          timeZone: "UTC",
        }),
        "Ventas ($)": Number(salesAmount.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  if (lineChartData.length === 0) return <div className="text-xs text-slate-400">Sin datos de tendencia</div>;

  return (
    <LineChart width={650} height={180} data={lineChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={9} tickLine={false} />
      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} tickFormatter={(val) => `$${val}`} />
      <Line type="monotone" dataKey="Ventas ($)" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} />
    </LineChart>
  );
}

// 2. Bar Chart specifically optimized for printing
export function ChartsViewPrintBar({ sales }: { sales: Sale[] }) {
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
        name: getSpanishTranslation(name),
        "Ingresos ($)": Number(stats.revenue.toFixed(2)),
      }))
      .sort((a, b) => b["Ingresos ($)"] - a["Ingresos ($)"])
      .slice(0, 8);
  }, [sales]);

  if (productChartData.length === 0) return <div className="text-xs text-slate-400">Sin datos de productos</div>;

  return (
    <BarChart width={310} height={180} data={productChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis 
        dataKey="name" 
        stroke="#94a3b8" 
        fontSize={8} 
        tickLine={false} 
        tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 12)}...` : val)}
      />
      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} tickFormatter={(val) => `$${val}`} />
      <Bar dataKey="Ingresos ($)" fill="#4f46e5" radius={[3, 3, 0, 0]}>
        {productChartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  );
}

// 3. Pie Chart specifically optimized for printing (no toggles, prints specified dimension)
export function ChartsViewPrintPie({ sales, dimension }: { sales: Sale[]; dimension: "payment" | "product" }) {
  const pieChartData = useMemo(() => {
    if (dimension === "payment") {
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
        .slice(0, 5);
    }
  }, [sales, dimension]);

  if (pieChartData.length === 0) return <div className="text-xs text-slate-400">Sin datos de distribución</div>;

  return (
    <div className="flex items-center justify-between h-full w-full">
      <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
        <PieChart width={120} height={120}>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            innerRadius={25}
            outerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5 pl-3">
        {pieChartData.map((entry, index) => {
          const total = pieChartData.reduce((acc, curr) => acc + curr.value, 0);
          const percent = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={entry.name} className="flex items-center space-x-1.5 text-[9.5px] text-slate-600 min-w-0 w-full">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="truncate font-medium flex-1 min-w-0" title={entry.name}>{entry.name}</span>
              <span className="font-bold text-slate-800 shrink-0">({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Generic Dataset Bar Chart specifically optimized for printing
export function GenericChartsViewPrintBar({
  rows,
  xAxisKey,
  yAxisKey,
  xLabel,
  yLabel,
}: {
  rows: GenericRow[];
  xAxisKey: string;
  yAxisKey: string;
  xLabel: string;
  yLabel: string;
}) {
  const chartData = useMemo(() => {
    if (rows.length === 0 || !xAxisKey) return [];

    const groups: Record<string, { keyVal: string; sum: number; count: number; values: number[] }> = {};

    rows.forEach((row) => {
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
          yNum = parseFloat(String(rawY).replace(/[^0-9.-]/g, "")) || 0;
        }
        g.sum += yNum;
        g.values.push(yNum);
      }
    });

    return Object.values(groups)
      .map((g) => {
        let finalVal = 0;
        if (yAxisKey === "row_count") {
          finalVal = g.count;
        } else {
          finalVal = Number(g.sum.toFixed(1));
        }

        return {
          name: g.keyVal,
          value: finalVal,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // top 10 categories
  }, [rows, xAxisKey, yAxisKey]);

  if (chartData.length === 0) return <div className="text-xs text-slate-400">Sin datos suficientes</div>;

  return (
    <BarChart width={650} height={160} data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis 
        dataKey="name" 
        stroke="#94a3b8" 
        fontSize={8} 
        tickLine={false} 
        tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 15)}...` : val)}
      />
      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
      <Bar dataKey="value" fill="#4f46e5" radius={[3, 3, 0, 0]}>
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  );
}
