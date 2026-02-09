"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@school-admin/ui";
import { Button } from "@school-admin/ui";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pagination,
  onPageChange,
  loading = false,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Aucune donnée</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => {
                  const value = row[column.key as keyof T];
                  return (
                    <TableCell key={String(column.key)}>
                      {column.render ? column.render(value, row) : String(value ?? "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultats)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
