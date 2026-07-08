/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatasetState, GenericRow, Sale } from "../types";
import * as XLSX from "xlsx";

export interface ParsedResult {
  type: "sales" | "generic";
  headers: string[];
  originalHeaders: string[];
  rows: GenericRow[];
}

/**
 * Clean up a column name to a valid camelCase property key for JS objects
 */
export function normalizeHeader(header: string, index: number): string {
  const clean = header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Spanish accents / diacritics
    .replace(/[^a-zA-Z0-9]/g, " ") // Keep only alphanumeric characters
    .trim()
    .split(/\s+/)
    .map((word, wIdx) =>
      wIdx === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  return clean || `column_${index + 1}`;
}

/**
 * Parsers split CSV lines with support for quoted text commas.
 */
function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parser for any CSV content.
 */
export function parseCSV(text: string): ParsedResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error("El archivo CSV está vacío o no contiene líneas válidas.");
  }

  // Detect separator
  const firstLine = lines[0];
  let separator = ",";
  if (firstLine.includes(";")) separator = ";";
  else if (firstLine.includes("\t")) separator = "\t";

  const rawHeaders = parseCSVLine(firstLine, separator);
  const originalHeaders = rawHeaders.map((h) => h.replace(/^"|"$/g, "").trim()).filter(Boolean);
  
  if (originalHeaders.length === 0) {
    throw new Error("No se pudieron extraer cabeceras válidas del archivo CSV.");
  }

  const headers = originalHeaders.map((h, idx) => normalizeHeader(h, idx));

  const rows: GenericRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = parseCSVLine(line, separator).map((p) => p.replace(/^"|"$/g, "").trim());
    
    // Skip empty lines
    if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) continue;

    const row: GenericRow = {
      id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
    };

    headers.forEach((key, idx) => {
      const rawVal = parts[idx] || "";
      
      // Smart parsing of numeric values
      // If it contains only digits, separators like dots/commas, currency symbols, and optionally a sign
      const cleanNumStr = rawVal.replace(/[^0-9.-]/g, "");
      const isPercentage = rawVal.includes("%");
      const num = parseFloat(cleanNumStr);

      if (
        rawVal !== "" &&
        !isNaN(num) &&
        /^[$-]?[0-9,]+(?:\.[0-9]+)?%?$/.test(rawVal.replace(/\s/g, ""))
      ) {
        row[key] = isPercentage ? num / 100 : num;
      } else {
        row[key] = rawVal;
      }
    });

    rows.push(row);
  }

  // Classify schema
  const isSales = detectIsSalesSchema(originalHeaders, headers);

  return {
    type: isSales ? "sales" : "generic",
    headers,
    originalHeaders,
    rows: isSales ? mapToSalesSchema(headers, originalHeaders, rows) : rows,
  };
}

/**
 * Parser for PDF pasted text / raw text.
 */
