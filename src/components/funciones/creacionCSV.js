import * as XLSX from "xlsx";

export function descargarExcel(datos) {

  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "contratos");

  XLSX.writeFile(workbook, "contratos.xlsx");
}