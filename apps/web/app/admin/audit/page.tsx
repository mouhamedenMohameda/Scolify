"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import { Label } from "@school-admin/ui";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action) params.append("action", filters.action);
      if (filters.resourceType) params.append("resourceType", filters.resourceType);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const res = await apiGet<{ data: any[]; pagination: any }>(
        `/audit-logs?${params.toString()}`
      );

      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "user",
      label: "Utilisateur",
      render: (record: any) =>
        record.user
          ? `${record.user.firstName} ${record.user.lastName}`
          : "Système",
    },
    {
      key: "action",
      label: "Action",
      render: (record: any) => (
        <span className="font-mono text-sm">{record.action}</span>
      ),
    },
    {
      key: "resourceType",
      label: "Type ressource",
      render: (record: any) => record.resourceType,
    },
    {
      key: "resourceId",
      label: "ID ressource",
      render: (record: any) => (
        <span className="font-mono text-xs">{record.resourceId || "-"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (record: any) => formatDate(record.createdAt),
    },
    {
      key: "ipAddress",
      label: "IP",
      render: (record: any) => record.ipAddress || "-",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Traçabilité des actions dans le système
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                placeholder="Ex: grade:update"
              />
            </div>
            <div>
              <Label htmlFor="resourceType">Type ressource</Label>
              <Input
                id="resourceType"
                value={filters.resourceType}
                onChange={(e) =>
                  setFilters({ ...filters, resourceType: e.target.value })
                }
                placeholder="Ex: grade"
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">Date début</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date fin</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Journal d'audit</CardTitle>
          <CardDescription>
            Historique des actions effectuées dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable columns={columns} data={logs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
