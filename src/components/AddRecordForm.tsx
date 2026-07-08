/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Check, RefreshCw } from "lucide-react";
import { Sale } from "../types";
import { TRANSLATIONS } from "../data";

interface AddRecordFormProps {
  onAddRecord: (record: Omit<Sale, "id">) => void;
  existingProducts: string[];
  existingPaymentMethods: string[];
}

export default function AddRecordForm({
  onAddRecord,
  existingProducts,
  existingPaymentMethods,
}: AddRecordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [product, setProduct] = useState("");
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [customProduct, setCustomProduct] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isCustomPayment, setIsCustomPayment] = useState(false);
  const [customPayment, setCustomPayment] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Generate a random Order Number
  const generateOrderNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setOrderNumber(`TT-${randomNum}`);
  };

  const getSpanishTranslation = (text: string) => {
    return TRANSLATIONS[text] || text;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!orderNumber.trim()) {
      setError("El número de orden es obligatorio.");
      return;
    }

    const finalProduct = isCustomProduct ? customProduct.trim() : product;
    if (!finalProduct) {
      setError("Por favor, selecciona o escribe un producto.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("El precio debe ser un número positivo válido.");
      return;
    }

    if (!date) {
      setError("Por favor, selecciona una fecha.");
      return;
    }

    const finalPayment = isCustomPayment ? customPayment.trim() : paymentMethod;
    if (!finalPayment) {
      setError("Por favor, selecciona o escribe un método de pago.");
      return;
    }

    onAddRecord({
      orderNumber: orderNumber.trim().toUpperCase(),
      product: finalProduct,
      price: parsedPrice,
      date,
      paymentMethod: finalPayment,
    });

    // Reset Form
    setOrderNumber("");
    setProduct("");
    setCustomProduct("");
    setPrice("");
    setDate("");
    setPaymentMethod("");
    setCustomPayment("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4" id="add-record-container">
      {/* Accordion Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Agregar Nueva Venta</h3>
            <p className="text-xs text-slate-500">Ingresa datos manualmente para recalcular los gráficos al instante</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
            isOpen
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          }`}
          id="btn-toggle-add-record"
        >
          {isOpen ? "Cerrar Formulario" : "Ingresar Venta Manual"}
        </button>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100 space-y-4 animate-fadeIn" id="form-add-sale">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700" id="form-error-msg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-sm text-emerald-700 flex items-center space-x-2" id="form-success-msg">
              <Check className="w-4 h-4" />
              <span>¡Registro de venta agregado correctamente! Los gráficos se han actualizado.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Order Number */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Nº Orden</span>
                <button
                  type="button"
                  onClick={generateOrderNumber}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center space-x-0.5"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Auto</span>
                </button>
              </label>
              <input
                type="text"
                placeholder="Ej: TT-1019"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-mono placeholder:text-slate-400"
                required
              />
            </div>

            {/* Product Select/Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Producto</span>
                <button
                  type="button"
                  onClick={() => setIsCustomProduct(!isCustomProduct)}
                  className="text-[10px] text-indigo-600 hover:underline font-semibold"
                >
                  {isCustomProduct ? "Elegir de lista" : "Nuevo Producto"}
                </button>
              </label>

              {isCustomProduct ? (
                <input
                  type="text"
                  placeholder="Ej: Pantalones a medida Premium"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              ) : (
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                  required
                >
                  <option value="">Selecciona producto...</option>
                  {existingProducts.map((p) => (
                    <option key={p} value={p}>
                      {getSpanishTranslation(p)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Precio ($ USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 175.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Date */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Método Pago</span>
                <button
                  type="button"
                  onClick={() => setIsCustomPayment(!isCustomPayment)}
                  className="text-[10px] text-indigo-600 hover:underline font-semibold"
                >
                  {isCustomPayment ? "Elegir de lista" : "Escribir otro"}
                </button>
              </label>

              {isCustomPayment ? (
                <input
                  type="text"
                  placeholder="Ej: Transferencia"
                  value={customPayment}
                  onChange={(e) => setCustomPayment(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              ) : (
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                  required
                >
                  <option value="">Selecciona pago...</option>
                  {existingPaymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {getSpanishTranslation(m)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2"
              id="btn-submit-sale"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Registro</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
