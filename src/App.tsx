/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  DollarSign, 
  ShoppingBag, 
  FileSpreadsheet,
  Upload,
  Database,
  BarChart3,
  FileText,
  HelpCircle,
  FolderOpen,
  AlertTriangle,
  X
} from "lucide-react";

import { Sale, Filters, KPIResult, DatasetState, GenericRow } from "./types";
import { TRANSLATIONS } from "./data";

import KPIStats from "./components/KPIStats";
import FiltersPanel from "./components/FiltersPanel";
import AddRecordForm from "./components/AddRecordForm";
import ImportExport from "./components/ImportExport";
import ChartsView from "./components/ChartsView";
import SalesTable from "./components/SalesTable";

// New generic tabular data components
import GenericKPIStats from "./components/GenericKPIStats";
import GenericChartsView from "./components/GenericChartsView";
import GenericTable from "./components/GenericTable";
import { ParsedResult } from "./lib/dataParser";
import {
  ChartsViewPrintLine,
  ChartsViewPrintBar,
  ChartsViewPrintPie,
  GenericChartsViewPrintBar
} from "./components/PrintCharts";

export default function App() {
  // 1. Core State: Holds either Sales data, Generic data, or Empty state
  const [dataset, setDataset] = useState<DatasetState>(() => {
    const saved = localStorage.getItem("interactive_generic_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.rows) && parsed.type) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to restore interactive_generic_db from storage", e);
      }
    }
    // Start entirely empty on first run! No predefined data is loaded by default.
    return {
      type: "empty",
      headers: [],
      originalHeaders: [],
      rows: [],
    };
  });

  // Active workspace view: "auto" lets us switch tabs if there's a Sales schema
  const [activeTab, setActiveTab] = useState<"sales" | "generic">("sales");

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("interactive_generic_db", JSON.stringify(dataset));
  }, [dataset]);

  // Sync active tab when dataset type changes
  useEffect(() => {
    if (dataset.type === "sales") {
      setActiveTab("sales");
    } else if (dataset.type === "generic") {
      setActiveTab("generic");
    }
  }, [dataset.type]);

  // 2. Filters State (Specifically for the Sales view)
  const [filters, setFilters] = useState<Filters>({
    product: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
    minPrice: "",
    maxPrice: "",
    searchQuery: "",
  });

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // 3. Clear database / Reset back to empty state
  const handleClearDatabase = () => {
    showConfirm(
      "Eliminar Base de Datos",
      "¿Está seguro de que desea eliminar la base de datos actual? Todos los registros cargados se borrarán y la interfaz volverá al estado inicial.",
      () => {
        setDataset({
          type: "empty",
          headers: [],
          originalHeaders: [],
          rows: [],
        });
        // Reset filters
        setFilters({
          product: "",
          paymentMethod: "",
          startDate: "",
          endDate: "",
          minPrice: "",
          maxPrice: "",
          searchQuery: "",
        });
      }
    );
  };

  // 4. Sample template loaders to quickly play around with alternative datasets
  const loadClothingSalesTemplate = () => {
    setDataset({
      type: "sales",
      headers: ["orderNumber", "product", "price", "date", "paymentMethod"],
      originalHeaders: ["Orden de Venta", "Producto", "Precio", "Fecha", "Método de Pago"],
      rows: [
        { id: "s1", orderNumber: "TT-1001", product: "Slim-Fit Denim Jeans", price: 88.00, date: "2025-08-15", paymentMethod: "Credit Card" },
        { id: "s2", orderNumber: "TT-1001", product: "Technical Performance Joggers", price: 75.00, date: "2025-08-15", paymentMethod: "Credit Card" },
        { id: "s3", orderNumber: "TT-1002", product: "Classic Fit Chinos", price: 78.00, date: "2025-08-15", paymentMethod: "eWallet" },
        { id: "s4", orderNumber: "TT-1003", product: "Flannel-Lined Canvas Work Pants", price: 98.00, date: "2025-08-16", paymentMethod: "Cash" },
        { id: "s5", orderNumber: "TT-1004", product: "Double-Pleated Khaki Trousers", price: 82.00, date: "2025-08-16", paymentMethod: "Credit Card" },
        { id: "s6", orderNumber: "TT-1005", product: "Relaxed Fit Corduroy Trousers", price: 85.00, date: "2025-08-17", paymentMethod: "Debit Card" },
        { id: "s7", orderNumber: "TT-1005", product: "Multi-Pocket Cargo Shorts", price: 58.00, date: "2025-08-17", paymentMethod: "eWallet" },
        { id: "s8", orderNumber: "TT-1006", product: "Premium Tailored Trousers", price: 175.00, date: "2025-08-18", paymentMethod: "Credit Card" },
        { id: "s9", orderNumber: "TT-1007", product: "Classic Denim Overalls", price: 115.00, date: "2025-08-18", paymentMethod: "eWallet" },
        { id: "s10", orderNumber: "TT-1008", product: "Drawstring Linen Trousers", price: 92.00, date: "2025-08-19", paymentMethod: "Debit Card" },
        { id: "s11", orderNumber: "TT-1009", product: "Slim-Fit Denim Jeans", price: 88.00, date: "2025-08-19", paymentMethod: "Credit Card" },
        { id: "s12", orderNumber: "TT-1009", product: "Classic Fit Chinos", price: 78.00, date: "2025-08-19", paymentMethod: "Cash" },
        { id: "s13", orderNumber: "TT-1010", product: "Tailored Wool Dress Trousers", price: 145.00, date: "2025-08-20", paymentMethod: "Cash" },
        { id: "s14", orderNumber: "TT-1011", product: "Technical Performance Joggers", price: 75.00, date: "2025-08-20", paymentMethod: "eWallet" },
        { id: "s15", orderNumber: "TT-1012", product: "Multi-Pocket Cargo Shorts", price: 58.00, date: "2025-08-21", paymentMethod: "Cash" },
        { id: "s16", orderNumber: "TT-1013", product: "Striped Seersucker Trousers", price: 95.00, date: "2025-08-21", paymentMethod: "Debit Card" },
        { id: "s17", orderNumber: "TT-1014", product: "Slim-Fit Denim Jeans", price: 88.00, date: "2025-08-22", paymentMethod: "Debit Card" },
        { id: "s18", orderNumber: "TT-1015", product: "Flannel-Lined Canvas Work Pants", price: 98.00, date: "2025-08-22", paymentMethod: "eWallet" },
        { id: "s19", orderNumber: "TT-1015", product: "Classic Fit Chinos", price: 78.00, date: "2025-08-22", paymentMethod: "Debit Card" },
        { id: "s20", orderNumber: "TT-1016", product: "Drawstring Linen Trousers", price: 92.00, date: "2025-08-23", paymentMethod: "Credit Card" }
      ]
    });
  };

  const loadStoreInventoryTemplate = () => {
    setDataset({
      type: "generic",
      headers: ["item", "categoria", "stock", "precioUnitario", "proveedor"],
      originalHeaders: ["Artículo", "Categoría", "Stock en Almacén", "Precio Unitario", "Proveedor"],
      rows: [
        { id: "inv-1", item: "MacBook Pro M3 Max", categoria: "Laptops", stock: 15, precioUnitario: 2499.00, proveedor: "Apple Inc." },
        { id: "inv-2", item: "iPhone 15 Pro Max", categoria: "Smartphones", stock: 45, precioUnitario: 1199.00, proveedor: "Apple Inc." },
        { id: "inv-3", item: "Galaxy S24 Ultra", categoria: "Smartphones", stock: 30, precioUnitario: 1299.00, proveedor: "Samsung Electronics" },
        { id: "inv-4", item: "iPad Air 11 pulgadas", categoria: "Tablets", stock: 25, precioUnitario: 649.00, proveedor: "Apple Inc." },
        { id: "inv-5", item: "Monitor UltraWide 34\"", categoria: "Monitores", stock: 12, precioUnitario: 489.00, proveedor: "LG Display" },
        { id: "inv-6", item: "Teclado Mecánico Custom", categoria: "Accesorios", stock: 80, precioUnitario: 125.00, proveedor: "Keychron" },
        { id: "inv-7", item: "Ratón Inalámbrico Ergonomico", categoria: "Accesorios", stock: 110, precioUnitario: 69.00, proveedor: "Logitech" },
        { id: "inv-8", item: "Auriculares ANC WH-1000XM5", categoria: "Audio", stock: 22, precioUnitario: 349.00, proveedor: "Sony Electronics" },
        { id: "inv-9", item: "Cargador Rápido GaN 100W", categoria: "Cargadores", stock: 150, precioUnitario: 49.00, proveedor: "Anker Technologies" },
        { id: "inv-10", item: "SSD Externo 2TB NVMe", categoria: "Almacenamiento", stock: 40, precioUnitario: 189.00, proveedor: "SanDisk" }
      ]
    });
  };

  const loadServerMetricsTemplate = () => {
    setDataset({
      type: "generic",
      headers: ["servidor", "cpuPorcentaje", "memoriaPorcentaje", "peticionesPorSegundo", "estado"],
      originalHeaders: ["Servidor ID", "Uso CPU %", "Uso Memoria %", "Peticiones / seg", "Estado de Salud"],
      rows: [
        { id: "srv-1", servidor: "Web-Server-01", cpuPorcentaje: 42, memoriaPorcentaje: 68, peticionesPorSegundo: 1250, estado: "Óptimo" },
        { id: "srv-2", servidor: "Web-Server-02", cpuPorcentaje: 88, memoriaPorcentaje: 92, peticionesPorSegundo: 2450, estado: "Sobrecargado" },
        { id: "srv-3", servidor: "API-Gateway-Primary", cpuPorcentaje: 31, memoriaPorcentaje: 45, peticionesPorSegundo: 3800, estado: "Óptimo" },
        { id: "srv-4", servidor: "Authentication-Svc", cpuPorcentaje: 18, memoriaPorcentaje: 35, peticionesPorSegundo: 420, estado: "Óptimo" },
        { id: "srv-5", servidor: "Database-Postgres-Primary", cpuPorcentaje: 65, memoriaPorcentaje: 84, peticionesPorSegundo: 1500, estado: "Estable" },
        { id: "srv-6", servidor: "In-Memory-Cache-Redis", cpuPorcentaje: 12, memoriaPorcentaje: 55, peticionesPorSegundo: 9800, estado: "Óptimo" },
        { id: "srv-7", servidor: "Asynchronous-Worker-01", cpuPorcentaje: 95, memoriaPorcentaje: 78, peticionesPorSegundo: 80, estado: "Peligro" },
        { id: "srv-8", servidor: "Notification-Broker", cpuPorcentaje: 24, memoriaPorcentaje: 40, peticionesPorSegundo: 310, estado: "Óptimo" }
      ]
    });
  };

  // 5. Sales CRUD logic (only active when dataset.type === "sales")
  const salesData = useMemo<Sale[]>(() => {
    if (dataset.type === "sales") {
      return dataset.rows as unknown as Sale[];
    }
    return [];
  }, [dataset]);

  const handleAddSalesRecord = (record: Omit<Sale, "id">) => {
    const newRecord: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...record,
    };
    setDataset((prev) => ({
      ...prev,
      rows: [newRecord as unknown as GenericRow, ...prev.rows],
    }));
  };

  const handleUpdateSalesRecord = (updatedRecord: Sale) => {
    setDataset((prev) => ({
      ...prev,
      rows: prev.rows.map((item) => (item.id === updatedRecord.id ? (updatedRecord as unknown as GenericRow) : item)),
    }));
  };

  const handleDeleteSalesRecord = (id: string) => {
    showConfirm(
      "Eliminar Transacción",
      "¿Está seguro de que desea eliminar esta transacción de venta?",
      () => {
        setDataset((prev) => ({
          ...prev,
          rows: prev.rows.filter((item) => item.id !== id),
        }));
      }
    );
  };

  // 6. Generic data editing/deleting handlers
  const handleUpdateGenericRow = (updatedRow: GenericRow) => {
    setDataset((prev) => ({
      ...prev,
      rows: prev.rows.map((item) => (item.id === updatedRow.id ? updatedRow : item)),
    }));
  };

  const handleDeleteGenericRow = (id: string) => {
    showConfirm(
      "Eliminar Registro",
      "¿Está seguro de que desea eliminar esta fila de datos?",
      () => {
        setDataset((prev) => ({
          ...prev,
          rows: prev.rows.filter((item) => item.id !== id),
        }));
      }
    );
  };

  // 7. Dynamic data ingestion from CSV or PDF text paste
  const handleImportData = (result: ParsedResult, append: boolean) => {
    if (append && dataset.type !== "empty" && dataset.type === result.type) {
      // Append matching format
      setDataset((prev) => ({
        ...prev,
        rows: [...result.rows, ...prev.rows],
      }));
    } else {
      // Replace with new format entirely
      setDataset({
        type: result.type,
        headers: result.headers,
        originalHeaders: result.originalHeaders,
        rows: result.rows,
      });
    }
  };

  // 8. Unique values extractors for Sales suggestion selects
  const existingProducts = useMemo(() => {
    const set = new Set<string>();
    salesData.forEach((s) => {
      if (s.product) set.add(s.product);
    });
    return Array.from(set).sort();
  }, [salesData]);

  const existingPaymentMethods = useMemo(() => {
    const set = new Set<string>();
    salesData.forEach((s) => {
      if (s.paymentMethod) set.add(s.paymentMethod);
    });
    return Array.from(set).sort();
  }, [salesData]);

  // 9. Real-time Sales filtering
  const filteredSales = useMemo<Sale[]>(() => {
    return salesData.filter((item) => {
      // Search query fuzzy search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const translatedProduct = (TRANSLATIONS[item.product] || "").toLowerCase();
        const translatedPayment = (TRANSLATIONS[item.paymentMethod] || "").toLowerCase();
        const orderNumber = item.orderNumber.toLowerCase();
        const originalProduct = item.product.toLowerCase();
        const originalPayment = item.paymentMethod.toLowerCase();

        const matchesQuery =
          orderNumber.includes(q) ||
          originalProduct.includes(q) ||
          translatedProduct.includes(q) ||
          originalPayment.includes(q) ||
          translatedPayment.includes(q);

        if (!matchesQuery) return false;
      }

      // Dropdown Product exact selection
      if (filters.product && item.product !== filters.product) {
        return false;
      }

      // Dropdown Payment exact selection
      if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Date chronologies
      if (filters.startDate && item.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && item.date > filters.endDate) {
        return false;
      }

      // Price scales
      if (filters.minPrice) {
        const min = parseFloat(filters.minPrice);
        if (!isNaN(min) && item.price < min) {
          return false;
        }
      }
      if (filters.maxPrice) {
        const max = parseFloat(filters.maxPrice);
        if (!isNaN(max) && item.price > max) {
          return false;
        }
      }

      return true;
    });
  }, [salesData, filters]);

  // 10. Dynamic Sales KPI stats calculator
  const stats = useMemo<KPIResult>(() => {
    let totalSales = 0;
    const uniqueOrdersSet = new Set<string>();
    const productRevenueMap: Record<string, number> = {};

    filteredSales.forEach((item) => {
      totalSales += item.price;
      uniqueOrdersSet.add(item.orderNumber);
      productRevenueMap[item.product] = (productRevenueMap[item.product] || 0) + item.price;
    });

    const totalOrders = uniqueOrdersSet.size;
    const averageOrderValue = totalOrders > 0 ? Number((totalSales / totalOrders).toFixed(2)) : 0;
    const uniqueProductsCount = Object.keys(productRevenueMap).length;

    let topProduct = "";
    let topProductRevenue = 0;
    Object.entries(productRevenueMap).forEach(([prod, rev]) => {
      if (rev > topProductRevenue) {
        topProduct = prod;
        topProductRevenue = rev;
      }
    });

    return {
      totalSales: Number(totalSales.toFixed(2)),
      totalOrders,
      averageOrderValue,
      uniqueProductsCount,
      topProduct,
      topProductRevenue,
    };
  }, [filteredSales]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-indigo-100 py-6 px-4 sm:px-6 lg:px-8" id="app-root-container">
      {/* Visual Report PDF Header (ONLY visible when printing) */}
      <div className="hidden print:block border-b border-slate-300 pb-5 mb-6" id="pdf-executive-header">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-sans text-slate-900 tracking-tight">ANALÍTICA DE DATOS GENERAL</h1>
            <p className="text-xs font-mono text-slate-500 mt-1">
              REPORTE SINTETIZADO EN TIEMPO REAL • FECHA IMPRESIÓN: {new Date().toLocaleDateString("es-ES")}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-indigo-700 tracking-wide font-mono block">ESTUDIO DE INTELIGENCIA</span>
            <span className="text-xs text-slate-500 font-mono block">ESTRUCTURAS TABULARES DINÁMICAS</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6" id="main-content">
        {/* Header - Hidden in Print */}
        <header className="h-auto sm:h-16 bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 sm:py-0 rounded-xl shadow-sm shrink-0 gap-4 print-hidden" id="app-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">
                Lector Analítico Inteligente <span className="text-indigo-600 font-medium text-xs bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 ml-2 font-mono">v2.0</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">Importa cualquier archivo PDF, XLSX o CSV, analiza de manera dinámica y genera reportes en PDF</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {dataset.type !== "empty" && (
              <button
                onClick={handleClearDatabase}
                className="flex items-center gap-2 px-3 py-1.5 border border-red-200 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer shadow-xs bg-white"
                title="Eliminar base de datos activa"
                id="btn-clear-db"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar Datos</span>
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {dataset.type === "empty" ? (
            /* ==================================== */
            /* === BRAND NEW EMPTY WORKSPACE VIEW === */
            /* ==================================== */
            <motion.div
              key="empty-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Main Greeting Banner */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-4 max-w-4xl mx-auto py-12">
                <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-xs text-indigo-600">
                  <Database className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-xl mx-auto">
                  <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Estudio de Analítica de Datos</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Esta aplicación no contiene datos predefinidos inicialmente. Los cuadros, visualizaciones y reportes se activarán tan pronto como ingrese un archivo <strong>CSV</strong>, <strong>XLSX</strong> o pegue el texto de un <strong>PDF</strong> de cualquier tipo de datos.
                  </p>
                </div>
              </div>

              {/* Dynamic Action Ingestion Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left side: Upload area */}
                <div className="lg:col-span-7">
                  <ImportExport 
                    onImportData={handleImportData}
                    filteredRows={[]}
                    fullRows={[]}
                    headers={[]}
                    originalHeaders={[]}
                  />
                </div>

                {/* Right side: Quick alternative testing templates */}
                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-600">
                      <FolderOpen className="w-4 h-4" />
                      <h3 className="font-bold text-sm text-slate-800">Probar con Conjuntos de Datos</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ¿No tienes un archivo CSV o un PDF a la mano? Prueba el motor analítico inteligente cargando instantáneamente cualquiera de estas plantillas de datos generadas localmente:
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {/* Ventas de Ropa */}
                      <button
                        onClick={loadClothingSalesTemplate}
                        className="w-full p-3.5 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 flex items-center justify-between transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">Ventas de Ropa (Ejemplo)</span>
                            <span className="text-[10px] text-slate-400 font-mono">Ventas • Precios • Fechas • Métodos de Pago</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded font-mono">20 Filas</span>
                      </button>

                      {/* Inventario de Tienda */}
                      <button
                        onClick={loadStoreInventoryTemplate}
                        className="w-full p-3.5 rounded-lg border border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50 flex items-center justify-between transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">Inventario Tecnológico</span>
                            <span className="text-[10px] text-slate-400 font-mono">Artículos • Categorías • Stock • Proveedores</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded font-mono">10 Filas</span>
                      </button>

                      {/* Métricas de Servidores */}
                      <button
                        onClick={loadServerMetricsTemplate}
                        className="w-full p-3.5 rounded-lg border border-slate-200 hover:border-amber-200 hover:bg-slate-50/50 flex items-center justify-between transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">Métricas de Rendimiento Web</span>
                            <span className="text-[10px] text-slate-400 font-mono">Servidor • CPU % • Memoria % • Peticiones/s</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded font-mono">8 Filas</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono leading-relaxed">
                    Cualquier conjunto cargado es analizado heurísticamente para extraer dimensiones métricas automáticamente.
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =================================== */
            /* === ACTIVE INTERACTIVE WORKSPACE === */
            /* =================================== */
            <motion.div
              key="active-workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 print-hidden"
            >
              {/* Tab selector and dataset status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm gap-2 print-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 pl-1 block">Esquema Detectado:</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono font-bold uppercase">
                    {dataset.type === "sales" ? "Transacciones de Venta" : "Formato Tabular Genérico"}
                  </span>
                </div>

                {dataset.type === "sales" && (
                  <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                    <button
                      onClick={() => setActiveTab("sales")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        activeTab === "sales"
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Vista Ventas
                    </button>
                    <button
                      onClick={() => setActiveTab("generic")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        activeTab === "generic"
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Vista General
                    </button>
                  </div>
                )}
              </div>

              {/* Ingestion & Export widgets - Hidden in Print */}
              <div className="print-hidden">
                <ImportExport 
                  onImportData={handleImportData}
                  filteredRows={dataset.type === "sales" ? filteredSales : dataset.rows}
                  fullRows={dataset.rows}
                  headers={dataset.headers}
                  originalHeaders={dataset.originalHeaders}
                />
              </div>

              {/* RENDER DYNAMIC DASHBOARDS ACCORDING TO VIEW */}
              {dataset.type === "sales" && activeTab === "sales" ? (
                /* =================================== */
                /* === SPEZIALISED SALES VIEW === */
                /* =================================== */
                <div className="space-y-6">
                  {/* Dynamic KPI Cards Grid */}
                  <KPIStats stats={stats} />

                  {/* Filters Panel - Hidden in Print */}
                  <div className="print-hidden">
                    <FiltersPanel 
                      sales={salesData} 
                      filters={filters} 
                      onFiltersChange={setFilters} 
                    />
                  </div>

                  {/* Add Record Form - Hidden in Print */}
                  <div className="print-hidden">
                    <AddRecordForm 
                      onAddRecord={handleAddSalesRecord}
                      existingProducts={existingProducts}
                      existingPaymentMethods={existingPaymentMethods}
                    />
                  </div>

                  {/* Recharts Analytics Section */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 print-hidden block">Gráficos de Venta</label>
                    <ChartsView sales={filteredSales} />
                  </div>

                  {/* Interactive Data Table */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 print-hidden block">Listado de Ventas</label>
                    <SalesTable 
                      sales={filteredSales} 
                      onUpdateRecord={handleUpdateSalesRecord} 
                      onDeleteRecord={handleDeleteSalesRecord}
                      existingProducts={existingProducts}
                      existingPaymentMethods={existingPaymentMethods}
                    />
                  </div>
                </div>
              ) : (
                /* ======================================= */
                /* === GENERAL-PURPOSE DYNAMIC ANALYST === */
                /* ======================================= */
                <div className="space-y-6">
                  {/* Dynamic KPI Stats */}
                  <GenericKPIStats 
                    rows={dataset.rows} 
                    headers={dataset.headers} 
                    originalHeaders={dataset.originalHeaders} 
                  />

                  {/* Dynamic Recharts Widget */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 print-hidden block">Análisis Visual Inteligente</label>
                    <GenericChartsView 
                      rows={dataset.rows} 
                      headers={dataset.headers} 
                      originalHeaders={dataset.originalHeaders} 
                    />
                  </div>

                  {/* Dynamic Tabular Grid */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 print-hidden block">Visor de Registros Generales</label>
                    <GenericTable 
                      rows={dataset.rows} 
                      headers={dataset.headers} 
                      originalHeaders={dataset.originalHeaders} 
                      onUpdateRow={handleUpdateGenericRow} 
                      onDeleteRow={handleDeleteGenericRow}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* === BRAND NEW COMPREHENSIVE PRINT-ONLY EXECUTIVE REPORT === */}
        {/* ======================================================== */}
        {dataset.type !== "empty" && (
          <div className="hidden print:block space-y-8 font-sans bg-white p-2" id="executive-print-report">
            {/* Elegant Section Divider */}
            <div className="border-b border-slate-300 pb-3">
              <h2 className="text-xl font-bold uppercase text-slate-800 tracking-tight">Resumen Ejecutivo del Negocio</h2>
              <p className="text-xs text-slate-500 mt-0.5">Síntesis descriptiva generada analíticamente a partir del conjunto de datos cargado.</p>
            </div>

            {/* Dynamic Written Summary Block */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700">Comentarios de Análisis</h3>
              <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-2">
                {dataset.type === "sales" ? (
                  <>
                    <p>
                      El presente informe ejecutivo consolida la actividad comercial del período analizado, registrando un volumen total de <strong>{filteredSales.length} transacciones</strong> de venta con un recuento total de facturación de <strong>{new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(stats.totalSales)}</strong>. El valor medio por orden de compra se sitúa en <strong>{new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(stats.averageOrderValue)}</strong>, reflejando una sólida tasa de monetización por cliente.
                    </p>
                    <p>
                      En el análisis de cartera de productos, se identificó un catálogo activo de <strong>{stats.uniqueProductsCount} artículos distintos</strong>. El producto líder indiscutible en términos de generación de ingresos es <strong>"{TRANSLATIONS[stats.topProduct] || stats.topProduct || "N/A"}"</strong>, el cual acumuló un total de <strong>{new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(stats.topProductRevenue)}</strong>, posicionándose como el motor principal de la rentabilidad del negocio durante este intervalo temporal.
                    </p>
                    <p>
                      La distribución multivariable de ingresos indica una fuerte correlación entre las preferencias de adquisición de los clientes y los canales de pago utilizados, lo que sugiere oportunidades inmediatas de optimización de costos transaccionales mediante incentivos en los métodos más eficientes.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      El análisis del conjunto de datos tabulares consolida un total de <strong>{dataset.rows.length} registros estructurados</strong> organizados bajo <strong>{dataset.headers.length} variables operativas</strong>. La estructura analítica ha categorizado las dimensiones y métricas para maximizar la visibilidad de los recursos y la distribución de frecuencias.
                    </p>
                    {/* Render custom dynamic insight for generic data */}
                    {(() => {
                      // Let's find some numeric column
                      const numericCol = dataset.headers.find(h => dataset.rows.some(r => typeof r[h] === "number"));
                      const categoricalCol = dataset.headers.find(h => dataset.rows.some(r => typeof r[h] === "string" && String(r[h]).trim() !== ""));
                      
                      let sum = 0;
                      let avg = 0;
                      let topCat = "N/A";
                      
                      if (numericCol) {
                        const vals = dataset.rows.map(r => Number(r[numericCol]) || 0);
                        sum = vals.reduce((a, b) => a + b, 0);
                        avg = vals.length > 0 ? sum / vals.length : 0;
                      }
                      
                      if (categoricalCol) {
                        const counts: Record<string, number> = {};
                        dataset.rows.forEach(r => {
                          const val = String(r[categoricalCol]).trim();
                          if (val) counts[val] = (counts[val] || 0) + 1;
                        });
                        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                        if (sorted.length > 0) topCat = sorted[0][0];
                      }
                      
                      return (
                        <p>
                          Al examinar las variables, destacamos {categoricalCol && <>la dimensión principal <strong>"{dataset.originalHeaders[dataset.headers.indexOf(categoricalCol)]}"</strong>, donde el valor de mayor frecuencia y concentración es <strong>"{topCat}"</strong></>}. 
                          {numericCol && <> Por su parte, la métrica financiera u operativa de <strong>"{dataset.originalHeaders[dataset.headers.indexOf(numericCol)]}"</strong> acumula un consolidado global de <strong>{new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(sum)}</strong> con un promedio por registro de <strong>{new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(avg)}</strong>.</>} 
                          Este desglose proporciona un panorama nítido sobre el balance del inventario, la distribución de tareas o la eficiencia del sistema según la naturaleza del archivo provisto.
                        </p>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* KPIs Grid - Always printed */}
            <div className="border-b border-slate-300 pb-3 pt-4">
              <h2 className="text-xl font-bold uppercase text-slate-800 tracking-tight">Indicadores Clave de Rendimiento (KPIs)</h2>
            </div>
            {dataset.type === "sales" ? (
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Ingresos Totales</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">{new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(stats.totalSales)}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Transacciones</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">{stats.totalOrders} Ventas</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Ticket Promedio</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">{new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(stats.averageOrderValue)}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Producto Estrella</span>
                  <p className="text-xs font-bold text-indigo-700 truncate mt-1.5" title={stats.topProduct}>{TRANSLATIONS[stats.topProduct] || stats.topProduct || "N/A"}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Registros</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">{dataset.rows.length} Filas</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Dimensiones de Datos</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">{dataset.headers.length} Columnas</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Esquema General</span>
                  <p className="text-lg font-bold text-indigo-700 mt-1">Multi-Variable</p>
                </div>
              </div>
            )}

            {/* ALL CHARTS OF MULTIPLE VARIABLES AT ONCE (No tabs, no toggles) */}
            <div className="border-b border-slate-300 pb-3 pt-4">
              <h2 className="text-xl font-bold uppercase text-slate-800 tracking-tight">Matriz Completa de Gráficos Analíticos</h2>
              <p className="text-xs text-slate-500 mt-0.5">Se incluyen simultáneamente todos los gráficos de distribución y tendencias para evitar múltiples exportaciones.</p>
            </div>

            {dataset.type === "sales" ? (
              <div className="space-y-6">
                {/* 1. Temporal Line Chart */}
                <div className="p-4 border border-slate-200 rounded-xl bg-white">
                  <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-3">1. Evolución Temporal de Ventas (Tendencia Diaria)</h3>
                  <div className="h-48 w-full">
                    <ChartsViewPrintLine sales={filteredSales} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 2. Revenue by Product (Bar Chart) */}
                  <div className="p-4 border border-slate-200 rounded-xl bg-white">
                    <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-3">2. Ingresos por Producto (Top 8 Artículos)</h3>
                    <div className="h-48 w-full">
                      <ChartsViewPrintBar sales={filteredSales} />
                    </div>
                  </div>

                  {/* 3. Distribution Charts side-by-side */}
                  <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-1">3. Distribución por Canales de Pago</h3>
                      <p className="text-[10px] text-slate-400">Distribución porcentual de los métodos transaccionales.</p>
                    </div>
                    <div className="h-36 w-full mt-2">
                      <ChartsViewPrintPie sales={filteredSales} dimension="payment" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 4. Product Distribution (Pie Chart) */}
                  <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-1">4. Distribución por Productos (Top 5)</h3>
                      <p className="text-[10px] text-slate-400">Participación en la facturación total.</p>
                    </div>
                    <div className="h-36 w-full mt-2">
                      <ChartsViewPrintPie sales={filteredSales} dimension="product" />
                    </div>
                  </div>

                  {/* 5. Additional analytics box */}
                  <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-center">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide mb-2">Nota Técnica de Auditoría</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      Los datos procesados cubren todos los registros activos excluyendo filtros manuales temporales para asegurar la consistencia. Las agregaciones fueron sumadas linealmente y normalizadas mediante el motor Heurístico del Lector Analítico Inteligente.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Generic Multi-Chart presentation */}
                {(() => {
                  const catCols = dataset.headers.filter(h => dataset.rows.some(r => typeof r[h] === "string" && String(r[h]).trim() !== ""));
                  const numCol = dataset.headers.find(h => dataset.rows.some(r => typeof r[h] === "number")) || "row_count";
                  
                  return (
                    <div className="space-y-6">
                      {catCols.slice(0, 3).map((catCol, index) => {
                        const originalXLabel = dataset.originalHeaders[dataset.headers.indexOf(catCol)] || catCol;
                        const originalYLabel = numCol === "row_count" ? "Cantidad" : dataset.originalHeaders[dataset.headers.indexOf(numCol)] || numCol;
                        
                        return (
                          <div key={catCol} className="p-4 border border-slate-200 rounded-xl bg-white">
                            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-2">
                              {index + 1}. Distribución de "{originalYLabel}" por "{originalXLabel}"
                            </h3>
                            <div className="h-44 w-full">
                              <GenericChartsViewPrintBar 
                                rows={dataset.rows} 
                                xAxisKey={catCol} 
                                yAxisKey={numCol} 
                                xLabel={originalXLabel}
                                yLabel={originalYLabel}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Synthesized Data Table (Sintetizar al máximo para evitar listas interminables que se cortan) */}
            <div className="border-b border-slate-300 pb-3 pt-4">
              <h2 className="text-xl font-bold uppercase text-slate-800 tracking-tight font-sans">Estructura Tabular Sintetizada (Top 10)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Muestra compacta ordenada de las principales transacciones de mayor volumen para una lectura limpia y libre de desbordamientos.</p>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 font-sans text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    {dataset.type === "sales" ? (
                      <>
                        <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Orden</th>
                        <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Producto</th>
                        <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Fecha</th>
                        <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Pago</th>
                        <th className="px-4 py-2.5 text-right font-bold text-slate-700 uppercase">Monto</th>
                      </>
                    ) : (
                      dataset.originalHeaders.slice(0, 5).map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">{h}</th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {(() => {
                    let sortedRows = [...(dataset.type === "sales" ? filteredSales : dataset.rows)];
                    if (dataset.type === "sales") {
                      sortedRows.sort((a, b) => b.price - a.price);
                    } else {
                      const numCol = dataset.headers.find(h => dataset.rows.some(r => typeof r[h] === "number"));
                      if (numCol) {
                        sortedRows.sort((a, b) => (Number(b[numCol]) || 0) - (Number(a[numCol]) || 0));
                      }
                    }
                    
                    const topTen = sortedRows.slice(0, 10);
                    
                    return topTen.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-slate-50/50">
                        {dataset.type === "sales" ? (
                          <>
                            <td className="px-4 py-2 font-mono text-slate-500 font-semibold">{row.orderNumber}</td>
                            <td className="px-4 py-2 text-slate-800 font-semibold">{TRANSLATIONS[row.product] || row.product}</td>
                            <td className="px-4 py-2 text-slate-500">{row.date}</td>
                            <td className="px-4 py-2 text-slate-500">{TRANSLATIONS[row.paymentMethod] || row.paymentMethod}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-emerald-600">
                              {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(row.price)}
                            </td>
                          </>
                        ) : (
                          dataset.headers.slice(0, 5).map((key) => {
                            const val = row[key];
                            const isNum = typeof val === "number";
                            return (
                              <td key={key} className={`px-4 py-2 text-slate-600 ${isNum ? "font-mono font-semibold" : ""}`}>
                                {isNum ? new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(val) : String(val)}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <div className="bg-slate-50 p-2.5 text-center text-[11px] text-slate-500 border-t border-slate-100 italic">
                Se muestran únicamente las 10 transacciones principales de mayor volumen. Se han omitido {Math.max(0, (dataset.type === "sales" ? filteredSales.length : dataset.rows.length) - 10)} registros adicionales para optimizar la síntesis ejecutiva del documento y evitar desbordamientos en la impresión.
              </div>
            </div>
          </div>
        )}

        {/* Executive Footnote - ONLY visible when printing */}
        <footer className="hidden print:block border-t border-slate-200 pt-5 mt-10 text-center text-[10px] text-slate-400 font-mono" id="pdf-executive-footer">
          <p>Este informe fue exportado en tiempo real utilizando el Lector Analítico Inteligente.</p>
          <p className="mt-1">© {new Date().getFullYear()} Soluciones de Inteligencia de Datos • Documento confidencial.</p>
        </footer>
      </div>

      {/* Custom Confirmation Modal overlay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn" id="custom-confirm-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-800">{confirmModal.title}</h3>
              </div>
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-xs text-slate-600 leading-relaxed">
              <p>{confirmModal.message}</p>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-md font-semibold transition-colors cursor-pointer text-center text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors shadow-sm cursor-pointer text-center text-xs"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
