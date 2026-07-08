/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sale } from "./types";

export const SAMPLE_SALES: Sale[] = [
  { id: "1", orderNumber: "TT-1001", product: "Slim-Fit Denim Jeans", price: 88.00, date: "2025-08-15", paymentMethod: "Credit Card" },
  { id: "2", orderNumber: "TT-1001", product: "Technical Performance Joggers", price: 75.00, date: "2025-08-15", paymentMethod: "Credit Card" },
  { id: "3", orderNumber: "TT-1002", product: "Classic Fit Chinos", price: 78.00, date: "2025-08-15", paymentMethod: "eWallet" },
  { id: "4", orderNumber: "TT-1003", product: "Flannel-Lined Canvas Work Pants", price: 98.00, date: "2025-08-16", paymentMethod: "Cash" },
  { id: "5", orderNumber: "TT-1004", product: "Double-Pleated Khaki Trousers", price: 82.00, date: "2025-08-16", paymentMethod: "Credit Card" },
  { id: "6", orderNumber: "TT-1005", product: "Relaxed Fit Corduroy Trousers", price: 85.00, date: "2025-08-17", paymentMethod: "Debit Card" },
  { id: "7", orderNumber: "TT-1005", product: "Multi-Pocket Cargo Shorts", price: 58.00, date: "2025-08-17", paymentMethod: "eWallet" },
  { id: "8", orderNumber: "TT-1006", product: "Premium Tailored Trousers", price: 175.00, date: "2025-08-18", paymentMethod: "Credit Card" },
  { id: "9", orderNumber: "TT-1007", product: "Classic Denim Overalls", price: 115.00, date: "2025-08-18", paymentMethod: "eWallet" },
  { id: "10", orderNumber: "TT-1008", product: "Drawstring Linen Trousers", price: 92.00, date: "2025-08-19", paymentMethod: "Debit Card" },
  { id: "11", orderNumber: "TT-1009", product: "Slim-Fit Denim Jeans", price: 88.00, date: "2025-08-19", paymentMethod: "Credit Card" },
  { id: "12", orderNumber: "TT-1009", product: "Classic Fit Chinos", price: 78.00, date: "2025-08-19", paymentMethod: "Cash" },
  { id: "13", orderNumber: "TT-1010", product: "Tailored Wool Dress Trousers", price: 145.00, date: "2025-08-20", paymentMethod: "Cash" },
  { id: "14", orderNumber: "TT-1011", product: "Technical Performance Joggers", price: 75.00, date: "2025-08-20", paymentMethod: "eWallet" },
  { id: "15", orderNumber: "TT-1012", product: "Multi-Pocket Cargo Shorts", price: 58.00, date: "2025-08-21", paymentMethod: "Cash" },
  { id: "16", orderNumber: "TT-1013", product: "Striped Seersucker Trousers", price: 95.00, date: "2025-08-21", paymentMethod: "Debit Card" },
  { id: "17", orderNumber: "TT-1014", product: "Slim-Fit Denim Jeans", price: 88.00, date: "2025-08-22", paymentMethod: "Debit Card" },
  { id: "18", orderNumber: "TT-1015", product: "Flannel-Lined Canvas Work Pants", price: 98.00, date: "2025-08-22", paymentMethod: "eWallet" },
  { id: "19", orderNumber: "TT-1015", product: "Classic Fit Chinos", price: 78.00, date: "2025-08-22", paymentMethod: "Debit Card" },
  { id: "20", orderNumber: "TT-1016", product: "Drawstring Linen Trousers", price: 92.00, date: "2025-08-23", paymentMethod: "Credit Card" },
  { id: "21", orderNumber: "TT-1017", product: "Premium Tailored Trousers", price: 175.00, date: "2025-08-24", paymentMethod: "Credit Card" },
  { id: "22", orderNumber: "TT-1018", product: "Double-Pleated Khaki Trousers", price: 82.00, date: "2025-08-24", paymentMethod: "Cash" }
];

// Spanish translations map for friendly UI displays
export const TRANSLATIONS: Record<string, string> = {
  // Products
  "Slim-Fit Denim Jeans": "Vaqueros Ajustados Slim-Fit",
  "Technical Performance Joggers": "Joggers de Rendimiento Técnico",
  "Classic Fit Chinos": "Chinos de Corte Clásico",
  "Flannel-Lined Canvas Work Pants": "Pantalones de Trabajo con Forro de Franela",
  "Double-Pleated Khaki Trousers": "Pantalones de Khaki con Doble Pinza",
  "Relaxed Fit Corduroy Trousers": "Pantalones de Pana de Corte Relajado",
  "Multi-Pocket Cargo Shorts": "Bermudas Cargo Multibolsillos",
  "Premium Tailored Trousers": "Pantalones a medida Premium",
  "Classic Denim Overalls": "Overol de Mezclilla Clásico",
  "Drawstring Linen Trousers": "Pantalones de Lino con Cordón",
  "Tailored Wool Dress Trousers": "Pantalones de Vestir de Lana a Medida",
  "Striped Seersucker Trousers": "Pantalones de Seersucker a Rayas",
  
  // Payment methods
  "Credit Card": "Tarjeta de Crédito",
  "Debit Card": "Tarjeta de Débito",
  "eWallet": "Billetera Electrónica (eWallet)",
  "Cash": "Efectivo"
};

// Help map back user queries
export const REVERSE_TRANSLATIONS: Record<string, string> = Object.entries(TRANSLATIONS).reduce((acc, [key, val]) => {
  acc[val.toLowerCase()] = key;
  return acc;
}, {} as Record<string, string>);
