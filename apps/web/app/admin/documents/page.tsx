"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { DataTable } from "@/components/data-table";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@school-admin/ui";
import { Label, Select } from "@school-admin/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDocumentSchema, createDocumentTemplateSchema, generateDocumentSchema, type CreateDocumentInput, type CreateDocumentTemplateInput } from "@school-admin/shared";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"documents" | "templates">("documents");

  const documentForm = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
  });

  const templateForm = useForm<CreateDocumentTemplateInput>({
    resolver: zodResolver(createDocumentTemplateSchema),
  });

  const generateForm = useForm<{ templateId: string; studentId?: string }>({
    resolver: zodResolver(generateDocumentSchema),
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "documents") {
        const res = await apiGet<{ data: any[]; pagination: any }>("/documents");
        if (res.success && res.data) {
          setDocuments(res.data);
        }
      } else {
        const res = await apiGet<{ data: any[]; pagination: any }>("/documents/templates");
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      }

      // Fetch students for document creation
      const studentsRes = await apiGet<{ students: any[] }>("/students");
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (data: CreateDocumentInput) => {
    try {
      const response = await apiPost("/documents", data);
      if (response.success) {
        setDocumentDialogOpen(false);
        documentForm.reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating document:", error);
      alert("Erreur lors de la création du document");
    }
  };

  const handleCreateTemplate = async (data: CreateDocumentTemplateInput) => {
    try {
      const response = await apiPost("/documents/templates", data);
      if (response.success) {
        setTemplateDialogOpen(false);
        templateForm.reset();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Erreur lors de la création du template");
    }
  };

  const handleGenerateDocument = async (data: { templateId: string; studentId?: string }) => {
    try {
      const response = await apiPost("/documents/templates/generate", data);
      if (response.success) {
        // In real app, download PDF or show preview
        alert("Document généré avec succès");
        setGenerateDialogOpen(false);
        generateForm.reset();
      }
    } catch (error) {
      console.error("Error generating document:", error);
      alert("Erreur lors de la génération du document");
    }
  };

  const handleDelete = async (id: string, type: "document" | "template") => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${type === "document" ? "document" : "template"} ?`)) {
      return;
    }

    try {
      const endpoint = type === "document" ? `/documents/${id}` : `/documents/templates/${id}`;
      const response = await apiDelete(endpoint);
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleExport = async (type: "students" | "grades" | "attendance", format: "CSV" | "EXCEL") => {
    try {
      const response = await fetch(`/api/exports/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ format }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.headers.get("Content-Disposition")?.split("filename=")[1] || `export.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Erreur lors de l'export");
    }
  };

  const documentColumns = [
    {
      key: "name",
      label: "Nom",
      render: (record: any) => record.name,
    },
    {
      key: "type",
      label: "Type",
      render: (record: any) => {
        const typeMap: Record<string, string> = {
          CERTIFICATE: "Certificat",
          TRANSCRIPT: "Relevé",
          ATTESTATION: "Attestation",
          OTHER: "Autre",
        };
        return typeMap[record.type] || record.type;
      },
    },
    {
      key: "student",
      label: "Élève",
      render: (record: any) =>
        record.student
          ? `${record.student.firstName} ${record.student.lastName}`
          : "-",
    },
    {
      key: "fileName",
      label: "Fichier",
      render: (record: any) => (
        <a
          href={record.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {record.fileName}
        </a>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (record: any) => formatDate(record.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDelete(record.id, "document")}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  const templateColumns = [
    {
      key: "name",
      label: "Nom",
      render: (record: any) => record.name,
    },
    {
      key: "type",
      label: "Type",
      render: (record: any) => {
        const typeMap: Record<string, string> = {
          CERTIFICATE: "Certificat",
          ATTESTATION: "Attestation",
          OTHER: "Autre",
        };
        return typeMap[record.type] || record.type;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              generateForm.setValue("templateId", record.id);
              setGenerateDialogOpen(true);
            }}
          >
            Générer
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(record.id, "template")}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents & Exports</h1>
          <p className="text-muted-foreground">
            Gestion des documents et exports de données
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "documents" | "templates")}
          >
            <option value="documents">Documents</option>
            <option value="templates">Templates</option>
          </Select>
          {activeTab === "documents" ? (
            <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nouveau document</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un document</DialogTitle>
                </DialogHeader>
                <form onSubmit={documentForm.handleSubmit(handleCreateDocument)}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom</Label>
                      <Input {...documentForm.register("name")} />
                      {documentForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">
                          {documentForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select {...documentForm.register("type")}>
                        <option value="CERTIFICATE">Certificat</option>
                        <option value="TRANSCRIPT">Relevé</option>
                        <option value="ATTESTATION">Attestation</option>
                        <option value="OTHER">Autre</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="studentId">Élève (optionnel)</Label>
                      <Select {...documentForm.register("studentId")}>
                        <option value="">Aucun</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fileUrl">URL du fichier</Label>
                      <Input {...documentForm.register("fileUrl")} />
                    </div>
                    <div>
                      <Label htmlFor="fileName">Nom du fichier</Label>
                      <Input {...documentForm.register("fileName")} />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDocumentDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">Créer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nouveau template</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un template</DialogTitle>
                </DialogHeader>
                <form onSubmit={templateForm.handleSubmit(handleCreateTemplate)}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom</Label>
                      <Input {...templateForm.register("name")} />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select {...templateForm.register("type")}>
                        <option value="CERTIFICATE">Certificat</option>
                        <option value="ATTESTATION">Attestation</option>
                        <option value="OTHER">Autre</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content">Contenu HTML (variables: {"{{variableName}}"})</Label>
                      <textarea
                        {...templateForm.register("content")}
                        className="w-full min-h-[300px] p-2 border rounded font-mono text-sm"
                        placeholder='<html><body><h1>Certificat de scolarité</h1><p>Élève: {{firstName}} {{lastName}}</p><p>Date: {{date}}</p></body></html>'
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTemplateDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">Créer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Exports Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exports</CardTitle>
          <CardDescription>Exporter les données en Excel ou CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Élèves</Label>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => handleExport("students", "EXCEL")}>
                  Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport("students", "CSV")}>
                  CSV
                </Button>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => handleExport("grades", "EXCEL")}>
                  Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport("grades", "CSV")}>
                  CSV
                </Button>
              </div>
            </div>
            <div>
              <Label>Présences</Label>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => handleExport("attendance", "EXCEL")}>
                  Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport("attendance", "CSV")}>
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents or Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "documents" ? "Liste des documents" : "Liste des templates"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <DataTable
              columns={activeTab === "documents" ? documentColumns : templateColumns}
              data={activeTab === "documents" ? documents : templates}
            />
          )}
        </CardContent>
      </Card>

      {/* Generate Document Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer un document</DialogTitle>
          </DialogHeader>
          <form onSubmit={generateForm.handleSubmit(handleGenerateDocument)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentId">Élève (optionnel)</Label>
                <Select {...generateForm.register("studentId")}>
                  <option value="">Aucun</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGenerateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Générer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
