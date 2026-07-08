/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sale {
  id: string;
  orderNumber: string;
  product: string;
  price: number;
  date: string;
  paymentMethod: string;
}

export interface GenericRow {
  id: string;
  [key: string]: any;
}

export interface DatasetState {
  type: "sales" | "generic" | "empty";
  headers: string[]; // Normalized key strings
  originalHeaders: string[]; // Display header strings
  rows: GenericRow[];
}

export interface Filters {
  product: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
  searchQuery: string;
}

export interface KPIResult {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  uniqueProductsCount: number;
  topProduct: string;
  topProductRevenue: number;
}
