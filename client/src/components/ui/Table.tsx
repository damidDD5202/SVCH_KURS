import type { ReactNode } from "react";
import "./Table.css";

export type TableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
};

export function Table<T>({ columns, rows, rowKey, emptyMessage = "Нет данных" }: Props<T>) {
  if (rows.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }
  return (
    <div className="tableWrap">
      <table className="dataTable">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