export function parsePDFText(text: string): ParsedResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error("El texto del PDF está vacío o no contiene líneas legibles.");
  }

  // Detect separator
  const hasTabs = lines.some((l) => l.includes("\t"));
  const hasCommas = lines.some((l) => l.split(",").length > 2);
  const separator = hasTabs ? "\t" : hasCommas ? "," : " ";

  const parsedLines = lines
    .map((line) => {
      if (separator === " ") {
        // Split by 2 or more spaces
        return line.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
      } else {
        return line.split(separator).map((p) => p.trim().replace(/^"|"$/g, "")).filter(Boolean);
      }
    })
    .filter((parts) => parts.length > 1);

  if (parsedLines.length === 0) {
    // Fallback: split by single space if we can't find clear double-space blocks
    const simpleSpaceParsed = lines
      .map((line) => line.split(/\s+/).map((p) => p.trim()).filter(Boolean))
      .filter((parts) => parts.length > 1);
    
    if (simpleSpaceParsed.length > 0) {
      parsedLines.push(...simpleSpaceParsed);
    } else {
      throw new Error(
        "No se pudo detectar un formato estructurado en columnas en el archivo. Intenta con un archivo CSV."
      );
    }
  }

  let rawHeaders = parsedLines[0];
  let dataLines = parsedLines.slice(1);

  // If the first line contains numerical data, we generate columns dynamically
  const firstLineHasNumbers = rawHeaders.some((val) => {
    const clean = val.replace(/[^0-9.-]/g, "");
    return clean !== "" && !isNaN(parseFloat(clean)) && /^\d+$/.test(clean);
  });

  if (firstLineHasNumbers) {
    rawHeaders = rawHeaders.map((_, idx) => `Columna_${idx + 1}`);
    dataLines = parsedLines; // Put back the first row as data
  }

  const originalHeaders = rawHeaders;
  const headers = rawHeaders.map((h, idx) => normalizeHeader(h, idx));

  const rows: GenericRow[] = [];
  dataLines.forEach((parts, i) => {
    const row: GenericRow = {
      id: `pdf-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
    };

    headers.forEach((key, idx) => {
      const rawVal = parts[idx] || "";
      const cleanNumStr = rawVal.replace(/[^0-9.-]/g, "");
      const num = parseFloat(cleanNumStr);

      if (
        rawVal !== "" &&
        !isNaN(num) &&
        /^[$-]?[0-9,]+(?:\.[0-9]+)?%?$/.test(rawVal.replace(/\s/g, ""))
      ) {
        row[key] = num;
      } else {
        row[key] = rawVal;
      }
    });

    rows.push(row);
  });

  const isSales = detectIsSalesSchema(originalHeaders, headers);

  return {
    type: isSales ? "sales" : "generic",
    headers,
    originalHeaders,
    rows: isSales ? mapToSalesSchema(headers, originalHeaders, rows) : rows,
  };
}

/**
 * Analyze headers to detect if they contain enough fields to represent a Sales Record.
 */
function detectIsSalesSchema(originalHeaders: string[], headers: string[]): boolean {
  const lowercaseHeaders = originalHeaders.map((h) => h.toLowerCase());

  const hasProduct = lowercaseHeaders.some(
    (h) =>
      h.includes("product") ||
      h.includes("producto") ||
      h.includes("articulo") ||
      h.includes("artículo") ||
      h.includes("concepto") ||
      h.includes("descripcion") ||
      h.includes("descripción")
  );

  const hasPrice = lowercaseHeaders.some(
    (h) =>
      h.includes("price") ||
      h.includes("precio") ||
      h.includes("monto") ||
      h.includes("valor") ||
      h.includes("total") ||
      h.includes("costo") ||
      h.includes("venta")
  );

  // If there's both a product and a price column, we can present it as Sales
  return hasProduct && hasPrice;
}

/**
 * Standardizes a generic row set to match the core Sale schema
 */
function mapToSalesSchema(
  headers: string[],
  originalHeaders: string[],
  rows: GenericRow[]
): Sale[] {
  const lowercaseHeaders = originalHeaders.map((h) => h.toLowerCase());

  // Locate the index of key fields
  const orderIdx = lowercaseHeaders.findIndex(
    (h) => h.includes("order") || h.includes("orden") || h.includes("nº") || h.includes("id")
  );
  const productIdx = lowercaseHeaders.findIndex(
    (h) =>
      h.includes("product") ||
      h.includes("producto") ||
      h.includes("articulo") ||
      h.includes("artículo") ||
      h.includes("descripcion") ||
      h.includes("descripción") ||
      h.includes("concepto")
  );
  const priceIdx = lowercaseHeaders.findIndex(
    (h) =>
      h.includes("price") ||
      h.includes("precio") ||
      h.includes("monto") ||
      h.includes("valor") ||
      h.includes("total") ||
      h.includes("venta")
  );
  const dateIdx = lowercaseHeaders.findIndex(
    (h) => h.includes("date") || h.includes("fecha") || h.includes("dia") || h.includes("día")
  );
  const payIdx = lowercaseHeaders.findIndex(
    (h) =>
      h.includes("payment") ||
      h.includes("pago") ||
      h.includes("método") ||
      h.includes("metodo") ||
      h.includes("tipo")
  );

  const keyOrder = orderIdx !== -1 ? headers[orderIdx] : "";
  const keyProduct = productIdx !== -1 ? headers[productIdx] : "";
  const keyPrice = priceIdx !== -1 ? headers[priceIdx] : "";
  const keyDate = dateIdx !== -1 ? headers[dateIdx] : "";
  const keyPay = payIdx !== -1 ? headers[payIdx] : "";

  return rows.map((row, idx) => {
    const orderNumber = keyOrder && row[keyOrder] ? String(row[keyOrder]) : `ORD-${1000 + idx}`;
    const product = keyProduct && row[keyProduct] ? String(row[keyProduct]) : "Producto General";
    
    let price = 0;
    if (keyPrice && row[keyPrice] !== undefined) {
      const pVal = row[keyPrice];
      price = typeof pVal === "number" ? pVal : parseFloat(String(pVal).replace(/[^0-9.-]/g, "")) || 0;
    }

    // Parse date if possible, otherwise use today
    let date = keyDate && row[keyDate] ? String(row[keyDate]) : new Date().toISOString().split("T")[0];
    // Check if format is DD/MM/YYYY and convert to YYYY-MM-DD
    if (date.includes("/") && date.split("/").length === 3) {
      const parts = date.split("/");
      if (parts[2].length === 4) {
        date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }

    const paymentMethod = keyPay && row[keyPay] ? String(row[keyPay]) : "Efectivo";

    return {
      id: row.id,
      orderNumber,
      product,
      price,
      date,
      paymentMethod,
    } as unknown as Sale;
  });
}

/**
 * Parser for Excel (.xlsx) arrayBuffer content.
 */
export function parseExcel(arrayBuffer: ArrayBuffer): ParsedResult {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  if (workbook.SheetNames.length === 0) {
    throw new Error("El archivo Excel no contiene hojas de trabajo.");
  }
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get array of arrays (header: 1)
  const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  if (sheetData.length === 0) {
    throw new Error("La primera hoja de trabajo del archivo Excel está vacía.");
  }

  // Filter out completely empty rows in sheetData
  const validRows = sheetData.filter((row) => row && row.length > 0 && row.some((cell) => cell !== undefined && cell !== null && cell !== ""));
  if (validRows.length === 0) {
    throw new Error("No se encontraron filas con datos válidos en el archivo Excel.");
  }

  const rawHeaders = validRows[0].map((h) => h !== undefined && h !== null ? String(h).trim() : "");
  const originalHeaders = rawHeaders.filter(Boolean);
  
  if (originalHeaders.length === 0) {
    throw new Error("No se pudieron extraer cabeceras válidas del archivo Excel.");
  }

  const headers = originalHeaders.map((h, idx) => normalizeHeader(h, idx));

  const rows: GenericRow[] = [];
  for (let i = 1; i < validRows.length; i++) {
    const rowData = validRows[i];
    
    const row: GenericRow = {
      id: `xlsx-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
    };

    originalHeaders.forEach((origHeader, origIdx) => {
      const rawIdx = rawHeaders.indexOf(origHeader);
      const rawVal = rawIdx !== -1 && rowData[rawIdx] !== undefined && rowData[rawIdx] !== null ? rowData[rawIdx] : "";
      
      const key = headers[origIdx];

      if (typeof rawVal === "number") {
        row[key] = rawVal;
      } else {
        const strVal = String(rawVal).trim();
        const cleanNumStr = strVal.replace(/[^0-9.-]/g, "");
        const isPercentage = strVal.includes("%");
        const num = parseFloat(cleanNumStr);

        if (
          strVal !== "" &&
          !isNaN(num) &&
          /^[$-]?[0-9,]+(?:\.[0-9]+)?%?$/.test(strVal.replace(/\s/g, ""))
        ) {
          row[key] = isPercentage ? num / 100 : num;
        } else {
          row[key] = strVal;
        }
      }
    });

    rows.push(row);
  }

  const isSales = detectIsSalesSchema(originalHeaders, headers);

  return {
    type: isSales ? "sales" : "generic",
    headers,
    originalHeaders,
    rows: isSales ? mapToSalesSchema(headers, originalHeaders, rows) : rows,
  };
}
