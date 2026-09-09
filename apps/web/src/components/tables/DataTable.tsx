import type { ReactNode } from 'react';

interface DataTableProps {
  headers: string[];
  rows: Array<{ id: string; cells: ReactNode[] }>;
}

export function DataTable({ headers, rows }: DataTableProps) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={`${row.id}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
